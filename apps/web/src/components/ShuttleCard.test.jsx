import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import ShuttleCard from "./ShuttleCard";

describe("ShuttleCard", () => {
  it("renders status, route, departure and arrival as a structured card", () => {
    const markup = renderToStaticMarkup(
      <ShuttleCard
        data={{
          type: "shuttle",
          status: "운행 중",
          tone: "active",
          period: "2학기 · 09.01~12.18",
          description: "현재 2학기 무료버스 운행기간입니다.",
          routes: [
            {
              name: "천안→공주",
              stops: ["천안캠퍼스", "두정역", "공주캠퍼스"],
              trips: [{ departure: "07:40", arrival: "08:40" }],
            },
          ],
          notice: "주말에는 운행하지 않습니다.",
          sourceUrl: "https://example.com/shuttle",
        }}
        onBackToMain={() => {}}
      />,
    );

    expect(markup).toContain("무료 셔틀버스");
    expect(markup).toContain("운행 중");
    expect(markup).toContain("천안");
    expect(markup).toContain("공주");
    expect(markup).toContain("07:40");
    expect(markup).toContain("08:40");
    expect(markup).toContain("정류장별 공식 시간표");
  });
});
