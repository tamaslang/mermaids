import { startOcean } from "./ocean.js";
import { startGame } from "./game.js";

window.addEventListener("DOMContentLoaded", () => {
  startOcean(document.getElementById("ocean"));

  const welcome = document.getElementById("welcome");
  const playing = document.getElementById("playing");
  const gameCanvas = document.getElementById("game-canvas");

  function begin() {
    if (welcome.hidden) return;
    welcome.hidden = true;
    playing.hidden = false;
    gameCanvas.width = gameCanvas.clientWidth;
    gameCanvas.height = gameCanvas.clientHeight;
    window.__game = startGame(gameCanvas);
  }

  document.getElementById("start").addEventListener("click", begin);
  window.addEventListener("keydown", (e) => {
    if (e.key === "Enter") begin();
  });
});
