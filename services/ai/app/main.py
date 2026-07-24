from __future__ import annotations

from contextlib import asynccontextmanager
from datetime import date, datetime
import re
from secrets import choice
from typing import Any
from zoneinfo import ZoneInfo

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware

from .config import Settings, load_settings
from .generator import extractive_answer, generate_grounded_answer
from .meal_scraper import MealResult, MealScrapeError, fetch_meals
from .models import QueryRequest, QueryResponse, Source
from .retrieval import LexicalRetriever, read_json, tokenize
from .student_news import (
    STUDENT_NEWS_URL,
    StudentNewsError,
    StudentNewsItem,
    fetch_latest_student_news,
    fetch_student_news_details,
    fetched_at as student_news_fetched_at,
)


settings: Settings = load_settings()
retriever: LexicalRetriever
small_talk: dict[str, str | list[str]]
shuttle_data: dict[str, Any]
profanity: set[str]

CAMPUS_ADDRESSES = {
    "공주": "충청남도 공주시 공주대학로 56",
    "신관": "충청남도 공주시 공주대학로 56",
    "옥룡": "충청남도 공주시 우금티로 753",
    "천안": "충청남도 천안시 서북구 천안대로 1223-24",
    "예산": "충청남도 예산군 예산읍 대학로 54",
}
CAMPUS_DISPLAY_NAMES = {
    "공주": "공주캠퍼스",
    "신관": "공주캠퍼스",
    "옥룡": "옥룡캠퍼스",
    "천안": "천안캠퍼스",
    "예산": "예산캠퍼스",
}
BUILDING_LOCATIONS = (
    (("중앙도서관", "제2도서관"), "중앙도서관", "공주"),
    (("웅비학생회관",), "웅비학생회관", "공주"),
    (("대학본부", "본부"), "대학본부", "공주"),
    (
        ("학생상담센터", "행복상담센터"),
        "학생상담센터(학생복지관 2층)",
        "공주",
    ),
    (("학생복지관",), "학생복지관", "공주"),
    (("사범대학관", "사범대"), "사범대학관", "공주"),
    (("자연과학대학관", "자연대"), "자연과학대학관", "공주"),
    (("인문사회과학대학관", "인사대"), "인문사회과학대학관", "공주"),
    (("간호보건대학예술대학관",), "간호보건대학·예술대학관", "공주"),
    (("세종한민족교육문화센터",), "세종한민족교육문화센터", "공주"),
    (("백제교육문화관",), "백제교육문화관", "공주"),
    (("국제교육원",), "국제교육원", "공주"),
    (("공주국민체육센터",), "공주국민체육센터", "공주"),
    (("드림하우스",), "드림하우스", "공주"),
    (("비전하우스",), "비전하우스", "공주"),
    (("블룸하우스",), "블룸하우스", "공주"),
    (("은행사",), "은행사", "공주"),
    (("홍익사",), "홍익사", "공주"),
    (("해오름집",), "해오름집", "공주"),
    (("천안공과대학", "천안공대"), "천안공과대학", "천안"),
    (("산업과학대학",), "산업과학대학", "예산"),
)
AMBIGUOUS_CAMPUS_FACILITIES = (
    "학생회관",
    "보건진료소",
    "생활관",
    "기숙사",
    "체육관",
    "도서관",
)
KOREA_TIMEZONE = ZoneInfo("Asia/Seoul")
SHUTTLE_SOURCE_URL = "https://www.kongju.ac.kr/KNU/16872/subview.do"
CIRCULATION_SOURCE_URL = "https://www.kongju.ac.kr/KNU/16880/subview.do"
MEAL_SOURCE_URL = "https://www.kongju.ac.kr/KNU/16863/subview.do"
STUDENT_NEWS_URL_PATTERN = re.compile(
    r"https://www\.kongju\.ac\.kr/bbs/KNU/2132/\d+/artclView\.do"
    r"(?:\?layout=unknown)?"
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
            if isinstance(response, list):
                options = [
                    item.strip()
                    for item in response
                    if isinstance(item, str) and item.strip()
                ]
                return choice(options) if options else None
            return response
    return None


def university_intro_response(message: str) -> QueryResponse | None:
    if not any(name in message for name in ("공주대학교", "공주대", "국립공주대")):
        return None
    if not any(
        keyword in message
        for keyword in ("알려", "소개", "어떤 학교", "뭐 하는 학교", "대해")
    ):
        return None

    response = (
        "국립공주대학교는 1948년 공주사범대학으로 출발한 국립 종합대학교입니다.\n\n"
        "- 공주캠퍼스: 사범·인문사회·자연과학·간호보건·예술 분야\n"
        "- 천안캠퍼스: 공학 분야\n"
        "- 예산캠퍼스: 농생명·산업과학 분야\n"
        "- 교육이념: 진리탐구·가치창조·정의실천\n\n"
        "[학교 현황 확인](https://www.kongju.ac.kr/KNU/16692/subview.do)"
    )
    return QueryResponse(
        response=response,
        sources=[
            Source(
                category="학교안내",
                title="국립공주대학교 현황",
                snippet=(
                    "1948년 공주사범대학으로 출발한 국립 종합대학교로 "
                    "공주·천안·예산 캠퍼스를 운영합니다."
                ),
                score=1.0,
                source_url="https://www.kongju.ac.kr/KNU/16692/subview.do",
                reference_date="2026-07-24",
            )
        ],
        mode="structured",
    )


def _student_news_sources(
    items: tuple[StudentNewsItem, ...],
) -> list[Source]:
    return [
        Source(
            category="학생소식",
            title=item.title,
            snippet=item.preview,
            score=1.0,
            source_url=item.url,
            reference_date=item.date,
        )
        for item in items
    ]


def _student_news_urls_from_history(body: QueryRequest) -> list[str]:
    for history_item in reversed(body.messages[:-1]):
        if history_item.role != "assistant":
            continue
        urls = STUDENT_NEWS_URL_PATTERN.findall(history_item.content)
        if urls:
            return list(dict.fromkeys(urls))[:3]
    return []


def _selected_news_indices(message: str, item_count: int) -> list[int]:
    normalized = re.sub(r"\s+", "", message)
    ordinal_terms = (
        (0, ("첫번째", "첫째", "1번째", "1번")),
        (1, ("두번째", "둘째", "2번째", "2번")),
        (2, ("세번째", "셋째", "3번째", "3번")),
    )
    for index, terms in ordinal_terms:
        if index < item_count and any(term in normalized for term in terms):
            return [index]
    return list(range(item_count))


def student_news_response(
    body: QueryRequest,
    message: str,
) -> QueryResponse | None:
    normalized = re.sub(r"\s+", "", message)
    explicit_news_request = any(
        keyword in normalized
        for keyword in ("학생소식", "학생공지", "학생뉴스")
    )
    detail_request = any(
        keyword in normalized
        for keyword in (
            "내용",
            "자세히",
            "요약",
            "첫번째",
            "두번째",
            "세번째",
            "1번",
            "2번",
            "3번",
            "그글",
        )
    )
    history_urls = _student_news_urls_from_history(body)
    has_news_context = bool(history_urls) or any(
        item.role == "user"
        and any(
            keyword in re.sub(r"\s+", "", item.content)
            for keyword in ("학생소식", "학생공지", "학생뉴스")
        )
        for item in body.messages[:-1]
    )
    if not explicit_news_request and not (has_news_context and detail_request):
        return None

    try:
        if detail_request:
            if not history_urls:
                latest = fetch_latest_student_news(limit=3)
                history_urls = [item.url for item in latest]
            selected_indices = _selected_news_indices(
                message,
                len(history_urls),
            )
            urls = [history_urls[index] for index in selected_indices]
            items = fetch_student_news_details(urls)
            lines = ["요청하신 학생소식 내용을 정리했습니다."]
            for index, item in enumerate(items, start=1):
                lines.extend(
                    [
                        "",
                        f"### {index}. {item.title}",
                        f"{item.date}"
                        + (f" · {item.author}" if item.author else ""),
                        "",
                        item.content or item.preview,
                        "",
                        f"[공식 게시글에서 보기]({item.url})",
                    ]
                )
            return QueryResponse(
                response="\n".join(lines),
                sources=_student_news_sources(items),
                presentation={
                    "type": "student-news",
                    "view": "detail",
                    "title": "학생소식 자세히 보기",
                    "items": [item.as_dict() for item in items],
                    "fetchedAt": student_news_fetched_at(),
                    "sourceUrl": STUDENT_NEWS_URL,
                },
                mode="structured",
            )

        items = fetch_latest_student_news(limit=3)
        lines = ["국립공주대학교 공식 학생소식의 최신 글 3개입니다."]
        for index, item in enumerate(items, start=1):
            lines.extend(
                [
                    "",
                    f"{index}. [{item.title}]({item.url})",
                    f"   - {item.date} · {item.preview}",
                ]
            )
        lines.extend(
            [
                "",
                "궁금한 글의 번호를 말하면 내용을 이어서 보여드리겠습니다.",
                f"[학생소식 전체 보기]({STUDENT_NEWS_URL})",
            ]
        )
        return QueryResponse(
            response="\n".join(lines),
            sources=_student_news_sources(items),
            presentation={
                "type": "student-news",
                "view": "list",
                "title": "새로 올라온 학생소식",
                "items": [item.as_dict() for item in items],
                "fetchedAt": student_news_fetched_at(),
                "sourceUrl": STUDENT_NEWS_URL,
            },
            mode="structured",
        )
    except StudentNewsError:
        response = (
            "공식 학생소식 페이지에서 최신 글을 불러오지 못했습니다. "
            "잠시 후 다시 시도하거나 아래 게시판에서 확인해 주세요.\n\n"
            f"[학생소식 전체 보기]({STUDENT_NEWS_URL})"
        )
        return QueryResponse(
            response=response,
            sources=[
                Source(
                    category="학생소식",
                    title="국립공주대학교 학생소식",
                    snippet="공식 학생소식 게시판",
                    score=1.0,
                    source_url=STUDENT_NEWS_URL,
                )
            ],
            presentation={
                "type": "student-news",
                "view": "error",
                "title": "학생소식",
                "items": [],
                "sourceUrl": STUDENT_NEWS_URL,
            },
            mode="fallback",
        )


def academic_special_response(message: str) -> QueryResponse | None:
    normalized = re.sub(r"\s+", "", message)

    if "국가장학금" in normalized:
        response = (
            "국가장학금은 한국장학재단에서 해당 학기의 신청 기간 안에 신청합니다.\n\n"
            "- 신청 후 가구원 동의와 필요한 서류 제출까지 완료해야 합니다.\n"
            "- 신청 기간과 심사 조건은 학기마다 달라질 수 있으므로 "
            "한국장학재단과 학교의 최신 공지를 확인해 주세요.\n\n"
            "[교내 장학 안내]"
            "(https://www.kongju.ac.kr/KNU/16842/subview.do)"
        )
        return QueryResponse(
            response=response,
            sources=[
                Source(
                    category="학생생활",
                    title="국가장학금 신청",
                    snippet=(
                        "한국장학재단에서 신청하고 가구원 동의와 필요한 "
                        "서류 제출을 완료해야 합니다."
                    ),
                    score=1.0,
                    source_url=(
                        "https://www.kongju.ac.kr/KNU/16842/subview.do"
                    ),
                    reference_date="2026-07-24",
                )
            ],
            mode="structured",
        )

    if "졸업논문" in normalized:
        response = (
            "졸업논문 통과는 원칙적으로 졸업요건에 포함됩니다. 다만 학과에 따라 "
            "실험·실습 보고서, 실기 발표 또는 졸업종합시험으로 대체할 수 있습니다.\n\n"
            "- 대체 여부와 세부 기준은 소속 학과에 확인해야 합니다.\n"
            "- 논문 제출 자격과 제출 기한도 별도 기준이 있으므로 공식 안내를 확인해 주세요.\n\n"
            "[졸업논문 공식 안내]"
            "(https://onestop.kongju.ac.kr/onestop/17881/subview.do)"
        )
        return QueryResponse(
            response=response,
            sources=[
                Source(
                    category="학사",
                    title="졸업논문",
                    snippet=(
                        "졸업논문이 원칙이며 학과에 따라 실험·실습 보고서, "
                        "실기 발표 또는 졸업종합시험으로 대체할 수 있습니다."
                    ),
                    score=1.0,
                    source_url=(
                        "https://onestop.kongju.ac.kr/onestop/17881/subview.do"
                    ),
                    reference_date="2026-07-24",
                )
            ],
            mode="structured",
        )

    if "교환학생" in normalized:
        response = (
            "교환학생은 국제교류과가 학기별로 게시하는 선발 공고에서 지원 대학과 "
            "자격을 확인한 뒤, 공고에 첨부된 서류를 기간 안에 제출해 지원합니다.\n\n"
            "- 해외 대학에 개인이 먼저 신청하는 방식이 아니라, 교내 선발 후 "
            "국제교류과의 추천 절차를 거칩니다.\n"
            "- 재학 학기, 성적, 어학 조건은 대학과 언어권에 따라 다릅니다.\n"
            "- 2026학년도 2학기 모집은 종료되었으므로 다음 선발 공고를 확인해야 합니다.\n\n"
            "[교환학생 선발 공고 확인]"
            "(https://www.kongju.ac.kr/bbs/KNU/2132/424509/artclView.do)"
        )
        return QueryResponse(
            response=response,
            sources=[
                Source(
                    category="국제교류",
                    title="교환학생 선발 안내",
                    snippet=(
                        "국제교류과의 학기별 선발 공고에 따라 교내 선발과 "
                        "추천 절차를 거쳐 지원합니다."
                    ),
                    score=1.0,
                    source_url=(
                        "https://www.kongju.ac.kr/bbs/KNU/2132/424509/"
                        "artclView.do"
                    ),
                    reference_date="2026-07-24",
                )
            ],
            mode="structured",
        )

    if any(keyword in normalized for keyword in ("학점포기", "수강포기")):
        response = (
            "현재 수강 중인 과목을 포기하려는 경우, 해당 학기의 수강포기 기간에 "
            "학교가 안내한 절차로 신청할 수 있습니다.\n\n"
            "- 이미 취득한 학점을 임의로 삭제하는 것과 현재 수강 과목을 "
            "포기하는 것은 다릅니다.\n"
            "- 신청 기간, 대상 과목, 최소 수강학점은 해당 학기의 "
            "최종 수강신청 변경·수강포기 공지를 확인해야 합니다.\n\n"
            "[수강포기 공식 공지 확인]"
            "(https://www.kongju.ac.kr/bbs/KNU/2132/423723/artclView.do)"
        )
        return QueryResponse(
            response=response,
            sources=[
                Source(
                    category="학사",
                    title="최종 수강신청 변경 및 수강포기",
                    snippet=(
                        "현재 수강 과목의 포기는 학기별 공지에 따른 기간과 "
                        "절차를 확인해야 합니다."
                    ),
                    score=1.0,
                    source_url=(
                        "https://www.kongju.ac.kr/bbs/KNU/2132/423723/"
                        "artclView.do"
                    ),
                    reference_date="2026-07-24",
                )
            ],
            mode="structured",
        )

    if "계절학기" in normalized and any(
        keyword in normalized
        for keyword in ("신청", "방법", "학점", "자격", "수강료")
    ):
        response = (
            "계절학기는 재학생이 학기별 수강신청 안내에 따라 신청합니다.\n\n"
            "- 하계는 보통 5~6월, 동계는 11~12월에 모집합니다.\n"
            "- 한 계절학기에 최대 6학점까지 신청할 수 있습니다.\n"
            "- 수강료와 개설 과목은 학기별 공지에서 확인해야 합니다.\n\n"
            "[계절학기 공식 안내]"
            "(https://onestop.kongju.ac.kr/onestop/17886/subview.do)"
        )
        return QueryResponse(
            response=response,
            sources=[
                Source(
                    category="학사",
                    title="계절학기",
                    snippet=(
                        "재학생이 신청할 수 있으며 하계 5~6월, 동계 "
                        "11~12월에 모집하고 최대 6학점까지 신청할 수 있습니다."
                    ),
                    score=1.0,
                    source_url=(
                        "https://onestop.kongju.ac.kr/onestop/17886/subview.do"
                    ),
                    reference_date="2026-07-24",
                )
            ],
            mode="structured",
        )

    return None


def student_service_response(message: str) -> QueryResponse | None:
    normalized = re.sub(r"\s+", "", message)
    asks_about_borrowing = any(
        keyword in normalized
        for keyword in ("몇권", "대출", "빌릴", "빌려", "대여")
    )
    if "도서관" not in normalized or not asks_about_borrowing:
        return None

    response = (
        "학부생은 일반도서를 7권까지 14일 동안 대출할 수 있습니다.\n\n"
        "- 예약 자료와 연체 자료가 아니면 1회 연장할 수 있습니다.\n"
        "- 자료 유형이나 이용자 신분에 따라 기준이 다를 수 있으므로 "
        "도서관 홈페이지에서 현재 대출 상태를 확인해 주세요.\n\n"
        "[도서관 홈페이지](https://library.kongju.ac.kr/)"
    )
    return QueryResponse(
        response=response,
        sources=[
            Source(
                category="학생생활",
                title="도서관 도서 대출",
                snippet=(
                    "학부생은 일반도서를 7권까지 14일 동안 대출할 수 있고 "
                    "조건을 충족하면 1회 연장할 수 있습니다."
                ),
                score=1.0,
                source_url="https://library.kongju.ac.kr/",
                reference_date="2026-07-24",
            )
        ],
        mode="structured",
    )


def meal_selection(message: str) -> tuple[str, str, str | None] | None:
    if not any(
        keyword in message
        for keyword in ("학식", "식단", "학생식당", "오늘 메뉴", "메뉴 알려")
    ):
        return None

    campus = "공주"
    for candidate in ("천안", "예산", "공주", "신관"):
        if candidate in message:
            campus = "공주" if candidate == "신관" else candidate
            break

    location = (
        "기숙사"
        if any(keyword in message for keyword in ("기숙사", "생활관"))
        else "학생식당"
    )
    dorm = None
    dorm_names = (
        "은행사/홍익사/해오름집",
        "비전/블룸하우스",
        "드림하우스",
        "천안 기숙사",
        "예산 기숙사",
    )
    for candidate in dorm_names:
        if candidate in message or any(
            part in message for part in candidate.split("/")
        ):
            dorm = candidate
            break
    return campus, location, dorm


def meal_payload(result: MealResult) -> dict[str, Any]:
    has_meals = bool(result.meals)
    place = (
        result.meals[0].restaurant
        if has_meals
        else f"{result.campus} {result.location}"
    )
    message = (
        f"{result.target_date} {place} 공식 식단을 실시간으로 불러왔습니다."
        if has_meals
        else (
            f"{result.target_date} {place}의 등록된 식단이 없습니다. "
            "방학·주말이거나 학교에서 아직 식단을 등록하지 않은 경우입니다."
        )
    )
    return {
        "status": "live" if has_meals else "no-menu",
        "campus": result.campus,
        "location": result.location,
        "date": result.target_date,
        "meals": [meal.as_dict() for meal in result.meals],
        "message": message,
        "source_url": result.source_url,
        "fetched_at": result.fetched_at,
    }


def meal_response(message: str) -> QueryResponse | None:
    selection = meal_selection(message)
    if selection is None:
        return None
    campus, location, dorm = selection

    try:
        result = fetch_meals(campus=campus, location=location, dorm=dorm)
    except MealScrapeError:
        return QueryResponse(
            response=(
                "공식 식단 페이지에 일시적으로 연결하지 못했습니다. "
                "잠시 후 다시 시도해 주세요.\n\n"
                f"[공식 식단 페이지]({MEAL_SOURCE_URL})"
            ),
            mode="fallback",
        )

    payload = meal_payload(result)
    if not result.meals:
        return QueryResponse(
            response=(
                f"{payload['message']}\n\n"
                f"[공식 식단 페이지]({result.source_url})"
            ),
            sources=[
                Source(
                    category="학생생활",
                    title="실시간 식단",
                    snippet=payload["message"],
                    score=1.0,
                    source_url=result.source_url,
                    reference_date=result.target_date,
                )
            ],
            mode="structured",
        )

    lines = [payload["message"]]
    for meal in result.meals:
        lines.append(
            f"- {meal.restaurant} · {meal.type}: {meal.menu}"
        )
    lines.append(f"\n[공식 식단 페이지]({result.source_url})")
    return QueryResponse(
        response="\n".join(lines),
        sources=[
            Source(
                category="학생생활",
                title="실시간 식단",
                snippet="\n".join(
                    f"{meal.restaurant} {meal.type}: {meal.menu}"
                    for meal in result.meals
                ),
                score=1.0,
                source_url=result.source_url,
                reference_date=result.target_date,
            )
        ],
        mode="structured",
    )


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
            "저장된 셔틀 시간표는 기간이 지나 현재 운행시간으로 안내하지 않습니다. "
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
            presentation={
                "type": "shuttle",
                "status": "최신 시간표 확인 필요",
                "tone": "inactive",
                "description": (
                    "저장된 시간표의 운행기간이 지났습니다. "
                    "공식 시간표에서 최신 정보를 확인해 주세요."
                ),
                "routes": [],
                "notice": "운행기간과 노선은 학기마다 변경될 수 있습니다.",
                "sourceUrl": SHUTTLE_SOURCE_URL,
            },
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
        status_label = "운행 중"
        status_tone = "active"
        service_status = (
            f"현재 {semester} 무료버스 운행기간({start:%m.%d}~{end:%m.%d})입니다."
        )
        period_label = f"{semester} · {start:%m.%d}~{end:%m.%d}"
    elif upcoming_semester:
        semester, start, end = upcoming_semester
        status_label = "방학 · 운행 예정"
        status_tone = "upcoming"
        service_status = (
            f"현재는 방학이라 정규 무료버스 운행기간이 아닙니다. "
            f"{semester}는 {start:%m.%d}~{end:%m.%d} 운행 예정입니다."
        )
        period_label = f"{semester} · {start:%m.%d}~{end:%m.%d}"
    else:
        status_label = "운행 종료"
        status_tone = "inactive"
        service_status = "현재 학기 정규 무료버스 운행기간이 종료되었습니다."
        period_label = "다음 학기 시간표를 확인해 주세요"

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
    routes = shuttle_data.get("shuttle_schedules", [])
    locations = set(tokenize(message))
    mentioned_locations = [
        location
        for _, location in sorted(
            (
                (message.find(location), location)
                for location in location_keywords
                if location in message
            ),
            key=lambda item: item[0],
        )
    ]
    has_direction_intent = any(
        marker in message for marker in ("에서", "부터", "가는", "행", "출발")
    )
    if len(mentioned_locations) >= 2 and has_direction_intent:
        origin, destination = mentioned_locations[:2]

        def follows_direction(route: dict[str, Any]) -> bool:
            route_name = str(route.get("route", "")).replace("캠퍼스", "")
            if "↔" in route_name:
                endpoints = route_name.split("↔", 1)
                return origin in endpoints[0] and destination in endpoints[1]
            if "→" not in route_name:
                return False
            departure, arrival = route_name.split("→", 1)
            return origin in departure and destination in arrival

        matching = [route for route in routes if follows_direction(route)]
    else:
        matching = [
            route
            for route in routes
            if any(location in route.get("route", "") for location in locations)
        ]
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

    wants_circulation = "순환" in message
    if is_general_question or wants_circulation:
        route_by_name = {
            str(route.get("route")): route
            for route in routes
        }

        def timetable_presentation(route_name: str) -> dict[str, Any] | None:
            route = route_by_name.get(route_name)
            if not route:
                return None
            stops = [str(stop) for stop in route.get("stops", []) if stop]
            rows = []
            for index, timetable in enumerate(route.get("timetable", []), start=1):
                times = []
                for stop_index, stop in enumerate(stops):
                    value = timetable.get(stop)
                    if stop_index == 0 and not value:
                        value = timetable.get("departure_time")
                    if stop_index == len(stops) - 1 and not value:
                        value = timetable.get("arrival_time")
                    times.append(value or "–")
                rows.append(
                    {
                        "id": index,
                        "vehicle": timetable.get("vehicle"),
                        "times": times,
                    }
                )
            return {
                "name": route_name,
                "columns": stops,
                "rows": rows,
            }

        group_specs = (
            (
                "cheonan",
                "천안 시내",
                (
                    "천안캠퍼스↔시내 순환(등교시)",
                    "천안캠퍼스↔시내 순환(하교시)",
                ),
            ),
            (
                "campus",
                "캠퍼스 간",
                (
                    "공주→천안",
                    "천안→공주",
                    "공주→예산",
                    "예산→공주",
                ),
            ),
            (
                "yesan",
                "예산·신창",
                ("예산캠퍼스↔신창역 순환",),
            ),
        )
        groups = []
        for group_id, label, route_names in group_specs:
            tables = [
                table
                for route_name in route_names
                if (table := timetable_presentation(route_name))
            ]
            if tables:
                groups.append(
                    {
                        "id": group_id,
                        "label": label,
                        "tables": tables,
                    }
                )

        selected_group = "cheonan"
        if "신창" in message or ("예산" in message and "공주" not in message):
            selected_group = "yesan"
        elif (
            ("공주" in message and any(place in message for place in ("천안", "예산")))
            or "캠퍼스 간" in message
        ):
            selected_group = "campus"

        lines = [
            service_status,
            "",
            "순환버스 시간표를 먼저 보여드릴게요.",
            "- 천안 시내: 등교 08:00~09:30 · 하교 15:30~18:00",
            "- 캠퍼스 간: 공주↔천안 · 공주↔예산",
            "- 예산 순환: 예산캠퍼스↔신창역",
            "",
            "공휴일·주말·개교기념일에는 운행하지 않습니다.",
            f"[순환버스 공식 시간표]({CIRCULATION_SOURCE_URL})",
        ]
        return QueryResponse(
            response="\n".join(lines),
            sources=[source],
            presentation={
                "type": "shuttle",
                "view": "circulation",
                "status": status_label,
                "tone": status_tone,
                "description": service_status,
                "period": period_label,
                "groups": groups,
                "selectedGroup": selected_group,
                "routes": [],
                "notice": (
                    "공휴일·주말·개교기념일에는 운행하지 않습니다."
                ),
                "sourceUrl": CIRCULATION_SOURCE_URL,
            },
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
            presentation={
                "type": "shuttle",
                "status": status_label,
                "tone": status_tone,
                "description": service_status,
                "period": period_label,
                "routes": [],
                "notice": "해당 출발지의 등록된 노선을 찾지 못했습니다.",
                "sourceUrl": SHUTTLE_SOURCE_URL,
            },
            mode="fallback",
        )

    lines = [service_status]
    route_presentations = []
    for route in selected:
        lines.append(f"\n[{route.get('route', '노선')}]")
        stops = [stop for stop in route.get("stops", []) if stop]
        if stops:
            lines.append(f"- 경유: {' → '.join(stops)}")
        for timetable in route.get("timetable", [])[:4]:
            departure = timetable.get("departure_time", "시간 미정")
            arrival = timetable.get("arrival_time") or (
                timetable.get(stops[-1]) if stops else None
            )
            lines.append(
                f"- {departure} 출발"
                + (f" · {arrival} 도착" if arrival else "")
            )
        route_presentations.append(
            {
                "name": route.get("route", "노선"),
                "stops": stops,
                "trips": [
                    {
                        "departure": timetable.get(
                            "departure_time",
                            "시간 미정",
                        ),
                        "arrival": timetable.get("arrival_time")
                        or (timetable.get(stops[-1]) if stops else None),
                        "note": timetable.get("vehicle"),
                    }
                    for timetable in route.get("timetable", [])[:4]
                ],
            }
        )
    lines.append(f"\n[정류장별 공식 시간표]({SHUTTLE_SOURCE_URL})")
    return QueryResponse(
        response="\n".join(lines),
        sources=[source],
        presentation={
            "type": "shuttle",
            "status": status_label,
            "tone": status_tone,
            "description": service_status,
            "period": period_label,
            "routes": route_presentations,
            "notice": "정류장별 도착 시각은 공식 시간표에서 확인해 주세요.",
            "sourceUrl": SHUTTLE_SOURCE_URL,
        },
        mode="structured",
    )


def campus_address_response(message: str) -> QueryResponse | None:
    if not any(
        keyword in message
        for keyword in ("어디", "주소", "위치", "찾아가", "가는 길")
    ):
        return None

    explicit_campus = next(
        (
            campus
            for campus in ("옥룡", "천안", "예산", "신관")
            if campus in message
        ),
        None,
    )
    if explicit_campus is None and any(
        keyword in message
        for keyword in ("공주캠퍼스", "공주대학교", "공주대", "국립공주대")
    ):
        explicit_campus = "공주"

    building_name = None
    building_campus = None
    engineering_match = re.search(r"(?:제\s*)?(\d{1,2})\s*공학관", message)
    if engineering_match:
        number = int(engineering_match.group(1))
        building_name = f"제{number}공학관"
        building_campus = "천안"
    else:
        for aliases, display_name, campus in BUILDING_LOCATIONS:
            if any(alias in message for alias in aliases):
                building_name = display_name
                building_campus = campus
                break

    if (
        not building_name
        and not explicit_campus
        and any(facility in message for facility in AMBIGUOUS_CAMPUS_FACILITIES)
    ):
        content = (
            "해당 시설은 캠퍼스마다 있어 캠퍼스를 함께 지정해야 정확한 건물을 안내할 수 있습니다.\n\n"
            f"- 공주캠퍼스: {CAMPUS_ADDRESSES['공주']}\n"
            f"- 천안캠퍼스: {CAMPUS_ADDRESSES['천안']}\n"
            f"- 예산캠퍼스: {CAMPUS_ADDRESSES['예산']}"
        )
        return QueryResponse(
            response=content,
            sources=[
                Source(
                    category="캠퍼스",
                    title="캠퍼스별 주소",
                    snippet=content,
                    score=1.0,
                    source_url="https://www.kongju.ac.kr/KNU/16713/subview.do",
                )
            ],
            mode="structured",
        )

    campus = building_campus or explicit_campus
    if campus:
        campus_name = CAMPUS_DISPLAY_NAMES[campus]
        address = CAMPUS_ADDRESSES[campus]
        if building_name:
            content = (
                f"{building_name}의 위치는 {campus_name}입니다.\n\n"
                f"- 도로명 주소: {address}\n"
                "- 건물 위치: 아래 공식 캠퍼스맵에서 건물명을 선택하면 확인할 수 있습니다.\n\n"
                "[공식 캠퍼스맵](https://www.kongju.ac.kr/KNU/16708/subview.do)"
            )
            title = f"{building_name} 위치"
            source_url = "https://www.kongju.ac.kr/KNU/16708/subview.do"
        else:
            content = f"{campus_name}의 도로명 주소는 {address}입니다."
            title = f"{campus_name} 주소"
            source_url = "https://www.kongju.ac.kr/KNU/16713/subview.do"
        return QueryResponse(
            response=content,
            sources=[
                Source(
                    category="캠퍼스",
                    title=title,
                    snippet=content,
                    score=1.0,
                    source_url=source_url,
                    reference_date="2026-07-24",
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
    follow_up_markers = (
        "그거",
        "그건",
        "그 글",
        "그 내용",
        "그럼",
        "그러면",
        "아까",
        "해당",
        "내용 보여",
        "자세히",
        "첫 번째",
        "두 번째",
        "세 번째",
    )
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

    if response := meal_response(message):
        return response

    if response := small_talk_response(message):
        return QueryResponse(response=response, mode="small-talk")

    if response := student_news_response(body, message):
        return response

    if response := university_intro_response(message):
        return response

    if response := academic_special_response(message):
        return response

    if response := shuttle_response(message):
        return response

    if "시내버스" in message:
        return QueryResponse(
            response=(
                "시내버스 노선과 도착시간은 실시간으로 바뀌어 PORTY의 저장 자료로 "
                "안내하지 않습니다. 지도·교통 앱에서 현재 위치 기준으로 확인해 주세요."
            ),
            mode="fallback",
        )

    if response := campus_address_response(message):
        return response

    if response := student_service_response(message):
        return response

    search_query = retrieval_message(body, message)
    hits = relevant_hits(retriever.search(search_query, settings.top_k))
    if not hits:
        return QueryResponse(
            response=(
                "저장된 공주대학교 자료에서 관련 내용을 찾지 못했습니다. "
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
def meal(
    campus: str,
    location: str,
    dorm: str | None = None,
    target_date: date | None = None,
) -> dict[str, Any]:
    try:
        result = fetch_meals(
            campus=campus,
            location=location,
            dorm=dorm,
            target_date=target_date,
        )
        return meal_payload(result)
    except MealScrapeError as error:
        return {
            "status": "error",
            "campus": campus,
            "location": location,
            "date": (target_date or datetime.now(KOREA_TIMEZONE).date()).isoformat(),
            "meals": [],
            "message": str(error),
            "source_url": MEAL_SOURCE_URL,
            "fetched_at": datetime.now(KOREA_TIMEZONE).isoformat(timespec="seconds"),
        }
