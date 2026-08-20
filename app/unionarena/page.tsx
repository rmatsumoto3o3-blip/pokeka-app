import type { Metadata } from 'next'
import { unstable_cache } from 'next/cache'
import UnionArenaLandingPage from '@/components/UnionArenaLandingPage'
import { getFirebaseDb } from '@/lib/firebase/admin'
import { fetchUnionArenaDeckData } from '@/lib/unionArenaDeckParser'
import { getUnionRecommended } from '@/lib/unionArenaTitles'
import type { UnionArenaDeckRecord, UnionArenaDeckArchetype } from '@/lib/supabase'

export const metadata: Metadata = {
    title: 'ユニアリ環境デッキ・Tier表 | PokéLix（ポケリス）',
    description: 'ユニアリ（ユニオンアリーナ）の大会入賞デッキデータをもとにした環境Tier表・優勝デッキ集。',
    alternates: {
        canonical: 'https://www.pokelix.jp/unionarena',
    },
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

// アーキタイプ代表画像：各アーキタイプ1デッキだけコード展開して先頭カード画像を採用。24hキャッシュ。
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
            } catch { /* コード展開失敗はスキップ */ }
        }))
        return out
    },
    ['union-archetype-images-v1'],
    { revalidate: 86400 },
)

export default async function UnionArenaPage() {
    const envDecks = await getUnionEnvDecks()
    const [images, recommended] = await Promise.all([
        getUnionArchetypeImages(),
        getUnionRecommended(),
    ])

    // アーキタイプ別デッキ数（＝環境Tier / weeklyRanking のソース）
    const counts = new Map<string, number>()
    for (const d of envDecks) {
        const a = (d.archetype || '').trim()
        if (a) counts.set(a, (counts.get(a) || 0) + 1)
    }

    const archetypes: UnionArenaDeckArchetype[] = [...counts.entries()]
        .sort((x, y) => y[1] - x[1])
        .map(([name], i) => ({ id: name, name, display_order: i, cover_image_url: images[name] || null, created_at: '' }))

    const weeklyRanking: Record<string, number> = {}
    for (const [name, n] of counts) weeklyRanking[name] = n

    const decks: UnionArenaDeckRecord[] = envDecks.map(d => {
        const arch = (d.archetype || '').trim() || null
        return {
            id: d.deckCode,
            deck_code: d.deckCode,
            event_rank: d.rank || null,
            event_date: d.eventDate || null,
            event_location: d.eventName || null,
            archetype_id: arch,
            color: null,
            deck_name: arch,
            thumbnail_url: (arch && images[arch]) || null,
            created_at: '',
        }
    })

    return (
        <UnionArenaLandingPage
            archetypes={archetypes}
            decks={decks}
            weeklyRanking={weeklyRanking}
            series={recommended.series}
            recommendedDecks={recommended.recommendedDecks}
        />
    )
}
