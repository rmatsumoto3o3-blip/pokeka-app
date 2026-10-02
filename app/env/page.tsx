import type { Metadata } from 'next'
import PublicHeader from '@/components/PublicHeader'
import { loadMergedPokemonEnvDecks } from '@/lib/pokemonEnvDecks'
import { eventDateSortKey } from '@/lib/eventDate'
import EnvDeckList from '@/components/EnvDeckList'

// 環境デッキ一覧（Firebase由来・画像なし・Supabase不使用）。
// 月別シート→GAS→Firestore(environmentDecks/pokemon) のデータを、アーキタイプ別に表示。
// 各デッキから「デッキを見る(/env/<code>)」「一人回し(/practice?deckCode=)」へ送る。

export const revalidate = 21600
export const metadata: Metadata = {
    title: 'ポケカ 環境デッキ一覧｜大会優勝・入賞デッキレシピ【最新】',
    description: 'ポケモンカードの最新環境デッキを大会優勝・入賞デッキから一覧掲載。アーキタイプ別にデッキレシピ（デッキコード）をまとめ、そのまま「一人回し」で試せます。いまのポケカ環境デッキをまとめてチェック。',
    keywords: ['ポケカ 環境デッキ', 'ポケカ 環境', 'ポケカ 優勝デッキ', 'ポケカ デッキレシピ', 'ポケモンカード 環境', '環境デッキ', 'ポケカ 最新 デッキ'],
    alternates: { canonical: 'https://www.pokelix.jp/env' },
    openGraph: {
        title: 'ポケカ 環境デッキ一覧｜大会優勝・入賞デッキレシピ',
        description: '最新のポケカ環境デッキ（大会優勝・入賞）をアーキタイプ別に一覧。デッキコードからそのまま一人回し。',
        url: 'https://www.pokelix.jp/env',
        siteName: 'PokéLix（ポケリス）',
        type: 'website',
        locale: 'ja_JP',
    },
    robots: { index: true, follow: true },
}

type EnvDeck = { deckCode: string; archetype: string; eventName: string; eventDate: string; rank: string }

const RANK_ORDER: Record<string, number> = { '優勝': 0, '準優勝': 1, 'TOP4': 2, 'TOP8': 3 }
const rankKey = (r: string) => (r in RANK_ORDER ? RANK_ORDER[r] : 9)

async function getEnvDecks(): Promise<EnvDeck[]> {
    return (await loadMergedPokemonEnvDecks()) as EnvDeck[]
}

export default async function EnvDecksPage() {
    const decks = await getEnvDecks()

    // アーキタイプ別にグループ化
    const groupsMap = new Map<string, EnvDeck[]>()
    for (const d of decks) {
        const key = d.archetype || 'その他'
        if (!groupsMap.has(key)) groupsMap.set(key, [])
        groupsMap.get(key)!.push(d)
    }
    // グループ内は順位優先、グループはデッキ数の多い順
    const groups = Array.from(groupsMap.entries())
        .map(([archetype, list]) => ({
            archetype,
            // 日付の新しい順（同日は順位順）
            list: list.slice().sort((a, b) => eventDateSortKey(b.eventDate) - eventDateSortKey(a.eventDate) || rankKey(a.rank) - rankKey(b.rank)),
        }))
        .sort((a, b) => b.list.length - a.list.length)

    return (
        <div className="min-h-screen bg-[#f5f7fa]">
            <PublicHeader game="pokemon" />

            <main className="max-w-5xl mx-auto px-4 py-6">
                <div className="mb-5">
                    <h1 className="text-2xl font-bold text-gray-900">ポケカ 環境デッキ一覧【大会優勝・入賞】</h1>
                    <p className="mt-1 text-sm text-gray-600 leading-relaxed">
                        いまのポケカ最新環境デッキを、大会（シティリーグ等）の優勝・入賞デッキから<strong>アーキタイプ別</strong>にまとめています。
                        各デッキはデッキコードから中身（デッキレシピ）を確認でき、<span className="font-bold text-blue-600">ワンタップで一人回し</span>してそのまま試せます。
                    </p>
                </div>

                {decks.length === 0 ? (
                    <div className="text-center text-gray-400 py-24 bg-white rounded-xl border border-dashed">
                        現在表示できる環境デッキがありません。少し時間をおいて再度お試しください。
                    </div>
                ) : (
                    <div className="space-y-6">
                        {groups.map(group => (
                            <section key={group.archetype}>
                                <h2 className="flex items-center gap-2 text-base font-bold text-gray-900 mb-2">
                                    <span className="w-1.5 h-5 bg-blue-500 rounded-full" />
                                    {group.archetype}
                                    <span className="text-xs font-normal text-gray-400">{group.list.length}件</span>
                                </h2>
                                <EnvDeckList decks={group.list} />
                            </section>
                        ))}
                    </div>
                )}

                <p className="mt-8 text-[11px] text-gray-400">※デッキリストは各デッキコードから表示しています。データは大会結果をもとに随時更新されます。</p>
            </main>
        </div>
    )
}
