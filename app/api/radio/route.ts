import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// 빌드 시 에러 방지를 위한 다이내믹 렌더링 설정
export const dynamic = 'force-dynamic';

// 수파베이스 초기화 방어 로직
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// URL과 Key가 있을 때만 클라이언트 생성
const supabase = (supabaseUrl && supabaseKey) 
  ? createClient(supabaseUrl, supabaseKey) 
  : null;

export async function POST(request: Request) {
  try {
    const { story, nfc_id } = await request.json();
    const apiKey = process.env.GOOGLE_AI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'Gemini API Key is missing' }, { status: 500 });
    }

    // 1. Gemini를 통해 라디오 대본 생성
    const gptResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `사연: "${story}"\n\n위 사연을 다정한 라디오 진행자 제리(남성)의 말투로 각색해줘. 2~3문장 내외로, 따뜻한 응원을 포함해서 대본만 작성해줘.`
          }]
        }]
      }),
    });

    const gptData = await gptResponse.json();
    const script = gptData.candidates[0].content.parts[0].text;

    // 2. Google Cloud TTS를 통해 고품질 음성 생성 (Alnilam 보이스)
    const ttsResponse = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        input: { text: script },
        voice: {
          languageCode: 'ko-KR',
          name: 'ko-KR-Neural2-B',
          ssmlGender: 'MALE'
        },
        audioConfig: {
          audioEncoding: 'MP3',
        }
      }),
    });

    const ttsData = await ttsResponse.json();

    if (ttsData.audioContent) {
      // 3. 기존 audio_files 테이블에 라디오 데이터 저장
      // 사용자의 요청대로 신규 테이블이 아닌 기존 audio_files에 컬럼을 추가하여 활용
      try {
        if (supabase) {
          const { error: dbError } = await supabase
            .from('audio_files')
            .insert({
              nfc_id: nfc_id || 'unknown',
              audio_url: '', // 음원 파일 저장 시 여기에 URL이 들어갈 예정 (현재는 빈값)
              radio_script: script, // 새로 추가할 컬럼명: radio_script
            });
          
          if (dbError) console.warn('Database save warning:', dbError.message);
        } else {
          console.warn('Supabase client is not initialized. Skipping DB insert.');
        }
      } catch (dbErr) {
        console.error('Database connection error:', dbErr);
      }
    }

    return NextResponse.json({ 
        script, 
        audioContent: ttsData.audioContent, 
        message: 'Success'
    });

  } catch (error) {
    console.error('Radio API Error:', error);
    return NextResponse.json({ error: 'Failed to process radio' }, { status: 500 });
  }
}
