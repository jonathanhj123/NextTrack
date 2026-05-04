const inputs = document.getElementById("inputs");

/*
Tjekker om det indtastede er et tal eller mellemrum. Hvis det er et tal eller mellemrum, sættes blokken til "". Hvis value er et tal, skipper den videre til næste. (e) er event
*/
inputs.addEventListener("input", function (e) {
  const target = e.target;
  const val = target.value;

  if (isNaN(val) || val == " ") {
    target.value = "";
    return;
  }

  if (val != "") {
    const next = target.nextElementSibling;
    next.focus();
  }
});

/*
Tjekker om "keyup" (når en tast bliver sluppet) er delete eller backspace, og i så fald fjerner den hvad der var før samt skipper tilbage til den boks.
*/
inputs.addEventListener("keyup", function (e) {
  const target = e.target;
  const key = e.key.toLowerCase();

  if (key == "backspace" || key == "delete") {
    target.value = "";
    const prev = target.previousElementSibling;
    prev.focus();
    return;
  }
});
