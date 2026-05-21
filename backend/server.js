/*  
  The HTTP Server (Express)
  server.js makes the express routes (like "/api/register")
  It links the routes to functions (like rigisterUser)
*/

// Importing express (The HTTP Server)
import express, { response } from "express";

// Imports the pool from connect.js
import { pool } from "../db/connect.js";

// Imports the request file from express
import req from "express/lib/request.js";

import { checkSessions, advanceSession } from "./CA.js"
setInterval(checkSessions, 3000); //Importere check/advance sessionen ved startup. Mindre clutter!

//Meget hacky fix. Kortere check vil betyde, at vi kan risikere at vi advancer session imens den allerde er igang.
//Så får vi noget bøvl med at vi kan tilføje en sang der allerede er på køen, ogås crasher vi.

// the pool() function from connect.js assigns it to the variable "db"
const db = pool();

// The Server uses port 3010
const port = 3010;

// express gets assigned to the variable "server"
const server = express();

// This makes the server use the HTML/CSS/JavaScript (from frontend folder)
server.use(express.static("frontend"));

// This makes the server use the pictures and images (from images folder)
server.use(express.static("images"));

// This converts raw text into a JavaScript object, in order to access it via request.body
server.use(express.json());

// This makes the server run the "onEachRequest" function
server.use(onEachRequest);

// Starts the server and tells it to use port 3010 as well as run the "onServerReady" function
server.listen(port, onServerReady);


//[vores funktioner]
// Checks if user exists
server.get("/api/checkIfUserExists/:username", checkIfUserExists);

// Checks the password
server.post("/api/checkPassword", checkPassword);

// register user endpoint.
server.post("/api/register", registerUser); 

// join session endpoint, tjekker om sessionen findes, og sender succes hvis den gør.
server.get("/session/:session_id", joinSession);

// create session kald
server.post("/api/createSession", createSession);

// get userId endpoint
server.get("/api/getUserId/:username", getUserId);

// leave session endpoint
server.post("/api/leaveSession", leaveSession);


function onEachRequest(request, response, next) {
  //
  console.log(new Date(), request.method, request.url);
  next();
} //logging


//kendt kode fra dataforståelse
server.get("/tracks", loadTracks); //dette giver os mulighed for at fetche noget fra /songs i frontend

async function loadTracks(request, response) {
  //load songs til progress.js.
  const dbResolve = await db.query(`
    select tracks.length, tracks.title, tracks.artist_name
    from tracks
    order by random()
  `);
  const rows = dbResolve.rows;
  if (rows.length === 0) {
    response.sendStatus(404);
  } else {
    response.json(rows);
  }
}

//
async function checkIfUserExists(request, response) {

  const username = request.params.username;

  const dbResult = await db.query(
    `
    Select Exists
    (select username
    from users
    where username = $1)
    `,
    [username],
  );

  response.json(dbResult.rows[0].exists);

}


// Function for getting the userId
async function getUserId(request, response) {

  const username = request.params.username;

  const dbResult = await db.query(
      `
      select user_id from users where username = $1
      `,
    [username],
  );

  response.json(dbResult.rows[0].user_id);
  console.log(response);

}


// Function that checks if the password is correct
async function checkPassword(request, response) {

  try {

    const { username, password } = request.body;

    const dbResult = await db.query(
      `
      select password from users where username = $1
      `,
      [username],
    );

    const match = dbResult.rows[0].password === password;

    //vi sender også user_id tilbage, da det er nødvendigt for at lave sessionen i createSession
    response.json({ match }); 
    console.log(match);

  } catch (err) {

    console.error(err);
    response.status(500).json({ error: err.message });

  }

}


// Function for registing user
async function registerUser(request, response) {

  //debug, tjek lige at funktionen bliver kaldt når vi submitter register formen.
  console.log("Register bliver kaldt"); 
  
  //try / catch som vi har lært om, lidt ala else/if.
  try {

    //data vi får fra register.js
    const { username, password, email, age, country, gender } = request.body; 

    const dbResult = await db.query(
      `
      insert into users 
      (username, email, age, gender, country, password) 
      VALUES ($1, $2, $3, $4, $5, $6)
      `,
      [username, email, age, gender, country, password],
      //user_id er defineret som serial i createdb, og er derfor en sekvens hvor den selv finder en ny
    );

    response.json({ success: true });

  } catch (err) {

    //her tjekker vi for fejl. vil være db relateret, ikke fordi noget eksistere i forvejen, det er seperat

    /*
    Error code 23505 er PostgreSQLs fejl for når man prøver at skrive en værdi i en tabel som er unik og allerede findes.
    Altså er dette vores "tjek for brugernavn allerede eksistere" tjek.
    */
    if (err.code === "23505") {

      response
        .status(500)
        //tjekker jo også for email, da det vil være samme fejl. Man kunne nok godt tjekke det mere præcist....
        .json({ error: "This username/email already exists" });

    } 

    //catch-all for andre fejl.
    else response.status(500).json({ error: err.message });
  }
}


