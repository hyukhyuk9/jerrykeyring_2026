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

    // 1. 기존에 생성된 라디오가 있는지 DB 조회
    if (supabase) {
      const { data: existingData } = await supabase
        .from('audio_files')
        .select('radio_script, radio_audio')
        .eq('nfc_id', nfc_id)
        .maybeSingle();

      if (existingData && existingData.radio_script && existingData.radio_audio) {
        return NextResponse.json({ 
            script: existingData.radio_script, 
            audioContent: existingData.radio_audio, 
            message: 'Loaded from cache'
        });
      }
    }

    // 2. 데이터가 없으면 Gemini를 통해 라디오 대본 생성
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

    // 3. Google Cloud TTS를 통해 고품질 음성 생성 (ko-KR-Neural2-B)
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
    const audioContent = ttsData.audioContent;

    if (audioContent) {
      // 4. 생성된 데이터를 DB에 업데이트 또는 삽입
      if (supabase) {
        try {
          const { error: dbError } = await supabase
            .from('audio_files')
            .update({
              radio_script: script,
              radio_audio: audioContent
            })
            .eq('nfc_id', nfc_id);
          
          if (dbError) console.warn('Database update warning:', dbError.message);
        } catch (dbErr) {
          console.error('Database connection error:', dbErr);
        }
      }
    }

    return NextResponse.json({ 
        script, 
        audioContent, 
        message: 'Generated and Saved'
    });

  } catch (error) {
    console.error('Radio API Error:', error);
    return NextResponse.json({ error: 'Failed to process radio' }, { status: 500 });
  }
}
