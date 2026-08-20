import { unstable_cache } from 'next/cache'
import { getFirebaseDb } from '@/lib/firebase/admin'
import { fetchGundamDeckData } from '@/lib/gundamDeckParser'

// ガンダム環境デッキ（Firebase）とカード画像展開の共有ヘルパ。
// /gundam・/gundam/decks の両方から使う。カードは bandai をコード展開（Supabase非依存）。

export type GundamEnvDeck = { deckCode: string; archetype: string; eventName: string; eventDate: string; rank: string }

export async function getGundamEnvDecks(): Promise<GundamEnvDeck[]> {
    const db = getFirebaseDb()
    if (!db) return []
    try {
        const snap = await db.collection('environmentDecks').doc('gundam').get()
        const data = snap.exists ? snap.data() : null
        return Array.isArray(data?.decks) ? (data!.decks as GundamEnvDeck[]) : []
    } catch { return [] }
}

// 同時実行数を絞って順に処理（bandai/公式への一斉アクセスを避ける）
async function mapLimit<T, R>(items: T[], limit: number, fn: (item: T) => Promise<R>): Promise<R[]> {
    const out: R[] = new Array(items.length)
    let i = 0
    async function worker() {
        while (i < items.length) {
            const idx = i++
            try { out[idx] = await fn(items[idx]) } catch { out[idx] = undefined as unknown as R }
        }
    }
    await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker))
    return out
}

// deckCode → 代表カード画像（枚数が多い＝デッキの主役を優先）。全環境デッキ分・24hキャッシュ。
export const getGundamDeckImages = unstable_cache(
    async (): Promise<Record<string, string>> => {
        const decks = await getGundamEnvDecks()
        const codes = Array.from(new Set(decks.map(d => d.deckCode).filter(Boolean)))
        const pairs = await mapLimit(codes, 8, async (code): Promise<[string, string] | null> => {
            try {
                const data = await fetchGundamDeckData(code)
                const cards = (data.mainDeck || []).filter(c => c.imageUrl)
                if (!cards.length) return null
                const rep = cards.slice().sort((a, b) => (b.quantity || 0) - (a.quantity || 0))[0]
                return [code, rep.imageUrl]
            } catch { return null }
        })
        const out: Record<string, string> = {}
        for (const p of pairs) if (p) out[p[0]] = p[1]
        return out
    },
    ['gundam-deck-images-v1'],
    { revalidate: 86400 },
)
