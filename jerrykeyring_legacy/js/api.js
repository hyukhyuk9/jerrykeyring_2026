/**
 * jerrykeyring_legacy/js/api.js
 * 데이터 및 백엔드 연동을 위한 API 추상화 계층
 * 추후 Supabase 등의 DB나 백엔드 서버 연동 시 본 파일의 함수들만 수정하면 됩니다.
 */

// 데이터: 추후 DB에서 비동기로 불러오는 것으로 대체 가능
window.api = window.api || {};

window.api.mbtiQuestions = {
  1: { "title": "Q.<br><br>콘서트에 간다면 당신은?", "type": "EI", "A": "귀가 녹는다... 박효신이 내 심장을 간질간질", "B": "지디 나왔다!!! 다비켜ㅕㅕ🔥 아갓더 단독" },
  2: { "title": "Q.<br><br>콘서트 당일의 당신 행동은?", "type": "EI", "A": "굿즈부터 싹쓸이! 이건 투자야... (합리화 완료)", "B": "떼창하다가 성대 나감. 근데 행복이가 되." },
  3: { "title": "Q.<br><br>길 가다 최애 노래가 흘러나온다면?", "type": "EI", "A": "쉿... 집중. 내 최애곡 내적 감상", "B": "이건 못 참지! 리듬타다 옆사람 놀라 타닥" },
  4: { "title": "Q.<br><br>하루 종일 한 곡만 들을 수 있다면?", "type": "SN", "A": "R&B로 감성 샤워함... 오늘 하루 무드 세팅 완료", "B": "힙합이 내 심장 박동수랑 동기화 중" },
  5: { "title": "Q.<br><br>도전 앞둔 당신, 무슨 음악 들을래?", "type": "SN", "A": "EDM 폭발! 맘속에서 불꽃놀이 터지는 중", "B": "아무노래나 일단 틀어! 가사 안봐 난" },
  6: { "title": "Q.<br><br>드라이브하면서 듣고 싶은 건?", "type": "SN", "A": "발라드로 창밖 보며 로또 1등된 주인공 놀이", "B": "댄스곡 틀자! 와이퍼랑 박자 맞춰야지" },
  7: { "title": "Q.<br><br>라이브 공연에서 제일 기다리는 순간?", "type": "TF", "A": "그 고음, 소름... 닭살 ON!", "B": "떼창 각이다. 옆사람이랑 아이컨택도 가능" },
  8: { "title": "Q.<br><br>음악에서 제일 중요한 건?", "type": "TF", "A": "이 가사, 내 얘기잖아… 진짜 울뻔", "B": "들으면 자동 흥얼. 중독성 뭐냐고" },
  9: { "title": "Q.<br><br>무한 반복 가능한 곡 스타일은?", "type": "TF", "A": "재즈는 들을수록 빠져... 이건 마성의 감성", "B": "댄스곡 무한루프 가능. 나 혼자 클럽 개장함" },
  10: { "title": "Q.<br><br>노래방 가면 당신은?", "type": "JP", "A": "감성 충만 발라드로 입장합니다~ (하늘 보며)", "B": "디바 모드 ON! 마이크 터뜨리러 왔다" },
  11: { "title": "Q.<br><br>비 오는 날 듣고 싶은 노래는?", "type": "JP", "A": "창가에 앉아 발라드... 비 소리랑 찰떡", "B": "재즈 한 잔에 R&B 한 모금, 분위기 무드등 켜짐" },
  12: { "title": "Q.<br><br>친구가 신곡 추천해줬을 때?", "type": "JP", "A": "10초 듣고 별로면 스킵~ 내 귀는 까다로움", "B": "잘 몰라도 일단 리듬 탑승! 출발~" }
};

window.api.mbtiResults = {
  "INTJ": { "genre": "🧀 EDM", "img": "8블루.png", "cheese": "블루" },
  "INTP": { "genre": "🧀 Jazz", "img": "4카망베르.png", "cheese": "카망베르" },
  "ENTJ": { "genre": "🧀 EDM", "img": "8블루.png", "cheese": "블루" },
  "ENTP": { "genre": "🧀 Hip-hop", "img": "6파마산.png", "cheese": "파마산" },
  "INFJ": { "genre": "🧀 Folk", "img": "7아메리칸.png", "cheese": "아메리칸" },
  "INFP": { "genre": "🧀 Indie Pop", "img": "1모짜렐라.png", "cheese": "모짜렐라" },
  "ENFJ": { "genre": "🧀 Ballad", "img": "3리코타.png", "cheese": "리코타" },
  "ENFP": { "genre": "🧀 City Pop", "img": "2체다.png", "cheese": "체다" },
  "ISTJ": { "genre": "🧀 Folk", "img": "7아메리칸.png", "cheese": "아메리칸" },
  "ISFJ": { "genre": "🧀 Ballad", "img": "3리코타.png", "cheese": "리코타" },
  "ESTJ": { "genre": "🧀 City Pop", "img": "2체다.png", "cheese": "체다" },
  "ESFJ": { "genre": "🧀 R&B", "img": "5고다.png", "cheese": "고다" },
  "ISTP": { "genre": "🧀 Jazz", "img": "4카망베르.png", "cheese": "카망베르" },
  "ISFP": { "genre": "🧀 R&B", "img": "5고다.png", "cheese": "고다" },
  "ESTP": { "genre": "🧀 Hip-hop", "img": "6파마산.png", "cheese": "파마산" },
  "ESFP": { "genre": "🧀 Hip-hop", "img": "6파마산.png", "cheese": "파마산" }
};

