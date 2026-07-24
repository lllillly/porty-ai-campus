const compact = (value) => value.toLowerCase().replace(/\s+/g, "");

const DIRECT_CALENDAR_TERMS = [
  "학사일정",
  "학사달력",
  "학사캘린더",
  "학사스케줄",
  "시험일정",
  "시험기간",
];

const ACADEMIC_EVENT_TERMS = [
  "개강",
  "종강",
  "중간고사",
  "기말고사",
  "계절학기",
  "수강신청",
  "등록금납부",
];

const DATE_INTENT_TERMS = [
  "언제",
  "일정",
  "기간",
  "날짜",
  "몇월",
  "이번달",
  "다음달",
  "이번학기",
  "다음학기",
  "시작",
  "끝",
];

export function isAcademicCalendarQuery(value) {
  const query = compact(value);
  if (DIRECT_CALENDAR_TERMS.some((term) => query.includes(term))) {
    return true;
  }

  if (
    query.includes("일정") &&
    ["이번달", "다음달", "이번학기", "다음학기"].some((term) =>
      query.includes(term),
    )
  ) {
    return true;
  }

  return (
    ACADEMIC_EVENT_TERMS.some((term) => query.includes(term)) &&
    DATE_INTENT_TERMS.some((term) => query.includes(term))
  );
}
