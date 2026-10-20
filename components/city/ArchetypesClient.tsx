'use client'
import { useCallback, useEffect, useRef, useState } from 'react'
import ArchetypeCardAdoption from '@/components/city/ArchetypeCardAdoption'
import type { ArchetypeAdoption } from '@/lib/city'

const fmtMonth = (m: string) => `${+m.slice(0, 4)}年${+m.slice(4, 6)}月`

export default function ArchetypesClient({ months, initial }: { months: string[]; initial: ArchetypeAdoption }) {
    const [selMonth, setSelMonth] = useState<string>('') // '' = 全期間
    const [data, setData] = useState<ArchetypeAdoption>(initial)
    const [loading, setLoading] = useState(false)
    const cacheRef = useRef<Map<string, ArchetypeAdoption>>(new Map([['', initial]]))
    const reqId = useRef(0)

    const go = useCallback(async (month: string, replaceUrl = true) => {
        setSelMonth(month)
        if (replaceUrl && typeof window !== 'undefined') {
            window.history.replaceState(null, '', month ? `/city/archetypes?month=${month}` : '/city/archetypes')
        }
        const hit = cacheRef.current.get(month)
        if (hit) { setData(hit); return }
        const id = ++reqId.current
        setLoading(true)
        try {
            const res = await fetch(`/api/city/archetypes${month ? `?month=${month}` : ''}`, { cache: 'force-cache' })
            if (!res.ok) throw new Error(String(res.status))
            const j = await res.json() as { data: ArchetypeAdoption }
            cacheRef.current.set(month, j.data)
            if (id === reqId.current) setData(j.data)
        } catch { /* 現状維持 */ }
        finally { if (id === reqId.current) setLoading(false) }
    }, [])

    useEffect(() => {
        if (typeof window === 'undefined') return
        const m = new URLSearchParams(window.location.search).get('month') || ''
        if (m && months.includes(m)) go(m, false)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    return (
        <>
            <div className="flex gap-1.5 overflow-x-auto pb-2 mb-4">
                <button onClick={() => go('')}
                    className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold border transition ${!selMonth ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}>全期間</button>
                {months.map(m => (
                    <button key={m} onClick={() => go(m)}
                        className={`shrink-0 rounded-full px-3 py-1.5 text-xs font-bold border transition ${selMonth === m ? 'bg-gray-900 text-white border-gray-900' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}>{fmtMonth(m)}</button>
                ))}
            </div>

            <div className={loading ? 'opacity-60 transition-opacity' : 'transition-opacity'}>
                {data.length === 0
                    ? <div className="text-center text-gray-400 py-24 bg-white rounded-xl border border-dashed">集計できるデータがありません。</div>
                    : <ArchetypeCardAdoption data={data} />}
            </div>
        </>
    )
}
