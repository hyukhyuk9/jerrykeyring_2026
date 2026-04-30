const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const envPath = path.resolve(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const [key, value] = line.split('=');
  if (key && value) env[key.trim()] = value.trim();
});

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function listDbFiles() {
  try {
    const { data, error } = await supabase
      .from('audio_files')
      .select('audio_url');

    if (error) throw error;

    if (data) {
      console.log("=== DB에 등록된 음원 파일 목록 ===");
      data.forEach(item => {
        const url = item.audio_url;
        const filename = url.split('/').pop();
        console.log(filename);
      });
    }
  } catch (err) {
    console.error("오류 발생:", err.message);
  }
}

listDbFiles();
