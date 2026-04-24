import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";

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
  const requestId = Math.random().toString(36).substring(7);
  console.log(`\n[🚀 Upload Start] ID: ${requestId}`);

  try {
    const formData = await request.formData();
    const nfcId = formData.get('nfcId') as string;
    const file = formData.get('file') as File;

    if (!nfcId || !file) {
      console.error(`[❌ Upload Error] Missing nfcId or file`);
      return NextResponse.json({ error: 'NFC ID와 파일이 필요합니다.' }, { status: 400 });
    }

    console.log(`[📦 Info] NFC_ID: ${nfcId} | FileName: ${file.name} | Size: ${file.size} bytes`);

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

    console.log(`[🗄️ DB Updating] Inserting into audio_files table...`);
    const { error: dbError } = await supabase
      .from('audio_files')
      .insert({
        nfc_id: nfcId,
        audio_url: publicUrl,
        category: 'music'
      });

    if (dbError) {
      console.error(`[❌ DB Error]`, dbError);
      throw dbError;
    }

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
