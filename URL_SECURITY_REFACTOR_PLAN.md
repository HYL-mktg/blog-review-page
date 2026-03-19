# URL 및 보안 리팩토링 계획서

작성일: 2026-03-19  
대상 경로: `C:\Users\MK01\Documents\GitHub\blog-review-page`

## 1) 배경
- 현재 `index.html`이 상세 검토 페이지 역할을 수행하고 있어 엔트리 URL 의미가 불명확함.
- 리스트 페이지(`blog-list-page*.html`)에서 상세 페이지로 연결되는 URL이 파일별로 분산되어 유지보수성이 낮음.
- 프론트엔드 코드에 보안 리스크가 될 수 있는 패턴(토큰 `localStorage` 저장, 민감 엔드포인트 노출, HTML 삽입 처리 등)이 존재함.

## 2) 리팩토링 목표
- `index.html`을 허브(메인 진입점)로 재정의.
- 상세 검토 화면은 목적이 드러나는 별도 파일명으로 분리.
- 고객에게 배포한 리스트 페이지 URL 흐름과 자연스럽게 매치되도록 링크 체계를 일괄 정리.
- 기존 레이아웃은 유지하고, 문구는 한국어 기준으로 정리.
- 보안상 취약해질 수 있는 프런트 코드 패턴을 더 안전한 방식으로 교체.

## 3) 현재 URL 흐름(확인 결과)
- 일반 콘텐츠 목록: `blog-list-page.html?company=...`
- 일반 상세 링크: `index.html?company=...&post_id=...`
- 뉴스 목록: `blog-list-page-news.html?company=...`
- 뉴스 상세 링크: `index-news.html?company=...&post_id=...`
- 공유 목록: `blog-list-page-shared.html?company=...`
- 공유 상세 링크: `index-shared.html?company=...&post_id=...`

## 4) 제안 URL 구조(안)
- 허브(메인): `index.html`
- 일반 상세: `review-detail.html`
- 뉴스 상세: `review-detail-news.html`
- 공유 상세: `review-detail-shared.html`

적용 원칙:
- 쿼리 파라미터(`company`, `post_id`)는 기존 그대로 유지.
- 리스트 페이지에서 상세로 가는 링크만 새 상세 파일명으로 일괄 교체.
- 내부 `goHome()`/되돌아가기 동선도 각 리스트 페이지와 매칭되게 정렬.

## 5) 보안 개선 목표(코드 레벨)
- 인증 토큰 저장 방식 재검토: `localStorage` 중심 저장 축소(최소 `sessionStorage` 전환 검토, 가능하면 서버 세션 기반으로 이관).
- 클라이언트 노출 민감값 최소화:
  - 직접 호출 웹훅 URL
  - 업로드 프리셋/클라우드 식별자
  - 내부 워커 엔드포인트 노출 범위
- HTML 삽입 처리 강화:
  - `dangerouslyPasteHTML` 사용 구간 점검
  - 편집/미리보기 시 허용 태그 기준 정리
  - 외부 입력값 렌더링 전 검증/정제 절차 반영
- 링크/탭 보안:
  - `target="_blank"` 사용 시 `rel="noopener noreferrer"` 적용 점검

## 6) 파일별 작업 계획(예정)
- 허브 전환:
  - `index.html`을 허브 UI로 개편(기존 `home.html` 역할 흡수)
- 상세 페이지 분리:
  - `index.html`(기존 상세 코드) -> `review-detail.html`
  - `index-news.html` -> `review-detail-news.html`
  - `index-shared.html` -> `review-detail-shared.html`
- 링크 일괄 수정:
  - `blog-list-page.html`
  - `blog-list-page-news.html`
  - `blog-list-page-shared.html`
  - 허브/상세 간 이동 버튼 URL
- 문서 업데이트:
  - `README.md`에 URL 구조/접속 경로 반영

## 7) 검증 계획
- URL 동작 검증:
  - 배포 예시 형식 `.../blog-list-page.html?company=...`에서 상세 진입 성공 여부
  - 상세에서 목록 복귀 URL 정확성
- 기능 회귀 검증:
  - 조회/수정/승인/반려 버튼 동작 유지 여부
  - 뉴스/공유 페이지 각각 동일 시나리오 확인
- 보안 점검(정적):
  - 민감 URL 하드코딩 잔존 여부 탐색
  - `localStorage`/`innerHTML`/`dangerouslyPasteHTML` 사용 위치 재점검

## 8) 이해 요약(Understanding Lock 초안)
- 구축 대상: 콘텐츠 검토용 홈페이지의 URL 구조 및 보안 패턴 정리.
- 목적: 고객 배포 리스트 페이지와 매칭되는 안정적인 상세 URL 체계 확보.
- 사용자: 내부 운영자/검토자 + 고객이 전달받은 리스트 페이지 사용자.
- 핵심 제약: 레이아웃 유지, 한국어 유지, 링크 동작 유지.
- 비목표: 백엔드 아키텍처 전면 개편, UI 테마 전면 리디자인.

## 9) 가정(Assumptions)
- 고객이 이미 보유한 링크는 주로 `blog-list-page*.html?company=...` 형식이며 이 진입점은 유지해야 함.
- 상세 페이지 파일명 변경은 가능하지만, 쿼리 파라미터 스키마(`company`, `post_id`)는 변경하지 않음.
- 보안 개선은 프론트 코드에서 우선 가능한 범위를 먼저 반영하고, 서버 변경이 필요한 항목은 후속 과제로 분리함.

## 10) 호환성 결정(확정)
- 과거 직접 링크는 하위 호환을 유지함.
- 적용 방식:
  - `index.html?company=...&post_id=...` -> `review-detail.html?...` 자동 이동
  - `index-news.html?company=...&post_id=...` -> `review-detail-news.html?...` 자동 이동
  - `index-shared.html?company=...&post_id=...` -> `review-detail-shared.html?...` 자동 이동
