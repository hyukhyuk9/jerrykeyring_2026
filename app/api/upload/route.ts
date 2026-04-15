import { NextRequest, NextResponse } from 'next/server';
import { fetchSheetData } from '@/lib/sheets';

// 관리자 인증 확인
function isAuthenticated(request: NextRequest): boolean {
  const token = request.cookies.get('admin_token')?.value;
  if (!token) return false;
  try {
    const decoded = Buffer.from(token, 'base64').toString();
    return decoded.startsWith('admin:');
  } catch {
    return false;
  }
}

export async function GET(request: NextRequest) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }

  try {
    const data = await fetchSheetData();
    // 관리자에게는 전체 데이터 반환 (이름, 장르, 상태 등)
    const adminData = data.map(d => ({
      nfc: d.nfc,
      name: d.name,
      genre: d.genre,
      status: d.status,
      date: d.date,
      hasLyrics: !!d.lyrics,
      lyrics: d.lyrics,
    }));

    return NextResponse.json({ data: adminData });
  } catch (error) {
    console.error('Admin tracks error:', error);
    return NextResponse.json({ error: '데이터 조회 실패' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  if (!isAuthenticated(request)) {
    return NextResponse.json({ error: '인증이 필요합니다.' }, { status: 401 });
  }

  // 파일 업로드 처리 (향후 Vercel Blob 연동)
  try {
    const formData = await request.formData();
    const nfcId = formData.get('nfcId') as string;
    const files = formData.getAll('files') as File[];

    if (!nfcId || files.length === 0) {
      return NextResponse.json({ error: 'NFC ID와 파일이 필요합니다.' }, { status: 400 });
    }

    // TODO: Vercel Blob 업로드 구현
    // const uploadedUrls = [];
    // for (const file of files) {
    //   const blob = await put(`music/${nfcId}-${i}.mp3`, file, { access: 'public' });
    //   uploadedUrls.push(blob.url);
    // }

    return NextResponse.json({
      success: true,
      message: `${files.length}개 파일이 업로드되었습니다. (Vercel Blob 연동 후 활성화)`,
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: '업로드 실패' }, { status: 500 });
  }
}
