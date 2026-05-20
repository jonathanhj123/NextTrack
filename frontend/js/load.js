document.addEventListener("DOMContentLoaded", async () => {
    const rows = await loadSession(); //Vi skal vente på at rows er defineret, så kalder vi det andet ved load af siden.
    updateArtistTitle(rows);
});

async function loadSession() {
    try{
    const params = new URLSearchParams(window.location.search);
    const session_id = params.get("session"); //få session id ud af query parameteren... Samme kode som lige overfor ved leave button.
    const response = await fetch (`/api/getCurrentStatus?session_id=${session_id}`); //samme funktion som progress har. vi laver altså en ny tracks side for hver session _id. 
    const rows = await response.json(); //få responsens fra backend
    console.log(rows); //tjek, at brugeren får det rigtige


    return rows; //vi returner rows.
    /*
    Dette giver os mulighed for at benytte rows andre steder i koden; dvs. vi får kun data ind i loadSession()
    Derefter kan vi loade rows ind i andre funktioner, og benytte den der. Det giver os muligheder for ikke at have
    en enkelt 400 linjer lang funktion.
    */

    } catch(err) {
    console.log(err);
    }
}

function updateArtistTitle(rows) {
    const title = document.getElementById("tracktitle") //DOM på track element titel
    title.textContent = rows.songtitle;

    const artist = document.getElementById("artistname")
    title.textContent = rows.artist;
    
}