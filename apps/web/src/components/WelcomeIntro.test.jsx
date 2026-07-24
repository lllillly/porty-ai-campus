import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import WelcomeIntro from "./WelcomeIntro";

describe("WelcomeIntro", () => {
  it("introduces PORTY and renders the main campus actions", () => {
    const markup = renderToStaticMarkup(
      <WelcomeIntro
        onActionClick={() => {}}
        onDietSetup={() => {}}
        hasDietSettings={false}
        isDark={false}
      />,
    );

    expect(markup).toContain(
      "안녕하세요, 국립공주대학교 챗봇 포티입니다.",
    );
    expect(markup).toContain("학사일정");
    expect(markup).toContain("순환버스");
    expect(markup).not.toContain("오늘 학교에서 뭐가 필요하세요?");
  });
});
