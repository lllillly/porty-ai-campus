from __future__ import annotations

import json
import math
import re
from collections import Counter
from dataclasses import dataclass
from pathlib import Path
from typing import Any, Iterable


WORD_PATTERN = re.compile(r"[가-힣A-Za-z0-9]+")
SPACE_PATTERN = re.compile(r"\s+")
STOP_WORDS = {
    "관련",
    "그냥",
    "대한",
    "대해",
    "뭐야",
    "알려줘",
    "알려",
    "어디",
    "언제",
    "있어",
    "하는",
    "해줘",
    "어떻게",
    "얼마야",
    "필요해",
    "공주대학교",
    "국립공주대학교",
}
QUERY_EXPANSIONS = {
    "기숙사": ("학생생활관", "생활관"),
    "와이파이": ("무선인터넷",),
    "wifi": ("무선인터넷",),
    "전과": ("모집단위 이동",),
    "학비": ("등록금",),
    "복전": ("복수전공",),
    "셔틀": ("버스",),
    "성적표": ("증명서", "성적"),
    "성적조회": ("성적 조회", "통합정보시스템"),
    "재학증명": ("증명서",),
    "기숙사비": ("생활관비", "학생생활관 비용"),
    "생활관비": ("학생생활관 비용",),
    "주차비": ("주차요금", "주차안내"),
    "학식": ("식단", "학생식당"),
    "학생증": ("학생증 발급",),
    "개강": ("학사일정",),
    "시험기간": ("학사일정",),
    "시험": ("학사일정",),
    "중간고사": ("학사일정",),
    "기말고사": ("학사일정",),
    "계절학기": ("계절수업", "학사일정"),
    "9공학관": ("제9공학관", "천안캠퍼스", "캠퍼스 건물"),
    "언제": ("시기", "기간", "일정"),
    "까지": ("시기", "기간", "일정"),
    "어떻게": ("방법", "절차", "신청"),
    "얼마": ("요금", "비용", "금액"),
}
KOREAN_SUFFIXES = (
    "이라면",
    "이라서",
    "하려면",
    "해야해",
    "해야",
    "까지",
    "부터",
    "에서",
    "으로",
    "라고",
    "이고",
    "이며",
    "에게",
    "한테",
    "처럼",
    "보다",
    "이나",
    "거나",
    "은",
    "는",
    "이",
    "가",
    "을",
    "를",
    "에",
    "도",
    "만",
    "과",
    "와",
    "로",
)


@dataclass(frozen=True)
class Document:
    document_id: str
    title: str
    category: str
    content: str
    source_url: str | None
    reference_date: str | None
    term_frequency: Counter[str]
    length: int


@dataclass(frozen=True)
class SearchHit:
    title: str
    category: str
    snippet: str
    score: float
    source_url: str | None = None
    reference_date: str | None = None


def read_json(path: Path, default: Any) -> Any:
    try:
        with path.open(encoding="utf-8") as file:
            return json.load(file)
    except (FileNotFoundError, json.JSONDecodeError, OSError):
        return default


def clean_text(text: str) -> str:
    return SPACE_PATTERN.sub(" ", text).strip()


def word_tokens(text: str) -> list[str]:
    tokens: list[str] = []
    for raw_token in WORD_PATTERN.findall(text):
        token = raw_token.lower()
        for suffix in KOREAN_SUFFIXES:
            if token.endswith(suffix) and len(token) - len(suffix) >= 2:
                token = token[: -len(suffix)]
                break
        if len(token) >= 2 and token not in STOP_WORDS:
            tokens.append(token)
    return tokens


def token_features(tokens: Iterable[str]) -> list[str]:
    features: list[str] = []
    for token in tokens:
        features.append(token)
        if re.fullmatch(r"[가-힣]{3,10}", token):
            features.extend(
                f"~{token[index:index + 2]}"
                for index in range(len(token) - 1)
            )
    return features


def tokenize(text: str) -> list[str]:
    return token_features(word_tokens(text))


def expanded_query_words(query: str) -> list[str]:
    tokens = word_tokens(query)
    expanded = list(tokens)
    lowered = query.lower()
    for trigger, replacements in QUERY_EXPANSIONS.items():
        if trigger in lowered:
            if trigger == "얼마" and any(
                term in lowered
                for term in (
                    "요금",
                    "비용",
                    "금액",
                    "등록금",
                    "학비",
                    "기숙사비",
                    "생활관비",
                )
            ):
                continue
            for replacement in replacements:
                expanded.extend(word_tokens(replacement))
    return expanded


def expanded_query_tokens(query: str) -> list[str]:
    return token_features(expanded_query_words(query))


