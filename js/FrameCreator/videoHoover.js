const video = document.getElementById("hoverImage");

function hideImage() {
  if (!video) return;
  video.pause();
  video.style.display = "none";
}

function showImage() {
  // Video startet im Creator nicht mehr automatisch
  hideImage();
}

window.addEventListener("load", function () {
  hideImage();
});
