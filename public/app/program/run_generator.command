#!/bin/zsh
# 🚀 제리키링 HTML 생성기 (쉼표 입력 → 개별 파일 생성)
OUTPUT_DIR="$HOME/Downloads/제리키링_HTML"
mkdir -p "$OUTPUT_DIR"

clear
echo "-----------------------------------------"
echo "🎧 제리키링 HTML 생성기"
echo "-----------------------------------------"
echo ""
echo "번호를 쉼표(,)로 구분해 입력하세요"
echo "예시 👉 6207,3068,2821"
echo ""

read "input_numbers?입력: "

# 쉼표 제거 및 배열로 변환
IFS=',' read -rA numbers <<< "$input_numbers"

if [[ ${#numbers[@]} -eq 0 ]]; then
  echo "❗ 번호를 하나 이상 입력해야 합니다."
  read -k1 "?엔터를 눌러 종료합니다."
  exit 1
fi

echo ""
echo "📂 HTML 파일 생성 중..."
echo ""

for file in "${numbers[@]}"; do
  file=$(echo "$file" | xargs)  # 앞뒤 공백 제거
  lyrics_num=$(printf "%03d" "$file")
  filepath="${OUTPUT_DIR}/${file}.html"

  cat <<EOF > "$filepath"
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>제리키링 | 내 음원 듣기</title>
  <link rel="icon" type="image/png" href="iphone.png">
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
  <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/css/style.css">
  <style>
    .youtube-link {border:none!important;background:none!important;transition:none!important;}
    .share-link {border:none!important;background:none!important;transition:none!important;}
  </style>
</head>
<body class="dark-mode">
  <header><img src="iphone.png" alt="로고" class="logo"></header>
  <main>
    <audio id="audioPlayer" controls style="width:100%;max-width:300px;padding-bottom:15px;display:none;"></audio>
    <div class="intro-text"><p>AI 음원 불러오는중..</p></div>
    <video id="introVideo" autoplay muted playsinline style="width:100%;max-width:400px;display:block;">
      <source src="/video/video.mp4" type="video/mp4">
    </video>

    <!-- 여기에 변경 -->
    <button class="btn-orange btn-outline-primary track-button" style="display:none;" onclick="playTrack('/music/${file}.mp3', '/lyrics/${lyrics_num}.txt')">
      <img src="iphone.png" class="size">
      <p>음원</p>
    </button>

    <div id="lyrics"></div>
    <div class="action-buttons" style="display:none;">
      <a class="youtube-link" href="https://www.youtube.com/@%EC%A0%9C%EB%A6%AC%ED%82%A4%EB%A7%81AI" target="_blank"><i class="fa-brands fa-youtube"></i></a>
      <button id="shareBtn" class="share-link"><i class="fa-solid fa-share"></i></button>
    </div>
    <p class="mb-0" style="font-size:7pt;text-align:center;margin-top:5px;color:#ff914d;font-weight:500;display:none;opacity:0;">*DBD LAB. | 나만의 앨범키링</p>
  </main>
</body>
</html>
EOF

  echo "✅ ${file}.html 생성 완료!"
done

echo ""
echo "🎉 모든 HTML 파일이 '${OUTPUT_DIR}' 폴더에 저장되었습니다!"
open "$OUTPUT_DIR"

read -k1 "?엔터를 눌러 종료합니다."