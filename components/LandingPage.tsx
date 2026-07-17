'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import Footer from '@/components/Footer'
import type { ReferenceDeck, DeckArchetype, Article } from '@/lib/supabase'

import PublicHeader from '@/components/PublicHeader'
import AdPlaceholder from '@/components/AdPlaceholder'
import ToygerPromo from '@/components/ToygerPromo'
import { Ico } from '@/components/Icons'
import { POKEMON_ICONS } from '@/lib/constants'

interface LandingPageProps {
    decks: ReferenceDeck[]
    archetypes: DeckArchetype[]
    articles: Article[]
    analyticsData?: Record<string, any[]>
    recentArchetypeIds?: string[]
    weeklyRanking?: Record<string, number>
    featuredCards?: { card_name: string; current_adoption_rate: number }[]
}

const TIER_STYLE: Record<string, { badge: string; label: string; text: string }> = {
    S: { badge: 'bg-red-600', label: 'Sランク', text: 'text-red-600' },
    A: { badge: 'bg-orange-500', label: 'Aランク', text: 'text-orange-600' },
    B: { badge: 'bg-lime-600', label: 'Bランク', text: 'text-lime-700' },
}

// 環境デッキ分布ドーナツの配色（モックと同一）
const DONUT_COLORS = ['#2563eb', '#16a34a', '#ef9f27', '#dc2626', '#7c3aed', '#0891b2', '#cbd5e1']

