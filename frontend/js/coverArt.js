// '(' i starten og ')()' til slut gør, at koden kører automatisk, så snart den indlæses
(async function () {
  // artistMap gemmer vores "Navn til ID" par (f.eks. { "Taylor Swift": "1" })
  const artistMap = {};

  // lastArtist holder styr på navnet på den forrige kunstner, så vi ikke opdaterer billedet hele tiden, hvis artisten er ens
  let lastArtist = "";

  // Funktionen indlæser listen over kunstnere fra artist.csv
  async function loadArtistMapping() {
    try {
      const response = await fetch("/artist.csv");
      const csvText = await response.text();

      // Del teksten op i rækker, og .slice(1) hopper over første række
      const lines = csvText.split("\n").slice(1);

      lines.forEach((line) => {
        // .split(",") adskiller navnet fra ID'et
        const [name, id] = line.replace("\r", "").split(",");

        // Vi bruger .toLowerCase() og .trim() for at sikre, at " Taylor Swift " matcher "taylor swift" præcist
        artistMap[name.trim().toLowerCase()] = id.trim();
      });
      console.log("Artist Map er klar:", artistMap);
    } catch (err) {
      console.error(
        "Kunne ikke hente CSV. Tjek om artist.csv ligger i images-mappen.",
        err,
      );
    }
  }

  //Funktionen håndterer opdateringen af billedet
  function updateImage(id) {
    const container = document.getElementById("coverArt");

    let img = container.querySelector("img");
    img = document.createElement("img");
    Object.assign(img.style, {
      width: "100%",
      height: "100%",
      objectFit: "cover",
      borderRadius: "5px",
    });
    img.alt = "Cover Art";
    container.appendChild(img);

    const imagePath = id ? `/trackart/${id}.jpg` : "/coverart.jpg";
    img.src = imagePath;
  }

  // Funktionen holder øje med skærmen for ændringer
  function checkForArtistChange() {
    // Find det element, hvor progress.js skriver kunstnerens navn
    const artistElem = document.getElementById("artistname");

    // Hent teksten og fjern overflødige mellemrum
    const currentArtist = artistElem.textContent.trim();

    // Vi opdaterer kun billedet, hvis artist er anderledes
    if (currentArtist && currentArtist !== lastArtist) {
      lastArtist = currentArtist;

      // Slå ID'et op
      const artistId = artistMap[currentArtist.toLowerCase()];

      updateImage(artistId);
    }
  }
  await loadArtistMapping();

  // Den kører checkForArtistChange hvert 500. millisekund (to gange i sekundet)
  setInterval(checkForArtistChange, 500);
})();
