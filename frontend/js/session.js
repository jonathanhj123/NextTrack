const joinbutton = document.getElementById("joinButton");
joinbutton.addEventListener("click", () => {
  joinRedirect();
});

async function joinRedirect() {
  try {
    const params = new URLSearchParams(window.location.search);
    const user_id = params.get("user_id") || localStorage.getItem("user_id");

    if (!user_id) {
      showPopup("User ID is missing. Please log in again.");
      console.error("Redirect aborted: user_id is null");
      return; // Stop the function here so the user isn't sent to join.html
    }

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

const backButton = document.getElementById("back");

backButton.addEventListener("click", () => {
  // Clear the stored ID so they are effectively "logged out"
  localStorage.removeItem("user_id");

  // The link will naturally take them to index.html because of the href
});