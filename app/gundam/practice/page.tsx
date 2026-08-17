'use client'

import { useState } from 'react'
import { fetchGundamDeckByCode } from './actions'

// ガンダムカードゲーム 一人回し／2人手動（試作v4 / ローカル専用）
// 公式総合ルール Ver.1.8.0・公式プレイシート準拠：
//  - 自分(P1)・相手(P2)の両盤面を表示し、手番を交互に切り替えて両側を手動操作する。
//  - メインデッキ=50枚（ユニット/パイロット/コマンド/ベース）。リソースは別枠デッキ10枚。
//  - リソースフェイズに1枚アクティブで置く（1ターン1枚・上限15）。Lv.＝リソース枚数、コスト＝レストで支払い。
//  - シールドエリア＝ベース置き場(最大1)＋シールド置き場(6・各HP1)。EXベースは初期配置トークン。後攻はEXリソース1枚。
//  - パイロットはユニットに重ねてセット。スタート＝レストを全アクティブに戻す。
// カード効果・厳密なアタック処理は未実装（盤面の手動操作のみ）。
// デッキ読込後は入力欄を折りたたむ（editRow）。

type CardType = 'unit' | 'pilot' | 'command' | 'base'
type Card = { id: number; name: string; type: CardType; color: string; rested?: boolean; token?: boolean; pilots?: Card[]; img?: string; level?: number; cost?: number }
type Res = { id: number; rested?: boolean; ex?: boolean }
type PS = {
    deck: Card[]; resourceDeck: number; resources: Res[]; hand: Card[]
    battle: Card[]; shields: number; base: Card | null; trash: Card[]
    mulliganUsed: boolean; placedRes: boolean
}
type PIdx = 0 | 1

const TYPE_LABEL: Record<CardType, string> = { unit: 'ユニット', pilot: 'パイロット', command: 'コマンド', base: 'ベース' }
const TYPE_COLOR: Record<CardType, string> = { unit: '#2563eb', pilot: '#16a34a', command: '#7c3aed', base: '#374151' }
const PLAYER_NAME = ['自分（P1）', '相手（P2）']

const RES_MAX = 15
const SHIELD_INIT = 6

let uid = 1
const mk = (type: CardType, i: number): Card => ({ id: uid++, name: `${TYPE_LABEL[type]}${i}`, type, color: TYPE_COLOR[type] })
// メインデッキ=50枚（ダミー・同No.4枚まで・1〜2色の制約は試作では省略）
function buildDeck(): Card[] {
    const d: Card[] = []
    for (let i = 0; i < 26; i++) d.push(mk('unit', i + 1))
    for (let i = 0; i < 12; i++) d.push(mk('pilot', i + 1))
    for (let i = 0; i < 8; i++) d.push(mk('command', i + 1))
    for (let i = 0; i < 4; i++) d.push(mk('base', i + 1))
    return shuffle(d)
}
function shuffle<T>(a: T[]): T[] { const r = [...a]; for (let i = r.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[r[i], r[j]] = [r[j], r[i]] } return r }

const EMPTY_PS: PS = { deck: [], resourceDeck: 0, resources: [], hand: [], battle: [], shields: 0, base: null, trash: [], mulliganUsed: false, placedRes: false }

// 50枚のソースから初期盤面を作る（isFirst=先攻ならEXリソースなし、後攻は1枚）
function dealPlayer(source: Card[], isFirst: boolean): PS {
    const d = shuffle(source.map(c => ({ ...c, id: uid++, rested: false, pilots: undefined })))
    d.splice(0, SHIELD_INIT) // シールド6枚
    const hand = d.splice(0, 5) // 初手5枚
    return {
        deck: d, resourceDeck: 10,
        resources: isFirst ? [] : [{ id: uid++, rested: false, ex: true }],
        hand, battle: [], shields: SHIELD_INIT,
        base: { id: uid++, name: 'EXベース', type: 'base', color: '#0f766e', token: true },
        trash: [], mulliganUsed: false, placedRes: false,
    }
}

