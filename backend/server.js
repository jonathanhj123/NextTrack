import express, { response } from "express";
import { pool } from "../db/connect.js";
import req from "express/lib/request.js";

const db = pool();
const port = 3010;
const server = express();
server.use(express.static("frontend"));
server.use(express.static("images"));
server.use(express.json());
server.use(onEachRequest);
server.listen(port, onServerReady);
//vores funktioner
server.get("/api/checkIfUserExists/:username", checkIfUserExists);
server.post("/api/checkPassword", checkPassword);
server.post("/api/register", registerUser); //register user endpoint.
server.get("/session/:session_id", joinSession); //join session endpoint, tjekker om sessionen findes, og sender succes hvis den gør.
server.post("/api/createSession", createSession); //create session kald


function onEachRequest(request, response, next) {
  console.log(new Date(), request.method, request.url);
  next();
} //logging

//kendt kode fra dataforståelse
server.get("/tracks", loadTracks); //dette giver os mulighed for at fetche noget fra /songs i frontend
async function loadTracks(request, response) { //load songs til progress.js.
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

async function checkIfUserExists(request, response) {
  const username = request.params.username;

  const dbResult = await db.query(
    `
    Select Exists
    (select username
    from users
    where username = $1)`,
    [username],
  );
  response.json(dbResult.rows[0].exists);
}

async function checkPassword(request, response) {
  try {
    const { username, password } = request.body;
    const dbResult = await db.query(
      "SELECT password FROM users WHERE username = $1",
      [username],
    );
    const match = dbResult.rows[0].password === password;
    response.json({ match });
  } catch (err) {
    console.error(err);
    response.status(500).json({ error: err.message });
  }
}

async function registerUser(request, response) {
  console.log("Register bliver kaldt") //debug, tjek lige at funktionen bliver kaldt når vi submitter register formen.
  try { //try / catch som vi har lært om, lidt ala else/if.
    const { username, password, email, age, country, gender } = request.body; //data vi får fra register.js
    
    const dbResult = await db.query(`

      insert into users 
      (username, email, age, gender, country, password) 
      VALUES ($1, $2, $3, $4, $5, $6)`,

      [username, email, age, gender, country, password]
      //user_id er defineret som serial i createdb, og er derfor en sekvens hvor den selv finder en ny
    );
    response.json({ success: true });
  } catch (err) { //her tjekker vi for fejl. vil være db relateret, ikke fordi noget eksistere i forvejen, det er seperat

    /*
    Error code 23505 er PostgreSQLs fejl for når man prøver at skrive en værdi i en tabel som er unik og allerede findes.
    Altså er dette vores "tjek for brugernavn allerede eksistere" tjek.
    */
    if (err.code === "23505") {
      response.status(500).json({error: "This username/email already exists"}) //tjekker jo også for email, da det vil være samme fejl. Man kunne nok godt tjekke det mere præcist....
    }
    else //catch-all for andre fejl.
      response.status(500).json({ error: err.message });
  }
}

async function createSession(request, response) {
  try {
    const dbResult = await db.query(`
      insert into session_nt
      default values
      returning session_id
    `);
/*
Vi skal lave en del arbejde når vi laver en kø.
Vi skal nemlig assigne brugeren der har lavet køen til sessionen
og vi skal gøre session_tracks klar.

først laver vi sessionen, og får ID retur.
vi benytter "default values" i session_nt, da session_id er serial
*/
    const sessionId = dbResult.rows[0].session_id; //få session id retur
/*
    //Nu har vi gemt sessionen i json. Så går vi videre:
//Vi skal nu tilføje den nye session_id til brugeren der har lavet den
    await db.query(`
      update users
      set session_id = $1
      where user_id = $2
    `, [sessionId, request.body.userId] //vi skal have userId fra frontend, da vi skal vide hvilken bruger der har lavet sessionen
    );
    */


//Nu har vi tilføjet session id til brugeren, så går vi videre:
//Sidst men ikke mindst laver vi en tom kø/session tracks
    await db.query(`
      insert into session_tracks (session_id, track_id, fallback_order)
      select $1, track_id, row_number() over (order by track_id)
      from tracks
    `, [sessionId]
    );
    //todo forstå sql her

    response.json({ success: true, sessionId });

  } catch (err) {
    console.log(err);
    response.status(500).json({ error: error.message });
  }
}

async function joinSession(request, response) { //Fang alle sessions til join.js
  try {
    const dbResult = await db.query(`
      select session_id
      from session_nt
      where session_id = $1
    `, 
    [request.params.session_id] //vi skal benytte det ID, brugeren skriver ind i join formularen
    );

    if (dbResult.rows.length === 0) { //hvis rows er lig nul ved responsen, findes den ikke
      response.status(404).json({ error: "Session not found" }); //Fortæl brugeren den ikke findes
      return; //send brugeren tilbage til join siden, da sessionen ikke findes
    }

    else if (dbResult.rows.length === 1) { //hvis der er en session, som matcher det indtastede ID, så send den videre til dashboard
      response.json({ success: true });
    } 

  } catch (err) {
    response.status(500).json({ error: "Something went wrong"}); //skriv fejl hvis en findes
  }
}

function onServerReady() {
  console.log("Populii server running on port", port);
}

