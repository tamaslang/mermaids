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
  let gameCanvas = document.getElementById("game-canvas");

  // Some browsers (seen in WebKit) sometimes refuse a context for a canvas that is already in the page;
  // a fresh element with the same id works, so swap it in.
  function ensureContext() {
    for (let i = 0; i < 3 && !gameCanvas.getContext("2d"); i++) {
      const fresh = gameCanvas.cloneNode(false);
      gameCanvas.replaceWith(fresh);
      gameCanvas = fresh;
    }
    return !!gameCanvas.getContext("2d");
  }

  function begin() {
    if (welcome.hidden) return;
    welcome.hidden = true;
    playing.hidden = false;
    // The canvas can have no size yet right after un-hiding; wait until layout gives it one.
    let tries = 0;
    const launch = () => {
      if (!gameCanvas.clientWidth || !gameCanvas.clientHeight) { requestAnimationFrame(launch); return; }
      if (!ensureContext()) {
        if (++tries < 120) { requestAnimationFrame(launch); return; }
        welcome.hidden = false;
        playing.hidden = true;
        alert("Sorry, this browser could not start the game canvas.");
        return;
      }
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
