const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read .env.local manually
const envPath = path.resolve(__dirname, '.env.local');
let supabaseUrl = '';
let supabaseKey = '';

try {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');
    for (const line of lines) {
        if (line.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
            supabaseUrl = line.split('=')[1].trim();
        }
        if (line.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) {
            supabaseKey = line.split('=')[1].trim();
        }
    }
} catch (err) {
    console.error('Error reading .env.local:', err.message);
    process.exit(1);
}

if (!supabaseUrl || !supabaseKey) {
    console.error('Error: Missing environment variables in .env.local');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkStorage() {
    console.log('Checking Supabase Storage connection...');
    console.log('URL:', supabaseUrl);

    // 1. List buckets
    const { data: buckets, error } = await supabase.storage.listBuckets();

    if (error) {
        console.error('Error listing buckets:', error.message);
        return;
    }

    console.log('Buckets found:', buckets.map(b => `${b.name} (public: ${b.public})`));

    const deckImagesBucket = buckets.find(b => b.name === 'deck-images');

    if (!deckImagesBucket) {
        console.error('❌ CRITICAL: "deck-images" bucket NOT found!');
        console.log('Please create a new public bucket named "deck-images" in your Supabase dashboard.');
    } else {
        console.log('✅ "deck-images" bucket found.');
        if (!deckImagesBucket.public) {
            console.error('❌ CRITICAL: "deck-images" bucket is NOT public!');
            console.log('Please go to Storage > Buckets > deck-images > Edit Bucket and check "Public bucket".');
        } else {
            console.log('✅ "deck-images" bucket is public.');
            console.log('Storage setup looks correct.');
        }
    }
}

checkStorage();
