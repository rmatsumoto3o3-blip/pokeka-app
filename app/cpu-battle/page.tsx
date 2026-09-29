'use client'

import { useEffect, useReducer, useRef, useCallback } from 'react'
import { fetchDeckData, buildDeck, shuffle, type Card } from '@/lib/deckParser'

// v1：実カードを表示しつつ「相手として動く」CPU。ルール（合法手の生成・適用）はブラウザ側、
// 採点(1手選択)はGAS(action:"think")に投げる。攻撃・HPは抽象（構造CPU）。複雑効果は次段。
const DECK_YOU = 'fwkVFb-n4PCqA-VkvFwV' // あなた：メガレックウザ系
const DECK_CPU = 'VvF55b-j0DDfQ-wFkkVF' // CPU：ドラパルト系
const CPU_VERSION = 'v1-abstract'

const isPokemon = (c: Card) => c.supertype === 'Pokémon' || c.supertype === 'Pokemon'
const isEnergy = (c: Card) => c.supertype === 'Energy'

type Mon = { card: Card; energy: number; dmg: number; hp: number }
type Side = {
    deck: Card[]; hand: Card[]; active: Mon | null; bench: Mon[]; prizes: number; discard: Card[]
    name: string; energyAttached: boolean
}
type Game = { you: Side; cpu: Side; turn: 'you' | 'cpu'; result: string | null; log: string[]; busy: boolean; turns: number }

const monOf = (c: Card): Mon => ({ card: c, energy: 0, dmg: 0, hp: c.hp && c.hp > 0 ? c.hp : 120 })

async function loadDeck(code: string) { return shuffle(buildDeck(await fetchDeckData(code))) }

function setupSide(full: Card[], name: string): Side {
    let deck = [...full], hand: Card[] = []
    for (let a = 0; a < 20; a++) { deck = shuffle(full); hand = deck.slice(0, 7); if (hand.some(isPokemon)) break }
    deck = deck.slice(7)
    deck = deck.slice(6) // サイド6
    const idx = hand.findIndex(isPokemon)
    const active = idx >= 0 ? monOf(hand.splice(idx, 1)[0]) : null
    return { deck, hand, active, bench: [], prizes: 6, discard: [], name, energyAttached: false }
}

// ---- 抽象戦闘：攻撃ダメージ = エネ数 × 30 ----
const atkDamage = (m: Mon) => m.energy * 30

// attacker が defender の active を攻撃。KO・サイド・勝敗を処理し、ログを積む。
function doAttack(attacker: Side, defender: Side, g: Game, who: string) {
    if (!attacker.active) return
    const dmg = atkDamage(attacker.active)
    g.log.push(`${who}のワザ：${attacker.active.card.name} が ${dmg} ダメージ`)
    if (!defender.active) return
    defender.active.dmg += dmg
    if (defender.active.dmg >= defender.active.hp) {
        g.log.push(`→ ${defender.active.card.name} をきぜつ`)
        defender.discard.push(defender.active.card)
        defender.active = null
        attacker.prizes -= 1
        if (attacker.prizes <= 0) { g.result = `${who}の勝ち（サイドを取り切った）`; return }
        // 昇格
        if (defender.bench.length > 0) { defender.active = defender.bench.shift()! }
        else { g.result = `${who}の勝ち（相手の場にポケモンがいない）` }
    }
}

// ---- CPUの合法手生成 ----
type Move = { type: string; damage?: number; koTarget?: boolean; toAttacker?: boolean }
function cpuLegalMoves(g: Game): Move[] {
    const c = g.cpu, y = g.you, mv: Move[] = []
    if (c.active && !c.energyAttached && c.hand.some(isEnergy)) mv.push({ type: 'attachEnergy', toAttacker: true })
    if (c.bench.length < 5 && c.hand.some(isPokemon)) mv.push({ type: 'bench' })
    if (c.active && c.active.energy >= 1) {
        const dmg = atkDamage(c.active)
        const ko = !!(y.active && y.active.dmg + dmg >= y.active.hp)
        mv.push({ type: 'attack', damage: dmg, koTarget: ko })
    }
    if (c.deck.length > 0) mv.push({ type: 'draw' })
    mv.push({ type: 'pass' })
    return mv
}

function cpuState(g: Game) {
    const c = g.cpu, y = g.you
    return {
        turn: g.turns, myPrizes: c.prizes, oppPrizes: y.prizes, myHand: c.hand.length, myBench: c.bench.length,
        oppBench: y.bench.length, myActiveHp: c.active ? c.active.hp - c.active.dmg : 0, myActiveEnergy: c.active?.energy || 0,
        oppActiveHp: y.active ? y.active.hp - y.active.dmg : 0,
    }
}

