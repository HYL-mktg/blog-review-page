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

---

## [수정 모드 UX 전면 개선] 추가 계획 — 2026-04-10

### 목적
Quill 툴바 버튼의 가독성 문제(파란 배경 + 검은 아이콘)를 해결하고, 수정 모드 진입/종료 경험을 자연스럽게 통합한다.

### 현재 문제
1. `theme-modern.css`의 전역 `button { background: blue gradient }` 규칙이 Quill 툴바 버튼에도 적용 → 파란 배경에 검은 SVG 아이콘(명도 대비 부족)
2. 수정 모드와 뷰 모드 간 시각적 맥락 없이 영역이 교체됨 → 끊기는 느낌
3. 수정 전용 버튼(수정완료/취소)과 일반 버튼(승인/홈으로)이 동일한 스타일이라 역할 구분 불분명

### 변경 범위
- 영향받는 파일: `theme-modern.css`
- 참조 파일: `review-detail.html`, `review-detail-shared.html`, `review-detail-news.html`, `news-review.html`, `demo.html`

### 구현 접근법

**1) Quill 툴바 아이콘 흰색 처리**
Quill 툴바 버튼은 `.ql-toolbar .ql-formats button`으로 선택 가능하다. SVG 아이콘 stroke/fill을 `#ffffff`로 재정의하고, picker label(Normal 드롭다운)도 흰색으로 처리한다.

```css
.ql-snow .ql-toolbar button .ql-stroke,
.ql-snow .ql-toolbar .ql-picker-label .ql-stroke { stroke: #ffffff; }
.ql-snow .ql-toolbar button .ql-fill { fill: #ffffff; }
.ql-snow .ql-toolbar .ql-picker-label { color: #ffffff; }
```

**2) 수정 모드 전용 색상 체계**
- 수정완료: 초록(`#16a34a`) — 긍정적 완료 액션
- 취소: 회색(`#6b7280`) — 중립적 취소
- 이미지추가: 보조 파란색(기존 primary 유지, 단 명도 조정)

**3) 에디터 영역 시각적 맥락 추가**
- 수정 모드 진입 시 `#meta-display`에 `editing` 클래스 → 상단 보더를 amber(`#f59e0b`)로 변경
- 에디터 컨테이너 상단에 "✏️ 수정 중" 배지 고정 표시 (JS로 toggle)

**4) Quill 툴바 배경색 개선**
Quill Snow 기본 툴바는 흰/회색 배경. 현재 전역 `button` 규칙이 덮어쓰므로 `.ql-toolbar` 내부 button에 별도 규칙으로 디자인 시스템 색상(더 어두운 primary)을 적용 + hover 시 밝아지게.

### 단계
1. `theme-modern.css`에 Quill 툴바 전용 오버라이드 추가 (아이콘 흰색, hover 상태)
2. 수정완료/취소 버튼에 id 또는 data 속성으로 색상 분기
3. 수정 모드 진입 시 "수정 중" 배지 show/hide (CSS + JS 최소 변경)
4. demo.html에서 수정 모드 시각 확인

### 완료 기준
- [ ] Quill 툴바 B/I/U 등 아이콘이 파란 배경에서 흰색으로 보임
- [ ] 수정완료 버튼이 초록, 취소 버튼이 회색으로 구별됨
- [ ] 수정 모드 진입 시 "수정 중" 배지가 상단에 표시됨
- [ ] demo.html 프리뷰에서 전체 플로우 시각 확인 완료

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
