import Link from 'next/link';

export default function HomePage() {
  return (
    <>
      <header className="app-header">
        <img src="/images/iphone.png" alt="제리키링" className="logo" />
      </header>
      <main className="app-main" style={{ gap: '1.5rem', textAlign: 'center' }}>
        <h1 style={{
          fontFamily: 'var(--font-display)',
          fontSize: '1.6rem',
          color: 'var(--primary)',
          marginTop: '2rem'
        }}>
          JERRY KEYRING AI.
        </h1>
        <p style={{
          fontSize: '0.85rem',
          color: '#aaa',
          lineHeight: 1.6,
          maxWidth: '300px'
        }}>
          나만의 AI 미니앨범키링<br />
          NFC 태그를 스캔해서 음원을 들어보세요
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', width: '100%', maxWidth: '280px' }}>
          <Link href="/nfc/sample" style={{
            padding: '0.75rem',
            background: 'var(--primary)',
            color: '#000',
            borderRadius: '50px',
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: '0.85rem',
            textAlign: 'center',
            transition: 'all 0.2s ease'
          }}>
            🎵 샘플 청음존
          </Link>
          <Link href="/admin" style={{
            padding: '0.75rem',
            border: '1px solid var(--primary)',
            color: 'var(--primary)',
            borderRadius: '50px',
            textDecoration: 'none',
            fontWeight: 500,
            fontSize: '0.85rem',
            textAlign: 'center',
            transition: 'all 0.2s ease'
          }}>
            관리자
          </Link>
        </div>
        <p className="info-text visible" style={{ marginTop: '2rem' }}>
          *DBD LAB. | 나만의 앨범키링
        </p>
      </main>
    </>
  );
}