export default function CpuBattlePage() {
    const gameRef = useRef<Game | null>(null)
    const [, force] = useReducer((x) => x + 1, 0)
    const loadingRef = useRef(true)
    const errRef = useRef('')

    const start = useCallback(async () => {
        loadingRef.current = true; errRef.current = ''; gameRef.current = null; force()
        try {
            const [dy, dc] = await Promise.all([loadDeck(DECK_YOU), loadDeck(DECK_CPU)])
            gameRef.current = {
                you: setupSide(dy, 'あなた（メガレックウザ）'), cpu: setupSide(dc, 'CPU（ドラパルト）'),
                turn: 'you', result: null, log: ['ゲーム開始（先攻：あなた）'], busy: false, turns: 1,
            }
        } catch (e) { errRef.current = 'デッキの読み込みに失敗：' + String(e) }
        finally { loadingRef.current = false; force() }
    }, [])
    useEffect(() => { start() }, [start])

    // ---- プレイヤーの操作 ----
    const g = gameRef.current
    const canAct = !!g && g.turn === 'you' && !g.result && !g.busy

    const playBench = () => {
        if (!canAct) return; const s = g!.you
        const i = s.hand.findIndex(isPokemon); if (i < 0 || s.bench.length >= 5) return
        s.bench.push(monOf(s.hand.splice(i, 1)[0])); g!.log.push('あなた：ベンチに展開'); force()
    }
    const attachEnergy = () => {
        if (!canAct) return; const s = g!.you
        if (!s.active || s.energyAttached) return
        const i = s.hand.findIndex(isEnergy); if (i < 0) return
        s.hand.splice(i, 1); s.active.energy += 1; s.energyAttached = true
        g!.log.push(`あなた：エネ加速（${s.active.card.name} にエネ${s.active.energy}）`); force()
    }
    const draw = () => {
        if (!canAct) return; const s = g!.you; if (!s.deck.length) return
        s.hand.push(s.deck.shift()!); force()
    }
    const attack = () => {
        if (!canAct || !g!.you.active || g!.you.active.energy < 1) return
        doAttack(g!.you, g!.cpu, g!, 'あなた')
        if (!g!.result) endTurn()
        else { finishGame(); force() }
    }

    const endTurn = () => {
        if (!g || g.result) return
        g.you.energyAttached = false
        g.turn = 'cpu'; g.busy = true; force()
        setTimeout(() => runCpuTurn(), 500)
    }

    // ---- CPUの自動ターン ----
    const runCpuTurn = async () => {
        if (!g || g.result) return
        const c = g.cpu
        if (c.deck.length) { c.hand.push(c.deck.shift()!); g.log.push('CPU：ドロー') }
        c.energyAttached = false
        force()
        for (let step = 0; step < 6 && !g.result; step++) {
            const moves = cpuLegalMoves(g)
            let idx = moves.findIndex(m => m.type === 'pass')
            try {
                const res = await fetch('/api/cpu-think', {
                    method: 'POST', headers: { 'content-type': 'application/json' },
                    body: JSON.stringify({ state: cpuState(g), legalMoves: moves }),
                })
                const j = await res.json().catch(() => null)
                if (j && typeof j.moveIndex === 'number' && j.moveIndex >= 0 && j.moveIndex < moves.length) idx = j.moveIndex
            } catch { /* フォールバックでpass */ }
            const m = moves[idx]
            await new Promise(r => setTimeout(r, 450))
            if (m.type === 'attachEnergy') {
                const ei = c.hand.findIndex(isEnergy); if (ei >= 0 && c.active) { c.hand.splice(ei, 1); c.active.energy += 1; c.energyAttached = true; g.log.push(`CPU：エネ加速（エネ${c.active.energy}）`) }
            } else if (m.type === 'bench') {
                const pi = c.hand.findIndex(isPokemon); if (pi >= 0 && c.bench.length < 5) { c.bench.push(monOf(c.hand.splice(pi, 1)[0])); g.log.push('CPU：ベンチ展開') }
            } else if (m.type === 'draw') {
                if (c.deck.length) { c.hand.push(c.deck.shift()!); g.log.push('CPU：ドロー') }
            } else if (m.type === 'attack') {
                doAttack(c, g.you, g, 'CPU'); force(); break
            } else { g.log.push('CPU：パス'); force(); break }
            force()
        }
        if (g.result) { finishGame() }
        else { g.turn = 'you'; g.turns += 1; g.busy = false; g.log.push('― あなたの番 ―') }
        force()
    }

    const finishGame = () => {
        if (!g) return
        // 対戦ログをGASへ（学習材料）
        const result = g.result?.includes('あなたの勝ち') ? 'lose' : g.result?.includes('CPUの勝ち') ? 'win' : 'draw'
        try {
            fetch('/api/pt', { // 中継（practice_logと同経路）→ GASのlogに転送
                method: 'POST', headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ battle: { result, turns: g.turns, cpuVersion: CPU_VERSION, humanDeck: DECK_YOU, cpuDeck: DECK_CPU, trace: g.log } }),
                keepalive: true,
            }).catch(() => { })
        } catch { }
    }

    return (
        <div className="min-h-screen bg-slate-50 text-gray-900">
            <div className="max-w-3xl mx-auto px-3 py-4">
                <div className="flex items-center justify-between mb-1">
                    <h1 className="text-lg font-extrabold">CPU対戦 <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 rounded px-2 py-0.5 ml-1">v1</span></h1>
                    <button onClick={start} className="text-sm px-3 py-1.5 rounded-lg bg-emerald-600 text-white">最初から</button>
                </div>

                {loadingRef.current && <div className="p-8 text-center text-gray-500">デッキ読み込み中…</div>}
                {errRef.current && <div className="p-4 rounded-lg bg-rose-50 text-rose-700 text-sm">{errRef.current}</div>}

                {g && !loadingRef.current && (
                    <div className="space-y-3">
                        {g.result && <div className="p-3 rounded-lg bg-amber-100 text-amber-900 font-bold text-center">{g.result}</div>}
                        <BoardPanel s={g.cpu} mine={false} />
                        <div className="text-center text-xs text-gray-400">— VS —{g.turn === 'cpu' && !g.result && <span className="ml-2 text-rose-500 font-bold">CPU思考中…</span>}</div>
                        <BoardPanel s={g.you} mine={true} />

                        {/* 操作 */}
                        <div className="flex flex-wrap gap-2 justify-center bg-white rounded-xl border border-gray-100 p-3">
                            <button onClick={draw} disabled={!canAct} className="btn">1枚引く</button>
                            <button onClick={playBench} disabled={!canAct} className="btn">ベンチに出す</button>
                            <button onClick={attachEnergy} disabled={!canAct} className="btn">エネ加速</button>
                            <button onClick={attack} disabled={!canAct || !g.you.active || g.you.active.energy < 1} className="btn-red">ワザ（{g.you.active ? atkDamage(g.you.active) : 0}）</button>
                            <button onClick={endTurn} disabled={!canAct} className="btn-dark">番を終了</button>
                        </div>

                        {/* ログ */}
                        <div className="bg-white rounded-xl border border-gray-100 p-3 max-h-40 overflow-y-auto text-xs text-gray-600 space-y-0.5">
                            {g.log.slice(-12).map((l, i) => <div key={i}>{l}</div>)}
                        </div>
                    </div>
                )}
            </div>
            <style>{`.btn{font-size:12px;font-weight:700;padding:6px 12px;border-radius:8px;background:#eef2ff;color:#4338ca}.btn:disabled{opacity:.4}.btn-red{font-size:12px;font-weight:700;padding:6px 12px;border-radius:8px;background:#e11d48;color:#fff}.btn-red:disabled{opacity:.4}.btn-dark{font-size:12px;font-weight:700;padding:6px 12px;border-radius:8px;background:#111827;color:#fff}.btn-dark:disabled{opacity:.4}`}</style>
        </div>
    )
}

