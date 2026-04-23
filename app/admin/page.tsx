'use client';

import { useState, useEffect, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';

// Supabase 클라이언트 초기화 (클라이언트 환경변수 사용)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

interface AdminTrack {
  id?: string;
  nfc_id: string;
  user_name: string;
  phone_number: string;
  genre: string;
  modify: string;
  created_at: string;
  hasLyrics: boolean;
  lyrics: string;
}

export default function AdminPage() {
  const [tracks, setTracks] = useState<AdminTrack[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

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

  // 폴더 업로드용 input ref
  const folderInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadTracks();
  }, []);

  // --- 트랙 목록 로드 (Supabase 연동) ---
  async function loadTracks() {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('tracks')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Supabase fetch error:', error);
      } else if (data) {
        setTracks(data as AdminTrack[]);
      }
    } catch (err) {
      console.error('트랙 로드 실패', err);
    }
    setLoading(false);
  }

  // --- 데이터 수정 / 신규 생성 ---
  function openNewRecordModal() {
    setIsNewRecord(true);
    setEditForm({ nfc_id: '', user_name: '', phone_number: '', genre: 'music', modify: '대기' });
    setShowEditModal(true);
  }

  function openEditModal(track: AdminTrack) {
    setIsNewRecord(false);
    setEditForm({ ...track });
    setShowEditModal(true);
  }

  async function handleSaveRecord() {
    if (!editForm.nfc_id) {
      alert('NFC 번호는 필수입니다.');
      return;
    }
    
    // UI 시뮬레이션용 임시 로직
    alert(isNewRecord ? '신규 등록 완료 (UI 시뮬레이션)' : '수정 완료 (UI 시뮬레이션)');
    setShowEditModal(false);
    // 실제로는 아래와 같이 Supabase에 upsert를 수행합니다.
    /*
    const { error } = await supabase.from('tracks').upsert(editForm);
    if (!error) loadTracks();
    */
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

  const filteredTracks = tracks.filter(t =>
    (t.nfc_id || '').includes(searchQuery) ||
    (t.user_name || '').includes(searchQuery) ||
    (t.genre || '').includes(searchQuery)
  );

  return (
    <div>
      <h1 style={{ fontSize: '1.5rem', color: '#ff914d', marginBottom: '2rem', fontFamily: 'serif' }}>데이터 관리 (CRUD)</h1>
      
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', gap: '1rem', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="NFC ID, 이름 검색..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          style={{ padding: '0.8rem', background: '#111', border: '1px solid #333', color: '#fff', borderRadius: '8px', minWidth: '250px' }}
        />
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button 
            onClick={openNewRecordModal}
            style={{ padding: '0.8rem 1.2rem', background: 'transparent', border: '1px solid #ff914d', color: '#ff914d', borderRadius: '8px', cursor: 'pointer' }}
          >
            + 데이터 수동 등록
          </button>
          <button 
            onClick={() => setShowUpload(!showUpload)}
            style={{ padding: '0.8rem 1.2rem', background: '#ff914d', border: 'none', color: '#000', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            {showUpload ? '닫기' : '🎵 음원 업로드'}
          </button>
        </div>
      </div>

      {/* 업로드 영역 */}
      {showUpload && (
        <div style={{ background: '#111', borderRadius: '14px', padding: '1.5rem', marginBottom: '2rem', border: '1px solid #222' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ color: '#ff914d', fontSize: '1rem' }}>음원 업로드 (모바일 / PC)</h3>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button 
                onClick={() => setUploadMode('files')}
                style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', borderRadius: '4px', cursor: 'pointer', background: uploadMode === 'files' ? '#ff914d' : 'transparent', color: uploadMode === 'files' ? '#000' : '#ff914d', border: '1px solid #ff914d' }}
              >개별 파일 선택</button>
              <button 
                onClick={() => setUploadMode('folder')}
                style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem', borderRadius: '4px', cursor: 'pointer', background: uploadMode === 'folder' ? '#ff914d' : 'transparent', color: uploadMode === 'folder' ? '#000' : '#ff914d', border: '1px solid #ff914d' }}
              >폴더 전체 (PC)</button>
            </div>
          </div>

          {uploadMode === 'files' && (
            <input
              type="text"
              placeholder="연결할 NFC 번호 (예: 5)"
              value={uploadNfcId}
              onChange={e => setUploadNfcId(e.target.value)}
              style={{ width: '100%', padding: '0.8rem', background: '#1a1a1a', border: '1px solid #333', color: '#fff', borderRadius: '8px', marginBottom: '1rem' }}
            />
          )}

          <input type="file" multiple accept="audio/*" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileSelect} />
          {/* @ts-ignore */}
          <input type="file" webkitdirectory="true" multiple ref={folderInputRef} style={{ display: 'none' }} onChange={handleFileSelect} />

          <div
            onDrop={handleDrop}
            onDragOver={e => { e.preventDefault(); e.currentTarget.style.borderColor = '#ff914d'; }}
            onDragLeave={e => e.currentTarget.style.borderColor = '#333'}
            onClick={() => {
              if (uploadMode === 'files') fileInputRef.current?.click();
              else folderInputRef.current?.click();
            }}
            style={{ border: '2px dashed #333', borderRadius: '14px', padding: '3rem 1rem', textAlign: 'center', cursor: 'pointer', color: '#888', transition: 'border-color 0.2s', marginBottom: '1rem' }}
          >
            <p style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>🎵 클릭하여 {uploadMode === 'files' ? '파일을' : '폴더를'} 선택하거나 드래그 앤 드롭 하세요.</p>
            <p style={{ fontSize: '0.8rem' }}>모바일은 버튼을 꾹 눌러 일괄 선택할 수 있습니다.</p>
          </div>
          
          {uploadFiles.length > 0 && (
            <div style={{ marginBottom: '1rem', maxHeight: '150px', overflowY: 'auto', background: '#0a0a0a', padding: '0.5rem', borderRadius: '8px' }}>
              {uploadFiles.map((f, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem', borderBottom: '1px solid #222', fontSize: '0.8rem' }}>
                  <span>{f.name}</span>
                  <button onClick={(e) => { e.stopPropagation(); setUploadFiles(prev => prev.filter((_, j) => j !== i)); }} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>✕</button>
                </div>
              ))}
            </div>
          )}
          <button 
            onClick={handleUpload} 
            disabled={uploadFiles.length === 0 || uploading}
            style={{ width: '100%', padding: '0.8rem', background: '#ff914d', color: '#000', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', opacity: uploadFiles.length === 0 ? 0.5 : 1 }}
          >
            {uploading ? '업로드 중...' : `${uploadFiles.length}개 파일 업로드 시작`}
          </button>
        </div>
      )}

      {/* 트랙 목록 테이블 */}
      {loading ? (
        <p style={{ textAlign: 'center', color: '#888', padding: '3rem' }}>데이터를 불러오는 중입니다...</p>
      ) : (
        <div style={{ background: '#111', borderRadius: '14px', border: '1px solid #222', overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ background: '#1a1a1a', borderBottom: '1px solid #333' }}>
                <th style={{ padding: '1rem', color: '#ff914d' }}>NFC</th>
                <th style={{ padding: '1rem', color: '#ff914d' }}>유저 이름</th>
                <th style={{ padding: '1rem', color: '#ff914d' }}>전화번호</th>
                <th style={{ padding: '1rem', color: '#ff914d' }}>상태</th>
                <th style={{ padding: '1rem', color: '#ff914d' }}>관리</th>
              </tr>
            </thead>
            <tbody>
              {filteredTracks.map((t, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #222' }}>
                  <td style={{ padding: '1rem', fontWeight: 'bold' }}>{t.nfc_id}</td>
                  <td style={{ padding: '1rem' }}>{t.user_name}</td>
                  <td style={{ padding: '1rem', color: '#aaa' }}>{t.phone_number}</td>
                  <td style={{ padding: '1rem' }}>
                    <span style={{ padding: '0.3rem 0.6rem', borderRadius: '50px', fontSize: '0.75rem', background: t.modify === '완료' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(255, 145, 77, 0.15)', color: t.modify === '완료' ? '#22c55e' : '#ff914d' }}>
                      {t.modify || '대기'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem' }}>
                    <button 
                      onClick={() => openEditModal(t)}
                      style={{ padding: '0.4rem 0.8rem', background: 'transparent', border: '1px solid #444', color: '#ccc', borderRadius: '4px', cursor: 'pointer', fontSize: '0.8rem' }}
                    >수정</button>
                  </td>
                </tr>
              ))}
              {filteredTracks.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ padding: '3rem', textAlign: 'center', color: '#666' }}>데이터가 존재하지 않습니다.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* 수정 모달 */}
      {showEditModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div style={{ background: '#111', padding: '2rem', borderRadius: '14px', width: '100%', maxWidth: '400px', border: '1px solid #333' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ color: '#ff914d', fontSize: '1.2rem' }}>{isNewRecord ? '신규 데이터 등록' : '데이터 정보 수정'}</h2>
              <button onClick={() => setShowEditModal(false)} style={{ background: 'none', border: 'none', color: '#888', fontSize: '1.5rem', cursor: 'pointer' }}>&times;</button>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.8rem', color: '#aaa', display: 'block', marginBottom: '0.4rem' }}>NFC 넘버 (필수)</label>
                <input type="text" value={editForm.nfc_id || ''} onChange={e => setEditForm({ ...editForm, nfc_id: e.target.value })} style={{ width: '100%', padding: '0.8rem', background: '#1a1a1a', border: '1px solid #333', color: '#fff', borderRadius: '8px' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: '#aaa', display: 'block', marginBottom: '0.4rem' }}>유저 이름</label>
                <input type="text" value={editForm.user_name || ''} onChange={e => setEditForm({ ...editForm, user_name: e.target.value })} style={{ width: '100%', padding: '0.8rem', background: '#1a1a1a', border: '1px solid #333', color: '#fff', borderRadius: '8px' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: '#aaa', display: 'block', marginBottom: '0.4rem' }}>전화번호 (숫자만)</label>
                <input type="text" value={editForm.phone_number || ''} onChange={e => setEditForm({ ...editForm, phone_number: e.target.value })} style={{ width: '100%', padding: '0.8rem', background: '#1a1a1a', border: '1px solid #333', color: '#fff', borderRadius: '8px' }} />
              </div>
              <div>
                <label style={{ fontSize: '0.8rem', color: '#aaa', display: 'block', marginBottom: '0.4rem' }}>음원 상태</label>
                <select value={editForm.modify || '대기'} onChange={e => setEditForm({ ...editForm, modify: e.target.value })} style={{ width: '100%', padding: '0.8rem', background: '#1a1a1a', border: '1px solid #333', color: '#fff', borderRadius: '8px', appearance: 'auto' }}>
                  <option value="대기">대기</option>
                  <option value="완료">완료</option>
                </select>
              </div>
              <button onClick={handleSaveRecord} style={{ width: '100%', padding: '0.8rem', background: '#ff914d', color: '#000', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', marginTop: '0.5rem' }}>
                저장하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
