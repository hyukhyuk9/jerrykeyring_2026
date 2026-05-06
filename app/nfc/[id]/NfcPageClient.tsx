'use client';

import { useState } from 'react';
import IntroVideo from '@/components/IntroVideo';
import MusicPlayer from '@/components/MusicPlayer';
import SamplePlayer from '@/components/SamplePlayer';
import MbtiTestModal from '@/components/MbtiTestModal';
import AiRadioPlayer from '@/components/AiRadioPlayer';
import PWAInstallPrompt from '@/components/PWAInstallPrompt';

interface NfcPageClientProps {
  nfcId: string;
  hasMusic: boolean;
  tracks: { label: string; url: string }[];
  lyrics: string;
  genre: string;
  radioUrl?: string | null;
  radioScript?: string | null;
}

export default function NfcPageClient({ 
  nfcId, hasMusic, tracks, lyrics, genre, radioUrl, radioScript 
}: NfcPageClientProps) {
  const [introEnded, setIntroEnded] = useState(!hasMusic);
  const [radioFinished, setRadioFinished] = useState(false);
  const [showMbti, setShowMbti] = useState(false);
  const [isLightMode, setIsLightMode] = useState(false);

  const shouldShowRadio = radioUrl && !radioFinished && introEnded;

  function toggleMode() {
    setIsLightMode(!isLightMode);
    document.body.classList.toggle('light-mode');
  }

  return (
    <>
      <header className="app-header">
        <img
          src="/images/iphone.png"
          alt="제리키링"
          className="logo"
          onClick={toggleMode}
          title="테마 전환"
        />
      </header>

      <main className="app-main">
        {hasMusic ? (
          <>
            {/* 1. 인트로 영상 (최초 진입 시) */}
            {!introEnded && (
              <IntroVideo onVideoEnd={() => setIntroEnded(true)} />
            )}

            {/* 2. AI 라디오 (인트로 종료 후, 라디오 URL이 있을 때만) */}
            {shouldShowRadio ? (
              <AiRadioPlayer 
                url={radioUrl!} 
                script={radioScript || ""} 
                onEnded={() => setRadioFinished(true)} 
              />
            ) : (
              /* 3. 메인 음악 플레이어 (인트로 및 라디오 종료 후) */
              introEnded && (
                <>
                  <MusicPlayer
                    tracks={tracks}
                    lyrics={lyrics}
                  />

                  <p className="info-text visible" style={{ marginTop: '1.5rem' }}>
                    *제리키링AI | 나만의 NFC 음악앨범키링
                  </p>
                </>
              )
            )}
          </>
        ) : (
          <>
            {/* 샘플 페이지 (음원 미등록 시) */}
            <SamplePlayer />
          </>
        )}

        {/* MBTI 테스트 버튼 (모든 재생 시퀀스 종료 후 표시) */}
        {introEnded && (radioFinished || !radioUrl) && (
          <button
            className="mbti-trigger"
            onClick={() => setShowMbti(true)}
          >
            음악 취향 테스트
          </button>
        )}

        {/* 홈 화면 추가 버튼 */}
        {introEnded && <PWAInstallPrompt />}
      </main>

      {/* MBTI 모달 */}
      <MbtiTestModal isOpen={showMbti} onClose={() => setShowMbti(false)} />
    </>
  );
}
