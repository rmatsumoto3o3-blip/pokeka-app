// ポケカ対戦エンジンの中核型。
// 設計方針：
//  ・ルール（ターン進行・エネ装着1枚・進化タイミング・にげ・きぜつ・サイド・勝敗）は
//    デッキ非依存の「エンジン」が持つ。
//  ・カードごとの性能（技・コスト・ダメージ・効果・特性）は「レジストリ」に
//    データ＋関数で定義する。
//  ・ワザは第一級の部品。resolveAttack を再入可能にすることで、
//    ナイトジョーカー等の「他のワザをコピーして使う」系を自然に表現できる。

// エネルギーの種別。'C' は無色（なんでも1個ぶん）。
export type EnergyType =
    | 'Grass' | 'Fire' | 'Water' | 'Lightning' | 'Psychic'
    | 'Fighting' | 'Darkness' | 'Metal' | 'Dragon' | 'Colorless'

// ワザの必要エネ。例：{ Psychic: 1, Colorless: 2 }（超1＋無2）
export type EnergyCost = Partial<Record<EnergyType, number>>

// 盤面に付いている1個のエネルギー。特殊エネはtype複数＋効果を持つことがある。
export interface EnergyCard {
    name: string
    // このエネが供給するタイプ（基本は1つ、特殊は複数や状況依存）。
    provides: EnergyType[]
    // 「〇個ぶん」を供給する特殊エネ用（省略時1）。
    amount?: number
    special?: boolean
}

// 状態異常。ねむり/マヒ/どく/やけど/こんらん。
export type StatusCondition = 'asleep' | 'paralyzed' | 'poisoned' | 'burned' | 'confused'

// カードの種類。
export type Supertype = 'Pokemon' | 'Trainer' | 'Energy'
export type Stage = 'Basic' | 'Stage1' | 'Stage2'
export type TrainerKind = 'Item' | 'Supporter' | 'Stadium' | 'Tool'

// ワザ定義。run は効果処理（ダメージも効果もここで解決）。
export interface AttackDef {
    id: string
    name: string
    cost: EnergyCost
    // 表示・簡易AI用の基本ダメージ（効果で増減する場合は run 内で最終確定）。
    baseDamage?: number
    text?: string
    // 効果本体。damage を含む全処理を行う。UI/CPUの選択が絡むため async。
    run: (ctx: AttackContext) => Promise<void>
}

// 特性定義（起動型／常在型）。
export interface AbilityDef {
    id: string
    name: string
    text?: string
    // 起動型のみ。常在型は各所のフックで参照する（後続で拡張）。
    activate?: (ctx: AbilityContext) => Promise<void>
}

// ポケモンのカード定義（性能データ）。
export interface PokemonDef {
    kind: 'Pokemon'
    name: string
    hp: number
    types: EnergyType[]
    stage: Stage
    evolvesFrom?: string
    weakness?: { type: EnergyType; factor: 2 } // ポケカは基本×2
    resistance?: { type: EnergyType; minus: number }
    retreatCost: number // 無色エネ換算の個数
    attacks: AttackDef[]
    abilities?: AbilityDef[]
    rule?: ('ex' | 'V' | 'VSTAR' | 'VMAX' | 'MegaEx')[]
}

// トレーナー／エネの定義。
export interface TrainerDef {
    kind: 'Trainer'
    name: string
    trainer: TrainerKind
    text?: string
    play: (ctx: PlayContext) => Promise<void>
}
export interface EnergyDef {
    kind: 'Energy'
    name: string
    provides: EnergyType[]
    amount?: number
    special?: boolean
    text?: string
}
export type CardDef = PokemonDef | TrainerDef | EnergyDef

// 盤面に存在する1匹のポケモン（進化の下敷きも保持）。
export interface PokemonInPlay {
    def: PokemonDef
    // 進化の積み重ね（下から）。表示・きぜつ時のトラッシュ用。
    stack: PokemonDef[]
    attached: EnergyCard[]
    tools: string[]
    damage: number // 乗っているダメージ（HP到達できぜつ）
    statuses: Set<StatusCondition>
    // このポケモンが場に出た／進化したターン番号（進化・特定効果の判定用）。
    placedTurn: number
    evolvedTurn?: number
}

// プレイヤーの盤面。
export interface PlayerState {
    id: 0 | 1
    name: string
    active: PokemonInPlay | null
    bench: (PokemonInPlay | null)[] // 最大5
    hand: string[]      // カード名（同名は defで解決）
    deck: string[]
    discard: string[]
    lostZone: string[]
    prizes: number
    stadium?: string
    // ターン内フラグ
    energyAttachedThisTurn: boolean
    supporterPlayedThisTurn: boolean
    retreatedThisTurn: boolean
}

export type Phase = 'setup' | 'draw' | 'main' | 'attack' | 'between' | 'ended'

export interface BattleState {
    players: [PlayerState, PlayerState]
    turnPlayer: 0 | 1
    turn: number
    phase: Phase
    winner: 0 | 1 | null
    firstPlayer: 0 | 1
    log: string[]
}

// ── 意思決定の口（人間＝UI、CPU＝思考）。両者を同じ関数で差し替える。──
export interface Agent {
    // 汎用選択。options の index を返す。
    choose: <T>(prompt: string, options: { label: string; value: T }[]) => Promise<T>
    // 対象ポケモンの選択（相手ベンチ等）。
    chooseMon?: (prompt: string, candidates: PokemonInPlay[]) => Promise<PokemonInPlay | null>
}

// ワザ実行時に渡すコンテキスト。
export interface AttackContext {
    state: BattleState
    self: PlayerState        // ワザを使う側
    opponent: PlayerState
    attacker: PokemonInPlay  // ワザを使っているポケモン
    defender: PokemonInPlay | null
    agent: Agent
    // カード名→定義の解決。
    def: (name: string) => CardDef | undefined
    // 与ダメージ（弱点・抵抗・効果を通して適用）。対象省略時は相手バトル場。
    // ignoreWR=true で「弱点・抵抗力を計算しない」（＝ダメカン配置系の効果向け）。
    damage: (amount: number, target?: PokemonInPlay | null, opts?: { ignoreWR?: boolean }) => void
    applyStatus: (s: StatusCondition, target?: PokemonInPlay | null) => void
    heal: (amount: number, target?: PokemonInPlay | null) => void
    draw: (n: number) => void
    // ★コピー系の要。指定ワザを「このポケモンのワザ」として再解決する。
    useAttack: (attack: AttackDef, opts?: { ignoreCost?: boolean }) => Promise<void>
    log: (msg: string) => void
}

export interface AbilityContext {
    state: BattleState
    self: PlayerState
    opponent: PlayerState
    source: PokemonInPlay
    agent: Agent
    def: (name: string) => CardDef | undefined
    log: (msg: string) => void
}

export interface PlayContext {
    state: BattleState
    self: PlayerState
    opponent: PlayerState
    agent: Agent
    def: (name: string) => CardDef | undefined
    draw: (n: number) => void
    log: (msg: string) => void
}
