// Hand-drawn (pencil + crayon) sprites as standalone SVG images.
// Every SVG carries its own filters so it renders identically as an <img> or on a canvas.

const DEFS = `<defs>
  <filter id="wobble" x="-5%" y="-5%" width="110%" height="110%">
    <feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="3" result="n"/>
    <feDisplacementMap in="SourceGraphic" in2="n" scale="3.5"/>
  </filter>
  <filter id="crayon" x="-5%" y="-5%" width="110%" height="110%">
    <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="2" result="g"/>
    <feColorMatrix in="g" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 -2.2 1.5" result="mask"/>
    <feComposite in="SourceGraphic" in2="mask" operator="in"/>
  </filter>
</defs>`;

const MERMAID = `<g filter="url(#wobble)" stroke="#444" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round">
  <path d="M10 14 Q34 30 58 52 Q34 82 8 96 Q26 56 10 14Z" fill="#5f9a9a" fill-opacity=".8"/>
  <path d="M54 52 Q90 30 126 46 L126 66 Q90 84 54 52Z" fill="#e8d84a" filter="url(#crayon)"/>
  <path d="M54 52 Q90 30 126 46 L126 66 Q90 84 54 52Z" fill="none"/>
  <path d="M80 44 q8 10 0 24 M98 41 q8 12 0 28 M116 44 q6 8 0 18" fill="none" stroke="#c98a2b" stroke-width="2"/>
  <path d="M124 46 Q146 38 160 44 L160 64 Q146 70 124 66Z" fill="#f6e2c9"/>
  <path d="M128 50 q10 2 14 -2 q8 6 0 14 q-8 2 -14 -2Z" fill="#8a5fb0" fill-opacity=".85"/>
  <path d="M180 30 Q150 24 118 38 Q104 44 92 40 Q108 54 126 52 Q104 62 96 72 Q130 70 156 56 Q168 50 176 44Z" fill="#d93a2e" fill-opacity=".9"/>
  <path d="M170 34 Q142 34 112 44 M168 42 Q142 48 118 56 M166 48 Q146 56 112 66" fill="none" stroke="#8f1f18" stroke-width="1.5"/>
  <circle cx="178" cy="44" r="19" fill="#f6e2c9"/>
  <path d="M160 42 Q166 22 186 24 Q198 28 197 44 Q180 34 160 42Z" fill="#d93a2e" fill-opacity=".9"/>
  <circle cx="186" cy="42" r="2.4" fill="#222" stroke="none"/>
  <path d="M184 54 Q190 58 196 53" fill="none" stroke="#c0392b"/>
  <path d="M150 58 Q164 66 176 70" fill="none"/>
</g>`;

const SHELL = `<g filter="url(#wobble)" stroke="#c0503c" stroke-width="2.6" fill="none" stroke-linecap="round" stroke-linejoin="round">
  <path d="M40 190 Q10 120 50 90 Q50 40 100 52 Q130 4 170 34 Q230 10 250 70 Q290 110 250 190 Q276 250 230 300 L70 300 Q20 250 40 190Z" fill="#f7d6cb" fill-opacity=".5"/>
  <path d="M150 300 L150 60 M110 300 L92 80 M190 300 L208 80 M70 292 L56 130 M230 292 L246 130"/>
</g>`;

const CROWN = `<g filter="url(#wobble)" stroke="#c0503c" stroke-width="2.2" fill="#f0d34a" fill-opacity=".85">
  <path d="M0 22 l6 -22 l12 12 l10 -16 l10 16 l12 -12 l6 22Z"/>
</g>`;

const JELLYKING = `<g filter="url(#wobble)" stroke="#555" stroke-width="2.2" stroke-linecap="round" fill="none">
  <path d="M30 22 l4 -16 l10 10 l8 -14 l8 14 l10 -10 l4 16Z" fill="#f0d34a"/>
  <path d="M14 66 Q14 22 52 22 Q90 22 90 66 Q52 56 14 66Z" fill="#f3f3f3"/>
  <path d="M24 66 q-6 30 -2 62 M42 62 q-6 30 0 70 M62 62 q6 30 2 68 M80 66 q6 26 0 58"/>
  <circle cx="38" cy="44" r="2.6" fill="#333"/><circle cx="62" cy="44" r="2.6" fill="#333"/>
  <path d="M40 54 q10 8 20 0"/>
</g>`;

const FISH = `<g filter="url(#wobble)" stroke="#555" stroke-width="2" fill="#f0b8a0">
  <path d="M6 20 L24 6 Q50 2 62 20 Q50 38 24 34Z"/><path d="M6 20 L-8 6 L-8 34Z" fill="#eee"/><circle cx="48" cy="17" r="2.5" fill="#333"/>
</g>`;

const PEARL = `<g filter="url(#wobble)" stroke="#555" stroke-width="2" fill="#f4f4f4">
  <circle cx="20" cy="20" r="16"/><path d="M20 10 l3 7 7 1 -5 5 1 7 -6 -4 -6 4 1 -7 -5 -5 7 -1Z" fill="none" stroke-width="1.5"/>
</g>`;

const CORAL = `<g filter="url(#wobble)" stroke="#8a2a55" stroke-width="2" stroke-linejoin="round">
  <path d="M34 300 Q22 150 38 6 Q52 140 50 300Z" fill="#c4235f" filter="url(#crayon)"/>
  <path d="M30 240 L4 214 L28 206Z M52 200 L78 170 L50 168Z M30 150 L2 120 L32 116Z M50 110 L76 82 L48 80Z M32 70 L10 44 L34 40Z" fill="#f3a6b8" filter="url(#crayon)"/>
  <path d="M34 300 Q22 150 38 6 Q52 140 50 300" fill="none"/>
</g>`;

const WEEDS = `<path filter="url(#wobble)" stroke="#777" stroke-width="2.2" fill="none" stroke-linecap="round"
  d="M10 90 L18 20 L26 90 M40 90 L48 8 L56 90 M72 90 L78 30 L88 90 M104 90 L112 14 L120 90 M140 90 L146 36 L156 90 M176 90 L184 10 L194 90 M214 90 L220 40 L230 90 M250 90 L258 16 L266 90 M290 90 L296 34 L306 90 M330 90 L338 12 L348 90 M370 90 L376 38 L386 90"/>`;

// name -> [viewBox, rendered pixel size (2x for crispness), inner markup]
const SPRITES = {
  mermaid: ["-10 -10 240 130", 480, 260, MERMAID],
  queen: ["0 0 300 330", 600, 660, `${SHELL}<g transform="translate(26 112) scale(1.15)">${MERMAID}</g><g transform="translate(206 116)">${CROWN}</g>`],
  jellyking: ["-10 -10 120 160", 240, 320, JELLYKING],
  fish: ["-14 -4 90 48", 180, 96, FISH],
  pearl: ["-4 -4 48 48", 96, 96, PEARL],
  coral: ["-4 0 88 304", 176, 608, CORAL],
  weeds: ["0 0 400 100", 800, 200, WEEDS],
};

export function spriteUrl(name) {
  const [viewBox, w, h, inner] = SPRITES[name];
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" width="${w}" height="${h}">${DEFS}${inner}</svg>`;
  return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`;
}

export function loadSprites() {
  return Promise.all(
    Object.keys(SPRITES).map(
      (name) =>
        new Promise((resolve, reject) => {
          const img = new Image();
          img.onload = () => resolve([name, img]);
          img.onerror = () => reject(new Error(`sprite failed: ${name}`));
          img.src = spriteUrl(name);
        }),
    ),
  ).then(Object.fromEntries);
}
