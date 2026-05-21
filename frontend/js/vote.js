


/*
Vote = 8 songs + 8 artists combined - title on top, artist below
Arrow up on the right, grey when not selected, red when selected
Should be selectable, should be deselectable, should make sure that a user can only upvote 1 song, the rest should not be selectable when user has used their upvote
Should display count to the left of the button
JS bool to check if user has upvoted once
*/



let hasUserVoted = false; //user har ikke voted i starten
let votedButton = null; //reference to the button the user voted on
let votedTrackId = null;

//params, sesisonid, er defineret globalt i load.js


// Resets the votes to 0
function resetCounters() {
  for (let i = 0; i <= 7; i++) {
    // counter representates the count in the for-loop
    const counter = document.getElementById(i);

    // The text content for "counter" resets to 0
    counter.textContent = "0";
  }
}


/*
Meget kode vi bruge i queue.js, så burde være kendt for os.
Men hvad vi gør er egentllig bare at have en måde hvorpå vi tæller op / ned for vote.
OBS på vi kun arbejder med frontend her. Det er længere ned ved addVote/removeVote vi interager med databasen.
*/

// Turns the vote Arrow into red and counts one up, if clicked
async function redArrowIfClicked(buttonElement, counterId, trackId) {
  // If the user clicks the same red button again, deselect it
  if (hasUserVoted && buttonElement === votedButton) {
//remove vote funktion:
    await removeVote(trackId);

    const counterElem = document.getElementById(counterId);
    let currentVotes = parseInt(counterElem.textContent);

    counterElem.textContent = currentVotes - 1;

    buttonElement.style.backgroundColor = "";
    buttonElement.style.color = "";
    hasUserVoted = false;
    votedButton = null;
    votedTrackId = null;
    return;
  }


  // Checks if the user has voted
  if (hasUserVoted) {
    // It will show an alert
    showPopup("You can only vote once!"); //Fin lille OBS, men man må gerne fjerne votes.
    return;
  }

//now add vote...

await addVote(trackId); //kald funktion
//visuelt arbejde under

  // "counterElem" representates "counterId", which is from the HTML
  const counterElem = document.getElementById(counterId);
  let currentVotes = parseInt(counterElem.textContent);
  counterElem.textContent = currentVotes + 1;

  // turns the backgroundColor to red
  buttonElement.style.backgroundColor = "red";

  // Turns the color of the arrow into white
  buttonElement.style.color = "white";

  // Turns the "hasUserVoted" boolean into true
  hasUserVoted = true;
  votedButton = buttonElement;
  votedTrackId = trackId;
}


async function addVote(trackId) { //Her arbejder vi med databasen.

    try {
        await fetch("/api/addVote", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                user_id: userId,
                session_id: sessionId,
                track_id: trackId //En vote sendt til serveren kræver vi ved hvem der sendte det, i hvilken session, og for hvilket track.
            })
        });
    } catch(err) {
        console.log("error adding vote:",err); //debug, fordi det skal man jo
    }
}

async function removeVote(trackId) {
    try {
        await fetch("/api/removeVote", {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            },

            body: JSON.stringify({
                user_id: userId,
                session_id: sessionId,
                track_id: trackId //samme som overfor.
            })
        });
    } catch(err) {
        console.log("error removing vote:",err);
    }
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
  }
    hasUserVoted = false;
    votedButton = null;
    votedTrackId = null;
    console.log("reset called");
}
//Kode ovenfor er også fra gamle queue.js.

window.redArrowIfClicked = redArrowIfClicked; //dette gør vi kan bruge funktionen i load.js. Ikke noget vi rigtigt har lært, men mere simplere end import/export.
window.ResetButtons = ResetButtons;
//Kan sikkert være noget (u)sikkerhed med at bruge det her istedet for export/import.