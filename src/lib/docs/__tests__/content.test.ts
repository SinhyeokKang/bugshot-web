import { describe, it, expect } from "vitest";
import { intersectSlugs } from "../content";

// regression: sitemap이 ko slug만 열거해 en/ko 양쪽 URL을 emit → 한쪽에만 있는
// 문서가 생기면 sitemap이 404를 가리킨다. 모든 locale에 공통인 slug만 남겨야 한다.
describe("intersectSlugs", () => {
  it("keeps only slugs present in every locale", () => {
    expect(
      intersectSlugs([["a"], ["b"], ["c"]], [["a"], ["c"]])
    ).toEqual([["a"], ["c"]]);
  });

  it("treats root ([]) as a normal common slug", () => {
    expect(intersectSlugs([[], ["x"]], [[], ["y"]])).toEqual([[]]);
  });

  it("matches on full path, not prefix", () => {
    expect(
      intersectSlugs([["a", "b"]], [["a"], ["a", "b"]])
    ).toEqual([["a", "b"]]);
  });
});
