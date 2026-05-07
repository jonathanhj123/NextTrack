const params = new URLSearchParams(window.location.search); //Her læser vi session id fra url
const sessionId = params.get("session");
const queueid = document.getElementById("queueid"); //vi bruger det også til at skrive ID
queueid.textContent = `'Q' ID: ${sessionId}`;
//tidligere i dashboard.js

/*
Vote = 8 songs + 8 artists combined - title on top, artist below
Arrow up on the right, grey when not selected, red when selected
Should be selectable, should be deselectable, should make sure that a user can only upvote 1 song, the rest should not be selectable when user has used their upvote
Should display count to the left of the button
JS bool to check if user has upvoted once
*/
console.log("queue.js load") //debug, tjek load

let hasUserVoted = false; //user har ikke voted i starten
let tracksQueue = []; //array for de 8 sange i queue

document.addEventListener('DOMContentLoaded', async () => { //DOM når alt HTML er loadet.
    buildSongQueue(); //calls build of the queue
});

// async function that builds the list of songs
async function buildSongQueue() {
    try{
        // In order to pause execution until the server responds, we use 'await'
        const response = await fetch ("/tracks"); //samme funktion som progress.js har
        const rows = await response.json();
        // Clearing the old data
        tracksQueue.length = 0;

        //Turning the Database data into UI data
        for (let i = 0; i < 9; i++){ //Vi får 9 sange, da vi skal spille en, også have 8 i kø
            let track = rows[i];
            // Pushing the title and artist_name
            tracksQueue.push({
                title: track.title,
                artist_name: track.artist_name,
                length: track.length
            });
        }
        // Renders the songs for the DOM
        renderSongs();

        // Resetting the votes to 0
        resetCounters();

        //play track
        playTrack(0);
    
    } catch (error){
        console.error("Voting Board has failed to load", error);
    }
}

/*
Denne funktions skal vi benytte for at tilføje nye sange når vi går igennem køen. Det sikrer at vi ikke bare spiller det samme igen og igen.
*/
async function addTrackToQueue() {
    const response = await fetch("/tracks"); //vi fetcher fra tracks, som allerede er random
    const rows = await response.json(); //får respons i json

    let track = rows[0];

    tracksQueue.push({ //pusher til tracksQueue tabelen det nye data. Det er det vi bruger i renderSongs.
        title: track.title,
        artist_name: track.artist_name,
        length: track.length
        //votes: 0 //vi skal også have votes i vores sange
    });
}


// Renders the songs for the DOM
async function renderSongs() {
    // Making "container" into the Element "leftBotoomRIghtDiv" 
    const container = document.getElementById("leftBottomRightDiv");

    // Loops through all 8 songs
    for (let i = 0; i < 8; i++) { //vi skal have 8 sange i køen, så vi loop igennem 8 gange
        // "track" representates the selected item from the "tracksQueue" list
        let track = tracksQueue[i + 1]; //vi starter fra i+1, da i=0 er den sang der spiller, og vi skal have de næste 8 sange i køen. Altså sangene i index 1-8.

        // With each loop the next ID gets calculated (song1, song2, song3, ...)
        const songNum = i + 1;

        // goes through all specific table songs (song1, song2, ...) based on the loop index
        const table = document.getElementById(`song${songNum}`);

        const cells = table.querySelectorAll('td'); //vi har 2 celler i hver sang, en til titel og en til artist, så vi selecter begge celler

        // Selects the two cells inside the table
        if(cells.length >= 2) {
            cells[0].textContent = track.title;
            cells[1].textContent = track.artist_name;
        }
    }
}


// Resets the votes to 0
function resetCounters(){
    for (let i = 1; i <= 8; i++) {
        // counter representates the count in the for-loop
        const counter = document.getElementById(`count${i}`);

        // The text content for "counter" resets to 0
        counter.textContent = "0";
    }
}


// Disables all buttons if a voting button has been clicked
function disableAllButtons() {
    // Going through all buttons
    for (let i = 1; i <= 8; i++) {
        const everyButton = document.getElementById(`button${i}`);

        // the everyButton.disabled becomes "true"
        everyButton.disabled = true;

        // The mousecursor is not allowed to click
        everyButton.style.cursor = "not-allowed";
        
    }
}


