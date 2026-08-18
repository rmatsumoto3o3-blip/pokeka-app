import Link from 'next/link'
import type { Metadata } from 'next'
import PublicHeader from '@/components/PublicHeader'
import { getFirebaseDb } from '@/lib/firebase/admin'

// 環境デッキ一覧（Firebase由来・画像なし・Supabase不使用）。
// 月別シート→GAS→Firestore(environmentDecks/pokemon) のデータを、アーキタイプ別に表示。
// 各デッキから「デッキを見る(/env/<code>)」「一人回し(/practice?deckCode=)」へ送る。

export const revalidate = 3600
export const metadata: Metadata = {
    title: '環境デッキ一覧 | PokéLix（ポケリス）',
    description: '大会の優勝・入賞デッキを一覧で。デッキコードからそのまま一人回し（ソリティア）で回せます。',
}

type EnvDeck = { deckCode: string; archetype: string; eventName: string; eventDate: string; rank: string }

const RANK_ORDER: Record<string, number> = { '優勝': 0, '準優勝': 1, 'TOP4': 2, 'TOP8': 3 }
const rankKey = (r: string) => (r in RANK_ORDER ? RANK_ORDER[r] : 9)

const rankStyle = (r: string) => {
    if (r === '優勝') return 'bg-amber-100 text-amber-800 border-amber-300'
    if (r === '準優勝') return 'bg-gray-100 text-gray-700 border-gray-300'
    return 'bg-blue-50 text-blue-700 border-blue-200'
}

async function getEnvDecks(): Promise<EnvDeck[]> {
    const db = getFirebaseDb()
    if (!db) return []
    const snap = await db.collection('environmentDecks').doc('pokemon').get()
    const data = snap.exists ? snap.data() : null
    const decks = Array.isArray(data?.decks) ? (data!.decks as EnvDeck[]) : []
    return decks
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
            list: list.slice().sort((a, b) => rankKey(a.rank) - rankKey(b.rank)),
        }))
        .sort((a, b) => b.list.length - a.list.length)

    return (
        <div className="min-h-screen bg-[#f5f7fa]">
            <PublicHeader game="pokemon" />

            <main className="max-w-5xl mx-auto px-4 py-6">
                <div className="mb-5">
                    <h1 className="text-2xl font-bold text-gray-900">環境デッキ</h1>
                    <p className="mt-1 text-sm text-gray-600">大会の優勝・入賞デッキ。デッキ名から中身を確認、<span className="font-bold text-blue-600">ワンタップで一人回し</span>できます。</p>
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
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                                    {group.list.map(d => (
                                        <div key={d.deckCode} className="rounded-xl border border-gray-200 bg-white p-3">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${rankStyle(d.rank)}`}>{d.rank || '—'}</span>
                                                <span className="text-sm text-gray-800 font-bold truncate">{d.eventName || '大会名なし'}</span>
                                            </div>
                                            <div className="text-xs text-gray-500 mb-2">
                                                {d.eventDate && <span>{d.eventDate}・</span>}
                                                <span className="font-mono text-gray-400">{d.deckCode}</span>
                                            </div>
                                            <div className="flex gap-2">
                                                <Link href={`/env/${encodeURIComponent(d.deckCode)}`} className="flex-1 text-center text-sm font-bold text-gray-800 border border-gray-300 rounded-lg py-1.5 hover:bg-gray-50">デッキを見る</Link>
                                                <Link href={`/practice?deckCode=${encodeURIComponent(d.deckCode)}`} className="flex-1 text-center text-sm font-bold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg py-1.5 hover:bg-blue-100">▶ 一人回し</Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        ))}
                    </div>
                )}

                <p className="mt-8 text-[11px] text-gray-400">※デッキリストは各デッキコードから表示しています。データは大会結果をもとに随時更新されます。</p>
            </main>
        </div>
    )
}
