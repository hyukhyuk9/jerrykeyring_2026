const { S3Client, ListObjectsV2Command } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) env[key.trim()] = value.trim();
});

let endpoint = env.R2_ENDPOINT;
if (endpoint && !endpoint.startsWith('http')) {
  endpoint = 'https://' + endpoint;
}

const r2Client = new S3Client({
  region: 'auto',
  endpoint: endpoint,
  credentials: {
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
  },
  forcePathStyle: true,
});

async function listFiles() {
  try {
    const command = new ListObjectsV2Command({
      Bucket: env.R2_BUCKET_NAME || 'media',
      Prefix: 'music/', // music 폴더만 조회
    });
    const response = await r2Client.send(command);
    if (response.Contents) {
      console.log("=== R2 music/ 폴더 파일 목록 ===");
      response.Contents.forEach(file => {
        if (file.Key.endsWith('.mp3')) {
          // music/123456.mp3 에서 파일명만 추출하거나 전체 경로 출력
          console.log(file.Key);
        }
      });
    } else {
      console.log("music/ 폴더에 파일이 없습니다.");
    }
  } catch (err) {
    console.error("오류 발생:", err.message);
  }
}

listFiles();
