from __future__ import annotations

from contextlib import asynccontextmanager
from datetime import date
from typing import Any

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware

from .config import Settings, load_settings
from .models import QueryRequest, QueryResponse, Source
from .retrieval import LexicalRetriever, read_json, tokenize


settings: Settings = load_settings()
retriever: LexicalRetriever
small_talk: dict[str, str]
shuttle_data: dict[str, Any]
profanity: set[str]

CAMPUS_ADDRESSES = {
    "공주": "충청남도 공주시 공주대학로 56",
    "신관": "충청남도 공주시 공주대학로 56",
    "천안": "충청남도 천안시 서북구 천안대로 1223-24",
    "예산": "충청남도 예산군 예산읍 대학로 54",
}


@asynccontextmanager
async def lifespan(_: FastAPI):
    global settings, retriever, small_talk, shuttle_data, profanity

    retriever = LexicalRetriever(settings.data_path)
    small_talk = read_json(settings.small_talk_path, {})
    shuttle_data = read_json(settings.shuttle_path, {})
    profanity_payload = read_json(settings.profanity_path, {"bad_words": []})
    profanity = set(profanity_payload.get("bad_words", []))
    yield


app = FastAPI(
    title="PORTY AI Service",
    version="0.1.0",
    description="외부 API 키 없이 실행 가능한 공주대학교 정보 검색 서비스",
    lifespan=lifespan,
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=list(settings.allowed_origins),
    allow_credentials=False,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type"],
)


def last_user_message(body: QueryRequest) -> str:
    for message in reversed(body.messages):
        if message.role == "user":
            return message.content.strip()
    raise HTTPException(status_code=400, detail="사용자 메시지가 필요합니다.")


def contains_profanity(message: str) -> bool:
    tokens = set(tokenize(message))
    return any(word.lower() in tokens for word in profanity)


def small_talk_response(message: str) -> str | None:
    normalized = message.strip()
    for trigger, response in small_talk.items():
        if normalized == trigger or (
            len(normalized) <= len(trigger) + 4 and trigger in normalized
        ):
            return response
    return None


def shuttle_response(message: str) -> str | None:
    if not any(keyword in message for keyword in ("셔틀", "버스")):
        return None

    routes = shuttle_data.get("shuttle_schedules", [])
    locations = set(tokenize(message))
    matching = [
        route
        for route in routes
        if any(location in route.get("route", "") for location in locations)
    ]
    selected = matching[:2] or routes[:1]
    if not selected:
        return "현재 등록된 셔틀버스 정보가 없습니다."

    lines = ["저장된 셔틀버스 기준 정보예요."]
    for route in selected:
        lines.append(f"\n[{route.get('route', '노선')}]")
        for timetable in route.get("timetable", [])[:4]:
            departure = timetable.get("departure_time", "시간 미정")
            arrival = timetable.get("arrival_time")
            lines.append(
                f"- {departure} 출발"
                + (f" · {arrival} 도착" if arrival else "")
            )
    lines.append("\n운영 전에는 학교 공식 공지에서 최신 시간표를 확인해 주세요.")
    return "\n".join(lines)


def campus_address_response(message: str) -> QueryResponse | None:
    if not any(keyword in message for keyword in ("주소", "위치", "찾아가", "가는 길")):
        return None

    for campus, address in CAMPUS_ADDRESSES.items():
        if campus in message:
            display_name = "공주" if campus == "신관" else campus
            content = f"{display_name}캠퍼스 주소는 {address}입니다."
            return QueryResponse(
                response=content,
                sources=[
                    Source(
                        category="캠퍼스",
                        title=f"{display_name}캠퍼스 주소",
                        snippet=content,
                        score=1.0,
                    )
                ],
                mode="structured",
            )

    return None


@app.get("/health")
@app.get("/api/ai/health")
def health() -> dict[str, Any]:
    return {
        "status": "ok",
        "mode": "local-retrieval",
        "documents": len(retriever.documents),
        "date": date.today().isoformat(),
    }


@app.get("/api/ai/db/health")
def data_health() -> dict[str, Any]:
    return {
        "status": "ok",
        "storage": "versioned-json",
        "documents": len(retriever.documents),
    }


@app.post("/api/ai/query", response_model=QueryResponse)
def query(body: QueryRequest) -> QueryResponse:
    message = last_user_message(body)

    if contains_profanity(message):
        return QueryResponse(
            response="학교 생활과 관련된 질문을 정중하게 남겨 주세요.",
            mode="fallback",
        )

    if response := small_talk_response(message):
        return QueryResponse(response=response, mode="small-talk")

    if response := shuttle_response(message):
        return QueryResponse(response=response, mode="structured")

    if response := campus_address_response(message):
        return response

    hits = retriever.search(message, settings.top_k)
    if not hits:
        return QueryResponse(
            response=(
                "저장된 공주대학교 자료에서 관련 내용을 찾지 못했어요. "
                "학사 일정, 캠퍼스 위치, 학과, 셔틀버스처럼 범위를 좁혀 질문해 주세요."
            ),
            mode="fallback",
        )

    best = hits[0]
    return QueryResponse(
        response=(
            "공주대학교 자료에서 다음 내용을 찾았어요.\n\n"
            f"{best.snippet}\n\n"
            "자료의 기준 시점이 오래되었을 수 있으니 중요한 일정은 공식 홈페이지에서 확인해 주세요."
        ),
        sources=[
            Source(
                category=hit.category,
                title=hit.title,
                snippet=hit.snippet,
                score=hit.score,
            )
            for hit in hits
        ],
        mode="retrieval",
    )


@app.get("/api/ai/schedule")
def schedule() -> dict[str, Any]:
    hits = retriever.search("학사 일정 수강신청 개강 종강", 5)
    schedule_keywords = ("일정", "수강신청", "개강", "종강", "재입학")
    relevant_hits = [
        hit
        for hit in hits
        if any(keyword in hit.snippet for keyword in schedule_keywords)
    ][:3]
    return {
        "status": "reference-only",
        "message": "저장된 학사 자료입니다. 최신 일정은 공식 홈페이지에서 확인해 주세요.",
        "sources": [hit.__dict__ for hit in relevant_hits],
    }


@app.get("/api/ai/meal/{campus}")
def meal(campus: str, location: str, dorm: str | None = None) -> dict[str, Any]:
    return {
        "status": "integration-required",
        "campus": campus,
        "location": location,
        "dorm": dorm,
        "meals": [],
        "message": "실시간 식단 수집기는 운영 환경에서 별도로 연결해야 합니다.",
    }
