import { getFirebaseDb } from '@/lib/firebase/admin'

// タイトル別/おすすめデッキ（recommendedDecks/unionarena）を、既存UIが期待する形に整形して返す。
// Supabase制限中でも表示できる。データは GAS が公式サイトから同期する。

export type UnionRecommendedDeck = { id: string; deck_code: string | null; tag_code: string | null; deck_name: string | null; image_url: string | null }
export type UnionSeries = { tag_code: string; name: string; logo_url: string | null }

export async function getUnionRecommended(): Promise<{ recommendedDecks: UnionRecommendedDeck[]; series: UnionSeries[] }> {
    const db = getFirebaseDb()
    if (!db) return { recommendedDecks: [], series: [] }
    try {
        const snap = await db.collection('recommendedDecks').doc('unionarena').get()
        const data = snap.exists ? snap.data() : null
        const rawDecks = Array.isArray(data?.decks) ? (data!.decks as any[]) : []
        const rawSeries = Array.isArray(data?.series) ? (data!.series as any[]) : []
        const recommendedDecks: UnionRecommendedDeck[] = rawDecks.map(d => ({
            id: d.deckCode,
            deck_code: d.deckCode || null,
            tag_code: d.tagCode || null,
            deck_name: d.deckName || null,
            image_url: d.imageUrl || null,
        }))
        const series: UnionSeries[] = rawSeries.map(s => ({
            tag_code: s.tagCode,
            name: s.name || '',
            logo_url: s.logoUrl || null,
        }))
        return { recommendedDecks, series }
    } catch {
        return { recommendedDecks: [], series: [] }
    }
}
