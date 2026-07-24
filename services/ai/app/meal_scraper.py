from __future__ import annotations

from concurrent.futures import ThreadPoolExecutor
from dataclasses import dataclass
from datetime import date, datetime
import re
import ssl
from typing import Callable
from zoneinfo import ZoneInfo

from bs4 import BeautifulSoup
import certifi
import httpx


KOREA_TIMEZONE = ZoneInfo("Asia/Seoul")
# The university web server still negotiates a legacy cipher suite. Certificate
# verification remains enabled with certifi; only OpenSSL's cipher security
# level is relaxed for this host compatibility.
KONGJU_SSL_CONTEXT = ssl.create_default_context(cafile=certifi.where())
KONGJU_SSL_CONTEXT.set_ciphers("DEFAULT:@SECLEVEL=1")
EMPTY_MENU_MARKERS = (
    "등록된 식단내용이(가) 없습니다",
    "등록된 식단내용이 없습니다",
)
STUDENT_RESTAURANTS = {
    "공주": (
        ("신관 소담", "https://www.kongju.ac.kr/KNU/16862/subview.do"),
        ("신관 늘솜", "https://www.kongju.ac.kr/KNU/16863/subview.do"),
    ),
    "천안": (
        ("천안 학생식당", "https://www.kongju.ac.kr/KNU/16865/subview.do"),
    ),
    "예산": (
        ("예산 학생식당", "https://www.kongju.ac.kr/KNU/16869/subview.do"),
    ),
}
DORMITORIES = {
    ("공주", "은행사/홍익사/해오름집"): (
        "공주 은행사/홍익사/해오름집",
        "https://dormi.kongju.ac.kr/HOME/sub.php?code=041301",
    ),
    ("공주", "비전/블룸하우스"): (
        "공주 비전/블룸하우스",
        "https://dormi.kongju.ac.kr/HOME/sub.php?code=041302",
    ),
    ("공주", "드림하우스"): (
        "공주 드림하우스",
        "https://dormi.kongju.ac.kr/HOME/sub.php?code=041303",
    ),
    ("천안", "천안 기숙사"): (
        "천안 학생생활관",
        "https://dormi.kongju.ac.kr/HOME/sub.php?code=041304",
    ),
    ("예산", "예산 기숙사"): (
        "예산 학생생활관",
        "https://dormi.kongju.ac.kr/HOME/sub.php?code=041305",
    ),
}


@dataclass(frozen=True)
class Meal:
    date: str
    type: str
    menu: str
    restaurant: str

    def as_dict(self) -> dict[str, str]:
        return {
            "date": self.date,
            "type": self.type,
            "menu": self.menu,
            "restaurant": self.restaurant,
        }


@dataclass(frozen=True)
class MealResult:
    campus: str
    location: str
    target_date: str
    meals: tuple[Meal, ...]
    source_url: str
    fetched_at: str


class MealScrapeError(RuntimeError):
    pass


def _clean(value: str) -> str:
    return re.sub(r"[ \t\r\f\v]+", " ", value).strip()


def _menu_text(cell: object) -> str:
    get_text = getattr(cell, "get_text")
    lines = [_clean(line) for line in get_text("\n").splitlines()]
    return " · ".join(line for line in lines if line)


def _has_menu(menu: str) -> bool:
    return bool(menu) and not any(marker in menu for marker in EMPTY_MENU_MARKERS)


def parse_student_restaurant(
    html: str,
    *,
    restaurant: str,
    target_date: date,
) -> list[Meal]:
    soup = BeautifulSoup(html, "html.parser")
    table = soup.select_one("#_JW_diet_basic table._fnTable")
    if table is None:
        raise MealScrapeError("학생식당 식단표를 찾지 못했습니다.")

    dates: list[str] = []
    for header in table.select("thead th"):
        match = re.search(r"(\d{4})[.-](\d{2})[.-](\d{2})", header.get_text(" "))
        if match:
            dates.append("-".join(match.groups()))

    target = target_date.isoformat()
    if target not in dates:
        return []
    target_index = dates.index(target)

    meals: list[Meal] = []
    for row in table.select("tbody tr"):
        cells = row.find_all(["th", "td"], recursive=False)
        if len(cells) <= target_index + 1:
            continue
        meal_type = _clean(cells[0].get_text(" "))
        menu = _menu_text(cells[target_index + 1])
        if meal_type and _has_menu(menu):
            meals.append(
                Meal(
                    date=target,
                    type=meal_type,
                    menu=menu,
                    restaurant=restaurant,
                )
            )
    return meals


