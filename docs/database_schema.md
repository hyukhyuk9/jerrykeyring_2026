# 🗄️ JerryKeyring 데이터베이스 스키마 (Database Schema)

이 문서는 JerryKeyring 프로젝트에서 사용하는 Supabase(PostgreSQL) 테이블 구조를 상세히 정의합니다.

---

## 1. 개요
모든 테이블은 Supabase를 통해 관리되며, 기본적으로 `public` 스키마에 위치합니다.

---

## 2. 테이블 상세 정보

### 🔹 `tracks` 테이블
유저의 마스터 정보와 곡의 메타데이터를 관리합니다.
- `nfc_id` (PK): NFC 태그 고유 식별자 (예: 9220, string)
- `user_name`: 사용자 이름 (string)
- `phone_number`: 연락처 (string)
- `genre`: 곡의 장르 (콤마로 구분하여 다중 트랙 지원, string)
- `status`: 현재 상태 (가사 폴백 및 시스템 플래그용, string)
- `lyrics`: 기본 가사 (text)
- `sync_lyrics`: [mm:ss.00] 타임스탬프가 포함된 싱크 가사 (text)
- `story`: AI 라디오 생성을 위한 유저 사연 (text)
- `serial`: 기기 시리얼 번호 (SN: XXXX, string)
- `music_title`: 사용자가 직접 기입한 곡의 제목 (string)
- `created_at`: 생성 일시 (timestamp with timezone)

### 🔹 `audio_files` 테이블
실제 음원 파일 및 AI 라디오 파일의 저장소 경로를 관리합니다.
- `id` (PK): 고유 식별자 (bigint, auto-increment)
- `nfc_id`: 연동된 유저의 식별자 (`tracks.nfc_id`와 연계)
- `audio_url`: 메인 음악 파일의 R2 주소 (예: `media/music/9220.mp3`, string)
- `audio_url_status`: (Boolean) 메인 음악 파일 존재 여부
- `radio_url`: AI 라디오 TTS 파일의 R2 주소 (예: `media/radio/9220_tts.mp3`, string)
- `radio_url_status`: (Boolean) 라디오 파일 존재 여부
- `category`: 파일 분류 (기본값: `music`)
- `radio_script`: TTS 생성을 위한 라디오 대본 (text)
- `created_at`: 생성 일시 (timestamp with timezone)

---

## 3. Cloudflare R2 스토리지 구조
파일은 `media` 루트 폴더를 기준으로 용도에 따라 분리하여 저장합니다. 모든 파일명은 해당 유저의 `nfc_id`와 동일하게 설정합니다.

### 📂 폴더 및 파일 규칙
- **메인 음악**: `media/music/[nfc_id].mp3`
- **AI 라디오**: `media/radio/[nfc_id]_tts.mp3`

| 경로 | 설명 | 예시 (`nfc_id`: 9220) |
| :--- | :--- | :--- |
| `media/music/` | 원본 음악 파일 저장소 | `media/music/9220.mp3` |
| `media/radio/` | 생성된 AI 라디오(TTS) 파일 저장소 | `media/radio/9220_tts.mp3` |

## 4. 관계 및 무결성 (Integrity)
- **`nfc_id` 기반 연동**: 모든 데이터는 NFC 태그의 고유 ID인 `nfc_id`를 기준으로 조회됩니다.
- **R2 동기화**: `audio_files` 테이블의 경로는 실제 Cloudflare R2 버킷의 경로(`media/music/` 또는 `media/radio/`)와 일치해야 하며, `_status` 필드를 통해 유효성을 주기적으로 검사합니다.

---
*스키마 변경 시 반드시 이 문서를 업데이트하고 관련 API 로직을 점검하세요.*
