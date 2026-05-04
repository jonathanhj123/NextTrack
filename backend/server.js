import express, { response } from "express";
import { pool } from "../db/connect.js";
import req from "express/lib/request.js";

const db = pool();
const port = 3010;
const server = express();
server.use(express.static("frontend"));
server.use(express.json());
server.use(onEachRequest);
server.listen(port, onServerReady);
//vores funktioner
server.get("/api/checkIfUserExists/:username", checkIfUserExists);
server.post("/api/checkPassword", checkPassword);
server.post("/api/register", registerUser); //register user endpoint.


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
      response.status(500).json({error: "This username/email already exists"})
    }
    else //catch-all for andre fejl.
      response.status(500).json({ error: err.message });
  }
}

function onServerReady() {
  console.log("Populii server running on port", port);
}

