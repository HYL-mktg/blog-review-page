# Changelog

[Keep a Changelog](https://keepachangelog.com/ko/1.0.0/) 형식을 따릅니다.

---

## [Unreleased]

### Changed
- 콘텐츠 내부 prose typography 개선 (단락 간격, heading 스타일, 리스트)
- 중첩 `max-width` wrapper 제거로 레이아웃 단순화
- 버튼 영역 카드형 스타일 처리

---

## [1.2.0] - 2026-04-10

### Fixed
- `#content-display img`에 `max-width: 100% !important` 적용 — 이미지가 박스를 벗어나는 버그 수정
- `overflow: hidden` 추가로 오버플로우 완전 차단

### Changed
- `#meta-display`와 `#content-display`를 하나의 연결된 카드로 통합
- 기업명 라벨 스타일 개선 (소형 대문자, primary 색상)
- 제목 폰트 크기 `clamp()` 유동 처리
- 콘텐츠 본문 `line-height: 1.85`, `font-size: 15px` 적용
- 버튼 그룹 `flexbox + gap` 균등 배치
- 모바일 패딩 자동 축소 (900px 이하)
- 에디터 높이 400px → 500px 확대
- 인라인 스타일 정리 (중복 선언 제거)

---

## [1.1.0] - 2026-04-07

### Added
- 공지사항 sticky 바 (notice.txt 기반, 제목|링크 파싱)
- Cloudinary 이미지 업로드 + 캔버스 화질 최적화 (JPEG 92%)

### Changed
- URL 구조 전반 개편

---

## 버전 규칙
MAJOR.MINOR.PATCH
- MAJOR: 하위 호환 불가 변경 (구조 개편, API 파괴적 변경)
- MINOR: 하위 호환 기능 추가
- PATCH: 버그 수정, 소규모 개선

## 변경사항 분류
- **Added** — 새로운 기능
- **Changed** — 기존 기능 변경
- **Fixed** — 버그 수정
- **Removed** — 제거된 기능
- **Security** — 보안 관련 수정
