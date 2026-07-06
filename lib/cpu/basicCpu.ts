import { type RefObject } from 'react'
import { type Card } from '@/lib/deckParser'
import { type CardStack, isEnergy, isPokemon, isStadium, isSupporter } from '@/lib/cardStack'
import { type DeckPracticeRef } from '@/components/DeckPractice'

export interface CpuBattleRefs {
    self: RefObject<DeckPracticeRef | null>
    opponent: RefObject<DeckPracticeRef | null>
}

export interface CpuDecisionLog {
    label: string
    detail?: string
}

export interface CpuTurnResult {
    logs: CpuDecisionLog[]
}

const CPU_THINK_DELAY_MS = 180

function wait(ms: number) {
    return new Promise(resolve => setTimeout(resolve, ms))
}

function topName(stack: CardStack | null | undefined): string {
    if (!stack) return ''
    const pokemon = [...stack.cards].reverse().find(isPokemon)
    return pokemon?.name || stack.cards[stack.cards.length - 1]?.name || ''
}

function openBenchIndex(bench: (CardStack | null)[]): number | undefined {
    const index = bench.findIndex((slot, i) => i < 5 && slot === null)
    return index >= 0 ? index : undefined
}

function hasStageMarker(card: Card): boolean {
    const text = `${card.name} ${(card.subtypes || []).join(' ')}`.toLowerCase()
    return text.includes('stage') || text.includes('進化') || text.includes('vmax') || text.includes('vstar')
}

function isLikelyBasicPokemon(card: Card): boolean {
    if (!isPokemon(card)) return false
    return !hasStageMarker(card)
}

function isUsefulBenchPokemon(card: Card): boolean {
    if (!isLikelyBasicPokemon(card)) return false
    const name = card.name
    if (name.includes('ex') && !name.includes('ニャース') && !name.includes('Meowth')) return false
    return true
}

function scoreBattleStarter(card: Card): number {
    if (!isLikelyBasicPokemon(card)) return -1000
    const name = card.name
    let score = 100
    if (name.includes('ノコッチ') || name.includes('Dunsparce')) score += 80
    if (name.includes('ヒトデマン') || name.includes('Staryu')) score += 75
    if (name.includes('ケーシィ') || name.includes('Abra')) score += 70
    if (name.includes('ドラメシヤ') || name.includes('Dreepy')) score += 70
    if (name.includes('ミミロル') || name.includes('Buneary')) score += 65
    if (name.includes('スボミー') || name.includes('Budew')) score += 60
    if (name.includes('ex')) score -= 40
    return score
}

function findBestHandIndex(hand: Card[], predicate: (card: Card) => boolean, score: (card: Card) => number = () => 0): number | undefined {
    let bestIndex: number | undefined
    let bestScore = -Infinity
    hand.forEach((card, index) => {
        if (!predicate(card)) return
        const value = score(card)
        if (value > bestScore) {
            bestScore = value
            bestIndex = index
        }
    })
    return bestIndex
}

function findAttachTarget(self: DeckPracticeRef): { type: 'battle' | 'bench'; index?: number } | null {
    const battle = self.getBattleField()
    if (battle && battle.energyCount < neededEnergy(topName(battle))) {
        return { type: 'battle' }
    }

    const bench = self.getBench()
    let bestIndex: number | undefined
    let bestScore = -Infinity
    bench.forEach((stack, index) => {
        if (!stack) return
        const need = neededEnergy(topName(stack))
        if (stack.energyCount >= need) return
        const score = attackerPriority(topName(stack)) * 10 - stack.energyCount
        if (score > bestScore) {
            bestScore = score
            bestIndex = index
        }
    })

    return bestIndex !== undefined ? { type: 'bench', index: bestIndex } : null
}

