from __future__ import annotations

from typing import Literal

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


class QueryResponse(BaseModel):
    response: str
    sources: list[Source] = []
    mode: Literal["small-talk", "structured", "retrieval", "fallback"]

