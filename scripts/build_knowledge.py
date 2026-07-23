#!/usr/bin/env python3
"""Build a privacy-safe PORTY knowledge base from official crawl snapshots."""

from __future__ import annotations

import argparse
import json
import re
from collections import Counter
from datetime import datetime
from pathlib import Path
from typing import Any


SPACE_PATTERN = re.compile(r"[ \t]+")
EMAIL_PATTERN = re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}")
PHONE_PATTERN = re.compile(
    r"(?<!\d)\(?(?:01[016789]|0[2-6][1-5]?)\)?[-\s]?\d{3,4}[-\s]?\d{4}(?!\d)"
)
ONLY_SYMBOLS_PATTERN = re.compile(r"^[\W_]+$")
ONLY_NUMBER_PATTERN = re.compile(r"^[\d\s.,:~()/-]+$")

EXCLUDED_TITLE_PARTS = {
    "개인정보",
    "업무추진비",
    "수의계약",
    "정보공개",
    "정책실명",
    "청렴",
    "부패",
    "갑질",
    "감사자료",
    "회의록",
    "채용소식",
    "총장동정",
    "피플",
    "프로필",
    "아르바이트",
    "사고팔고",
    "자취",
    "하숙",
    "구인구직",
    "스터디",
    "묻고답하기",
    "업무제안",
    "안전보건",
    "코로나19",
    "통합검색",
    "HOT 뉴스",
    "SITEMAP",
    "SNS",
    "UI소개",
    "갤러리",
    "공지사항",
    "학생소식",
    "행정소식",
    "행사안내",
    "공무국외여행",
    "기관생명",
    "연구비현황",
}

NOISE_EXACT = {
    "검색",
    "검색닫기",
    "메뉴닫기",
    "모바일 메뉴 열기",
    "본문 바로가기",
    "주메뉴 바로가기",
    "바로가기 메뉴",
    "홈으로",
    "즐겨찾기",
    "즐겨찾는 메뉴",
    "메뉴추가하기",
    "초기화",
    "공유하기",
    "인쇄하기",
    "닫기",
    "Previous",
    "Next",
    "LOGIN",
    "TOP POPUP",
}

NOISE_CONTAINS = (
    "/WEB-INF/",
    "Copyright",
    "오늘하루",
    "오늘 하루",
    "이전 슬라이드",
    "다음 슬라이드",
    "슬라이드 시작",
    "슬라이드 정지",
    "페이스북 공유",
    "트위터 공유",
    "핀터레스트",
    "카카오스토리",
)

CATEGORY_RULES = (
    (
        "학사",
        (
            "학사",
            "학적",
            "휴학",
            "복학",
            "재입학",
            "졸업",
            "수강",
            "성적",
            "전공",
            "교직",
            "학점",
            "계절",
        ),
    ),
    ("입학", ("입학", "편입", "수시", "정시", "외국인")),
    (
        "캠퍼스",
        ("캠퍼스", "찾아오시는", "주차", "버스", "시설물", "무선인터넷"),
    ),
    (
        "학생생활",
        (
            "학생",
            "장학",
            "등록금",
            "학자금",
            "증명서",
            "동아리",
            "복지",
            "상담",
            "건강",
            "식단",
            "기숙사",
            "생활관",
        ),
    ),
    ("대학·학과", ("대학", "학부", "학과", "연구소")),
)

CURATED_DOCUMENTS = (
    {
        "id": "official-course-registration",
        "title": "수강신청",
        "category": "학사",
        "content": (
            "수강신청은 강의일람표를 확인한 뒤 국립공주대학교 수강신청 시스템"
            "(https://sugang.kongju.ac.kr/)에서 로그인하여 진행한다.\n"
            "예비 수강신청(장바구니)에 과목을 담았더라도 본 수강신청 기간에 반드시 다시 신청해야 한다.\n"
            "일반적인 학기당 기준학점은 졸업학점 120~140학점 과정은 18학점 이하, "
            "160학점 과정은 20학점 이하이며 성적·학사경고·조기졸업 여부에 따라 한계학점이 달라질 수 있다.\n"
            "정확한 학기별 신청일은 대표 홈페이지 학생소식 공지를 확인해야 한다."
        ),
        "source_url": "https://onestop.kongju.ac.kr/onestop/17884/subview.do",
        "reference_date": "2026-07-24",
    },
    {
        "id": "official-major-transfer",
        "title": "모집단위 이동(전과)",
        "category": "학사",
        "content": (
            "모집단위 이동(전과)은 다른 학과·학부 또는 전공의 같은 학년으로 소속을 변경하는 제도다.\n"
            "일반적으로 2학기 말 동계방학에 지원서를 접수하고 면접 등을 거쳐 다음 1학기 개강 전에 선발한다.\n"
            "등록횟수와 취득학점 요건을 모두 충족해야 하며 재학 중 1회만 가능하다. "
            "휴학생은 복학예정자에 한해 지원할 수 있다.\n"
            "학년·졸업학점별 세부 자격과 학과별 여석이 다르므로 공식 안내와 소속 학과 사무실에서 확인해야 한다."
        ),
        "source_url": "https://onestop.kongju.ac.kr/onestop/17815/subview.do",
        "reference_date": "2026-07-24",
    },
    {
        "id": "official-dormitory-application",
        "title": "학생생활관 입실 신청",
        "category": "학생생활",
        "content": (
            "학생생활관 입실 일정과 선발 기준은 캠퍼스와 학기마다 별도 공지된다.\n"
            "입실을 희망하면 학생생활관 홈페이지의 해당 캠퍼스 공지에서 모집 일정을 확인하고 "
            "입실 신청 메뉴를 통해 온라인으로 신청한다.\n"
            "증빙서류 제출, 결과 발표, 생활관비 납부 기간이 각각 다를 수 있으므로 "
            "과거 일정이 아닌 해당 학기 최신 공지를 기준으로 해야 한다."
        ),
        "source_url": "https://dormi.kongju.ac.kr/",
        "reference_date": "2026-07-24",
    },
)


