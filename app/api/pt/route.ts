import { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

// 一人回しテレメトリ中継。クライアントからは pokelix.jp/api/pt にだけ送られ、
// 実際の保存先(GASスプレッドシート)URLはここ(サーバー側)に隠す。
// 既定値をコードに持たせるので Vercel 環境変数なしでも本番稼働する（PRACTICE_LOG_URL で上書き可）。
const SINK = process.env.PRACTICE_LOG_URL
    || 'https://script.google.com/macros/s/AKfycbwAnlrG3zlNv4ef_hrp5GIU5KiA4hstJH4efLi9zKsulGLdoqarm-wAmN-ZkCyGacevvw/exec'

function noContent() { return new Response(null, { status: 204 }) }

export async function POST(req: NextRequest) {
    let body: { s?: string; d?: string | null; e?: unknown[]; m?: Record<string, unknown> }
    try { body = await req.json() } catch { return noContent() }
    const events = Array.isArray(body?.e) ? body.e : []
    if (!events.length) return noContent()

    // 保存先GASの契約に合わせて action を付与（クライアントには出さない）
    const outbound = JSON.stringify({
        action: 'practice_log',
        session_id: String(body.s || '').slice(0, 64),
        deck_code: body.d ? String(body.d).slice(0, 64) : null,
        events: events.length > 2000 ? events.slice(-2000) : events,
        meta: (body.m && typeof body.m === 'object') ? body.m : null,
    })
    try {
        await fetch(SINK, { method: 'POST', headers: { 'content-type': 'text/plain;charset=UTF-8' }, body: outbound })
    } catch { /* 失敗は握りつぶす */ }
    return noContent()
}
