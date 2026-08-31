const fs = require("fs");
const path = require("path");

// Simple PNG generator for solid color icons with "M" letter
// Creates 192x192 and 512x512 PNG icons

function createPNG(size) {
  // Minimal PNG: solid blue background
  // Using a simple approach - create a valid PNG with solid color
  const width = size;
  const height = size;

  // PNG signature
  const sig = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  // IHDR chunk
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(width, 0);
  ihdr.writeUInt32BE(height, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 2; // color type (RGB)
  ihdr[10] = 0; // compression
  ihdr[11] = 0; // filter
  ihdr[12] = 0; // interlace

  // Create raw image data (blue background: #2563eb)
  const rawData = Buffer.alloc(height * (1 + width * 3));
  for (let y = 0; y < height; y++) {
    const offset = y * (1 + width * 3);
    rawData[offset] = 0; // filter byte
    for (let x = 0; x < width; x++) {
      const px = offset + 1 + x * 3;
      rawData[px] = 0x25; // R
      rawData[px + 1] = 0x63; // G
      rawData[px + 2] = 0xeb; // B
    }
  }

  // Compress with zlib
  const zlib = require("zlib");
  const compressed = zlib.deflateSync(rawData);

  // Build chunks
  function makeChunk(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, "ascii");
    const crc = Buffer.alloc(4);
    const crcVal = require("zlib").crc32
      ? require("zlib").crc32(Buffer.concat([typeBuf, data]))
      : 0;
    crc.writeUInt32BE(crcVal >>> 0, 0);
    return Buffer.concat([len, typeBuf, data, crc]);
  }

  // Calculate CRC32 manually
  function crc32(buf) {
    let crc = 0xffffffff;
    for (let i = 0; i < buf.length; i++) {
      crc = crc ^ buf[i];
      for (let j = 0; j < 8; j++) {
        crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
      }
    }
    return (crc ^ 0xffffffff) >>> 0;
  }

  function makeChunkWithCRC(type, data) {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length, 0);
    const typeBuf = Buffer.from(type, "ascii");
    const crcVal = crc32(Buffer.concat([typeBuf, data]));
    const crc = Buffer.alloc(4);
    crc.writeUInt32BE(crcVal, 0);
    return Buffer.concat([len, typeBuf, data, crc]);
  }

  const ihdrChunk = makeChunkWithCRC("IHDR", ihdr);
  const idatChunk = makeChunkWithCRC("IDAT", compressed);
  const iendChunk = makeChunkWithCRC("IEND", Buffer.alloc(0));

  return Buffer.concat([sig, ihdrChunk, idatChunk, iendChunk]);
}

const iconsDir = path.join(__dirname, "..", "public", "icons");

fs.writeFileSync(path.join(iconsDir, "icon-192.png"), createPNG(192));
fs.writeFileSync(path.join(iconsDir, "icon-512.png"), createPNG(512));

console.log("Icons generated: icon-192.png, icon-512.png");
