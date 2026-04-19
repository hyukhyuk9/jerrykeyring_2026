import os
import glob
import shutil

# 프로젝트 경로 설정
NFC_DIR = '/Users/hyuk/Desktop/01_Developer/jerrykeyring_2026/jerrykeyring_legacy/nfc'
PLAYER_HTML = os.path.join(NFC_DIR, '..', 'player.html')

# 1단계: nfc/1.html (마스터 플레이어)을 player.html로 복사
master_template = os.path.join(NFC_DIR, '1.html')
if os.path.exists(master_template):
    with open(master_template, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 경로 보정: nfc/ 폴더에서 root로 나오므로 ../ 를 ./ 로 변경
    content = content.replace('../music/', './music/')
    content = content.replace('../lyrics/', './lyrics/')
    content = content.replace('nfc/js/api.js', 'js/api.js') # script tag 보정
    content = content.replace('../index.html', './index.html')
    
    with open(PLAYER_HTML, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"✅ [1단계 완료] 통합 플레이어(player.html) 구조가 성공적으로 복사 및 경로 보정되었습니다.")
else:
    print(f"❌ 1.html 마스터 파일을 찾을 수 없습니다!")
    exit(1)

# 2단계: 870여개의 nfc/*.html 구형 파일 내용 덮어쓰기 (트랩 스크립트로 전환)
html_files = glob.glob(os.path.join(NFC_DIR, '*.html'))
count = 0
skip_files = ['1.html', 'admin.html', 'mini.html', 'nfc_form.html']

for filepath in html_files:
    basename = os.path.basename(filepath)
    if basename in skip_files:
        continue # 중요 관리 파일은 덮어쓰기 무시
    
    file_id = basename.replace('.html', '')
    if not file_id.isdigit():
        continue # 순수 숫자 파일만 덮어쓰기 타겟팅
        
    redirect_html = f"""<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
    <title>제리키링 | 보안 라우터</title>
    <style>body {{ background: #000; color: #fff; display:flex; justify-content:center; align-items:center; height:100vh; margin:0; font-family:sans-serif; }}</style>
    <script>
        // 현재 이 카드의 고유 번호
        const targetId = "{file_id}";
        
        // 1. 유저가 메인 3D 인터랙티브 화면을 본 적이 없다면?
        if (!localStorage.getItem('seen_interactive_v2')) {{
            // 목적지를 주소에 달아서 강제 입구(메인화면)로 던져버립니다!
            window.location.replace('../index.html?target=' + targetId);
        }} else {{
            // 2. 이미 다 한 번 거친 유저라면, 바로 통합 플레이어로 접속!
            window.location.replace('../player.html?id=' + targetId);
        }}
    </script>
</head>
<body><h2>보안 인증 중...</h2></body>
</html>"""
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(redirect_html)
    count += 1

print(f"✅ [2단계 완료] 총 {count}개의 구형 HTML 파일들이 트랩(강제 라우팅) 스크립트로 일괄 변환되었습니다!")
