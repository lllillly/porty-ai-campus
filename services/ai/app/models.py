from __future__ import annotations

from typing import Any, Literal

from pydantic import BaseModel, Field


class ChatMessage(BaseModel):
    role: Literal["system", "user", "assistant"]
    content: str = Field(min_length=1, max_length=2_000)


class QueryRequest(BaseModel):
    sessionId: str | None = Field(default=None, max_length=120)
    messages: list[ChatMessage] = Field(min_length=1, max_length=30)


class Source(BaseModel):
    category: str
    title: str
    snippet: str
    score: float
    source_url: str | None = None
    reference_date: str | None = None


class QueryResponse(BaseModel):
    response: str
    sources: list[Source] = Field(default_factory=list)
    presentation: dict[str, Any] | None = None
    mode: Literal[
        "small-talk",
        "structured",
        "generated",
        "retrieval",
        "fallback",
    ]
