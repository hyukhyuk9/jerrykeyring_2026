'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loginId, setLoginId] = useState('');
  const [loginPw, setLoginPw] = useState('');
  const [error, setError] = useState('');
  const [isClient, setIsClient] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    setIsClient(true);
    const auth = sessionStorage.getItem('adminAuth');
    if (auth === 'true') {
      setIsLoggedIn(true);
    }
  }, []);

  function handleLogin() {
    if (loginId === 'jerry' && loginPw === 'tom') {
      sessionStorage.setItem('adminAuth', 'true');
      setIsLoggedIn(true);
      setError('');
    } else {
      setError('아이디 또는 비밀번호가 일치하지 않습니다.');
    }
  }

  function handleLogout() {
    sessionStorage.removeItem('adminAuth');
    setIsLoggedIn(false);
  }

  if (!isClient) return null; // Hydration mismatch 방지

  if (!isLoggedIn) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh', background: '#0a0a0a', color: '#fff', fontFamily: 'sans-serif' }}>
        <div style={{ background: '#111', padding: '3rem', borderRadius: '14px', border: '1px solid #333', textAlign: 'center', width: '100%', maxWidth: '400px' }}>
          <h1 style={{ color: '#ff914d', marginBottom: '2rem', fontSize: '1.5rem' }}>관리자 시스템 로그인</h1>
          <input
            type="text"
            placeholder="아이디"
            value={loginId}
            onChange={e => setLoginId(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && document.getElementById('pw-input')?.focus()}
            style={{ width: '100%', padding: '0.8rem', marginBottom: '1rem', background: '#1a1a1a', border: '1px solid #333', color: '#fff', borderRadius: '8px' }}
          />
          <input
            id="pw-input"
            type="password"
            placeholder="비밀번호"
            value={loginPw}
            onChange={e => setLoginPw(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            style={{ width: '100%', padding: '0.8rem', marginBottom: '1rem', background: '#1a1a1a', border: '1px solid #333', color: '#fff', borderRadius: '8px' }}
          />
          {error && <p style={{ color: '#ef4444', fontSize: '0.8rem', marginBottom: '1rem' }}>{error}</p>}
          <button
            onClick={handleLogin}
            style={{ width: '100%', padding: '0.8rem', background: '#ff914d', color: '#000', border: 'none', borderRadius: '50px', fontWeight: 'bold', cursor: 'pointer' }}
          >
            접속하기
          </button>
        </div>
      </div>
    );
  }

  const navGroups = [
    {
      title: 'MAIN',
      items: [
        { name: '대시보드 (CRUD)', path: '/admin', icon: '📊' },
        { name: '외부 API 연동', path: '/admin/api', icon: '🔌' }
      ]
    },
    {
      title: 'CONTENT',
      items: [
        { name: '가사 타임라인 에디터', path: '/admin/lyrics', icon: '📝' },
        { name: '콘텐츠 큐레이팅', path: '/admin/curation', icon: '🎯' }
      ]
    }
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#0a0a0a', color: '#fff', fontFamily: 'sans-serif' }}>
      {/* Sidebar */}
      <aside style={{ width: '250px', background: '#111', borderRight: '1px solid #222', padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
        <div style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
          <img src="/images/iphone.png" alt="Logo" style={{ height: '40px', objectFit: 'contain', marginBottom: '0.5rem' }} />
          <div style={{ fontSize: '0.8rem', color: '#888', fontWeight: 'bold' }}>ADMIN SYSTEM</div>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', flex: 1 }}>
          {navGroups.map(group => (
            <div key={group.title}>
              <div style={{ fontSize: '0.7rem', color: '#444', fontWeight: 'bold', marginBottom: '0.8rem', paddingLeft: '0.5rem' }}>{group.title}</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem' }}>
                {group.items.map(item => {
                  const isActive = pathname === item.path;
                  return (
                    <Link
                      key={item.path}
                      href={item.path}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '0.8rem 1rem',
                        textDecoration: 'none',
                        color: isActive ? '#ff914d' : '#888',
                        background: isActive ? 'rgba(255, 145, 77, 0.1)' : 'transparent',
                        borderRadius: '8px',
                        fontSize: '0.9rem',
                        fontWeight: isActive ? 'bold' : 'normal',
                        transition: 'all 0.2s'
                      }}
                    >
                      <span style={{ fontSize: '1.1rem' }}>{item.icon}</span>
                      {item.name}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        <button
          onClick={handleLogout}
          style={{ padding: '0.8rem', background: 'transparent', border: '1px solid #444', color: '#888', borderRadius: '8px', cursor: 'pointer', marginTop: '2rem' }}
        >
          로그아웃
        </button>
      </aside>

      {/* Main Content Area */}
      <main style={{ flex: 1, padding: '2rem', overflowY: 'auto', maxHeight: '100vh' }}>
        <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
          {children}
        </div>
      </main>
    </div>
  );
}
