import type { Metadata } from 'next'
import GundamLandingPage from '@/components/GundamLandingPage'
import { getGundamSeriesAction, getGundamRecommendedDecksAction } from '@/app/actions'
import { getGundamEnvDecks, getGundamDeckImages } from '@/lib/gundamEnv'
import type { GundamDeckRecord, GundamDeckArchetype } from '@/lib/supabase'

export const metadata: Metadata = {
    title: 'ガンダムカード 環境・Tier表【最新】',
    description: 'ガンダムカードゲーム（GCG）の最新環境Tier表。大会入賞デッキデータをもとにしたTierランキング・優勝デッキ集を無料で確認できます。',
    alternates: {
        canonical: 'https://www.pokelix.jp/gundam',
    },
}

export const revalidate = 3600

export default async function GundamPage() {
    const envDecks = await getGundamEnvDecks()
    const [images, seriesRes, recommendedRes] = await Promise.all([
        getGundamDeckImages(),
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
            thumbnail_url: images[d.deckCode] || null,
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
