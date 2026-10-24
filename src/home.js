// Furniture for the mermaid's cave, drawn with the same pencil outlines as everything else.

const INK = "#4a4a4a";

function outline(ctx, fill, lw = 2.4) {
  if (fill) { ctx.fillStyle = fill; ctx.fill(); }
  ctx.strokeStyle = INK;
  ctx.lineWidth = lw;
  ctx.lineJoin = ctx.lineCap = "round";
  ctx.stroke();
}

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

export function windowRect(w, h) {
  const ww = Math.min(300, w * 0.24);
  return { x: w * 0.5 - ww / 2, y: h * 0.14, w: ww, h: ww * 0.9 };
}

// `drawOutside` paints the sea as seen from the doorstep; it is clipped and scaled into the window.
function drawWindow(ctx, w, h, drawOutside) {
  const r = windowRect(w, h);
  const k = 0.65;
  ctx.save();
  roundRect(ctx, r.x, r.y, r.w, r.h, r.w * 0.18);
  ctx.clip();
  ctx.translate(r.x - w * 0.3 * k, r.y - h * 0.4 * k);
  ctx.scale(k, k);
  drawOutside(ctx);
  ctx.restore();

  roundRect(ctx, r.x, r.y, r.w, r.h, r.w * 0.18);
  outline(ctx, null, 7);
  ctx.strokeStyle = "#c98a6a";
  ctx.lineWidth = 5;
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(r.x + r.w / 2, r.y + 4);
  ctx.lineTo(r.x + r.w / 2, r.y + r.h - 4);
  ctx.moveTo(r.x + 4, r.y + r.h / 2);
  ctx.lineTo(r.x + r.w - 4, r.y + r.h / 2);
  outline(ctx, null, 4);
  ctx.strokeStyle = "#c98a6a";
  ctx.lineWidth = 3;
  ctx.stroke();
}

function drawFrame(ctx, img, x, y, fw, tilt) {
  const fh = fw * 1.2;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(tilt);
  roundRect(ctx, -fw / 2, -fh / 2, fw, fh, 4);
  outline(ctx, "#d9b38c", 3);
  ctx.fillStyle = "#fbf6ea";
  ctx.fillRect(-fw / 2 + 6, -fh / 2 + 6, fw - 12, fh - 12);
  const iw = fw - 18;
  const ih = Math.min(fh - 18, iw * (img.height / img.width));
  const iw2 = ih * (img.width / img.height);
  ctx.drawImage(img, -iw2 / 2, -ih / 2, iw2, ih);
  ctx.restore();
}

function drawTV(ctx, sprites, x, y, tw, t) {
  const th = tw * 0.75;
  ctx.beginPath();
  ctx.moveTo(x - tw * 0.2, y + th / 2 + 14);
  ctx.lineTo(x - tw * 0.3, y + th / 2 + 26);
  ctx.moveTo(x + tw * 0.2, y + th / 2 + 14);
  ctx.lineTo(x + tw * 0.3, y + th / 2 + 26);
  outline(ctx, null, 3);
  roundRect(ctx, x - tw / 2, y - th / 2, tw, th + 14, 14);
  outline(ctx, "#f0a8c0", 3);
  ctx.save();
  roundRect(ctx, x - tw / 2 + 9, y - th / 2 + 9, tw - 18, th - 18, 8);
  ctx.clip();
  ctx.fillStyle = "#a9d4ee";
  ctx.fillRect(x - tw / 2, y - th / 2, tw, th);
  ctx.strokeStyle = "rgba(255,255,255,0.7)";
  ctx.lineWidth = 2;
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    const yy = y - th / 2 + 16 + i * (th / 5);
    ctx.moveTo(x - tw / 2, yy);
    for (let xx = 0; xx <= tw; xx += 10) ctx.lineTo(x - tw / 2 + xx, yy + Math.sin(xx / 12 + t / 400 + i) * 3);
    ctx.stroke();
  }
  // A little fish "show" looping across the screen
  const fw = tw * 0.3;
  const prog = ((t / 3500) % 1.6) - 0.3;
  const img = sprites.fish2;
  ctx.drawImage(img, x - tw / 2 + prog * tw, y + Math.sin(t / 500) * th * 0.12 - fw * 0.25, fw, fw * (img.height / img.width));
  ctx.restore();
  ctx.beginPath();
  ctx.arc(x + tw / 2 - 10, y + th / 2 + 7, 3, 0, Math.PI * 2);
  outline(ctx, "#f4f4f4", 1.6);
}

