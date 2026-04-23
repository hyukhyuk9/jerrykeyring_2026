import Link from 'next/link';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <header className="app-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <img src="/images/logo.png" alt="제리키링" className="logo" />
            <span style={{ fontSize: '0.8rem', color: '#888', fontWeight: 'bold' }}>관리자 시스템</span>
          </div>
          <nav style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem' }}>
            <Link href="/admin" style={{ color: 'var(--primary)', textDecoration: 'none' }}>대시보드</Link>
            <Link href="/admin/lyrics" style={{ color: 'var(--text-dark)', textDecoration: 'none' }}>가사 타임라인 에디터</Link>
            <Link href="/admin/api" style={{ color: 'var(--text-dark)', textDecoration: 'none' }}>외부 API 연동</Link>
          </nav>
        </div>
      </header>
      {children}
    </>
  );
}
