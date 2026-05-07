'use client';

import { useState } from 'react';

const DEFAULT_CATEGORIES = [
  { id: '1', title: '내 노래듣기', icon: '🎵', order: 0 },
  { id: '2', title: 'AI 라디오', icon: '📻', order: 1 },
  { id: '3', title: '내 취향은?', icon: '💡', order: 2 },
  { id: '4', title: '플레이리스트', icon: '🎧', order: 3 },
];

export default function CurationPage() {
  const [categories, setCategories] = useState(DEFAULT_CATEGORIES);
  const [newTitle, setNewTitle] = useState('');
  const [newIcon, setNewIcon] = useState('🎵');

  function addCategory() {
    if (!newTitle.trim()) return;
    const newCat = {
      id: String(Date.now()),
      title: newTitle.trim(),
      icon: newIcon,
      order: categories.length,
    };
    setCategories([...categories, newCat]);
    setNewTitle('');
    setNewIcon('🎵');
  }

  function removeCategory(id: string) {
    setCategories(categories.filter(c => c.id !== id));
  }

  const cardStyle: React.CSSProperties = {
    background: '#1a1a1a',
    border: '1px solid #333',
    borderRadius: '12px',
    padding: '1rem 1.2rem',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: '0.5rem',
  };

  return (
    <div>
      <h1 style={{ color: '#ff914d', marginBottom: '0.5rem' }}>콘텐츠 큐레이팅</h1>
      <p style={{ color: '#888', fontSize: '0.85rem', marginBottom: '2rem' }}>
        메인 화면에 표시될 큐레이션 카테고리를 관리합니다.
      </p>

      {/* 카테고리 목록 */}
      <div style={{ marginBottom: '2rem' }}>
        {categories.map((cat) => (
          <div key={cat.id} style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '1.5rem' }}>{cat.icon}</span>
              <span style={{ color: '#fff', fontWeight: 'bold' }}>{cat.title}</span>
            </div>
            <button
              onClick={() => removeCategory(cat.id)}
              style={{
                background: 'transparent',
                border: '1px solid #555',
                color: '#888',
                borderRadius: '8px',
                padding: '6px 14px',
                cursor: 'pointer',
                fontSize: '0.8rem',
              }}
            >
              삭제
            </button>
          </div>
        ))}
      </div>

      {/* 새 카테고리 추가 */}
      <div style={{ background: '#111', border: '1px solid #333', borderRadius: '12px', padding: '1.5rem' }}>
        <h3 style={{ color: '#ff914d', marginBottom: '1rem', fontSize: '1rem' }}>카테고리 추가</h3>
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          <select
            value={newIcon}
            onChange={e => setNewIcon(e.target.value)}
            style={{ background: '#1a1a1a', border: '1px solid #444', color: '#fff', borderRadius: '8px', padding: '0.6rem', fontSize: '1.2rem' }}
          >
            <option value="🎵">🎵</option>
            <option value="📻">📻</option>
            <option value="💡">💡</option>
            <option value="🎧">🎧</option>
            <option value="🔥">🔥</option>
            <option value="⭐">⭐</option>
            <option value="🎤">🎤</option>
          </select>
          <input
            type="text"
            placeholder="카테고리 이름"
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addCategory()}
            style={{ flex: 1, background: '#1a1a1a', border: '1px solid #444', color: '#fff', borderRadius: '8px', padding: '0.7rem', fontSize: '0.9rem' }}
          />
          <button
            onClick={addCategory}
            style={{
              background: '#ff914d',
              color: '#000',
              border: 'none',
              borderRadius: '8px',
              padding: '0.7rem 1.5rem',
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
          >
            추가
          </button>
        </div>
      </div>
    </div>
  );
}