function drawTable(ctx, x, floor, tw, th, t) {
  const top = floor - th;
  ctx.beginPath();
  ctx.moveTo(x - tw * 0.38, top + 8);
  ctx.quadraticCurveTo(x - tw * 0.46, floor - th * 0.4, x - tw * 0.42, floor);
  ctx.lineTo(x - tw * 0.3, floor);
  ctx.quadraticCurveTo(x - tw * 0.3, floor - th * 0.4, x - tw * 0.28, top + 8);
  ctx.moveTo(x + tw * 0.38, top + 8);
  ctx.quadraticCurveTo(x + tw * 0.46, floor - th * 0.4, x + tw * 0.42, floor);
  ctx.lineTo(x + tw * 0.3, floor);
  ctx.quadraticCurveTo(x + tw * 0.3, floor - th * 0.4, x + tw * 0.28, top + 8);
  outline(ctx, "#f3a6b8");
  roundRect(ctx, x - tw / 2, top, tw, 14, 7);
  outline(ctx, "#e8c89a", 2.6);

  // Pearl bowl
  ctx.beginPath();
  ctx.ellipse(x + tw * 0.22, top - 6, tw * 0.15, 10, 0, 0, Math.PI);
  outline(ctx, "#f7d6cb");
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.arc(x + tw * (0.14 + i * 0.08), top - 12 - (i === 1 ? 5 : 0), 5, 0, Math.PI * 2);
    outline(ctx, "#f4f4f4", 1.6);
  }

  // Jellyfish lamp with a pulsing glow
  const lx = x - tw * 0.2;
  const ly = top - 52;
  const pulse = 0.85 + Math.sin(t / 600) * 0.15;
  const g = ctx.createRadialGradient(lx, ly, 4, lx, ly, 110 * pulse);
  g.addColorStop(0, "rgba(255,236,150,0.55)");
  g.addColorStop(1, "rgba(255,236,150,0)");
  ctx.fillStyle = g;
  ctx.fillRect(lx - 120, ly - 120, 240, 240);
  ctx.beginPath();
  ctx.moveTo(lx, ly + 18);
  ctx.lineTo(lx, top);
  outline(ctx, null, 3);
  ctx.beginPath();
  ctx.moveTo(lx - 22, ly + 16);
  ctx.quadraticCurveTo(lx - 24, ly - 26, lx, ly - 26);
  ctx.quadraticCurveTo(lx + 24, ly - 26, lx + 22, ly + 16);
  ctx.quadraticCurveTo(lx, ly + 8, lx - 22, ly + 16);
  outline(ctx, "#fff0a8");
  ctx.beginPath();
  for (const dx of [-12, 0, 12]) {
    ctx.moveTo(lx + dx, ly + 14);
    ctx.quadraticCurveTo(lx + dx + 4, ly + 24, lx + dx - 2, ly + 32);
  }
  outline(ctx, null, 1.8);
  ctx.beginPath();
  ctx.moveTo(lx - tw * 0.1, top);
  ctx.lineTo(lx + tw * 0.1, top);
  outline(ctx, null, 4);
}

export function drawFurniture(ctx, w, h, floor, sprites, t, drawOutside) {
  drawWindow(ctx, w, h, drawOutside);

  const fw = Math.min(70, w * 0.085);
  drawFrame(ctx, sprites.queen, w * 0.1, h * 0.26, fw, -0.05);
  drawFrame(ctx, sprites.jellyking, w * 0.2, h * 0.32, fw * 0.95, 0.04);
  drawFrame(ctx, sprites.fish, w * 0.15, h * 0.46, fw * 0.7, 0.03);

  drawTV(ctx, sprites, w * 0.82, h * 0.3, Math.min(170, w * 0.17), t);
  drawTable(ctx, w * 0.5, floor, Math.min(150, w * 0.16), h * 0.17, t);
}
