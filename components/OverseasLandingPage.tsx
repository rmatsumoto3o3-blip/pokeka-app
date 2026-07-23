'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Ico } from '@/components/Icons'
import type { OverseasArchetype, OverseasArchetypeStat, OverseasResult, OverseasTournament } from '@/lib/overseasData'

interface Props {
    archetypes: OverseasArchetype[]
    stats: OverseasArchetypeStat[]
    tournaments: OverseasTournament[]
    results: OverseasResult[]
}

const REGION_LABELS: Record<string, string> = {
    All: '全地域',
    'North America': '北米',
    Europe: '欧州',
    Oceania: 'オセアニア',
}

export default function OverseasLandingPage({ archetypes, stats, tournaments, results }: Props) {
    const regions = useMemo(() => Array.from(new Set(stats.map(item => item.region))), [stats])
    const [region, setRegion] = useState<OverseasArchetypeStat['region']>(regions[0] || 'All')
    const visibleStats = stats
        .filter(item => item.region === region && item.format === 'Standard')
        .sort((a, b) => b.share - a.share)
    const archetypeMap = new Map(archetypes.map(item => [item.id, item]))
    const latest = tournaments.slice().sort((a, b) => b.eventDateStart.localeCompare(a.eventDateStart)).slice(0, 3)

    return (
        <>
            <section className="border-b border-[#eef1f6] bg-white">
                <div className="mx-auto max-w-[1080px] px-5 py-6">
                    <div className="flex flex-wrap items-end justify-between gap-4">
                        <div className="flex gap-4">
                            <div className="w-[5px] rounded-sm bg-sky-600" />
                            <div>
                                <div className="mb-1 flex items-center gap-2">
                                    <h1 className="text-xl font-semibold text-gray-900 sm:text-[26px]">海外大会環境を、ひと目で。</h1>
                                </div>
                                <p className="max-w-2xl text-[13px] leading-relaxed text-gray-500">海外大会の順位・デッキタイプ・英語カードリストを、国内データと分離して確認できます。</p>
                            </div>
                        </div>
                        <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-1 text-xs font-semibold">
                            <Link href="/decks" className="rounded-md px-3 py-1.5 text-slate-500 hover:bg-white">国内環境</Link>
                            <span className="rounded-md bg-sky-600 px-3 py-1.5 text-white">海外環境</span>
                        </div>
                    </div>
                </div>
            </section>

            <main className="mx-auto grid max-w-[1080px] grid-cols-1 gap-4 px-3 py-4 md:grid-cols-[1fr_260px]">
                <div className="min-w-0 space-y-4">
                    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
                            <div>
                                <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-900"><Ico name="chart" className="h-4 w-4 text-sky-600" />環境シェア</h2>
                                <p className="mt-0.5 text-[10px] text-gray-400">日次事前集計 · Standard · 2026-05-01〜2026-07-14</p>
                            </div>
                            <select value={region} onChange={event => setRegion(event.target.value as OverseasArchetypeStat['region'])} className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs text-gray-700">
                                {regions.map(item => <option key={item} value={item}>{REGION_LABELS[item] || item}</option>)}
                            </select>
                        </div>
                        <div className="grid grid-cols-1 gap-2 p-3 sm:grid-cols-2">
                            {visibleStats.map((stat, index) => {
                                const archetype = archetypeMap.get(stat.archetypeId)
                                if (!archetype) return null
                                return (
                                    <Link key={stat.id} href={`/overseas/decks?archetype=${archetype.id}`} className="flex items-center gap-3 rounded-lg border border-slate-100 p-2.5 transition hover:border-sky-200 hover:bg-sky-50/40">
                                        <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                                            {archetype.coverImageUrl && <Image src={archetype.coverImageUrl} alt="" fill className="object-cover" unoptimized />}
                                            <span className={`absolute left-0 top-0 rounded-br px-1.5 py-0.5 text-[9px] font-bold text-white ${index < 2 ? 'bg-red-600' : index < 4 ? 'bg-orange-500' : 'bg-lime-600'}`}>{index < 2 ? 'S' : index < 4 ? 'A' : 'B'}</span>
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="truncate text-xs font-semibold text-gray-900">{archetype.nameEn}</div>
                                            {archetype.nameJa && <div className="truncate text-[10px] text-gray-400">{archetype.nameJa}</div>}
                                            <div className="mt-2 flex gap-3 text-[10px]"><span className="font-semibold text-sky-700">{stat.share.toFixed(1)}%</span><span className="text-gray-400">{stat.deckCount} decks</span><span className="text-gray-400">{stat.wins} wins</span></div>
                                        </div>
                                    </Link>
                                )
                            })}
                        </div>
                    </section>

                    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white">
                        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
                            <h2 className="flex items-center gap-2 text-sm font-semibold text-gray-900"><Ico name="trophy" className="h-4 w-4 text-sky-600" />最近の海外大会</h2>
                            <Link href="/overseas/decks" className="text-[11px] font-semibold text-sky-600">すべて見る ›</Link>
                        </div>
                        <div className="divide-y divide-slate-100">
                            {latest.map(tournament => {
                                const topResults = results.filter(result => result.tournamentId === tournament.id).sort((a, b) => a.placing - b.placing).slice(0, 3)
                                return (
                                    <div key={tournament.id} className="p-4">
                                        <div className="flex flex-wrap items-start justify-between gap-2">
                                            <div><div className="text-[10px] font-semibold text-sky-700">{tournament.region} · {tournament.eventDateStart}</div><h3 className="mt-1 text-sm font-semibold text-gray-900">{tournament.shortName}</h3><p className="text-[10px] text-gray-400">{tournament.city}, {tournament.countryCode} · {tournament.playerCount.toLocaleString()} players</p></div>
                                        </div>
                                        <div className="mt-3 grid gap-2 sm:grid-cols-3">
                                            {topResults.map(result => {
                                                const archetype = archetypeMap.get(result.archetypeId)
                                                return <Link key={result.id} href={`/overseas/decks/${result.id}`} className="rounded-md bg-slate-50 px-3 py-2 text-xs hover:bg-sky-50"><span className="mr-2 font-bold text-sky-700">#{result.placing}</span>{archetype?.nameEn || 'Unknown'}</Link>
                                            })}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </section>
                </div>

                <aside className="space-y-3">
                    <Link href="/overseas/decks" className="flex items-center justify-between rounded-lg bg-sky-600 px-4 py-3 text-sm font-semibold text-white"><span className="flex items-center gap-2"><Ico name="list" className="h-4 w-4" />大会・デッキ一覧</span><span>›</span></Link>
                    <div className="rounded-lg border border-sky-200 bg-sky-50 p-3.5 text-[10px] leading-relaxed text-sky-800">カード名は英語を正として表示します。海外の大会データは <a href="https://limitlesstcg.com" target="_blank" rel="noopener noreferrer" className="font-semibold underline">Limitless TCG</a> を参照しています。</div>
                </aside>
            </main>
        </>
    )
}
