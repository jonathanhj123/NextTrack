console.log("progress.js loaded") //debug, tjek lige at lortet loader
let tracks = []; //vi starter med alt er nul, dvs. indexet er tomt, det starter ved nul.


async function loadTracks(title) { //loadtracks
  const res = await fetch("/tracks"); //i server.js har vi lavet en /tracks ud fra SQL kald 
  const data = await res.json();

  tracks = data.map(track => ({ //her mapper vi tracks over til tracks index
    title: track.title,
    length: track.length,
    artist_name: track.artist_name
  }));
  playTrack(0);
  console.log(tracks.length);
} //her har vi rederfineret det tomme tracks index mde tracks fra importeret csv


//god skik at definere alt med let, så det ikke bliver globalt

let currentIndex = 0;
let startTime = null;
let length = 0;

function playTrack(index) { //vi kører playTrack i indexet.
  console.log("play called");
  const elem = document.getElementById("timeBar");
  elem.style.width = "0%"; //Vi starter fra ny - så vi skal reset timebar

  const tracks = rows;
  if (!track) return; //hvis der ikke er en sang, kan vi ikke

  length = track.length * 1000; //vores duration er givet i sekunder i .csv, så vi skal lige gange med 1000 da JS kører i millisekunder.
  startTime = performance.now();

  //Skriv den track & kunsterne der spiller lige nu (DOM)
  const tracktitle = document.getElementById("tracktitle");
  tracktitle.textContent = track.title
  const artistname = document.getElementById("artistname");
  artistname.textContent = track.artist_name
  //TODO ved ny DB skal vi grabbe artist direkte fra tracks.
  
  
  /*
performance.now er et kald der i javascript giver et præcist antal millisekunder siden kaldet.
Hvis man brugte noget hvor mange brugte computeresn forståelse af tid kan der være problemer hvis der er performance forskelle mellem siden og computeren.
  */
  requestAnimationFrame(updateProgress); //opdatere via requestAnimationFrame (JS funktion)

}

function updateProgress(now) { //nu definere vi vores updateProgress. hvor "now" er det vi har fra performance.now
  if (startTime == null) return; // præ kondition: hvis starttiden ikke er defineret kan vi ikke kører det

  const elapsed = now - startTime; //tiden der er gået er nu - starttid.
  const progress = Math.min(elapsed / length, 1);
  /*
  Vi bruger mathmin til at finde ud af, om elapsed / duration er over 1.
  Hvis det skulle være over 1, forcer vi det til at være 1 (100%)
  */
  const elem = document.getElementById("timeBar"); //DOM på timeBar
  elem.style.width = (progress * 100) + "%"; //opdatere timebar med progress. da progress er i decimal, skal vi gange med 100 for at få procent.

  if (progress < 1) { //Hvis sangen ikke er færdig opdatere vi progress.
    requestAnimationFrame(updateProgress); 
    //console.log("progress:", progress); //debug, spammer konsol
  } else {
    console.log("next track runs") //debug
    nextTrack(); //ellers starter vi næste sang. Funktionen defineres næste linjer.
  }
}

function nextTrack() {
  currentIndex++; //plus en på indekset, da vi har været en igennem
  console.log("next called");

  if (currentIndex < tracks.length) { //præ konditioner: tjek, at der stadig er sange i indexet
    playTrack(currentIndex); //tjek votes i stedet
  } else {
    currentIndex = 0; //ellers starter vi forfra //hvis ingen votes
    playTrack(currentIndex);
  }
}

loadTracks(); // det her er kickoffet
