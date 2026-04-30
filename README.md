# Jerry Keyring Project

## Tech Stack
- **Frontend/Framework**: Next.js (App Router)
- **Database & Auth**: Supabase
- **Storage (Media)**: Cloudflare R2
- **Deployment**: Cloudflare Pages (Netlify is no longer used)

### 🚀 주요 관리자 기능

#### 음원 상태 동기화 API
DB의 음원 목록과 실제 R2 스토리지의 파일을 대조하여 상태를 업데이트합니다.
- **URL**: `/api/admin/sync-audio-status` (GET 요청)
- **기능**:
    - R2 스토리지 내 실제 파일 존재 여부 전수 조사
    - `audio_files` 테이블의 `audio_url_status` 컬럼 자동 업데이트 (`TRUE`/`FALSE`)
    - 작업 완료 후 전체 통계 리포트 제공

---

## Deployment Guide (Cloudflare Pages)
이 프로젝트는 Cloudflare Pages를 통해 `main` 브랜치에서 자동 배포됩니다.

### Cloudflare Dashboard Build Settings
대시보드의 **Settings > Build & deployments > Build configurations**에서 아래와 같이 설정해야 모든 브랜치에서 에러 없이 작동합니다.

- **Build command**: `npm run build`
- **Deploy command**: (빈칸)
- **Non-production branch deploy command**: (빈칸)
- **Build output directory**: `.next`

### 주의사항
- `npx wrangler versions upload` 또는 `npx wrangler pages deploy` 같은 커스트 명령어를 대시보드에 직접 넣지 마세요. (빈칸으로 두면 클라우드플레어가 알아서 배포합니다.)
- **Netlify**: 더 이상 사용하지 않습니다. (`netlify.toml` 등은 무시하세요.)
- **AI Features**: OpenAI(스크립트) 및 Google Cloud TTS(라디오 음성)가 통합되어 있습니다.
