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

function onEachRequest(request, response, next) {
  console.log(new Date(), request.method, request.url);
  next();
} //logging

server.get("/api/checkIfUserExists/:username", checkIfUserExists);
server.post("/api/checkPassword", checkPassword);

//kendt kode fra dataforståelse
server.get("/tracks", loadTracks); //dette giver os mulighed for at fetche noget fra /songs i frontend
async function loadTracks(request, response) { //load songs til progress.js.
  const dbResolve = await db.query(`
    select tracks.length, tracks.title, tracks.artist_name
    from tracks
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



function onServerReady() {
  console.log("Populii server running on port", port);
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