def parse_dormitory(
    html: str,
    *,
    restaurant: str,
    target_date: date,
) -> list[Meal]:
    soup = BeautifulSoup(html, "html.parser")
    table = soup.select_one("table.table-board.food")
    if table is None:
        raise MealScrapeError("생활관 식단표를 찾지 못했습니다.")

    meal_columns = (
        ("breakfast", "조식"),
        ("lunch", "중식"),
        ("dinner", "석식"),
    )
    for row in table.select("tbody tr"):
        date_cell = row.select_one('[data-mqtitle="date"]')
        if date_cell is None:
            continue
        match = re.search(
            r"(\d{1,2})월\s*(\d{1,2})일",
            date_cell.get_text(" ", strip=True),
        )
        if not match:
            continue
        row_date = date(target_date.year, int(match.group(1)), int(match.group(2)))
        if row_date != target_date:
            continue

        meals: list[Meal] = []
        for key, label in meal_columns:
            cell = row.select_one(f'[data-mqtitle="{key}"]')
            if cell is None:
                continue
            menu = _menu_text(cell)
            if _has_menu(menu):
                meals.append(
                    Meal(
                        date=target_date.isoformat(),
                        type=label,
                        menu=menu,
                        restaurant=restaurant,
                    )
                )
        return meals
    return []


def _download(url: str) -> str:
    try:
        response = httpx.get(
            url,
            headers={
                "User-Agent": (
                    "Mozilla/5.0 (compatible; PORTY/1.0; "
                    "+https://porty-ai-campus.vercel.app)"
                ),
                "Accept-Language": "ko-KR,ko;q=0.9",
            },
            follow_redirects=True,
            timeout=10.0,
            verify=KONGJU_SSL_CONTEXT,
        )
        response.raise_for_status()
        return response.text
    except httpx.HTTPError as error:
        raise MealScrapeError("공식 식단 페이지에 연결하지 못했습니다.") from error


def fetch_meals(
    *,
    campus: str,
    location: str,
    dorm: str | None = None,
    target_date: date | None = None,
    downloader: Callable[[str], str] = _download,
) -> MealResult:
    target_date = target_date or datetime.now(KOREA_TIMEZONE).date()
    fetched_at = datetime.now(KOREA_TIMEZONE).isoformat(timespec="seconds")

    if location == "기숙사":
        default_dorm = {
            "공주": "은행사/홍익사/해오름집",
            "천안": "천안 기숙사",
            "예산": "예산 기숙사",
        }.get(campus)
        source = DORMITORIES.get((campus, dorm or default_dorm or ""))
        if source is None:
            raise MealScrapeError("선택한 생활관의 식단 페이지가 없습니다.")
        restaurant, url = source
        meals = parse_dormitory(
            downloader(url),
            restaurant=restaurant,
            target_date=target_date,
        )
        return MealResult(
            campus=campus,
            location=location,
            target_date=target_date.isoformat(),
            meals=tuple(meals),
            source_url=url,
            fetched_at=fetched_at,
        )

    sources = STUDENT_RESTAURANTS.get(campus)
    if not sources:
        raise MealScrapeError("선택한 캠퍼스의 학생식당 페이지가 없습니다.")

    def scrape(source: tuple[str, str]) -> list[Meal]:
        restaurant, url = source
        return parse_student_restaurant(
            downloader(url),
            restaurant=restaurant,
            target_date=target_date,
        )

    try:
        with ThreadPoolExecutor(max_workers=len(sources)) as executor:
            meal_groups = list(executor.map(scrape, sources))
    except MealScrapeError:
        raise
    meals = tuple(meal for group in meal_groups for meal in group)
    return MealResult(
        campus=campus,
        location=location,
        target_date=target_date.isoformat(),
        meals=meals,
        source_url=sources[0][1],
        fetched_at=fetched_at,
    )
