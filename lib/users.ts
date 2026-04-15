import fs from 'fs';
import path from 'path';

export interface AdminUser {
  id: string;
  password: string;
  role: 'master' | 'admin';
  createdAt: string;
}

const USERS_FILE = path.join(process.cwd(), 'data', 'users.json');

// 마스터 계정 (환경변수)
function getMasterAccount(): AdminUser {
  return {
    id: process.env.ADMIN_MASTER_ID || 'jerry',
    password: process.env.ADMIN_MASTER_PW || 'tom',
    role: 'master',
    createdAt: '2026-01-01',
  };
}

// 서브 계정 목록 읽기
function readUsers(): AdminUser[] {
  try {
    if (fs.existsSync(USERS_FILE)) {
      const data = fs.readFileSync(USERS_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error('Error reading users:', error);
  }
  return [];
}

// 서브 계정 목록 저장
function writeUsers(users: AdminUser[]): void {
  try {
    const dir = path.dirname(USERS_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf-8');
  } catch (error) {
    console.error('Error writing users:', error);
  }
}

// 전체 사용자 목록 (마스터 + 서브)
export function getAllUsers(): AdminUser[] {
  const master = getMasterAccount();
  const subs = readUsers();
  return [master, ...subs];
}

// 로그인 검증
export function authenticateUser(id: string, password: string): AdminUser | null {
  const master = getMasterAccount();
  if (id === master.id && password === master.password) {
    return master;
  }

  const subs = readUsers();
  const user = subs.find(u => u.id === id && u.password === password);
  return user || null;
}

// 사용자 추가 (마스터만)
export function addUser(id: string, password: string): { success: boolean; error?: string } {
  const master = getMasterAccount();
  if (id === master.id) {
    return { success: false, error: '마스터 계정 ID와 동일할 수 없습니다.' };
  }

  const users = readUsers();
  if (users.find(u => u.id === id)) {
    return { success: false, error: '이미 존재하는 ID입니다.' };
  }

  users.push({
    id,
    password,
    role: 'admin',
    createdAt: new Date().toISOString().split('T')[0],
  });

  writeUsers(users);
  return { success: true };
}

// 사용자 삭제 (마스터만)
export function deleteUser(id: string): { success: boolean; error?: string } {
  const master = getMasterAccount();
  if (id === master.id) {
    return { success: false, error: '마스터 계정은 삭제할 수 없습니다.' };
  }

  const users = readUsers();
  const filtered = users.filter(u => u.id !== id);

  if (filtered.length === users.length) {
    return { success: false, error: '존재하지 않는 ID입니다.' };
  }

  writeUsers(filtered);
  return { success: true };
}

// 비밀번호 변경
export function changePassword(id: string, newPassword: string): { success: boolean; error?: string } {
  const master = getMasterAccount();
  if (id === master.id) {
    return { success: false, error: '마스터 비밀번호는 환경변수에서 변경하세요.' };
  }

  const users = readUsers();
  const user = users.find(u => u.id === id);
  if (!user) {
    return { success: false, error: '존재하지 않는 ID입니다.' };
  }

  user.password = newPassword;
  writeUsers(users);
  return { success: true };
}