// Turns the vote Arrow into red and counts one up, if clicked
function redArrowIfClicked(buttonElement, counterId) {
    // Checks if the user has voted
    if (hasUserVoted === true) {
        // It will show an alert
        alert("You can only vote once!");
        return;
    }

    // "counterElem" representates "counterId", which is from the HTML
    const counterElem = document.getElementById(counterId);

    // The currentCount gets the (converted string to integer) text content from "counterElem"/"counterId". If the text content is empty, it will be 0; 
    let currentCount = parseInt(counterElem.textContent) || 0;

    // The currentCount number increases by 1
    currentCount++;

    // The new "currentCount" number becomes the new "textContent" for "counterElem"/"counterId"
    counterElem.textContent = currentCount;

    // turns the backgroundColor to red
    buttonElement.style.backgroundColor = "red";

    // Turns the color of the arrow into white
    buttonElement.style.color = "white";

    // Disables all buttons
    disableAllButtons();

    // Turns the "hasUserVoted" boolean into ture
    hasUserVoted = true;
}

//god skik at definere alt med let, så det ikke bliver globalt
//kode importeret fra gamle progress.js. med ældrninger så det virker med gamle vote.js, ofc.

let currentIndex = 0;
let startTime = null;
let length = 0;

function playTrack(index) { //vi kører playTrack i indexet.
    try {
  console.log("play called"); //debug

  const elem = document.getElementById("timeBar");
  elem.style.width = "0%"; //Vi starter fra ny - så vi skal reset timebar
  let track = tracksQueue[index]

  renderSongs();
/*
Vi skal lige have opdateret sangene i køen, da vi har spillet den første sang, og derfor skal have den næste sang ind i køen.
Ellers opdatere køen ikke, og der vil fks stå Get Lucky i toppen af køen samtidig med Get Lucky spiller.
*/

  length = track.length * 1000; //vores duration er givet i sekunder i .csv, så vi skal lige gange med 1000 da JS kører i millisekunder.
  startTime = performance.now();
/*
performance.now er et kald der i javascript giver et præcist antal millisekunder siden kaldet.
Hvis man brugte noget hvor mange brugte computeresn forståelse af tid kan der være problemer hvis der er performance forskelle mellem siden og computeren.
  */

  //Skriv den track & kunsterne der spiller lige nu (DOM)
  const tracktitle = document.getElementById("tracktitle");
  tracktitle.textContent = track.title;

  const artistname = document.getElementById("artistname");
  artistname.textContent = track.artist_name;

  requestAnimationFrame(updateProgress); //opdatere via requestAnimationFrame (JS funktion)
} catch (error) { //debug
    console.log(error)
  }
}

function updateProgress(now) { //nu definere vi vores updateProgress. hvor "now" er det vi har fra performance.now
  if (startTime == null) return; // præ kondition: hvis starttiden ikke er defineret kan vi ikke kører det

  const elapsed = now - startTime; //tiden der er gået er nu - starttid.
  const progress = Math.min(elapsed / length, 1);
  /*
  Vi bruger mathmin til at finde ud af, om elapsed / duration er over 1.
  Hvis det skulle være over 1, forcer vi det til at være 1 (100%)
  */
  const elem = document.getElementById("timeBar"); //DOM på timeBar
  elem.style.width = (progress * 100) + "%"; //opdatere timebar med progress. da progress er i decimal, skal vi gange med 100 for at få procent.

  if (progress < 1) { //Hvis sangen ikke er færdig opdatere vi progress.
    requestAnimationFrame(updateProgress); 
    //console.log("progress:", progress); //debug, spammer konsol
  } else {
    console.log("next track runs") //debug
    nextTrack(); //ellers starter vi næste sang. Funktionen defineres næste linjer.
  }
}

async function nextTrack() {
  console.log("next called");
    tracksQueue.shift(); //fjerner den første sang i køen, da den nu er spillet
    await addTrackToQueue(); //tilføjer en ny sang til køen, så vi altid har 8 sange i køen. Her fetcher vi også fra backend.
    //addtrack er også der hvor vi skubber til TracksQueue.
    playTrack(0); //starter forfra i køen, da vi har fjernet den første sang, så den næste sang nu er i index 0.
}