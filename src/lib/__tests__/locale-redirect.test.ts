import { describe, it, expect } from "vitest";
// 대상: 미구현. LocaleSwitcher의 경로 계산 로직을 순수 함수로 추출.
// usePathname()(next/navigation)이 주는 실제 브라우저 경로(bare 또는 prefixed)를
// 받아, 목적 locale로 전환할 href를 반환한다.
import { localeSwitchHref } from "../locale-redirect";

describe("localeSwitchHref", () => {
  // 정상: locale prefix가 붙은 경로 (기존 동작)
  it("prefixed 경로의 locale을 교체한다", () => {
    expect(localeSwitchHref("/ko/docs/x", "en")).toBe("/en/docs/x");
    expect(localeSwitchHref("/en/privacy", "ko")).toBe("/ko/privacy");
  });

  // regression: bare 비루트 경로 — 기존 `/^\/[a-z]{2}/`가 콘텐츠 앞 2글자를
  // 잘라먹어 /enivacy(404)를 만들던 버그. prefix 없으면 그대로 앞에 붙여야 한다.
  it("bare 비루트 경로를 잘라먹지 않는다", () => {
    expect(localeSwitchHref("/privacy", "en")).toBe("/en/privacy");
    expect(localeSwitchHref("/docs/quick-start", "en")).toBe(
      "/en/docs/quick-start"
    );
  });

  // 엣지: 루트 — 트레일링 슬래시 없이 /{locale}
  it("bare 루트는 /{locale}로만 전환한다", () => {
    expect(localeSwitchHref("/", "en")).toBe("/en");
    expect(localeSwitchHref("/", "ko")).toBe("/ko");
  });

  // 엣지: prefix만 있고 하위 경로 없음
  it("prefix만 있는 경로는 /{locale}로 전환한다", () => {
    expect(localeSwitchHref("/ko", "en")).toBe("/en");
    expect(localeSwitchHref("/en", "ko")).toBe("/ko");
  });

  // 엣지: en/ko로 시작하나 로케일 세그먼트가 아닌 콘텐츠 경로.
  // lookahead가 없던 옛 `/^\/[a-z]{2}/`는 여기서도 앞 2글자를 잘라먹었다.
  it("en/ko로 시작하는 콘텐츠 경로를 로케일로 오인하지 않는다", () => {
    expect(localeSwitchHref("/enterprise", "en")).toBe("/en/enterprise");
    expect(localeSwitchHref("/koala", "en")).toBe("/en/koala");
  });
});
