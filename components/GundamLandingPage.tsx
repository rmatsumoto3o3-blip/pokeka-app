'use client'

import Link from 'next/link'
import Image from 'next/image'
import Footer from '@/components/Footer'
import type { GundamDeckRecord, GundamDeckArchetype } from '@/lib/supabase'

import PublicHeader from '@/components/PublicHeader'
import AdPlaceholder from '@/components/AdPlaceholder'
import ToygerPromo from '@/components/ToygerPromo'
import GundamColorIcon from '@/components/GundamColorIcon'
import GundamDeckIcon from '@/components/GundamDeckIcon'
import { Ico } from '@/components/Icons'

interface GundamSeries {
    tag_code: string
    name: string
    logo_url: string | null
}

interface GundamRecommendedDeck {
    id: string
    deck_code: string | null
    tag_code: string | null
    deck_name: string | null
    image_url: string | null
}

interface GundamLandingPageProps {
    decks: GundamDeckRecord[]
    archetypes: GundamDeckArchetype[]
    weeklyRanking?: Record<string, number>
    series?: GundamSeries[]
    recommendedDecks?: GundamRecommendedDeck[]
}

const TIER_STYLE: Record<string, { badge: string; label: string; text: string }> = {
    S: { badge: 'bg-red-600', label: 'Sランク', text: 'text-red-600' },
    A: { badge: 'bg-orange-500', label: 'Aランク', text: 'text-orange-600' },
    B: { badge: 'bg-lime-600', label: 'Bランク', text: 'text-lime-700' },
}

