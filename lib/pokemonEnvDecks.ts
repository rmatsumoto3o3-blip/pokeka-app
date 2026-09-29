import { getFirebaseDb } from '@/lib/firebase/admin'
import { buildCityEnvDecks, type EnvDeckLike } from '@/lib/cityStore'

export type EnvDeck = { deckCode: string; archetype: string; eventName: string; eventDate: string; rank: string }

// 既存の環境デッキ（月別シート→GAS→Firebase/pokemon）。ローカル等でFirebase未設定なら本番の公開APIにフォールバック。
async function loadBaseEnvDecks(): Promise<EnvDeck[]> {
    try {
        const db = getFirebaseDb()
        if (db) {
            const snap = await db.collection('environmentDecks').doc('pokemon').get()
            const decks = Array.isArray(snap.data()?.decks) ? (snap.data()!.decks as EnvDeck[]) : []
            if (decks.length) return decks
        }
    } catch { /* fallthrough */ }
    try {
        const res = await fetch('https://www.pokelix.jp/api/env-decks?game=pokemon', { next: { revalidate: 3600 } })
        const json = await res.json().catch(() => ({}))
        return Array.isArray(json?.decks) ? (json.decks as EnvDeck[]) : []
    } catch { return [] }
}

// 既存 ＋ シティリーグ（Supabase由来・キャッシュ）を合体して返す。全セクション共通の入口。
export async function loadMergedPokemonEnvDecks(): Promise<EnvDeck[]> {
    const [base, city] = await Promise.all([loadBaseEnvDecks(), buildCityEnvDecks().catch(() => [] as EnvDeckLike[])])
    return [...base, ...city]
}
