const form = document.querySelector("form");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const username = document.querySelector("#username").value;
  const password = document.querySelector("#password").value;

  checkLogin(username, password);

  /*En funktion der tjekker om loginnet er gyldigt samt om dataen stemmer overens med dataen i databasen*/
  async function checkLogin(username, password) {
    const userExists = await checkUsername(username);

    if (userExists) {
      const passwordMatch = await checkPassword(username, password);

      if (passwordMatch) {
        const data = await getUserId(username);
        const user_id = data.user_id || data;

        if (user_id) {
          localStorage.setItem("user_id", user_id); //gemmer user_id i lokal browser lager
          window.location.href = "session.html?user_id=" + user_id;
        } else {
          showPopup("Error: Could not load user data.");
        }
      } else {
        // Runs if the password check returns false
        showPopup("Incorrect password. Please try again.");
      }
    } else {
      // Runs if the username check returns false
      showPopup("Username not found.");
    }
  }
});

async function getUserId(username) {
  const response = await fetch(`/api/getUserId/${username}`);
  if (response.ok) {
    return await response.json();
  }
}

// Funktion der tjekker om hvorhvidt at brugernavnet overhovedet eksistere i vores database, med en Select exist (sql statement) som returnere en true eller false værdi alt afhængigt af om den er i databasen
async function checkUsername(username) {
  const response = await fetch(`/api/checkIfUserExists/${username}`);
  if (response.ok) {
    return await response.json();
  } else {
    return false;
  }
}

/* Funktion der kun bliver kaldt hvis brugernavnet er i vores database så sammenligner vi med inputtet i felterne 
og om hvorhvidt det password der er blevet skrevet i inputfeltet passer med brugernavnets password*/

/*Grunden til at det er en POST og ikke en get er fordi at en get viser dataen i url'en så brugerens password ville være i url'en hvilket ikke er sikkert
Content type : application.json her fortæller vi at det er et json element vi sender igennem  og body : gør så vi kan hente den ved kaldet "json.body" så vi kan få dataen uden at have den i url'en*/
async function checkPassword(username, password, user_id) {
  const response = await fetch(`/api/checkPassword`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password, user_id }),
  });
  const data = await response.json();
  return data.match;
}

//popup, samme som i join.js
function showPopup(message) {
  if (document.querySelector(".error-popup")) return;

  const popup = document.createElement("div");
  popup.className = "error-popup";
  popup.textContent = message;
  document.body.appendChild(popup);

  setTimeout(() => {
    popup.remove();
  }, 2500);
}