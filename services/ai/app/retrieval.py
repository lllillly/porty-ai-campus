from __future__ import annotations

import json
import math
import re
from collections import Counter
from dataclasses import dataclass
from pathlib import Path
from typing import Any


TOKEN_PATTERN = re.compile(r"[가-힣A-Za-z0-9]{2,}")
WHITESPACE_PATTERN = re.compile(r"\s+")
STOP_WORDS = {
    "관련",
    "그냥",
    "대한",
    "대해",
    "뭐야",
    "알려줘",
    "어디",
    "언제",
    "있어",
    "하는",
    "공주대학교",
    "국립공주대학교",
}


@dataclass(frozen=True)
class Document:
    title: str
    category: str
    content: str
    term_frequency: Counter[str]


@dataclass(frozen=True)
class SearchHit:
    title: str
    category: str
    snippet: str
    score: float


def read_json(path: Path, default: Any) -> Any:
    try:
        with path.open(encoding="utf-8") as file:
            return json.load(file)
    except (FileNotFoundError, json.JSONDecodeError, OSError):
        return default


def tokenize(text: str) -> list[str]:
    return [
        token.lower()
        for token in TOKEN_PATTERN.findall(text)
        if token.lower() not in STOP_WORDS
    ]


def clean_text(text: str) -> str:
    return WHITESPACE_PATTERN.sub(" ", text).strip()


class LexicalRetriever:
    def __init__(self, data_path: Path):
        raw_documents = read_json(data_path, {"results": []}).get("results", [])
        self.documents: list[Document] = []

        for raw in raw_documents:
            content = clean_text(str(raw.get("content", "")))
            if len(content) < 24:
                continue
            tokens = tokenize(content)
            self.documents.append(
                Document(
                    title=clean_text(str(raw.get("title", ""))) or "공주대학교 안내",
                    category=clean_text(str(raw.get("category", ""))) or "대학 정보",
                    content=content,
                    term_frequency=Counter(tokens),
                )
            )

        document_frequency: Counter[str] = Counter()
        for document in self.documents:
            document_frequency.update(document.term_frequency.keys())

        document_count = max(len(self.documents), 1)
        self.idf = {
            token: math.log((document_count + 1) / (frequency + 1)) + 1
            for token, frequency in document_frequency.items()
        }

    def search(self, query: str, limit: int = 3) -> list[SearchHit]:
        query_tokens = Counter(tokenize(query))
        if not query_tokens:
            return []

        scored: list[tuple[float, Document]] = []
        for document in self.documents:
            score = 0.0
            for token, query_count in query_tokens.items():
                frequency = document.term_frequency.get(token, 0)
                if frequency:
                    score += (
                        (1 + math.log(frequency))
                        * self.idf.get(token, 1.0)
                        * query_count
                    )

            if score > 0:
                length_penalty = math.sqrt(max(sum(document.term_frequency.values()), 1))
                scored.append((score / length_penalty, document))

        scored.sort(key=lambda item: item[0], reverse=True)
        return [
            SearchHit(
                title=document.title,
                category=document.category,
                snippet=self._snippet(document.content, query_tokens.keys()),
                score=round(score, 4),
            )
            for score, document in scored[:limit]
        ]

    @staticmethod
    def _snippet(content: str, tokens: Any, max_length: int = 440) -> str:
        lowered = content.lower()
        positions = [lowered.find(token) for token in tokens if lowered.find(token) >= 0]
        start = max(0, (min(positions) if positions else 0) - 80)
        snippet = content[start : start + max_length]

        if start > 0:
            snippet = f"…{snippet}"
        if start + max_length < len(content):
            snippet = f"{snippet}…"
        return snippet

