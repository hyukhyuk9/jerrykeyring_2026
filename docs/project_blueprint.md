# 🧀 JerryKeyring 2026 프로젝트 마스터 가이드 (Project Blueprint)

이 문서는 JerryKeyring 프로젝트의 **중앙 허브**입니다. 프로젝트의 설계 철학, UI/UX 정의, 그리고 모든 상세 문서로 연결되는 인덱스 역할을 수행합니다.

---

## 1. 프로젝트 아키텍처 및 철학
JerryKeyring은 NFC 기술과 현대적인 클라우드 인프라(Supabase, R2)를 결합하여 사용자에게 아날로그적 감성과 디지털의 편리함을 동시에 제공합니다.

### 🛠 핵심 기술 스택
- **Framework**: Next.js (App Router)
- **Database**: Supabase (PostgreSQL)
- **Storage**: Cloudflare R2
- **AI Integration**: OpenAI & Google Cloud TTS

---

## 2. 상세 문서 인덱스 (Full Index)
프로젝트의 각 영역별 상세 데이터 및 가이드 링크입니다.

*   [**🗄️ 데이터베이스 스키마**](./database_schema.md): 테이블 구조, 필드 타입 및 관계 정의
*   [**🔌 API 가이드**](./api_guide.md): 백엔드 엔드포인트 명세 및 관리자 도구 활용법
*   [**🚀 배포 가이드**](./deployment_guide.md): Cloudflare Pages 인프라 및 환경 변수 설정
*   [**🔐 NFC 인증/토큰 설계**](./auth_token_plan.md): 보안 및 토큰 인증 메커니즘 기획안
*   [**🗺️ 서비스 기능 맵**](./feature_map.md): 모든 페이지 구성 및 기능 상세 정의
*   [**📍 작업 로드맵**](./todo_roadmap.md): 우선순위별 기능 구현 및 수정 목록
*   [**📜 Git 작업 이력**](./git.md): 작업 시간 및 푸시 내역 기록 (실시간 업데이트)

---

## 3. UI/UX 및 기능 영역 정의

### 📱 메인 화면 & 플레이어
- **Index**: 유저 음원 목록 시각화 및 재생 트리거.
- **OBS Mode**: 감상 몰입을 위한 시각 중심 모드 (5초 유휴 시 UI 숨김).
- **Controls**: 재생 제어 및 개인화 설정 인터페이스.

---

## 4. 작업 원칙 및 협업 로직 (Master Rules)

1.  **안전한 확장**: 기존 로직을 파괴하지 않는 선에서 기능을 추가하며, 항상 레거시 호환성을 고려합니다.
2.  **이중화 재생(Fallback)**: DB나 네트워크 이슈에 대비하여 로컬 음원 파일(`./public/music/`) 재생 로직을 유지합니다.
3.  **브랜치 관리**: 
    *   `main`: 안정적인 배포 본체.
    *   `v0`: 2026-04-26의 안정 상태 보존 브랜치.
4.  **Git 로그 기록**: `git add` 및 `push` 시 반드시 `docs/git.md`에 날짜와 시간, 작업 내용을 기록합니다.

---

## 5. 업데이트 이력
- **2026-05-02**: 문서 구조 개편 (README-Router / Blueprint-Hub 체계 확립).
- **2026-04-26**: `v0` 브랜치 생성 및 긴급 복구 시스템 확립.

---
*모든 개발 및 설계 변경 사항은 이 인덱스 문서와 연결된 세부 문서에 즉시 반영되어야 합니다.*
