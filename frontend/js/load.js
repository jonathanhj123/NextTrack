document.addEventListener("DOMContentLoaded", async () => {
    await loadSession();
});

async function loadSession() {
    try{
    const params = new URLSearchParams(window.location.search);
    const session_id = params.get("session"); //få session id ud af query parameteren... Samme kode som lige overfor ved leave button.
    const response = await fetch (`/api/getCurrentStatus?session_id=${session_id}`); //samme funktion som progress har. vi laver altså en ny tracks side for hver session _id. 
    const rows = await response.json();
    } catch(err) {
    console.log(err);
    }
}