function loadProgress() {
  const progressBar = document.getElementById("progress-bar");
  let width = 0;
  let progress = setInterval(() => {
    if (width >= 100) {
      clearInterval(progress);
      fadeOutOverlay();
    } else {
      progressBar.style.width = width + "%";
      width += 0.1;
    }
  }, 10);
}
function fadeOutOverlay() {
  const overlay = document.getElementById("overlay");
  let opacity = 100;
  let fade = setInterval(() => {
    if (opacity <= 0) {
      clearInterval(fade);
      overlay.style.display = "none";
    } else {
      overlay.style.opacity = opacity / 100;
      opacity--;
    }
  }, 10);
}

loadProgress();

