import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const dynamic = 'force-dynamic'

// 一人回しログの受け口（匿名・書き込み専用）。負荷/濫用対策で件数・サイズを制限。
function admin() {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !key) throw new Error('service role missing')
    return createClient(url, key)
}

export async function POST(req: NextRequest) {
    // 自サイト以外からの投げ込みを軽く弾く（完全ではないが濫用抑制）
    const origin = req.headers.get('origin') || ''
    if (origin && !/(^https?:\/\/localhost)|pokelix\.jp$/.test(origin)) {
        return NextResponse.json({ error: 'bad origin' }, { status: 403 })
    }
    let body: { session_id?: string; deck_code?: string; events?: unknown[]; meta?: Record<string, unknown> }
    try { body = await req.json() } catch { return NextResponse.json({ error: 'bad json' }, { status: 400 }) }

    const session_id = String(body.session_id || '').slice(0, 64)
    if (!session_id) return NextResponse.json({ error: 'session_id required' }, { status: 400 })
    const deck_code = body.deck_code ? String(body.deck_code).slice(0, 64) : null
    let events = Array.isArray(body.events) ? body.events : []
    if (events.length > 2000) events = events.slice(-2000)   // 上限
    const meta = (body.meta && typeof body.meta === 'object') ? body.meta : null
    if (events.length === 0) return NextResponse.json({ ok: true, skipped: true })

    try {
        await admin().from('practice_logs').insert({ session_id, deck_code, events, meta })
        return NextResponse.json({ ok: true, n: events.length })
    } catch (e) {
        return NextResponse.json({ error: 'insert failed', detail: String(e) }, { status: 500 })
    }
}
