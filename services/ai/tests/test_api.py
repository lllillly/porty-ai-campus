from fastapi.testclient import TestClient

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
