#!/usr/bin/env python3
"""Build a privacy-safe PORTY knowledge base from official crawl snapshots."""

from __future__ import annotations

import argparse
import json
import re
from collections import Counter
from datetime import datetime
from pathlib import Path
from typing import Any


SPACE_PATTERN = re.compile(r"[ \t]+")
EMAIL_PATTERN = re.compile(r"[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}")
PHONE_PATTERN = re.compile(
    r"(?<!\d)\(?(?:01[016789]|0[2-6][1-5]?)\)?[-\s]?\d{3,4}[-\s]?\d{4}(?!\d)"
)
ONLY_SYMBOLS_PATTERN = re.compile(r"^[\W_]+$")
ONLY_NUMBER_PATTERN = re.compile(r"^[\d\s.,:~()/-]+$")

EXCLUDED_TITLE_PARTS = {
    "개인정보",
    "업무추진비",
    "수의계약",
    "정보공개",
    "정책실명",
    "청렴",
    "부패",
    "갑질",
    "감사자료",
    "회의록",
    "채용소식",
    "총장동정",
    "피플",
    "프로필",
    "아르바이트",
    "사고팔고",
    "자취",
    "하숙",
    "구인구직",
    "곰나루광장",
    "열린광장",
    "분실물센터",
    "스터디",
    "묻고답하기",
    "업무제안",
    "안전보건",
    "코로나19",
    "통합검색",
    "HOT 뉴스",
    "SITEMAP",
    "SNS",
    "UI소개",
    "갤러리",
    "공지사항",
    "학생소식",
    "행정소식",
    "행사안내",
    "공무국외여행",
    "기관생명",
    "연구비현황",
    "사전정보공표",
    "비공개 대상정보",
    "정보목록",
    "대학정보공시",
    "재정현황",
    "자체평가",
}

NOISE_EXACT = {
    "검색",
    "검색닫기",
    "메뉴닫기",
    "모바일 메뉴 열기",
    "본문 바로가기",
    "주메뉴 바로가기",
    "바로가기 메뉴",
    "홈으로",
    "즐겨찾기",
    "즐겨찾는 메뉴",
    "메뉴추가하기",
    "초기화",
    "공유하기",
    "인쇄하기",
    "닫기",
    "Previous",
    "Next",
    "LOGIN",
    "TOP POPUP",
}

NOISE_CONTAINS = (
    "/WEB-INF/",
    "Copyright",
    "오늘하루",
    "오늘 하루",
    "이전 슬라이드",
    "다음 슬라이드",
    "슬라이드 시작",
    "슬라이드 정지",
    "페이스북 공유",
    "트위터 공유",
    "핀터레스트",
    "카카오스토리",
)

CATEGORY_RULES = (
    (
        "학사",
        (
            "학사",
            "학적",
            "휴학",
            "복학",
            "재입학",
            "졸업",
            "수강",
            "성적",
            "전공",
            "교직",
            "학점",
            "계절",
        ),
    ),
    ("입학", ("입학", "편입", "수시", "정시", "외국인")),
    (
        "캠퍼스",
        ("캠퍼스", "찾아오시는", "주차", "버스", "시설물", "무선인터넷"),
    ),
    (
        "학생생활",
        (
            "학생",
            "장학",
            "등록금",
            "학자금",
            "증명서",
            "동아리",
            "복지",
            "상담",
            "건강",
            "식단",
            "기숙사",
            "생활관",
        ),
    ),
    ("대학·학과", ("대학", "학부", "학과", "연구소")),
)

CURATED_REPLACED_TITLES = {
    "강의일람",
    "국제학생증발급",
    "무료버스",
    "복학",
    "졸업",
    "식단",
    "시설물사용신청",
    "장학안내",
    "재입학",
    "제적·자퇴",
    "주요일정",
    "증명서발급",
    "학사일정안내",
    "휴학",
    "정보서비스",
}

