import sharp from 'sharp';
import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

const W = 1080;
const H = 1920;

// Baseado no CroopLogo.tsx: viewBox "0 0 400 200", ARC e fontSize
const LOGO_SCALE = (W * 0.90) / 400;
const FONT = Math.round(70 * LOGO_SCALE);
const SDX = Math.round(3 * LOGO_SCALE);
const SDY = Math.round(5 * LOGO_SCALE);
const OX = Math.round((W - W * 0.90) / 2);
const OY = Math.round(H * 0.44 - (200 * LOGO_SCALE) / 2);

const ARC = [
  { x: 60,  y: 107, r: -21, ch: 'C' },
  { x: 130, y: 87,  r: -11, ch: 'R' },
  { x: 200, y: 80,  r:   0, ch: 'O' },
  { x: 270, y: 87,  r:  11, ch: 'O' },
  { x: 340, y: 107, r:  21, ch: 'P' },
];

const letters = ARC.map(({ x, y, r, ch }) => {
  const cx = OX + Math.round(x * LOGO_SCALE);
  const cy = OY + Math.round(y * LOGO_SCALE);
  const scx = OX + Math.round(x * LOGO_SCALE) + SDX;
  const scy = OY + Math.round(y * LOGO_SCALE) + SDY;
  return `
    <text x="${scx}" y="${scy}" fill="#1E331E" font-size="${FONT}" font-weight="bold"
      font-family="Arial, Helvetica, sans-serif" text-anchor="middle"
      transform="rotate(${r}, ${scx}, ${scy})">${ch}</text>
    <text x="${cx}" y="${cy}" fill="#FFFFFF" font-size="${FONT}" font-weight="bold"
      font-family="Arial, Helvetica, sans-serif" text-anchor="middle"
      transform="rotate(${r}, ${cx}, ${cy})">${ch}</text>`;
}).join('');

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <rect width="${W}" height="${H}" fill="#0B1C10"/>
  <rect width="${W}" height="${H}" fill="rgba(0,0,0,0.2)"/>
  ${letters}
</svg>`;

const out = join(__dirname, '..', 'assets', 'splash-icon.png');
await sharp(Buffer.from(svg)).png().toFile(out);
console.log(`Splash gerado: ${out}`);
