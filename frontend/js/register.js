console.log("register.js loaded") //debug, tjek lige at lortet loader

//Vi skal bruge brugenes input. Vi benytter DOM til at hente det, og definere det.
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const emailInput = document.getElementById("email");
const ageInput = document.getElementById("age");
const countryInput = document.getElementById("countrySelect1");
const genderInput = document.getElementById("GenderSelect1");
const tncCheckbox = document.getElementById("tnc");
const form = document.getElementById("form");


//For addeventlistener: ("typen af event", hvad der sker); af et string (click, submit, input)
form.addEventListener("submit", (tjek) => {
  //TODO popup fejl. tjek for username findes, etc.
    if (!tncCheckbox.checked) {
        tjek.preventDefault(); ///preventDefault sikrer, at det ikke er "default form" dvs. tom / ikke checket
        window.alert("You must accept the T&C's to register."); //fortæl brugeren de skal godkende
        /*
        Moderne browsere behøver faktisk ikke denne funktion, da de ikke vil tillade submit, hvis
        checkboxen står som "required" i HTML. Det gør vores, men jeg har alligevel denne del.
        */
        return; //stop funktionen hvis tnc ikke er accepteret.
    }
});