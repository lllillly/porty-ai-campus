"""Vercel Python Function entrypoint for the PORTY FastAPI application."""

from services.ai.app.main import app

__all__ = ["app"]
