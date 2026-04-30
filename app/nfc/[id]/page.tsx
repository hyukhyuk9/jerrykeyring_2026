import { supabase, TrackRecord } from '@/lib/supabase';
import { getTrackFiles } from '@/lib/r2';
import NfcPageClient from './NfcPageClient';
import { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
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

  // 1. Supabase에서 해당 NFC ID 데이터 조회 (기존의 getTrackByNfc 대체)
  const { data: trackData } = await supabase
    .from('tracks')
    .select('*')
    .eq('nfc_id', id)
    .maybeSingle();

  const track = trackData as TrackRecord | null;

  // 2. 커스텀 트랙 구성 로직 복구
  // 실제 R2 파일이 있으면 R2 파일을 사용하고, 없으면 기존처럼 장르 기반 샘플 음원 매핑
  const audioUrls = await getTrackFiles(id);
  let hasMusic = audioUrls.length > 0;
  let tracks: { label: string; url: string }[] = [];

  if (hasMusic) {
    tracks = audioUrls.map((url, index) => ({
      label: index === 0 ? (track?.genre || '음원') : `${track?.genre || '트랙'} ${index + 1}`,
      url: url,
    }));
  } else if (track) {
    // 음원 파일은 없지만 트랙 정보는 있는 경우 -> 기존의 샘플 매핑 로직 복구
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

    const genre = track.genre || '음원';
    const sampleUrl = genreToSample[genre] || '/audio/sample-indiepop.mp3';
    
    tracks = [{
      label: genre,
      url: sampleUrl,
    }];
    hasMusic = true; // 샘플이라도 재생 가능하게 설정
  }

  return (
    <NfcPageClient
      nfcId={id}
      hasMusic={hasMusic}
      tracks={tracks}
      lyrics={track?.lyrics || '가사가 등록되지 않았습니다.'}
      genre={track?.genre || '음원'}
    />
  );
}
