
import { createClient } from '@supabase/supabase-js'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')

let env = {}
try {
    const envPath = path.join(rootDir, '.env.local')
    const envContent = fs.readFileSync(envPath, 'utf-8')
    envContent.split('\n').forEach(line => {
        const parts = line.split('=')
        if (parts.length >= 2) {
            env[parts[0].trim()] = parts.slice(1).join('=').trim().replace(/"/g, '')
        }
    })
} catch (e) { }

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseKey)

async function checkDuplicates() {
    console.log('Checking for duplicate Archetype Names...')
    const { data: archetypes } = await supabase.from('deck_archetypes').select('id, name')

    const nameMap = {}
    archetypes.forEach(a => {
        if (!nameMap[a.name]) nameMap[a.name] = []
        nameMap[a.name].push(a.id)
    })

    let found = false
    Object.entries(nameMap).forEach(([name, ids]) => {
        if (ids.length > 1) {
            console.log(`Duplicate: "${name}" -> IDs: ${ids.join(', ')}`)
            found = true
        }
    })

    if (!found) console.log('No duplicate names found.')
}

checkDuplicates()