CURATED_DOCUMENTS = (
    {
        "id": "official-course-registration",
        "title": "수강신청",
        "category": "학사",
        "content": (
            "수강신청은 강의일람표를 확인한 뒤 국립공주대학교 수강신청 시스템"
            "(https://sugang.kongju.ac.kr/)에서 로그인하여 진행한다.\n"
            "예비 수강신청(장바구니)에 과목을 담았더라도 본 수강신청 기간에 반드시 다시 신청해야 한다.\n"
            "일반적인 학기당 기준학점은 졸업학점 120~140학점 과정은 18학점 이하, "
            "160학점 과정은 20학점 이하이며 성적·학사경고·조기졸업 여부에 따라 한계학점이 달라질 수 있다.\n"
            "정확한 학기별 신청일은 대표 홈페이지 학생소식 공지를 확인해야 한다."
        ),
        "source_url": "https://onestop.kongju.ac.kr/onestop/17884/subview.do",
        "reference_date": "2026-07-24",
    },
    {
        "id": "official-major-transfer",
        "title": "모집단위 이동(전과)",
        "category": "학사",
        "content": (
            "모집단위 이동(전과)은 다른 학과·학부 또는 전공의 같은 학년으로 소속을 변경하는 제도다.\n"
            "일반적으로 2학기 말 동계방학에 지원서를 접수하고 면접 등을 거쳐 다음 1학기 개강 전에 선발한다.\n"
            "등록횟수와 취득학점 요건을 모두 충족해야 하며 재학 중 1회만 가능하다. "
            "휴학생은 복학예정자에 한해 지원할 수 있다.\n"
            "학년·졸업학점별 세부 자격과 학과별 여석이 다르므로 공식 안내와 소속 학과 사무실에서 확인해야 한다."
        ),
        "source_url": "https://onestop.kongju.ac.kr/onestop/17815/subview.do",
        "reference_date": "2026-07-24",
    },
    {
        "id": "official-dormitory-application",
        "title": "학생생활관 입실 신청",
        "category": "학생생활",
        "content": (
            "학생생활관 입실 일정과 선발 기준은 캠퍼스와 학기마다 별도 공지된다.\n"
            "입실을 희망하면 학생생활관 홈페이지의 해당 캠퍼스 공지에서 모집 일정을 확인하고 "
            "입실 신청 메뉴를 통해 온라인으로 신청한다.\n"
            "증빙서류 제출, 결과 발표, 생활관비 납부 기간이 각각 다를 수 있으므로 "
            "과거 일정이 아닌 해당 학기 최신 공지를 기준으로 해야 한다."
        ),
        "source_url": "https://dormi.kongju.ac.kr/",
        "reference_date": "2026-07-24",
    },
    {
        "id": "official-grade-check",
        "title": "성적 조회",
        "category": "학사",
        "content": (
            "해당 학기 성적은 국립공주대학교 포털의 통합정보시스템에서 조회할 수 있다.\n"
            "통합정보시스템의 성적관리 메뉴에서 성적 조회와 성적통지서 출력을 지원한다.\n"
            "시험 평가기준은 시험, 과제, 실험·실습, 출석 등을 종합하며 과목별 기준은 강의계획서에서 확인한다."
        ),
        "source_url": "https://onestop.kongju.ac.kr/onestop/17910/subview.do",
        "reference_date": "2026-07-24",
    },
    {
        "id": "official-double-major",
        "title": "복수전공",
        "category": "학사",
        "content": (
            "복수전공은 입학한 전공 외 다른 전공의 최소전공인정학점을 이수해 두 개의 학위를 취득하는 제도다.\n"
            "매 학기 지정 기간에 포털시스템에서 신청한다.\n"
            "기본 지원자격은 2학기 이상 등록하고 30학점 이상 취득한 재학생이며, 학과별 허용 범위와 선발 기준은 공식 안내를 확인해야 한다."
        ),
        "source_url": "https://onestop.kongju.ac.kr/onestop/17889/subview.do",
        "reference_date": "2026-07-24",
    },
    {
        "id": "official-tuition-payment",
        "title": "등록금 납부",
        "category": "학생생활",
        "content": (
            "등록금 고지서는 통합정보시스템의 학사 → 등록관리 → 등록금 조회에서 직접 출력한다.\n"
            "고지서에 적힌 지정 은행 납부, 개인별 가상계좌 이체, 재학생 인터넷뱅킹 등의 방법을 이용할 수 있다.\n"
            "납부 기간과 분할납부 대상은 학기마다 달라지므로 해당 학기 공식 등록금 공지를 반드시 확인해야 한다."
        ),
        "source_url": "https://onestop.kongju.ac.kr/sub/100003",
        "reference_date": "2026-07-24",
    },
    {
        "id": "official-student-id",
        "title": "학생증 발급",
        "category": "학생생활",
        "content": (
            "체크카드 겸용 학생증은 포털시스템의 개인설정에서 개인정보 수집·이용에 동의하고 발급 희망 은행을 선택한 뒤 해당 은행 앱에서 신청한다.\n"
            "모바일 학생증은 국립공주대학교 앱에 로그인한 뒤 모바일신분증 메뉴에서 이용한다.\n"
            "일반 실물 학생증과 체크카드 겸용 학생증은 중복 발급이 제한될 수 있으므로 최신 발급 안내를 확인해야 한다."
        ),
        "source_url": "https://www.kongju.ac.kr/bbs/KNU/2132/427703/artclView.do",
        "reference_date": "2026-07-24",
    },
    {
        "id": "official-academic-calendar",
        "title": "학사일정 확인",
        "category": "학사",
        "content": (
            "개강일, 수강신청·정정, 중간·기말시험, 종강, 계절학기 일정은 학년도와 학기마다 달라진다.\n"
            "국립공주대학교 공식 학사일정 페이지에서 원하는 연도와 월을 선택해 최신 일정을 확인해야 한다.\n"
            "일정은 학교 사정으로 변경될 수 있으므로 과거 크롤링 날짜를 현재 일정으로 사용하지 않는다."
        ),
        "source_url": "https://www.kongju.ac.kr/KNU/16834/subview.do",
        "reference_date": "2026-07-24",
    },
    {
        "id": "official-campus-building-map",
        "title": "캠퍼스 건물 위치",
        "category": "캠퍼스",
        "content": (
            "강의실과 건물 위치는 공식 캠퍼스맵에서 공주(신관·옥룡), 천안, 예산 캠퍼스를 선택해 확인할 수 있다.\n"
            "제9공학관(9공학관)은 천안캠퍼스에 있으며 공과대학 행정실과 증명서 자동발급기 등이 있는 건물이다.\n"
            "건물 내부 호실은 캠퍼스맵의 건물 상세정보 또는 해당 학과 안내를 확인해야 한다."
        ),
        "source_url": "https://www.kongju.ac.kr/KNU/16708/subview.do",
        "reference_date": "2026-07-24",
    },
    {
        "id": "official-library",
        "title": "도서관 이용",
        "category": "학생생활",
        "content": (
            "국립공주대학교 도서관의 자료실·열람실 운영시간은 캠퍼스와 학기·방학·시험기간에 따라 달라진다.\n"
            "대출, 좌석, 시설 예약과 당일 운영시간은 도서관 홈페이지에서 확인해야 한다."
        ),
        "source_url": "https://library.kongju.ac.kr/",
        "reference_date": "2026-07-24",
    },
    {
        "id": "official-counseling",
        "title": "학생상담센터 이용",
        "category": "학생생활",
        "content": (
            "학생상담센터는 재학생의 대학생활, 진로, 정서 등 다양한 어려움에 대한 상담을 지원한다.\n"
            "상담을 원하면 학생상담센터 홈페이지에서 프로그램과 예약 방법을 확인해 신청한다.\n"
            "위기 상황이나 긴급한 도움이 필요한 경우에는 온라인 답변을 기다리지 말고 즉시 주변의 적절한 긴급 지원을 이용해야 한다."
        ),
        "source_url": "https://counsel.kongju.ac.kr/",
        "reference_date": "2026-07-24",
    },
    {
        "id": "official-meal-menu",
        "title": "학식 식단 확인",
        "category": "학생생활",
        "content": (
            "학생식당과 생활관 식단은 날짜와 캠퍼스별로 수시로 변경되는 실시간 정보다.\n"
            "오늘의 정확한 메뉴는 국립공주대학교 공식 식단 페이지에서 캠퍼스와 식당을 선택해 확인해야 한다.\n"
            "저장된 과거 식단은 오늘의 메뉴로 안내하지 않는다."
        ),
        "source_url": "https://www.kongju.ac.kr/KNU/16863/subview.do",
        "reference_date": "2026-07-24",
    },
    {
        "id": "official-dormitory-fee",
        "title": "학생생활관 비용",
        "category": "학생생활",
        "content": (
            "학생생활관비와 식비는 캠퍼스, 생활관, 호실 유형, 학기별 운영기간에 따라 달라진다.\n"
            "정확한 금액은 학생생활관 홈페이지의 해당 학기 입실 모집 공고에서 확인해야 한다.\n"
            "과거 학기의 금액은 현재 생활관비로 안내하지 않는다."
        ),
        "source_url": "https://dormi.kongju.ac.kr/",
        "reference_date": "2026-07-24",
    },
    {
        "id": "official-student-loan",
        "title": "학자금 대출",
        "category": "학생생활",
        "content": (
            "학자금 대출은 한국장학재단에서 신청하며 등록금 대출과 생활비 대출 등으로 구분된다.\n"
            "신청 기간, 성적·이수학점 요건과 실행 기간은 학기마다 달라지므로 한국장학재단의 해당 학기 안내를 확인해야 한다.\n"
            "대출 승인을 받았더라도 등록금 납부 기간 안에 대출 실행까지 완료해야 실제 납부 처리된다."
        ),
        "source_url": "https://www.kosaf.go.kr/",
        "reference_date": "2026-07-24",
    },
    {
        "id": "official-club-joining",
        "title": "동아리 가입",
        "category": "학생생활",
        "content": (
            "중앙동아리 모집 일정과 가입 방법은 학기별로 달라지며 동아리연합회와 각 동아리의 모집 안내를 확인해야 한다.\n"
            "관심 동아리의 활동 분야와 모집 여부를 확인한 뒤 안내된 신청 방식으로 지원한다.\n"
            "공식 학생회·동아리 페이지와 학생소식에서 최신 모집 공지를 확인할 수 있다."
        ),
        "source_url": "https://www.kongju.ac.kr/KNU/16883/subview.do",
        "reference_date": "2026-07-24",
    },
    {
        "id": "official-lost-and-found",
        "title": "분실물 확인",
        "category": "학생생활",
        "content": (
            "교내에서 물건을 잃어버렸다면 국립공주대학교 분실물센터의 최신 게시물을 먼저 확인한다.\n"
            "습득 장소가 분명하면 해당 건물의 행정실이나 안내된 보관 장소에도 문의할 수 있다.\n"
            "개인정보 보호를 위해 챗봇은 과거 분실물 게시글의 이름이나 연락처를 제공하지 않는다."
        ),
        "source_url": "https://www.kongju.ac.kr/KNU/16924/subview.do",
        "reference_date": "2026-07-24",
    },
    {
        "id": "official-leave-of-absence",
        "title": "휴학",
        "category": "학사",
        "content": (
            "휴학은 포털시스템 → 통합정보시스템 → 휴학 신청에서 진행하고 담임교수·학과장 승인과 단과대학장 허가를 거친다.\n"
            "일반휴학은 최종 승인이 수업일수 3/4 이전에 완료되어야 하며, 질병·육아·병역·창업 휴학은 필요한 증빙서류가 다르다.\n"
            "신입생의 1학년 1학기 일반휴학은 허가되지 않으며 세부 조건은 공식 안내에서 확인해야 한다."
        ),
        "source_url": "https://onestop.kongju.ac.kr/onestop/17808/subview.do",
        "reference_date": "2026-07-24",
    },
    {
        "id": "official-return-to-school",
        "title": "복학",
        "category": "학사",
        "content": (
            "복학은 휴학기간 만료 또는 휴학 사유가 끝났을 때 포털시스템 → 통합정보시스템 → 복학신청에서 진행한다.\n"
            "일반적으로 매 학기 수업 시작 후 1/4 이내에 신청하며 재학생 수강신청 또는 정정 기간에 수강신청도 해야 한다.\n"
            "휴학기간이 끝난 뒤 복학하지 않으면 미복학 제적될 수 있으므로 해당 학기 공지를 확인해야 한다."
        ),
        "source_url": "https://onestop.kongju.ac.kr/onestop/17809/subview.do",
        "reference_date": "2026-07-24",
    },
    {
        "id": "official-graduation",
        "title": "졸업",
        "category": "학사",
        "content": (
            "일반적인 졸업 필요학점은 130학점이며 사범대학과 간호학과는 140학점, 건축학전공은 160학점이다.\n"
            "입학 연도와 학과별 교육과정에 따라 필수 교양·전공 등 세부 이수요건이 다르므로 본인의 교육과정표를 함께 확인해야 한다.\n"
            "조기졸업은 총 평점평균 4.0 이상, 6학기 이상 등록(건축학전공은 8학기), 졸업학점과 졸업논문 충족 등의 요건을 적용한다.\n"
            "조기졸업 희망자는 4학기 이내, 즉 2학년 2학기 수강신청 전에 이수 신청을 해야 한다."
        ),
        "source_url": "https://onestop.kongju.ac.kr/onestop/17879/subview.do",
        "reference_date": "2026-07-24",
    },
    {
        "id": "official-readmission",
        "title": "재입학",
        "category": "학사",
        "content": (
            "재입학은 자퇴 또는 제적된 학생이 산출된 여석 범위에서 신청할 수 있다.\n"
            "학기 종강 후 시행계획이 공고되면 지정 기간에 학과사무실로 신청서와 필요 서류를 제출하고 학과장·학장 확인과 총장 허가를 거친다.\n"
            "징계로 제적된 사람과 이중학적자는 재입학할 수 없으며 신청자가 여석보다 많으면 학교 선발기준을 적용한다."
        ),
        "source_url": "https://onestop.kongju.ac.kr/onestop/17878/subview.do",
        "reference_date": "2026-07-24",
    },
    {
        "id": "official-withdrawal",
        "title": "제적·자퇴",
        "category": "학사",
        "content": (
            "자퇴는 포털시스템 → 통합정보시스템 → 학사 → 학적변동관리 → 자퇴신청에서 진행한다.\n"
            "신청 후 담임교수와 학과장 지도를 거쳐 교무처장 승인을 받아야 한다.\n"
            "자퇴 전 등록금 반환, 장학금, 학자금 대출과 학적 영향을 소속 학과 및 공식 안내에서 확인하는 것이 좋다."
        ),
        "source_url": "https://onestop.kongju.ac.kr/onestop/17877/subview.do",
        "reference_date": "2026-07-24",
    },
    {
        "id": "official-scholarship",
        "title": "장학안내",
        "category": "학생생활",
        "content": (
            "교내장학금과 국가·지자체·민간재단의 교외장학금은 신청 방식과 선발 조건이 각각 다르다.\n"
            "교내장학금 신청은 보통 1학기는 직전 연도 12월, 2학기는 해당 연도 6월에 별도 안내되며 정확한 기간은 학생소식에서 확인해야 한다.\n"
            "국가장학금은 한국장학재단에서 해당 학기 신청 기간 안에 신청하고 가구원 동의와 필요한 서류 제출을 완료해야 한다."
        ),
        "source_url": "https://www.kongju.ac.kr/KNU/16842/subview.do",
        "reference_date": "2026-07-24",
    },
    {
        "id": "official-certificate",
        "title": "증명서발급",
        "category": "학생생활",
        "content": (
            "재학·성적·졸업 등 증명서는 인터넷 증명발급 사이트에서 로그인 후 발급할 수 있으며 인터넷 발급은 24시간 이용 가능하다.\n"
            "캠퍼스별 증명서 자동발급기에서도 주요 증명서를 즉시 무료 발급할 수 있다.\n"
            "자동발급기로 처리할 수 없는 확인서는 학생서비스센터 또는 공식 안내에 적힌 방법을 이용해야 한다."
        ),
        "source_url": "https://www.kongju.ac.kr/KNU/16837/subview.do",
        "reference_date": "2026-07-24",
    },
    {
        "id": "official-international-student-id",
        "title": "국제학생증발급",
        "category": "학생생활",
        "content": (
            "국제학생증(ISIC)은 제휴 페이지에서 교내 시스템 로그인으로 재학·휴학 상태를 확인한 뒤 온라인 신청서를 작성한다.\n"
            "학적 승인 후 안내에 따라 발급비를 결제하고 카드 종류를 선택해 발급을 진행한다.\n"
            "유효기간, 발급비와 캠퍼스별 수령 방법은 변경될 수 있으므로 신청 화면의 최신 안내를 확인해야 한다."
        ),
        "source_url": "https://www.isic.co.kr/kongju/kongjuIndex.jsp",
        "reference_date": "2026-07-24",
    },
    {
        "id": "official-wireless-network",
        "title": "와이파이·무선인터넷",
        "category": "캠퍼스",
        "content": (
            "학내 무선랜은 KNU WiFi6와 eduroam을 제공하며 공주·천안·예산 캠퍼스의 강의실, 열람실 등에서 이용할 수 있다.\n"
            "KNU WiFi6는 포털 계정으로 인증하고, eduroam은 학교 공식 무선랜 안내의 계정 형식과 연결 방법을 따라야 한다.\n"
            "비밀번호나 개인 계정정보를 챗봇에 입력하지 말고 기기별 설정은 공식 사용방법을 확인해야 한다."
        ),
        "source_url": "https://www.kongju.ac.kr/KNU/16898/subview.do",
        "reference_date": "2026-07-24",
    },
    {
        "id": "official-facility-reservation",
        "title": "시설물사용신청",
        "category": "캠퍼스",
        "content": (
            "교내 시설물 사용은 공식 시설물사용신청 페이지의 온라인 예약을 원칙으로 한다.\n"
            "시설과 희망 날짜를 선택해 가능한 시간을 확인한 뒤 신청하고, 예약조회 메뉴에서 조회·취소할 수 있다.\n"
            "이용 당일에는 예약 신청자의 신분증을 제시해야 하며 시설별 조건과 사용료를 확인해야 한다."
        ),
        "source_url": "https://www.kongju.ac.kr/KNU/16881/subview.do",
        "reference_date": "2026-07-24",
    },
)