function neededEnergy(name: string): number {
    if (!name) return 1
    if (name.includes('スボミー') || name.includes('Budew')) return 0
    if (name.includes('メガスターミー') || name.includes('Mega Starmie')) return 1
    if (name.includes('フーディン') || name.includes('Alakazam')) return 2
    if (name.includes('ドラパルト') || name.includes('Dragapult')) return 2
    if (name.includes('メガミミロップ') || name.includes('Mega Lopunny')) return 2
    if (name.includes('イワパレス') || name.includes('Crustle')) return 2
    if (name.includes('トドゼルガ') || name.includes('Walrein')) return 3
    return 1
}

function attackerPriority(name: string): number {
    if (name.includes('フーディン') || name.includes('Alakazam')) return 10
    if (name.includes('メガスターミー') || name.includes('Mega Starmie')) return 10
    if (name.includes('ドラパルト') || name.includes('Dragapult')) return 9
    if (name.includes('メガミミロップ') || name.includes('Mega Lopunny')) return 9
    if (name.includes('イワパレス') || name.includes('Crustle')) return 8
    if (name.includes('トドゼルガ') || name.includes('Walrein')) return 8
    return 3
}

function isExPokemonName(name: string): boolean {
    return /ex|EX/.test(name)
}

function estimatedAttackDamage(name: string, energyCount: number, opponentHandCount: number, opponentActiveName: string): number {
    if (!name) return 0
    if (name.includes('スボミー') || name.includes('Budew')) return 10
    if (name.includes('ファイヤー') || name.includes('Moltres')) return energyCount >= 1 ? 30 + (isExPokemonName(opponentActiveName) ? 80 : 0) : 0
    if (name.includes('メガスターミー') || name.includes('Mega Starmie')) return energyCount >= 1 ? 120 : 0
    if (name.includes('フーディン') || name.includes('Alakazam')) return energyCount >= 2 ? Math.max(60, opponentHandCount * 20) : 0
    if (name.includes('ドラパルト') || name.includes('Dragapult')) return energyCount >= 2 ? 200 : 0
    if (name.includes('メガミミロップ') || name.includes('Mega Lopunny')) return energyCount >= 2 ? 160 : energyCount >= 1 ? 60 : 0
    if (name.includes('イワパレス') || name.includes('Crustle')) return energyCount >= 2 ? 120 : 0
    if (name.includes('トドゼルガ') || name.includes('Walrein')) return energyCount >= 3 ? 150 : 0
    return energyCount > 0 ? 60 : 0
}

function shouldEvolve(card: Card, target: CardStack): boolean {
    if (!isPokemon(card)) return false
    if (!hasStageMarker(card)) return false
    const targetName = topName(target)
    const name = card.name
    if (name.includes('メガスターミー') && targetName.includes('ヒトデマン')) return true
    if (name.includes('Mega Starmie') && targetName.includes('Staryu')) return true
    if (name.includes('フーディン') && (targetName.includes('ユンゲラー') || targetName.includes('ケーシィ'))) return true
    if (name.includes('Alakazam') && (targetName.includes('Kadabra') || targetName.includes('Abra'))) return true
    if (name.includes('ユンゲラー') && targetName.includes('ケーシィ')) return true
    if (name.includes('Kadabra') && targetName.includes('Abra')) return true
    if (name.includes('ドラパルト') && (targetName.includes('ドロンチ') || targetName.includes('ドラメシヤ'))) return true
    if (name.includes('Dragapult') && (targetName.includes('Drakloak') || targetName.includes('Dreepy'))) return true
    if (name.includes('ドロンチ') && targetName.includes('ドラメシヤ')) return true
    if (name.includes('Drakloak') && targetName.includes('Dreepy')) return true
    if (name.includes('メガミミロップ') && targetName.includes('ミミロル')) return true
    if (name.includes('Mega Lopunny') && targetName.includes('Buneary')) return true
    if (name.includes('ノココッチ') && targetName.includes('ノコッチ')) return true
    if (name.includes('Dudunsparce') && targetName.includes('Dunsparce')) return true
    return false
}

