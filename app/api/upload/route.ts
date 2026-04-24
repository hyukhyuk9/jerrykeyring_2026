import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

export const dynamic = 'force-dynamic';

// 최상단에서 미리 생성하지 않고, 요청 시점에 생성하는 헬퍼 함수
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

export async function POST(request: NextRequest) {
  const requestId = Math.random().toString(36).substring(7);
  console.log(`\n[🚀 Upload Start] ID: ${requestId}`);

  try {
    const supabase = getSupabaseClient();
    const s3Client = getS3Client();

    if (!supabase || !s3Client) {
      console.error(`[❌ Config Error] Supabase or S3 client initialization failed. Check ENV.`);
      throw new Error('서버 환경 변수 설정이 누락되었습니다.');
    }

    const formData = await request.formData();
    const nfcId = formData.get('nfcId') as string;
    const file = formData.get('file') as File;

    if (!nfcId || !file) {
      return NextResponse.json({ error: 'NFC ID와 파일이 필요합니다.' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const fileName = `media/music/${nfcId}_${Date.now()}_${file.name}`;
    console.log(`[☁️ R2 Uploading] Path: ${fileName}...`);

    await s3Client.send(
      new PutObjectCommand({
        Bucket: r2Bucket,
        Key: fileName,
        Body: buffer,
        ContentType: file.type || 'audio/mpeg',
      })
    );

    const publicUrl = `${r2PublicDomain}/${fileName}`;
    console.log(`[✅ R2 Success] URL: ${publicUrl}`);

    const { error: dbError } = await supabase
      .from('audio_files')
      .insert({
        nfc_id: nfcId,
        audio_url: publicUrl,
        category: 'music'
      });

    if (dbError) throw dbError;

    console.log(`[🎉 Request Finished] ID: ${requestId} - All Done.\n`);

    return NextResponse.json({
      success: true,
      url: publicUrl,
      message: '업로드 성공!'
    });

  } catch (error: any) {
    console.error(`[🚨 Fatal Error] ID: ${requestId}`, error);
    return NextResponse.json({ error: error.message || '서버 오류' }, { status: 500 });
  }
}
