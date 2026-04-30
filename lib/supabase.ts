import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// 빌드 시점에 환경 변수가 없어도 에러가 나지 않도록 처리
export const supabase = (supabaseUrl && supabaseAnonKey) 
  ? createClient(supabaseUrl, supabaseAnonKey) 
  : (null as any); // 빌드 시점에는 null 허용

export interface TrackRecord {
  id: number;
  nfc_id: string;
  user_name: string;
  genre: string;
  story: string;
  lyrics: string;
  phone_number: string;
  created_at: string;
}

export interface AudioFileRecord {
  id: number;
  nfc_id: string;
  audio_url: string;
  category: string;
  created_at: string;
}
