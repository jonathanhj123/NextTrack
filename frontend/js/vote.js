/*
Vote = 8 songs + 8 artists combined - title on top, artist below
Arrow up on the right, grey when not selected, red when selected
Should be selectable, should be deselectable, should make sure that a user can only upvote 1 song, the rest should not be selectable when user has used their upvote
Should display count to the left of the button
JS bool to check if user has upvoted once
*/

console.log("vote.js loaded succesfully!")


const query = document.getElementById("leftBottomRightDiv");
await buildSongQueue(query);


// This is the global array, that will hold the data for the 8 songs
const tracksQueue = [];


async function buildSongQueue() {
    try{
        // In order to pause execution until the server responds, we use 'await'
        const response = await fetch ("/tracks");
        const rows = await response.json();

        // Clearing the old data
        tracksQueue.length = 0;

        //
        for (let i = 0; i < 8; i++){
            //
            const track = rows[i];
            //
            tracksQueue.push({
                title: track.title,
                artist: track.artist
            });
        }

        //
        renderSongs();

        //
        resetCounters();
    
    } catch (error){
        console.error("Voting Board has failed to load", error);
    }
}


//
function renderSongs() {
    const container = document.getElementById("leftBottomRightDiv");
}


//
function resetCounters(){

}


//
function redArrowIfClicked(buttomElement, counterId) {
    const counterElem = document.getElementById(counterId);

    let currentCount = parseInt(counterElem.textContent) || 0;
    currentCount++;
    counterElem.textContent = currentCount;

    buttomElement.style.color = "red";
}
