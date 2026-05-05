const activeQueues = ["829456"];

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
function validateAndRedirect() {
  let enteredId = "";
  inputElements.forEach((input) => {
    enteredId += input.value;
  });

  if (activeQueues.includes(enteredId)) {
    window.location.href = "dashboard.html";
  } else {
    showPopup("Invalid Queue ID. Please try again.");

    inputElements.forEach((input) => (input.value = ""));
    inputElements[0].focus();
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
