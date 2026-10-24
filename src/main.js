import { startOcean } from "./ocean.js";

window.addEventListener("DOMContentLoaded", () => {
  startOcean(document.getElementById("ocean"));

  const welcome = document.getElementById("welcome");
  const playing = document.getElementById("playing");

  function startGame() {
    welcome.hidden = true;
    playing.hidden = false;
  }

  document.getElementById("start").addEventListener("click", startGame);
  window.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && !welcome.hidden) startGame();
  });
});
