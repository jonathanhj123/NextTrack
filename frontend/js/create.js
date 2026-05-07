const createButton = document.getElementById("createButton");
//DOM på createButton knappen

createButton.addEventListener("click", () => {
    console.log("create session button clicked");
    createSession();
});
//tjekker om der bliver kliket, hvis ja, kør createSessions

async function createSession() {

  try {
    const response = await fetch("/api/createSession", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      } //Definere hvordan vi forventer vores respons.
    });

    const data = await response.json();

    if (response.ok) { //Hvis god respons, så skal vi redirect dem til det nye sessionId
        //sessionId får vi fra server.js, via response.json.

      window.location.href =
        `/dashboard.html?session=${data.sessionId}`;

    } else {
      console.log(data.error); //hvis fejl, fortæl hvilken
    }

  } catch (err) {

    console.log(err); //catch all
  }
}