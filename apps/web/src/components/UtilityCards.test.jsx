import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import CampusMap from "./CampusMap";
import CourseRegist from "./CourseRegist";
import DietSettingsModal from "./DietSettingsModal";

describe("utility cards", () => {
  it("shows every campus address with an external map link", () => {
    const markup = renderToStaticMarkup(
      <CampusMap onBackToMain={() => {}} />,
    );

    expect(markup).toContain("공주시 공주대학로 56");
    expect(markup).toContain("천안시 서북구 천안대로 1223-24");
    expect(markup).toContain("예산군 예산읍 대학로 54");
    expect(markup).toContain('rel="noreferrer"');
  });

  it("uses a regular external link for course registration", () => {
    const markup = renderToStaticMarkup(
      <CourseRegist onBackToMain={() => {}} />,
    );

    expect(markup).toContain("수강신청 매뉴얼");
    expect(markup).toContain('href="https://sugang.kongju.ac.kr/"');
    expect(markup).toContain('target="_blank"');
  });

  it("renders the default diet settings", () => {
    const markup = renderToStaticMarkup(
      <DietSettingsModal
        onClose={() => {}}
        onSave={() => {}}
        onDelete={() => {}}
      />,
    );

    expect(markup).toContain("식단표 설정");
    expect(markup).toContain("공주");
    expect(markup).toContain("기숙사 선택");
  });
});