window.api.resultExplain = {
  "INTJ": { "explain": "INTJ" }, "INTP": { "explain": "INTP" }, "ENTJ": { "explain": "ENTJ" }, "ENTP": { "explain": "ENTP" },
  "INFJ": { "explain": "INFJ" }, "INFP": { "explain": "INFP" }, "ENFJ": { "explain": "ENFJ" }, "ENFP": { "explain": "ENFP" },
  "ISTJ": { "explain": "ISTJ" }, "ISFJ": { "explain": "ISFJ" }, "ESTJ": { "explain": "ESTJ" }, "ESFJ": { "explain": "ESFJ" },
  "ISTP": { "explain": "ISTP" }, "ISFP": { "explain": "ISFP" }, "ESTP": { "explain": "ESTP" }, "ESFP": { "explain": "ESFP" }
};

window.api.fetchQuestions = async function () {
  return Promise.resolve(window.api.mbtiQuestions);
};

window.api.fetchResult = async function (mbtiCode) {
  return Promise.resolve({
    result: window.api.mbtiResults[mbtiCode],
    explain: window.api.resultExplain[mbtiCode]
  });
};

/**
 * 구글 앱스 스크립트 웹앱 주소를 넣는 곳입니다.
 */
const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbw6CTQ9zuuFmA60snWmEDLrNaPYXvnuNENP1R2u2gORHXd5COTObt4au5fDh2KmJdzg/exec';

window.api.getUserInfo = async function (nfcNumber) {
  if (nfcNumber === 'sample') {
    return {
      success: true,
      data: {
        'nfc_number': '16', // Use a valid demo track from the local music folder
        '장르': '샘플 체험용 트랙',
        '가사': '환영합니다! 제리키링 샘플 플레이어입니다.\n[00:02.00] 이 곡은 기능 체험을 위해 제공되는 샘플 음원입니다.\n[00:06.00] 하단의 다양한 버튼들을 직접 눌러보세요.\n[00:10.00] 다른 사용자의 음원 연동이나, 랜덤 음원 재생도 가능합니다.\n[00:15.00] 환경 설정에서 옵션을 변경해보며 기능을 테스트해보세요!',
        '시리얼': 'SAMPLE-1004'
      }
    };
  }

  if (!GOOGLE_SCRIPT_URL || GOOGLE_SCRIPT_URL.includes('여기에_배포된')) {
    return { success: false };
  }
  try {
    // [보안/CORS 방지] POST 대신 GET 방식으로 전환하여 더 안정적으로 데이터를 가져옵니다.
    const url = `${GOOGLE_SCRIPT_URL}?action=getUserInfo&nfcNumber=${encodeURIComponent(nfcNumber)}`;
    const response = await fetch(url);
    return await response.json();
  } catch (err) {
    console.error('유저 정보 불러오기 에러:', err);
    return { success: false };
  }
};

window.api.verifyUser = async function (nfcNumber, name, phone) {
  if (!GOOGLE_SCRIPT_URL || GOOGLE_SCRIPT_URL.includes('여기에_배포된')) {
    console.warn('구글 시트 연동 URL이 비어 있습니다. 임시 통과 모드로 작동합니다.');
    return new Promise((resolve) => setTimeout(() => {
      if (nfcNumber && name && phone) resolve({ success: true, message: '임시 통과' });
      else resolve({ success: false, message: '모든 정보를 입력해주세요.' });
    }, 500));
  }

  const cleanPhone = phone.replace(/[^0-9]/g, '').replace(/^0/, '');

  try {
    // 인증 요청도 더 안정적인 GET 방식으로 시도
    const url = `${GOOGLE_SCRIPT_URL}?action=verifyNfc&nfcNumber=${encodeURIComponent(nfcNumber)}&name=${encodeURIComponent(name)}&phone=${encodeURIComponent(cleanPhone)}`;
    const response = await fetch(url);
    return await response.json();
  } catch (err) {
    console.error('구글 시트 연동 에러:', err);
    throw err;
  }
};
