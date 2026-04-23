'use client';

import { useRef, useState, useEffect } from 'react';

interface Track {
  label: string;
  url: string;
}

interface MusicPlayerProps {
  tracks: Track[];
  lyrics: string;
  onTrackPlay?: (index: number) => void;
}

export default function MusicPlayer({ tracks, lyrics, onTrackPlay }: MusicPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [currentTrack, setCurrentTrack] = useState<number>(-1);
  const [showPlayer, setShowPlayer] = useState(false);
  const [showLyrics, setShowLyrics] = useState(false);
  const [showActions, setShowActions] = useState(false);

  function playTrack(index: number) {
    const audio = audioRef.current;
    if (!audio) return;

    audio.src = tracks[index].url;
    audio.play().catch(() => {});
    setCurrentTrack(index);
    setShowPlayer(true);
    setShowActions(true);

    // 가사가 있으면 표시
    if (lyrics) {
      setShowLyrics(true);
    }

    onTrackPlay?.(index);
  }

  // 공유 기능
  async function handleShare() {
    const shareData = {
      title: '제리키링 | 내 음원 듣기',
      text: '제리키링에서 만든 나만의 음원을 들어보세요 🎧',
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // 공유 취소
      }
    } else {
      await navigator.clipboard.writeText(window.location.href);
      showToast('링크가 복사되었습니다!');
    }
  }

  function showToast(message: string) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.textContent = message;
    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('show'));
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => toast.remove(), 400);
    }, 2000);
  }

  return (
    <>
      {/* Audio Player */}
      <audio
        ref={audioRef}
        controls
        className={`audio-player ${showPlayer ? 'visible' : ''}`}
      />

      {/* Track Buttons */}
      {tracks.map((track, i) => (
        <button
          key={i}
          className={`track-button visible ${currentTrack === i ? 'playing' : ''}`}
          onClick={() => playTrack(i)}
          style={{ animationDelay: `${i * 0.1}s` }}
        >
          <img
            src="/images/iphone.png"
            alt=""
            className="track-icon"
          />
          <span className="track-label">{track.label}</span>
          {currentTrack === i && (
            <span style={{ fontSize: '0.7rem', opacity: 0.8 }}>♫</span>
          )}
        </button>
      ))}

      {/* Lyrics */}
      {lyrics && (
        <div className={`lyrics-display ${showLyrics ? 'visible' : ''}`}>
          {lyrics}
        </div>
      )}

      {/* Action Buttons */}
      <div className={`action-buttons ${showActions ? 'visible' : ''}`}>
        <a
          className="action-btn"
          href="https://www.youtube.com/@%EC%A0%9C%EB%A6%AC%ED%82%A4%EB%A7%81AI"
          target="_blank"
          rel="noopener noreferrer"
          title="YouTube"
        >
          <i className="fa-brands fa-youtube" />
        </a>
        <button className="action-btn" onClick={handleShare} title="공유">
          <i className="fa-solid fa-share" />
        </button>
      </div>
    </>
  );
}
