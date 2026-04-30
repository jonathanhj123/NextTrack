const form = document.querySelector("form");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  // your validation / fetch call here if needed
  const username = document.querySelector("#username").value;
  const password = document.querySelector("#password").value;

  checkLogin(username, password);

  async function checkLogin(username, password) {
    const response = await fetch(`/api/checkIfUserExists/${username}`);
    console.log(response);
    if (response.ok) {
      const userExists = await response.json();
      console.log(userExists);
      if (userExists) {
        if (await checkPassword(username, password)) {
          window.location.href = "session.html";
        }
      }
    }
  }

  console.log(username);
  console.log(password);
});

async function checkPassword(username, password) {
  const response = await fetch(`/api/checkPassword`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  const data = await response.json();
  return data.match;
}
