from fastapi.testclient import TestClient

import app.main as main
from app.main import app


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