class BM25Retriever:
    def __init__(self, data_path: Path):
        payload = read_json(data_path, {"documents": []})
        raw_documents = payload.get("documents") or payload.get("results") or []
        self.documents: list[Document] = []

        for index, raw in enumerate(raw_documents):
            content = str(raw.get("content", "")).strip()
            if len(content) < 40:
                continue
            if "fnctId=sitemap" in content:
                continue

            title = clean_text(str(raw.get("title", ""))) or "공주대학교 안내"
            category = clean_text(str(raw.get("category", ""))) or "학교안내"
            content_tokens = tokenize(content)
            weighted_tokens = list(content_tokens)
            weighted_tokens.extend(tokenize(title) * 5)
            weighted_tokens.extend(tokenize(category) * 2)

            self.documents.append(
                Document(
                    document_id=str(raw.get("id") or index),
                    title=title,
                    category=category,
                    content=content,
                    source_url=raw.get("source_url"),
                    reference_date=raw.get("reference_date"),
                    term_frequency=Counter(weighted_tokens),
                    length=max(len(content_tokens), 1),
                )
            )

        document_frequency: Counter[str] = Counter()
        for document in self.documents:
            document_frequency.update(document.term_frequency.keys())

        document_count = max(len(self.documents), 1)
        self.average_length = (
            sum(document.length for document in self.documents) / document_count
        )
        self.idf = {
            token: math.log(
                1 + (document_count - frequency + 0.5) / (frequency + 0.5)
            )
            for token, frequency in document_frequency.items()
        }

    def search(self, query: str, limit: int = 3) -> list[SearchHit]:
        query_features = Counter(expanded_query_tokens(query))
        query_words = expanded_query_words(query)
        original_query_words = word_tokens(query)
        if not query_features:
            return []

        scored: list[tuple[float, Document]] = []
        for document in self.documents:
            score = self._bm25_score(document, query_features)
            title_lower = document.title.lower()
            normalized_query = clean_text(query).lower()

            if len(title_lower) >= 2 and title_lower in normalized_query:
                score += 18.0

            matched_words = 0
            for word in set(original_query_words):
                if word in title_lower:
                    score += 12.0
                elif len(word) >= 2 and word[:2] in title_lower:
                    score += 10.0

            for word in set(query_words):
                if document.term_frequency.get(word, 0):
                    matched_words += 1

            if query_words:
                score += 2.0 * matched_words / len(set(query_words))

            if score >= 1.0:
                scored.append((score, document))

        scored.sort(key=lambda item: item[0], reverse=True)
        unique_results: list[tuple[float, Document]] = []
        seen_titles: set[str] = set()
        for item in scored:
            title_key = item[1].title.lower()
            if title_key in seen_titles:
                continue
            seen_titles.add(title_key)
            unique_results.append(item)
            if len(unique_results) >= limit:
                break

        return [
            SearchHit(
                title=document.title,
                category=document.category,
                snippet=self._passage(document.content, query_words),
                score=round(score, 4),
                source_url=document.source_url,
                reference_date=document.reference_date,
            )
            for score, document in unique_results
        ]

    def _bm25_score(
        self,
        document: Document,
        query_features: Counter[str],
        k1: float = 1.5,
        b: float = 0.72,
    ) -> float:
        score = 0.0
        length_ratio = document.length / max(self.average_length, 1)
        for token, query_count in query_features.items():
            frequency = document.term_frequency.get(token, 0)
            if not frequency:
                continue
            numerator = frequency * (k1 + 1)
            denominator = frequency + k1 * (1 - b + b * length_ratio)
            term_score = self.idf.get(token, 0.0) * numerator / denominator
            term_score *= 1 + min(query_count - 1, 2) * 0.08
            score += term_score
        return score

    @staticmethod
    def _passage(content: str, query_words: list[str], max_length: int = 720) -> str:
        lines = [clean_text(line) for line in content.splitlines() if clean_text(line)]
        if not lines:
            return clean_text(content)[:max_length]
        if sum(len(line) + 1 for line in lines) <= max_length:
            return "\n".join(lines)

        scored_lines: list[tuple[float, int]] = []
        for index, line in enumerate(lines):
            lowered = line.lower()
            matches = sum(1 for word in set(query_words) if word in lowered)
            score = matches * 3.0
            if matches and re.match(r"^\d+[.)]", line):
                score += 1.0
            if matches == len(set(query_words)) and matches:
                score += 2.0
            scored_lines.append((score, index))

        best_indices = [
            index
            for score, index in sorted(scored_lines, reverse=True)
            if score > 0
        ][:4]
        if not best_indices:
            best_indices = [0]

        selected: set[int] = set()
        for index in best_indices:
            selected.add(index)
            if index > 0 and len(lines[index - 1]) < 80:
                selected.add(index - 1)
            if index + 1 < len(lines):
                selected.add(index + 1)

        passage_lines: list[str] = []
        current_length = 0
        for index in sorted(selected):
            line = lines[index]
            if current_length + len(line) + 1 > max_length:
                continue
            passage_lines.append(line)
            current_length += len(line) + 1

        return "\n".join(passage_lines)


LexicalRetriever = BM25Retriever
