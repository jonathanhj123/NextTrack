import { connect } from "./connect.js";
import pg from "pg";
import upload from "pg-upload";

const db = await connect();
const timestamp = (await db.query("select now() as timestamp")).rows[0][
  "timestamp"
];
console.log(`Recreating database on ${timestamp}...`);

// Drop alle gamle tables ved opstart
await db.query("drop schema public cascade");
await db.query("create schema public"); //JEG ELSKER SCHEMA!! FUCK JER
//await db.query("drop table if exists users");
//await db.query("drop table if exists users");
//await db.query("drop table if exists session_tracks");
//await db.query("drop table if exists session_nt"); //Session kan vi bare blive ved med at lave, så giver ingen grund til at droppe den.
//await db.query("drop table if exists tracks");
/*
Vi har alle pt. data i vores SQL. Giver ingen mening at køre det her,
eller generelt createdb, konstant.
Gør det lokalt.
*/

//TODO sessions

// Lav users table
await db.query(`
    create table users (
        user_id serial primary key,
        username text unique not null,
        email text unique not null,
        age integer not null,
        gender text not null,
        country text not null,
        password text not null,
        session_id integer
    )
`);



//VI laver id, email unik. Det er vigtigt vi arbejder med den information i server.js / register.js.

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

// Lav session table. Session nt da session læses som noet generelt i sql
await db.query(`
    create table session_nt (
        session_id integer primary key)
`);

// Lav session_tracks table (hvor vores kø ligger)
await db.query(`
    create table session_tracks (
        session_track_id serial primary key,
        session_id integer references session_nt(session_id),
        track_id integer references tracks(track_id),
        vote_count integer default 0,
        fallback_order integer not null,
        currently_playing boolean default false
        )
    `);
/*
Default 0 = starter ved nul. Dvs i stedet for vi får et NULL felt (tomt) vil der stå 0.
*/

//votes
await db.query(`
    create table votes (
        vote_id serial primary key,
        user_id integer references users(user_id),
        session_track_id integer references session_tracks(session_track_id)
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
//Gør serial klar, så vi kan tilføje nye.
await db.query(`
SELECT setval('users_user_id_seq', (SELECT MAX(user_id) FROM users)); 
`);
/*
Dette kode gør sådan at user_id sekvensen, som laver nye brugere, automatisk starter fra det sted vi er nået til i databasen.
Gør vi ikke dette, vil vi få en fejl, da vi selv tilføjer IDer i en "serial" når vi importere vores data, dvs. POSTGRE tror vi er på id 0, men vi er reelt på antal brugere.
*/

await db.end();
console.log("Database successfully recreated.");
