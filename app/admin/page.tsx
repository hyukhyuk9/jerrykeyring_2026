'use client';

import { useState, useEffect, useRef } from 'react';

interface AdminTrack {
  id?: string; // DB primary key or serial
  nfc: string;
  name: string;
  phone: string; // added phone
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

  // 생성 & 수정 폼 관련
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState<Partial<AdminTrack>>({});
  const [isNewRecord, setIsNewRecord] = useState(false);

  // 업로드 관련
  const [uploadNfcId, setUploadNfcId] = useState('');
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadMode, setUploadMode] = useState<'files' | 'folder'>('files');

  // 계정 관리 (마스터 전용)
  const [users, setUsers] = useState<AdminUserInfo[]>([]);
  const [newUserId, setNewUserId] = useState('');
  const [newUserPw, setNewUserPw] = useState('');
  const [userMsg, setUserMsg] = useState('');

  // 탭
  const [activeTab, setActiveTab] = useState<'tracks' | 'users'>('tracks');

  // 폴더 업로드용 input ref
  const folderInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // 자동 로그인 (개발 편의를 위해 일단 세션 없으므로 스킵, 추후 연동)
  }, []);

  // --- 로그인 ---
  async function handleLogin() {
    setError('');
    // TODO: 실제 수파베이스나 백엔드 연동으로 교체해야함. 현재는 임시.
    if (loginId === 'jerry' && loginPw === 'tom') {
      setIsLoggedIn(true);
      setCurrentUser({ id: 'jerry', role: 'master' });
      loadTracks();
      loadUsers();
    } else {
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
          if (json.role === 'master') loadUsers();
        } else {
          setError(json.error || '로그인 실패');
        }
      } catch {
        setError('로그인 중 오류 발생');
      }
    }
  }

  // --- 트랙 목록 로드 ---
  async function loadTracks() {
    setLoading(true);
    try {
      // TODO: 실제 API 호출 (supabase-js 로 교체 가능)
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

  // --- 데이터 수정 / 신규 생성 ---
  function openNewRecordModal() {
    setIsNewRecord(true);
    setEditForm({ nfc: '', name: '', phone: '', genre: 'music', status: '대기' });
    setShowEditModal(true);
  }

  function openEditModal(track: AdminTrack) {
    setIsNewRecord(false);
    setEditForm({ ...track });
    setShowEditModal(true);
  }

  async function handleSaveRecord() {
    // 수동 데이터 업로드 로직 (수파베이스로 저장)
    // 추후 서버 액션 또는 API 구성 필요
    alert(isNewRecord ? '신규 등록 완료 (UI 시뮬레이션)' : '수정 완료 (UI 시뮬레이션)');
    setShowEditModal(false);
    loadTracks();
  }

  // --- 파일 업로드 ---
  async function handleUpload() {
    if (!uploadNfcId && uploadMode === 'files') {
      alert('NFC ID를 입력해주세요.');
      return;
    }
    if (uploadFiles.length === 0) return;

    setUploading(true);
    try {
      // R2 업로드 및 DB 동기화 로직
      // 폴더 업로드 시 파일명이나 경로를 기반으로 NFC 자동 매핑 로직을 추후 추가 가능
      alert(`${uploadFiles.length}개의 파일 업로드 시도 (구현 중)`);
      
      setUploadNfcId('');
      setUploadFiles([]);
      setShowUpload(false);
    } catch {
      alert('업로드 중 오류 발생');
    }
    setUploading(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    e.currentTarget.classList.remove('dragover');
    const files = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('audio/'));
    setUploadFiles(prev => [...prev, ...files]);
  }

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []).filter(f => f.type.startsWith('audio/'));
    setUploadFiles(prev => [...prev, ...files]);
  }

  // --- 계정 관리 ---
  async function loadUsers() {
    // ...
  }
  async function handleAddUser() {
    // ...
  }
  async function handleDeleteUser(id: string) {
    // ...
  }

  const filteredTracks = tracks.filter(t =>
    (t.nfc || '').includes(searchQuery) ||
    (t.name || '').includes(searchQuery) ||
    (t.genre || '').includes(searchQuery)
  );

  const isMaster = currentUser?.role === 'master';

  // ============================
  // 로그인 화면
  // ============================
  if (!isLoggedIn) {
    return (
      <div className="admin-container" style={{ marginTop: '5rem' }}>
        <h1 className="admin-title">시스템 로그인</h1>
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
          {error && <p style={{ color: '#ef4444', fontSize: '0.78rem', marginBottom: '0.5rem' }}>{error}</p>}
          <button className="admin-btn" onClick={handleLogin}>로그인</button>
        </div>
      </div>
    );
  }

  // ============================
  // 관리 화면
  // ============================
  return (
    <div className="admin-container">
      {/* 탭 */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', justifyContent: 'center' }}>
        <button
          className={activeTab === 'tracks' ? 'admin-btn' : 'admin-btn-outline'}
          onClick={() => setActiveTab('tracks')}
        >
          데이터 관리 (CRUD)
        </button>
        {isMaster && (
          <button
            className={activeTab === 'users' ? 'admin-btn' : 'admin-btn-outline'}
            onClick={() => { setActiveTab('users'); loadUsers(); }}
          >
            시스템 계정 관리
          </button>
        )}
      </div>

      {/* ========== 트랙 관리 탭 ========== */}
      {activeTab === 'tracks' && (
        <>
          <div className="admin-search" style={{ justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: '0.5rem', flex: 1 }}>
              <input
                type="text"
                className="admin-input"
                placeholder="NFC ID, 이름 검색..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                style={{ marginBottom: 0, maxWidth: '300px' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="admin-btn-outline" onClick={openNewRecordModal}>+ 데이터 등록</button>
              <button className="admin-btn" onClick={() => setShowUpload(!showUpload)}>
                {showUpload ? '닫기' : '음원 파일 업로드'}
              </button>
            </div>
          </div>

          {/* 업로드 영역 */}
          {showUpload && (
            <div style={{ background: '#111', borderRadius: 'var(--radius)', padding: '1.5rem', marginBottom: '1rem', border: '1px solid #222' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <h3 style={{ color: 'var(--primary)', fontSize: '0.9rem' }}>음원 업로드 (모바일 / PC)</h3>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button 
                    onClick={() => setUploadMode('files')}
                    className={uploadMode === 'files' ? 'admin-btn' : 'admin-btn-outline'}
                    style={{ padding: '0.3rem 0.8rem', fontSize: '0.7rem' }}
                  >개별 파일 선택</button>
                  <button 
                    onClick={() => setUploadMode('folder')}
                    className={uploadMode === 'folder' ? 'admin-btn' : 'admin-btn-outline'}
                    style={{ padding: '0.3rem 0.8rem', fontSize: '0.7rem' }}
                  >폴더 전체 선택 (PC 전용)</button>
                </div>
              </div>

              {uploadMode === 'files' && (
                <input
                  type="text"
                  className="admin-input"
                  placeholder="연결할 NFC ID (숫자)"
                  value={uploadNfcId}
                  onChange={e => setUploadNfcId(e.target.value)}
                />
              )}

              <input 
                type="file" 
                multiple 
                accept="audio/*" 
                ref={fileInputRef} 
                style={{ display: 'none' }} 
                onChange={handleFileSelect} 
              />
              
              {/* @ts-ignore - webkitdirectory is non-standard but works in modern browsers */}
              <input 
                type="file" 
                webkitdirectory="true" 
                multiple 
                ref={folderInputRef} 
                style={{ display: 'none' }} 
                onChange={handleFileSelect} 
              />

              <div
                className="admin-upload-zone"
                onDrop={handleDrop}
                onDragOver={e => { e.preventDefault(); e.currentTarget.classList.add('dragover'); }}
                onDragLeave={e => e.currentTarget.classList.remove('dragover')}
                onClick={() => {
                  if (uploadMode === 'files') fileInputRef.current?.click();
                  else folderInputRef.current?.click();
                }}
              >
                <p>🎵 클릭하여 {uploadMode === 'files' ? '파일들을' : '폴더를'} 선택하거나 드래그 앤 드롭 하세요.</p>
                <p style={{ fontSize: '0.65rem', marginTop: '0.3rem' }}>모바일은 꾹 눌러 일괄 선택 지원</p>
              </div>
              
              {uploadFiles.length > 0 && (
                <div style={{ marginBottom: '0.75rem', maxHeight: '150px', overflowY: 'auto', background: '#0a0a0a', padding: '0.5rem', borderRadius: '4px' }}>
                  {uploadFiles.map((f, i) => (
                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.3rem 0', fontSize: '0.75rem', color: '#aaa' }}>
                      <span style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', maxWidth: '80%' }}>🎵 {f.name}</span>
                      <button
                        onClick={() => setUploadFiles(prev => prev.filter((_, j) => j !== i))}
                        style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: '0.8rem' }}
                      >✕</button>
                    </div>
                  ))}
                </div>
              )}
              <button className="admin-btn" onClick={handleUpload} disabled={uploadFiles.length === 0 || uploading}>
                {uploading ? '업로드 중...' : `${uploadFiles.length}개 항목 업로드 시작`}
              </button>
            </div>
          )}

          {/* 생성 / 수정 모달 */}
          {showEditModal && (
            <div className="mbti-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowEditModal(false); }}>
              <div className="mbti-modal" style={{ maxWidth: '500px' }}>
                <button className="mbti-close" onClick={() => setShowEditModal(false)}>&times;</button>
                <h2 className="mbti-title">{isNewRecord ? '신규 데이터 등록' : '데이터 정보 수정'}</h2>
                <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#888' }}>NFC 넘버</label>
                    <input type="text" className="admin-input" value={editForm.nfc || ''} onChange={e => setEditForm({ ...editForm, nfc: e.target.value })} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#888' }}>유저 이름</label>
                    <input type="text" className="admin-input" value={editForm.name || ''} onChange={e => setEditForm({ ...editForm, name: e.target.value })} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#888' }}>전화번호 (숫자만)</label>
                    <input type="text" className="admin-input" value={editForm.phone || ''} onChange={e => setEditForm({ ...editForm, phone: e.target.value })} />
                  </div>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: '#888' }}>음원 상태</label>
                    <select 
                      className="admin-input" 
                      value={editForm.status || '대기'} 
                      onChange={e => setEditForm({ ...editForm, status: e.target.value })}
                      style={{ appearance: 'auto' }}
                    >
                      <option value="대기">대기</option>
                      <option value="완료">완료</option>
                    </select>
                  </div>
                  <button className="admin-btn" style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }} onClick={handleSaveRecord}>
                    저장하기
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 트랙 목록 */}
          {loading ? (
            <p style={{ textAlign: 'center', color: '#666', marginTop: '2rem' }}>데이터 불러오는 중...</p>
          ) : (
            <>
              <p style={{ fontSize: '0.7rem', color: '#666', marginBottom: '0.5rem' }}>전체 조회: {filteredTracks.length}건</p>
              <div style={{ overflowX: 'auto', background: '#111', borderRadius: 'var(--radius)', border: '1px solid #222' }}>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>NFC 번호</th>
                      <th>유저 이름</th>
                      <th>전화번호</th>
                      <th>상태</th>
                      <th>관리</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTracks.map((t, i) => (
                      <tr key={i}>
                        <td style={{ fontWeight: 600, color: 'var(--primary)' }}>{t.nfc}</td>
                        <td>{t.name}</td>
                        <td>{t.phone}</td>
                        <td>
                          <span className={`admin-status ${t.status === '완료' ? 'done' : 'pending'}`}>
                            {t.status}
                          </span>
                        </td>
                        <td>
                          <button
                            className="admin-btn-outline"
                            onClick={() => openEditModal(t)}
                            style={{ fontSize: '0.65rem', padding: '0.3rem 0.6rem' }}
                          >수정</button>
                        </td>
                      </tr>
                    ))}
                    {filteredTracks.length === 0 && (
                      <tr>
                        <td colSpan={5} style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                          검색된 데이터가 없습니다.
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

      {/* ========== 계정 관리 탭 ========== */}
      {activeTab === 'users' && isMaster && (
        <>
          <h2 className="admin-title" style={{ fontSize: '1rem', marginBottom: '1rem' }}>👤 시스템 권한 관리</h2>
          {/* 이전 계정 관리 코드 동일... */}
        </>
      )}
    </div>
  );
}
