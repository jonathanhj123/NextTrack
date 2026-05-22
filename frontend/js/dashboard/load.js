
document.addEventListener("DOMContentLoaded", async () => {
    const rows = await loadSession(); //Vi skal vente på at rows er defineret, så kalder vi det andet ved load af siden.
    await updateTrackListing();
    updateArtistTitle(rows);
    updatePlayingTime(rows);
    setInterval(updateTrackListing, 2000); 

    await coverArt();
    const artistId = window.artistMap[rows.artist.toLowerCase().trim()];
    updateImage(artistId);
    /*
    Kyndig hjælp fra chatten, til at få coverArt til at fitte ind i load.js, så vi ikke konstant poller og derved bruger tonsvis af tokens
    inde i coverArt.js.
    Men kort sagt:
    Vi får artistnavn fra rows.artist, gør det lowercase og fjerner evt. mellemrum, så det matcher de nøgler vi har i artistMap.
    Så slår vi artistId op via artistmap.
    */
});
/*
I toppen her beder vi browseren om at gøre en masser når HTML er loadet.
Vi skal først definere rows, som er den data vi får om alt muligt spændende i.fht hvad der bliver afspillet, og hvad der skal listes.
Vi definere det her, så kan vi nemlig arbejde med det alle mulige andre steder i dokumentet, uden konstant at definere det.
SÅ skal vi opdatere artist & title, og opdatere playing time.
Hver 2000ms får vi track listen, så vi kan vide, om en bruger har ændret sin vote.
*/
//global definere de her, da vi bruger dem tit, og mange steder.
const params = new URLSearchParams(window.location.search); //Her læser vi session id fra url
const sessionId = params.get("session");
const queueid = document.getElementById("queueid"); //vi bruger det også til at skrive ID
queueid.textContent = `'Q' ID: ${sessionId}`;
const userId = params.get("user_id"); //læser også lige user id fra queue



async function loadSession() { //Det første vi gør, er at definere rows som set overfor. Det er her vi får status fra serveren.
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
    console.log(err); //debug
    }
}

function updateArtistTitle(rows) {
    const title = document.getElementById("tracktitle") //DOM på track element titel
    title.textContent = rows.songtitle;

    const artist = document.getElementById("artistname") //DOM på, you guessed it, artist name.
    artist.textContent = rows.artist;
}

function updatePlayingTime(rows) { //Lidt samme kode som vi havde i queue.js, det kan også ses i kommentarene.
    const elem = document.getElementById("timeBar");
    elem.style.width = "0%"; //Vi starter fra ny - så vi skal reset timebar

    const tracklength = rows.duration * 1000;
//vores duration er givet i sekunder i .csv, så vi skal lige gange med 1000 da JS kører i millisekunder.

    const timestamp = rows.starttime //timestamp vi får fra SQL, dvs. hvornår serveren siger sangen er startet.
    const starttime = new Date(timestamp).getTime(); //start time omdefineres til millisekunder


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
            setTimeout(async () => {
                ResetButtons();
                const rows = await loadSession();
                updateArtistTitle(rows);
                updatePlayingTime(rows);
                updateTrackListing();
                const artistId = window.artistMap[rows.artist.toLowerCase().trim()];
                updateImage(artistId); //klader update af artist imaget

            }, 310);
            //ekstrem hacky måde at sikre brugeren ikke sprøger for tidligt. aldrig gør det her i virkeligheden
            console.log("User go for next track"); 
        }
    }
  updateProgress(); //starter funktionen
}

async function updateTrackListing() { //Her skal vi have fat i listen til højre (altså queue) og dens votes.
    try {
    const response = await fetch (`/api/getTrackListing?session_id=${sessionId}`); //sessionID er defineret overfor.
    const rows = await response.json(); //få responsens fra backend
    //debug, spammer  console.log("for", sessionId,"songs in listing is:", rows); //tjek, at brugeren får det rigtige


        for (let songNum = 0; songNum < rows.length; songNum++) { //Vi skal skrive i alle 8 slots til højre. Smart lille for loop der arbejder ud fra længden af de rows vi får. Skalerbart
            const row = rows[songNum];
            const container = document.getElementById("leftBottomRightDiv"); //DOM på det element der håndtere dem
            const table = document.getElementById(`song${songNum}`);

            if(!table) continue; //hvis table er null(går over 8), skal den bare fortsætte.
            /*
            Dette er også en edge-case fiks, da når vi kører vores advanceSession, er der et kort øjeblik hvor at currently-playing = false er 9 sange.
            Da updateTrackListing kører i interval, kan der være en situation, hvor den opdatere lige præcist i dette øjeblik.
            Det giver en fejl i browseren, men jeg har dog ikke oplevet det ren faktisk kan ses i frontenden ved at give en fejl i listing.
            */

            const cells = table.querySelectorAll("td"); //vi har 2 celler i hver sang, en til titel og en til artist, så vi selecter begge celler

        // Selects the two cells inside the table
            if (cells.length >= 2) {
            cells[0].textContent = row.songtitle;
            cells[1].textContent = row.artist;
            }
            const counter = document.getElementById(songNum);
            counter.textContent = row.votes; //tilføj votes

            const button = document.getElementById(`button${songNum}`);
            button.onclick = () =>
            redArrowIfClicked(button,`${songNum}`,row.trackid); //Her tilføjer vi en specifik track_id til hver vote knap inde i frontend.
        }
    } catch(err) {
        console.log("error during updating listing frontend", err);
    }
}