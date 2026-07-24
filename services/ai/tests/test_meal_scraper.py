from datetime import date

from app.meal_scraper import parse_dormitory, parse_student_restaurant


STUDENT_HTML = """
<div id="_JW_diet_basic">
  <table class="_fnTable">
    <thead>
      <tr>
        <th>일자</th>
        <th>2026.07.24<br>(금)</th>
        <th>2026.07.25<br>(토)</th>
      </tr>
    </thead>
    <tbody>
      <tr>
        <th>중식</th>
        <td>쇠고기무국<br>떡볶이<br>김말이튀김</td>
        <td>등록된 식단내용이(가) 없습니다.</td>
      </tr>
    </tbody>
  </table>
</div>
"""

DORM_HTML = """
<table class="table-board food">
  <tbody>
    <tr>
      <td data-mqtitle="day">금</td>
      <td data-mqtitle="date">07월 24일</td>
      <td data-mqtitle="breakfast"></td>
      <td data-mqtitle="lunch">쇠고기무국
떡볶이
김말이튀김</td>
      <td data-mqtitle="dinner">제육덮밥
배추김치</td>
    </tr>
  </tbody>
</table>
"""


def test_parse_student_restaurant_returns_target_day_menu():
    meals = parse_student_restaurant(
        STUDENT_HTML,
        restaurant="신관 늘솜",
        target_date=date(2026, 7, 24),
    )

    assert len(meals) == 1
    assert meals[0].date == "2026-07-24"
    assert meals[0].type == "중식"
    assert meals[0].menu == "쇠고기무국 · 떡볶이 · 김말이튀김"


def test_parse_student_restaurant_ignores_official_empty_marker():
    meals = parse_student_restaurant(
        STUDENT_HTML,
        restaurant="신관 늘솜",
        target_date=date(2026, 7, 25),
    )

    assert meals == []


def test_parse_dormitory_returns_each_registered_meal():
    meals = parse_dormitory(
        DORM_HTML,
        restaurant="공주 은행사/홍익사/해오름집",
        target_date=date(2026, 7, 24),
    )

    assert [meal.type for meal in meals] == ["중식", "석식"]
    assert meals[0].menu == "쇠고기무국 · 떡볶이 · 김말이튀김"
    assert meals[1].menu == "제육덮밥 · 배추김치"
