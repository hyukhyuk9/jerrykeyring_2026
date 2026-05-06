import { S3Client, HeadObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';

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
  if (!r2Client) return null;
  try {
    const command = new HeadObjectCommand({
      Bucket: BUCKET_NAME,
      Key: filename,
    });
    await r2Client.send(command);
    
    // 파일이 존재하면 공개 URL 반환
    return `${PUBLIC_DOMAIN}/${filename}`;
  } catch (error) {
    return null;
  }
}

/**
 * R2에 파일을 업로드합니다.
 */
export async function uploadToR2(filename: string, body: Buffer | Uint8Array, contentType: string = 'audio/mpeg'): Promise<string | null> {
  if (!r2Client) return null;
  try {
    const command = new PutObjectCommand({
      Bucket: BUCKET_NAME,
      Key: filename,
      Body: body,
      ContentType: contentType,
    });
    await r2Client.send(command);
    return `${PUBLIC_DOMAIN}/${filename}`;
  } catch (error) {
    console.error('[R2 Upload Error]:', error);
    return null;
  }
}

/**
 * NFC ID를 기반으로 규칙에 맞는 파일들을 모두 찾습니다.
 */
export async function getTrackFiles(nfcId: string): Promise<string[]> {
  const foundUrls: string[] = [];
  const defaultUrl = await getAudioFileUrl(`music/${nfcId}.mp3`);
  if (defaultUrl) foundUrls.push(defaultUrl);
  
  for (let i = 1; i <= 5; i++) {
    const url = await getAudioFileUrl(`music/${nfcId}-${i}.mp3`);
    if (url) foundUrls.push(url);
  }
  
  return foundUrls;
}
