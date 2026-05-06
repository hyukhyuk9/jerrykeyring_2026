'use client';

import { useEffect, useRef, useState } from 'react';

interface AiRadioPlayerProps {
  url: string;
  script: string;
  onEnded: () => void;
}

export default function AiRadioPlayer({ url, script, onEnded }: AiRadioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.play().catch((err) => {
        console.warn('Auto-play failed, waiting for user interaction:', err);
        // 브라우저 정책상 자동 재생이 막힐 수 있음
      });
    }
  }, [url]);

  const handleEnded = () => {
    setIsPlaying(false);
    // 약간의 여운을 위해 0.5초 뒤에 종료 콜백 실행
    setTimeout(onEnded, 500);
  };

  return (
    <div className="radio-container">
      <div className="radio-badge">AI Radio Intro</div>
      
      <div className="radio-visualizer">
        {[...Array(12)].map((_, i) => (
          <div 
            key={i} 
            className={`visual-bar ${isPlaying ? 'active' : ''}`} 
            style={{ 
              animationDelay: `${i * 0.1}s`,
              height: isPlaying ? undefined : '20%'
            }}
          />
        ))}
      </div>

      <div className="radio-script-box">
        <p className="radio-script-text">
          {script || "AI DJ 제리가 전하는 따뜻한 메시지..."}
        </p>
      </div>

      <audio
        ref={audioRef}
        src={url}
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onEnded={handleEnded}
        onError={() => setError(true)}
        autoPlay
      />

      <button className="radio-skip-btn" onClick={onEnded}>
        {error ? "라디오 건너뛰기" : "Skip Intro"}
      </button>

      {error && (
        <p style={{ color: '#ff4d4d', fontSize: '0.7rem', marginTop: '10px' }}>
          오디오를 불러올 수 없습니다.
        </p>
      )}
    </div>
  );
}
