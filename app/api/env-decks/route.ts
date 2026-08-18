import { NextRequest, NextResponse } from 'next/server'
import { FieldValue } from 'firebase-admin/firestore'
import { getFirebaseDb } from '@/lib/firebase/admin'

// 環境デッキ（大会名＋デッキコード＋日付＋順位）を Firestore に保持する軽量ストア。
// カード画像は含めない（＝Supabase egress ゼロ）。カードはデッキコードから展開する。
// 書き込みは GAS 等のバックエンドのみ（秘密ヘッダー必須）。読み取りは公開。

type EnvDeck = {
    deckCode: string
    archetype: string
    eventName: string
    eventDate: string // 'YYYY-MM-DD' など任意の文字列
    rank: string      // 優勝 / 準優勝 / TOP4 / TOP8 / その他
}

const MAX_DECKS = 3000 // 1ドキュメント(1MB)に収めるための上限

const GAMES = ['pokemon', 'gundam', 'unionarena'] as const
type Game = (typeof GAMES)[number]
const normalizeGame = (value: unknown): Game => {
    const g = String(value ?? 'pokemon')
    return (GAMES as readonly string[]).includes(g) ? (g as Game) : 'pokemon'
}

const str = (v: unknown, max: number) => String(v ?? '').trim().slice(0, max)

const sanitizeDecks = (value: unknown): EnvDeck[] => {
    if (!Array.isArray(value)) return []
    const seen = new Set<string>()
    const out: EnvDeck[] = []
    for (const item of value) {
        if (!item || typeof item !== 'object') continue
        const r = item as Record<string, unknown>
        const deckCode = str(r.deckCode, 64)
        if (!deckCode || seen.has(deckCode)) continue // deck_code は不変キー・重複排除
        seen.add(deckCode)
        out.push({
            deckCode,
            archetype: str(r.archetype, 80),
            eventName: str(r.eventName, 120),
            eventDate: str(r.eventDate, 24),
            rank: str(r.rank, 16),
        })
        if (out.length >= MAX_DECKS) break
    }
    return out
}

const storeRef = (game: Game) => {
    const db = getFirebaseDb()
    if (!db) return null
    return db.collection('environmentDecks').doc(game)
}

export async function GET(request: NextRequest) {
    const game = normalizeGame(request.nextUrl.searchParams.get('game'))
    const ref = storeRef(game)
    if (!ref) {
        return NextResponse.json({ ok: false, configured: false, decks: [], error: 'Firebase Admin is not configured' }, { status: 503 })
    }
    const snapshot = await ref.get()
    const data = snapshot.exists ? snapshot.data() : null
    return NextResponse.json({
        ok: true,
        configured: true,
        game,
        decks: sanitizeDecks(data?.decks),
        updatedAt: data?.updatedAt ?? null,
    })
}

export async function POST(request: NextRequest) {
    // 書き込みは秘密ヘッダー必須（公開ユーザーに大会データを書かせない）
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

    // 全件洗い替え（GAS の同期流儀に一致）
    await ref.set({
        decks,
        updatedAt: FieldValue.serverTimestamp(),
    })

    return NextResponse.json({ ok: true, configured: true, game, count: decks.length })
}
