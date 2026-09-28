'use client'
import { useState } from 'react'
import { useCityAdmin } from './CityAdminContext'

// 注目カードの編集（管理モード時のみ表示）。実在カード名から選んで追加→保存でSupabaseに反映。
export default function WatchlistAdmin({ initial, cardNames }: { initial: string[]; cardNames: string[] }) {
    const ctx = useCityAdmin()
    const [cards, setCards] = useState<string[]>(initial)
    const [input, setInput] = useState('')
    const [saving, setSaving] = useState(false)
    const [msg, setMsg] = useState('')
    if (!ctx || !ctx.on) return null

    const nameSet = new Set(cardNames)
    const add = () => { const n = input.trim(); if (!n || cards.includes(n)) { setInput(''); return } setCards([...cards, n]); setInput('') }
    const remove = (n: string) => setCards(cards.filter(c => c !== n))
    const move = (i: number, d: number) => {
        const j = i + d; if (j < 0 || j >= cards.length) return
        const a = [...cards];[a[i], a[j]] = [a[j], a[i]]; setCards(a)
    }
    const save = async () => {
        setSaving(true); setMsg('')
        try {
            const res = await fetch('/api/city/watchlist', { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ cards }) })
            if (!res.ok) { setMsg('保存失敗（権限を確認）'); return }
            setMsg('保存しました（再読込で反映）')
        } catch { setMsg('通信エラー') } finally { setSaving(false); setTimeout(() => setMsg(''), 2500) }
    }

    return (
        <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-black text-indigo-700">注目カード編集（管理者）</span>
                <button onClick={save} disabled={saving} className="text-[11px] font-bold text-white bg-gray-900 rounded px-3 py-1 disabled:opacity-40">{saving ? '保存中…' : '保存'}</button>
            </div>
            <div className="flex gap-1 mb-1">
                <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') add() }}
                    list="city-card-names" placeholder="カード名を選択（実データから候補表示）"
                    className="flex-1 rounded border border-gray-300 px-2 py-1 text-xs text-gray-900" />
                <button onClick={add} className="text-[11px] font-bold border border-gray-300 rounded px-2 py-1 text-gray-700">追加</button>
            </div>
            <p className="text-[10px] text-gray-400 mb-2">※ 実データに存在するカード名のみ採用率に反映されます（候補から選んでください）。</p>
            <div className="space-y-1">
                {cards.map((c, i) => (
                    <div key={c} className="flex items-center gap-1 text-xs">
                        <span className="text-gray-400 w-4 text-right">{i + 1}</span>
                        <span className={`flex-1 truncate ${nameSet.has(c) ? 'text-gray-800' : 'text-rose-500'}`} title={nameSet.has(c) ? '' : '実データに一致するカードがありません（採用率に反映されません）'}>{c}{!nameSet.has(c) && ' ⚠'}</span>
                        <button onClick={() => move(i, -1)} className="text-gray-400 hover:text-gray-700 px-1">▲</button>
                        <button onClick={() => move(i, 1)} className="text-gray-400 hover:text-gray-700 px-1">▼</button>
                        <button onClick={() => remove(c)} className="text-rose-500 hover:text-rose-700 px-1">×</button>
                    </div>
                ))}
                {cards.length === 0 && <p className="text-[11px] text-gray-400">カード未設定。上で追加してください。</p>}
            </div>
            {msg && <p className="mt-1 text-[11px] font-bold text-emerald-700">{msg}</p>}
        </div>
    )
}
