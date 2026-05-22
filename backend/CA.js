// Importing express (The HTTP Server)
import express, { response } from "express";
// Imports the pool from connect.js
import { pool } from "../db/connect.js";
// Imports the request file from express
import req from "express/lib/request.js";
// the pool() function from connect.js assigns it to the variable "db"
const db = pool();
// The Server uses port 3010
const port = 3010;

const advancingSessions = new Set();
/*
Set holder unikke værdier.
Det vil sige, at vi heri når en session advancer (kode længere nede) holder fast i den værdi.
Så skule checkSessions finde ud af den værdi skal advance - IMENS DEN ER IGANG MED AT ADVANCE - så gør den det ikke.
Dette sikrer imod en edge-case, hvor at databasen er tilpas langsom nok til, at der når at blive kaldet advanceSession to gange på samme tid.
Dette kan betyde, at der kommer 8 nye tracks to gange, hvor en af dem er de samme, som de ikke må, kva. at alle sange skal være unikke i vores tracks list.
*/

export async function checkSessions() { //denne funktion kører i interval (se server.js) og tjekker om der skal skiftes sang i X session.
    const sessions = await db.query(`
        select st.session_id, st.track_id, st.current_started_at, t.length
        from session_tracks st
        join tracks t
        on t.track_id = st.track_id
        where st.currently_playing = true
    `); //Vi skal have fat i alle sange der spiller.
    //console.log(sessions.rows); //debug

    for (const row of sessions.rows) {
        //For hver row i sessions.rows, skal vi....
        const start = new Date(row.current_started_at).getTime();
        //Konverete et timestamp til millisekunder... (samme kode som i load.js/server.js.)
        const duration = row.length * 1000;
        //Konverete sangens længde til millisekunder fra sekunder (samme kode som i load.js linje 55)
        const elapsed = Date.now() - start; //servers nuværende tid minus starttiden er hvor meget der er afspillet.

        //Hvis sangen er færdig, så..
        if (elapsed >= duration) {
            await advanceSession(row.session_id); //kald advanceSession for det sessionId.
        }
    }
}

export async function advanceSession(sessionId) { //få sessionId fra før. Denne bliver kaldt, hvis checkSessions kan se, at man skal have ny sang på.

    if (advancingSessions.has(sessionId)) return; //Hvis denne session allerede er ved at advance, skal vi bare give serveren tid, og ikke kalde det her igen

    advancingSessions.add(sessionId);
    console.log("advancing session", sessionId);

    try {

    await db.query(`
        update session_tracks
        set currently_playing = false
        where session_id = $1
    `, 
    [sessionId]
    ); //gamle currently_palying skal skiftes til false, da den ikke afspiller.

    //Vælg næste sang! Via votes...

    //count(v.user_id)::int as votes
    //betyder vi skal tælle hvor mange user_id har lavet votes på X track og læse det som en integer.
    const nextSong = await db.query(`
        select
            st.track_id,
            count(v.user_id)::int as votes
        from session_tracks st
        left join votes v
            using (session_id, track_id)
        where
            st.session_id = $1
            and st.currently_playing = false
        group by st.track_id
        order by votes desc, random()
        limit 1

    `, [sessionId]);

    //Den skal så sættes til at være currently_playing, og opdatere timestamp så serveren kan arbejde videre med at checke sessions.
    const nextTrackId = nextSong.rows[0].track_id;

    await db.query(`
        update session_tracks
        set
            currently_playing = true,
            current_started_at = CURRENT_TIMESTAMP
        where
            session_id = $1
            and track_id = $2
    `, 
    [sessionId, nextTrackId]
    );
//refresh votes

    await refreshSession(sessionId);
    } finally { //finally er når et promise (hvad en await gør) er blevet fuldført. Altså - vi spørger server - når den "finally" er færdig, gør vi...
        advancingSessions.delete(sessionId); //fjerner sessionid fra vores set.
    }
}

async function refreshSession(sessionId) { //funktion til at refresh sessionen. dvs fjern votes og add nye sange til queue.
    //Hvis man er i tvivl om følgende SQL, har man ikke fulgt med
    await db.query(`
        delete from votes
        where session_id = $1
    `, 
    [sessionId]
    );

    await db.query(`
    delete from session_tracks
    where
    session_id = $1
    and currently_playing = false
    `, 
    [sessionId] //currently_playing false er kun de gamle nu, da det her kører efter vi har talt votes og valgt en ny.
    );

    await db.query(`
    insert into session_tracks (session_id, track_id)
    select $1, track_id
    from tracks

    where track_id not in (
    select track_id
    from session_tracks
    where session_id = $1
    )

    order by random()
    limit 8
    `, 
    [sessionId]
    );
}