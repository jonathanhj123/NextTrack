

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
    const response = await fetch(`/session/${enteredId}`);

    if (response.ok) {
      window.location.href = `/dashboard.html?session=${enteredId}`; //redirect til dashboard med session_id som query parameter
    } else {
      showPopup("Session does not exist.");
      return;
    }
  } catch (err) { //just in case check
    showPopup("Something went wrong.");
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
