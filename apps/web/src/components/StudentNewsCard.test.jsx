import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";

import StudentNewsCard from "./StudentNewsCard";

describe("StudentNewsCard", () => {
  it("renders live news as readable cards with detail actions", () => {
    const onRead = vi.fn();
    const markup = renderToStaticMarkup(
      <StudentNewsCard
        data={{
          type: "student-news",
          view: "list",
          title: "새로 올라온 학생소식",
          sourceUrl: "https://www.kongju.ac.kr/student-news",
          items: [
            {
              title: "2026학년도 학생 프로그램 안내",
              date: "2026.07.24",
              preview: "학생 프로그램 참여자를 모집합니다.",
              url: "https://www.kongju.ac.kr/news/1",
            },
          ],
        }}
        onRead={onRead}
        onBackToMain={() => {}}
      />,
    );

    expect(markup).toContain("새로 올라온 학생소식");
    expect(markup).toContain("2026학년도 학생 프로그램 안내");
    expect(markup).toContain("내용 보기");
    expect(markup).toContain("공식 원문");
    expect(markup).toContain("학생소식 전체 보기");
  });

  it("renders article content, image and attachment in detail mode", () => {
    const markup = renderToStaticMarkup(
      <StudentNewsCard
        data={{
          type: "student-news",
          view: "detail",
          title: "학생소식 자세히 보기",
          sourceUrl: "https://www.kongju.ac.kr/student-news",
          items: [
            {
              title: "학생 프로그램 안내",
              date: "2026.07.24",
              author: "학생복지과",
              content: "신청 기간은 7월 31일까지입니다.",
              url: "https://www.kongju.ac.kr/news/1",
              images: ["https://www.kongju.ac.kr/image/1.jpg"],
              attachments: [
                {
                  name: "신청서.hwp",
                  url: "https://www.kongju.ac.kr/file/1",
                },
              ],
            },
          ],
        }}
        onBackToMain={() => {}}
      />,
    );

    expect(markup).toContain("신청 기간은 7월 31일까지입니다.");
    expect(markup).toContain("학생복지과");
    expect(markup).toContain("공지 이미지");
    expect(markup).toContain("신청서.hwp");
  });
});
