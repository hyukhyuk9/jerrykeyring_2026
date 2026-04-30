import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
