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


//Diverse fejlbeskeder:

//For addeventlistener: ("typen af event", hvad der sker); af et string (click, submit, input)
form.addEventListener("submit", async (tjek) => { //tjek er egentlig en form for objekt der bliver produceret når vi laver den her eventlistener, det er ikke noget vi selv har defineret, men det er det der kommer ind når vi laver en submit event. Det har en masse information om selve eventet, og det er det vi skal bruge til at lave preventDefault, som er det næste vi gør.
  tjek.preventDefault(); ///preventDefault sikrer, at det ikke er "default form" dvs. tom / ikke checket

  if (!tncCheckbox.checked) {
    window.alert("You must accept the T&C's to register."); //fortæl brugeren de skal godkende
    /*
    Moderne browsere behøver faktisk ikke denne funktion, da de ikke vil tillade submit, hvis
    checkboxen står som "required" i HTML. Det gør vores, men jeg har alligevel denne del.
    */
    return; //stop funktionen hvis tnc ikke er accepteret.
  }
    //Email tjek. Et relativt simpelt tjek med at det skal have et @. Man kunne nok godt finde alle mulige domæner... virker bøvlet
  if (!emailInput.value.includes("@")) { //altså vi har emailInput.value, defineret ovenover, som vi tjekker for at inkludere @
    window.alert("Email must contain '@'");
    console.log("email check fail"); //debug
    return;
  }
//Alder tjek med kyndig hjælp fra chatten. Det skal læses følgende:
/*
/.../ er selveste udtrykket, ^ er starten på strengen, \d+ betyder en eller flere cifre, $ er slutningen på strengen. Så det her tjekker om hele strengen kun består af tal.
*/
  if (!/^\d+$/.test(ageInput.value)) {
    window.alert("Age must be numbers only");
    console.log("age check fail"); //debug
    return;
  }
//Man kunne lave et alder tjek her...





//Selveste dataen indhentes, efter tjek:

  const data = {
      //Nu fanger vi alt det data vi skal benytte til at lave en bruger.
      //Vi laver et objekt, data, der opsamler al den data.
    username: document.getElementById("username").value,
    password: document.getElementById("password").value,
    email: document.getElementById("email").value,
    age: parseInt(document.getElementById("age").value), //parseint da alder sendes som et tal.
    country: document.getElementById("countrySelect1").value,
    gender: document.getElementById("genderSelect1").value,
  };
  const resolve = await fetch ("/api/register", { //vi skal fetch noget fra register
    method: "POST", //vi sender data 
    headers: {
      "Content-Type": "application/json", //dataen er i formattet json
    },
    body: JSON.stringify(data), //vi laver JS objekttet data om til json
  });

//Tjek responsen...
  const result = await resolve.json(); //Vi laver responsen om til json, så vi kan vise det til bugeren, skulle der sk fejl.
  if (resolve.ok) { //Hvis vi får en god respons, så gør vi...
    window.alert("Registration successful!"); //fortæl brugeren det gik godt
    window.location.href = "/login.html"; //og send dem videre til login siden
  } else {
    alert(result.error); //Den her viser til burgerne (alert) en fejl (error) fra (result) som er defineret ovenfor.
    //fejlene er defineret i server.js.
  } 
});
