// Minimal JPEG dimension reader — guide assets are all .jpg. Walks the JPEG
// marker segments to the SOF (start-of-frame), which carries height then width.
// Returns { width, height } or null (non-JPEG / malformed).
export function jpegSize(buf) {
  if (buf.length < 4 || buf[0] !== 0xff || buf[1] !== 0xd8) return null;
  let off = 2;
  while (off + 9 < buf.length) {
    if (buf[off] !== 0xff) {
      off++;
      continue;
    }
    let marker = buf[off + 1];
    // collapse fill bytes (0xff 0xff ...)
    while (marker === 0xff && off + 1 < buf.length) {
      off++;
      marker = buf[off + 1];
    }
    // standalone markers with no length payload (SOI/EOI/RSTn/TEM)
    if (
      marker === 0xd8 ||
      marker === 0xd9 ||
      marker === 0x01 ||
      (marker >= 0xd0 && marker <= 0xd7)
    ) {
      off += 2;
      continue;
    }
    const len = buf.readUInt16BE(off + 2);
    // SOF0..15 carry dimensions, except DHT(c4), JPG(c8), DAC(cc)
    if (
      marker >= 0xc0 &&
      marker <= 0xcf &&
      marker !== 0xc4 &&
      marker !== 0xc8 &&
      marker !== 0xcc
    ) {
      const height = buf.readUInt16BE(off + 5);
      const width = buf.readUInt16BE(off + 7);
      return { width, height };
    }
    off += 2 + len;
  }
  return null;
}
