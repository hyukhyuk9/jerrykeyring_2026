'use client';

import { useState } from 'react';

// 추후 이 페이지는 참여자(일반 사용자)가 자신의 음원 가사 싱크를 직접 맞출 수 있도록 
// 퍼블릭 라우터(/lyrics/editor) 등으로 분리되거나 권한이 오픈될 수 있습니다.
// TODO: 참여자 개방 모드 지원 (세션/토큰 기반 인증 적용 예정)

interface TimelineLyric {
  id: string;
  time: number; // 초 단위 타임스탬프
  text: string;
}

export default function LyricsTimelineEditor() {
  const [lyrics, setLyrics] = useState<TimelineLyric[]>([
    { id: '1', time: 0, text: '가사를 입력하세요' }
  ]);
  const [audioUrl, setAudioUrl] = useState<string>('');
  const [currentTime, setCurrentTime] = useState<number>(0);

  // 타임라인 추가
  function addLyricLine() {
    const newLine = { id: Date.now().toString(), time: currentTime, text: '' };
    setLyrics([...lyrics, newLine].sort((a, b) => a.time - b.time));
  }

  // 타임라인 수정
  function updateLyric(id: string, text: string) {
    setLyrics(lyrics.map(l => l.id === id ? { ...l, text } : l));
  }
  
  function updateTime(id: string, time: number) {
    setLyrics(lyrics.map(l => l.id === id ? { ...l, time } : l).sort((a, b) => a.time - b.time));
  }

  function deleteLyric(id: string) {
    setLyrics(lyrics.filter(l => l.id !== id));
  }

  // 싱크 맞추기 헬퍼 (현재 오디오 시간을 해당 가사의 시간으로 설정)
  function syncCurrentTime(id: string) {
    updateTime(id, currentTime);
  }

  return (
    <div className="admin-container">
      <h1 className="admin-title">🎧 가사 타임라인 에디터</h1>
      <p style={{ textAlign: 'center', color: '#888', fontSize: '0.8rem', marginBottom: '2rem' }}>
        오디오 타임라인에 맞춰 정확한 가사 싱크를 조정합니다.<br/>
        (이 기능은 추후 일반 사용자에게도 오픈될 예정입니다)
      </p>

      {/* 오디오 플레이어 로드 영역 */}
      <div style={{ background: '#111', padding: '1.5rem', borderRadius: 'var(--radius)', marginBottom: '1.5rem', border: '1px solid #222' }}>
        <h3 style={{ color: 'var(--primary)', fontSize: '0.9rem', marginBottom: '1rem' }}>오디오 소스 연결</h3>
        <input 
          type="text" 
          className="admin-input" 
          placeholder="테스트할 음원 URL을 입력하거나 NFC 연동을 선택하세요" 
          value={audioUrl}
          onChange={(e) => setAudioUrl(e.target.value)}
        />
        {audioUrl && (
          <audio 
            controls 
            src={audioUrl} 
            style={{ width: '100%', marginTop: '1rem', borderRadius: '50px' }}
            onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
          />
        )}
      </div>

      {/* 가사 에디터 영역 */}
      <div style={{ background: '#111', padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid #222' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <h3 style={{ color: 'var(--primary)', fontSize: '0.9rem' }}>타임라인 리스트</h3>
          <button className="admin-btn-outline" onClick={addLyricLine}>+ 새로운 줄 추가</button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {lyrics.map((lyric, idx) => (
            <div key={lyric.id} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', background: '#0a0a0a', padding: '0.5rem', borderRadius: '8px' }}>
              <div style={{ width: '60px', textAlign: 'center', fontSize: '0.75rem', color: '#888' }}>
                {(lyric.time / 60 | 0).toString().padStart(2, '0')}:
                {(lyric.time % 60 | 0).toString().padStart(2, '0')}
              </div>
              <input 
                type="text" 
                className="admin-input" 
                style={{ flex: 1, marginBottom: 0 }} 
                value={lyric.text}
                onChange={(e) => updateLyric(lyric.id, e.target.value)}
                placeholder="가사를 입력하세요"
              />
              <button 
                className="admin-btn" 
                style={{ padding: '0.4rem 0.8rem', fontSize: '0.7rem' }}
                onClick={() => syncCurrentTime(lyric.id)}
                title="현재 재생 시간으로 맞추기"
              >
                📍 싱크
              </button>
              <button 
                style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0 0.5rem' }}
                onClick={() => deleteLyric(lyric.id)}
              >
                ✕
              </button>
            </div>
          ))}
        </div>

        <div style={{ marginTop: '2rem', textAlign: 'center' }}>
          <button className="admin-btn" style={{ width: '100%', maxWidth: '300px' }} onClick={() => alert('타임라인 저장 완료 (API 연동 대기)')}>
            타임라인 저장하기
          </button>
        </div>
      </div>
    </div>
  );
}
