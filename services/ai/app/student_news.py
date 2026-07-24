from __future__ import annotations

from concurrent.futures import ThreadPoolExecutor
from dataclasses import dataclass
from datetime import datetime
from difflib import SequenceMatcher
import re
from typing import Callable, Sequence
from urllib.parse import urlencode, urljoin
from zoneinfo import ZoneInfo

from bs4 import BeautifulSoup
import httpx

from .meal_scraper import KONGJU_SSL_CONTEXT


KOREA_TIMEZONE = ZoneInfo("Asia/Seoul")
KONGJU_HOME_URL = "https://www.kongju.ac.kr/KNU/index.do"
STUDENT_NEWS_URL = (
    "https://www.kongju.ac.kr/bbs/KNU/2132/artclList.do?layout=unknown"
)
STUDENT_NEWS_SEARCH_URL = (
    "https://www.kongju.ac.kr/bbs/KNU/2132/artclList.do"
)
STUDENT_NEWS_LINK_PATTERN = re.compile(
    r"/bbs/KNU/2132/\d+/artclView\.do"
)
NOTICE_LINK_SUFFIX_PATTERN = re.compile(
    r"\s*(?:링크|원문|게시글|페이지|주소)(?:를|을|도)?"
    r"\s*(?:알려\s*줘|알려\s*주세요|보여\s*줘|찾아\s*줘|줘|주세요)?"
    r"\s*[.!?]*$"
)


@dataclass(frozen=True)
class StudentNewsItem:
    title: str
    date: str
    url: str
    preview: str
    author: str | None = None
    content: str | None = None
    images: tuple[str, ...] = ()
    attachments: tuple[dict[str, str], ...] = ()

    def as_dict(self) -> dict[str, object]:
        return {
            "title": self.title,
            "date": self.date,
            "url": self.url,
            "preview": self.preview,
            "author": self.author,
            "content": self.content,
            "images": list(self.images),
            "attachments": list(self.attachments),
        }


class StudentNewsError(RuntimeError):
    pass


def _clean(value: str) -> str:
    return re.sub(r"\s+", " ", value).strip()


def student_news_search_term(message: str) -> str:
    return NOTICE_LINK_SUFFIX_PATTERN.sub("", _clean(message)).strip()


def student_news_search_url(search_term: str) -> str:
    query = urlencode(
        {
            "srchColumn": "sj",
            "srchWrd": _clean(search_term)[:160],
        }
    )
    return f"{STUDENT_NEWS_SEARCH_URL}?{query}"


def _title_key(value: str) -> str:
    return re.sub(r"[^가-힣a-z0-9]", "", value.lower())


def _title_score(query: str, title: str) -> float:
    query_key = _title_key(query)
    title_key = _title_key(title)
    if not query_key or not title_key:
        return 0.0
    if title_key in query_key or query_key in title_key:
        return 1.0

    query_terms = set(re.findall(r"[가-힣A-Za-z0-9]+", query.lower()))
    title_terms = set(re.findall(r"[가-힣A-Za-z0-9]+", title.lower()))
    overlap = len(query_terms & title_terms) / max(len(title_terms), 1)
    similarity = SequenceMatcher(None, query_key, title_key).ratio()
    return overlap * 0.7 + similarity * 0.3


def parse_student_news_list(
    html: str,
    *,
    limit: int = 3,
) -> list[StudentNewsItem]:
    soup = BeautifulSoup(html, "html.parser")
    items: list[StudentNewsItem] = []
    seen_urls: set[str] = set()

    anchors = soup.select(
        'a.subject[href*="/bbs/KNU/2132/"], '
        'td.td-subject a[href*="/bbs/KNU/2132/"]'
    )
    for anchor in anchors:
        href = str(anchor.get("href", "")).strip()
        url = urljoin(KONGJU_HOME_URL, href)
        if not STUDENT_NEWS_LINK_PATTERN.search(url) or url in seen_urls:
            continue

        row = anchor.find_parent("tr")
        title_node = anchor.select_one(".sj, strong")
        date_node = anchor.select_one(".date")
        if date_node is None and row is not None:
            date_node = row.select_one(".td-date")
        preview_node = anchor.select_one(".cn")
        author_node = row.select_one(".td-write") if row is not None else None
        title = _clean(title_node.get_text(" ")) if title_node else ""
        date = _clean(date_node.get_text(" ")) if date_node else ""
        preview = _clean(preview_node.get_text(" ")) if preview_node else ""
        if not title or not date:
            continue

        items.append(
            StudentNewsItem(
                title=title,
                date=date,
                url=url,
                preview=preview or "이미지 또는 첨부파일로 제공되는 공지입니다.",
                author=(
                    _clean(author_node.get_text(" "))
                    if author_node is not None
                    else None
                ),
            )
        )
        seen_urls.add(url)
        if len(items) >= limit:
            break

    if not items:
        raise StudentNewsError("학생소식 목록을 찾지 못했습니다.")
    return items


