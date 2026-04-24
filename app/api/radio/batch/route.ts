import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

export const dynamic = 'force-dynamic';

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

function getS3Client() {
  const endpoint = process.env.R2_ENDPOINT;
  const accessKey = process.env.R2_ACCESS_KEY_ID;
  const secretKey = process.env.R2_SECRET_ACCESS_KEY;
  if (!endpoint || !accessKey || !secretKey) return null;
  
  return new S3Client({
    region: "auto",
    endpoint: endpoint,
    credentials: {
      accessKeyId: accessKey,
      secretAccessKey: secretKey,
    },
  });
}

const r2Bucket = process.env.R2_BUCKET_NAME || '';
const r2PublicDomain = process.env.R2_PUBLIC_DOMAIN || 'https://pub-5c6a6735682b4c08a8c7ee71c2d15cf7.r2.dev';

export async function POST(request: Request) {
  try {
    const { story, nfc_id } = await request.json();
    const apiKey = process.env.GOOGLE_AI_API_KEY;
    const supabase = getSupabaseClient();
    const s3Client = getS3Client();

    if (!apiKey) return NextResponse.json({ error: 'Gemini API Key is missing' }, { status: 500 });
    if (!s3Client || !supabase) return NextResponse.json({ error: '서버 환경 변수 설정이 누락되었습니다.' }, { status: 500 });

    console.log(`[Radio Batch] Start: nfc_id=${nfc_id}`);
    const safeStory = story || '사연 없음';

    // 1. Gemini를 통해 라디오 대본 생성
    const gptResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `사연: "${safeStory}"\n\n위 사연을 다정한 라디오 진행자 제리(남성)의 말투로 각색해줘. 전체 길이는 30초 내외로 해주고, [인트로] - [사연 읽기] - [공감] - [청취자에게 인상깊은 한마디] 순서로 구성해서 부가적인 설명 없이 대본 내용만 깔끔하게 작성해줘.`
          }]
        }]
      }),
    });

    const gptData = await gptResponse.json();
    const script = gptData.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!script) {
      return NextResponse.json({ error: '대본 생성 실패' }, { status: 500 });
    }

    // 2. Google Cloud TTS를 통해 고품질 음성 생성
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
    const audioContentBase64 = ttsData.audioContent;

    if (!audioContentBase64) {
      return NextResponse.json({ error: 'TTS 생성 실패' }, { status: 500 });
    }

    // 3. Cloudflare R2 업로드
    const audioBuffer = Buffer.from(audioContentBase64, 'base64');
    const fileName = `audio/${nfc_id}-TTS.mp3`;

    await s3Client.send(
      new PutObjectCommand({
        Bucket: r2Bucket,
        Key: fileName,
        Body: audioBuffer,
        ContentType: 'audio/mpeg',
      })
    );

    const audioUrl = `${r2PublicDomain}/${fileName}`;

    // 4. Supabase DB 기록
    const { data: existing } = await supabase
      .from('audio_files')
      .select('id')
      .eq('nfc_id', nfc_id)
      .eq('category', 'radio_tts')
      .maybeSingle();

    if (existing) {
      await supabase
        .from('audio_files')
        .update({
          audio_url: audioUrl,
          radio_script: script,
          updated_at: new Date().toISOString()
        })
        .eq('id', existing.id);
    } else {
      await supabase
        .from('audio_files')
        .insert({
          nfc_id: nfc_id,
          audio_url: audioUrl,
          category: 'radio_tts',
          radio_script: script
        });
    }

    return NextResponse.json({ 
        success: true,
        script, 
        audioUrl, 
        message: '라디오 생성이 완료되었습니다.'
    });

  } catch (error: any) {
    console.error('Radio Batch API Error:', error);
    return NextResponse.json({ error: error.message || '서버 오류' }, { status: 500 });
  }
}