function CardImg({ c, small, hidden, mon }: { c?: Card | null; small?: boolean; hidden?: boolean; mon?: Mon | null }) {
    const w = small ? 'w-11' : 'w-16'
    if (hidden) return <div className={`${w} aspect-[63/88] rounded-md bg-gradient-to-br from-blue-800 to-blue-600 border border-blue-900`} />
    const card = mon ? mon.card : c
    if (!card) return <div className={`${w} aspect-[63/88] rounded-md border border-dashed border-gray-300 bg-white/60`} />
    return (
        <div className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={card.imageUrl} alt={card.name} title={card.name} className={`${w} aspect-[63/88] rounded-md border border-gray-200 object-cover bg-white`} loading="lazy" />
            {mon && <span className="absolute -bottom-1 -right-1 flex gap-0.5">
                {mon.energy > 0 && <span className="text-[9px] font-black bg-yellow-400 text-yellow-900 rounded-full px-1">⚡{mon.energy}</span>}
                {mon.dmg > 0 && <span className="text-[9px] font-black bg-rose-600 text-white rounded-full px-1">{mon.dmg}</span>}
            </span>}
        </div>
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
                    <CardImg mon={s.active} />
                </div>
                <div className="min-w-0">
                    <div className="text-[11px] text-gray-500 mb-1">ベンチ</div>
                    <div className="flex gap-1 flex-wrap">
                        {s.bench.length ? s.bench.map((m, i) => <CardImg key={i} mon={m} small />) : <span className="text-xs text-gray-400">なし</span>}
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
