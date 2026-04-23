import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '제리키링 | 나만의 AI 미니앨범키링',
  description: '제리키링에서 만든 나만의 AI 음원을 들어보세요 🎧',
  icons: {
    icon: '/images/iphone.png',
  },
  openGraph: {
    title: '제리키링 | 나만의 AI 미니앨범키링',
    description: '제리키링에서 만든 나만의 AI 음원을 들어보세요 🎧',
    images: ['/images/iphone.png'],
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
