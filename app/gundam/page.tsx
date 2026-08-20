import type { Metadata } from 'next'
import GundamLandingPage from '@/components/GundamLandingPage'
import { getGundamSeriesAction, getGundamRecommendedDecksAction } from '@/app/actions'
import { getFirebaseDb } from '@/lib/firebase/admin'
import type { GundamDeckRecord, GundamDeckArchetype } from '@/lib/supabase'

export const metadata: Metadata = {
    title: 'ガンダム環境デッキ・Tier表 | PokéLix（ポケリス）',
    description: 'ガンダム（ガンダムカードゲーム）の大会入賞デッキデータをもとにした環境Tier表・優勝デッキ集。',
    alternates: {
        canonical: 'https://www.pokelix.jp/gundam',
    },
}

export const revalidate = 3600

// Firebase（environmentDecks/gundam）由来。Supabase制限中でも表示できる。
// ガンダムのアーキタイプは色（例: 白 / 白緑）で、GundamColorIcon が name から描画する。
type EnvDeck = { deckCode: string; archetype: string; eventName: string; eventDate: string; rank: string }

async function getGundamEnvDecks(): Promise<EnvDeck[]> {
    const db = getFirebaseDb()
    if (!db) return []
    try {
        const snap = await db.collection('environmentDecks').doc('gundam').get()
        const data = snap.exists ? snap.data() : null
        return Array.isArray(data?.decks) ? (data!.decks as EnvDeck[]) : []
    } catch { return [] }
}

export default async function GundamPage() {
    const envDecks = await getGundamEnvDecks()
    const [seriesRes, recommendedRes] = await Promise.all([
        getGundamSeriesAction(),
        getGundamRecommendedDecksAction(),
    ])

    const counts = new Map<string, number>()
    for (const d of envDecks) {
        const a = (d.archetype || '').trim()
        if (a) counts.set(a, (counts.get(a) || 0) + 1)
    }

    const archetypes: GundamDeckArchetype[] = [...counts.entries()]
        .sort((x, y) => y[1] - x[1])
        .map(([name], i) => ({ id: name, name, display_order: i, cover_image_url: null, created_at: '' }))

    const weeklyRanking: Record<string, number> = {}
    for (const [name, n] of counts) weeklyRanking[name] = n

    const decks: GundamDeckRecord[] = envDecks.map(d => {
        const arch = (d.archetype || '').trim() || null
        return {
            id: d.deckCode,
            deck_code: d.deckCode,
            event_rank: d.rank || null,
            event_date: d.eventDate || null,
            event_location: d.eventName || null,
            archetype_id: arch,
            color: arch,
            deck_name: arch,
            thumbnail_url: null,
            icon_urls: null,
            created_at: '',
        }
    })

    return (
        <GundamLandingPage
            archetypes={archetypes}
            decks={decks}
            weeklyRanking={weeklyRanking}
            series={seriesRes.data || []}
            recommendedDecks={recommendedRes.data || []}
        />
    )
}
