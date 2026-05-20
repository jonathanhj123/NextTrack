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



let hasUserVoted = false; //user har ikke voted i starten
let votedButton = null; //reference to the button the user voted on


// Resets the votes to 0
function resetCounters() {
  for (let i = 0; i <= 7; i++) {
    // counter representates the count in the for-loop
    const counter = document.getElementById(i);

    // The text content for "counter" resets to 0
    counter.textContent = "0";
  }
}

// Turns the vote Arrow into red and counts one up, if clicked
function redArrowIfClicked(buttonElement, counterId) {
  // If the user clicks the same red button again, deselect it
  if (hasUserVoted && buttonElement === votedButton) {
    const counterElem = document.getElementById(counterId);
    let pointerId = parseInt(counterId) + 1;
    tracksQueue[pointerId].votes = tracksQueue[pointerId].votes - 1;
    counterElem.textContent = tracksQueue[pointerId].votes;
    buttonElement.style.backgroundColor = "";
    buttonElement.style.color = "";
    hasUserVoted = false;
    votedButton = null;
    return;
  }

  // Checks if the user has voted
  if (hasUserVoted) {
    // It will show an alert
    alert("You can only vote once!");
    return;
  }

  // "counterElem" representates "counterId", which is from the HTML
  const counterElem = document.getElementById(counterId);
  let pointerId = parseInt(counterId) + 1;

  tracksQueue[pointerId].votes = tracksQueue[pointerId].votes + 1;

  counterElem.textContent = tracksQueue[pointerId].votes;

  // turns the backgroundColor to red
  buttonElement.style.backgroundColor = "red";

  // Turns the color of the arrow into white
  buttonElement.style.color = "white";

  // Turns the "hasUserVoted" boolean into true
  hasUserVoted = true;
  votedButton = buttonElement;
  console.log(pointerId);
  console.log(tracksQueue);
}

//god skik at definere alt med let, så det ikke bliver globalt
//kode importeret fra gamle progress.js. med ældrninger så det virker med gamle vote.js, ofc.

let currentIndex = 0;
let startTime = null;
let tracklength = 0;

function playTrack(index) {
  //vi kører playTrack i indexet.
  try {
    console.log("play called"); //debug

    const elem = document.getElementById("timeBar");
    elem.style.width = "0%"; //Vi starter fra ny - så vi skal reset timebar
    let track = tracksQueue[index];

    renderSongs();
    /*
Vi skal lige have opdateret sangene i køen, da vi har spillet den første sang, og derfor skal have den næste sang ind i køen.
Ellers opdatere køen ikke, og der vil fks stå Get Lucky i toppen af køen samtidig med Get Lucky spiller.
*/

    tracklength = track.tracklength * 1000; //vores duration er givet i sekunder i .csv, så vi skal lige gange med 1000 da JS kører i millisekunder.
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
  } catch (error) {
    //debug
    console.log(error);
  }
}

function updateProgress(now) {
  //nu definere vi vores updateProgress. hvor "now" er det vi har fra performance.now
  if (startTime == null) return; // præ kondition: hvis starttiden ikke er defineret kan vi ikke kører det

  const elapsed = now - startTime; //tiden der er gået er nu - starttid.
  const progress = Math.min(elapsed / tracklength, 1);
  /*
  Vi bruger mathmin til at finde ud af, om elapsed / duration er over 1.
  Hvis det skulle være over 1, forcer vi det til at være 1 (100%)
  */
  const elem = document.getElementById("timeBar"); //DOM på timeBar
  elem.style.width = progress * 100 + "%"; //opdatere timebar med progress. da progress er i decimal, skal vi gange med 100 for at få procent.

  if (progress < 1) {
    //Hvis sangen ikke er færdig opdatere vi progress.
    requestAnimationFrame(updateProgress);
    //console.log("progress:", progress); //debug, spammer konsol
  } else {
    console.log("next track runs"); //debug
    nextTrack(); //ellers starter vi næste sang. Funktionen defineres næste linjer.
  }
}

async function nextTrack() {
  console.log("next called");
    tracksQueue.shift(0);
    tracksQueue.sort((a, b) => b.votes - a.votes);
    ResetButtons();
    resetCounters();
    buildSongQueue();

}

function ResetButtons() {
  //Her kører vi i det store hele bare de forskellige ting vi også kører når folk stemmer, bare omvendt.
  resetCounters();
  for (let i = 0; i <= 7; i++) {
    let buttonElement = document.getElementById(`button${i}`);
    buttonElement.style.backgroundColor = "white";
    buttonElement.style.color = "black";
    buttonElement.disabled = false;
    buttonElement.style.cursor = "auto";
    hasUserVoted = false;
    votedButton = null;
  }
}
