// Pencil-drawn speech bubble with a little tail pointing down at the speaker.
export function drawSpeech(ctx, x, y, text, alpha = 1) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.font = '20px "Comic Sans MS", "Comic Neue", cursive';
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const pw = ctx.measureText(text).width + 28;
  const ph = 38;
  const bx = x - pw / 2;
  const by = y - ph - 14;
  ctx.beginPath();
  ctx.moveTo(bx + 12, by);
  ctx.arcTo(bx + pw, by, bx + pw, by + ph, 12);
  ctx.arcTo(bx + pw, by + ph, bx, by + ph, 12);
  ctx.lineTo(x + 8, by + ph);
  ctx.lineTo(x, by + ph + 14);
  ctx.lineTo(x - 8, by + ph);
  ctx.arcTo(bx, by + ph, bx, by, 12);
  ctx.arcTo(bx, by, bx + pw, by, 12);
  ctx.closePath();
  ctx.fillStyle = "#fffdf5";
  ctx.fill();
  ctx.strokeStyle = "#444";
  ctx.lineWidth = 2.4;
  ctx.lineJoin = "round";
  ctx.stroke();
  ctx.fillStyle = "#333";
  ctx.fillText(text, x, by + ph / 2 + 1);
  ctx.restore();
}
