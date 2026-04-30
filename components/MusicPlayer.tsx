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
  const nextAudioRef = useRef<HTMLAudioElement>(null); // 다음 곡 프리로드용
  
  const [currentTrack, setCurrentTrack] = useState<number>(0);
  const [showPlayer, setShowPlayer] = useState(false);
  const [showLyrics, setShowLyrics] = useState(false);
  const [showActions, setShowActions] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);

  // 초기 로드 시 첫 번째 곡 설정 및 두 번째 곡 프리로드
  useEffect(() => {
    if (tracks.length > 0) {
      // 첫 번째 곡 로드
      if (audioRef.current) {
        audioRef.current.src = tracks[0].url;
      }
      
      // 두 번째 곡이 있다면 미리 로드
      if (tracks.length > 1 && nextAudioRef.current) {
        nextAudioRef.current.src = tracks[1].url;
        nextAudioRef.current.load();
      }
      
      setShowPlayer(true);
      setShowLyrics(!!lyrics);
    }
  }, [tracks, lyrics]);

  /**
   * 특정 곡 재생
   */
  function playTrack(index: number) {
    const audio = audioRef.current;
    if (!audio || !tracks[index]) return;

    // 현재 곡과 클릭한 곡이 다르면 소스 교체
    if (currentTrack !== index) {
      audio.src = tracks[index].url;
    }
    
    audio.play().catch(() => {});
    setCurrentTrack(index);
    setIsPlaying(true);
    onTrackPlay?.(index);

    // 다음 곡 프리로드 업데이트
    preloadNextTrack(index);
  }

  /**
   * 다음 곡을 백그라운드에서 미리 로드
   */
  function preloadNextTrack(currentIndex: number) {
    const nextIndex = currentIndex + 1;
    if (nextIndex < tracks.length && nextAudioRef.current) {
      nextAudioRef.current.src = tracks[nextIndex].url;
      nextAudioRef.current.load();
      console.log(`[Preload] Next track ready: ${tracks[nextIndex].label}`);
    }
  }

  /**
   * 노래 종료 시 자동 다음 곡 재생
   */
  function handleEnded() {
    const nextIndex = currentTrack + 1;
    if (nextIndex < tracks.length) {
      playTrack(nextIndex);
    } else {
      setIsPlaying(false);
    }
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
      {/* 실제 재생용 오디오 태그 */}
      <audio
        ref={audioRef}
        controls
        onEnded={handleEnded}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        className={`audio-player ${showPlayer ? 'visible' : ''}`}
      />

      {/* 다음 곡 프리로드용 숨겨진 오디오 태그 */}
      <audio ref={nextAudioRef} preload="auto" style={{ display: 'none' }} />

      {/* 트랙 버튼 목록 */}
      <div className="track-list" style={{ marginTop: '20px' }}>
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
            {currentTrack === i && isPlaying && (
              <span className="playing-indicator">♫</span>
            )}
          </button>
        ))}
      </div>

      {/* 가사 표시 */}
      {lyrics && (
        <div className={`lyrics-display ${showLyrics ? 'visible' : ''}`}>
          {lyrics.split('\n').map((line, idx) => (
            <p key={idx}>{line}</p>
          ))}
        </div>
      )}

      {/* 하단 액션 버튼 */}
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
