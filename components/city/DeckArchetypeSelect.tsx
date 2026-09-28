'use client'
import { useCityAdmin } from './CityAdminContext'

// 各デッキの下に出す区分セレクタ（管理モード時のみ表示）。既存アーキタイプから選択＋新規。
export default function DeckArchetypeSelect({ deckId, auto }: { deckId: string; auto: string | null }) {
    const ctx = useCityAdmin()
    if (!ctx || !ctx.on) return null
    const current = ctx.getOverride(deckId) || ''
    return (
        <div className="mt-1.5 flex items-center gap-2 flex-wrap">
            <span className="text-[11px] font-bold text-indigo-600">区分</span>
            <select
                value={current}
                onChange={async e => {
                    let v = e.target.value
                    if (v === '__new__') {
                        const n = typeof window !== 'undefined' ? window.prompt('新しいアーキタイプ名') : ''
                        if (!n || !n.trim()) return
                        v = n.trim()
                    }
                    await ctx.save(deckId, v)
                }}
                className="text-xs border border-gray-300 rounded px-2 py-1 text-gray-900 bg-white max-w-[240px]"
            >
                <option value="">自動（{auto || '—'}）</option>
                {ctx.existing.length > 0 && (
                    <optgroup label="既存アーキタイプ">
                        {ctx.existing.map(o => <option key={'e-' + o} value={o}>{o}</option>)}
                    </optgroup>
                )}
                {ctx.auto.length > 0 && (
                    <optgroup label="検出された構成">
                        {ctx.auto.map(o => <option key={'a-' + o} value={o}>{o}</option>)}
                    </optgroup>
                )}
                <option value="__new__">＋新規…</option>
            </select>
            {current && <span className="text-[11px] font-bold text-emerald-700">→ {current}</span>}
        </div>
    )
}
