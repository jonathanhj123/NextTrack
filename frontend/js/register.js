console.log("register.js loaded") //debug, tjek lige at lortet loader

//Vi skal bruge brugenes input. Vi benytter DOM til at hente det, og definere det.
const usernameInput = document.getElementById("username");
const passwordInput = document.getElementById("password");
const emailInput = document.getElementById("email");
const ageInput = document.getElementById("age");
const countryInput = document.getElementById("countrySelect1");
const genderInput = document.getElementById("genderSelect1");
const tncCheckbox = document.getElementById("tnc");
const form = document.getElementById("form");


//For addeventlistener: ("typen af event", hvad der sker); af et string (click, submit, input)
form.addEventListener("submit", (tjek) => {
    if (!tncCheckbox.checked) {
        tjek.preventDefault(); ///preventDefault sikrer, at det ikke er "default form" dvs. tom / ikke checket
        window.alert("You must accept the T&C's to register."); //fortæl brugeren de skal godkende
        /*
        Moderne browsere behøver faktisk ikke denne funktion, da de ikke vil tillade submit, hvis
        checkboxen står som "required" i HTML. Det gør vores, men jeg har alligevel denne del.
        */
        return; //stop funktionen hvis tnc ikke er accepteret.
    }

    const data = {
      //Nu fanger vi alt det data vi skal benytte til at lave en bruger.
      //Vi laver et objekt, data, der opsamler al den data.
      username: document.getElementById("username").value,
      password: document.getElementById("password").value,
      email: document.getElementById("email").value,
      age: document.getElementById("age").value,
      country: document.getElementById("countrySelect1").value,
      gender: document.getElementById("genderSelcet1").value,
    }
    const resolve = await fetch ("/register", { //vi skal fetch noget fra register
      method: "POST", //vi sender data 
      headers: {
        "Content-Type": "application/json", //dataen er i formattet json
      },
      body: json.stringify(data) //vi laver JS objekttet data om til json

    }
});

