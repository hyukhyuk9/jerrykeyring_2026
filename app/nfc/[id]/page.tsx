import { getTrackByNfc, sanitizeForClient } from '@/lib/sheets';
import NfcPageClient from './NfcPageClient';


export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return {
    title: `제리키링 | 내 음원 듣기`,
    description: '제리키링에서 만든 나만의 AI 음원을 들어보세요 🎧',
    openGraph: {
      title: '제리키링 | 내 음원 듣기',
      description: '제리키링에서 만든 나만의 AI 음원을 들어보세요 🎧',
      images: ['/images/iphone.png'],
    },
  };
}

export default async function NfcPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Google Sheets에서 해당 NFC ID 데이터 조회
  const track = await getTrackByNfc(id);
  const clientData = track ? sanitizeForClient(track) : null;


  // 커스텀 트랙 구성
  let tracks: { label: string; url: string }[] = [];

  if (clientData?.hasMusic) {
    // 장르 기반으로 트랙 버튼 생성
    // 실제 mp3 URL은 관리자가 업로드하면 Vercel Blob URL이 연결됨
    // 현재는 장르명을 기반으로 샘플 음원 매핑
    const genreToSample: Record<string, string> = {
      '인디팝': '/audio/sample-indiepop.mp3',
      '시티팝': '/audio/sample-citypop.mp3',
      '발라드': '/audio/sample-ballad.mp3',
      '재즈': '/audio/sample-jazz.mp3',
      '알앤비': '/audio/sample-rnb.mp3',
      '힙합': '/audio/sample-hiphop.mp3',
      '포크': '/audio/sample-folk.mp3',
      'EDM': '/audio/sample-edm.mp3',
    };

    const genre = clientData.genre || '음원';
    const sampleUrl = genreToSample[genre] || '/audio/sample-indiepop.mp3';

    tracks = [{
      label: genre,
      url: sampleUrl,
    }];
  }

  return (
    <NfcPageClient
      nfcId={id}
      hasMusic={clientData?.hasMusic || false}
      tracks={tracks}
      lyrics={clientData?.lyrics || ''}
      genre={clientData?.genre || ''}
    />
  );
}