function CardChip({ card, onClick, onContext, onHover, selected, small }: { card: Card; onClick?: () => void; onContext?: () => void; onHover?: (c: Card) => void; selected?: boolean; small?: boolean }) {
    const w = small ? 40 : 54, h = small ? 56 : 76
    const pilot = card.pilots && card.pilots.length > 0 ? card.pilots[0] : null
    return (
        // リンク時はパイロットカードを下に重ねた見た目（右下にずらして背面に配置）
        <span className={`relative inline-block shrink-0 ${pilot ? 'pb-1.5 pr-1.5' : ''}`}>
            {pilot && (
                <span className="absolute bottom-0 right-0 rounded-md border border-white/70 shadow-sm overflow-hidden flex items-center justify-center text-[7px] font-bold text-white" style={{ background: pilot.color, width: w, height: h }}>
                    {pilot.img ? <img src={pilot.img} alt={pilot.name} className="w-full h-full object-cover" /> : <span className="line-clamp-2 px-0.5">{pilot.name}</span>}
                </span>
            )}
            <button
                onClick={onClick}
                onContextMenu={e => { e.preventDefault(); onContext?.() }}
                onMouseEnter={() => onHover?.(card)}
                className={`relative block rounded-md border text-[9px] font-bold flex items-center justify-center text-center leading-tight px-0.5 overflow-hidden transition ${selected ? 'ring-2 ring-yellow-400 border-yellow-400' : 'border-black/10'} ${card.rested ? 'rotate-90' : ''}`}
                style={{ background: card.color, width: w, height: h, color: '#fff' }}
                title={`${card.name}（${TYPE_LABEL[card.type]}）${card.level != null ? ` Lv${card.level}/C${card.cost}` : ''}${pilot ? `／リンク：${pilot.name}` : ''}${card.rested ? '・レスト' : ''}`}
            >
                {card.img && <img src={card.img} alt={card.name} className="absolute inset-0 w-full h-full object-cover" />}
                {!card.img && <span className="line-clamp-2">{card.name}</span>}
                {pilot && (
                    <span className="absolute top-0 left-0 bg-green-600 text-white text-[7px] font-black px-1 rounded-br leading-tight">LINK</span>
                )}
            </button>
        </span>
    )
}

// ホバー中のカードを大きく詳細表示する固定パネル
function CardPreview({ card, onClose }: { card: Card | null; onClose: () => void }) {
    if (!card) return null
    return (
        <div className="fixed z-50 bottom-2 right-2 left-2 sm:left-auto sm:w-[210px] rounded-xl border border-gray-300 bg-white shadow-xl p-2 flex sm:block gap-2">
            <div className="rounded-lg overflow-hidden flex items-center justify-center shrink-0 w-[110px] h-[150px] sm:w-full sm:h-[260px]" style={{ background: card.img ? '#111' : card.color }}>
                {card.img
                    ? <img src={card.img} alt={card.name} className="w-full h-full object-contain" />
                    : <span className="text-white font-black text-sm px-2 text-center">{card.name}</span>}
            </div>
            <div className="text-xs text-gray-800 flex-1 min-w-0">
                <div className="flex items-center justify-between mb-0.5">
                    <span className="text-[10px] font-bold text-gray-500">カード詳細</span>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-sm leading-none px-1">×</button>
                </div>
                <div className="font-bold text-sm leading-tight">{card.name}</div>
                <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-[11px] text-gray-600">
                    <span>種別：<span className="font-bold text-gray-800">{TYPE_LABEL[card.type]}</span></span>
                    {card.level != null && <span>Lv.<span className="font-bold text-gray-800">{card.level}</span></span>}
                    {card.cost != null && <span>コスト<span className="font-bold text-gray-800">{card.cost}</span></span>}
                    {card.pilots && card.pilots.length > 0 && <span>パイロット<span className="font-bold text-green-700">{card.pilots.length}</span></span>}
                </div>
            </div>
        </div>
    )
}

