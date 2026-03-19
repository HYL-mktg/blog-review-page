# 홈페이지 구조 재구성 변경 내역

작성일: 2026-03-19

## 1) 작업 목적
- `index.html`을 상세 페이지로 쓰던 기존 구조를 정리해, 메인 허브 역할로 재구성.
- 상세 페이지를 목적별 파일로 분리.
- 기존에 배포된 직접 상세 링크(`index*.html?company=...&post_id=...`)는 하위 호환 유지.

## 2) 주요 변경 사항

### URL/구조 개편
- 메인 엔트리:
  - `index.html` -> 허브 페이지로 전환
- 상세 페이지 분리:
  - `review-detail.html` (일반 콘텐츠 상세)
  - `review-detail-news.html` (뉴스 콘텐츠 상세)
  - `review-detail-shared.html` (공유 콘텐츠 상세)
- 하위 호환(자동 리다이렉트):
  - `index.html?company=...&post_id=...` -> `review-detail.html?...`
  - `index-news.html?...` -> `review-detail-news.html?...`
  - `index-shared.html?...` -> `review-detail-shared.html?...`

### 리스트 페이지 링크 정리
- `blog-list-page.html` 상세 링크를 `review-detail.html`로 변경
- `blog-list-page-news.html` 상세 링크를 `review-detail-news.html`로 변경
- `blog-list-page-shared.html` 상세 링크를 `review-detail-shared.html`로 변경

### 보안/안전성 개선(적용 완료 범위)
- 클라이언트에 노출되던 Airtable API 키 제거:
  - `index-company.html`을 Worker 기반 조회로 변경
- 로그인 토큰 저장소 변경:
  - `index.html`에서 `localStorage` -> `sessionStorage`
- 외부 새 탭 링크 보강:
  - 상세 페이지 공지 링크에 `rel="noopener noreferrer"` 추가
- 이미지 삽입 처리 개선:
  - 일부 삽입 흐름에서 `dangerouslyPasteHTML` 대신 `quill.insertEmbed` 사용

## 3) 수정된 파일 목록
- `index.html`
- `home.html`
- `index-company.html`
- `index-news.html`
- `index-shared.html`
- `blog-list-page.html`
- `blog-list-page-news.html`
- `blog-list-page-shared.html`
- `review-detail.html` (신규)
- `review-detail-news.html` (신규)
- `review-detail-shared.html` (신규)
- `URL_SECURITY_REFACTOR_PLAN.md` (기획 문서)
- `REFACTOR_CHANGELOG_2026-03-19.md` (본 문서)

## 4) 확인 결과(이번 작업 기준)
- 정적 점검에서 리스트/상세 URL 매핑이 새 구조로 반영된 것 확인.
- 레거시 직접 링크를 위한 리다이렉트 코드 반영 확인.
- HTML 내 Airtable API Key 하드코드 제거 확인.

참고:
- 브라우저 수동 E2E 테스트(실제 클릭/승인/반려)는 아직 미실행.

## 5) 커밋 후 진행 액션

### 필수
1. GitHub에 push 후 GitHub Pages 배포 완료까지 대기.
2. 아래 5개 URL 동작 확인:
   - 허브: `/blog-review-page/index.html`
   - 리스트 예시: `/blog-review-page/blog-list-page.html?company=한양3D팩토리`
   - 새 상세: 리스트에서 제목 클릭 시 `review-detail.html?...` 진입
   - 구 상세 직접링크: `/blog-review-page/index.html?company=...&post_id=...` 접속 시 자동 이동
   - 뉴스/공유도 동일 방식으로 상세 이동 확인
3. 상세 페이지에서 `홈으로` 버튼이 각 리스트로 정확히 복귀되는지 확인.

### 권장
1. 문제가 생기면 브라우저 강력 새로고침(`Ctrl+F5`) 후 재확인.
2. 운영 중 사용하지 않는 `news-review.html`은 별도 정리 여부 결정(유지/비공개/삭제).
3. 다음 단계에서 웹훅 직통 호출을 Worker 경유 구조로 전환(보안 강화 후속).