export default function GundamLandingPage({ decks, archetypes, weeklyRanking = {}, series = [], recommendedDecks = [] }: GundamLandingPageProps) {
    const archetypeMap = new Map(archetypes.map(a => [a.id, a]))

    // 直近7日間の実デッキ数（weeklyRanking）に基づく環境Tier表。データが無いアーキタイプは除外。
    const rankedArchetypes = archetypes
        .filter(a => (weeklyRanking[a.id] || 0) > 0)
        .slice(0, 10)
    const totalRecentDecks = Object.values(weeklyRanking).reduce((a, b) => a + b, 0)

    const tierBuckets: { tier: 'S' | 'A' | 'B'; items: GundamDeckArchetype[] }[] = [
        { tier: 'S' as const, items: rankedArchetypes.slice(0, 2) },
        { tier: 'A' as const, items: rankedArchetypes.slice(2, 6) },
        { tier: 'B' as const, items: rankedArchetypes.slice(6, 10) },
    ].filter(b => b.items.length > 0)

    // 環境・優勝デッキ集：直近の優勝デッキをアイコンで並べる
    const winnerDecks = decks
        .filter(d => d.event_rank === '優勝' && d.archetype_id && archetypeMap.has(d.archetype_id))
        .slice(0, 8)
    const winnerDates = [...new Set(winnerDecks.map(d => d.event_date).filter(Boolean))] as string[]
    const winnerCaption = winnerDates.length > 0
        ? (winnerDates.length === 1 ? winnerDates[0] : `${winnerDates[winnerDates.length - 1]}〜${winnerDates[0]}`) + 'の優勝デッキ'
        : ''

    return (
        <div className="min-h-screen bg-[#f4f6fa] text-gray-900">
            <PublicHeader game="gundam" />

            {/* Hero */}
            <section className="bg-white border-b border-[#eef1f6]">
                <div className="max-w-[1080px] mx-auto flex gap-4 items-start px-5 py-6">
                    <div className="w-[5px] self-stretch bg-blue-600 rounded-sm shrink-0" />
                    <div>
                        <h1 className="text-xl sm:text-[26px] font-semibold text-gray-900 leading-relaxed">
                            ガンダムの環境考察を、<br />ポケットの中に。
                        </h1>
                        <p className="text-[13px] text-gray-500 leading-relaxed mt-2.5">
                            PokéLix は実際の大会データをもとに、ガンダムの環境Tier・優勝デッキをまとめて確認できる攻略サイトです。
                        </p>
                    </div>
                </div>
            </section>

            {/* Quick entry cards */}
            <section className="bg-white border-b border-[#eef1f6]">
                <div className="max-w-[1080px] mx-auto grid grid-cols-3 gap-3 px-5 py-2.5">
                    <a href="#tier" className="bg-white border-2 border-blue-600 rounded-lg text-center py-2.5 px-1.5">
                        <Ico name="trophy" className="w-7 h-7 mx-auto text-blue-600" />
                        <div className="text-[15px] font-semibold text-gray-900 mt-1.5">環境Tier表</div>
                        <div className="text-[11px] text-gray-500">今強いデッキを見る</div>
                    </a>
                    <Link href="/gundam/decks" className="bg-white border border-[#e2e8f0] rounded-lg text-center py-2.5 px-1.5">
                        <Ico name="list" className="w-7 h-7 mx-auto text-blue-600" />
                        <div className="text-[15px] font-semibold text-gray-900 mt-1.5">デッキ一覧</div>
                        <div className="text-[11px] text-gray-500">大会入賞デッキ</div>
                    </Link>
                    <Link href="/gundam/titles" className="bg-white border border-[#e2e8f0] rounded-lg text-center py-2.5 px-1.5">
                        <Ico name="cards" className="w-7 h-7 mx-auto text-blue-600" />
                        <div className="text-[15px] font-semibold text-gray-900 mt-1.5">みんなのデッキ</div>
                        <div className="text-[11px] text-gray-500">投稿デッキ集</div>
                    </Link>
                </div>
            </section>

            {/* Ad */}
            <section className="bg-[#eef2f7] border-b border-[#e5e9f0]">
                <div className="max-w-[1080px] mx-auto px-5 py-2.5">
                    <AdPlaceholder slot="5651129539" format="leaderboard" className="mx-auto" />
                </div>
            </section>

            <div className="max-w-[1080px] mx-auto grid grid-cols-1 md:grid-cols-[1fr_260px] gap-4 px-1.5 py-2.5">

                <main className="flex flex-col gap-4 min-w-0">

                    {/* 環境Tier表 */}
                    <div id="tier" className="bg-white border border-[#e2e8f0] rounded-lg overflow-hidden">
                        <div className="bg-blue-600 text-white text-sm font-semibold px-3.5 py-2.5 flex items-center justify-between">
                            <span className="flex items-center gap-1.5"><Ico name="trophy" className="w-4 h-4" />環境Tier表</span>
                        </div>
                        <div className="p-2.5">
                            {tierBuckets.length === 0 ? (
                                <p className="text-sm text-gray-400 text-center py-4">直近7日間のデッキデータがまだありません</p>
                            ) : tierBuckets.map(({ tier, items }) => (
                                <div key={tier} className="mb-4 last:mb-0">
                                    <div className="flex items-center gap-1.5 text-[11px] font-semibold mb-1.5">
                                        <span className={`text-white text-xs font-semibold px-2.5 py-0.5 rounded ${TIER_STYLE[tier].badge}`}>{tier}</span>
                                        <span className={TIER_STYLE[tier].text}>{TIER_STYLE[tier].label}</span>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                                        {items.map(a => {
                                            const share = totalRecentDecks > 0 ? ((weeklyRanking[a.id] || 0) / totalRecentDecks * 100).toFixed(1) : '0.0'
                                            return (
                                                <Link
                                                    key={a.id}
                                                    href={`/gundam/decks#arch-${a.id}`}
                                                    className="flex items-center gap-2 border border-[#e2e8f0] rounded-lg px-2.5 py-1.5 bg-white hover:border-blue-300 hover:shadow-sm transition"
                                                >
                                                    <GundamColorIcon name={a.name} fallbackUrl={a.cover_image_url} className="w-[34px] h-[34px] rounded-md shrink-0 border border-gray-200" />
                                                    <span className="flex-1 min-w-0 text-xs font-semibold text-gray-800 truncate">{a.name}</span>
                                                    <span className="text-xs font-semibold text-blue-700">{share}%</span>
                                                </Link>
                                            )
                                        })}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* 環境・優勝デッキ集 */}
                    <div className="bg-white border border-[#e2e8f0] rounded-lg overflow-hidden">
                        <div className="text-sm font-semibold text-gray-900 px-3.5 py-2.5 border-b border-[#eef1f6] flex items-center justify-between">
                            <span className="flex items-center gap-1.5"><Ico name="list" className="w-4 h-4 text-blue-600" />環境・優勝デッキ集</span>
                            <Link href="/gundam/decks" className="text-[11px] text-blue-600 font-semibold">すべて見る ›</Link>
                        </div>
                        <div className="p-2.5">
                            {winnerDecks.length === 0 ? (
                                <p className="text-sm text-gray-400 text-center py-4">優勝デッキデータがまだありません</p>
                            ) : (
                                <>
                                    <div className="grid grid-cols-4 md:grid-cols-8 gap-2">
                                        {winnerDecks.map(d => {
                                            const arch = archetypeMap.get(d.archetype_id!)!
                                            return (
                                                <Link key={d.id} href={`/gundam/decks/${d.id}`} className="text-center">
                                                    <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 relative">
                                                        {Array.isArray(d.icon_urls) && d.icon_urls.filter(Boolean).length >= 2 ? (
                                                            <GundamDeckIcon iconUrls={d.icon_urls} alt={d.deck_name || arch.name} />
                                                        ) : d.thumbnail_url ? (
                                                            <Image src={d.thumbnail_url} alt={d.deck_name || arch.name} fill className="object-contain" unoptimized />
                                                        ) : (
                                                            <GundamColorIcon name={arch.name} fallbackUrl={arch.cover_image_url} className="absolute inset-0 w-full h-full" />
                                                        )}
                                                        <span className="absolute top-0.5 left-0.5 text-[10px] font-semibold text-white bg-red-600 px-1.5 py-0.5 rounded">優勝</span>
                                                    </div>
                                                    <div className="text-[11px] font-semibold text-gray-800 mt-1 truncate">{arch.name}</div>
                                                </Link>
                                            )
                                        })}
                                    </div>
                                    {winnerCaption && (
                                        <div className="text-[10px] text-gray-400 mt-2 text-right">{winnerCaption}</div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>

                    {/* みんなのデッキ */}
                    {recommendedDecks.length > 0 && (
                        <div className="bg-white border border-[#e2e8f0] rounded-lg overflow-hidden">
                            <div className="text-sm font-semibold text-gray-900 px-3.5 py-2.5 border-b border-[#eef1f6] flex items-center justify-between">
                                <span className="flex items-center gap-1.5"><Ico name="cards" className="w-4 h-4 text-blue-600" />みんなのデッキ</span>
                                <Link href="/gundam/titles" className="text-[11px] text-blue-600 font-semibold">すべて見る ›</Link>
                            </div>
                            <div className="p-2.5 grid grid-cols-4 md:grid-cols-8 gap-2">
                                {recommendedDecks.slice(0, 8).map((d: any) => (
                                    <Link key={d.id} href={`/gundam/titles/${d.id}`} className="text-center">
                                        <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 relative">
                                            {d.image_url && (
                                                <Image src={d.image_url} alt={d.deck_name || 'デッキ'} fill className="object-cover object-top" unoptimized />
                                            )}
                                        </div>
                                        <div className="text-[11px] font-semibold text-gray-800 mt-1 truncate">{d.deck_name || '無題'}</div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Ad (in-content) */}
                    <div className="bg-white border border-[#e2e8f0] rounded-lg py-2.5">
                        <AdPlaceholder slot="5651129539" format="leaderboard" className="mx-auto" />
                    </div>

                    {/* 無料ツール */}
                    <div>
                        <div className="text-sm font-semibold text-gray-900 mb-2.5 pl-2.5 border-l-[3px] border-blue-600">無料ツール</div>
                        <div className="grid grid-cols-3 gap-2.5">
                            {[
                                { href: '/gundam/decks', icon: 'list', label: 'デッキ一覧' },
                                { href: '#tier', icon: 'trophy', label: '環境Tier表' },
                                { href: '/gundam/titles', icon: 'cards', label: 'みんなのデッキ' },
                            ].map(t => (
                                <Link
                                    key={t.label}
                                    href={t.href}
                                    className="bg-white border border-[#e2e8f0] rounded-lg overflow-hidden"
                                >
                                    <div className="h-16 bg-blue-100 flex items-center justify-center">
                                        <Ico name={t.icon} className="w-7 h-7 text-blue-600" />
                                    </div>
                                    <div className="px-2.5 py-2 text-xs font-semibold text-gray-800">{t.label}</div>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Ad (in-content) */}
                    <div className="bg-white border border-[#e2e8f0] rounded-lg py-2.5">
                        <AdPlaceholder slot="5651129539" format="leaderboard" className="mx-auto" />
                    </div>
                </main>

                <aside className="flex flex-col gap-3.5 min-w-0">
                    <div className="bg-white border border-[#e2e8f0] rounded-lg overflow-hidden">
                        <div className="bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-2.5 border-b border-blue-100">他TCGも対応</div>
                        <div className="py-1.5">
                            <Link href="/" className="flex items-center justify-between px-3 py-1.5 hover:bg-blue-50 transition">
                                <span className="text-xs text-gray-700">ポケモンカード</span>
                                <span className="text-[10px] text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded">公開中</span>
                            </Link>
                            {['ワンピースカード', '遊戯王OCG', 'デュエマ'].map(name => (
                                <div key={name} className="flex items-center justify-between px-3 py-1.5">
                                    <span className="text-xs text-gray-700">{name}</span>
                                    <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">準備中</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-2.5 text-center">
                        <div className="text-xs font-semibold text-blue-700 flex items-center justify-center gap-1.5"><Ico name="refresh" className="w-3.5 h-3.5" />大会データ 毎日更新</div>
                        <div className="text-[11px] text-blue-600 mt-1">公式大会の入賞デッキを自動集計</div>
                    </div>

                    <ToygerPromo product="sleeve" />
                    <ToygerPromo product="deckCase" />

                    <div className="bg-white border border-[#e2e8f0] rounded-lg overflow-hidden p-2.5">
                        <AdPlaceholder slot="2515406718" format="auto" />
                    </div>
                </aside>
            </div>

            <Footer game="gundam" />
        </div>
    )
}
