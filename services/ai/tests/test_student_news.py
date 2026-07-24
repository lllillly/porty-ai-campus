from app.student_news import (
    StudentNewsItem,
    parse_student_news_detail,
    parse_student_news_list,
)


def test_parse_student_news_list_returns_latest_three_student_posts():
    html = """
    <div class="_fnctWrap wrap-notice">
      <a class="subject" href="/bbs/KNU/2132/103/artclView.do?layout=unknown">
        <strong class="sj">세 번째 최신 글</strong>
        <p class="cn">세 번째 글 미리보기</p>
        <span class="date">2026.07.24</span>
      </a>
      <a class="subject" href="/bbs/KNU/2132/102/artclView.do?layout=unknown">
        <strong class="sj">두 번째 최신 글</strong>
        <p class="cn">두 번째 글 미리보기</p>
        <span class="date">2026.07.24</span>
      </a>
      <a class="subject" href="/bbs/KNU/2132/101/artclView.do?layout=unknown">
        <strong class="sj">첫 번째 최신 글</strong>
        <p class="cn"></p>
        <span class="date">2026.07.23</span>
      </a>
      <a class="subject" href="/bbs/KNU/2133/999/artclView.do?layout=unknown">
        <strong class="sj">행정소식은 제외</strong>
        <span class="date">2026.07.25</span>
      </a>
    </div>
    """

    items = parse_student_news_list(html, limit=3)

    assert [item.title for item in items] == [
        "세 번째 최신 글",
        "두 번째 최신 글",
        "첫 번째 최신 글",
    ]
    assert items[2].preview == "이미지 또는 첨부파일로 제공되는 공지입니다."
    assert items[0].url.endswith("/bbs/KNU/2132/103/artclView.do?layout=unknown")


def test_parse_student_news_detail_keeps_body_image_and_attachments():
    html = """
    <h2 class="view-title">학생소식 제목</h2>
    <div class="view-detail">
      <dl class="writer"><dd>학생복지과</dd></dl>
      <dl class="write"><dd>2026.07.24</dd></dl>
    </div>
    <div class="view-con">
      <p>신청 기간은 7월 31일까지입니다.</p>
      <img src="/images/notice.png" alt="공지 포스터">
    </div>
    <div class="view-file">
      <a href="/bbs/KNU/2132/12/download.do" title="파일 다운로드">
        신청서.hwp
      </a>
    </div>
    """

    item = parse_student_news_detail(
        html,
        url=(
            "https://www.kongju.ac.kr/bbs/KNU/2132/103/"
            "artclView.do?layout=unknown"
        ),
    )

    assert item.title == "학생소식 제목"
    assert item.author == "학생복지과"
    assert item.date == "2026.07.24"
    assert item.content == "신청 기간은 7월 31일까지입니다."
    assert item.images == ("https://www.kongju.ac.kr/images/notice.png",)
    assert item.attachments == (
        {
            "name": "신청서.hwp",
            "url": "https://www.kongju.ac.kr/bbs/KNU/2132/12/download.do",
        },
    )


def test_student_news_item_serializes_for_card_presentation():
    item = StudentNewsItem(
        title="최신 학생소식",
        date="2026.07.24",
        url="https://www.kongju.ac.kr/bbs/KNU/2132/1/artclView.do",
        preview="미리보기",
    )

    assert item.as_dict()["title"] == "최신 학생소식"
    assert item.as_dict()["images"] == []