export default function GundamPracticePage() {
    const [players, setPlayers] = useState<[PS, PS]>([EMPTY_PS, EMPTY_PS])
    const [active, setActive] = useState<PIdx>(0)
    const [turn, setTurn] = useState<number>(0)
    const [firstPlayer, setFirstPlayer] = useState<PIdx>(0) // 先攻プレイヤー
    const [selected, setSelected] = useState<{ p: PIdx; card: Card } | null>(null)
    const [preview, setPreview] = useState<Card | null>(null)

    const [loaded, setLoaded] = useState<[Card[] | null, Card[] | null]>([null, null])
    const [labels, setLabels] = useState<[string, string]>(['', ''])
    const [codes, setCodes] = useState<[string, string]>(['', ''])
    const [loadingP, setLoadingP] = useState<PIdx | null>(null)
    const [loadMsg, setLoadMsg] = useState<string>('')
    const [showLoader, setShowLoader] = useState<boolean>(false) // 開始後はデッキ設定を隠す
    const [editRow, setEditRow] = useState<[boolean, boolean]>([false, false]) // デッキコード入力欄を開くか（読込後は畳む）

    const started = players[0].hand.length > 0 || players[0].deck.length > 0 || players[0].shields > 0

    // 片方のプレイヤー状態を更新
    const setP = (i: PIdx, patch: Partial<PS> | ((p: PS) => PS)) =>
        setPlayers(ps => { const np: [PS, PS] = [ps[0], ps[1]]; np[i] = typeof patch === 'function' ? (patch as (p: PS) => PS)(ps[i]) : { ...ps[i], ...patch }; return np })

    // 両者に配る（loaded があれば実カード、なければダミー）
    const deal = () => {
        const p0 = dealPlayer(loaded[0] ?? buildDeck(), firstPlayer === 0)
        const p1 = dealPlayer(loaded[1] ?? buildDeck(), firstPlayer === 1)
        setPlayers([p0, p1]); setActive(firstPlayer); setTurn(1); setSelected(null)
    }
    const reset = () => { setPlayers([EMPTY_PS, EMPTY_PS]); setActive(0); setTurn(0); setSelected(null) }

    // デッキコード読み込み（プレイヤー別）
    const loadFromCode = async (p: PIdx) => {
        setLoadingP(p); setLoadMsg('')
        try {
            const res = await fetchGundamDeckByCode(codes[p])
            if (!res.ok) { setLoadMsg(`${PLAYER_NAME[p]}：${res.error}`); setLoadingP(null); return }
            const cards: Card[] = []
            for (const c of res.cards) for (let i = 0; i < c.count; i++)
                cards.push({ id: uid++, name: c.name, type: c.type, color: TYPE_COLOR[c.type], img: c.imageUrl || undefined, level: c.level, cost: c.cost })
            setLoaded(l => { const n: [Card[] | null, Card[] | null] = [l[0], l[1]]; n[p] = cards; return n })
            setLabels(l => { const n: [string, string] = [l[0], l[1]]; n[p] = `実カード${res.total}枚`; return n })
            setEditRow(e => { const n: [boolean, boolean] = [e[0], e[1]]; n[p] = false; return n }) // 読込成功で畳む
            if (res.total !== 50) setLoadMsg(`${PLAYER_NAME[p]}：読み込み${res.total}枚（本来は50枚）`)
        } catch { setLoadMsg(`${PLAYER_NAME[p]}：読み込みに失敗しました`) }
        setLoadingP(null)
    }
    const useDummy = (p: PIdx) => {
        setLoaded(l => { const n: [Card[] | null, Card[] | null] = [l[0], l[1]]; n[p] = null; return n })
        setLabels(l => { const n: [string, string] = [l[0], l[1]]; n[p] = ''; return n })
        setEditRow(e => { const n: [boolean, boolean] = [e[0], e[1]]; n[p] = true; return n }) // 入力欄を再表示
    }
    const editCode = (p: PIdx) => setEditRow(e => { const n: [boolean, boolean] = [e[0], e[1]]; n[p] = true; return n })

    // ==== フェイズ操作（手番プレイヤーに作用）====
    const startPhase = () => setP(active, pp => ({
        ...pp,
        battle: pp.battle.map(c => ({ ...c, rested: false })),
        resources: pp.resources.map(r => ({ ...r, rested: false })),
        base: pp.base ? { ...pp.base, rested: false } : pp.base,
        placedRes: false,
    }))
    const draw = () => setP(active, pp => pp.deck.length ? { ...pp, hand: [...pp.hand, pp.deck[0]], deck: pp.deck.slice(1) } : pp)
    const placeResource = () => setP(active, pp =>
        (pp.resourceDeck > 0 && !pp.placedRes && pp.resources.length < RES_MAX)
            ? { ...pp, resources: [...pp.resources, { id: uid++, rested: false }], resourceDeck: pp.resourceDeck - 1, placedRes: true }
            : pp)
    const endTurn = () => { setActive(a => (a === 0 ? 1 : 0)); setTurn(t => t + 1); setSelected(null) }

    // 対戦準備の引き直し（各プレイヤー1回・ターン1）
    const mulligan = (p: PIdx) => {
        setP(p, pp => {
            if (pp.mulliganUsed) return pp
            const pool = [...pp.deck, ...pp.hand.map(c => ({ ...c, rested: false, pilots: undefined }))]
            const hand = pool.splice(0, 5)
            return { ...pp, deck: shuffle(pool), hand, mulliganUsed: true }
        })
        setSelected(null)
    }

    // ==== 盤面操作（プレイヤー別）====
    const selectCard = (p: PIdx, card: Card) => setSelected(s => {
        const off = !!(s && s.card.id === card.id)
        setPreview(off ? null : card) // タップで拡大プレビューも出す（モバイル対応）
        return off ? null : { p, card }
    })
    const placeFromHand = (p: PIdx, dest: 'battle' | 'base' | 'trash') => {
        const s = selected
        if (!s || s.p !== p || s.card.type === 'pilot') return
        const card = s.card
        setP(p, pp => {
            const hand = pp.hand.filter(c => c.id !== card.id)
            if (dest === 'battle') return card.type === 'unit' ? (pp.battle.length >= 6 ? pp : { ...pp, hand, battle: [...pp.battle, card] }) : { ...pp, hand, trash: [...pp.trash, card] }
            if (dest === 'base') { const trash = pp.base && !pp.base.token ? [...pp.trash, pp.base] : pp.trash; return { ...pp, hand, base: card, trash } }
            return { ...pp, hand, trash: [...pp.trash, card] }
        })
        setSelected(null)
    }
    const onUnitClick = (p: PIdx, card: Card) => {
        const s = selected
        if (s && s.p === p && s.card.type === 'pilot') {
            if (card.pilots && card.pilots.length >= 1) return
            setP(p, pp => ({ ...pp, hand: pp.hand.filter(c => c.id !== s.card.id), battle: pp.battle.map(c => c.id === card.id ? { ...c, pilots: [...(c.pilots || []), s.card] } : c) }))
            setSelected(null)
        } else {
            setP(p, pp => ({ ...pp, battle: pp.battle.map(c => c.id === card.id ? { ...c, rested: !c.rested } : c) }))
        }
    }
    const battleToTrash = (p: PIdx, card: Card) => setP(p, pp => ({ ...pp, battle: pp.battle.filter(c => c.id !== card.id), trash: [...pp.trash, { ...card, rested: false }, ...(card.pilots || [])] }))
    const toggleRes = (p: PIdx, id: number) => setP(p, pp => ({ ...pp, resources: pp.resources.flatMap(r => r.id !== id ? [r] : (r.ex && !r.rested ? [] : [{ ...r, rested: !r.rested }])) }))
    const breakShield = (p: PIdx) => setP(p, pp => ({ ...pp, shields: Math.max(0, pp.shields - 1) }))
    const toggleBase = (p: PIdx) => setP(p, pp => ({ ...pp, base: pp.base ? { ...pp.base, rested: !pp.base.rested } : pp.base }))
    const removeBase = (p: PIdx) => setP(p, pp => (pp.base && !pp.base.token ? { ...pp, base: null, trash: [...pp.trash, pp.base] } : pp))

    // ==== モバイル用コンパクト盤面（両者を1画面に） ====
    const renderCompactBoard = (p: PIdx) => {
        const P = players[p]
        const isActive = active === p
        const sel = selected && selected.p === p ? selected.card : null
        const level = P.resources.length
        const activeRes = P.resources.filter(r => !r.rested).length
        return (
            <div className={`rounded-lg border-2 p-1.5 ${isActive ? 'border-blue-400 bg-blue-50/40' : 'border-gray-200 bg-white/50'}`}>
                {/* ヘッダー：名前・バッジ・カウント */}
                <div className="flex items-center gap-1.5 mb-1 text-xs">
                    <span className="font-black text-gray-800">{PLAYER_NAME[p]}</span>
                    {isActive && <span className="px-1 py-0.5 rounded bg-blue-600 text-white text-[9px] font-bold">手番</span>}
                    {firstPlayer === p && <span className="px-1 py-0.5 rounded bg-gray-200 text-gray-700 text-[9px] font-bold">先攻</span>}
                    <span className="ml-auto text-[10px] text-gray-600 font-bold">山{P.deck.length}・R{P.resourceDeck}・捨{P.trash.length}</span>
                    <button onClick={() => mulligan(p)} disabled={P.mulliganUsed || turn !== 1} className="px-1.5 py-0.5 rounded bg-white border border-gray-300 text-[10px] font-bold text-gray-800 disabled:opacity-40">引直{P.mulliganUsed ? '済' : ''}</button>
                </div>

                {/* シールド＋ベース＋リソース（1行） */}
                <div className="flex items-start gap-2 mb-1">
                    <div onClick={() => sel?.type === 'base' && placeFromHand(p, 'base')} className={`rounded border p-0.5 ${sel?.type === 'base' ? 'border-yellow-400 bg-yellow-50' : 'border-rose-200'}`} title="ベース置き場">
                        {P.base ? <CardChip card={P.base} small onClick={() => toggleBase(p)} onContext={() => removeBase(p)} onHover={setPreview} /> : <div className="w-10 h-14 rounded border border-dashed border-rose-200 flex items-center justify-center text-[9px] text-gray-400">空</div>}
                    </div>
                    <div className="flex-1">
                        <div className="text-[9px] font-bold text-rose-400">シールド({P.shields})</div>
                        <div className="flex flex-wrap gap-0.5 items-center">
                            {Array.from({ length: P.shields }).map((_, i) => <div key={i} className="w-4 h-6 rounded-sm bg-rose-300 border border-rose-400" title="シールド・HP1" />)}
                            <button onClick={() => breakShield(p)} className="w-4 h-6 rounded-sm border border-dashed border-rose-300 text-rose-500 text-[10px] leading-none" title="1枚ブレイク">−</button>
                        </div>
                        <div className="mt-1 text-[9px] font-bold text-amber-600">リソース Lv.{level}・ア{activeRes}/{RES_MAX}</div>
                        <div className="flex flex-wrap gap-0.5">
                            {P.resources.map(r => (
                                <button key={r.id} onClick={() => toggleRes(p, r.id)} className={`w-4 h-6 rounded-sm border text-[7px] font-black flex items-center justify-center ${r.ex ? (r.rested ? 'rotate-90 bg-sky-200 border-sky-400 text-sky-700' : 'bg-sky-400 border-sky-500 text-white') : (r.rested ? 'rotate-90 bg-amber-200 border-amber-400' : 'bg-amber-400 border-amber-500')}`} title={r.ex ? 'EXリソース' : r.rested ? 'レスト' : 'アクティブ'}>{r.ex ? 'E' : ''}</button>
                            ))}
                            {P.resources.length === 0 && <span className="text-[9px] text-gray-400">手番に配置</span>}
                        </div>
                    </div>
                </div>

                {/* バトルエリア（横スクロール） */}
                <div onClick={() => sel?.type === 'unit' && placeFromHand(p, 'battle')} className={`rounded border p-1 mb-1 ${sel?.type === 'unit' ? 'border-yellow-400 bg-yellow-50' : 'border-dashed border-blue-300'}`}>
                    <div className="text-[9px] font-bold text-blue-500">バトル（{P.battle.length}/6）</div>
                    <div className="flex gap-1 overflow-x-auto min-h-[50px] items-start">
                        {P.battle.map(c => <CardChip key={c.id} card={c} small onClick={() => onUnitClick(p, c)} onContext={() => battleToTrash(p, c)} onHover={setPreview} />)}
                        {P.battle.length === 0 && <span className="text-[9px] text-gray-400 self-center">ユニット配置</span>}
                    </div>
                </div>

                {/* 手札（横スクロール） */}
                <div className="rounded border border-gray-300 bg-white p-1" onClick={() => sel && sel.type !== 'pilot' && false}>
                    <div className="text-[9px] font-bold text-gray-500">手札（{P.hand.length}/10）</div>
                    <div className="flex gap-1 overflow-x-auto min-h-[50px] items-start">
                        {P.hand.map(c => <CardChip key={c.id} card={c} small selected={selected?.card.id === c.id} onClick={() => selectCard(p, c)} onHover={setPreview} />)}
                        {P.hand.length === 0 && <span className="text-[9px] text-gray-400 self-center">手札なし</span>}
                    </div>
                </div>
            </div>
        )
    }

    // ==== 1プレイヤー分の盤面を描画 ====
    const renderBoard = (p: PIdx) => {
        const P = players[p]
        const isActive = active === p
        const sel = selected && selected.p === p ? selected.card : null
        const level = P.resources.length
        const activeRes = P.resources.filter(r => !r.rested).length
        return (
            <div className={`rounded-xl border-2 p-2 ${isActive ? 'border-blue-400 bg-blue-50/30' : 'border-gray-200 bg-white/40'}`}>
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <span className="text-sm font-black text-gray-800">{PLAYER_NAME[p]}</span>
                    {isActive && <span className="px-1.5 py-0.5 rounded bg-blue-600 text-white text-[10px] font-bold">手番</span>}
                    {firstPlayer === p && <span className="px-1.5 py-0.5 rounded bg-gray-200 text-gray-700 text-[10px] font-bold">先攻</span>}
                    {labels[p] && <span className="text-[11px] text-blue-600 font-bold">{labels[p]}</span>}
                    <button onClick={() => mulligan(p)} disabled={P.mulliganUsed || turn !== 1} className="ml-auto px-2 py-1 rounded-md bg-white border border-gray-300 text-xs font-bold text-gray-800 disabled:opacity-40" title="対戦準備で1回だけ・手札をデッキ下に戻して5枚引き直し">引き直し{P.mulliganUsed ? '(済)' : ''}</button>
                </div>

                {sel && (
                    <div className="mb-2 text-xs text-blue-700 font-bold">
                        選択中：{sel.name}（{TYPE_LABEL[sel.type]}）→
                        {sel.type === 'pilot' ? ' 自分のバトルのユニットをクリックしてセット' : sel.type === 'base' ? ' ベース置き場をクリック' : sel.type === 'unit' ? ' バトルエリアをクリック' : ' トラッシュへ（使い切り）'}
                    </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-[180px_1fr_112px] gap-2">
                    {/* 左：シールドエリア＋リソースデッキ */}
                    <div className="flex flex-col gap-2">
                        <div className="rounded-lg border-2 border-rose-300 bg-rose-50/40 p-2">
                            <div className="text-[10px] font-black text-rose-500 mb-1.5">シールドエリア</div>
                            <div className="flex gap-2 items-start">
                                <div onClick={() => sel?.type === 'base' && placeFromHand(p, 'base')} className={`rounded-md border-2 p-1 ${sel?.type === 'base' ? 'border-yellow-400 bg-yellow-50 cursor-pointer' : 'border-rose-200 bg-white/70'}`}>
                                    <div className="text-[9px] font-bold text-rose-400 mb-1">ベース置き場</div>
                                    {P.base
                                        ? <CardChip card={P.base} onClick={() => toggleBase(p)} onContext={() => removeBase(p)} onHover={setPreview} />
                                        : <div className="w-[54px] h-[76px] rounded-md border border-dashed border-rose-200 flex items-center justify-center text-[10px] text-gray-400">空</div>}
                                </div>
                                <div>
                                    <div className="text-[9px] font-bold text-rose-400 mb-1">シールド({P.shields})</div>
                                    <div className="flex flex-col gap-0.5">
                                        {Array.from({ length: P.shields }).map((_, i) => <div key={i} className="w-14 h-3.5 rounded-sm bg-rose-300 border border-rose-400" title="シールド(裏)・HP1" />)}
                                        {P.shields === 0 && <span className="text-[9px] text-rose-400 leading-tight">シールド0<br />次の被弾で敗北</span>}
                                        <button onClick={() => breakShield(p)} className="w-14 h-4 rounded-sm border border-dashed border-rose-300 text-rose-500 text-xs leading-none hover:bg-rose-100" title="シールドを1枚ブレイク">−</button>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="rounded-lg border-2 border-amber-300 bg-amber-50/60 p-1.5 text-center flex md:block items-center justify-center gap-2">
                            <div className="text-[10px] font-bold text-amber-600">リソースデッキ</div>
                            <div className="text-xl font-black text-amber-700 leading-tight">{P.resourceDeck}</div>
                        </div>
                    </div>

                    {/* 中央：バトルエリア＋リソースエリア */}
                    <div className="flex flex-col gap-2">
                        <div onClick={() => sel?.type === 'unit' && placeFromHand(p, 'battle')} title="クリックでレスト/パイロットをセット・右クリックでトラッシュ" className={`rounded-lg border-2 p-2 ${sel?.type === 'unit' ? 'border-yellow-400 bg-yellow-50 cursor-pointer' : 'border-dashed border-blue-300 bg-white/60'}`}>
                            <div className="text-[10px] font-bold text-blue-500 mb-1">バトルエリア（最大6・{P.battle.length}/6）</div>
                            <div className="flex flex-wrap gap-1 min-h-[84px] items-start">
                                {P.battle.map(c => <CardChip key={c.id} card={c} onClick={() => onUnitClick(p, c)} onContext={() => battleToTrash(p, c)} onHover={setPreview} />)}
                                {P.battle.length === 0 && <span className="text-[10px] text-gray-400">ユニットを配置</span>}
                            </div>
                        </div>
                        <div className="rounded-lg border-2 border-dashed border-amber-300 bg-white/60 p-2" title="クリックでレスト＝コスト支払い">
                            <div className="text-[10px] font-bold text-amber-600 mb-1">リソースエリア（Lv.{level}・アクティブ{activeRes}／上限{RES_MAX}）</div>
                            <div className="flex flex-wrap gap-1 min-h-[52px]">
                                {P.resources.map(r => (
                                    <button key={r.id} onClick={() => toggleRes(p, r.id)} className={`relative w-9 h-12 rounded border text-[8px] font-black flex items-center justify-center transition ${r.ex ? (r.rested ? 'rotate-90 bg-sky-200 border-sky-400 text-sky-700' : 'bg-sky-400 border-sky-500 text-white') : (r.rested ? 'rotate-90 bg-amber-200 border-amber-400' : 'bg-amber-400 border-amber-500')}`} title={r.ex ? 'EXリソース（使うと除外）' : r.rested ? 'レスト（使用済み）' : 'アクティブ'}>{r.ex ? 'EX' : ''}</button>
                                ))}
                                {P.resources.length === 0 && <span className="text-[10px] text-gray-400">手番に「リソース置く」で配置</span>}
                            </div>
                        </div>
                    </div>

                    {/* 右：デッキ＋トラッシュ */}
                    <div className="flex md:flex-col gap-2">
                        <div className="flex-1 rounded-lg border-2 border-gray-300 bg-white/60 p-1.5 text-center"><div className="text-[10px] font-bold text-gray-500">デッキ</div><div className="text-xl font-black text-gray-700 leading-tight">{P.deck.length}</div></div>
                        <div className="flex-1 rounded-lg border-2 border-gray-300 bg-white/60 p-1.5 text-center cursor-pointer hover:border-blue-400" onClick={() => sel && sel.type !== 'pilot' && placeFromHand(p, 'trash')}><div className="text-[10px] font-bold text-gray-500">トラッシュ</div><div className="text-xl font-black text-gray-700 leading-tight">{P.trash.length}</div></div>
                    </div>
                </div>

                {/* 手札 */}
                <div className="mt-2 rounded-lg border-2 border-gray-300 bg-white p-2">
                    <div className="text-[10px] font-bold text-gray-500 mb-1">手札（{P.hand.length}／上限10）— クリックで選択</div>
                    <div className="flex flex-wrap gap-1">
                        {P.hand.map(c => <CardChip key={c.id} card={c} selected={selected?.card.id === c.id} onClick={() => selectCard(p, c)} onHover={setPreview} />)}
                        {P.hand.length === 0 && <span className="text-[10px] text-gray-400">手札なし</span>}
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-[#eef2f7] p-2 md:p-4 font-sans">
            <div className="max-w-5xl mx-auto">
                <div className="flex items-center justify-between mb-2 flex-wrap gap-x-2 gap-y-1">
                    <h1 className="text-base md:text-lg font-bold text-gray-900 leading-tight"><span className="hidden md:inline">ガンダムカードゲーム 一人回し／2人手動（試作v4）</span><span className="md:hidden">ガンダム 一人回し（v4）</span>{turn > 0 && <span className="ml-2 text-xs md:text-sm text-gray-600">T{turn}・{PLAYER_NAME[active]}の番</span>}</h1>
                    <div className="flex gap-1.5 flex-wrap">
                        <button onClick={() => setFirstPlayer(f => (f === 0 ? 1 : 0))} disabled={started} className="px-2.5 py-1.5 rounded-lg bg-white border border-gray-300 text-sm font-bold text-gray-800 disabled:opacity-40" title="配る前に切替（先攻／後攻）">先攻：{firstPlayer === 0 ? 'P1' : 'P2'}</button>
                        <button onClick={deal} className="px-3 py-1.5 rounded-lg bg-blue-600 text-white text-sm font-bold hover:bg-blue-700">配る</button>
                        <button onClick={startPhase} disabled={!started} className="px-3 py-1.5 rounded-lg bg-white border border-gray-300 text-sm font-bold text-gray-800 disabled:opacity-40">スタート(全アクティブ)</button>
                        <button onClick={draw} disabled={!started} className="px-3 py-1.5 rounded-lg bg-white border border-gray-300 text-sm font-bold text-gray-800 disabled:opacity-40">ドロー</button>
                        <button onClick={placeResource} disabled={!started} className="px-3 py-1.5 rounded-lg bg-white border border-gray-300 text-sm font-bold text-gray-800 disabled:opacity-40">リソース置く</button>
                        <button onClick={endTurn} disabled={!started} className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 disabled:opacity-40">ターン終了→相手</button>
                        {started && <button onClick={() => setShowLoader(s => !s)} className="px-3 py-1.5 rounded-lg bg-white border border-gray-300 text-sm font-bold text-gray-800">デッキ設定</button>}
                        <button onClick={reset} className="px-3 py-1.5 rounded-lg text-gray-500 text-sm hover:bg-gray-200">全消去</button>
                    </div>
                </div>

                {/* デッキコード読み込み（自分／相手）— 開始後は隠す */}
                {(!started || showLoader) && (
                <div className="mb-3 rounded-lg border border-gray-200 bg-white p-2.5 flex flex-col gap-2">
                    {([0, 1] as PIdx[]).map(p => (
                        <div key={p} className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-bold text-gray-700 w-16">{PLAYER_NAME[p]}</span>
                            {loaded[p] && !editRow[p] ? (
                                <>
                                    <span className="flex-1 min-w-[160px] text-sm font-bold text-emerald-700">✓ {labels[p]}<span className="ml-2 text-xs font-normal text-gray-400">{codes[p]}</span></span>
                                    <button onClick={() => editCode(p)} className="px-2.5 py-1.5 rounded-lg bg-white border border-gray-300 text-xs font-bold text-gray-800 hover:bg-gray-50">変更</button>
                                    <button onClick={() => useDummy(p)} className="px-2.5 py-1.5 rounded-lg text-gray-500 text-xs hover:bg-gray-100">ダミーに戻す</button>
                                </>
                            ) : (
                                <>
                                    <input
                                        value={codes[p]}
                                        onChange={e => setCodes(c => { const n: [string, string] = [c[0], c[1]]; n[p] = e.target.value; return n })}
                                        onKeyDown={e => { if (e.key === 'Enter' && loadingP === null) loadFromCode(p) }}
                                        placeholder="デッキコード（空ならダミー50枚）"
                                        className="flex-1 min-w-[200px] px-2.5 py-1.5 rounded-md border border-gray-300 text-sm text-gray-900"
                                    />
                                    <button onClick={() => loadFromCode(p)} disabled={loadingP !== null || !codes[p].trim()} className="px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-700 disabled:opacity-40">{loadingP === p ? '読み込み中…' : '読み込む'}</button>
                                    {loaded[p] && <button onClick={() => useDummy(p)} className="px-2.5 py-1.5 rounded-lg text-gray-500 text-xs hover:bg-gray-100">ダミーに戻す</button>}
                                </>
                            )}
                        </div>
                    ))}
                    {loadMsg && <span className="text-xs text-rose-600 font-bold">{loadMsg}</span>}
                </div>
                )}

                {!started ? (
                    <div className="text-center text-gray-400 py-24 bg-white rounded-xl border border-dashed">「配る」で開始します（デッキコードは配る前に読み込み）</div>
                ) : (
                    <>
                        {/* デスクトップ：両盤面（相手を上・自分を下） */}
                        <div className="hidden md:flex flex-col gap-3">
                            {renderBoard(1)}
                            <div className="text-center text-[10px] text-gray-400 font-bold">— VS —</div>
                            {renderBoard(0)}
                        </div>
                        {/* モバイル：両盤面をコンパクトに1画面（相手を上・自分を下） */}
                        <div className="md:hidden flex flex-col gap-1.5">
                            {renderCompactBoard(1)}
                            <div className="text-center text-[9px] text-gray-400 font-bold">— VS —</div>
                            {renderCompactBoard(0)}
                        </div>
                    </>
                )}

                <p className="mt-2 text-[11px] text-gray-400">※試作v4：カードはダミー可・実カードはデッキコードから。両盤面を手動操作（手番プレイヤーにフェイズ操作が作用）。手札は両者見えます（ローカル練習用）。カードにマウスを乗せると右下に拡大表示。厳密なアタック・効果処理は未実装。</p>
            </div>
            <CardPreview card={preview} onClose={() => setPreview(null)} />
        </div>
    )
}
