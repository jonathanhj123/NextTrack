/*
Vote = 8 songs + 8 artists combined - title on top, artist below
Arrow up on the right, grey when not selected, red when selected
Should be selectable, should be deselectable, should make sure that a user can only upvote 1 song, the rest should not be selectable when user has used their upvote
Should display count to the left of the button
JS bool to check if user has upvoted once
*/
console.log("queue.js load") //debug, tjek load

let hasUserVoted = false; //user har ikke voted i starten
const tracksQueue = []; //array for de 8 sange i queue

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
        for (let i = 0; i < 8; i++){
            const track = rows[i];
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


// Renders the songs for the DOM
function renderSongs() {
    // Making "container" into the Element "leftBotoomRIghtDiv" 
    const container = document.getElementById("leftBottomRightDiv");

    // Loops through all 8 songs
    for (let i = 0; i < tracksQueue.length; i++) {
        // "track" representates the selected item from the "tracksQueue" list
        const track = tracksQueue[i];

        // With each loop the next ID gets calculated (song1, song2, song3, ...)
        const songNum = i + 1;

        // goes through all specific table songs (song1, song2, ...) based on the loop index
        const table = document.getElementById(`song${songNum}`);

        // Selects the two cells inside the table
        const cells = table.querySelectorAll('td');
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
function redArrowIfClicked(buttomElement, counterId) {
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
    buttomElement.style.backgroundColor = "red";

    // Turns the color of the arrow into white
    buttomElement.style.color = "white";

    // Disables all buttons
    disableAllButtons();

    // Turns the "hasUserVoted" boolean into ture
    hasUserVoted = true;
}

//god skik at definere alt med let, så det ikke bliver globalt

let currentIndex = 0;
let startTime = null;
let length = 0;

function playTrack(index) { //vi kører playTrack i indexet.
    try {
  console.log("play called");

  const elem = document.getElementById("timeBar");
  elem.style.width = "0%"; //Vi starter fra ny - så vi skal reset timebar
  const track = tracksQueue[index]

  //if (!tracksQueue) return; //hvis der ikke er en sang, kan vi ikke

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

function nextTrack() {
  currentIndex++; //plus en på indekset, da vi har været en igennem
  console.log("next called");

  if (currentIndex < tracksQueue.length) { //præ konditioner: tjek, at der stadig er sange i indexet
    playTrack(currentIndex); //tjek votes i stedet
  } else {
    currentIndex = 0; //ellers starter vi forfra //hvis ingen votes
    playTrack(currentIndex);
  }
}
