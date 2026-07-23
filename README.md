# PORTY

국립공주대학교의 학사·캠퍼스·생활 정보를 한곳에서 찾는 AI 캠퍼스
어시스턴트입니다. 기존 PORTY의 화면을 유지하면서 검색 데이터와 답변 구조를
배포 가능한 형태로 다시 만들었습니다.

## 핵심 기능

- 공식 페이지를 정제한 지식 문서와 BM25 기반 한국어 검색
- Gemini 2.5 Flash Lite를 이용한 근거 기반 답변과 공식 출처 표시
- 모델을 사용할 수 없을 때도 동작하는 추출형 답변
- 짧은 후속 질문에서도 최근 대화 문맥 유지
- 캠퍼스 위치·셔틀버스 등 정확성이 중요한 질문의 구조화 응답
- 오래된 일정·셔틀 정보를 최신 정보처럼 노출하지 않는 기준 시점 안내
- Supabase 이메일 로그인, 사용자별 대화·설정 저장
- 모바일 채팅 UI, 빠른 질문, 다크 모드, 서비스 상태 확인

## 구조

```text
apps/web       React 19 + Vite
api            Vercel FastAPI 진입점
services/ai    FastAPI 검색 API와 버전 관리 데이터
supabase       Auth + Postgres + RLS 마이그레이션
```

웹과 AI API는 하나의 Vercel 프로젝트에서 같은 도메인으로 배포합니다.
답변 생성은 Vercel AI Gateway를 사용하며, 인증과 영구 데이터만 Supabase가
담당합니다. 별도의 Spring 서버나 두 번째 배포 프로젝트는 필요하지 않습니다.

## 로컬 실행

Node.js 22 이상과 Python 3.14를 권장합니다.

```bash
npm install

python3 -m venv services/ai/.venv
services/ai/.venv/bin/pip install -r services/ai/requirements.txt
services/ai/.venv/bin/uvicorn app.main:app --app-dir services/ai --reload --port 8000

# 다른 터미널
npm run dev
```

- Web: `http://localhost:5173`
- AI API 문서: `http://localhost:8000/docs`
- 상태 페이지: `http://localhost:5173/health`

Vite 개발 서버가 `/api` 요청을 FastAPI로 전달하므로
`VITE_AI_API_URL`은 로컬과 Vercel에서 비워두어도 됩니다.

로컬에서도 생성형 답변을 확인하려면 `.env`에 `AI_GATEWAY_API_KEY`를
설정합니다. 키가 없으면 검색 결과만으로 안전한 추출형 답변을 반환합니다.

## Supabase 연결

1. `.env.example`을 `.env`로 복사합니다.
2. Supabase 프로젝트의 URL과 publishable key를 입력합니다.
3. Supabase SQL Editor에서
   `supabase/migrations/20260724000100_initial_schema.sql`과
   `supabase/seed.sql`을 순서대로 실행합니다.

로컬 Supabase를 쓸 경우 Docker 호환 런타임을 설치한 뒤 아래 명령을 사용합니다.

```bash
npm run supabase:start
npm run supabase:reset
```

모든 사용자 데이터 테이블에는 RLS가 적용되어 로그인한 사용자가 자신의
프로필·설정·대화만 읽고 변경할 수 있습니다.

## 검사

```bash
npm test
npm run build
services/ai/.venv/bin/pytest services/ai/tests -q
npm audit
```

## Vercel 배포

GitHub 저장소를 Vercel에서 Import한 뒤 루트 디렉터리를 그대로 사용합니다.
`vercel.json`이 Vite 빌드 결과와 FastAPI Python Function을 함께 배포합니다.

Vercel 환경변수에는 아래 두 값만 설정합니다.

```text
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
```

AI Gateway 인증은 Vercel이 배포 함수 요청에 제공하는 단기 OIDC 토큰을
사용하므로 저장소나 Vercel 환경변수에 장기 API 키를 넣지 않습니다.

Supabase Auth의 Site URL과 Redirect URL에는 최종 Vercel 도메인을 등록합니다.

## 지식 데이터와 개인정보

`scripts/build_knowledge.py`는 공식 홈페이지 크롤링 스냅샷에서 메뉴·팝업 등
반복 문구를 제거하고, 이메일·전화번호와 개인 게시판 데이터를 제외한 뒤
`services/ai/data/knowledge.json`을 생성합니다. 중요한 일정과 요금은 답변에
표시되는 자료 기준일 및 공식 링크를 다시 확인해야 합니다.
