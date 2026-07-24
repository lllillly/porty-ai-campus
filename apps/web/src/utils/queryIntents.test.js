import { describe, expect, it } from "vitest";

import { isAcademicCalendarQuery } from "./queryIntents";


describe("isAcademicCalendarQuery", () => {
  it.each([
    "학사 일정",
    "이번 달 학사일정 알려줘",
    "개강 언제야?",
    "중간고사 기간이 언제인가요?",
    "기말고사 일정",
    "이번 학기 종강 날짜 알려주세요",
    "수강신청 기간이 언제예요?",
    "이번 달 일정 보여줘",
  ])("routes %s to the calendar", (question) => {
    expect(isAcademicCalendarQuery(question)).toBe(true);
  });

  it.each([
    "수강신청은 어떻게 하나요?",
    "휴학 신청 방법 알려주세요",
    "도서관 운영시간 알려주세요",
  ])("does not route %s to the calendar", (question) => {
    expect(isAcademicCalendarQuery(question)).toBe(false);
  });
});
