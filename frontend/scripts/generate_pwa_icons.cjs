/**
 * Generates valid, crisp PWA PNG & SVG icon assets for SchemeSetu
 * using pure Node.js (zlib + crc32 + PNG chunk encoding).
 */

const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

// CRC32 implementation for standard PNG chunks
function createCrcTable() {
  const table = new Uint32Array(256);
  for (let n = 0; n < 256; n++) {
    let c = n;
    for (let k = 0; k < 8; k++) {
      if (c & 1) c = 0xedb88320 ^ (c >>> 1);
      else c = c >>> 1;
    }
    table[n] = c;
  }
  return table;
}

const crcTable = createCrcTable();
function crc32(buf) {
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xff] ^ (crc >>> 8);
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function makeChunk(type, data) {
  const typeBuf = Buffer.from(type, 'ascii');
  const lenBuf = Buffer.alloc(4);
  lenBuf.writeUInt32BE(data.length, 0);

  const toCrc = Buffer.concat([typeBuf, data]);
  const crcVal = crc32(toCrc);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crcVal, 0);

  return Buffer.concat([lenBuf, typeBuf, data, crcBuf]);
}

function createPNG(width, height, drawPixelFn) {
  // PNG Signature: 89 50 4E 47 0D 0A 1A 0A
  const signature = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // 8-bit depth
  ihdr[9] = 6; // RGBA color type
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace
  const ihdrChunk = makeChunk('IHDR', ihdr);

  // Scanlines with filter byte 0 (None)
  const rawScanlines = Buffer.alloc(height * (width * 4 + 1));
  let offset = 0;

  for (let y = 0; y < height; y++) {
    rawScanlines[offset++] = 0; // Filter byte: 0
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = drawPixelFn(x, y, width, height);
      rawScanlines[offset++] = r;
      rawScanlines[offset++] = g;
      rawScanlines[offset++] = b;
      rawScanlines[offset++] = a;
    }
  }

  const compressedData = zlib.deflateSync(rawScanlines, { level: 9 });
  const idatChunk = makeChunk('IDAT', compressedData);
  const iendChunk = makeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// SchemeSetu Icon Renderer: Navy gradient background + Gold emblem 'S' & Bridge arch + Saffron/Green tricolor dots
function drawSchemeSetuIcon(x, y, w, h, isMaskable = false) {
  const cx = w / 2;
  const cy = h / 2;
  const dx = x - cx;
  const dy = y - cy;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const radius = w * 0.46;

  // Background: Deep Navy gradient (#0B192C -> #1E3E62)
  const gradRatio = (y / h);
  let bgR = Math.round(11 + (30 - 11) * gradRatio);
  let bgG = Math.round(25 + (62 - 25) * gradRatio);
  let bgB = Math.round(44 + (98 - 44) * gradRatio);
  let bgA = 255;

  if (!isMaskable && dist > radius) {
    // Smooth rounded icon border
    if (dist > radius + 1.5) {
      return [0, 0, 0, 0];
    } else {
      bgA = Math.max(0, Math.round((radius + 1.5 - dist) * 255));
    }
  }

  // Gold Ring border
  const ringInner = radius * 0.88;
  const ringOuter = radius * 0.96;
  if (!isMaskable && dist >= ringInner && dist <= ringOuter) {
    return [217, 119, 6, 255]; // Gold #D97706
  }

  // Bridge Arch / Setu (Curved arc in lower half: y from 0.48h to 0.72h)
  const nx = (x - cx) / (w * 0.35); // -1 to 1
  const archY = cy + (w * 0.18) + (nx * nx * (w * 0.12));
  if (Math.abs(y - archY) < w * 0.04 && Math.abs(nx) <= 0.85) {
    return [245, 158, 11, 255]; // Amber/Gold #F59E0B
  }

  // Pillar Supports for Bridge (3 vertical lines)
  if (y > archY && y < cy + w * 0.28) {
    if (Math.abs(x - cx) < w * 0.02 || Math.abs(x - (cx - w * 0.22)) < w * 0.015 || Math.abs(x - (cx + w * 0.22)) < w * 0.015) {
      return [217, 119, 6, 230];
    }
  }

  // Central Emblem Letter "S" (Schemes / Setu) in upper/middle region
  // S top curve
  const sTopCy = cy - w * 0.12;
  const sDistTop = Math.sqrt((x - cx) * (x - cx) + (y - sTopCy) * (y - sTopCy));
  if (sDistTop >= w * 0.08 && sDistTop <= w * 0.16 && y < sTopCy + w * 0.04 && x <= cx + w * 0.14) {
    return [255, 255, 255, 255];
  }

  // S bottom curve
  const sBotCy = cy + w * 0.02;
  const sDistBot = Math.sqrt((x - cx) * (x - cx) + (y - sBotCy) * (y - sBotCy));
  if (sDistBot >= w * 0.08 && sDistBot <= w * 0.16 && y > sBotCy - w * 0.04 && x >= cx - w * 0.14) {
    return [255, 255, 255, 255];
  }

  // S diagonal connecting spine
  const sSpineY = (cy - w * 0.05) + ((x - cx) / (w * 0.12)) * (w * 0.06);
  if (Math.abs(y - sSpineY) < w * 0.035 && Math.abs(x - cx) < w * 0.10) {
    return [255, 255, 255, 255];
  }

  // Tricolor Accent Dots (Saffron top-left, Green top-right)
  const dotSaffronDist = Math.sqrt((x - (cx - w * 0.24)) ** 2 + (y - (cy - w * 0.22)) ** 2);
  if (dotSaffronDist < w * 0.045) {
    return [255, 103, 31, 255]; // Indian Saffron #FF671F
  }

  const dotGreenDist = Math.sqrt((x - (cx + w * 0.24)) ** 2 + (y - (cy - w * 0.22)) ** 2);
  if (dotGreenDist < w * 0.045) {
    return [4, 120, 87, 255]; // India Green #047857
  }

  const dotGoldDist = Math.sqrt((x - cx) ** 2 + (y - (cy - w * 0.28)) ** 2);
  if (dotGoldDist < w * 0.035) {
    return [245, 158, 11, 255]; // Gold Sparkle #F59E0B
  }

  return [bgR, bgG, bgB, bgA];
}