def parse_student_news_detail(html: str, *, url: str) -> StudentNewsItem:
    soup = BeautifulSoup(html, "html.parser")
    title_node = soup.select_one(".view-title")
    if title_node is None:
        raise StudentNewsError("학생소식 본문을 찾지 못했습니다.")

    title = _clean(title_node.get_text(" "))
    author_node = soup.select_one(".view-detail .writer dd")
    date_node = soup.select_one(".view-detail .write dd")
    content_node = soup.select_one(".view-con")
    content = _clean(content_node.get_text(" ")) if content_node else ""
    images = tuple(
        urljoin(url, str(image.get("src", "")).strip())
        for image in (content_node.select("img[src]") if content_node else [])
        if str(image.get("src", "")).strip()
    )[:3]

    attachments: list[dict[str, str]] = []
    for anchor in soup.select('.view-file a[title*="다운로드"]'):
        href = str(anchor.get("href", "")).strip()
        name = _clean(anchor.get_text(" "))
        if href and name:
            attachments.append(
                {
                    "name": name,
                    "url": urljoin(url, href),
                }
            )

    if not content:
        content = (
            "본문이 이미지로 제공되는 공지입니다. 아래 공지 이미지를 확인하거나 "
            "공식 원문을 열어 자세한 내용을 확인해 주세요."
            if images
            else "본문은 공식 게시글과 첨부파일에서 확인해 주세요."
        )

    return StudentNewsItem(
        title=title,
        date=_clean(date_node.get_text(" ")) if date_node else "",
        url=url,
        preview=content[:180],
        author=_clean(author_node.get_text(" ")) if author_node else None,
        content=content[:1_200],
        images=images,
        attachments=tuple(attachments[:5]),
    )


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
            timeout=12.0,
            verify=KONGJU_SSL_CONTEXT,
        )
        response.raise_for_status()
        return response.text
    except httpx.HTTPError as error:
        raise StudentNewsError(
            "공식 학생소식 페이지에 연결하지 못했습니다."
        ) from error


def fetch_latest_student_news(
    *,
    limit: int = 3,
    downloader: Callable[[str], str] = _download,
) -> tuple[StudentNewsItem, ...]:
    return tuple(
        parse_student_news_list(
            downloader(KONGJU_HOME_URL),
            limit=limit,
        )
    )


def fetch_matching_student_news(
    query: str,
    *,
    limit: int = 3,
    downloader: Callable[[str], str] = _download,
) -> tuple[StudentNewsItem, ...]:
    search_term = student_news_search_term(query)
    if len(search_term) < 4:
        return ()

    items = parse_student_news_list(
        downloader(student_news_search_url(search_term)),
        limit=30,
    )
    ranked = sorted(
        (
            (_title_score(search_term, item.title), item)
            for item in items
        ),
        key=lambda result: result[0],
        reverse=True,
    )
    return tuple(item for score, item in ranked if score >= 0.62)[:limit]


def fetch_student_news_details(
    urls: Sequence[str],
    *,
    downloader: Callable[[str], str] = _download,
) -> tuple[StudentNewsItem, ...]:
    safe_urls = [
        url
        for url in urls[:3]
        if re.match(
            r"^https://www\.kongju\.ac\.kr/bbs/KNU/2132/\d+/"
            r"artclView\.do",
            url,
        )
    ]
    if not safe_urls:
        raise StudentNewsError("확인할 학생소식 링크가 없습니다.")

    def fetch(url: str) -> StudentNewsItem:
        return parse_student_news_detail(downloader(url), url=url)

    with ThreadPoolExecutor(max_workers=len(safe_urls)) as executor:
        return tuple(executor.map(fetch, safe_urls))


def fetched_at() -> str:
    return datetime.now(KOREA_TIMEZONE).isoformat(timespec="seconds")
