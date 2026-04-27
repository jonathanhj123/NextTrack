import express, { response } from "express";
import { pool } from "../db/connect.js";
import req from "express/lib/request.js";

const db = pool();

const port = 3010;
const server = express();
server.use(express.static("frontend"));
server.use(onEachRequest);
server.listen(port, onServerReady);

function onServerReady() {
  console.log("Jukebox server running on port", port);
}

function onEachRequest(request, response, next) {
  console.log(new Date(), request.method, request.url);
  next();
}