const publicDir = path.resolve(__dirname, '../public');

// 1. Generate icon-192.png
console.log('Generating icon-192.png...');
const icon192 = createPNG(192, 192, (x, y, w, h) => drawSchemeSetuIcon(x, y, w, h, false));
fs.writeFileSync(path.join(publicDir, 'icon-192.png'), icon192);

// 2. Generate icon-512.png
console.log('Generating icon-512.png...');
const icon512 = createPNG(512, 512, (x, y, w, h) => drawSchemeSetuIcon(x, y, w, h, false));
fs.writeFileSync(path.join(publicDir, 'icon-512.png'), icon512);

// 3. Generate icon-maskable-192.png
console.log('Generating icon-maskable-192.png...');
const iconMask192 = createPNG(192, 192, (x, y, w, h) => drawSchemeSetuIcon(x, y, w, h, true));
fs.writeFileSync(path.join(publicDir, 'icon-maskable-192.png'), iconMask192);

// 4. Generate icon-maskable-512.png
console.log('Generating icon-maskable-512.png...');
const iconMask512 = createPNG(512, 512, (x, y, w, h) => drawSchemeSetuIcon(x, y, w, h, true));
fs.writeFileSync(path.join(publicDir, 'icon-maskable-512.png'), iconMask512);

// 5. Generate apple-touch-icon.png (180x180)
console.log('Generating apple-touch-icon.png...');
const appleIcon = createPNG(180, 180, (x, y, w, h) => drawSchemeSetuIcon(x, y, w, h, false));
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), appleIcon);

// 6. Generate favicon.svg (crisp vector icon)
const faviconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" width="100%" height="100%">
  <defs>
    <linearGradient id="navyGrad" x1="0%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="#0B192C"/>
      <stop offset="100%" stop-color="#1E3E62"/>
    </linearGradient>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F59E0B"/>
      <stop offset="100%" stop-color="#D97706"/>
    </linearGradient>
  </defs>
  <!-- Background Circle -->
  <circle cx="256" cy="256" r="240" fill="url(#navyGrad)" stroke="#D97706" stroke-width="12"/>
  
  <!-- Tricolor Accent Stars -->
  <circle cx="150" cy="140" r="18" fill="#FF671F"/>
  <circle cx="362" cy="140" r="18" fill="#047857"/>
  <polygon points="256,90 262,108 280,108 266,118 271,136 256,125 241,136 246,118 232,108 250,108" fill="#F59E0B"/>
  
  <!-- Central 'S' Letter -->
  <path d="M 330 200 C 330 160, 190 150, 190 210 C 190 260, 325 240, 325 300 C 325 360, 180 360, 180 310" 
        fill="none" stroke="#FFFFFF" stroke-width="34" stroke-linecap="round"/>
        
  <!-- Bridge Arch (Setu) -->
  <path d="M 100 370 Q 256 310 412 370" fill="none" stroke="url(#goldGrad)" stroke-width="20" stroke-linecap="round"/>
  <!-- Bridge Vertical Piers -->
  <line x1="160" y1="358" x2="160" y2="400" stroke="#D97706" stroke-width="10" stroke-linecap="round"/>
  <line x1="256" y1="338" x2="256" y2="400" stroke="#D97706" stroke-width="10" stroke-linecap="round"/>
  <line x1="352" y1="358" x2="352" y2="400" stroke="#D97706" stroke-width="10" stroke-linecap="round"/>
</svg>`;
fs.writeFileSync(path.join(publicDir, 'favicon.svg'), faviconSvg);

console.log('✅ All PWA icons generated successfully in public/');