async function tryEvolve(self: DeckPracticeRef, logs: CpuDecisionLog[]) {
    const hand = self.getHand()
    const battle = self.getBattleField()
    if (battle) {
        const index = findBestHandIndex(hand, card => shouldEvolve(card, battle), card => attackerPriority(card.name))
        if (index !== undefined) {
            logs.push({ label: '進化', detail: `${hand[index].name} をバトル場へ` })
            self.playToBattleField(index)
            await wait(CPU_THINK_DELAY_MS)
            return true
        }
    }

    const bench = self.getBench()
    for (let i = 0; i < bench.length; i += 1) {
        const stack = bench[i]
        if (!stack) continue
        const freshHand = self.getHand()
        const index = findBestHandIndex(freshHand, card => shouldEvolve(card, stack), card => attackerPriority(card.name))
        if (index !== undefined) {
            logs.push({ label: '進化', detail: `${freshHand[index].name} をベンチ${i + 1}へ` })
            self.playToBench(index, i)
            await wait(CPU_THINK_DELAY_MS)
            return true
        }
    }
    return false
}

async function trySetBattle(self: DeckPracticeRef, logs: CpuDecisionLog[]) {
    if (self.getBattleField()) return false
    const hand = self.getHand()
    const index = findBestHandIndex(hand, isLikelyBasicPokemon, scoreBattleStarter)
    if (index === undefined) return false
    logs.push({ label: 'バトル場へ出す', detail: hand[index].name })
    self.playToBattleField(index)
    await wait(CPU_THINK_DELAY_MS)
    return true
}

async function tryFillBench(self: DeckPracticeRef, logs: CpuDecisionLog[]) {
    const hand = self.getHand()
    const bench = self.getBench()
    const empty = openBenchIndex(bench)
    if (empty === undefined) return false
    const index = findBestHandIndex(hand, isUsefulBenchPokemon, scoreBattleStarter)
    if (index === undefined) return false
    logs.push({ label: 'ベンチ展開', detail: hand[index].name })
    self.playToBench(index, empty)
    await wait(CPU_THINK_DELAY_MS)
    return true
}

async function tryPlayStadium(self: DeckPracticeRef, logs: CpuDecisionLog[]) {
    const hand = self.getHand()
    const index = findBestHandIndex(hand, isStadium)
    if (index === undefined) return false
    logs.push({ label: 'スタジアム', detail: hand[index].name })
    self.playStadium(index)
    await wait(CPU_THINK_DELAY_MS)
    return true
}

async function tryAttachEnergy(self: DeckPracticeRef, logs: CpuDecisionLog[]) {
    if (self.isEnergyAttached()) return false
    const hand = self.getHand()
    const energyIndex = findBestHandIndex(hand, isEnergy)
    if (energyIndex === undefined) return false
    const target = findAttachTarget(self)
    if (!target) return false

    if (target.type === 'battle') {
        logs.push({ label: 'エネルギー', detail: `${hand[energyIndex].name} をバトル場へ` })
        self.playToBattleField(energyIndex)
    } else {
        logs.push({ label: 'エネルギー', detail: `${hand[energyIndex].name} をベンチ${(target.index ?? 0) + 1}へ` })
        self.playToBench(energyIndex, target.index)
    }
    await wait(CPU_THINK_DELAY_MS)
    return true
}

async function trySimpleSupporter(self: DeckPracticeRef, logs: CpuDecisionLog[]) {
    if (self.isSupporterUsed()) return false
    const hand = self.getHand()
    const index = findBestHandIndex(hand, card => isSupporter(card) && /リーリエ|Lillie|トウコ|ジャッジ|Judge|博士|Professor/.test(card.name))
    if (index === undefined) return false
    const card = hand[index]
    if (self.getDeck().length <= 8) return false

    logs.push({ label: 'サポート', detail: `${card.name} を簡易処理` })
    self.trashFromHand(index)
    self.setSupporterUsed(true)
    if (/ジャッジ|Judge/.test(card.name)) {
        self.drawCards(Math.min(4, self.getDeck().length))
    } else {
        self.drawCards(Math.min(3, self.getDeck().length))
    }
    await wait(CPU_THINK_DELAY_MS)
    return true
}

