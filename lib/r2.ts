import { S3Client, HeadObjectCommand } from '@aws-sdk/client-s3';

const r2Endpoint = process.env.R2_ENDPOINT;
const r2AccessKey = process.env.R2_ACCESS_KEY_ID;
const r2SecretKey = process.env.R2_SECRET_ACCESS_KEY;

const r2Client = (r2Endpoint && r2AccessKey && r2SecretKey) 
  ? new S3Client({
      region: 'auto',
      endpoint: r2Endpoint,
      credentials: {
        accessKeyId: r2AccessKey,
        secretAccessKey: r2SecretKey,
      },
    })
  : (null as any);

const BUCKET_NAME = process.env.R2_BUCKET_NAME || 'media';
const PUBLIC_DOMAIN = process.env.R2_PUBLIC_DOMAIN || '';

/**
 * R2에 특정 파일이 존재하는지 확인하고 공개 URL을 반환합니다.
 */
export async function getAudioFileUrl(filename: string): Promise<string | null> {
  try {
    const command = new HeadObjectCommand({
      Bucket: BUCKET_NAME,
      Key: filename,
    });
    await r2Client.send(command);
    
    // 파일이 존재하면 공개 URL 반환
    return `${PUBLIC_DOMAIN}/${filename}`;
  } catch (error) {
    // 404 에러 등 파일이 없는 경우 null 반환
    return null;
  }
}

/**
 * NFC ID를 기반으로 규칙에 맞는 파일들을 모두 찾습니다.
 * nfc.mp3, nfc-1.mp3, nfc-2.mp3 ...
 */
export async function getTrackFiles(nfcId: string): Promise<string[]> {
  const foundUrls: string[] = [];
  
  // 1. 기본 파일 (nfc.mp3)
  const defaultUrl = await getAudioFileUrl(`${nfcId}.mp3`);
  if (defaultUrl) foundUrls.push(defaultUrl);
  
  // 2. 추가 파일 (nfc-1.mp3 ~ nfc-10.mp3) - 중간에 번호가 비어도 끝까지 체크
  for (let i = 1; i <= 10; i++) {
    const url = await getAudioFileUrl(`${nfcId}-${i}.mp3`);
    if (url) {
      foundUrls.push(url);
    }
  }
  
  return foundUrls;
}
