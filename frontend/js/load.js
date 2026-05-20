document.addEventListener("DOMContentLoaded", async () => {
    const rows = await loadSession(); //Vi skal vente på at rows er defineret, så kalder vi det andet ved load af siden.
    updateArtistTitle(rows);
    updatePlayingTime(rows);
});

async function loadSession() {
    try{
    const params = new URLSearchParams(window.location.search);
    const session_id = params.get("session"); //få session id ud af query parameteren... Samme kode som lige overfor ved leave button.
    const response = await fetch (`/api/getCurrentStatus?session_id=${session_id}`); //samme funktion som progress har. vi laver altså en ny tracks side for hver session _id. 
    const rows = await response.json(); //få responsens fra backend
    console.log(rows); //tjek, at brugeren får det rigtige


    return rows; //vi returner rows.
    /*
    Dette giver os mulighed for at benytte rows andre steder i koden; dvs. vi får kun data ind i loadSession()
    Derefter kan vi loade rows ind i andre funktioner, og benytte den der. Det giver os muligheder for ikke at have
    en enkelt 400 linjer lang funktion.
    */

    } catch(err) {
    console.log(err);
    }
}

function updateArtistTitle(rows) {
    const title = document.getElementById("tracktitle") //DOM på track element titel
    title.textContent = rows.songtitle;

    const artist = document.getElementById("artistname")
    artist.textContent = rows.artist;
    
}

function updatePlayingTime(rows) {
    const elem = document.getElementById("timeBar");
    elem.style.width = "0%"; //Vi starter fra ny - så vi skal reset timebar

    const tracklength = rows.duration * 1000;
//vores duration er givet i sekunder i .csv, så vi skal lige gange med 1000 da JS kører i millisekunder.

    const timestamp = rows.starttime //timestamp får vi fra sql
    const starttime = new Date(timestamp).getTime() + 7200000; //7 mil plus for quickfix med 2 timers forskydning i DB. Ikke ligefrem skalerbart.

    console.log("times: start, length", starttime, tracklength) //debug

    
        function updateProgress() { //funtkion til at opdatere progress

        const elapsed = Date.now() - starttime; //Vi går ud fra vi kan regne med den lokale brugers tid. Måske ikke det klogeste.
        const progress = elapsed / tracklength; //quick maffs
        elem.style.width = (progress * 100) + "%"; //opdatere timebar med progress. da progress er i decimal, skal vi gange med 100 for at få procent.

        if (progress < 1) {
    //Hvis sangen ikke er færdig opdatere vi progress.
            requestAnimationFrame(updateProgress);
    //console.log("progress:", progress); //debug, spammer konsol
        } else {
            //do something
            console.log("track done"); 
        }
    }
  updateProgress(); //starter funktionen
}