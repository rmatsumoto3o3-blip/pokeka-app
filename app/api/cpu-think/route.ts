import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// CPUの思考中継。クライアント→自サイト→GAS(action:"think")。GAS URLはサーバー側に隠す。
const SINK = process.env.PRACTICE_LOG_URL
    || 'https://script.google.com/macros/s/AKfycbwAnlrG3zlNv4ef_hrp5GIU5KiA4hstJH4efLi9zKsulGLdoqarm-wAmN-ZkCyGacevvw/exec'

export async function POST(req: NextRequest) {
    let body: { state?: unknown; legalMoves?: unknown[] }
    try { body = await req.json() } catch { return NextResponse.json({ ok: false, error: 'bad json' }, { status: 400 }) }
    const moves = Array.isArray(body.legalMoves) ? body.legalMoves : []
    if (!moves.length) return NextResponse.json({ ok: true, moveIndex: -1, reason: '合法手なし' })
    try {
        const res = await fetch(SINK, {
            method: 'POST',
            headers: { 'content-type': 'text/plain;charset=UTF-8' },
            body: JSON.stringify({ action: 'think', state: body.state || {}, legalMoves: moves }),
        })
        const json = await res.json().catch(() => null)
        if (json && typeof json.moveIndex === 'number') return NextResponse.json(json)
    } catch { /* フォールバックへ */ }
    // GAS不通時のフォールバック：ローカルで簡易採点（止まらないように）
    const idx = localPick(moves as Move[])
    return NextResponse.json({ ok: true, moveIndex: idx.i, reason: idx.reason + '(ローカル)', fallback: true })
}

type Move = { type: string; damage?: number; koTarget?: boolean; toAttacker?: boolean; cost?: number }
function localPick(moves: Move[]) {
    const W: Record<string, number> = { attack: 30, attachEnergy: 12, evolve: 14, bench: 6, draw: 8, pass: -50 }
    let best = -Infinity, bi = 0, reason = ''
    moves.forEach((m, i) => {
        let s = W[m.type] ?? 1
        if (m.type === 'attack') { s = (m.damage || 0) * 0.3 + (m.koTarget ? 100 : 0) }
        if (m.type === 'attachEnergy' && m.toAttacker) s += 4
        if (s > best) { best = s; bi = i; reason = m.type }
    })
    return { i: bi, reason }
}
