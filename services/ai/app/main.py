from __future__ import annotations

from contextlib import asynccontextmanager
from datetime import datetime
from typing import Any
from zoneinfo import ZoneInfo

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
KOREA_TIMEZONE = ZoneInfo("Asia/Seoul")
SHUTTLE_SOURCE_URL = "https://www.kongju.ac.kr/KNU/16872/subview.do"
SHUTTLE_ROUTE_SUMMARY = (
    ("유성 → 공주", "07:50·09:10 출발"),
    ("세종 → 공주", "08:00·09:00 출발"),
    ("천안 → 공주", "07:40 출발"),
    ("청주 → 공주", "07:30 출발"),
    ("대전 → 천안", "07:30 출발"),
    ("대전 → 예산", "월요일 07:40 출발"),
)


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


def shuttle_response(message: str) -> QueryResponse | None:
    if not any(
        keyword in message
        for keyword in ("셔틀", "통학버스", "무료버스", "순환버스")
    ):
        return None

    service_period = shuttle_data.get("service_period", {})
    now = datetime.now(KOREA_TIMEZONE)
    current_date = now.date()
    current_year = now.year
    period_years = sorted(
        {
            int(str(value).split("-", 1)[0])
            for semester in ("1학기", "2학기")
            for value in service_period.get(semester, {}).values()
            if value and str(value).split("-", 1)[0].isdigit()
        }
    )
    if not period_years or max(period_years) < current_year:
        content = (
            "저장된 셔틀 시간표는 기간이 지나 현재 운행시간으로 안내하지 않아요. "
            "학교 공식 버스 안내에서 최신 운행기간과 노선을 확인해 주세요.\n\n"
            f"[최신 셔틀·무료버스 시간표 확인]({SHUTTLE_SOURCE_URL})"
        )
        return QueryResponse(
            response=content,
            sources=[
                Source(
                    category="캠퍼스",
                    title="셔틀·무료버스 최신 시간표",
                    snippet="운행기간과 노선은 학기마다 변경될 수 있습니다.",
                    score=1.0,
                    source_url=SHUTTLE_SOURCE_URL,
                    reference_date=str(current_year),
                )
            ],
            mode="structured",
        )

    semester_periods: list[tuple[str, Any, Any]] = []
    for semester in ("1학기", "2학기"):
        period = service_period.get(semester, {})
        try:
            start = datetime.fromisoformat(str(period.get("start"))).date()
            end = datetime.fromisoformat(str(period.get("end"))).date()
        except (TypeError, ValueError):
            continue
        semester_periods.append((semester, start, end))

    active_semester = next(
        (
            (semester, start, end)
            for semester, start, end in semester_periods
            if start <= current_date <= end
        ),
        None,
    )
    upcoming_semester = next(
        (
            (semester, start, end)
            for semester, start, end in semester_periods
            if start > current_date
        ),
        None,
    )

    if active_semester:
        semester, start, end = active_semester
        service_status = (
            f"현재 {semester} 무료버스 운행기간({start:%m.%d}~{end:%m.%d})입니다."
        )
    elif upcoming_semester:
        semester, start, end = upcoming_semester
        service_status = (
            f"현재는 방학이라 정규 무료버스 운행기간이 아닙니다. "
            f"{semester}는 {start:%m.%d}~{end:%m.%d} 운행 예정입니다."
        )
    else:
        service_status = "현재 학기 정규 무료버스 운행기간이 종료되었습니다."

    routes = shuttle_data.get("shuttle_schedules", [])
    locations = set(tokenize(message))
    matching = [
        route
        for route in routes
        if any(location in route.get("route", "") for location in locations)
    ]
    location_keywords = (
        "공주",
        "천안",
        "예산",
        "세종",
        "유성",
        "대전",
        "청주",
        "신창",
        "두정",
    )
    is_general_question = not any(
        keyword in message for keyword in location_keywords
    )

    source = Source(
        category="캠퍼스",
        title="2026 무료버스·순환버스 시간표",
        snippet=(
            "2026년 1학기는 3월 3일부터 6월 18일까지, "
            "2학기는 9월 1일부터 12월 18일까지 운행 예정입니다."
        ),
        score=1.0,
        source_url=SHUTTLE_SOURCE_URL,
        reference_date="2026-07-24",
    )

    if is_general_question:
        lines = [service_status, "", "주요 등교 노선과 출발 시간은 다음과 같습니다."]
        lines.extend(f"- {route}: {times}" for route, times in SHUTTLE_ROUTE_SUMMARY)
        lines.extend(
            [
                "- 캠퍼스 순환: 공주↔천안, 공주↔예산, 예산↔신창역",
                "",
                "공휴일·주말·개교기념일에는 운행하지 않습니다.",
                f"[정류장별 공식 시간표]({SHUTTLE_SOURCE_URL})",
            ]
        )
        return QueryResponse(
            response="\n".join(lines),
            sources=[source],
            mode="structured",
        )

    selected = matching[:2]
    if not selected:
        return QueryResponse(
            response=(
                f"{service_status}\n\n"
                "해당 출발지의 시간표는 현재 등록된 자료에서 찾지 못했습니다.\n\n"
                f"[전체 공식 시간표]({SHUTTLE_SOURCE_URL})"
            ),
            sources=[source],
            mode="fallback",
        )

    lines = [service_status]
    for route in selected:
        lines.append(f"\n[{route.get('route', '노선')}]")
        stops = [stop for stop in route.get("stops", []) if stop]
        if stops:
            lines.append(f"- 경유: {' → '.join(stops)}")
        for timetable in route.get("timetable", [])[:4]:
            departure = timetable.get("departure_time", "시간 미정")
            arrival = timetable.get("arrival_time")
            lines.append(
                f"- {departure} 출발"
                + (f" · {arrival} 도착" if arrival else "")
            )
    lines.append(f"\n[정류장별 공식 시간표]({SHUTTLE_SOURCE_URL})")
    return QueryResponse(
        response="\n".join(lines),
        sources=[source],
        mode="structured",
    )


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
                        source_url="https://www.kongju.ac.kr/KNU/16713/subview.do",
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

    return hits[:1]


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
        "date": datetime.now(KOREA_TIMEZONE).date().isoformat(),
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
        return response

    if "시내버스" in message:
        return QueryResponse(
            response=(
                "시내버스 노선과 도착시간은 실시간으로 바뀌어 PORTY의 저장 자료로 "
                "안내하지 않아요. 지도·교통 앱에서 현재 위치 기준으로 확인해 주세요."
            ),
            mode="fallback",
        )

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
    answer = generated_answer or extractive_answer(hits[0], message)

    return QueryResponse(
        response=answer_with_source(answer, hits[0]),
        sources=[source_from_hit(hit) for hit in hits],
        mode="generated" if generated_answer else "retrieval",
    )


@app.get("/api/ai/schedule")
def schedule() -> dict[str, Any]:
    hits = retriever.search("학사일정 개강 시험 계절학기", 5)
    schedule_keywords = ("일정", "개강", "시험", "계절학기")
    relevant_hits = [
        hit
        for hit in hits
        if any(keyword in hit.snippet for keyword in schedule_keywords)
    ][:1]
    return {
        "status": "reference-only",
        "message": "저장된 학사 자료입니다. 최신 일정은 공식 홈페이지에서 확인해 주세요.",
        "sources": [hit.__dict__ for hit in relevant_hits],
    }


@app.get("/api/ai/meal/{campus}")
def meal(campus: str, location: str, dorm: str | None = None) -> dict[str, Any]:
    return {
        "status": "official-link-required",
        "campus": campus,
        "location": location,
        "dorm": dorm,
        "meals": [],
        "message": (
            "식단은 매일 변경되므로 저장된 메뉴를 표시하지 않습니다. "
            "학교 공식 식단 페이지에서 오늘 메뉴를 확인해 주세요."
        ),
        "source_url": "https://www.kongju.ac.kr/KNU/16863/subview.do",
    }
