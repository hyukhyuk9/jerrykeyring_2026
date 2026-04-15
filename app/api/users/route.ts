import { NextRequest, NextResponse } from 'next/server';
import { getAllUsers, addUser, deleteUser } from '@/lib/users';

// 토큰에서 사용자 정보 추출
function getUserFromToken(request: NextRequest): { id: string; role: string } | null {
  const token = request.cookies.get('admin_token')?.value;
  if (!token) return null;
  try {
    const decoded = Buffer.from(token, 'base64').toString();
    const data = JSON.parse(decoded);
    if (data.id && data.role) return data;
    return null;
  } catch {
    return null;
  }
}

// GET: 사용자 목록 (마스터만)
export async function GET(request: NextRequest) {
  const user = getUserFromToken(request);
  if (!user || user.role !== 'master') {
    return NextResponse.json({ error: '마스터 권한이 필요합니다.' }, { status: 403 });
  }

  const users = getAllUsers().map(u => ({
    id: u.id,
    role: u.role,
    createdAt: u.createdAt,
  }));

  return NextResponse.json({ data: users });
}

// POST: 사용자 추가 (마스터만)
export async function POST(request: NextRequest) {
  const user = getUserFromToken(request);
  if (!user || user.role !== 'master') {
    return NextResponse.json({ error: '마스터 권한이 필요합니다.' }, { status: 403 });
  }

  try {
    const { id, password } = await request.json();

    if (!id || !password) {
      return NextResponse.json({ error: 'ID와 비밀번호를 입력하세요.' }, { status: 400 });
    }

    if (id.length < 2 || password.length < 2) {
      return NextResponse.json({ error: 'ID와 비밀번호는 2자 이상이어야 합니다.' }, { status: 400 });
    }

    const result = addUser(id, password);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: `계정 "${id}"가 생성되었습니다.` });
  } catch {
    return NextResponse.json({ error: '계정 생성 실패' }, { status: 500 });
  }
}

// DELETE: 사용자 삭제 (마스터만)
export async function DELETE(request: NextRequest) {
  const user = getUserFromToken(request);
  if (!user || user.role !== 'master') {
    return NextResponse.json({ error: '마스터 권한이 필요합니다.' }, { status: 403 });
  }

  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: '삭제할 ID를 입력하세요.' }, { status: 400 });
    }

    const result = deleteUser(id);
    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: `계정 "${id}"가 삭제되었습니다.` });
  } catch {
    return NextResponse.json({ error: '계정 삭제 실패' }, { status: 500 });
  }
}
