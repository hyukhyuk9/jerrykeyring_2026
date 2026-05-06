'use client';

import React, { useState, useEffect } from 'react';

export default function PWAInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  useEffect(() => {
    // iOS 여부 확인
    const userAgent = window.navigator.userAgent.toLowerCase();
    setIsIOS(/iphone|ipad|ipod/.test(userAgent));

    // 안드로이드/크롬 설치 프롬프트 캡처
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (isIOS) {
      // iOS인 경우 가이드 모달 표시
      setShowIOSGuide(true);
    } else if (deferredPrompt) {
      // 안드로이드/크롬인 경우 설치 팝업 트리거
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      alert('이미 설치되어 있거나, 이 브라우저에서는 홈 화면 추가를 지원하지 않습니다. 브라우저 설정 메뉴를 확인해 주세요.');
    }
  };

  return (
    <>
      <button 
        onClick={handleInstallClick}
        className="pwa-install-btn"
        title="홈 화면에 추가"
      >
        <i className="fa-solid fa-mobile-screen-button"></i>
        <span>앱으로 사용하기 (홈 화면 추가)</span>
      </button>

      {/* iOS 설치 가이드 모달 */}
      {showIOSGuide && (
        <div className="ios-guide-overlay" onClick={() => setShowIOSGuide(false)}>
          <div className="ios-guide-modal" onClick={(e) => e.stopPropagation()}>
            <h3>홈 화면에 추가하는 방법</h3>
            <ol>
              <li>하단 메뉴의 <strong>공유 버튼 <i className="fa-regular fa-square-plus"></i></strong> (사각형에 화살표 모양)을 클릭합니다.</li>
              <li>목록을 아래로 내려 <strong>'홈 화면에 추가'</strong> 항목을 선택합니다.</li>
              <li>우측 상단의 <strong>'추가'</strong>를 누르면 설치가 완료됩니다!</li>
            </ol>
            <button className="close-guide-btn" onClick={() => setShowIOSGuide(false)}>확인</button>
          </div>
        </div>
      )}

      <style jsx>{`
        .pwa-install-btn {
          width: 100%;
          max-width: 340px;
          padding: 0.8rem;
          background: rgba(255, 145, 77, 0.1);
          border: 1px dashed var(--primary);
          color: var(--primary);
          border-radius: 12px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          font-size: 0.85rem;
          font-weight: 600;
          margin: 1rem auto;
          transition: all 0.2s ease;
        }
        .pwa-install-btn:hover {
          background: var(--primary);
          color: #000;
        }
        .ios-guide-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0,0,0,0.8);
          z-index: 9999;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }
        .ios-guide-modal {
          background: #1a1a1a;
          padding: 24px;
          border-radius: 20px;
          width: 100%;
          max-width: 320px;
          color: white;
          text-align: left;
          border: 1px solid #333;
        }
        h3 { color: var(--primary); margin-bottom: 15px; font-size: 1.1rem; }
        ol { padding-left: 20px; margin-bottom: 20px; }
        li { margin-bottom: 12px; font-size: 0.9rem; line-height: 1.5; color: #ccc; }
        .close-guide-btn {
          width: 100%;
          padding: 10px;
          background: var(--primary);
          border: none;
          border-radius: 10px;
          font-weight: bold;
          cursor: pointer;
        }
      `}</style>
    </>
  );
}