export default function LandingPage({ decks, archetypes, articles, recentArchetypeIds = [], weeklyRanking = {}, featuredCards = [] }: LandingPageProps) {
    const [showMoreAdoption, setShowMoreAdoption] = useState(false)

    const archetypeMap = new Map(archetypes.map(a => [a.id, a]))

    // 直近7日間の実デッキ数（weeklyRanking）に基づく環境Tier表。データが無いアーキタイプは除外。
    const rankedArchetypes = archetypes
        .filter(a => (weeklyRanking[a.id] || 0) > 0)
        .slice(0, 10)
    const totalRecentDecks = Object.values(weeklyRanking).reduce((a, b) => a + b, 0)

    const tierBuckets: { tier: 'S' | 'A' | 'B'; items: DeckArchetype[] }[] = [
        { tier: 'S' as const, items: rankedArchetypes.slice(0, 2) },
        { tier: 'A' as const, items: rankedArchetypes.slice(2, 6) },
        { tier: 'B' as const, items: rankedArchetypes.slice(6, 10) },
    ].filter(b => b.items.length > 0)

    // 環境・優勝デッキ集：直近の優勝デッキをアイコンで並べる（モック準拠）
    const winnerDecks = decks
        .filter(d => d.event_rank === '優勝' && d.archetype_id && archetypeMap.has(d.archetype_id))
        .slice(0, 8)
    const winnerDates = [...new Set(winnerDecks.map(d => d.event_date).filter(Boolean))] as string[]
    const winnerCaption = winnerDates.length > 0
        ? (winnerDates.length === 1 ? winnerDates[0] : `${winnerDates[winnerDates.length - 1]}〜${winnerDates[0]}`) + 'の優勝デッキ'
        : ''

    // 注目カード採用率：運営がピックアップした注目カードの全体採用率（実データ）
    const visibleCards = showMoreAdoption ? featuredCards.slice(0, 10) : featuredCards.slice(0, 5)

    // 環境デッキ分布：直近30日の優勝デッキをアーキタイプ別に集計（モック準拠のドーナツ）
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000
    const winCounts: Record<string, number> = {}
    decks.forEach(d => {
        if (d.event_rank !== '優勝' || !d.archetype_id) return
        if (d.created_at && new Date(d.created_at).getTime() < thirtyDaysAgo) return
        winCounts[d.archetype_id] = (winCounts[d.archetype_id] || 0) + 1
    })
    const totalWins = Object.values(winCounts).reduce((a, b) => a + b, 0)
    const topWinEntries = Object.entries(winCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6)
    const otherWins = totalWins - topWinEntries.reduce((a, [, v]) => a + v, 0)
    const matchArchetypeIcon = (name: string) => POKEMON_ICONS.find(p => name.includes(p)) || null
    const donutSegments = [
        ...topWinEntries.map(([id, count], i) => {
            const name = archetypeMap.get(id)?.name || 'その他'
            return { name, count, color: DONUT_COLORS[i], icon: matchArchetypeIcon(name) }
        }),
        ...(otherWins > 0 ? [{ name: 'その他', count: otherWins, color: DONUT_COLORS[6], icon: null }] : []),
    ]
    const CIRC = 2 * Math.PI * 60 // r=60

    const linkableArchetypes = archetypes.filter(a => new Set(recentArchetypeIds).has(a.id))

    return (
        <div className="min-h-screen bg-[#f4f6fa] text-gray-900">
            <PublicHeader />

            {/* Hero */}
            <section className="bg-white border-b border-[#eef1f6]">
                <div className="max-w-[1080px] mx-auto flex gap-4 items-start px-5 py-6">
                    <div className="w-[5px] self-stretch bg-blue-600 rounded-sm shrink-0" />
                    <div>
                        <h1 className="text-xl sm:text-[26px] font-semibold text-gray-900 leading-relaxed">
                            ポケカの環境考察と練習ツールを、<br />ポケットの中に。
                        </h1>
                        <p className="text-[13px] text-gray-500 leading-relaxed mt-2.5">
                            PokéLix は実際の大会データをもとに、環境Tier・採用率・一人回し・初手確率をまとめて確認できる攻略サイトです。<br />
                            ポケカを中心に、他TCGの環境考察も同じ見やすさで広げていきます。
                        </p>
                    </div>
                </div>
            </section>

            {/* Quick entry cards */}
            <section className="bg-white border-b border-[#eef1f6]">
                <div className="max-w-[1080px] mx-auto grid grid-cols-2 sm:grid-cols-4 gap-3 px-5 py-2.5">
                    <a href="#tier" className="bg-white border-2 border-blue-600 rounded-lg text-center py-2.5 px-1.5">
                        <Ico name="trophy" className="w-7 h-7 mx-auto text-blue-600" />
                        <div className="text-[15px] font-semibold text-gray-900 mt-1.5">環境Tier表</div>
                        <div className="text-[11px] text-gray-500">今強いデッキを見る</div>
                    </a>
                    <Link href="/practice" className="bg-white border border-[#e2e8f0] rounded-lg text-center py-2.5 px-1.5">
                        <Ico name="cards" className="w-7 h-7 mx-auto text-blue-600" />
                        <div className="text-[15px] font-semibold text-gray-900 mt-1.5">一人回し練習</div>
                        <div className="text-[11px] text-gray-500">盤面で練習</div>
                    </Link>
                    <Link href="/simulator" className="bg-white border border-[#e2e8f0] rounded-lg text-center py-2.5 px-1.5">
                        <Ico name="dice" className="w-7 h-7 mx-auto text-blue-600" />
                        <div className="text-[15px] font-semibold text-gray-900 mt-1.5">初手確率シミュ</div>
                        <div className="text-[11px] text-gray-500">確率シミュレーター</div>
                    </Link>
                    <Link href="/global-simulator" className="bg-white border border-[#e2e8f0] rounded-lg text-center py-2.5 px-1.5">
                        <Ico name="world" className="w-7 h-7 mx-auto text-blue-600" />
                        <div className="text-[15px] font-semibold text-gray-900 mt-1.5">グローバルシミュ</div>
                        <div className="text-[11px] text-gray-500">PTCGL format</div>
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
                            <span className="flex items-center gap-1.5"><Ico name="trophy" className="w-4 h-4" />環境Tier表{totalRecentDecks > 0 && `（直近7日・${totalRecentDecks}件）`}</span>
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
                                                    href={`/archetypes/${encodeURIComponent(a.name)}`}
                                                    className="flex items-center gap-2 border border-[#e2e8f0] rounded-lg px-2.5 py-1.5 bg-white hover:border-blue-300 transition"
                                                >
                                                    <div className="w-[34px] h-[34px] rounded-md overflow-hidden bg-gray-100 shrink-0 relative">
                                                        {a.cover_image_url && (
                                                            <Image src={a.cover_image_url} alt={a.name} fill className="object-cover" unoptimized />
                                                        )}
                                                    </div>
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
                    <div id="reference-decks" className="bg-white border border-[#e2e8f0] rounded-lg overflow-hidden">
                        <div className="text-sm font-semibold text-gray-900 px-3.5 py-2.5 border-b border-[#eef1f6] flex items-center justify-between">
                            <span className="flex items-center gap-1.5"><Ico name="list" className="w-4 h-4 text-blue-600" />環境・優勝デッキ集</span>
                            <Link href="/decks" className="text-[11px] text-blue-600 font-semibold">すべて見る ›</Link>
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
                                                <Link key={d.id} href={`/decks/${d.id}`} className="text-center">
                                                    <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 relative">
                                                        {arch.cover_image_url && (
                                                            <Image src={arch.cover_image_url} alt={arch.name} fill className="object-cover" unoptimized />
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

                    {/* Ad (in-content) */}
                    <div className="bg-white border border-[#e2e8f0] rounded-lg py-2.5">
                        <AdPlaceholder slot="5651129539" format="leaderboard" className="mx-auto" />
                    </div>

                    {/* 注目カード採用率 */}
                    <div className="bg-white border border-[#e2e8f0] rounded-lg overflow-hidden">
                        <div className="text-sm font-semibold text-gray-900 px-3.5 py-2.5 border-b border-[#eef1f6] flex items-center gap-1.5">
                            <Ico name="chart" className="w-4 h-4 text-blue-600" />注目カード採用率
                        </div>
                        <div className="px-3.5 py-2.5 flex flex-col gap-2">
                            {visibleCards.length === 0 ? (
                                <p className="text-sm text-gray-400 text-center py-4">採用率データがまだありません</p>
                            ) : visibleCards.map((c, i) => (
                                <div key={i} className="flex items-center gap-2.5">
                                    <span className="text-xs text-gray-600 w-[150px] truncate shrink-0">{c.card_name}</span>
                                    <div className="flex-1 bg-blue-50 rounded h-2.5">
                                        <div className="bg-blue-600 h-2.5 rounded" style={{ width: `${Math.min(100, c.current_adoption_rate)}%` }} />
                                    </div>
                                    <span className="text-[11px] text-gray-500 w-10 text-right shrink-0">{c.current_adoption_rate}%</span>
                                </div>
                            ))}
                            {featuredCards.length > 5 && (
                                <button
                                    onClick={() => setShowMoreAdoption(v => !v)}
                                    className="mt-2 w-full bg-gray-50 border border-[#e2e8f0] rounded-lg py-2 text-xs font-semibold text-blue-600"
                                >
                                    {showMoreAdoption ? '閉じる' : 'もっと見る（他のカード）'}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* 環境デッキ分布 ・ デッキ別 優勝数（直近30日） */}
                    <div className="bg-white border border-[#e2e8f0] rounded-lg overflow-hidden">
                        <div className="text-sm font-semibold text-gray-900 px-3.5 py-2.5 border-b border-[#eef1f6] flex items-center gap-1.5">
                            <Ico name="pie" className="w-4 h-4 text-blue-600" />環境デッキ分布 ・ デッキ別 優勝数（直近30日）
                        </div>
                        {totalWins === 0 ? (
                            <p className="text-sm text-gray-400 text-center py-6">直近30日の優勝データがまだありません</p>
                        ) : (
                            <div className="flex flex-wrap items-center gap-4 p-2.5">
                                <svg width="160" height="160" viewBox="0 0 160 160" className="shrink-0">
                                    <g transform="rotate(-90 80 80)" fill="none" strokeWidth="28">
                                        {(() => {
                                            let offset = 0
                                            return donutSegments.map((seg, i) => {
                                                const len = (seg.count / totalWins) * CIRC
                                                const el = (
                                                    <circle
                                                        key={i}
                                                        cx="80" cy="80" r="60"
                                                        stroke={seg.color}
                                                        strokeDasharray={`${len} ${CIRC}`}
                                                        strokeDashoffset={-offset}
                                                    />
                                                )
                                                offset += len
                                                return el
                                            })
                                        })()}
                                    </g>
                                    <text x="80" y="76" textAnchor="middle" fontSize="14" fill="#0f172a" fontWeight="600">{totalWins}</text>
                                    <text x="80" y="92" textAnchor="middle" fontSize="10" fill="#94a3b8">優勝</text>
                                </svg>
                                <div className="flex-1 min-w-[200px] flex flex-col gap-1.5">
                                    {donutSegments.map((seg, i) => (
                                        <div key={i} className="flex items-center gap-2 text-xs">
                                            <span className="w-[11px] h-[11px] rounded shrink-0" style={{ backgroundColor: seg.color }} />
                                            {seg.icon && (
                                                <img src={`/pokemon-icons/${seg.icon}.png`} alt="" className="w-4 h-4 shrink-0" />
                                            )}
                                            <span className="flex-1 text-gray-700 truncate">{seg.name}</span>
                                            <span className="text-gray-400">{((seg.count / totalWins) * 100).toFixed(1)}%</span>
                                            <span className="w-[34px] text-right font-semibold text-blue-700">{seg.count}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Ad (in-content) */}
                    <div className="bg-white border border-[#e2e8f0] rounded-lg py-2.5">
                        <AdPlaceholder slot="5651129539" format="leaderboard" className="mx-auto" />
                    </div>

                    {/* 無料ツール */}
                    <div>
                        <div className="text-sm font-semibold text-gray-900 mb-2.5 pl-2.5 border-l-[3px] border-blue-600">無料ツール</div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                            {[
                                { href: '/practice', icon: 'cards', label: '一人回し練習' },
                                { href: '/simulator', icon: 'dice', label: '初手確率シミュ' },
                                { href: '/practice/prize-trainer', icon: 'eye', label: 'サイド推論' },
                                { href: '/global-simulator', icon: 'world', label: 'グローバルシミュ' },
                                { href: '/#reference-decks', icon: 'pie', label: '環境デッキ分布' },
                                { href: '#tier', icon: 'chart', label: '注目カード採用率' },
                                { href: '/kids', icon: 'calc', label: 'ポケカで算数' },
                                { href: 'https://otcg.pokelix.jp/', icon: 'phone', label: 'O-TCG Pocket', external: true },
                            ].map(t => (
                                <Link
                                    key={t.label}
                                    href={t.href}
                                    target={t.external ? '_blank' : undefined}
                                    rel={t.external ? 'noopener noreferrer' : undefined}
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

                    {/* 環境考察・記事 */}
                    <div>
                        <div className="text-sm font-semibold text-gray-900 mb-2.5 pl-2.5 border-l-[3px] border-blue-600">環境考察・記事</div>
                        <div className="flex flex-col gap-1.5">
                            {articles.map((article, i) => (
                                <Link
                                    key={article.id}
                                    href={`/articles/${article.slug}`}
                                    className="bg-white border border-[#e2e8f0] rounded-lg px-3 py-2.5 flex items-center gap-2.5"
                                >
                                    <span className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded shrink-0">記事</span>
                                    <span className="flex-1 min-w-0 text-[13px] text-gray-800 truncate">{article.title}</span>
                                    {i === 0 && <span className="text-[10px] font-semibold text-white bg-red-600 px-1.5 py-0.5 rounded shrink-0">NEW</span>}
                                    <span className="text-[11px] text-gray-400 shrink-0">
                                        {new Date(article.published_at || article.created_at).toLocaleDateString('ja-JP', { month: 'numeric', day: 'numeric' })}
                                    </span>
                                </Link>
                            ))}
                            {articles.length === 0 && (
                                <p className="text-sm text-gray-400 text-center py-4 bg-white rounded-lg border border-[#e2e8f0]">記事はまだありません</p>
                            )}
                        </div>
                    </div>

                    {/* 環境デッキ別 採用カード */}
                    {linkableArchetypes.length > 0 && (
                        <div id="deck-pages">
                            <div className="text-sm font-semibold text-gray-900 mb-2.5 pl-2.5 border-l-[3px] border-blue-600">環境デッキ別 採用カード</div>
                            <div className="bg-white border border-[#e2e8f0] rounded-lg p-3.5">
                                <div className="flex flex-wrap gap-2">
                                    {linkableArchetypes.map(a => (
                                        <Link
                                            key={a.id}
                                            href={`/archetypes/${encodeURIComponent(a.name)}`}
                                            className="px-3 py-1.5 bg-gray-50 hover:bg-blue-50 text-gray-700 hover:text-blue-700 text-sm font-medium rounded-full border border-gray-200 hover:border-blue-300 transition-colors"
                                        >
                                            {a.name}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </main>

                <aside className="flex flex-col gap-3.5 min-w-0">
                    <div className="bg-white border border-[#e2e8f0] rounded-lg overflow-hidden">
                        <div className="bg-blue-50 text-blue-700 text-xs font-semibold px-3 py-2.5 border-b border-blue-100">他TCGも順次対応</div>
                        <div className="py-1.5">
                            {['ワンピースカード', '遊戯王OCG', 'デュエマ'].map(name => (
                                <div key={name} className="flex items-center justify-between px-3 py-1.5">
                                    <span className="text-xs text-gray-700">{name}</span>
                                    <span className="text-[10px] text-gray-400 bg-gray-100 px-1.5 py-0.5 rounded">準備中</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-white border border-[#e2e8f0] rounded-lg overflow-hidden">
                        <div className="bg-slate-800 text-white text-xs font-semibold px-3 py-2.5">人気ランキング</div>
                        <div className="py-1">
                            {['環境Tier表', '一人回し練習', '初手確率シミュ', '採用率ランキング', '入賞デッキまとめ'].map((label, i) => (
                                <div key={label} className="flex items-center gap-2.5 px-3 py-1.5">
                                    <span className={`font-semibold text-sm w-3.5 ${i < 3 ? 'text-blue-600' : 'text-gray-400'}`}>{i + 1}</span>
                                    <span className="text-xs text-gray-700">{label}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-2.5 text-center">
                        <div className="text-xs font-semibold text-blue-700 flex items-center justify-center gap-1.5"><Ico name="refresh" className="w-3.5 h-3.5" />大会データ 毎日更新</div>
                        <div className="text-[11px] text-blue-600 mt-1">全国の入賞デッキを自動集計</div>
                    </div>

                    <ToygerPromo product="sleeve" />
                    <ToygerPromo product="deckCase" />

                    <div className="bg-white border border-[#e2e8f0] rounded-lg overflow-hidden p-2.5">
                        <AdPlaceholder slot="2515406718" format="auto" />
                    </div>
                </aside>
            </div>

            {/* Ad row */}
            <div className="max-w-[1080px] mx-auto grid grid-cols-1 sm:grid-cols-2 gap-2.5 px-1.5 pb-4">
                <div className="flex flex-col items-center">
                    <span className="text-xs text-gray-400 mb-1">PR: サプライ買うならTOYGER</span>
                    <a href="https://shopa.jp/9293M3MEXQ2Z" target="_blank" rel="sponsored nofollow noopener noreferrer" className="block w-full h-16 sm:h-20 hover:opacity-90 transition-opacity">
                        <Image src="/ad_sponsor_toyger.png" alt="サプライ買うならTOYGER" width={400} height={150} className="w-full h-full object-cover rounded-lg shadow-sm border border-gray-100" />
                    </a>
                </div>
                <div className="flex flex-col items-center">
                    <span className="text-xs text-gray-400 mb-1">ドット絵ご提供者様(下記タップでXへ)</span>
                    <a href="https://twitter.com/komori541milk" target="_blank" rel="noopener noreferrer" className="block w-[94%] h-16 sm:h-20 hover:opacity-90 transition-opacity mx-auto">
                        <Image src="/dotpicture.png" alt="ドット絵ご提供者様" width={1715} height={589} className="w-full h-full object-cover rounded-lg shadow-sm border border-gray-100" />
                    </a>
                </div>
            </div>

            {/* FAQ Section (kept for structured-data consistency with page.tsx's FAQPage JSON-LD) */}
            <section className="py-16 bg-gray-50">
                <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-10">
                        <h2 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-3">よくある質問</h2>
                        <p className="text-gray-500 text-sm">FAQ — Frequently Asked Questions</p>
                    </div>
                    <div className="space-y-4">
                        {[
                            {
                                q: 'このサイトはどのようなサービスですか？',
                                a: 'スマホやPCのブラウザから、無料でポケモンカードのデッキ構築や検証ができる「ポケカ デッキシミュレーター」ツールです。※よく「ポケカ シュミレーター」とも検索されますが、正しくはシミュレーター（シミュレーション）です。'
                            },
                            {
                                q: 'スマホでも使えますか？',
                                a: 'はい、スマートフォン・タブレット・PCすべてのブラウザに対応しています。アプリのインストールは不要で、ブラウザから即座にご利用いただけます。'
                            },
                            {
                                q: 'ログイン（アカウント登録）をしないと使えませんか？',
                                a: 'いいえ、ログインなしでも基本的なシミュレーター機能はどなたでも自由にご利用いただけます。まずは気軽にお試しください。'
                            },
                            {
                                q: 'アカウント登録（ログイン）をすると何ができますか？',
                                a: 'ログインしていただくことで、自分だけの専用ダッシュボードが使えるようになり、作成したデッキの保存やお気に入り登録、より詳細な分析機能などが解放されます。'
                            },
                            {
                                q: '作成したデッキを使って一人で練習することはできますか？',
                                a: 'はい、当サイトには強力な「ひとり回し」機能を搭載しています。対戦相手がいないときでも、作成したデッキの動かし方や初手の確率、コンボのつながりなどをじっくり検証・練習していただけます。'
                            },
                            {
                                q: '収録されているカードのデータや採用率は確認できますか？',
                                a: 'はい、最新のカードデータに対応しており、各デッキにおけるポケカのカード採用率などもチェックしながらデッキビルドを進めることが可能です。'
                            },
                            {
                                q: '確率計算はどのくらい正確ですか？',
                                a: 'モンテカルロ法による10万回シミュレーションを採用しており、±0.1%以内の高精度で計算しています。単純な計算式では難しい「複数カードの組み合わせ」や「マリガン」も正確にシミュレーション可能です。'
                            },
                        ].map((item, i) => (
                            <details key={i} className="group bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
                                <summary className="flex items-center justify-between gap-4 px-6 py-4 cursor-pointer list-none font-bold text-gray-800 hover:bg-gray-50 transition-colors">
                                    <span className="text-sm sm:text-base">{item.q}</span>
                                    <span className="text-blue-500 text-lg shrink-0 group-open:rotate-45 transition-transform duration-200">＋</span>
                                </summary>
                                <div className="px-6 pb-5 pt-1 text-gray-600 text-sm leading-relaxed border-t border-gray-100">
                                    {item.a}
                                </div>
                            </details>
                        ))}
                    </div>
                </div>
            </section>

            <Footer />
        </div>
    )
}