async function tryAttack(refs: CpuBattleRefs, logs: CpuDecisionLog[]) {
    const self = refs.self.current
    const opponent = refs.opponent.current
    if (!self || !opponent) return false

    const battle = self.getBattleField()
    if (!battle) return false
    const opponentBattle = opponent.getBattleField()
    const opponentActiveName = topName(opponentBattle)
    const damage = estimatedAttackDamage(topName(battle), battle.energyCount, opponent.getHand().length, opponentActiveName)
    if (damage <= 0) return false

    const activeName = topName(battle)
    logs.push({ label: '攻撃', detail: `${activeName || 'バトルポケモン'} が ${damage} ダメージ` })
    opponent.receiveEffect('apply_damage', damage, 'battle', 0)

    if ((activeName.includes('メガスターミー') || activeName.includes('Mega Starmie')) && opponent.getBench().some(Boolean)) {
        const target = pickBenchDamageTarget(opponent.getBench())
        if (target !== undefined) {
            logs.push({ label: '追加ダメージ', detail: `ベンチ${target + 1}へ50ダメージ` })
            opponent.receiveEffect('apply_damage', 50, 'bench', target)
        }
    }

    await wait(CPU_THINK_DELAY_MS)
    return !!opponentBattle || damage > 0
}

function pickBenchDamageTarget(bench: (CardStack | null)[]): number | undefined {
    let best: { index: number; score: number } | undefined
    bench.forEach((stack, index) => {
        if (!stack) return
        const name = topName(stack)
        let score = 10
        if (/ケーシィ|Abra|ヒトデマン|Staryu|ドラメシヤ|Dreepy|リオル|Riolu|ユキカブリ|Snover|タマザラシ|Spheal/.test(name)) score += 100
        score -= stack.damage / 10
        if (!best || score > best.score) best = { index, score }
    })
    return best?.index
}

export async function runBasicCpuSetup(refs: CpuBattleRefs): Promise<CpuTurnResult> {
    const logs: CpuDecisionLog[] = []
    let self = refs.self.current
    if (!self || self.getBattleField() || self.getHand().length === 0) return { logs }

    const placedActive = await trySetBattle(self, logs)
    if (!placedActive) {
        logs.push({ label: '準備待ち', detail: 'CPUの初手にたねポケモンが見つかりません' })
        return { logs }
    }

    for (let i = 0; i < 2; i += 1) {
        self = refs.self.current
        if (!self) break
        const acted = await tryFillBench(self, logs)
        if (!acted) break
    }

    self = refs.self.current
    if (self && self.getPrizeCount() === 0 && self.getBattleField()) {
        logs.push({ label: 'サイドセット', detail: 'CPU側のサイドを6枚セット' })
        self.setupPrizes()
        await wait(CPU_THINK_DELAY_MS)
    }

    return { logs }
}

export async function runBasicCpuTurn(refs: CpuBattleRefs): Promise<CpuTurnResult> {
    let self = refs.self.current
    if (!self || !self.isActivePlayer()) return { logs: [] }

    const logs: CpuDecisionLog[] = []

    if (self.getDeck().length > 0) {
        logs.push({ label: 'ドロー', detail: '番の始めに1枚引く' })
        self.drawCards(1)
        await wait(CPU_THINK_DELAY_MS)
    }

    self = refs.self.current
    if (self) await trySetBattle(self, logs)

    for (let i = 0; i < 3; i += 1) {
        self = refs.self.current
        if (!self) break
        const acted = await tryFillBench(self, logs)
        if (!acted) break
    }

    self = refs.self.current
    if (self) await tryEvolve(self, logs)
    self = refs.self.current
    if (self) await tryPlayStadium(self, logs)
    self = refs.self.current
    if (self) await tryAttachEnergy(self, logs)
    self = refs.self.current
    if (self) await trySimpleSupporter(self, logs)
    await tryAttack(refs, logs)

    self = refs.self.current
    if (self) {
        logs.push({ label: 'ターン終了' })
        self.endTurn()
    }
    return { logs }
}
