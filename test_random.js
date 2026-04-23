require('dotenv').config({ path: '.env.local' });
const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function test() {
  const { count, error: countError } = await supabase
    .from('audio_files')
    .select('*', { count: 'exact', head: true });
  console.log("Count:", count, countError);

  const { data, error } = await supabase
    .from('audio_files')
    .select('*, tracks(genre, lyrics, modify)')
    .limit(1);
  console.log("Data:", JSON.stringify(data, null, 2));
  console.log("Error:", error);
}
test();
