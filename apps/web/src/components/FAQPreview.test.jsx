import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import FAQPreview, { FAQ_LIST, filterFAQs } from "./FAQPreview";

describe("FAQPreview", () => {
  it("shows all preview questions before the user starts typing", () => {
    const markup = renderToStaticMarkup(
      <FAQPreview searchTerm="" onSelect={() => {}} onClose={() => {}} />,
    );

    expect(markup).toContain("이런 질문은 어떠세요?");
    FAQ_LIST.forEach(({ question }) => expect(markup).toContain(question));
  });

  it("filters questions with related keywords", () => {
    expect(filterFAQs("버스").map(({ question }) => question)).toEqual([
      "순환버스 시간표 알려줘",
    ]);
    expect(filterFAQs("밥").map(({ question }) => question)).toEqual([
      "오늘 식단 알려줘",
    ]);
  });
});
