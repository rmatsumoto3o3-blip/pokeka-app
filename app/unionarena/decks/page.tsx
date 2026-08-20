import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { unstable_cache } from 'next/cache'
import PublicHeader from '@/components/PublicHeader'
import Footer from '@/components/Footer'
import { byEventDateDesc, eventDateSortKey } from '@/lib/eventDate'
import { getFirebaseDb } from '@/lib/firebase/admin'
import { fetchUnionArenaDeckData } from '@/lib/unionArenaDeckParser'

export const metadata: Metadata = {
    title: 'ユニアリ 環境・優勝デッキ一覧 | PokéLix（ポケリス）',
    description: '大会で結果を残したユニアリ（ユニオンアリーナ）のデッキをアーキタイプ別にまとめています。',
    keywords: ['ユニアリ 環境', 'ユニオンアリーナ 優勝デッキ', 'ユニアリ デッキレシピ', 'ユニアリ 環境デッキ', 'ユニオンアリーナ デッキ'],
    alternates: { canonical: 'https://www.pokelix.jp/unionarena/decks' },
}

export const revalidate = 3600

// Firebase（environmentDecks/unionarena）由来。Supabase制限中でも表示できる。
type EnvDeck = { deckCode: string; archetype: string; eventName: string; eventDate: string; rank: string }

async function getUnionEnvDecks(): Promise<EnvDeck[]> {
    const db = getFirebaseDb()
    if (!db) return []
    try {
        const snap = await db.collection('environmentDecks').doc('unionarena').get()
        const data = snap.exists ? snap.data() : null
        return Array.isArray(data?.decks) ? (data!.decks as EnvDeck[]) : []
    } catch { return [] }
}

// アーキタイプ代表画像（/unionarena と同じキャッシュキーを共有）。24hキャッシュ。
const getUnionArchetypeImages = unstable_cache(
    async (): Promise<Record<string, string>> => {
        const decks = await getUnionEnvDecks()
        const repByArch = new Map<string, string>()
        for (const d of decks) {
            const a = (d.archetype || '').trim()
            if (a && !repByArch.has(a) && d.deckCode) repByArch.set(a, d.deckCode)
        }
        const out: Record<string, string> = {}
        await Promise.all([...repByArch.entries()].map(async ([arch, code]) => {
            try {
                const data = await fetchUnionArenaDeckData(code)
                const img = (data.mainDeck || []).find(c => c.imageUrl)?.imageUrl
                if (img) out[arch] = img
            } catch { /* 展開失敗はスキップ */ }
        }))
        return out
    },
    ['union-archetype-images-v1'],
    { revalidate: 86400 },
)

export default async function UnionArenaDecksPage() {
    const envDecks = await getUnionEnvDecks()
    const images = await getUnionArchetypeImages()

    // env decks → 表示用（既存UIの形に合わせる。id=deckCode で詳細へ）
    const decks = envDecks.map(d => {
        const arch = (d.archetype || '').trim() || 'その他'
        return {
            id: d.deckCode,
            deck_code: d.deckCode,
            event_rank: d.rank || null,
            event_date: d.eventDate || null,
            event_location: d.eventName || null,
            archetype_id: arch,
            color: null as string | null,
            deck_name: arch,
            thumbnail_url: images[arch] || null,
            created_at: '',
        }
    })
    const archetypeMap = new Map<string, { name: string; cover_image_url: string | null }>()
    for (const d of decks) {
        if (!archetypeMap.has(d.archetype_id)) archetypeMap.set(d.archetype_id, { name: d.archetype_id, cover_image_url: images[d.archetype_id] || null })
    }

    const grouped: Record<string, any[]> = {}
    decks.forEach((d) => {
        const key = d.archetype_id && archetypeMap.has(d.archetype_id) ? d.archetype_id : 'others'
        if (!grouped[key]) grouped[key] = []
        grouped[key].push(d)
    })
    Object.values(grouped).forEach(list => list.sort(byEventDateDesc))
    const groupOrder = Object.keys(grouped).sort((a, b) => {
        const ka = grouped[a][0] ? eventDateSortKey(grouped[a][0].event_date, grouped[a][0].created_at) : 0
        const kb = grouped[b][0] ? eventDateSortKey(grouped[b][0].event_date, grouped[b][0].created_at) : 0
        return kb - ka
    })

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <PublicHeader game="unionarena" />
            <main className="flex-grow pt-8 pb-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-5xl mx-auto">
                    <div className="mb-8">
                        <Link href="/unionarena" className="text-sm text-blue-600 hover:text-blue-800 font-medium">← TOPに戻る</Link>
                        <h1 className="text-2xl md:text-4xl font-extrabold text-gray-900 mt-3 mb-2">環境・優勝デッキ一覧</h1>
                        <p className="text-gray-600 text-sm md:text-base">大会で結果を残したユニアリのデッキをアーキタイプ別にまとめています。</p>
                    </div>

                    {decks.length === 0 ? (
                        <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
                            <p className="text-gray-500">大会デッキデータはまだありません。データ収集が始まり次第、順次表示されます。</p>
                        </div>
                    ) : (
                        groupOrder.map((archId) => {
                            const archDecks = grouped[archId]
                            const arch = archId === 'others' ? { name: 'その他', cover_image_url: null } : archetypeMap.get(archId)
                            return (
                                <section key={archId} id={`arch-${archId}`} className="mb-8 scroll-mt-24">
                                    <h2 className="text-lg font-bold text-gray-800 mb-3 flex items-center gap-2">
                                        <span className="w-1.5 h-5 bg-blue-500 rounded-full"></span>
                                        {arch?.name || 'その他'}
                                        <span className="text-sm font-normal text-gray-400">{archDecks.length}件</span>
                                    </h2>
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                                        {archDecks.map((d: any) => (
                                            <Link key={d.id} href={`/unionarena/decks/${d.id}`} className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition">
                                                <div className="relative aspect-square bg-gray-100">
                                                    {d.thumbnail_url ? (
                                                        <Image src={d.thumbnail_url} alt={d.deck_name || arch?.name || ''} fill className="object-contain" unoptimized />
                                                    ) : arch?.cover_image_url ? (
                                                        <Image src={arch.cover_image_url} alt={arch.name} fill className="object-contain p-2" />
                                                    ) : null}
                                                    {d.event_rank && (
                                                        <span className="absolute top-1 left-1 text-[10px] font-bold text-white bg-red-600 px-1.5 py-0.5 rounded">{d.event_rank}</span>
                                                    )}
                                                    {d.color && (
                                                        <span className="absolute top-1 right-1 text-[10px] font-bold text-white bg-purple-600 px-1.5 py-0.5 rounded">{d.color}</span>
                                                    )}
                                                </div>
                                                <div className="px-2.5 py-2">
                                                    <p className="text-xs font-medium text-gray-800 truncate">{d.event_location || d.deck_code}</p>
                                                    <p className="text-[11px] text-gray-400">{d.event_date}</p>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </section>
                            )
                        })
                    )}
                </div>
            </main>
            <Footer game="unionarena" />
        </div>
    )
}
