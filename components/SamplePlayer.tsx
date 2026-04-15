'use client';

import { useRef, useState } from 'react';

const SAMPLE_TRACKS = [
  { label: '모짜렐라 | 인디팝', src: '/audio/sample-indiepop.mp3', icon: '/images/1모짜렐라.png' },
  { label: '체다 | 시티팝', src: '/audio/sample-citypop.mp3', icon: '/images/2체다.png' },
  { label: '리코타 | 발라드', src: '/audio/sample-ballad.mp3', icon: '/images/3리코타.png' },
  { label: '카망베르 | 재즈', src: '/audio/sample-jazz.mp3', icon: '/images/4카망베르.png' },
  { label: '고다 | 알앤비', src: '/audio/sample-rnb.mp3', icon: '/images/5고다.png' },
  { label: '파마산 | 힙합', src: '/audio/sample-hiphop.mp3', icon: '/images/6파마산.png' },
  { label: '아메리칸 | 포크', src: '/audio/sample-folk.mp3', icon: '/images/7아메리칸.png' },
  { label: '블루 | EDM', src: '/audio/sample-edm.mp3', icon: '/images/8블루.png' },
];

export default function SamplePlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentTrack, setCurrentTrack] = useState<number>(-1);

  function playTrack(index: number) {
    const audio = audioRef.current;
    if (!audio) return;
    audio.src = SAMPLE_TRACKS[index].src;
    audio.play().catch(() => {});
    setCurrentTrack(index);
  }

  return (
    <>
      <audio ref={audioRef} controls className="audio-player visible" />

      <div className="notice-text">
        <p className="notice-main">🎉 설문폼 작성 후 페이지가 리뉴얼돼요</p>
        <p className="notice-sub">(*사연 접수 후 1~3영업일 내로 변경됩니다.)</p>
      </div>

      {SAMPLE_TRACKS.map((track, i) => (
        <button
          key={i}
          className={`sample-button ${currentTrack === i ? 'playing' : ''}`}
          onClick={() => playTrack(i)}
        >
          <img src={track.icon} alt="" className="cheese-icon" />
          <span className="track-label">{track.label}</span>
          {currentTrack === i && (
            <span style={{ fontSize: '0.7rem', opacity: 0.8 }}>♫</span>
          )}
        </button>
      ))}

      <p className="info-text visible" style={{ marginTop: '1rem' }}>
        *DBD LAB. AI음원. copyright © DIARY BIGDATA LAB
      </p>
    </>
  );
}
