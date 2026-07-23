from __future__ import annotations

import os
from dataclasses import dataclass
from pathlib import Path


SERVICE_ROOT = Path(__file__).resolve().parents[1]


@dataclass(frozen=True)
class Settings:
    data_path: Path
    shuttle_path: Path
    small_talk_path: Path
    profanity_path: Path
    top_k: int
    allowed_origins: tuple[str, ...]


def load_settings() -> Settings:
    data_dir = SERVICE_ROOT / "data"
    configured_data_path = os.getenv("PORTY_DATA_PATH")
    repository_root = SERVICE_ROOT.parents[1]
    data_path = data_dir / "split_results_two.json"

    if configured_data_path:
        configured_path = Path(configured_data_path).expanduser()
        data_path = (
            configured_path
            if configured_path.is_absolute()
            else repository_root / configured_path
        )

    return Settings(
        data_path=data_path.resolve(),
        shuttle_path=data_dir / "shuttlebus.json",
        small_talk_path=data_dir / "small_talk.json",
        profanity_path=data_dir / "profanity.json",
        top_k=max(1, min(int(os.getenv("PORTY_TOP_K", "3")), 5)),
        allowed_origins=tuple(
            origin.strip()
            for origin in os.getenv(
                "PORTY_ALLOWED_ORIGINS",
                "http://localhost:5173,http://127.0.0.1:5173",
            ).split(",")
            if origin.strip()
        ),
    )
