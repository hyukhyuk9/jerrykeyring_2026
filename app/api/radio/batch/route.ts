import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { uploadToR2 } from '@/lib/r2';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const apiKey = process.env.GOOGLE_AI_API_KEY;

  if (!supabaseUrl || !supabaseKey || !apiKey) {
    return NextResponse.json({ error: '서버 환경 변수 설정이 누락되었습니다.' }, { status: 500 });
  }

  const supabase = createClient(supabaseUrl, supabaseKey);

  try {
    const { force = false, limit = 10 } = await request.json().catch(() => ({}));

    // 1. tracks 테이블에서 사연(story)이 있는 모든 유저 조회
    const { data: tracks, error: fetchError } = await supabase
      .from('tracks')
      .select('nfc_id, story')
      .not('story', 'is', null)
      .neq('story', '')
      .limit(limit); // 서버리스 타임아웃 방지를 위해 기본 10개씩 처리

    if (fetchError) throw fetchError;
    if (!tracks || tracks.length === 0) {
      return NextResponse.json({ message: '처리할 사연이 없습니다.' });
    }

    const results = {
      total: tracks.length,
      success: 0,
      skipped: 0,
      failed: 0,
      details: [] as any[]
    };

    for (const track of tracks) {
      const { nfc_id, story } = track;

      // 2. 이미 라디오가 있는지 확인 (force 옵션이 없으면 건너뜀)
      if (!force) {
        const { data: existing } = await supabase
          .from('audio_files')
          .select('radio_url')
          .eq('nfc_id', nfc_id)
          .maybeSingle();

        if (existing?.radio_url) {
          results.skipped++;
          continue;
        }
      }

      try {
        console.log(`[Batch] Processing NFC: ${nfc_id}`);

        // 3. Gemini 대본 생성
        const gptResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [{
                text: `사연: "${story}"\n\n위 사연을 다정한 라디오 진행자 제리(남성)의 말투로 각색해줘. 전체 길이는 30초 내외로 해주고, 대본만 깔끔하게 작성해줘.`
              }]
            }]
          }),
        });
        const gptData = await gptResponse.json();
        const script = gptData.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!script) throw new Error('대본 생성 실패');

        // 4. TTS 생성
        const ttsResponse = await fetch(`https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            input: { text: script },
            voice: { languageCode: 'ko-KR', name: 'ko-KR-Neural2-B', ssmlGender: 'MALE' },
            audioConfig: { audioEncoding: 'MP3' }
          }),
        });
        const ttsData = await ttsResponse.json();
        const audioContent = ttsData.audioContent;
        if (!audioContent) throw new Error('TTS 생성 실패');

        // 5. R2 업로드 (media/radio/[nfc_id]_tts.mp3)
        const audioBuffer = Buffer.from(audioContent, 'base64');
        const filename = `radio/${nfc_id}_tts.mp3`;
        const publicUrl = await uploadToR2(filename, audioBuffer);
        if (!publicUrl) throw new Error('R2 업로드 실패');

        // 6. DB 업데이트 (upsert 사용)
        const { error: dbError } = await supabase
          .from('audio_files')
          .upsert({
            nfc_id: nfc_id,
            radio_script: script,
            radio_url: publicUrl,
            radio_url_status: true,
            category: 'radio_tts'
          }, { onConflict: 'nfc_id' });

        if (dbError) throw dbError;

        results.success++;
        results.details.push({ nfc_id, status: 'success' });

      } catch (err: any) {
        console.error(`[Batch Error] NFC ${nfc_id}:`, err.message);
        results.failed++;
        results.details.push({ nfc_id, status: 'failed', error: err.message });
      }
    }

    return NextResponse.json(results);

  } catch (error: any) {
    console.error('Batch Process Fatal Error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
