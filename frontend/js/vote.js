/*
[x] Vote = 8 songs + 8 artists combined - title on top, artist below
[x] Arrow up on the right, grey when not selected, red when selected
[x] Should be selectable, should be deselectable, should make sure that a user can only upvote 1 song, the rest should not be selectable when user has used their upvote
[x] Should display count to the left of the button
[x] JS bool to check if user has upvoted once
[x] Make it possible for the user to deselect a vote in order to give a different vote
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


function showPopup(message) {
  if (document.querySelector(".error-popup")) return;

  const popup = document.createElement("div");
  popup.className = "error-popup";
  popup.textContent = message;
  document.body.appendChild(popup);

  setTimeout(() => {
    popup.remove();
  }, 2500);
}


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
function resetCounters() {
    for (let i = 1; i <= 8; i++) {
        // counter representates the count in the for-loop
        const counter = document.getElementById(`count${i}`);

        // The text content for "counter" resets to 0
        counter.textContent = "0";
    }
}


// Turns the vote Arrow into red and counts one up, if clicked
function redArrowIfClicked(buttonElement, counterId) {
    // "counterElem" representates "counterId", which is from the HTML
    const counterElem = document.getElementById(counterId);
    
    // "computedStyle" representates the style of "buttonElement"
    const computedStyle = window.getComputedStyle(buttonElement);

    // "currentColor" representates the backgroundColor of the "computedStyle"/"buttonElement"
    const currentColor = computedStyle.backgroundColor;

    // "buttonIsRed" representates a boolean. If the color is red or rgb("255, 0, 0"), then it's true. Otherwise it's false
    const buttonIsRed = currentColor === "red" || currentColor.includes("255, 0, 0"); // False or True

    // If "buttonIsRed" is true, this code gets executed and the vote will be deselected
    if(buttonIsRed) {
        //The "currentCount" gets the (converted string to integer) text content from "counterElem"/"counterId". If the text content is empty, it will be 0; 
        let currentCount = parseInt(counterElem.textContent) || 0;
        
        // if the "currentCount" is larger than 0, the "currentCount" gets decreased by 1
        if (currentCount > 0) {
            currentCount--;
            counterElem.textContent = currentCount;
        }

        // The backgroundColor gets changed to the original
        buttonElement.style.backgroundColor = "";

        // The color gets changed to the original
        buttonElement.style.color = "";

        // The button gets enabled
        buttonElement.disabled = false;

        // The user will not have voted
        hasUserVoted = false;
    } 
    else
    {
        // Checks if the user has voted
        if (hasUserVoted === true) {
            // It will show an alert
            showPopup("You can only vote once!");
            return;
        }

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

        // Turns the "hasUserVoted" boolean into true
        hasUserVoted = true;
    }
}

