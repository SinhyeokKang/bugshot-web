import { describe, it, expect } from "vitest";
// The build-time JPEG dimension reader (guide assets are all .jpg). Lives in a
// build-script lib but is pure, so it's unit-tested here.
import { jpegSize } from "../../../../scripts/lib/image-size.mjs";

// Build a minimal JPEG: SOI + optional segments + SOF0 carrying height/width.
function jpeg(...segments: number[][]): Buffer {
  return Buffer.from([0xff, 0xd8, ...segments.flat()]);
}
// SOF0 marker: FF C0, length 0x0011, precision 08, height(2B), width(2B), rest.
function sof0(width: number, height: number): number[] {
  return [
    0xff, 0xc0, 0x00, 0x11, 0x08,
    (height >> 8) & 0xff, height & 0xff,
    (width >> 8) & 0xff, width & 0xff,
    0x03, 0x01, 0x22, 0x00, 0x02, 0x11, 0x01, 0x03, 0x11, 0x01,
  ];
}
// A generic segment (e.g. APP0) that must be skipped by its length.
function segment(marker: number, payload: number[]): number[] {
  const len = payload.length + 2;
  return [0xff, marker, (len >> 8) & 0xff, len & 0xff, ...payload];
}

describe("jpegSize", () => {
  it("reads width/height from the SOF0 marker", () => {
    expect(jpegSize(jpeg(sof0(600, 300)))).toEqual({ width: 600, height: 300 });
  });

  it("skips preceding segments (APP0/EXIF) to find SOF", () => {
    const buf = jpeg(
      segment(0xe0, [0x4a, 0x46, 0x49, 0x46, 0x00]), // APP0 "JFIF"
      segment(0xdb, [0x00, 0x01, 0x02, 0x03]), // DQT
      sof0(1280, 720)
    );
    expect(jpegSize(buf)).toEqual({ width: 1280, height: 720 });
  });

  it("returns null for a non-JPEG buffer", () => {
    expect(jpegSize(Buffer.from([0x89, 0x50, 0x4e, 0x47]))).toBeNull();
  });
});
