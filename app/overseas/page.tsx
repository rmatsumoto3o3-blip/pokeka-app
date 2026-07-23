import type { Metadata } from 'next'
import PublicHeader from '@/components/PublicHeader'
import Footer from '@/components/Footer'
import OverseasLandingPage from '@/components/OverseasLandingPage'
import { getOverseasArchetypes, getOverseasArchetypeStats, getOverseasResults, getOverseasTournaments } from '@/lib/overseasData'

export const revalidate = 86400

export const metadata: Metadata = {
    title: '海外ポケカ大会・環境データ | PokéLix（ポケリス）',
    description: '海外ポケモンカード大会の結果、環境シェア、英語カードリストを地域別に確認できます。',
    alternates: { canonical: 'https://pokelix.jp/overseas' },
    robots: { index: false, follow: false },
}

export default async function OverseasPage() {
    const [archetypes, stats, tournaments, results] = await Promise.all([
        getOverseasArchetypes(),
        getOverseasArchetypeStats(),
        getOverseasTournaments(),
        getOverseasResults(),
    ])
    return <div className="min-h-screen bg-[#f4f6fa] text-gray-900"><PublicHeader game="overseas" /><OverseasLandingPage archetypes={archetypes} stats={stats} tournaments={tournaments} results={results} /><Footer game="pokemon" /></div>
}
