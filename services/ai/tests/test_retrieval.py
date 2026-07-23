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
        ("주차 요금이 얼마야?", "주차안내"),
        ("장학금 신청 시기가 언제야?", "장학안내"),
        ("전과는 어떻게 해?", "모집단위 이동(전과)"),
        ("기숙사 신청은 어떻게 해?", "학생생활관 입실 신청"),
        ("와이파이 사용법 알려줘", "정보서비스"),
        ("수강신청 어떻게 해?", "수강신청"),
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


def test_answer_context_includes_source_metadata(retriever):
    hit = retriever.search("수강신청 방법", 1)[0]
    context = build_context([hit])

    assert "제목: 수강신청" in context
    assert "공식 출처:" in context
    assert "학교 자료 1" in context
    assert "수강신청 시스템" in extractive_answer(hit)
