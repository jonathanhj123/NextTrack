const inputsContainer = document.getElementById("inputs");
const submitBtn = document.getElementById("submit");
const inputElements = document.querySelectorAll(".inputs .input");

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

/*
Tjekker om det indtastede stemmer overens med aktive ID's
*/
async function validateAndRedirect() { 
  let enteredId = ""; 
  inputElements.forEach((input) => {
    enteredId += input.value; //vi ændrer enteredId for hver boks
  });

  try {

    const params = new URLSearchParams(window.location.search); 
    const user_id = params.get("user_id");    //Vi benytter samme kode som i toppen af queue.js til at få fat i user_id fra urlen, som findes deri grundet login.js:

    const response = await fetch(
    `/session/${enteredId}?user_id=${user_id}` //Få fat i både user_id og session_id til backend, så vi kan benytte det til kobling i SQL.
    );
    const data = await response.json(); //data er json svaret, dvs. response overfor.
 
    if (response.ok) {
      window.location.href = `/dashboard.html?session=${enteredId}&user_id=${user_id}`; //redirect til dashboard med session_id som query parameter
    } else {
      showPopup("Session does not exist.");
      return;
    }
  } catch (err) { //just in case check
    showPopup("Something went wrong.");
    console.log(err);
    return;
  }
}

/*
Begrænser inputs til kun at være tal
*/
inputsContainer.addEventListener("input", function (e) {
  const target = e.target;
  const val = target.value;

  if (isNaN(val) || val === " ") {
    target.value = "";
    return;
  }

  if (val !== "") {
    const next = target.nextElementSibling;
    if (next) {
      next.focus();
    }
  }
});

/*
Backspace/delete håndtering
*/
inputsContainer.addEventListener("keyup", function (e) {
  const target = e.target;
  const key = e.key.toLowerCase();

  if (key === "backspace" || key === "delete") {
    target.value = "";
    const prev = target.previousElementSibling;
    if (prev) {
      prev.focus();
    }
  }
});

/*
Tilføjet funktionalitet til at kunne submitte med Enter-tast
*/
inputsContainer.addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    const isComplete = Array.from(inputElements).every((i) => i.value !== "");
    if (isComplete) {
      validateAndRedirect();
    }
  }
});

submitBtn.addEventListener("click", validateAndRedirect);
