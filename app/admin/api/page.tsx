'use client';

export default function ApiSettingsPage() {
  function handleSave() {
    alert('API 연동 설정이 저장되었습니다. (UI 시뮬레이션)');
  }

  function triggerManualSync() {
    alert('뮤레카 수동 연동/업로드 프로세스가 시작되었습니다!');
  }

  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', color: '#ff914d', marginBottom: '1rem', fontFamily: 'serif' }}>🔌 외부 API 연동 설정</h1>
      <p style={{ color: '#888', fontSize: '0.9rem', marginBottom: '2.5rem' }}>
        뮤레카(Mureka) 및 기타 음원/가사 자동화 API를 연결하고 관리합니다.
      </p>

      <div style={{ background: '#111', padding: '2rem', borderRadius: '14px', border: '1px solid #222', marginBottom: '2rem' }}>
        <h3 style={{ color: '#ff914d', fontSize: '1.1rem', marginBottom: '1.5rem' }}>뮤레카(Mureka) API 연동</h3>
        
        <div style={{ marginBottom: '1.5rem' }}>
          <label style={{ display: 'block', fontSize: '0.85rem', color: '#aaa', marginBottom: '0.5rem' }}>API Key</label>
          <input 
            type="password" 
            placeholder="Mureka API Key 입력" 
            style={{ width: '100%', padding: '0.8rem', background: '#1a1a1a', border: '1px solid #333', color: '#fff', borderRadius: '8px' }}
          />
        </div>

        <div style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {/* User requested: 기본으로 수정할 수 없이 연동이 체크되어있으면 돼 */}
          <input 
            type="checkbox" 
            id="autoSync" 
            checked={true} 
            disabled={true}
            style={{ accentColor: '#ff914d', width: '16px', height: '16px', cursor: 'not-allowed' }}
          />
          <label htmlFor="autoSync" style={{ fontSize: '0.9rem', color: '#ccc', cursor: 'not-allowed' }}>
            새로운 음원 신청 시 자동 연동 켜기 (기본 필수)
          </label>
        </div>

        <button 
          onClick={handleSave}
          style={{ width: '100%', padding: '0.8rem', background: '#ff914d', color: '#000', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          설정 저장하기
        </button>
      </div>

      {/* 수동 동기화 영역 */}
      <div style={{ background: 'rgba(255, 145, 77, 0.05)', padding: '2rem', borderRadius: '14px', border: '1px solid rgba(255, 145, 77, 0.2)' }}>
        <h3 style={{ color: '#ff914d', fontSize: '1.1rem', marginBottom: '0.5rem' }}>수동 연동 프로세스</h3>
        <p style={{ fontSize: '0.85rem', color: '#aaa', marginBottom: '1.5rem', lineHeight: 1.6 }}>
          자동화 로직이 실패하거나, 일시적인 서버 오류로 데이터가 넘어가지 않았을 때 사용합니다.<br/>
          수동으로 뮤레카에 업로드하고 결과를 수파베이스로 동기화합니다.
        </p>
        
        <button 
          onClick={triggerManualSync}
          style={{ width: '100%', padding: '0.8rem', background: 'transparent', color: '#ff914d', border: '1px solid #ff914d', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          수동 동기화 실행
        </button>
      </div>
    </div>
  );
}
