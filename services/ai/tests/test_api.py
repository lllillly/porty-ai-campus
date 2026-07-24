import re

from fastapi.testclient import TestClient

import app.main as main
from app.main import app
from app.meal_scraper import Meal, MealResult


def test_health_reports_loaded_documents():
    with TestClient(app) as client:
        response = client.get("/api/ai/health")

    assert response.status_code == 200
    payload = response.json()
    assert payload["status"] == "ok"
    assert payload["documents"] > 0


def test_query_handles_small_talk():
    with TestClient(app) as client:
        response = client.post(
            "/api/ai/query",
            json={"sessionId": "test", "messages": [{"role": "user", "content": "안녕"}]},
        )

    assert response.status_code == 200
    assert response.json()["mode"] == "small-talk"


def test_identity_small_talk_can_use_multiple_natural_responses(monkeypatch):
    selections = iter((0, 1))

    def select_in_order(options):
        return options[next(selections)]

    monkeypatch.setattr(main, "choice", select_in_order)

    with TestClient(app) as client:
        first = client.post(
            "/api/ai/query",
            json={"messages": [{"role": "user", "content": "너는 누구야?"}]},
        ).json()
        second = client.post(
            "/api/ai/query",
            json={"messages": [{"role": "user", "content": "너는 누구야?"}]},
        ).json()

    assert first["mode"] == "small-talk"
    assert second["mode"] == "small-talk"
    assert first["response"] != second["response"]
    assert "포티" in first["response"]
    assert "포티" in second["response"]


def test_query_returns_verified_campus_address():
    with TestClient(app) as client:
        response = client.post(
            "/api/ai/query",
            json={
                "sessionId": "test",
                "messages": [{"role": "user", "content": "천안캠퍼스 주소 알려줘"}],
            },
        )

    assert response.status_code == 200
    payload = response.json()
    assert payload["mode"] == "structured"
    assert "천안대로 1223-24" in payload["response"]
    assert payload["sources"][0]["category"] == "캠퍼스"


def test_where_questions_return_the_building_campus_and_street_address():
    cases = (
        ("9공학관 어디야?", "천안캠퍼스", "천안대로 1223-24"),
        ("중앙도서관이 어디야?", "공주캠퍼스", "공주대학로 56"),
        ("드림하우스 위치 알려줘", "공주캠퍼스", "공주대학로 56"),
        ("옥룡캠퍼스는 어디인가요?", "옥룡캠퍼스", "우금티로 753"),
    )

    with TestClient(app) as client:
        for question, campus, address in cases:
            response = client.post(
                "/api/ai/query",
                json={"messages": [{"role": "user", "content": question}]},
            )
            payload = response.json()
            assert payload["mode"] == "structured"
            assert campus in payload["response"]
            assert address in payload["response"]


def test_university_intro_is_not_misrouted_to_admission_headlines():
    with TestClient(app) as client:
        response = client.post(
            "/api/ai/query",
            json={
                "messages": [
                    {"role": "user", "content": "공주대학교에 대해 알려주세요"}
                ]
            },
        )

    answer = response.json()["response"]
    assert answer.startswith("국립공주대학교는 1948년")
    assert "공주캠퍼스" in answer
    assert "천안캠퍼스" in answer
    assert "학생부종합전형" not in answer


def test_academic_special_questions_return_direct_answers():
    cases = (
        (
            "국가장학금 신청 방법 알려줘",
            "한국장학재단",
            "국가장학금 신청",
        ),
        (
            "학점 포기할 수 있어?",
            "현재 수강 중인 과목",
            "최종 수강신청 변경 및 수강포기",
        ),
        (
            "교환학생 신청 방법 알려줘",
            "국제교류과",
            "교환학생 선발 안내",
        ),
        (
            "졸업논문 꼭 써야 해?",
            "졸업종합시험",
            "졸업논문",
        ),
        (
            "계절학기 신청 방법 알려줘",
            "최대 6학점",
            "계절학기",
        ),
    )

    with TestClient(app) as client:
        for question, expected_answer, expected_source in cases:
            response = client.post(
                "/api/ai/query",
                json={"messages": [{"role": "user", "content": question}]},
            )
            payload = response.json()
            assert payload["mode"] == "structured"
            assert expected_answer in payload["response"]
            assert payload["sources"][0]["title"] == expected_source


def test_student_counseling_center_where_question_returns_address():
    with TestClient(app) as client:
        response = client.post(
            "/api/ai/query",
            json={
                "messages": [
                    {"role": "user", "content": "학생상담센터 어디야?"}
                ]
            },
        )

    payload = response.json()
    assert payload["mode"] == "structured"
    assert "학생복지관 2층" in payload["response"]
    assert "공주대학로 56" in payload["response"]


