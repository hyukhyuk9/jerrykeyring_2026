import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

// 환경 변수 로드
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

const r2Endpoint = process.env.R2_ENDPOINT || '';
const r2AccessKey = process.env.R2_ACCESS_KEY_ID || '';
const r2SecretKey = process.env.R2_SECRET_ACCESS_KEY || '';
const r2Bucket = process.env.R2_BUCKET_NAME || '';
const r2PublicDomain = process.env.R2_PUBLIC_DOMAIN || 'https://pub-5c6a6735682b4c08a8c7ee71c2d15cf7.r2.dev';

const s3Client = new S3Client({
  region: "auto",
  endpoint: r2Endpoint,
  credentials: {
    accessKeyId: r2AccessKey,
    secretAccessKey: r2SecretKey,
  },
});

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const nfcId = formData.get('nfcId') as string;
    const file = formData.get('file') as File;

    if (!nfcId || !file) {
      return NextResponse.json({ error: 'NFC ID와 파일이 필요합니다.' }, { status: 400 });
    }

    // 1. 파일 데이터 Buffer 변환
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 2. R2 업로드 경로 설정 (media/music/NFCID_timestamp_파일명.mp3)
    const fileName = `media/music/${nfcId}_${Date.now()}_${file.name}`;

    await s3Client.send(
      new PutObjectCommand({
        Bucket: r2Bucket,
        Key: fileName,
        Body: buffer,
        ContentType: file.type || 'audio/mpeg',
      })
    );

    const publicUrl = `${r2PublicDomain}/${fileName}`;

    // 3. Supabase DB 기록
    const { error: dbError } = await supabase
      .from('audio_files')
      .insert({
        nfc_id: nfcId,
        audio_url: publicUrl,
        category: 'music' // 기본 카테고리는 음악으로 설정
      });

    if (dbError) throw dbError;

    return NextResponse.json({
      success: true,
      url: publicUrl,
      message: 'R2 업로드 및 DB 기록이 완료되었습니다.'
    });

  } catch (error: any) {
    console.error('Upload API Error:', error);
    return NextResponse.json({ error: error.message || '서버 오류가 발생했습니다.' }, { status: 500 });
  }
}
