import { NextRequest, NextResponse } from 'next/server'
import { FieldValue } from 'firebase-admin/firestore'
import { getFirebaseDb } from '@/lib/firebase/admin'

// タイトル別/おすすめデッキ（公式サイトの投稿・おすすめギャラリー）を Firestore に保持する軽量ストア。
// カード画像はサムネイル(公式画像URL)のみ。書き込みは秘密ヘッダー必須、読み取りは公開。
// env-decks と同じ秘密（ENV_DECKS_SYNC_SECRET）を使う。

type RecDeck = { deckCode: string; tagCode: string; deckName: string; imageUrl: string }
type Series = { tagCode: string; name: string; logoUrl: string }

const MAX = 2000

const GAMES = ['pokemon', 'gundam', 'unionarena'] as const
type Game = (typeof GAMES)[number]
const normalizeGame = (value: unknown): Game => {
    const g = String(value ?? 'pokemon')
    return (GAMES as readonly string[]).includes(g) ? (g as Game) : 'pokemon'
}

const str = (v: unknown, max: number) => String(v ?? '').trim().slice(0, max)

const sanitizeDecks = (value: unknown): RecDeck[] => {
    if (!Array.isArray(value)) return []
    const seen = new Set<string>()
    const out: RecDeck[] = []
    for (const item of value) {
        if (!item || typeof item !== 'object') continue
        const r = item as Record<string, unknown>
        const deckCode = str(r.deckCode, 64)
        if (!deckCode || seen.has(deckCode)) continue
        seen.add(deckCode)
        out.push({
            deckCode,
            tagCode: str(r.tagCode, 32),
            deckName: str(r.deckName, 160),
            imageUrl: str(r.imageUrl, 400),
        })
        if (out.length >= MAX) break
    }
    return out
}

const sanitizeSeries = (value: unknown): Series[] => {
    if (!Array.isArray(value)) return []
    const seen = new Set<string>()
    const out: Series[] = []
    for (const item of value) {
        if (!item || typeof item !== 'object') continue
        const r = item as Record<string, unknown>
        const tagCode = str(r.tagCode, 32)
        if (!tagCode || seen.has(tagCode)) continue
        seen.add(tagCode)
        out.push({ tagCode, name: str(r.name, 160), logoUrl: str(r.logoUrl, 400) })
        if (out.length >= MAX) break
    }
    return out
}

const storeRef = (game: Game) => {
    const db = getFirebaseDb()
    if (!db) return null
    return db.collection('recommendedDecks').doc(game)
}

export async function GET(request: NextRequest) {
    const game = normalizeGame(request.nextUrl.searchParams.get('game'))
    const ref = storeRef(game)
    if (!ref) {
        return NextResponse.json({ ok: false, configured: false, decks: [], series: [], error: 'Firebase Admin is not configured' }, { status: 503 })
    }
    const snapshot = await ref.get()
    const data = snapshot.exists ? snapshot.data() : null
    return NextResponse.json({
        ok: true,
        configured: true,
        game,
        decks: sanitizeDecks(data?.decks),
        series: sanitizeSeries(data?.series),
        updatedAt: data?.updatedAt ?? null,
    })
}

export async function POST(request: NextRequest) {
    const secret = process.env.ENV_DECKS_SYNC_SECRET
    const provided = request.headers.get('x-env-decks-secret')
    if (!secret || provided !== secret) {
        return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json().catch(() => ({})) as Record<string, unknown>
    const game = normalizeGame(body.game)
    const ref = storeRef(game)
    if (!ref) {
        return NextResponse.json({ ok: false, configured: false, error: 'Firebase Admin is not configured' }, { status: 503 })
    }

    const decks = sanitizeDecks(body.decks)
    const series = sanitizeSeries(body.series)

    // decks / series は「指定された方だけ」洗い替え。未指定側は既存を保持（別々の関数から送れる）。
    const payload: Record<string, unknown> = { updatedAt: FieldValue.serverTimestamp() }
    if (Array.isArray(body.decks)) payload.decks = decks
    if (Array.isArray(body.series)) payload.series = series

    await ref.set(payload, { merge: true })

    return NextResponse.json({ ok: true, configured: true, game, count: decks.length, series: series.length })
}
