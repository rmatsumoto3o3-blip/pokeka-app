import { NextRequest, NextResponse } from 'next/server'
import { FieldValue } from 'firebase-admin/firestore'
import { getFirebaseDb } from '@/lib/firebase/admin'

// 生デッキの恒久バックアップ倉庫。deckArchive/{game}/decks/{deckCode} に1デッキ1ドキュメント。
// 集計(採用率/使用率)はここから再計算できる。Supabaseに依存しない保険。
// 書き込みは秘密ヘッダー必須（ENV_DECKS_SYNC_SECRET を流用）。GETは件数のみ返す。

const GAMES = ['pokemon', 'gundam', 'unionarena'] as const
type Game = (typeof GAMES)[number]
const normalizeGame = (v: unknown): Game => {
    const g = String(v ?? 'pokemon')
    return (GAMES as readonly string[]).includes(g) ? (g as Game) : 'pokemon'
}

const str = (v: unknown, max: number) => String(v ?? '').trim().slice(0, max)

type ArchiveCard = { name: string; quantity: number; supertype?: string; subtypes?: string[] }

const sanitizeCards = (value: unknown): ArchiveCard[] => {
    if (!Array.isArray(value)) return []
    const out: ArchiveCard[] = []
    for (const c of value) {
        if (!c || typeof c !== 'object') continue
        const r = c as Record<string, unknown>
        const name = str(r.name, 80)
        const quantity = Math.max(0, parseInt(String(r.quantity ?? 0), 10) || 0)
        if (!name || quantity <= 0) continue
        const card: ArchiveCard = { name, quantity }
        if (r.supertype) card.supertype = str(r.supertype, 24)
        if (Array.isArray(r.subtypes)) card.subtypes = (r.subtypes as unknown[]).map(s => str(s, 40)).filter(Boolean).slice(0, 6)
        out.push(card)
        if (out.length >= 120) break // 1デッキ上限（安全）
    }
    return out
}

const colRef = (game: Game) => {
    const db = getFirebaseDb()
    if (!db) return null
    return db.collection('deckArchive').doc(game).collection('decks')
}

export async function GET(request: NextRequest) {
    const game = normalizeGame(request.nextUrl.searchParams.get('game'))
    const col = colRef(game)
    if (!col) return NextResponse.json({ ok: false, configured: false, error: 'Firebase Admin is not configured' }, { status: 503 })
    try {
        const snap = await col.count().get()
        return NextResponse.json({ ok: true, configured: true, game, count: snap.data().count })
    } catch (e) {
        return NextResponse.json({ ok: false, error: 'count failed' }, { status: 500 })
    }
}

export async function POST(request: NextRequest) {
    const secret = process.env.ENV_DECKS_SYNC_SECRET
    const provided = request.headers.get('x-env-decks-secret')
    if (!secret || provided !== secret) {
        return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
    }

    const db = getFirebaseDb()
    if (!db) return NextResponse.json({ ok: false, configured: false, error: 'Firebase Admin is not configured' }, { status: 503 })

    const body = await request.json().catch(() => ({})) as Record<string, unknown>
    const game = normalizeGame(body.game)
    const decks = Array.isArray(body.decks) ? body.decks : []
    const col = db.collection('deckArchive').doc(game).collection('decks')

    let written = 0
    // Firestore バッチは最大500件/コミット。安全に450で分割。
    const CHUNK = 450
    const valid = decks.filter(d => d && typeof d === 'object' && str((d as Record<string, unknown>).deckCode, 64))
    for (let i = 0; i < valid.length; i += CHUNK) {
        const batch = db.batch()
        for (const raw of valid.slice(i, i + CHUNK)) {
            const d = raw as Record<string, unknown>
            const deckCode = str(d.deckCode, 64)
            batch.set(col.doc(deckCode), {
                deckCode,
                archetypeId: str(d.archetypeId, 64) || null,
                archetype: str(d.archetype, 80) || null,
                eventRank: str(d.eventRank, 16) || null,
                eventDate: str(d.eventDate, 24) || null,
                eventLocation: str(d.eventLocation, 120) || null,
                createdAt: str(d.createdAt, 40) || null,
                cards: sanitizeCards(d.cards),
                updatedAt: FieldValue.serverTimestamp(),
            }, { merge: true })
            written++
        }
        await batch.commit()
    }

    return NextResponse.json({ ok: true, configured: true, game, written })
}
