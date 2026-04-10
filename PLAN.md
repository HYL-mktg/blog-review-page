# blog-review-page - 구현 계획

## 개요
HYL 마케팅팀의 블로그 콘텐츠 승인 시스템. 에어테이블에 저장된 블로그 초안을 기업 담당자가 웹에서 확인하고, 수정·승인·반려할 수 있도록 하는 정적 웹 애플리케이션이다.

## 목표 & 완료 기준
- [x] 기업별 인증을 통한 콘텐츠 접근 제어
- [x] 콘텐츠 열람 + Quill 에디터 기반 인라인 수정
- [x] Cloudinary 이미지 업로드 연동
- [x] Make.com 웹훅으로 승인/반려 전송
- [x] 이미지 오버플로우 버그 수정 및 전체 UI 개선

## 아키텍처

```
브라우저 (정적 HTML/JS)
  ├── auth.js              ← 기업 인증, URL 파라미터 처리
  ├── review-detail.html   ← 일반 블로그 상세 페이지
  ├── review-detail-news.html   ← 뉴스 상세 페이지
  ├── review-detail-shared.html ← 공유 상세 페이지
  └── theme-modern.css     ← 공통 디자인 시스템
        │
        ├── Cloudflare Workers (proxy)
        │     └── Airtable API ← 콘텐츠 데이터
        ├── Cloudinary        ← 이미지 업로드/호스팅
        └── Make.com webhooks ← 승인/반려 자동화
```

## 파일 구조
```
blog-review-page/
├── index.html                  ← 진입점 (인증 선택)
├── index-company.html          ← 기업 로그인
├── blog-list-page.html         ← 블로그 목록 (일반)
├── blog-list-page-news.html    ← 블로그 목록 (뉴스)
├── blog-list-page-shared.html  ← 블로그 목록 (공유)
├── review-detail.html          ← 글 상세 (일반)
├── review-detail-news.html     ← 글 상세 (뉴스)
├── review-detail-shared.html   ← 글 상세 (공유)
├── theme-modern.css            ← 공통 디자인 시스템
├── auth.js                     ← 인증 모듈
└── notice.txt                  ← 공지사항 (제목|링크 형식)
```

## 기술 스택
| 구성 요소 | 선택 | 이유 |
|-----------|------|------|
| 호스팅 | GitHub Pages | 별도 서버 불필요, 정적 배포 |
| 에디터 | Quill.js v1.3.6 | 경량, HTML 직접 출력 |
| 이미지 | Cloudinary | 무료 tier, 직접 업로드 API |
| 프록시 | Cloudflare Workers | CORS 우회, Airtable API 키 노출 방지 |
| 자동화 | Make.com webhook | 승인/반려 후 후속 작업 처리 |

## 구현 단계
### 1단계 - 기본 구조 및 인증
기업 파라미터 기반 URL 접근 제어. `auth.js`가 URL에서 company 추출 후 허용 목록 검증.

### 2단계 - 콘텐츠 로딩 및 표시
Cloudflare Workers 프록시를 통해 Airtable 레코드 fetch → HTML 콘텐츠 렌더링.

### 3단계 - 수정 모드
Quill 에디터 초기화, 이미지 업로드(Cloudinary), 우클릭 이미지 삭제.

### 4단계 - 승인/반려 웹훅
Make.com으로 `edited_html`, `edited_title`, `generation_method` 포함한 payload 전송.

### 5단계 - UI 개선 (현재 진행)
이미지 오버플로우 수정, 메타+콘텐츠 카드 통합, 콘텐츠 typography 개선.

## 주요 설계 결정
| 결정 | 선택한 방식 | 고려했으나 제외한 방식 | 이유 |
|------|------------|----------------------|------|
| 데이터 접근 | Cloudflare Workers 프록시 | 직접 Airtable API 호출 | API 키 노출 방지 |
| 에디터 | Quill HTML 출력 | Markdown | Airtable 필드가 HTML 저장 |
| 인증 | URL 파라미터 기반 | 로그인 폼 | 고객사 공유 링크 방식 |

## 범위 외 (Out of Scope)
- 다크 모드
- 오프라인 지원
- 다국어 (한국어 전용)
- 콘텐츠 버전 히스토리

---

## [UI 개선 v2] 추가 계획 — 2026-04-10

### 목적
이미지 오버플로우 수정 후, 콘텐츠 typography 및 전반적인 가독성을 추가 개선한다.

### 변경 범위
- 영향받는 파일: `theme-modern.css`, `review-detail.html`, `review-detail-news.html`, `review-detail-shared.html`

### 구현 접근법
1. `#content-display` 내부 prose typography 스타일 추가 (p, h1~h3, ul, ol, blockquote)
2. 중첩된 `max-width: 900px` 내부 wrapper 제거
3. 페이지 상단 브랜딩 헤더 추가
4. 버튼 영역 카드 스타일 처리

### 단계
1. theme-modern.css에 `.prose` 스타일 블록 추가
2. HTML 3개 파일의 콘텐츠 래퍼 수정
3. 페이지 헤더 HTML/CSS 추가

### 완료 기준
- [ ] 콘텐츠 내 p 태그 간격이 1em 이상 확보됨
- [ ] 콘텐츠 내 h1/h2/h3이 시각적으로 구별됨
- [ ] 로컬 서버에서 시각적으로 확인 완료
