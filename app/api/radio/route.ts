import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { uploadToR2 } from '@/lib/r2';

export const dynamic = 'force-dynamic';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = (supabaseUrl && supabaseKey) 
  ? createClient(supabaseUrl, supabaseKey) 
  : null;

export async function POST(request: Request) {
  try {
    const { story, nfc_id } = await request.json();
    const apiKey = process.env.GOOGLE_AI_API_KEY;

    if (!apiKey) {
      return NextResponse.json({ error: 'Gemini/TTS API Key is missing' }, { status: 500 });
    }

    if (!supabase) {
      return NextResponse.json({ error: 'Supabase client is not initialized' }, { status: 500 });
    }

    // 1. 기존에 생성된 라디오가 있는지 DB 조회
    const { data: existingData } = await supabase
      .from('audio_files')
      .select('radio_url, radio_script')
      .eq('nfc_id', nfc_id)
      .maybeSingle();

    if (existingData?.radio_url) {
      return NextResponse.json({ 
          script: existingData.radio_script, 
          url: existingData.radio_url, 
          message: 'Loaded from existing record'
      });
    }

    // 2. Gemini를 통해 라디오 대본 생성
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

    // 3. Google Cloud TTS를 통해 음성 생성
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
        audioConfig: { audioEncoding: 'MP3' }
      }),
    });

    const ttsData = await ttsResponse.json();
    const audioContent = ttsData.audioContent; // base64 string

    if (!audioContent) {
      return NextResponse.json({ error: 'Failed to generate TTS audio' }, { status: 500 });
    }

    // 4. Cloudflare R2 업로드 (media/radio/[nfc_id]_tts.mp3)
    const audioBuffer = Buffer.from(audioContent, 'base64');
    const filename = `radio/${nfc_id}_tts.mp3`;
    const publicUrl = await uploadToR2(filename, audioBuffer);

    if (!publicUrl) {
      return NextResponse.json({ error: 'Failed to upload to R2' }, { status: 500 });
    }

    // 5. DB 업데이트 (radio_url, radio_url_status)
    const { error: dbError } = await supabase
      .from('audio_files')
      .upsert({
        nfc_id: nfc_id,
        radio_script: script,
        radio_url: publicUrl,
        radio_url_status: true,
        category: 'radio_tts'
      }, { onConflict: 'nfc_id' });

    if (dbError) {
      console.error('Database update error:', dbError);
    }

    return NextResponse.json({ 
        script, 
        url: publicUrl, 
        message: 'Generated and Saved to R2'
    });

  } catch (error) {
    console.error('Radio API Error:', error);
    return NextResponse.json({ error: 'Failed to process radio' }, { status: 500 });
  }
}
