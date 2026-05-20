document.addEventListener("DOMContentLoaded", async () => {
    const rows = await loadSession(); //Vi skal vente på at rows er defineret, så kalder vi det andet ved load af siden.
    updateArtistTitle(rows);
    updatePlayingTime(rows);
    updateTrackListing(rows);
});
const params = new URLSearchParams(window.location.search); //Her læser vi session id fra url
const sessionId = params.get("session");
const queueid = document.getElementById("queueid"); //vi bruger det også til at skrive ID
queueid.textContent = `'Q' ID: ${sessionId}`;

async function loadSession() {
    try{
    const response = await fetch (`/api/getCurrentStatus?session_id=${sessionId}`); //sessionID er defineret overfor.
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

    const timestamp = rows.starttime //timestamp vi får fra SQL, dvs. hvornår serveren siger sangen er startet.
    const starttime = new Date(timestamp).getTime() + 7200000; //Start time omdefineres til millisekunder, da rows giver os dato osv. med.
    //Her er quickfix for at fixe UTC tidszone. Mere forklaret i server.js.

    let serveroffset = 0 //offset definere
    serveroffset = rows.servertime - Date.now(); // Vi tjekker forskel fra persons computer til serverens computer. Ikke 100% sikkert, da en user stadig under sangen kan ændre sin klokke(!)

    /* Eksempel:
    Min computer siger klokken er 13:26, men serveren siger 13:25.
    Så vil vi få et offset der hedder -1 minut. (60000ms)
    Senere ændrer vi så at vi siger så at computeren skal se tiden som hvad den tror tiden er, plus serveroffset.
    Altså:
    13:25 + (-1)
    */

        function updateProgress() { //funtkion til at opdatere progress

        const realtime = Date.now() + serveroffset;
        const elapsed = realtime - starttime; //Vi går ud fra vi kan regne med den lokale brugers tid. Måske ikke det klogeste.
        const progress = elapsed / tracklength; //quick maffs
        elem.style.width = (progress * 100) + "%"; //opdatere timebar med progress. da progress er i decimal, skal vi gange med 100 for at få procent.

        if (progress < 1) {
    //Hvis sangen ikke er færdig opdatere vi progress.
            requestAnimationFrame(updateProgress);
    //console.log("progress:", progress); //debug, spammer konsol
        } else {
            loadSession(); //når tracken er færdig vil serveren spille en ny sang, så den fanger vi bare.
            updateTrackListing(); //vi får også en ny track listing.
            console.log("track done"); 
        }
    }
  updateProgress(); //starter funktionen
}

function updateTrackListing(rows) {
  // Making "container" into the Element "leftBotoomRIghtDiv"
  const container = document.getElementById("leftBottomRightDiv");

    //tracks = noget sql fetch

    // goes through all specific table songs (song1, song2, ...) based on the loop index
    const table = document.getElementById(`song${songNum}`);

    const cells = table.querySelectorAll("td"); //vi har 2 celler i hver sang, en til titel og en til artist, så vi selecter begge celler

    // Selects the two cells inside the table
    if (cells.length >= 2) {
      cells[0].textContent = track.title;
      cells[1].textContent = track.artist_name;
    }
}