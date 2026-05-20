

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
