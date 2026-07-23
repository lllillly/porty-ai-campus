from __future__ import annotations

from contextlib import asynccontextmanager
from datetime import date
from typing import Any

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware

from .config import Settings, load_settings
from .generator import extractive_answer, generate_grounded_answer
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
    version="0.2.0",
    description="공식 자료 검색과 근거 기반 생성을 결합한 공주대학교 정보 서비스",
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

    service_period = shuttle_data.get("service_period", {})
    period_years = sorted(
        {
            str(value).split("-", 1)[0]
            for semester in ("1학기", "2학기")
            for value in service_period.get(semester, {}).values()
            if value
        }
    )
    period_label = "·".join(period_years) if period_years else "과거"
    lines = [
        f"아래 내용은 보관된 {period_label}년 셔틀 시간표로, 현재 운행을 보장하지 않는 참고 자료예요."
    ]
    for route in selected:
        lines.append(f"\n[{route.get('route', '노선')}]")
        for timetable in route.get("timetable", [])[:4]:
            departure = timetable.get("departure_time", "시간 미정")
            arrival = timetable.get("arrival_time")
            lines.append(
                f"- {departure} 출발"
                + (f" · {arrival} 도착" if arrival else "")
            )
    lines.append("\n이용 전에는 학교 공식 공지에서 최신 시간표를 반드시 확인해 주세요.")
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


def source_from_hit(hit: Any) -> Source:
    return Source(
        category=hit.category,
        title=hit.title,
        snippet=hit.snippet,
        score=hit.score,
        source_url=hit.source_url,
        reference_date=hit.reference_date,
    )


def relevant_hits(hits: list[Any]) -> list[Any]:
    if not hits or hits[0].score < 10.0:
        return []

    cutoff = max(6.0, hits[0].score * 0.42)
    return [hit for hit in hits if hit.score >= cutoff]


def retrieval_message(body: QueryRequest, message: str) -> str:
    message_words = [
        token
        for token in tokenize(message)
        if not token.startswith("~")
    ]
    follow_up_markers = ("그거", "그건", "그럼", "그러면", "아까", "해당")
    is_follow_up = len(message_words) <= 1 or any(
        marker in message for marker in follow_up_markers
    )
    if not is_follow_up:
        return message

    user_messages = [
        item.content.strip()
        for item in body.messages
        if item.role == "user" and item.content.strip()
    ]
    if len(user_messages) < 2:
        return message
    return f"{user_messages[-2]} {message}"


def answer_with_source(answer: str, hit: Any) -> str:
    if not hit.source_url or hit.source_url in answer:
        return answer
    return f"{answer}\n\n[공식 안내 확인]({hit.source_url})"


def gateway_token(request: Request) -> str | None:
    return (
        settings.ai_gateway_token
        or request.headers.get("x-vercel-oidc-token")
    )


@app.get("/health")
@app.get("/api/ai/health")
def health(request: Request) -> dict[str, Any]:
    return {
        "status": "ok",
        "mode": "local-retrieval",
        "documents": len(retriever.documents),
        "answer_engine": (
            settings.ai_model
            if gateway_token(request)
            else "grounded-extractive-fallback"
        ),
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
def query(body: QueryRequest, request: Request) -> QueryResponse:
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

    search_query = retrieval_message(body, message)
    hits = relevant_hits(retriever.search(search_query, settings.top_k))
    if not hits:
        return QueryResponse(
            response=(
                "저장된 공주대학교 자료에서 관련 내용을 찾지 못했어요. "
                "학사 일정, 캠퍼스 위치, 학과, 셔틀버스처럼 범위를 좁혀 질문해 주세요."
            ),
            mode="fallback",
        )

    generated_answer = generate_grounded_answer(
        question=message,
        hits=hits,
        token=gateway_token(request),
        model=settings.ai_model,
        gateway_url=settings.ai_gateway_url,
        conversation=[
            {"role": item.role, "content": item.content}
            for item in body.messages[-7:-1]
            if item.role in {"user", "assistant"}
        ],
    )
    answer = generated_answer or extractive_answer(hits[0])

    return QueryResponse(
        response=answer_with_source(answer, hits[0]),
        sources=[source_from_hit(hit) for hit in hits],
        mode="generated" if generated_answer else "retrieval",
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