def normalize_line(value: str) -> str:
    return SPACE_PATTERN.sub(" ", value).strip()


def redact_contact(value: str) -> str:
    value = EMAIL_PATTERN.sub("[이메일 비공개]", value)
    return PHONE_PATTERN.sub("[전화번호 비공개]", value)


def should_exclude(title: str) -> bool:
    return any(part in title for part in EXCLUDED_TITLE_PARTS)


def infer_category(title: str) -> str:
    for category, keywords in CATEGORY_RULES:
        if any(keyword in title for keyword in keywords):
            return category
    return "학교안내"


def is_noise(line: str, common_lines: set[str]) -> bool:
    if not line or line in NOISE_EXACT or line in common_lines:
        return True
    if "[전화번호 비공개]" in line or "[이메일 비공개]" in line:
        return True
    if any(fragment in line for fragment in NOISE_CONTAINS):
        return True
    if ONLY_SYMBOLS_PATTERN.fullmatch(line) or ONLY_NUMBER_PATTERN.fullmatch(line):
        return True
    return len(line) < 2


def chunk_lines(lines: list[str], max_chars: int = 1_100) -> list[str]:
    chunks: list[str] = []
    current: list[str] = []
    current_size = 0

    for line in lines:
        if current and current_size + len(line) + 1 > max_chars:
            chunks.append("\n".join(current))
            current = current[-2:]
            current_size = sum(len(item) + 1 for item in current)

        current.append(line)
        current_size += len(line) + 1

    if current:
        chunks.append("\n".join(current))

    return [chunk for chunk in chunks if len(chunk) >= 80]


