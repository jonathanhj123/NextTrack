window.addEventListener("DOMContentLoaded", () => {
  const coverArtContainer = document.getElementById("coverArt");

  if (coverArtContainer) {
    const img = document.createElement("img");
    img.src = "coverart.jpg";
    img.alt = "Cover Art";

    img.style.width = "100%";
    img.style.height = "100%";
    img.style.objectFit = "cover";
    img.style.borderRadius = "5px";

    coverArtContainer.appendChild(img);
  } else {
    console.error("Could not find the coverArt container!");
  }
});
