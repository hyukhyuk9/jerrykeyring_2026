'use client';

import { useState } from 'react';

export default function ApiSettingsPage() {
  const [murekaKey, setMurekaKey] = useState('');
  const [isAutoSync, setIsAutoSync] = useState(false);

  function handleSave() {
    alert('API 연동 설정이 저장되었습니다. (UI 시뮬레이션)');
  }

  function triggerManualSync() {
    alert('뮤레카 수동 연동/업로드 프로세스가 시작되었습니다!');
  }

  return (
    <div className="admin-container">
      <h1 className="admin-title">🔌 외부 API 연동 설정</h1>
      <p style={{ textAlign: 'center', color: '#888', fontSize: '0.8rem', marginBottom: '2rem' }}>
        뮤레카(Mureka) 및 기타 음원/가사 자동화 API를 연결하고 관리합니다.
      </p>

      <div style={{ background: '#111', padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid #222', marginBottom: '1.5rem' }}>
        <h3 style={{ color: 'var(--primary)', fontSize: '0.9rem', marginBottom: '1rem' }}>뮤레카(Mureka) API 연동</h3>
        
        <div style={{ marginBottom: '1rem' }}>
          <label style={{ display: 'block', fontSize: '0.75rem', color: '#888', marginBottom: '0.5rem' }}>API Key</label>
          <input 
            type="password" 
            className="admin-input" 
            placeholder="Mureka API Key 입력" 
            value={murekaKey}
            onChange={(e) => setMurekaKey(e.target.value)}
          />
        </div>

        <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <input 
            type="checkbox" 
            id="autoSync" 
            checked={isAutoSync} 
            onChange={(e) => setIsAutoSync(e.target.checked)} 
            style={{ accentColor: 'var(--primary)' }}
          />
          <label htmlFor="autoSync" style={{ fontSize: '0.8rem', cursor: 'pointer' }}>
            새로운 음원 신청 시 자동 연동 켜기
          </label>
        </div>

        <button className="admin-btn" style={{ width: '100%', marginBottom: '1rem' }} onClick={handleSave}>
          설정 저장하기
        </button>
      </div>

      {/* 수동 동기화 영역 (자동화 실패 시) */}
      <div style={{ background: 'rgba(255, 145, 77, 0.05)', padding: '1.5rem', borderRadius: 'var(--radius)', border: '1px solid rgba(255, 145, 77, 0.2)' }}>
        <h3 style={{ color: 'var(--primary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>수동 연동 프로세스</h3>
        <p style={{ fontSize: '0.75rem', color: '#aaa', marginBottom: '1rem', lineHeight: 1.5 }}>
          자동화 로직이 실패하거나, 일시적인 서버 오류로 데이터가 넘어가지 않았을 때 사용합니다.<br/>
          수동으로 뮤레카에 업로드하고 결과를 수파베이스로 동기화합니다.
        </p>
        
        <button className="admin-btn-outline" style={{ width: '100%' }} onClick={triggerManualSync}>
          수동 동기화 실행
        </button>
      </div>
    </div>
  );
}
