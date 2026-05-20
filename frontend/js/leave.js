document.getElementById("leaveButton1").addEventListener("click", () => { //Når man forlader session, skal man smides ud til session html men beholde sit userid, så vi fortsatr kna arbejde med det
  const params = new URLSearchParams(window.location.search);
  const userId = params.get("user_id");
  window.location.href = `session.html?user_id=${userId}`;
});

// Makes it possible to leave the session
async function leaveSession(){
    
    try {
            const params = new URLSearchParams(window.location.search);
        // "const userId" saves the found userId into a variable also called "userId"
        const userId = params.get("user_id");

        // if 'userId' couldn't be found it will return an error
        if (!userId) {
            console.error("User ID cound't be found");
            return;
        }

        // Creates a object named data.
        // This object has one key named "user_id", with a value, which is the userId from before
        const data = {user_id: userId};

        // Function that sends a request to the server for the endpoint "/api/leaveSession"
        const response = await fetch("/api/leaveSession", {

            // This tells the server that we are sending data (not only asking for data but also sending)
            method: "POST",

            // This tells the server that the data is JSON
            headers: {"Content-Type": "application/json",},

            // Converts the object {user_id: "5"} into a text string => '{user_id: "5"}' (fetch API requires it to be a string)
            body: JSON.stringify(data), 

        });

        // Makes sure the server responded successfully (status code 200-299)
        if (response.ok) { 

            console.log("Successfully left the session");

            // window.location.href redirects the browser to a different page
            // It changes the page to session.html and adds fx user_id=1 to the URL
            // Makes sure the user ends up on the session page with their ID
            window.location.href = `/session.html?user_id=${userId}`; 

        } else {
            
            console.error(data.error);

        }

    } catch (error) {

        console.error(error);

    }
}