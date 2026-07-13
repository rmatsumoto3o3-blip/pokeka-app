import type { Metadata } from 'next'
import UnionArenaLandingPage from '@/components/UnionArenaLandingPage'
import { getUnionArenaArchetypesAction, getUnionArenaDeckRecordsAction, getUnionArenaWeeklyRankingAction, getUnionArenaSeriesAction, getUnionArenaRecommendedDecksAction } from '@/app/actions'

export const metadata: Metadata = {
    title: 'ユニアリ環境デッキ・Tier表 | PokéLix（ポケリス）',
    description: 'ユニアリ（ユニオンアリーナ）の大会入賞デッキデータをもとにした環境Tier表・優勝デッキ集。',
    alternates: {
        canonical: 'https://pokelix.jp/unionarena',
    },
}

export const revalidate = 60

export default async function UnionArenaPage() {
    const [archetypesRes, decksRes, weeklyRankingRes, seriesRes, recommendedRes] = await Promise.all([
        getUnionArenaArchetypesAction(),
        getUnionArenaDeckRecordsAction(),
        getUnionArenaWeeklyRankingAction(),
        getUnionArenaSeriesAction(),
        getUnionArenaRecommendedDecksAction(),
    ])
    const weeklyRanking = weeklyRankingRes.data || {}

    // 直近7日間のデッキ数が多い順にアーキタイプをソート
    const sortedArchetypes = [...(archetypesRes.data || [])].sort(
        (a, b) => (weeklyRanking[b.id] || 0) - (weeklyRanking[a.id] || 0)
    )

    return (
        <UnionArenaLandingPage
            archetypes={sortedArchetypes}
            decks={decksRes.data || []}
            weeklyRanking={weeklyRanking}
            series={seriesRes.data || []}
            recommendedDecks={recommendedRes.data || []}
        />
    )
}