// Function for creating a new session
async function createSession(request, response) {

  try {

    const dbResult = await db.query(
      `
      insert into session_nt
      default values
      returning session_id
      `
    );

    /*
    Vi skal lave en del arbejde når vi laver en kø.
    Vi skal nemlig assigne brugeren der har lavet køen til sessionen
    og vi skal gøre session_tracks klar.

    først laver vi sessionen, og får ID retur.
    vi benytter "default values" i session_nt, da session_id er serial
    */

    const sessionId = dbResult.rows[0].session_id; //få session id retur

    //Nu har vi gemt sessionen i json. Så går vi videre:
    //Vi skal nu tilføje den nye session_id til brugeren der har lavet den
    await db.query(
      `
      update users
      set session_id = $1
      where user_id = $2
      `,
      //vi skal have userId fra frontend, da vi skal vide hvilken bruger der har lavet sessionen
      [sessionId, request.body.userId], 
    );
    console.log("user session update success");

    //Nu har vi tilføjet session id til brugeren, så går vi videre:
    //Sidst men ikke mindst laver vi en tom kø/session tracks
    await db.query(
      `
      insert into session_tracks (session_id, track_id)
      select $1, track_id
      from tracks
    `,
      [sessionId],
    );
    //randomiser tracks inde i session_tracks.

    //vælg en random til at være currently_playing når vi starter en session.

    await db.query(
      `
      update session_tracks
        set currently_playing = true,
        current_started_at = CURRENT_TIMESTAMP

      where (session_id, track_id) = (
        select
        session_id, track_id
        
        from session_tracks
        where session_id = $1
        order by random()
        limit 1
        )
      `,
      [sessionId], //Vi skal vælge en random track inde for X session_id til at være den der afspiller når vi starter en sang.
    );


    response.json({ success: true, sessionId });
  } catch (err) {

    console.log(err);
    response.status(500).json({ error: err.message });

  }

}


server.get("/api/getCurrentStatus", getCurrentStatus); //Her får vi status (noget af det første vi går) når vi loader.
async function getCurrentStatus(request, response) {
  try {
    const sessionId = request.query.session_id; //Query paramateren er session_id.
    const dbResult = await db.query(`
      select t.title as SongTitle, t.artist_name as Artist, st.track_id as TrackId, st.current_started_at as starttime, t.length as duration
      from session_tracks st
      join tracks t on t.track_id = st.track_id
      where session_id = $1
      and currently_playing = true
      `,
      [sessionId], //Hvilken sang afspiller? Og vis den. Send også en masse ting der er relevante hertil nedeunder.
    );
    const row = dbResult.rows[0]; //definere svaret i rows
    const songtitle = row.songtitle; //definere de forskellige svar
    const artist = row.artist;
    const starttime = row.starttime; 
    const duration = row.duration;
    const servertime = Date.now();

    response.json({ songtitle, artist, starttime, duration, servertime });
  } catch (err) {
    console.log("error during getting status:", err);
  }
}

server.get("/api/getTrackListing", getTrackListing);
async function getTrackListing(request, response) { //Funktion til at samle nuværende sange i session_tracks for X session_id til queue listing. Næstne samme kode som overfor
  //spammer...console.log("get listing"); //debug
  
  try {
    const sessionId = request.query.session_id;
    const dbResult = await db.query(`
      select t.title as SongTitle, t.artist_name as Artist, st.track_id as TrackId, count(v.user_id) as votes
        from session_tracks st
        left join votes v using (session_id, track_id)
        join tracks t on t.track_id = st.track_id
      where session_id = $1
        and currently_playing = false

      group by
        t.title, t.artist_name, st.track_id
      `,
      [sessionId],
    );

    response.json(dbResult.rows);

  } catch (err) {
    console.log("error during getting listing", err);
  }
}



// Function for joining a session
async function joinSession(request, response) {
  
  //Fang alle sessions til join.js
  try {

    //params fanger i URL, ligesom vi kender fra andre steder i koden
    const sessionId = request.params.session_id;

    //samme her, men med query parameterne (eksempel?=data)
    const userId = request.query.user_id;

    const dbResult = await db.query(
      `
      select session_id
      from session_nt
      where session_id = $1
      `,
      [sessionId], //vi skal benytte det ID, brugeren skriver ind i join formularen
    );

    //hvis rows er lig nul ved responsen, findes den ikke
    if (dbResult.rows.length === 0) {

      //Fortæl brugeren den ikke findes
      response.status(404).json({ error: "Session not found" });
      
      //send brugeren tilbage til join siden, da sessionen ikke findes
      return; 

      //hvis der er en session, som matcher det indtastede ID, så send den videre til dashboar
    } else if (dbResult.rows.length === 1) {
      
      //Opdater sql med brugeren nu har X session id assigneret.
      await db.query(
        `
        update users
        set session_id = $1
        where user_id = $2
        `,
        [sessionId, userId], 
      );

      response.json({ success: true }); 
      console.log("user session update success");
    }

  } catch (err) {

    //skriv fejl hvis en findes
    response.status(500).json({ error: "Something went wrong" }); 

  }

}


// function that makes the user leave the session
async function leaveSession(request, response) {

  try {
    const dbResult = await db.query(`
      update users
      set session_id = null
      where user_id = $1
    `,
    [request.body.user_id]
    );

    // Error if user couldn't be found
    if (dbResult.rowCount === 0) {

      console.log("Couldn't find user to leave session");
      return response.status(404).json({error: "User not found"});
    }

    response.json({succes: true});

  } catch(err) {
    response.status(500).json({ error: "Something went wrong - Couldn't leave Session"});
  }

}


function onServerReady() {

  console.log("Populii server running on port", port);

}



//tak til chat for debug
server.post("/api/debugSkip", debugSkip);
async function debugSkip(
    request,
    response
) {

    try {

        const sessionId =
            request.body.session_id;

        await advanceSession(
            sessionId
        );

        response.json({
            success: true
        });

        console.log(
            "debug skipped:",
            sessionId
        );

    } catch(err) {

        console.log(
            "debug skip error:",
            err
        );

        response.status(500).json({
            error: err.message
        });
    }
}