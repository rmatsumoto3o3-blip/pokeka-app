'use client'

import { useEffect, useState, useCallback } from 'react'
import { fetchDeckData, buildDeck, shuffle, type Card } from '@/lib/deckParser'

// v1 骨格：実デッキ2つを読み込み、実カード画像で2面盤面を描く。
// ターン進行・CPU思考(GAS)・カード効果は次段階で載せる。
const DECK_YOU = 'fwkVFb-n4PCqA-VkvFwV' // あなた：メガレックウザ系
const DECK_CPU = 'VvF55b-j0DDfQ-wFkkVF' // CPU：ドラパルト系

type Side = {
    deck: Card[]
    hand: Card[]
    active: Card | null
    bench: Card[]
    prizes: number
    discard: Card[]
    name: string
}

const isPokemon = (c: Card) => c.supertype === 'Pokémon' || c.supertype === 'Pokemon'

// デッキコード→シャッフル済みの山
async function loadDeck(code: string): Promise<Card[]> {
    const data = await fetchDeckData(code)
    return shuffle(buildDeck(data))
}

// 初期セットアップ：手札7(たね保証の簡易マリガン)・バトル場にポケモン1体・サイド6
function setupSide(full: Card[], name: string): Side {
    let deck = [...full]
    let hand: Card[] = []
    for (let attempt = 0; attempt < 20; attempt++) {
        deck = shuffle(full)
        hand = deck.slice(0, 7)
        if (hand.some(isPokemon)) break
    }
    deck = deck.slice(7)
    const prizes = deck.slice(0, 6)
    deck = deck.slice(6)
    // バトル場：手札の最初のポケモン
    const idx = hand.findIndex(isPokemon)
    const active = idx >= 0 ? hand.splice(idx, 1)[0] : null
    return { deck, hand, active, bench: [], prizes: prizes.length, discard: [], name }
}

function CardImg({ c, small, hidden }: { c?: Card | null; small?: boolean; hidden?: boolean }) {
    const w = small ? 'w-11' : 'w-16'
    if (hidden) {
        return <div className={`${w} aspect-[63/88] rounded-md bg-gradient-to-br from-blue-800 to-blue-600 border border-blue-900 shadow-sm`} />
    }
    if (!c) return <div className={`${w} aspect-[63/88] rounded-md border border-dashed border-gray-300 bg-white/60`} />
    return (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={c.imageUrl} alt={c.name} title={c.name}
            className={`${w} aspect-[63/88] rounded-md border border-gray-200 shadow-sm object-cover bg-white`} loading="lazy" />
    )
}

function BoardPanel({ s, mine }: { s: Side; mine: boolean }) {
    return (
        <div className={`rounded-xl border p-3 ${mine ? 'bg-emerald-50 border-emerald-200' : 'bg-rose-50 border-rose-200'}`}>
            <div className="flex items-center justify-between mb-2">
                <b className="text-sm text-gray-900">{s.name}</b>
                <span className="text-xs font-bold text-gray-700">サイド {s.prizes}｜手札 {s.hand.length}｜山 {s.deck.length}｜トラッシュ {s.discard.length}</span>
            </div>
            <div className="flex gap-4 items-start flex-wrap">
                <div>
                    <div className="text-[11px] text-gray-500 mb-1">バトル場</div>
                    <CardImg c={s.active} />
                </div>
                <div className="min-w-0">
                    <div className="text-[11px] text-gray-500 mb-1">ベンチ</div>
                    <div className="flex gap-1 flex-wrap">
                        {s.bench.length ? s.bench.map((c, i) => <CardImg key={i} c={c} small />) : <span className="text-xs text-gray-400">なし</span>}
                    </div>
                </div>
            </div>
            <div className="mt-2">
                <div className="text-[11px] text-gray-500 mb-1">手札</div>
                <div className="flex gap-1 flex-wrap">
                    {s.hand.map((c, i) => <CardImg key={i} c={mine ? c : undefined} small hidden={!mine} />)}
                </div>
            </div>
        </div>
    )
}

export default function CpuBattlePage() {
    const [you, setYou] = useState<Side | null>(null)
    const [cpu, setCpu] = useState<Side | null>(null)
    const [loading, setLoading] = useState(true)
    const [err, setErr] = useState<string>('')

    const start = useCallback(async () => {
        setLoading(true); setErr('')
        try {
            const [dy, dc] = await Promise.all([loadDeck(DECK_YOU), loadDeck(DECK_CPU)])
            setYou(setupSide(dy, 'あなた（メガレックウザ）'))
            setCpu(setupSide(dc, 'CPU（ドラパルト）'))
        } catch (e) {
            setErr('デッキの読み込みに失敗しました：' + String(e))
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => { start() }, [start])

    return (
        <div className="min-h-screen bg-slate-50 text-gray-900">
            <div className="max-w-3xl mx-auto px-3 py-4">
                <div className="flex items-center justify-between mb-1">
                    <h1 className="text-lg font-extrabold">CPU対戦 <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 rounded px-2 py-0.5 ml-1">v1 骨格・実カード</span></h1>
                    <button onClick={start} className="text-sm px-3 py-1.5 rounded-lg bg-emerald-600 text-white">引き直し</button>
                </div>
                <p className="text-xs text-gray-500 mb-3">実デッキ2つを現存の仕組みで読み込み、実カード画像で2面盤面を描画（次段階：ターン進行・GAS思考・カード効果）。</p>

                {loading && <div className="p-8 text-center text-gray-500">デッキ読み込み中…</div>}
                {err && <div className="p-4 rounded-lg bg-rose-50 text-rose-700 text-sm">{err}</div>}
                {!loading && !err && cpu && you && (
                    <div className="space-y-3">
                        <BoardPanel s={cpu} mine={false} />
                        <div className="text-center text-xs text-gray-400">— VS —</div>
                        <BoardPanel s={you} mine={true} />
                    </div>
                )}
            </div>
        </div>
    )
}
