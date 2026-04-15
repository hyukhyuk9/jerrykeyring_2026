import { NextRequest, NextResponse } from 'next/server';
import { fetchSheetData, sanitizeForClient } from '@/lib/sheets';

// Rate limiting (간단한 메모리 기반)
const rateLimit = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 30; // 분당 30회
const WINDOW_MS = 60 * 1000;

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const record = rateLimit.get(ip);

  if (!record || now > record.resetTime) {
    rateLimit.set(ip, { count: 1, resetTime: now + WINDOW_MS });
    return true;
  }

  if (record.count >= RATE_LIMIT) {
    return false;
  }

  record.count++;
  return true;
}

export async function GET(request: NextRequest) {
  // Rate limiting
  const ip = request.headers.get('x-forwarded-for') || 'unknown';
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ error: '요청이 너무 많습니다.' }, { status: 429 });
  }

  const nfc = request.nextUrl.searchParams.get('nfc');

  try {
    const data = await fetchSheetData();

    if (nfc) {
      // 특정 NFC ID 조회
      const track = data.find(d => d.nfc === nfc);
      if (!track) {
        return NextResponse.json({ data: null });
      }
      return NextResponse.json({ data: sanitizeForClient(track) });
    }

    // 전체 목록 (관리자용 - 개인정보 포함된 버전은 인증 필요)
    const sanitized = data.map(sanitizeForClient);
    return NextResponse.json({ data: sanitized });
  } catch (error) {
    console.error('Tracks API error:', error);
    return NextResponse.json({ error: '데이터 조회 실패' }, { status: 500 });
  }
}
