/*
Vote = 8 songs + 8 artists combined - title on top, artist below
Arrow up on the right, grey when not selected, red when selected
Should be selectable, should be deselectable, should make sure that a user can only upvote 1 song, the rest should not be selectable when user has used their upvote
Should display count to the left of the button
JS bool to check if user has upvoted once
*/

console.log("vote.js loaded succesfully!")


let hasUserVoted = false;


const query = document.getElementById("leftBottomRightDiv");


// This is the global array, that will hold the data for the 8 songs
const tracksQueue = [];


// DOMContentLoaded ensures the browser has finished loading the HTML, before the JavaScript runs buildSongQueue()
document.addEventListener('DOMContentLoaded', async () => {
    buildSongQueue();
});


async function buildSongQueue() {
    try{
        // In order to pause execution until the server responds, we use 'await'
        const response = await fetch ("/tracks");
        const rows = await response.json();

        // Clearing the old data
        tracksQueue.length = 0;

        //Turning the Database data into UI data
        for (let i = 0; i < 8; i++){
            const track = rows[i];
            tracksQueue.push({
                title: track.title,
                artist: track.artist_name
            });
        }

        // Renders the songs for the DOM
        renderSongs();

        // Resetting the votes to 0
        resetCounters();
    
    } catch (error){
        console.error("Voting Board has failed to load", error);
    }
}


// Renders trhe songs for the DOM
function renderSongs() {
    // Making "container" into the Element "leftBotoomRIghtDiv" 
    const container = document.getElementById("leftBottomRightDiv");

    // forEach() loops through all 8 songs
    tracksQueue.forEach((track, index) => {
        const songNum = index + 1;

        // goes through all specific table songs (song1, song2, ...) based on the loop index
        const table = document.getElementById(`song${songNum}`);
        // Selects the two cells inside the table
        if (table){
            const cells = table.querySelectorAll('td');
            if(cells.length >= 2) {
                cells[0].textContent = track.title;
                cells[1].textContent = track.artist;
            }
        }
    })
}


// Resets the votes to 0
function resetCounters(){
    for (let i = 1; i <= 8; i++) {
        const counter = document.getElementById(`count${i}`);
        if (counter) {
            counter.textContent = "0";
        }
    }
}


// Disables all buttons if a voting button has been clicked
function disableAllButtons() {
    // Going through all buttons
    for (let i = 1; i <= 8; i++) {
        const everyButton = document.getElementById(`button${i}`);
        if (everyButton) {
            // the everyButton.disabled becomes "true"
            everyButton.disabled = true;
            // The mousecursor is not allowed to click
            everyButton.style.cursor = "not-allowed";
        }
    }
}


// Turns the vote Arrow into red and counts one up, if clicked
function redArrowIfClicked(buttomElement, counterId) {
    if (hasUserVoted) {
        alert("You can only vote once!");
        return;
    }

    const counterElem = document.getElementById(counterId);

    let currentCount = parseInt(counterElem.textContent) || 0;
    currentCount++;
    counterElem.textContent = currentCount;

    buttomElement.style.backgroundColor = "red";
    buttomElement.style.color = "white";

    disableAllButtons();
    hasUserVoted = true;
}
