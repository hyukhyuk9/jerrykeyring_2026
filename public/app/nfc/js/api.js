/**
 * jerrykeyring_legacy/nfc/js/api.js
 * 플레이리스트 및 오디오 메타데이터 연동을 위한 API 추상화 계층
 * 추후 Supabase 연동 시, Supabase Client 기반의 fetch 로직으로 교체하면 됩니다.
 */

// 데이터: 추후 DB에서 비동기로 불러오는 것으로 대체 (Supabase 등)
window.nfcApi = window.nfcApi || {};

window.nfcApi.defaultPlaylist = [
  { src: '../music/admin/01.mp3', name: '01. ✍🏻 2시간 집중력 UP!' },
  { src: '../music/admin/02.mp3', name: '02. 𝐄𝐃𝐌 👻 Louis The Child 👻' },
  { src: '../music/admin/03.mp3', name: '03. 수련자 전용' },
  { src: '../music/admin/04.mp3', name: '04. 미친 듯이 몰입하면 남들은 천재라 부른다.' },
  { src: '../music/admin/05.mp3', name: '05. 아침, 시작 ｜ Piano ' },
  { src: '../music/admin/06.mp3', name: '06. 멍하니 무언가 끄적이고 싶을 때' },
  { src: '../music/admin/07.mp3', name: '07. 내가 사랑하는 영화 속 재즈 ' },
  { src: '../music/admin/08.mp3', name: '08. 버드나무 아래 작은 만찬 | 오후의 초록 ' }
];

window.nfcApi.fetchAdminPlaylist = async function() {
  return Promise.resolve(window.nfcApi.defaultPlaylist);
};
