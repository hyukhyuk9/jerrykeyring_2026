#!/bin/zsh
# 🎵 제리키링 가사(txt) 생성기 (반복 입력 + 따옴표 제거 + 기존 폴더 유지)

OUTPUT_DIR="$HOME/Downloads/제리키링_LYRICS"

# 폴더 확인 후 없으면 생성
if [ ! -d "$OUTPUT_DIR" ]; then
  mkdir -p "$OUTPUT_DIR"
  echo "📁 새 폴더 생성: $OUTPUT_DIR"
else
  echo "📂 기존 폴더 사용: $OUTPUT_DIR"
fi

clear
echo "-----------------------------------------"
echo "🎶 제리키링 가사(txt) 생성기"
echo "-----------------------------------------"
echo "번호를 입력하면 자동으로 ${OUTPUT_DIR} 폴더에 저장됩니다."
echo "-----------------------------------------"
echo ""

while true; do
  echo ""
  read "song_num?🎵 가사 번호를 입력하세요 (예: 6207): "

  # Ctrl+X 누르면 종료
  if [[ "$song_num" == $'\030' ]]; then
    echo ""
    echo "👋 프로그램을 종료합니다. 수고했어요!"
    break
  fi

  # 입력 공백 시 건너뛰기
  if [[ -z "$song_num" ]]; then
    echo "⚠️  번호를 입력해주세요."
    continue
  fi

  # 3자리 포맷 변환
  lyrics_num=$(printf "%03d" "$song_num")
  filepath="${OUTPUT_DIR}/${lyrics_num}.txt"

  echo ""
  echo "✏️ 가사 내용을 입력하세요 (줄바꿈 가능)"
  echo "입력 완료 후 [Ctrl + D]를 눌러 저장합니다."
  echo "-----------------------------------------"

  tempfile=$(mktemp)
  cat > "$tempfile"

  # 첫 줄 / 마지막 줄 큰따옴표 제거
  sed -i '' '1s/^"//' "$tempfile" 2>/dev/null
  sed -i '' '$s/"$//' "$tempfile" 2>/dev/null

  mv "$tempfile" "$filepath"

  echo ""
  echo "✅ ${lyrics_num}.txt 파일을 만들었습니다!"
  echo "📂 저장 위치: $OUTPUT_DIR"
  echo ""
  echo "🎤 계속해서 제목(번호)을 입력해주세요."
  echo "⛔ 그만하시려면 [Ctrl + X]를 눌러주세요."
  echo "-----------------------------------------"
done

# 완료 후 폴더 자동 열기
open "$OUTPUT_DIR"