const form = document.querySelector("form");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  // your validation / fetch call here if needed
  const username = document.querySelector("#username").value;
  const password = document.querySelector("#password").value;

  checkLogin(username, password);

  /*En funktion der tjekker om loginnet er gyldigt samt om dataen stemmer overens med dataen i databasen*/
  async function checkLogin(username, password) {
    if (checkUsername(username)) {
      if (await checkPassword(username, password)) {
        window.location.href = "session.html"; // Hvis alt er mødt og alt er true bliver vi sendt videre til session.html
      }
    }
  }
});

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
async function checkPassword(username, password) {
  const response = await fetch(`/api/checkPassword`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  const data = await response.json();
  return data.match;
}
