const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function check() {
    const { data: globalData, error: gErr } = await supabase.from('global_card_stats').select('*').limit(5);
    console.log("Global Data:", globalData ? globalData.length : 0, gErr);
    
    const { data: archData, error: aErr } = await supabase.from('archetype_card_stats').select('*').limit(5);
    console.log("Arch Data:", archData ? archData.length : 0, aErr);
}
check();