def test_library_borrowing_question_leads_with_limit_not_opening_hours():
    with TestClient(app) as client:
        response = client.post(
            "/api/ai/query",
            json={
                "messages": [
                    {"role": "user", "content": "도서관 책 몇 권 빌릴 수 있어?"}
                ]
            },
        )

    payload = response.json()
    assert payload["mode"] == "structured"
    assert payload["response"].startswith("학부생은 일반도서를 7권까지")
    assert payload["sources"][0]["title"] == "도서관 도서 대출"


def test_schedule_excludes_unrelated_search_results():
    with TestClient(app) as client:
        response = client.get("/api/ai/schedule")

    assert response.status_code == 200
    payload = response.json()
    assert payload["status"] == "reference-only"
    assert all(
        any(
            keyword in source["snippet"]
            for keyword in ("일정", "수강신청", "개강", "종강", "재입학")
        )
        for source in payload["sources"]
    )


def test_query_returns_grounded_graduation_answer():
    with TestClient(app) as client:
        response = client.post(
            "/api/ai/query",
            json={
                "sessionId": "test",
                "messages": [
                    {
                        "role": "user",
                        "content": "졸업하려면 몇 학점 필요해?",
                    }
                ],
            },
        )

    assert response.status_code == 200
    payload = response.json()
    assert payload["mode"] in {"generated", "retrieval"}
    assert "130" in payload["response"]
    assert payload["sources"][0]["title"] == "졸업"


def test_query_does_not_force_unrelated_question_into_campus_data():
    with TestClient(app) as client:
        response = client.post(
            "/api/ai/query",
            json={
                "sessionId": "test",
                "messages": [
                    {"role": "user", "content": "오늘 날씨 어때?"}
                ],
            },
        )

    assert response.status_code == 200
    assert response.json()["mode"] == "fallback"


def test_query_uses_previous_user_message_for_short_follow_up():
    with TestClient(app) as client:
        response = client.post(
            "/api/ai/query",
            json={
                "sessionId": "test",
                "messages": [
                    {"role": "user", "content": "수강신청 방법 알려줘"},
                    {
                        "role": "assistant",
                        "content": "수강신청 시스템에서 신청해요.",
                    },
                    {"role": "user", "content": "그건 언제 해?"},
                ],
            },
        )

    assert response.status_code == 200
    payload = response.json()
    assert payload["mode"] in {"generated", "retrieval"}
    assert payload["sources"][0]["title"] == "수강신청"


def test_query_uses_vercel_runtime_oidc_header(monkeypatch):
    captured = {}

    def fake_generate(**kwargs):
        captured["token"] = kwargs["token"]
        return "근거 기반 생성 답변"

    monkeypatch.setattr(main, "generate_grounded_answer", fake_generate)

    with TestClient(app) as client:
        response = client.post(
            "/api/ai/query",
            headers={"x-vercel-oidc-token": "short-lived-test-token"},
            json={
                "sessionId": "test",
                "messages": [
                    {"role": "user", "content": "주차 요금이 얼마야?"}
                ],
            },
        )

    assert response.status_code == 200
    assert response.json()["mode"] == "generated"
    assert captured["token"] == "short-lived-test-token"


def test_query_returns_live_meal_instead_of_only_official_link(monkeypatch):
    monkeypatch.setattr(
        main,
        "fetch_meals",
        lambda **_: MealResult(
            campus="공주",
            location="학생식당",
            target_date="2026-07-24",
            meals=(
                Meal(
                    date="2026-07-24",
                    type="중식",
                    menu="쇠고기무국 · 떡볶이 · 김말이튀김",
                    restaurant="신관 늘솜",
                ),
            ),
            source_url="https://www.kongju.ac.kr/KNU/16863/subview.do",
            fetched_at="2026-07-24T12:00:00+09:00",
        ),
    )

    with TestClient(app) as client:
        response = client.post(
            "/api/ai/query",
            json={
                "messages": [
                    {"role": "user", "content": "오늘 학식 메뉴 알려줘"}
                ]
            },
        )

    payload = response.json()
    assert payload["mode"] == "structured"
    assert payload["sources"][0]["title"] == "실시간 식단"
    assert "쇠고기무국" in payload["response"]
    assert "신관 늘솜 · 중식" in payload["response"]


