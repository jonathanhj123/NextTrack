/*

*/


const joinbutton = document.getElementById("joinButton");
joinbutton.addEventListener("click", () => {
    joinRedirect();
});


async function joinRedirect() { 
  try {

    const params = new URLSearchParams(window.location.search); 
    const user_id = params.get("user_id");
      window.location.href = `/join.html?user_id=${user_id}`;

  } catch (err) { 
    showPopup("Session does not exist");
    return;
  }
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

