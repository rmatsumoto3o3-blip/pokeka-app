import type {
    AttackContext, AttackDef, Agent, BattleState, CardDef, EnergyCard, EnergyCost,
    EnergyType, PlayerState, PokemonDef, PokemonInPlay, StatusCondition,
} from './types'

// ── レジストリ：カード名 → 定義 ──
export type Registry = Map<string, CardDef>
export function makeRegistry(defs: CardDef[]): Registry {
    const m: Registry = new Map()
    for (const d of defs) m.set(d.name, d)
    return m
}
export const defGetter = (reg: Registry) => (name: string) => reg.get(name)

// ── エネルギー判定 ──
// 付いているエネから「タイプ別の供給数」と「無色に回せる総数」を集計。
function energyPool(attached: EnergyCard[]) {
    const byType: Partial<Record<EnergyType, number>> = {}
    let total = 0
    for (const e of attached) {
        const amt = e.amount ?? 1
        total += amt
        // provides 複数（特殊エネ）は「どれか1タイプとして」扱えるよう、
        // 判定側で貪欲に割り当てる。ここでは代表として全タイプに候補計上。
        for (const t of e.provides) byType[t] = (byType[t] ?? 0) + amt
    }
    return { byType, total, cards: attached }
}

// コストを支払えるか。特殊エネの多タイプは貪欲割当で近似（大半のケースで正しい）。
export function canPayCost(cost: EnergyCost, attached: EnergyCard[]): boolean {
    const need: [EnergyType, number][] = Object.entries(cost)
        .map(([t, n]) => [t as EnergyType, n as number])
    // 無色は最後に回す。
    need.sort((a, b) => (a[0] === 'Colorless' ? 1 : 0) - (b[0] === 'Colorless' ? 1 : 0))
    // 各エネカードを1タイプに確定させながら割り当て。
    const cards = attached.flatMap(e => {
        const amt = e.amount ?? 1
        return Array.from({ length: amt }, () => e.provides)
    })
    const used = new Array(cards.length).fill(false)
    for (const [type, count] of need) {
        let remaining = count
        if (type === 'Colorless') continue // 後述の総数チェックで処理
        for (let i = 0; i < cards.length && remaining > 0; i++) {
            if (!used[i] && cards[i].includes(type)) { used[i] = true; remaining-- }
        }
        if (remaining > 0) return false
    }
    const colorless = cost.Colorless ?? 0
    const leftover = used.filter(u => !u).length
    return leftover >= colorless
}

// ── 盤面ヘルパ ──
export function hpOf(mon: PokemonInPlay): number { return mon.def.hp }
export function isKO(mon: PokemonInPlay): boolean { return mon.damage >= hpOf(mon) }
export function pokemonInPlay(p: PlayerState): PokemonInPlay[] {
    return [p.active, ...p.bench].filter(Boolean) as PokemonInPlay[]
}
export function hasAnyPokemon(p: PlayerState): boolean { return pokemonInPlay(p).length > 0 }

// 弱点・抵抗を反映した最終ダメージ。
export function applyWeaknessResistance(base: number, attacker: PokemonInPlay, target: PokemonInPlay): number {
    if (base <= 0) return base
    let dmg = base
    const w = target.def.weakness
    if (w && attacker.def.types.includes(w.type)) dmg *= w.factor
    const r = target.def.resistance
    if (r && attacker.def.types.includes(r.type)) dmg = Math.max(0, dmg - r.minus)
    return dmg
}

// ── きぜつ処理とサイド ──
// side がワザ／効果を行った直後に呼ぶ。相手のきぜつ→side がサイド、side自身のきぜつ→相手がサイド。
export function resolveKnockOuts(state: BattleState, actingSide: 0 | 1): void {
    const act = state.players[actingSide]
    const opp = state.players[(actingSide ^ 1) as 0 | 1]
    // 相手のきぜつ → act がサイドを取る
    collectKO(state, opp, act)
    // 自分のきぜつ（反動等） → opp がサイドを取る
    collectKO(state, act, opp)
    checkWin(state)
}

