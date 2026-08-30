import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";

// RFC 9116은 Expires가 지난 security.txt를 무효로 본다. 만료는 조용히 오므로
// 파일이 살아있는지가 아니라 날짜가 미래인지를 테스트가 지킨다.
const text = readFileSync(join(process.cwd(), "public/.well-known/security.txt"), "utf8");

describe("security.txt", () => {
  it("has at least one Contact field", () => {
    expect(text.match(/^Contact: \S+/gm)?.length).toBeGreaterThan(0);
  });

  it("has an Expires date that is still in the future", () => {
    const raw = text.match(/^Expires: (\S+)$/m)?.[1];
    expect(raw).toBeDefined();
    expect(Date.parse(raw!)).toBeGreaterThan(Date.now());
  });

  it("declares the canonical URL it is served from", () => {
    expect(text).toContain("Canonical: https://bug-shot.com/.well-known/security.txt");
  });
});