def read_snapshots(source_dir: Path) -> list[dict[str, Any]]:
    snapshots: list[dict[str, Any]] = []
    for path in sorted(source_dir.glob("*.json")):
        try:
            payload = json.loads(path.read_text(encoding="utf-8"))
        except (json.JSONDecodeError, OSError):
            continue

        if not isinstance(payload, dict):
            continue

        title = normalize_line(str(payload.get("menu") or path.stem.rsplit("_", 1)[0]))
        content = str(payload.get("content", ""))
        if (
            should_exclude(title)
            or title in CURATED_REPLACED_TITLES
            or len(content) < 80
        ):
            continue

        lines = [normalize_line(line) for line in content.splitlines()]
        url = str(payload.get("url", "")).strip()
        if "onestop.kongju.ac.kr" in url and "담당부서" in lines:
            lines = lines[lines.index("담당부서") :]

        snapshots.append(
            {
                "title": title,
                "url": url,
                "timestamp": str(payload.get("timestamp", "")).strip(),
                "lines": lines,
            }
        )
    return snapshots


def reference_date(timestamp: str) -> str | None:
    try:
        return datetime.fromisoformat(timestamp).date().isoformat()
    except ValueError:
        return None


def build(source_dir: Path) -> dict[str, Any]:
    snapshots = read_snapshots(source_dir)
    line_frequency: Counter[str] = Counter()

    for snapshot in snapshots:
        line_frequency.update(set(snapshot["lines"]))

    common_threshold = max(8, round(len(snapshots) * 0.07))
    common_lines = {
        line
        for line, frequency in line_frequency.items()
        if frequency >= common_threshold
    }

    documents: list[dict[str, Any]] = []
    for snapshot in snapshots:
        seen: set[str] = set()
        clean_lines: list[str] = []
        for raw_line in snapshot["lines"]:
            line = redact_contact(raw_line)
            if is_noise(line, common_lines) or line in seen:
                continue
            seen.add(line)
            clean_lines.append(line)

        chunks = chunk_lines(clean_lines)
        if snapshot["title"] == "국제학생증발급":
            chunks = chunks[:2]

        for index, content in enumerate(chunks, start=1):
            documents.append(
                {
                    "id": f"{snapshot['title']}-{index}",
                    "title": snapshot["title"],
                    "category": infer_category(snapshot["title"]),
                    "content": content,
                    "source_url": snapshot["url"] or None,
                    "reference_date": reference_date(snapshot["timestamp"]),
                }
            )

    documents.extend(CURATED_DOCUMENTS)

    return {
        "version": 1,
        "generated_from": "국립공주대학교 공식 홈페이지 크롤링 스냅샷",
        "documents": documents,
    }


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--source-dir", type=Path, required=True)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()

    payload = build(args.source_dir)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(
        json.dumps(payload, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    print(f"wrote {len(payload['documents'])} documents to {args.output}")


if __name__ == "__main__":
    main()
