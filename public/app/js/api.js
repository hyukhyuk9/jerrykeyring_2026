/**
 * jerrykeyring_legacy/js/api.js
 * 데이터 및 백엔드 연동을 위한 API 추상화 계층 - Supabase 통합 버전
 */

window.api = window.api || {};

// 수파베이스 설정
const SUPABASE_URL = 'https://ndvwvprwjergkyfvbytd.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5kdnd2cHJ3amVyZ2t5ZnZieXRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyNTkyMzUsImV4cCI6MjA5MTgzNTIzNX0.Nm0pwyGX9pBU13BSFED7rrutfAqpBOtCijG3zpsy3do';

// 수파베이스 클라이언트 초기화 (CDN으로 로드된 supabase 객체 사용)
let supabaseClient = null;
function getSupabase() {
  if (!supabaseClient && window.supabase) {
    supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
  }
  return supabaseClient;
}

// MBTI 데이터 (기존 유지)
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

window.api.fetchQuestions = async function () { return Promise.resolve(window.api.mbtiQuestions); };
window.api.fetchResult = async function (mbtiCode) {
  return Promise.resolve({
    result: window.api.mbtiResults[mbtiCode],
    explain: { "explain": mbtiCode }
  });
};

/**
 * Supabase를 통한 유저 정보 조회
 */
window.api.getUserInfo = async function (nfcNumber) {
  // 'sample' ID로 접근 시 실제 DB의 '000000' 데이터를 가져오도록 매핑
  if (nfcNumber === 'sample') {
    nfcNumber = '000000';
  }

  const client = getSupabase();
  if (!client) return { success: false, message: 'Supabase client not initialized' };

  try {
    const { data, error } = await client
      .from('tracks')
      .select('*')
      .eq('nfc_id', nfcNumber)
      .single();

    if (error) throw error;
    return { success: true, data: data };
  } catch (err) {
    console.error('유저 정보 불러오기 에러:', err);
    return { success: false };
  }
};

/**
 * Supabase를 통한 NFC 인증
 */
window.api.verifyUser = async function (nfcNumber, name, phone) {
  const client = getSupabase();
  if (!client) return { success: false };

  const cleanInputPhone = phone.replace(/[^0-9]/g, ''); // 입력값에서 모든 숫자만 추출
  const trimmedName = name.trim(); // 이름 앞뒤 공백 제거

  console.log('[Auth Debug] 요청 정보:', { nfcNumber, trimmedName, cleanInputPhone });

  try {
    // 1. NFC 번호와 이름으로 먼저 해당 유저를 찾습니다.
    const { data, error } = await client
      .from('tracks')
      .select('nfc_id, user_name, phone_number')
      .eq('nfc_id', nfcNumber)
      .eq('user_name', trimmedName)
      .single();

    if (error || !data) {
      console.log('[Auth Debug] 일치하는 유저 없음:', error);
      return { success: false, message: '기입된 정보가 일치하지 않습니다.' };
    }

    // 2. DB의 전화번호에서도 하이픈 등을 제거하고 비교합니다.
    const dbPhone = data.phone_number.replace(/[^0-9]/g, '');
    console.log('[Auth Debug] 번호 비교:', { dbPhone, cleanInputPhone });

    if (dbPhone.endsWith(cleanInputPhone) || cleanInputPhone.endsWith(dbPhone.slice(-8))) {
      console.log('[Auth Debug] 인증 성공:', data);
      return { success: true, message: '인증 완료' };
    } else {
      console.log('[Auth Debug] 전화번호 불일치');
      return { success: false, message: '전화번호가 일치하지 않습니다.' };
    }
  } catch (err) {
    console.error('[Auth Debug] 예외 발생:', err);
    return { success: false, message: '서버 통신 중 오류가 발생했습니다.' };
  }
};

/**
 * Supabase를 통한 음원 파일 목록 조회
 */
