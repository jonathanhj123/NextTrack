import express, { response } from "express";
import { pool } from "../db/connect.js";
import req from "express/lib/request.js";

const db = pool();

const port = 3010;
const server = express();
server.use(express.static("frontend"));
server.use(onEachRequest);
server.listen(port, onServerReady);

//kendt kode fra dataforståelse
server.get("/tracks", loadTracks); //dette giver os mulighed for at fetche noget fra /songs i frontend
async function loadTracks(request, response) { //load songs til progress.js.
  const dbResolve = await db.query(`
    select tracks.length, tracks.title
    from tracks
  `);
  const rows = dbResolve.rows;
  if (rows.length === 0) {
    response.sendStatus(404);
  } else {
    response.json(rows);
  }
}


function onServerReady() {
  console.log("Populii server running on port", port);
}

function onEachRequest(request, response, next) {
  console.log(new Date(), request.method, request.url);
  next();
}
