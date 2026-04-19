'use client';

import { useState, useEffect } from 'react';

interface AdminTrack {
  nfc: string;
  name: string;
  genre: string;
  status: string;
  date: string;
  hasLyrics: boolean;
  lyrics: string;
}

interface AdminUserInfo {
  id: string;
  role: string;
  createdAt: string;
}

export default function AdminPage() {
  // 인증 상태
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginId, setLoginId] = useState('');
  const [loginPw, setLoginPw] = useState('');
  const [error, setError] = useState('');
  const [currentUser, setCurrentUser] = useState<{ id: string; role: string } | null>(null);

  // 트랙 관련
  const [tracks, setTracks] = useState<AdminTrack[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTrack, setSelectedTrack] = useState<AdminTrack | null>(null);

  // 업로드 관련
  const [uploadNfcId, setUploadNfcId] = useState('');
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);

  // 계정 관리 (마스터 전용)
  const [showUserMgmt, setShowUserMgmt] = useState(false);
  const [users, setUsers] = useState<AdminUserInfo[]>([]);
  const [newUserId, setNewUserId] = useState('');
  const [newUserPw, setNewUserPw] = useState('');
  const [userMsg, setUserMsg] = useState('');

  // 탭
  const [activeTab, setActiveTab] = useState<'tracks' | 'users'>('tracks');

  // --- 로그인 ---
  async function handleLogin() {
    setError('');
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: loginId, password: loginPw }),
      });

      const json = await res.json();
      if (res.ok) {
        setIsLoggedIn(true);
        setCurrentUser({ id: json.id, role: json.role });
        loadTracks();
        if (json.role === 'master') {
          loadUsers();
        }
      } else {
        setError(json.error || '로그인 실패');
      }
    } catch {
      setError('로그인 중 오류 발생');
    }
  }

  // --- 트랙 목록 ---
  async function loadTracks() {
    setLoading(true);
    try {
      const res = await fetch('/api/upload');
      if (res.ok) {
        const json = await res.json();
        setTracks(json.data || []);
      }
    } catch {
      console.error('트랙 로드 실패');
    }
    setLoading(false);
  }

  // --- 업로드 ---
  async function handleUpload() {
    if (!uploadNfcId || uploadFiles.length === 0) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('nfcId', uploadNfcId);
      uploadFiles.forEach(file => formData.append('files', file));

      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const json = await res.json();
      if (res.ok) {
        alert(json.message);
        setUploadNfcId('');
        setUploadFiles([]);
        setShowUpload(false);
        loadTracks();
      } else {
        alert(json.error || '업로드 실패');
      }
    } catch {
      alert('업로드 중 오류 발생');
    }
    setUploading(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.currentTarget.classList.remove('dragover');
    const files = Array.from(e.dataTransfer.files).filter(f => f.type === 'audio/mpeg');
    setUploadFiles(prev => [...prev, ...files]);
  }

  // --- 계정 관리 ---
  async function loadUsers() {
    try {
      const res = await fetch('/api/users');
      if (res.ok) {
        const json = await res.json();
        setUsers(json.data || []);
      }
    } catch {
      console.error('사용자 로드 실패');
    }
  }

  async function handleAddUser() {
    setUserMsg('');
    if (!newUserId || !newUserPw) {
      setUserMsg('ID와 비밀번호를 입력하세요.');
      return;
    }
    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: newUserId, password: newUserPw }),
      });
      const json = await res.json();
      if (res.ok) {
        setUserMsg(`✅ ${json.message}`);
        setNewUserId('');
        setNewUserPw('');
        loadUsers();
      } else {
        setUserMsg(`❌ ${json.error}`);
      }
    } catch {
      setUserMsg('❌ 계정 생성 실패');
    }
  }

  async function handleDeleteUser(id: string) {
    if (!confirm(`"${id}" 계정을 삭제하시겠습니까?`)) return;
    try {
      const res = await fetch('/api/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const json = await res.json();
      if (res.ok) {
        setUserMsg(`✅ ${json.message}`);
        loadUsers();
      } else {
        setUserMsg(`❌ ${json.error}`);
      }
    } catch {
      setUserMsg('❌ 계정 삭제 실패');
    }
  }

  const filteredTracks = tracks.filter(t =>
    t.nfc.includes(searchQuery) ||
    t.name.includes(searchQuery) ||
    t.genre.includes(searchQuery)
  );

  const isMaster = currentUser?.role === 'master';

  // ============================
  // 로그인 화면
  // ============================
  if (!isLoggedIn) {
    return (
      <>
        <header className="app-header">
          <img src="/images/logo.png" alt="제리키링" className="logo" />
        </header>
        <div className="admin-container">
          <h1 className="admin-title">관리자 페이지</h1>
          <div className="admin-login">
            <input
              type="text"
              className="admin-input"
              placeholder="아이디"
              value={loginId}
              onChange={e => setLoginId(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && document.getElementById('pw-input')?.focus()}
              autoComplete="username"
            />
            <input
              id="pw-input"
              type="password"
              className="admin-input"
              placeholder="비밀번호"
              value={loginPw}
              onChange={e => setLoginPw(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleLogin()}
              autoComplete="current-password"
            />
            {error && (
              <p style={{ color: '#ef4444', fontSize: '0.78rem', marginBottom: '0.5rem' }}>
                {error}
              </p>
            )}
            <button className="admin-btn" onClick={handleLogin}>
              로그인
            </button>
          </div>
        </div>
      </>
    );
  }

  // ============================
  // 관리 화면
  // ============================
  return (
    <>
      <header className="app-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem' }}>
          <img src="/images/logo.png" alt="제리키링" className="logo" />
          <span style={{ fontSize: '0.7rem', color: '#888' }}>
            {currentUser?.id} {isMaster && '(마스터)'}
          </span>
        </div>
      </header>
      <div className="admin-container">
        {/* 탭 */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', justifyContent: 'center' }}>
          <button
            className={activeTab === 'tracks' ? 'admin-btn' : 'admin-btn-outline'}
            onClick={() => setActiveTab('tracks')}
          >
            트랙 관리
          </button>
          {isMaster && (
            <button
              className={activeTab === 'users' ? 'admin-btn' : 'admin-btn-outline'}
              onClick={() => { setActiveTab('users'); loadUsers(); }}
            >
              계정 관리
            </button>
          )}
        </div>

        {/* ========== 트랙 관리 탭 ========== */}
        {activeTab === 'tracks' && (
          <>
            <h2 className="admin-title" style={{ fontSize: '1rem', marginBottom: '1rem' }}>🎵 트랙 관리</h2>

            {/* 검색 + 업로드 */}
            <div className="admin-search">
              <input
                type="text"
                className="admin-input"
                placeholder="NFC ID, 이름, 장르 검색..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ marginBottom: 0 }}
              />
              <button className="admin-btn" onClick={() => setShowUpload(!showUpload)}>
                {showUpload ? '닫기' : '+ 업로드'}
              </button>
            </div>

            {/* 업로드 영역 */}
            {showUpload && (
              <div style={{ background: '#111', borderRadius: 'var(--radius)', padding: '1.5rem', marginBottom: '1rem', border: '1px solid #222' }}>
                <h3 style={{ color: 'var(--primary)', fontSize: '0.9rem', marginBottom: '1rem' }}>음원 업로드</h3>
                <input
                  type="text"
                  className="admin-input"
                  placeholder="NFC ID (숫자)"
                  value={uploadNfcId}
                  onChange={e => setUploadNfcId(e.target.value)}
                />
                <div
                  className="admin-upload-zone"
                  onDrop={handleDrop}
                  onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add('dragover'); }}
                  onDragLeave={e => e.currentTarget.classList.remove('dragover')}
                  onClick={() => {
                    const input = document.createElement('input');
                    input.type = 'file';
                    input.multiple = true;
                    input.accept = 'audio/mpeg';
                    input.onchange = (e) => {
                      const files = Array.from((e.target as HTMLInputElement).files || []);
                      setUploadFiles(prev => [...prev, ...files]);
                    };
                    input.click();
                  }}
                >
                  <p>🎵 mp3 파일을 드래그하거나 클릭하세요</p>
                  <p style={{ fontSize: '0.65rem', marginTop: '0.3rem' }}>다중 업로드 지원</p>
                </div>
                {uploadFiles.length > 0 && (
                  <div style={{ marginBottom: '0.75rem' }}>
                    {uploadFiles.map((f, i) => (
                      <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.3rem 0', fontSize: '0.75rem', color: '#aaa' }}>
                        <span>🎵 {f.name}</span>
                        <button
                          onClick={() => setUploadFiles(prev => prev.filter((_, j) => j !== i))}
                          style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.8rem' }}
                        >✕</button>
                      </div>
                    ))}
                  </div>
                )}
                <button className="admin-btn" onClick={handleUpload} disabled={!uploadNfcId || uploadFiles.length === 0 || uploading}>
                  {uploading ? '업로드 중...' : `${uploadFiles.length}개 파일 업로드`}
                </button>
              </div>
            )}

            {/* 가사 미리보기 모달 */}
            {selectedTrack && (
              <div className="mbti-overlay" onClick={(e) => { if (e.target === e.currentTarget) setSelectedTrack(null); }}>
                <div className="mbti-modal">
                  <button className="mbti-close" onClick={() => setSelectedTrack(null)}>&times;</button>
                  <h2 className="mbti-title">NFC #{selectedTrack.nfc} 가사</h2>
                  <p style={{ fontSize: '0.75rem', color: '#888', marginBottom: '1rem' }}>
                    {selectedTrack.name} · {selectedTrack.genre}
                  </p>
                  <div style={{ whiteSpace: 'pre-line', fontSize: '0.8rem', color: '#ccc', lineHeight: 1.6, maxHeight: '50vh', overflowY: 'auto' }}>
                    {selectedTrack.lyrics || '가사가 없습니다.'}
                  </div>
                </div>
              </div>
            )}

            {/* 트랙 목록 */}
            {loading ? (
              <p style={{ textAlign: 'center', color: '#666', marginTop: '2rem' }}>로딩 중...</p>
            ) : (
              <>
                <p style={{ fontSize: '0.7rem', color: '#666', marginBottom: '0.5rem' }}>총 {filteredTracks.length}건</p>
                <div style={{ overflowX: 'auto' }}>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>NFC</th>
                        <th>이름</th>
                        <th>장르</th>
                        <th>상태</th>
                        <th>가사</th>
                        <th>보기</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTracks.map((t, i) => (
                        <tr key={i}>
                          <td style={{ fontWeight: 600, color: 'var(--primary)' }}>{t.nfc}</td>
                          <td>{t.name}</td>
                          <td>{t.genre}</td>
                          <td>
                            <span className={`admin-status ${t.status === '완료' ? 'done' : 'pending'}`}>
                              {t.status ? '등록' : '대기'}
                            </span>
                          </td>
                          <td>{t.hasLyrics ? '✅' : '❌'}</td>
                          <td>
                            <button
                              className="admin-btn-outline"
                              onClick={() => setSelectedTrack(t)}
                              style={{ fontSize: '0.65rem', padding: '0.3rem 0.6rem' }}
                            >보기</button>
                          </td>
                        </tr>
                      ))}
                      {filteredTracks.length === 0 && (
                        <tr>
                          <td colSpan={6} style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                            데이터가 없습니다.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </>
        )}

        {/* ========== 계정 관리 탭 (마스터 전용) ========== */}
        {activeTab === 'users' && isMaster && (
          <>
            <h2 className="admin-title" style={{ fontSize: '1rem', marginBottom: '1rem' }}>👤 계정 관리</h2>

            {/* 계정 추가 */}
            <div style={{ background: '#111', borderRadius: 'var(--radius)', padding: '1.5rem', marginBottom: '1.5rem', border: '1px solid #222' }}>
              <h3 style={{ color: 'var(--primary)', fontSize: '0.9rem', marginBottom: '1rem' }}>새 계정 추가</h3>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  className="admin-input"
                  placeholder="아이디"
                  value={newUserId}
                  onChange={e => setNewUserId(e.target.value)}
                  style={{ flex: 1, minWidth: '120px', marginBottom: 0 }}
                />
                <input
                  type="text"
                  className="admin-input"
                  placeholder="비밀번호"
                  value={newUserPw}
                  onChange={e => setNewUserPw(e.target.value)}
                  style={{ flex: 1, minWidth: '120px', marginBottom: 0 }}
                />
                <button className="admin-btn" onClick={handleAddUser}>추가</button>
              </div>
              {userMsg && (
                <p style={{ fontSize: '0.78rem', marginTop: '0.75rem', color: userMsg.startsWith('✅') ? '#22c55e' : '#ef4444' }}>
                  {userMsg}
                </p>
              )}
            </div>

            {/* 계정 목록 */}
            <div style={{ overflowX: 'auto' }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>아이디</th>
                    <th>권한</th>
                    <th>생성일</th>
                    <th>관리</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 600, color: u.role === 'master' ? 'var(--primary)' : '#ccc' }}>
                        {u.id}
                        {u.role === 'master' && <span style={{ fontSize: '0.6rem', marginLeft: '0.3rem', opacity: 0.6 }}>👑</span>}
                      </td>
                      <td>
                        <span className={`admin-status ${u.role === 'master' ? 'done' : 'pending'}`}>
                          {u.role === 'master' ? '마스터' : '관리자'}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.72rem', color: '#888' }}>{u.createdAt}</td>
                      <td>
                        {u.role !== 'master' && (
                          <button
                            className="admin-btn-outline"
                            onClick={() => handleDeleteUser(u.id)}
                            style={{ fontSize: '0.65rem', padding: '0.3rem 0.6rem', borderColor: '#ef4444', color: '#ef4444' }}
                          >삭제</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </>
  );
}