def normalize_line(value: str) -> str:
    return SPACE_PATTERN.sub(" ", value).strip()


def redact_contact(value: str) -> str:
    value = EMAIL_PATTERN.sub("[이메일 비공개]", value)
    return PHONE_PATTERN.sub("[전화번호 비공개]", value)


def should_exclude(title: str) -> bool:
    return any(part in title for part in EXCLUDED_TITLE_PARTS)


def infer_category(title: str) -> str:
    for category, keywords in CATEGORY_RULES:
        if any(keyword in title for keyword in keywords):
            return category
    return "학교안내"


def is_noise(line: str, common_lines: set[str]) -> bool:
    if not line or line in NOISE_EXACT or line in common_lines:
        return True
    if any(fragment in line for fragment in NOISE_CONTAINS):
        return True
    if ONLY_SYMBOLS_PATTERN.fullmatch(line) or ONLY_NUMBER_PATTERN.fullmatch(line):
        return True
    return len(line) < 2


def chunk_lines(lines: list[str], max_chars: int = 1_100) -> list[str]:
    chunks: list[str] = []
    current: list[str] = []
    current_size = 0

    for line in lines:
        if current and current_size + len(line) + 1 > max_chars:
            chunks.append("\n".join(current))
            current = current[-2:]
            current_size = sum(len(item) + 1 for item in current)

        current.append(line)
        current_size += len(line) + 1

    if current:
        chunks.append("\n".join(current))

    return [chunk for chunk in chunks if len(chunk) >= 80]


def read_snapshots(source_dir: Path) -> list[dict[str, Any]]:
    snapshots: list[dict[str, Any]] = []
    for path in sorted(source_dir.glob("*.json")):
        try:
            payload = json.loads(path.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, OSError):
            continue

        if not isinstance(payload, dict):
            continue

        title = normalize_line(str(payload.get("menu") or path.stem.rsplit("_", 1)[0]))
        content = str(payload.get("content", ""))
        if should_exclude(title) or len(content) < 80:
            continue

        lines = [normalize_line(line) for line in content.splitlines()]
        url = str(payload.get("url", "")).strip()
        if "onestop.kongju.ac.kr" in url and "담당부서" in lines:
            lines = lines[lines.index("담당부서") :]

        snapshots.append(
            {
                "title": title,
                "url": url,
                "timestamp": str(payload.get("timestamp", "")).strip(),
                "lines": lines,
            }
        )
    return snapshots


def reference_date(timestamp: str) -> str | None:
    try:
        return datetime.fromisoformat(timestamp).date().isoformat()
    except ValueError:
        return None


def build(source_dir: Path) -> dict[str, Any]:
    snapshots = read_snapshots(source_dir)
    line_frequency: Counter[str] = Counter()

    for snapshot in snapshots:
        line_frequency.update(set(snapshot["lines"]))

    common_threshold = max(8, round(len(snapshots) * 0.07))
    common_lines = {
        line
        for line, frequency in line_frequency.items()
        if frequency >= common_threshold
    }

    documents: list[dict[str, Any]] = []
    for snapshot in snapshots:
        seen: set[str] = set()
        clean_lines: list[str] = []
        for raw_line in snapshot["lines"]:
            line = redact_contact(raw_line)
            if is_noise(line, common_lines) or line in seen:
                continue
            seen.add(line)
            clean_lines.append(line)

        for index, content in enumerate(chunk_lines(clean_lines), start=1):
            documents.append(
                {
                    "id": f"{snapshot['title']}-{index}",
                    "title": snapshot["title"],
                    "category": infer_category(snapshot["title"]),
                    "content": content,
                    "source_url": snapshot["url"] or None,
                    "reference_date": reference_date(snapshot["timestamp"]),
                }
            )

    documents.extend(CURATED_DOCUMENTS)

    return {
        "version": 1,
        "generated_from": "국립공주대학교 공식 홈페이지 크롤링 스냅샷",
        "documents": documents,
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--source-dir", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()

    payload = build(args.source_dir)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(f"wrote {len(payload['documents'])} documents to {args.output}")


if __name__ == "__main__":
    main()
