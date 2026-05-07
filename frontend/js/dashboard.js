const params = new URLSearchParams(window.location.search); //Her læser vi session id fra url
const sessionId = params.get("session");


const queueid = document.getElementById("queueid"); //vi bruger det også til at skrive ID
queueid.textContent = `'Q' ID: ${sessionId}`;