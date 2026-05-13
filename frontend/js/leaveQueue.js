// Makes it possible to leave the session
async function leaveSession(){
    try {

        const data = {user_id: userId};

        const response = await fetch("/api/leaveSession", {

            method: "POST",
            headers: {

                "Content-Type": "application/json",

            },

            body: JSON.stringify(data), 

        });

        if (response.ok) { 

            window.location.href = `/session.html?user_id=${user_id}`; 

        } else {

            console.log(data.error);

        }

    } catch (err) {

        console.log(err);

    }
}