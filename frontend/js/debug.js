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
}
//Kald i browseren ved at skrive debugSkip() i konsol.