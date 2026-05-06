# 🚀 JerryKeyring 배포 가이드 (Deployment Guide)

이 문서는 JerryKeyring 프로젝트를 Cloudflare Pages 및 환경 설정을 관리하는 방법을 설명합니다.

---

## 1. 인프라 구성
- **Hosting**: Cloudflare Pages (Next.js App Router)
- **Database**: Supabase
- **Media Storage**: Cloudflare R2

---

## 2. Cloudflare Pages 배포 설정
대시보드의 **Settings > Build & deployments > Build configurations** 설정을 다음과 같이 유지합니다.

- **Build command**: `npm run build`
- **Build output directory**: `.next`
- **Root directory**: `/`
- **Framework preset**: `Next.js`

### ⚠️ 주의사항
- `Deploy command` 설정을 직접 건드리지 마세요. (빈칸으로 두면 Cloudflare가 알아서 배포합니다.)
- `Netlify` 관련 설정 파일(`netlify.toml` 등)은 레거시이며 더 이상 사용되지 않습니다.

---

## 3. 환경 변수 (Environment Variables)
프로젝트 실행을 위해 다음 변수들이 필요합니다.

### Supabase
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Cloudflare R2
- `R2_ENDPOINT`
- `R2_ACCESS_KEY_ID`
- `R2_SECRET_ACCESS_KEY`
- `R2_BUCKET_NAME`

### AI Integration
- `OPENAI_API_KEY`
- `GOOGLE_APPLICATION_CREDENTIALS` (JSON string)

---
*배포 환경이나 인프라 변경 시 이 문서를 최신 상태로 유지해 주세요.*
