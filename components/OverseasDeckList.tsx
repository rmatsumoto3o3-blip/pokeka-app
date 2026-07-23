'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { OverseasArchetype, OverseasResult, OverseasTournament } from '@/lib/overseasData'

interface Props {
    archetypes: OverseasArchetype[]
    results: OverseasResult[]
    tournaments: OverseasTournament[]
}

export default function OverseasDeckList({ archetypes, results, tournaments }: Props) {
    const [region, setRegion] = useState('All')
    const [tournamentId, setTournamentId] = useState('All')
    const [rank, setRank] = useState('All')
    const [archetypeId, setArchetypeId] = useState('All')
    const tournamentMap = new Map(tournaments.map(item => [item.id, item]))
    const archetypeMap = new Map(archetypes.map(item => [item.id, item]))
    const regions = Array.from(new Set(tournaments.map(item => item.region)))

    const visible = results.filter(result => {
        const tournament = tournamentMap.get(result.tournamentId)
        return Boolean(tournament)
            && (region === 'All' || tournament?.region === region)
            && (tournamentId === 'All' || result.tournamentId === tournamentId)
            && (rank === 'All' || result.rankLabel === rank)
            && (archetypeId === 'All' || result.archetypeId === archetypeId)
    })

    return (
        <>
            <div className="mb-5 grid gap-2 rounded-xl border border-slate-200 bg-white p-3 sm:grid-cols-2 lg:grid-cols-4">
                <Filter label="地域" value={region} onChange={setRegion} options={['All', ...regions]} />
                <Filter label="大会" value={tournamentId} onChange={setTournamentId} options={['All', ...tournaments.map(item => item.id)]} labels={Object.fromEntries(tournaments.map(item => [item.id, item.shortName]))} />
                <Filter label="順位" value={rank} onChange={setRank} options={['All', 'Winner', 'Runner-up', 'Top 4', 'Top 8']} />
                <Filter label="デッキタイプ" value={archetypeId} onChange={setArchetypeId} options={['All', ...archetypes.map(item => item.id)]} labels={Object.fromEntries(archetypes.map(item => [item.id, item.nameEn]))} />
            </div>
            <div className="mb-3 text-xs text-gray-500">{visible.length} decks</div>
            {visible.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-300 bg-white py-16 text-center text-sm text-gray-500">条件に一致するモックデータはありません。</div>
            ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                    {visible.map(result => {
                        const tournament = tournamentMap.get(result.tournamentId)!
                        const archetype = archetypeMap.get(result.archetypeId)
                        return (
                            <Link key={result.id} href={`/overseas/decks/${result.id}`} className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm transition hover:border-sky-200 hover:shadow-md">
                                <div className="relative aspect-square bg-slate-100">
                                    {archetype?.coverImageUrl && <Image src={archetype.coverImageUrl} alt={archetype.nameEn} fill className="object-contain p-2" unoptimized />}
                                    <span className="absolute left-1 top-1 rounded bg-sky-700 px-1.5 py-0.5 text-[10px] font-bold text-white">{result.rankLabel}</span>
                                </div>
                                <div className="p-2.5"><div className="truncate text-xs font-semibold text-gray-900">{archetype?.nameEn || 'Unknown'}</div><div className="mt-1 truncate text-[10px] text-gray-400">{tournament.shortName} · #{result.placing}</div><div className="truncate text-[10px] text-gray-400">{result.playerName} · {result.countryCode}</div></div>
                            </Link>
                        )
                    })}
                </div>
            )}
        </>
    )
}

function Filter({ label, value, onChange, options, labels = {} }: { label: string; value: string; onChange: (value: string) => void; options: string[]; labels?: Record<string, string> }) {
    return <label className="text-[10px] font-semibold text-gray-500">{label}<select value={value} onChange={event => onChange(event.target.value)} className="mt-1 block w-full rounded-md border border-slate-200 bg-white px-2.5 py-2 text-xs font-normal text-gray-700"><option value="All">すべて</option>{options.filter(item => item !== 'All').map(item => <option key={item} value={item}>{labels[item] || item}</option>)}</select></label>
}
