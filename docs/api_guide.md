# 🔌 JerryKeyring API 가이드 (API Guide)

이 문서는 JerryKeyring 서비스의 백엔드 엔드포인트 및 관리자용 API 명세를 정리합니다.

---

## 1. 관리자 API

### 🔄 음원 상태 동기화 API
DB의 음원 목록과 실제 R2 스토리지의 파일 존재 여부를 대조하여 `audio_url_status`를 동기화합니다.

- **Endpoint**: `/api/admin/sync-audio-status`
- **Method**: `GET`
- **주요 로직**:
    1. Supabase `audio_files` 테이블의 모든 레코드 조회.
    2. 각 레코드의 `audio_url`을 기반으로 Cloudflare R2에 `HeadObject` 요청 전송.
    3. 파일 존재 여부에 따라 DB의 `audio_url_status`를 `TRUE` 또는 `FALSE`로 업데이트.
- **Response**:
    ```json
    {
      "message": "동기화 완료",
      "summary": {
        "total": 100,
        "exists": 95,
        "missing": 5
      }
    }
    ```

---

## 2. 클라이언트/기타 API (추가 예정)
- **음원 업로드 API**: `/api/upload` (R2 업로드 및 DB 기록)
- **NFC 데이터 조회**: `/api/nfc/[id]` (해당 NFC ID의 트랙 및 음원 정보 반환)

---
*새로운 API 추가 시 엔드포인트와 요청/응답 형식을 기술해 주세요.*
