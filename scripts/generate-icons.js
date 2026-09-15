import fs from 'fs';
import zlib from 'zlib';
import path from 'path';

// Minimal CRC32 table
const crcTable = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let c = i;
  for (let k = 0; k < 8; k++) {
    c = (c & 1) ? (0xEDB88320 ^ (c >>> 1)) : (c >>> 1);
  }
  crcTable[i] = c;
}

function crc32(buf) {
  let crc = 0xFFFFFFFF;
  for (let i = 0; i < buf.length; i++) {
    crc = crcTable[(crc ^ buf[i]) & 0xFF] ^ (crc >>> 8);
  }
  return (crc ^ 0xFFFFFFFF) >>> 0;
}

function writeChunk(type, data) {
  const len = data.length;
  const buf = Buffer.alloc(12 + len);
  buf.writeUInt32BE(len, 0);
  buf.write(type, 4, 4, 'ascii');
  data.copy(buf, 8);
  const typeAndData = buf.subarray(4, 8 + len);
  buf.writeUInt32BE(crc32(typeAndData), 8 + len);
  return buf;
}

function createPNG(width, height, drawPixelFn) {
  const signature = Buffer.from([0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A]);

  // IHDR
  const ihdrData = Buffer.alloc(13);
  ihdrData.writeUInt32BE(width, 0);
  ihdrData.writeUInt32BE(height, 4);
  ihdrData[8] = 8; // 8 bits per channel
  ihdrData[9] = 6; // RGBA
  ihdrData[10] = 0; // compression
  ihdrData[11] = 0; // filter
  ihdrData[12] = 0; // interlace
  const ihdrChunk = writeChunk('IHDR', ihdrData);

  // Scanlines with filter byte 0
  const rawData = Buffer.alloc(height * (1 + width * 4));
  let offset = 0;
  for (let y = 0; y < height; y++) {
    rawData[offset++] = 0; // filter: none
    for (let x = 0; x < width; x++) {
      const [r, g, b, a] = drawPixelFn(x, y, width, height);
      rawData[offset++] = r;
      rawData[offset++] = g;
      rawData[offset++] = b;
      rawData[offset++] = a;
    }
  }

  const compressedData = zlib.deflateSync(rawData);
  const idatChunk = writeChunk('IDAT', compressedData);
  const iendChunk = writeChunk('IEND', Buffer.alloc(0));

  return Buffer.concat([signature, ihdrChunk, idatChunk, iendChunk]);
}

// Generate icon generator
function renderLibraryIcon(isMaskable) {
  return (x, y, w, h) => {
    const nx = x / w;
    const ny = y / h;

    // Dark slate background: #0f172a = [15, 23, 42]
    // If not maskable, round corners with radius = 0.22
    if (!isMaskable) {
      const r = 0.22;
      const dx = Math.max(0, Math.abs(nx - 0.5) - (0.5 - r));
      const dy = Math.max(0, Math.abs(ny - 0.5) - (0.5 - r));
      if (Math.hypot(dx, dy) > r) {
        return [0, 0, 0, 0]; // transparent
      }
    }

    // Background slate #0f172a
    let r = 15, g = 23, b = 42, a = 255;

    // Gradient accent on top
    if (ny < 0.3) {
      const factor = (0.3 - ny) / 0.3;
      r = Math.round(r + (30 - r) * factor);
      g = Math.round(g + (41 - g) * factor);
      b = Math.round(b + (69 - b) * factor);
    }

    // Scale coordinates to safe zone (0.18 to 0.82)
    const cx = (nx - 0.5) / 0.7 + 0.5;
    const cy = (ny - 0.5) / 0.7 + 0.5;

    // Draw desk bar: cx in [0.22, 0.78], cy in [0.55, 0.60] -> Blue #2563eb / #38bdf8
    if (cx >= 0.22 && cx <= 0.78 && cy >= 0.55 && cy <= 0.60) {
      return [56, 189, 248, 255]; // Sky blue #38bdf8
    }

    // Desk legs: cx in [0.28, 0.32] or [0.68, 0.72], cy in [0.60, 0.82]
    if (((cx >= 0.28 && cx <= 0.32) || (cx >= 0.68 && cx <= 0.72)) && cy >= 0.60 && cy <= 0.82) {
      return [148, 163, 184, 255]; // Slate 400
    }

    // Lamp pole: cx in [0.32, 0.35], cy in [0.32, 0.55]
    if (cx >= 0.32 && cx <= 0.35 && cy >= 0.32 && cy <= 0.55) {
      return [248, 250, 252, 255];
    }
    // Lamp top arm: cy in [0.29, 0.32], cx in [0.32, 0.50]
    if (cx >= 0.32 && cx <= 0.50 && cy >= 0.29 && cy <= 0.32) {
      return [248, 250, 252, 255];
    }
    // Lamp shade: triangle/cone around cx 0.50, cy in [0.25, 0.36]
    if (cy >= 0.26 && cy <= 0.36 && Math.abs(cx - 0.52) <= (cy - 0.26) * 0.9) {
      return [56, 189, 248, 255];
    }

    // Study chair: seat circle at cx 0.60, cy 0.44 (head/backrest)
    const headDist = Math.hypot(cx - 0.60, cy - 0.44);
    if (headDist <= 0.055) {
      return [248, 250, 252, 255];
    }
    // Chair back: cx in [0.55, 0.65], cy in [0.51, 0.68]
    if (cx >= 0.57 && cx <= 0.63 && cy >= 0.51 && cy <= 0.66) {
      return [248, 250, 252, 255];
    }

    return [r, g, b, a];
  };
}

const publicDir = path.resolve('public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

// 1. 192x192 PNG (standard)
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), createPNG(192, 192, renderLibraryIcon(false)));

// 2. 512x512 PNG (standard)
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), createPNG(512, 512, renderLibraryIcon(false)));

// 3. 512x512 Maskable PNG (full bleed background with 15% safe margin)
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), createPNG(512, 512, renderLibraryIcon(true)));

// 4. apple-touch-icon 180x180 PNG
fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), createPNG(180, 180, renderLibraryIcon(false)));

// 5. favicon-32x32 PNG
fs.writeFileSync(path.join(publicDir, 'favicon-32x32.png'), createPNG(32, 32, renderLibraryIcon(false)));

console.log('All PWA PNG icons successfully generated in public/ !');
