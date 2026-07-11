import { describe, it, expect } from "vitest";
import { stripRichTags } from "../jsonld";

// regression: FAQ 답변을 랜딩 FAQPage JSON-LD에 plain t()로 넣으면 next-intl
// rich 태그(<guide>/<store>)가 리터럴로 새어 structured data answer에 무효
// 마크업이 박혔다. JSON-LD text는 태그를 벗기고 내부 텍스트만 남겨야 한다.
describe("stripRichTags", () => {
  it("removes next-intl rich tags, keeping inner text", () => {
    expect(
      stripRichTags("Install from the <store>Chrome Web Store</store> now.")
    ).toBe("Install from the Chrome Web Store now.");
    expect(stripRichTags("See the <guide>Quick Start guide</guide>.")).toBe(
      "See the Quick Start guide."
    );
  });

  it("leaves tag-free text unchanged", () => {
    expect(stripRichTags("All data is stored locally.")).toBe(
      "All data is stored locally."
    );
  });
});
