import type { PokemonDef, AttackDef } from '../types'

// Nのゾロアークデッキのカード定義（順次拡充）。
// ここでは設計実証として ナイトジョーカー（コピー系）と、
// コピー対象になる「Nの〜」ポケモンのワザを最小構成で置く。
// 実際のデッキリスト確定後、HP・弱点・にげ・コスト・効果を正確な値へ差し替える。

// 「自分のベンチの『Nのポケモン』が持つワザを1つ選び、このワザとして使う」
export const nightJoker: AttackDef = {
    id: 'n_zoroark_night_joker',
    name: 'ナイトジョーカー',
    cost: { Darkness: 1, Colorless: 1 }, // ※コストは仮。リスト確定後に修正
    text: '自分のベンチの「Nのポケモン」が持つワザを1つ選び、このワザとして使う。',
    run: async (ctx) => {
        // ベンチの「Nの〜」を集める（自身＝バトル場は含めない）
        const nBench = ctx.self.bench.filter(
            (m): m is NonNullable<typeof m> => !!m && m.def.name.startsWith('Nの'),
        )
        // それぞれの持つワザを候補化
        const options = nBench.flatMap(m =>
            m.def.attacks.map(a => ({ label: `${m.def.name} / ${a.name}`, value: a })),
        )
        if (options.length === 0) {
            ctx.log('ナイトジョーカー：コピーできるワザがない（不発）')
            return
        }
        // 人間はUI、CPUは思考エンジンが選ぶ（同じ口）
        const chosen = await ctx.agent.choose('コピーするワザを選ぶ', options)
        // ★同じ解決経路を再入。コストは無視（ナイトジョーカー分は支払い済み）
        await ctx.useAttack(chosen, { ignoreCost: true })
    },
}

export const nZoroarkEx: PokemonDef = {
    kind: 'Pokemon',
    name: 'Nのゾロアークex',
    hp: 250,                 // ※仮
    types: ['Darkness'],
    stage: 'Stage1',
    evolvesFrom: 'Nのゾロア',
    weakness: { type: 'Grass', factor: 2 }, // ※仮
    retreatCost: 1,          // ※仮
    rule: ['ex'],
    attacks: [nightJoker],
}

// コピー対象サンプル（実データ差し替え前提）。
export const nZorua: PokemonDef = {
    kind: 'Pokemon',
    name: 'Nのゾロア',
    hp: 70,
    types: ['Darkness'],
    stage: 'Basic',
    retreatCost: 1,
    attacks: [
        {
            id: 'n_zorua_scratch',
            name: 'ひっかく',
            cost: { Colorless: 1 },
            baseDamage: 20,
            run: async (ctx) => { ctx.damage(20) },
        },
    ],
}

// 「Nの〜」の別ポケモン例：ベンチに置いてナイトジョーカーでコピーされる想定。
export const nDarumakka: PokemonDef = {
    kind: 'Pokemon',
    name: 'Nのダルマッカ',
    hp: 70,
    types: ['Fire'],
    stage: 'Basic',
    retreatCost: 1,
    attacks: [
        {
            id: 'n_darumakka_tackle',
            name: 'たいあたり',
            cost: { Colorless: 1 },
            baseDamage: 30,
            run: async (ctx) => { ctx.damage(30) },
        },
    ],
}

export const N_ZOROARK_CARDS: PokemonDef[] = [nZoroarkEx, nZorua, nDarumakka]