window.api.getAudioFiles = async function (nfcNumber) {
  // 'sample' ID로 접근 시 실제 DB의 '000000' 데이터를 가져오도록 매핑
  if (nfcNumber === 'sample') {
    nfcNumber = '000000';
  }

  const client = getSupabase();
  if (!client) return [];

  try {
    const { data, error } = await client
      .from('audio_files')
      .select('*')
      .eq('nfc_id', nfcNumber)
      .order('created_at', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.error('음원 목록 불러오기 에러:', err);
    return [];
  }
};

/**
 * Supabase를 통해 랜덤으로 음원 한 곡과 해당 곡의 정보를 가져옵니다.
 */
window.api.getRandomTrack = async function () {
  const client = getSupabase();
  if (!client) return null;

  try {
    // 1. 모든 오디오 파일 목록을 가져옵니다. (필터 없이 전수 조사)
    const { data: allAudios, error: fetchErr } = await client
      .from('audio_files')
      .select('*');

    if (fetchErr) throw fetchErr;
    if (!allAudios || allAudios.length === 0) throw new Error('No audio files found');

    // 2. 무작위 한 곡을 선택합니다.
    const randomIndex = Math.floor(Math.random() * allAudios.length);
    const audioData = allAudios[randomIndex];
    
    // 3. 해당 음원의 트랙 정보(장르, 가사 등)를 가져옵니다.
    const { data: trackInfo, error: trackErr } = await client
      .from('tracks')
      .select('genre, lyrics')
      .eq('nfc_id', audioData.nfc_id)
      .maybeSingle();

    if (trackErr) console.error('트랙 정보 로드 실패:', trackErr);

    // 4. 데이터 정제 및 반환
    return {
      id: audioData.id,
      audio_url: audioData.audio_url,
      nfc_id: audioData.nfc_id,
      tracks: trackInfo || { genre: '랜덤 음원', lyrics: '제리키링AI' }
    };
  } catch (err) {
    console.error('랜덤 음원 불러오기 에러:', err);
    return null;
  }
};
/**
 * [관리자용] 모든 트랙 정보 가져오기
 */
window.api.getAllTracks = async function () {
  const client = getSupabase();
  if (!client) return [];
  try {
    const { data, error } = await client
      .from('tracks')
      .select('*, audio_files(audio_url)')
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  } catch (err) {
    console.error('전체 트랙 로드 에러:', err);
    return [];
  }
};

/**
 * [관리자용] 트랙 정보 업데이트
 */
window.api.updateTrack = async function (id, updateData) {
  const client = getSupabase();
  if (!client) return { success: false };
  try {
    const { error } = await client
      .from('tracks')
      .update(updateData)
      .eq('id', id);
    if (error) throw error;
    return { success: true };
  } catch (err) {
    console.error('트랙 업데이트 에러:', err);
    return { success: false, message: err.message };
  }
};

/**
 * [관리자용] 새 트랙 추가
 */
window.api.insertTrack = async function (trackData) {
  const client = getSupabase();
  if (!client) return { success: false };
  try {
    const { error } = await client
      .from('tracks')
      .insert([trackData]);
    if (error) throw error;
    return { success: true };
  } catch (err) {
    console.error('트랙 추가 에러:', err);
    return { success: false, message: err.message };
  }
};

/**
 * [관리자용] 트랙 삭제
 */
window.api.deleteTrack = async function (id) {
  const client = getSupabase();
  if (!client) return { success: false };
  try {
    const { error } = await client
      .from('tracks')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return { success: true };
  } catch (err) {
    console.error('트랙 삭제 에러:', err);
    return { success: false, message: err.message };
  }
};

/**
 * [관리자용] 음원 업로드 (백그라운드 처리용)
 */
window.api.uploadAudio = async function (file, nfcId) {
  const client = getSupabase();
  if (!client) return { success: false };

  try {
    const filePath = `audio/${Date.now()}_${file.name}`;
    const { data: uploadData, error: uploadError } = await client.storage
      .from('audio')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    const { data: { publicUrl } } = client.storage.from('audio').getPublicUrl(filePath);

    // audio_files 테이블에 기록 (nfc_id 기반 매핑)
    const { error: dbError } = await client
      .from('audio_files')
      .insert({ nfc_id: nfcId, audio_url: publicUrl });

    if (dbError) throw dbError;

    return { success: true, url: publicUrl };
  } catch (err) {
    console.error('음원 업로드 에러:', err);
    return { success: false, message: err.message };
  }
};

/**
 * [관리자용] 가사 싱크용 데이터 초기화 (에벌 데이터 생성)
 */
window.api.generateInitialSync = function (lyricsText, durationSeconds) {
  // '수정없음', NULL, 공백 등을 모두 체크하여 실제 유효한 텍스트인지 판단
  const isValid = (txt) => txt && txt.trim() !== '' && txt !== '수정없음';
  
  let text = isValid(lyricsText) ? lyricsText : "가사가 등록되지 않았습니다. 관리자 페이지에서 가사를 입력해 주세요.";

  const lines = text.split('\n')
    .map(l => l.replace(/\[.*?\]/g, '').replace(/\(.*?\)/g, '').trim())
    .filter(l => l.length > 0);

  const interval = durationSeconds > 0 ? durationSeconds / (lines.length || 1) : 0;

  return lines.map((text, idx) => {
    const totalSeconds = Math.floor(interval * idx);
    const min = Math.floor(totalSeconds / 60);
    const sec = totalSeconds % 60;
    
    return {
      section_name: text.length > 80 ? text.substring(0, 77) + '...' : text,
      start_time: `${String(min).padStart(2, '0')}분 ${String(sec).padStart(2, '0')}초`
    };
  });
};

/**
 * [관리자용] LRC 문자열을 에디터용 배열로 변환
 */
window.api.parseSyncLyrics = function (lrcText) {
  if (!lrcText) return null;
  const lines = lrcText.split('\n');
  const result = [];
  const regex = /\[(\d{2}):(\d{2})\.\d{2}\]\s*(.*)/;

  lines.forEach(line => {
    const match = line.match(regex);
    if (match) {
      result.push({
        start_time: `${match[1]}분 ${match[2]}초`,
        section_name: match[3].trim()
      });
    }
  });
  return result.length > 0 ? result : null;
};


/**
 * [관리자용] AI 라디오 배치 생성 (GPT + TTS -> R2)
 */
window.api.generateBatchRadio = async function (nfc_id, story) {
  try {
    const res = await fetch('/api/radio/batch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nfc_id, story })
    });
    
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || '라디오 생성 실패');
    
    return { success: true, data };
  } catch (err) {
    console.error('AI 라디오 생성 에러:', err);
    return { success: false, message: err.message };
  }
};
