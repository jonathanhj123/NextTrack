//tak til chat
async function debugSkip() {

    await fetch(
        "/api/debugSkip",
        {

            method: "POST",

            headers: {
                "Content-Type":
                    "application/json"
            },

            body: JSON.stringify({
                session_id: sessionId
            })
        }
    );

    const rows =
        await loadSession();

    updateArtistTitle(rows);

    updatePlayingTime(rows);

    updateTrackListing();

    ResetButtons();

    const artistId = window.artistMap[rows.artist.toLowerCase().trim()];
    updateImage(artistId); //klader update af artist imaget

}
//Kald i browseren ved at skrive debugSkip() i konsol.