from __future__ import annotations

import re

from .models import QueryResponse, Source


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
CAMPUS_ADDRESS_URL = "https://www.kongju.ac.kr/KNU/16713/subview.do"
CAMPUS_MAP_URL = "https://www.kongju.ac.kr/KNU/16708/subview.do"


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
        building_name = f"제{int(engineering_match.group(1))}공학관"
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
                    source_url=CAMPUS_ADDRESS_URL,
                )
            ],
            mode="structured",
        )

    campus = building_campus or explicit_campus
    if not campus:
        return None

    campus_name = CAMPUS_DISPLAY_NAMES[campus]
    address = CAMPUS_ADDRESSES[campus]
    if building_name:
        content = (
            f"{building_name}의 위치는 {campus_name}입니다.\n\n"
            f"- 도로명 주소: {address}\n"
            "- 건물 위치: 아래 공식 캠퍼스맵에서 건물명을 선택하면 확인할 수 있습니다.\n\n"
            f"[공식 캠퍼스맵]({CAMPUS_MAP_URL})"
        )
        title = f"{building_name} 위치"
        source_url = CAMPUS_MAP_URL
    else:
        content = f"{campus_name}의 도로명 주소는 {address}입니다."
        title = f"{campus_name} 주소"
        source_url = CAMPUS_ADDRESS_URL

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
