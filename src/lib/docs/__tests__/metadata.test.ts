import { describe, it, expect } from "vitest";
import { docPageMetadata } from "../metadata";

// regression: SEO 기준선이 ko→en으로 바뀌었는데 docPageMetadata의 x-default가
// /ko로 남아 랜딩(x-default=/en)과 모순됐던 잔재. 사이트 전역 x-default는 en.
describe("docPageMetadata hreflang", () => {
  const md = docPageMetadata({
    title: "T",
    description: "D",
    locale: "en",
    path: "/privacy",
  });
  const languages = md.alternates?.languages ?? {};

  it("x-default는 en 버전을 가리킨다", () => {
    expect(languages["x-default"]).toBe("https://bug-shot.com/en/privacy");
  });

  it("ko/en 대체 URL은 각 로케일 경로를 유지한다", () => {
    expect(languages["ko"]).toBe("https://bug-shot.com/ko/privacy");
    expect(languages["en"]).toBe("https://bug-shot.com/en/privacy");
  });

  it("canonical은 현재 locale 경로다", () => {
    expect(md.alternates?.canonical).toBe("https://bug-shot.com/en/privacy");
  });
});