function collectKO(state: BattleState, owner: PlayerState, prizeTaker: PlayerState): void {
    const koActive = owner.active && isKO(owner.active)
    // ベンチ
    for (let i = 0; i < owner.bench.length; i++) {
        const m = owner.bench[i]
        if (m && isKO(m)) {
            trashMon(owner, m)
            owner.bench[i] = null
            prizeTaker.prizes = Math.max(0, prizeTaker.prizes - prizeCountFor(m))
            state.log.push(`${owner.name}の${m.def.name}がきぜつ。${prizeTaker.name}がサイドを取る`)
        }
    }
    if (koActive && owner.active) {
        const m = owner.active
        trashMon(owner, m)
        owner.active = null
        prizeTaker.prizes = Math.max(0, prizeTaker.prizes - prizeCountFor(m))
        state.log.push(`${owner.name}のバトルポケモン${m.def.name}がきぜつ。${prizeTaker.name}がサイドを取る`)
    }
}

// exなどは2枚。ルール配列で判定。
function prizeCountFor(mon: PokemonInPlay): number {
    const r = mon.def.rule || []
    if (r.includes('VMAX') || r.includes('VSTAR')) return r.includes('VMAX') ? 3 : 2
    if (r.includes('ex') || r.includes('V') || r.includes('MegaEx')) return 2
    return 1
}

function trashMon(owner: PlayerState, mon: PokemonInPlay): void {
    for (const d of mon.stack) owner.discard.push(d.name)
    for (const e of mon.attached) owner.discard.push(e.name)
    for (const t of mon.tools) owner.discard.push(t)
}

// 勝敗判定：サイド0 / 相手の場ポケモンが0（このタイミング）。
export function checkWin(state: BattleState): void {
    if (state.winner !== null) return
    const [a, b] = state.players
    if (a.prizes <= 0) { state.winner = 0; state.phase = 'ended'; return }
    if (b.prizes <= 0) { state.winner = 1; state.phase = 'ended'; return }
    // 場のポケモンが全滅（きぜつ処理後にバトル場が空＆ベンチも空）
    const aEmpty = !a.active && a.bench.every(x => !x)
    const bEmpty = !b.active && b.bench.every(x => !x)
    if (aEmpty && !bEmpty) { state.winner = 1; state.phase = 'ended' }
    else if (bEmpty && !aEmpty) { state.winner = 0; state.phase = 'ended' }
}

// ── 攻撃の解決（★再入可能）──
// ナイトジョーカー等は ctx.useAttack(別ワザ) を呼ぶことで、この同じ経路を再帰的に使う。
export interface ResolveDeps {
    state: BattleState
    reg: Registry
    agent: Agent
}

export async function resolveAttack(
    deps: ResolveDeps,
    sideId: 0 | 1,
    attack: AttackDef,
    opts: { ignoreCost?: boolean } = {},
): Promise<void> {
    const { state, reg, agent } = deps
    const self = state.players[sideId]
    const opponent = state.players[(sideId ^ 1) as 0 | 1]
    const attacker = self.active
    if (!attacker) return
    if (!opts.ignoreCost && !canPayCost(attack.cost, attacker.attached)) {
        state.log.push(`${self.name}：${attack.name} はエネルギーが足りない`)
        return
    }

    const ctx: AttackContext = {
        state, self, opponent, attacker,
        defender: opponent.active,
        agent,
        def: defGetter(reg),
        log: (m) => state.log.push(m),
        damage: (amount, target, dopts) => {
            const tgt = target ?? opponent.active
            if (!tgt) return
            const final = dopts?.ignoreWR ? Math.max(0, amount) : applyWeaknessResistance(amount, attacker, tgt)
            tgt.damage += final
            state.log.push(`${attacker.def.name} → ${tgt.def.name} に ${final} ダメージ`)
        },
        heal: (amount, target) => {
            const tgt = target ?? attacker
            tgt.damage = Math.max(0, tgt.damage - amount)
        },
        applyStatus: (s: StatusCondition, target) => {
            const tgt = target ?? opponent.active
            if (tgt) tgt.statuses.add(s)
        },
        draw: (n) => { for (let i = 0; i < n; i++) { const c = self.deck.shift(); if (c) self.hand.push(c) } },
        useAttack: async (copied, _o) => {
            // コピー系（ナイトジョーカー等）：コストは呼び出し元（親ワザ）で支払い済みなので
            // ここでは常に効果のみ再解決する。同じ ctx を渡すことで効果処理もそのまま流れる。
            state.log.push(`${attacker.def.name}：${copied.name} をコピーして使用`)
            await copied.run(ctx)
        },
    }

    state.log.push(`${self.name}の${attacker.def.name}のワザ：${attack.name}`)
    await attack.run(ctx)
    resolveKnockOuts(state, sideId)
}
