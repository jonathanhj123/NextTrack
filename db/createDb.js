import { connect } from "./connect.js";
import pg from "pg";
import upload from "pg-upload";

const db = await connect();
const timestamp = (await db.query("select now() as timestamp")).rows[0][
  "timestamp"
];
console.log(`Recreating database on ${timestamp}...`);

// Drop alle gamle tables ved opstart
//await db.query("drop schema public cascade");
//await db.query("create schema public");
//await db.query("drop table if exists users");
await db.query("drop table if exists users");
await db.query("drop table if exists session_tracks");
await db.query("drop table if exists session");
await db.query("drop table if exists tracks");

//TODO sessions

// Lav users table
await db.query(`
    create table users (
        user_id serial primary key,
        username text not null,
        email text unique,
        age integer not null,
        gender integer not null,
        country text not null,
        password text not null,
        session_id integer
    )
`);
//TODO sessions

// Lav tracks table
await db.query(`
    create table tracks (
        track_id integer primary key,
        artist_name text,
        title text,
        length integer not null,
        genre text not null
    )
`);

// Lav session table
await db.query(`
    create table session (
        session_id integer primary key)
`);

// Lav session_tracks table
await db.query(`
    create table session_tracks (
        session_id integer references session(session_id),
        track_id integer references tracks(track_id),
        primary key (session_id, track_id)
        )
    `);

//Nu skal vi importere data

//tracks
await upload(
  db,
  "db/tracks.csv",
  `
    copy tracks (track_id, title, length, artist_name, genre)
    from stdin
    with csv header encoding 'utf-8'
`,
);
//users TODO sessions
await upload(
  db,
  "db/users.csv",
  `
    copy users (user_id, username, email, age, gender, country, password, session_id)
    from stdin
    with csv header encoding 'utf-8'
`,
);

await db.end();
console.log("Database successfully recreated.");
