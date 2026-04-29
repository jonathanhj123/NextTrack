import { connect } from "./connect.js";
import pg from "pg";
import upload from "pg-upload";

const db = await connect();
const timestamp = (await db.query("select now() as timestamp")).rows[0][
  "timestamp"
];
console.log(`Recreating database on ${timestamp}...`);

// Drop alle gamle tables ved opstart
await db.query("drop table if exists song_artist");
await db.query("drop table if exists tracks");
await db.query("drop table if exists genres");
await db.query("drop table if exists artists");
await db.query("drop table if exists users");

// Lav genres table
await db.query(`
    create table genres (
        genre_id integer primary key,
        name text not null
    )
`);

// Lav artist table
await db.query(`
    create table artists (
        artist_id integer primary key,
        name text
    )
`);

// Lav tracks table
await db.query(`
    create table tracks (
        track_id integer primary key,
        artist_id integer,
        title text,
        length integer not null,
        genre_id integer not null references genres (genre_id)
    )
`);

// Lav song_artist table
await db.query(`
    create table song_artist (
        artist_id integer not null references artists (artist_id),
        track_id integer not null references tracks (track_id)
    )
`);

// Lav users table
await db.query(`
    create table users (
        user_id integer primary key,
        username text not null,
        email text unique,
        age integer not null,
        gender integer not null,
        coinamount integer,
        country_id integer not null,
        password text not null
    )
`);

//countries table
await db.query(`
    create table countries (
        country_id integer primary key, 
        country text
    )
`);

//Nu skal vi importere data
//genres
await upload(
  db,
  "db/genres.csv",
  `
    copy genres (genre_id, name)
    from stdin
    with csv header encoding 'utf-8'
`,
);
//artist
await upload(
  db,
  "db/artists.csv",
    `
    copy artists (artist_id, name)
    from stdin
    with csv header encoding 'utf-8'
`,
);
//tracks
await upload(
  db,
  "db/tracks.csv",
    `
    copy tracks (track_id, artist_id, title, length, genre_id)
    from stdin
    with csv header encoding 'utf-8'
`,
);
//songartist
await upload(
  db,
  "db/song_artist.csv",
    `
    copy song_artist (artist_id, track_id)
    from stdin
    with csv header encoding 'utf-8'
`,
);
//users
await upload(
    db,
    "db/users.csv",
    `
    copy users (user_id, username, email, age, gender, subscriptionlevel, coinamount, country_id, password)
    from stdin
    with csv header encoding 'utf-8'
`,
);

await upload(
    db,
    "db/countries.csv",
    `
    copy countries (country_id, country)
    from stdin
    with csv header encoding 'utf-8'
`,
);


await db.end();
console.log("Database successfully recreated.");
