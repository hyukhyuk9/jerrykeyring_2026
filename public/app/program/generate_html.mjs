// ✅ 제리키링 HTML 생성기 (Node.js 버전)
// 실행 예시: node generate_html.mjs 6207 3068 2821 5453 8825

import fs from "fs";
import path from "path";
import { execSync } from "child_process";

// 기본 HTML 파일 경로
const baseHtml = path.resolve("./ai.html");
// 출력 폴더 (Downloads/제리키링_HTML)
const outputDir = path.resolve(process.env.HOME, "Downloads/제리키링_HTML");

// 폴더 없으면 생성
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// ai.html 존재 확인
if (!fs.existsSync(baseHtml)) {
  console.error("⚠️ ai.html 파일이 현재 폴더에 없습니다.");
  process.exit(1);
}

// 인자(번호들) 확인 및 쉼표/공백 분리 처리
let args = process.argv.slice(2)
  .flatMap(arg => arg.split(","))
  .map(s => s.trim())
  .filter(s => s.length > 0);
if (args.length === 0) {
  console.error("❗ 번호를 하나 이상 입력하세요. 예: node generate_html.mjs 6207 3068 2821");
  process.exit(1);
}

// ai.html 원본 읽기 (UTF-8 그대로)
const baseHtmlText = fs.readFileSync(baseHtml, "utf-8");

// HTML 생성
for (const num of args) {
  const lyricsNum = num.toString().padStart(3, "0");
  const targetPath = path.join(outputDir, `${num}.html`);

  // 기존 버튼 제거: /music/{num}.mp3 또는 /lyrics/{lyricsNum}.txt가 포함된 <button>...</button> 태그 삭제
  // 그리고 항상 /music/4479.mp3 또는 /lyrics/4479.txt가 포함된 <button>...</button> 태그도 삭제
  // 정규식으로 <button ...>...</button> 중에서 해당 경로 포함하는 부분을 찾아서 제거
  const buttonRegex = new RegExp(`<button[\\s\\S]*?(/music/${num}\\.mp3|/lyrics/${lyricsNum}\\.txt)[\\s\\S]*?<\\/button>`, "g");
  let newHtmlText = baseHtmlText.replace(buttonRegex, "");

  const fixedButtonRegex = /<button[\s\S]*?(\/music\/4479\.mp3|\/lyrics\/4479\.txt)[\s\S]*?<\/button>/g;
  newHtmlText = newHtmlText.replace(fixedButtonRegex, "");

  const buttonCode = `
    <button class="btn-orange btn-outline-primary track-button" style="display: none;" onclick="playTrack('/music/${num}.mp3', '/lyrics/${lyricsNum}.txt')">
      <img src="iphone.png" class="size">
      <p>음원</p>
    </button>`;

  // 여기에 변경 뒤에 버튼 삽입
  newHtmlText = newHtmlText.replace("<!-- 여기에 변경 -->", `<!-- 여기에 변경 -->\n${buttonCode}`);

  // 파일 쓰기 (덮어쓰기 허용)
  fs.writeFileSync(targetPath, newHtmlText, "utf-8");
  console.log(`✅ ${num}.html 생성 완료`);
}

console.log(`\n🎉 모든 파일이 ${outputDir} 폴더에 저장되었습니다!`);

// Finder 자동 열기
try {
  execSync(`open "${outputDir}"`);
} catch {
  console.warn("⚠️ Finder 자동 열기 실패 (수동으로 확인하세요)");
}