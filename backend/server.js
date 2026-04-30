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
server.get("/api/checkIfUserExists/:username", checkIfUserExists);
server.post("/api/checkPassword", checkPassword);

function onServerReady() {
  console.log("Jukebox server running on port", port);
}

function onEachRequest(request, response, next) {
  console.log(new Date(), request.method, request.url);
  next();
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
