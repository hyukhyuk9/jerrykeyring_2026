import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  // 모든 환경 변수와 클라이언트 생성을 POST 함수 내부로 이동하여 빌드 타임의 간섭을 원천 차단
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const r2Endpoint = process.env.R2_ENDPOINT;
  const r2AccessKey = process.env.R2_ACCESS_KEY_ID;
  const r2SecretKey = process.env.R2_SECRET_ACCESS_KEY;
  const r2Bucket = process.env.R2_BUCKET_NAME;
  const r2PublicDomain = process.env.R2_PUBLIC_DOMAIN || 'https://pub-5c6a6735682b4c08a8c7ee71c2d15cf7.r2.dev';

  const requestId = Math.random().toString(36).substring(7);
  console.log(`\n[🚀 Upload Start] ID: ${requestId}`);

  try {
    // 환경 변수 체크
    if (!supabaseUrl || !supabaseKey || !r2Endpoint || !r2AccessKey || !r2SecretKey || !r2Bucket) {
      console.error(`[❌ Config Error] Missing environment variables.`);
      throw new Error('서버 환경 변수 설정이 누락되었습니다. (.env 확인 필요)');
    }

    // 클라이언트 생성 (요청 시점에만)
    const supabase = createClient(supabaseUrl, supabaseKey);
    const s3Client = new S3Client({
      region: "auto",
      endpoint: r2Endpoint,
      credentials: {
        accessKeyId: r2AccessKey,
        secretAccessKey: r2SecretKey,
      },
    });

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
