import json
import re
from pathlib import Path

import pytest

from app.generator import build_context, extractive_answer
from app.retrieval import BM25Retriever


DATA_PATH = Path(__file__).resolve().parents[1] / "data" / "knowledge.json"


@pytest.fixture(scope="module")
def retriever():
    return BM25Retriever(DATA_PATH)


@pytest.mark.parametrize(
    ("question", "expected_title"),
    [
        ("복학은 언제까지 해야 해?", "복학"),
        ("졸업하려면 몇 학점 필요해?", "졸업"),
        ("졸업 학점은 몇 학점이야?", "졸업"),
        ("주차 요금이 얼마야?", "주차안내"),
        ("장학금 신청 시기가 언제야?", "장학안내"),
        ("전과는 어떻게 해?", "모집단위 이동(전과)"),
        ("기숙사 신청은 어떻게 해?", "학생생활관 입실 신청"),
        ("와이파이 사용법 알려줘", "와이파이·무선인터넷"),
        ("수강신청 어떻게 해?", "수강신청"),
        ("성적은 어디서 확인해?", "성적 조회"),
        ("복수전공 신청 방법은?", "복수전공"),
        ("등록금 납부 방법 알려줘", "등록금 납부"),
        ("일반 학생증은 어떻게 발급해?", "학생증 발급"),
        ("9공학관은 어디야?", "캠퍼스 건물 위치"),
        ("도서관 이용 시간 알려줘", "도서관 이용"),
        ("기숙사비가 얼마야?", "학생생활관 비용"),
        ("오늘 학식 메뉴 알려줘", "학식 식단 확인"),
        ("상담센터 이용 방법 알려줘", "학생상담센터 이용"),
        ("시험 기간이 언제야?", "학사일정 확인"),
        ("계절학기 신청은 언제야?", "학사일정 확인"),
        ("학자금 대출은 어떻게 해?", "학자금 대출"),
        ("동아리 가입 방법 알려줘", "동아리 가입"),
        ("분실물은 어디서 확인해?", "분실물 확인"),
    ],
)
def test_common_student_questions_rank_correct_document(
    retriever,
    question,
    expected_title,
):
    hits = retriever.search(question, 3)

    assert hits
    assert hits[0].title == expected_title
    assert hits[0].snippet


def test_knowledge_base_contains_no_raw_contact_details():
    payload = json.loads(DATA_PATH.read_text(encoding="utf-8"))
    contents = [document["content"] for document in payload["documents"]]

    assert not any(
        re.search(
            r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}",
            content,
        )
        for content in contents
    )
    assert not any(
        re.search(
            r"\(?(?:01[016789]|0[2-6][1-5]?)\)?[-\s]?\d{3,4}[-\s]?\d{4}",
            content,
        )
        for content in contents
    )


def test_knowledge_base_excludes_personal_community_boards():
    payload = json.loads(DATA_PATH.read_text(encoding="utf-8"))
    titles = {document["title"] for document in payload["documents"]}

    assert titles.isdisjoint(
        {
            "곰나루광장",
            "열린광장",
            "분실물센터",
            "사고팔고",
            "자취하숙",
            "아르바이트",
        }
    )


def test_answer_context_includes_source_metadata(retriever):
    hit = retriever.search("수강신청 방법", 1)[0]
    context = build_context([hit])

    assert "제목: 수강신청" in context
    assert "공식 출처:" in context
    assert "학교 자료 1" in context
    assert "수강신청 시스템" in extractive_answer(hit)
