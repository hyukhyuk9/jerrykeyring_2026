import { NextRequest, NextResponse } from 'next/server';
import { authenticateUser } from '@/lib/users';

export async function POST(request: NextRequest) {
  try {
    const { id, password } = await request.json();

    if (!id || !password) {
      return NextResponse.json({ error: 'ID와 비밀번호를 입력하세요.' }, { status: 400 });
    }

    const user = authenticateUser(id, password);
    if (!user) {
      return NextResponse.json({ error: 'ID 또는 비밀번호가 올바르지 않습니다.' }, { status: 401 });
    }

    // 토큰에 role 정보 포함
    const tokenData = JSON.stringify({ id: user.id, role: user.role, ts: Date.now() });
    const token = Buffer.from(tokenData).toString('base64');

    const response = NextResponse.json({
      success: true,
      role: user.role,
      id: user.id,
    });

    response.cookies.set('admin_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24, // 24시간
      path: '/',
    });

    return response;
  } catch {
    return NextResponse.json({ error: '인증 실패' }, { status: 500 });
  }
}
