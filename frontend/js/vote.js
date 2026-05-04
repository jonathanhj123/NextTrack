/*
Vote = 8 songs + 8 artists combined - title on top, artist below
Arrow up on the right, grey when not selected, red when selected
Should be selectable, should be deselectable, should make sure that a user can only upvote 1 song, the rest should not be selectable when user has used their upvote
Should display count to the left of the button
JS bool to check if user has upvoted once
*/


// The terminal will return a succesful message, if vote.js has been loaded correctly
console.log("vote.js loaded succesfully!")


// Makes hasUserVoted to false at the start, in order to make the user vote
let hasUserVoted = false;


// This is the global array, that will hold the data for the 8 songs
const tracksQueue = [];


// DOMContentLoaded ensures the browser has finished loading the HTML, before the JavaScript runs buildSongQueue()
document.addEventListener('DOMContentLoaded', async () => {
    buildSongQueue();
});


// async function that builds the list of songs
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
            // Pushing the title and artist_name
            tracksQueue.push({
                title: track.title,
                artist_name: track.artist_name
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