def test_meal_endpoint_returns_scraped_meals(monkeypatch):
    monkeypatch.setattr(
        main,
        "fetch_meals",
        lambda **_: MealResult(
            campus="공주",
            location="기숙사",
            target_date="2026-07-24",
            meals=(
                Meal(
                    date="2026-07-24",
                    type="중식",
                    menu="쇠고기무국 · 떡볶이",
                    restaurant="공주 은행사/홍익사/해오름집",
                ),
            ),
            source_url="https://dormi.kongju.ac.kr/HOME/sub.php?code=041301",
            fetched_at="2026-07-24T12:00:00+09:00",
        ),
    )

    with TestClient(app) as client:
        response = client.get(
            "/api/ai/meal/공주?location=기숙사&dorm=은행사/홍익사/해오름집"
        )

    payload = response.json()
    assert payload["status"] == "live"
    assert payload["meals"][0]["type"] == "중식"
    assert "쇠고기무국" in payload["meals"][0]["menu"]
    assert payload["source_url"].endswith("code=041301")


def test_current_shuttle_question_returns_period_routes_and_times():
    with TestClient(app) as client:
        response = client.post(
            "/api/ai/query",
            json={
                "messages": [
                    {"role": "user", "content": "셔틀버스 시간표 알려줘"}
                ]
            },
        )

    payload = response.json()
    assert payload["mode"] == "structured"
    assert "2학기" in payload["response"]
    assert "유성 → 공주" in payload["response"]
    assert "07:50" in payload["response"]
    assert payload["presentation"]["type"] == "shuttle"
    assert payload["presentation"]["status"] == "방학 · 운행 예정"
    assert len(payload["presentation"]["routes"]) == 6
    assert payload["presentation"]["routes"][0]["trips"][0]["departure"] == "07:50"
    assert payload["sources"][0]["source_url"].endswith("/16872/subview.do")


def test_directional_shuttle_question_returns_only_requested_direction():
    with TestClient(app) as client:
        response = client.post(
            "/api/ai/query",
            json={
                "messages": [
                    {
                        "role": "user",
                        "content": "천안에서 공주 가는 셔틀 알려줘",
                    }
                ]
            },
        )

    routes = response.json()["presentation"]["routes"]
    assert [route["name"] for route in routes] == ["천안→공주"]
    assert routes[0]["trips"][0] == {
        "departure": "07:40",
        "arrival": "08:40",
        "note": None,
    }


def test_static_answer_starts_with_direct_fact_and_keeps_conditions():
    with TestClient(app) as client:
        response = client.post(
            "/api/ai/query",
            json={
                "messages": [
                    {"role": "user", "content": "휴학 신청 방법 알려줘"}
                ]
            },
        )

    answer = response.json()["response"]
    assert answer.startswith("휴학은 포털시스템")
    assert "신입생의 1학년 1학기" in answer
    assert "관련 공식 자료예요" not in answer


def test_retrieval_answers_use_formal_honorific_endings():
    questions = (
        "도서관 운영시간 알려줘",
        "졸업 요건이 뭐야?",
        "휴학 신청 방법 알려줘",
        "장학금 종류 알려줘",
        "주차비 얼마야?",
    )
    informal_endings = re.compile(
        r"(?:한다|된다|이다|있다|없다|다르다|거친다|안전하다|"
        r"가능하다|제도다|좋다|무료다)\."
    )

    with TestClient(app) as client:
        for question in questions:
            answer = client.post(
                "/api/ai/query",
                json={"messages": [{"role": "user", "content": question}]},
            ).json()["response"]
            assert informal_endings.search(answer) is None


def test_parking_fee_question_returns_current_fee_instead_of_dormitory_fee():
    with TestClient(app) as client:
        response = client.post(
            "/api/ai/query",
            json={
                "messages": [
                    {"role": "user", "content": "주차비 얼마야?"}
                ]
            },
        )

    payload = response.json()
    assert payload["sources"][0]["title"] == "주차안내"
    assert payload["response"].startswith("방문차량 주차요금")
    assert "1,000원" in payload["response"]
    assert "10분마다 200원" in payload["response"]
    assert "20,000원" in payload["response"]


def test_city_bus_question_is_not_misrouted_to_parking_or_shuttle():
    with TestClient(app) as client:
        response = client.post(
            "/api/ai/query",
            json={
                "messages": [
                    {"role": "user", "content": "시내버스 정류장이 어디야?"}
                ]
            },
        )

    payload = response.json()
    assert payload["mode"] == "fallback"
    assert payload["sources"] == []
    assert "교통 앱" in payload["response"]
