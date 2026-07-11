import { describe, it, expect } from "vitest";
import { ogLocale } from "../og-locale";

// OG locale은 language_TERRITORY 형식이라야 US 지역 신호가 정확하다. next-intl
// 코드("en"/"ko")를 그대로 넘기면 비표준.
describe("ogLocale", () => {
  it("maps next-intl locales to OpenGraph language_TERRITORY", () => {
    expect(ogLocale("en")).toBe("en_US");
    expect(ogLocale("ko")).toBe("ko_KR");
  });

  it("passes through unknown locales unchanged", () => {
    expect(ogLocale("xx")).toBe("xx");
  });
});
