import { startOcean } from "./ocean.js";
import { startGame } from "./game.js";
import { loadSprites, spriteUrl } from "./sprites.js";

window.addEventListener("DOMContentLoaded", async () => {
  startOcean(document.getElementById("ocean"));
  for (const img of document.querySelectorAll("img[data-sprite]")) {
    img.src = spriteUrl(img.dataset.sprite);
  }

  const sprites = await loadSprites();
  const welcome = document.getElementById("welcome");
  const playing = document.getElementById("playing");
  const gameCanvas = document.getElementById("game-canvas");

  function begin() {
    if (welcome.hidden) return;
    welcome.hidden = true;
    playing.hidden = false;
    // The canvas can have no size yet right after un-hiding; wait until layout gives it one.
    const launch = () => {
      if (!gameCanvas.clientWidth || !gameCanvas.clientHeight) { requestAnimationFrame(launch); return; }
      gameCanvas.width = gameCanvas.clientWidth;
      gameCanvas.height = gameCanvas.clientHeight;
      window.__game = startGame(gameCanvas, sprites);
    };
    launch();
  }

  const startBtn = document.getElementById("start");
  startBtn.addEventListener("click", begin);
  startBtn.disabled = false;
  window.addEventListener("keydown", (e) => {
    if (e.key === "Enter") begin();
  });
});
