'use client';

import { useRef, useState, useEffect } from 'react';

interface IntroVideoProps {
  onVideoEnd: () => void;
}

export default function IntroVideo({ onVideoEnd }: IntroVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [showText, setShowText] = useState(false);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowText(true), 500);
    return () => clearTimeout(timer);
  }, []);

  function handleEnded() {
    setShowText(false);
    setTimeout(() => {
      setVisible(false);
      onVideoEnd();
    }, 300);
  }

  if (!visible) return null;

  return (
    <>
      <div className={`intro-text ${showText ? 'show' : ''}`}>
        <p>AI 음원 불러오는중..</p>
      </div>
      <video
        ref={videoRef}
        className="intro-video"
        autoPlay
        muted
        playsInline
        onEnded={handleEnded}
      >
        <source src="/video/video.mp4" type="video/mp4" />
      </video>
    </>
  );
}
