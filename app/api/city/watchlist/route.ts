import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import { loadWatchlistDB, saveWatchlistDB } from '@/lib/cityStore'

export const dynamic = 'force-dynamic'
const ADMIN_EMAILS = ['player1@pokeka.local']

async function authed(): Promise<boolean> {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        return !!user?.email && ADMIN_EMAILS.includes(user.email)
    } catch { return false }
}

export async function GET() {
    if (!(await authed())) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    return NextResponse.json({ cards: await loadWatchlistDB() })
}

// 注目カードを全置き換え。{ cards: ["ボスの指令", ...] }
export async function POST(req: NextRequest) {
    if (!(await authed())) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    let body: { cards?: string[] }
    try { body = await req.json() } catch { return NextResponse.json({ error: 'bad json' }, { status: 400 }) }
    try {
        await saveWatchlistDB(Array.isArray(body.cards) ? body.cards : [])
        revalidatePath('/city')
        return NextResponse.json({ ok: true, count: (body.cards || []).length })
    } catch (e) {
        return NextResponse.json({ error: 'save failed', detail: String(e) }, { status: 500 })
    }
}
