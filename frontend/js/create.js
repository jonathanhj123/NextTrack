const createButton = document.getElementById("createButton");
//DOM på createButton knappen

createButton.addEventListener("click", () => {
    console.log("create session button clicked");
    createSession();
});
//tjekker om der bliver kliket, hvis ja, kør createSessions

async function createSession() {

  const params = new URLSearchParams(window.location.search);
  const user_id = params.get("user_id") || localStorage.getItem("user_id");

  if (!user_id) {
    showPopup("User ID is missing. Please log in again.");
    console.error("Session creation aborted: user_id is null");
    return; // Stop the function here
  }

  try {
    const response = await fetch("/api/createSession", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      } //Definere hvordan vi forventer vores respons.
    });

    //Vi benytter samme kode som i toppen af queue.js til at få fat i user_id fra urlen, som findes deri grundet login.js:
    const data = await response.json();

    if (response.ok) { //Hvis god respons, så skal vi redirect dem til det nye sessionId
        //sessionId får vi fra server.js, via response.json.

      window.location.href =
        `/dashboard.html?session=${data.sessionId}&user_id=${user_id}`; //Vi sender dem videre til dashboard, og giver sessionId og userId med i url'en, så vi kan bruge det i dashboard.js

    } else {
      console.log(data.error); //hvis fejl, fortæl hvilken
    }

  } catch (err) {

    console.log(err); //catch all
  }
}