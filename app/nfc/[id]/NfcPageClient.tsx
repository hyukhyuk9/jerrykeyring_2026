'use client';

import { useState } from 'react';
import IntroVideo from '@/components/IntroVideo';
import MusicPlayer from '@/components/MusicPlayer';
import SamplePlayer from '@/components/SamplePlayer';
import MbtiTestModal from '@/components/MbtiTestModal';

interface NfcPageClientProps {
  nfcId: string;
  hasMusic: boolean;
  tracks: { label: string; url: string }[];
  lyrics: string;
  genre: string;
}

export default function NfcPageClient({ nfcId, hasMusic, tracks, lyrics, genre }: NfcPageClientProps) {
  const [introEnded, setIntroEnded] = useState(!hasMusic); // 샘플이면 인트로 스킵
  const [showMbti, setShowMbti] = useState(false);
  const [isLightMode, setIsLightMode] = useState(false);

  function toggleMode() {
    setIsLightMode(!isLightMode);
    document.body.classList.toggle('light-mode');
  }

  return (
    <>
      <header className="app-header">
        <img
          src="/images/logo.png"
          alt="제리키링"
          className="logo"
          onClick={toggleMode}
          title="테마 전환"
        />
      </header>

      <main className="app-main">
        {hasMusic ? (
          <>
            {/* 커스텀 음원 페이지 */}
            {!introEnded && (
              <IntroVideo onVideoEnd={() => setIntroEnded(true)} />
            )}

            {introEnded && (
              <>
                <MusicPlayer
                  tracks={tracks}
                  lyrics={lyrics}
                />

                <p className="info-text visible" style={{ marginTop: '1.5rem' }}>
                  *제리키링AI | 나만의 NFC 음악앨범키링
                </p>
              </>
            )}
          </>
        ) : (
          <>
            {/* 샘플 페이지 (음원 미등록) */}
            <SamplePlayer />
          </>
        )}

        {/* MBTI 테스트 버튼 - 항상 표시 */}
        {introEnded && (
          <button
            className="mbti-trigger"
            onClick={() => setShowMbti(true)}
          >
            음악 취향 테스트
          </button>
        )}
      </main>

      {/* MBTI 모달 */}
      <MbtiTestModal isOpen={showMbti} onClose={() => setShowMbti(false)} />
    </>
  );
}
