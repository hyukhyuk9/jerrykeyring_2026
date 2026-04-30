import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';
import dotenv from 'dotenv';
import path from 'path';

// .env.local 로드
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') });

const r2Client = new S3Client({
  region: 'auto',
  endpoint: process.env.R2_ENDPOINT || '',
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || '',
  },
});

async function listFiles() {
  try {
    const command = new ListObjectsV2Command({
      Bucket: process.env.R2_BUCKET_NAME || 'media',
    });
    const response = await r2Client.send(command);
    if (response.Contents) {
      console.log("=== R2 파일 목록 ===");
      response.Contents.forEach(file => {
        if (file.Key?.endsWith('.mp3')) {
          console.log(file.Key);
        }
      });
    } else {
      console.log("파일이 없습니다.");
    }
  } catch (err) {
    console.error("오류 발생:", err);
  }
}

listFiles();
