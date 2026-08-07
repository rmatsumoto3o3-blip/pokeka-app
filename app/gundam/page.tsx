import type { Metadata } from 'next'
import GundamLandingPage from '@/components/GundamLandingPage'
import { getGundamArchetypesAction, getGundamDeckRecordsAction, getGundamWeeklyRankingAction, getGundamSeriesAction, getGundamRecommendedDecksAction } from '@/app/actions'

export const metadata: Metadata = {
    title: 'ガンダム環境デッキ・Tier表 | PokéLix（ポケリス）',
    description: 'ガンダム（ガンダムカードゲーム）の大会入賞デッキデータをもとにした環境Tier表・優勝デッキ集。',
    alternates: {
        canonical: 'https://www.pokelix.jp/gundam',
    },
}

export const revalidate = 60

export default async function GundamPage() {
    const [archetypesRes, decksRes, weeklyRankingRes, seriesRes, recommendedRes] = await Promise.all([
        getGundamArchetypesAction(),
        getGundamDeckRecordsAction(),
        getGundamWeeklyRankingAction(),
        getGundamSeriesAction(),
        getGundamRecommendedDecksAction(),
    ])
    const weeklyRanking = weeklyRankingRes.data || {}

    // 直近7日間のデッキ数が多い順にアーキタイプをソート
    const sortedArchetypes = [...(archetypesRes.data || [])].sort(
        (a, b) => (weeklyRanking[b.id] || 0) - (weeklyRanking[a.id] || 0)
    )

    return (
        <GundamLandingPage
            archetypes={sortedArchetypes}
            decks={decksRes.data || []}
            weeklyRanking={weeklyRanking}
            series={seriesRes.data || []}
            recommendedDecks={recommendedRes.data || []}
        />
    )
}
