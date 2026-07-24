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

    expect(markup).toContain("무료버스 시간표");
    expect(markup).toContain("운행 중");
    expect(markup).toContain("천안");
    expect(markup).toContain("공주");
    expect(markup).toContain("07:40");
    expect(markup).toContain("08:40");
    expect(markup).toContain("공식 시간표 확인");
  });

  it("renders circulation stops and times as an accessible timetable", () => {
    const markup = renderToStaticMarkup(
      <ShuttleCard
        data={{
          type: "shuttle",
          view: "circulation",
          status: "운행 중",
          selectedGroup: "cheonan",
          groups: [
            {
              id: "cheonan",
              label: "천안 시내",
              tables: [
                {
                  name: "천안캠퍼스↔시내 순환(등교시)",
                  columns: [
                    "천안캠퍼스",
                    "시외버스터미널(백제약국앞)",
                    "두정역(공단육교승강장)",
                    "천안캠퍼스",
                  ],
                  rows: [
                    {
                      id: 1,
                      times: ["08:00", "08:10", "08:15", "08:20"],
                    },
                  ],
                },
              ],
            },
          ],
          sourceUrl: "https://example.com/circulation",
        }}
        onBackToMain={() => {}}
      />,
    );

    expect(markup).toContain("순환버스 시간표");
    expect(markup).toContain("천안 시내");
    expect(markup).toContain("등교 순환");
    expect(markup).toContain("시외버스터미널");
    expect(markup).toContain("08:20");
  });
});
