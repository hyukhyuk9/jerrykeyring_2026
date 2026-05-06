import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '제리키링 | 나만의 AI 미니앨범키링',
  description: '제리키링에서 만든 나만의 AI 음원을 들어보세요 🎧',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: '제리키링',
  },
  icons: {
    icon: '/icons/icon-192x192.png',
    apple: '/icons/icon-192x192.png',
  },
  openGraph: {
    title: '제리키링 | 나만의 AI 미니앨범키링',
    description: '제리키링에서 만든 나만의 AI 음원을 들어보세요 🎧',
    images: ['/icons/icon-512x512.png'],
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700&display=swap"
          rel="stylesheet"
        />
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
