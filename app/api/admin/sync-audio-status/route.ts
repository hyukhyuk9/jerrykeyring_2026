import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { S3Client, HeadObjectCommand } from '@aws-sdk/client-s3';

const r2Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT || '',
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  },
});

const BUCKET_NAME = process.env.R2_BUCKET_NAME || 'media';

export async function GET() {
  try {
    // 1. 모든 오디오 파일 레코드 조회
    const { data: allFiles, error: fetchError } = await supabase
      .from('audio_files')
      .select('id, nfc_id, audio_url');

    if (fetchError) throw fetchError;
    if (!allFiles || allFiles.length === 0) {
      return NextResponse.json({ message: "동기화할 데이터가 없습니다." });
    }

    let successCount = 0;
    let failCount = 0;
    const results = [];

    // 2. 각 파일별 존재 여부 확인 및 업데이트
    for (const file of allFiles) {
      // URL에서 키(파일명) 추출
      // 예: https://pub-xxx.r2.dev/123456.mp3 -> 123456.mp3
      const urlParts = file.audio_url.split('/');
      const key = urlParts[urlParts.length - 1];

      let exists = false;
      try {
        await r2Client.send(new HeadObjectCommand({
          Bucket: BUCKET_NAME,
          Key: key,
        }));
        exists = true;
        successCount++;
      } catch (err) {
        exists = false;
        failCount++;
      }

      // 3. DB 업데이트
      const { error: updateError } = await supabase
        .from('audio_files')
        .update({ audio_url_status: exists })
        .eq('id', file.id);
      
      if (!updateError) {
        results.push({ id: file.id, nfc_id: file.nfc_id, exists });
      }
    }

    return NextResponse.json({
      message: "동기화 완료",
      summary: {
        total: allFiles.length,
        exists: successCount,
        missing: failCount
      },
      details: results
    });

  } catch (error: any) {
    console.error("Sync Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
