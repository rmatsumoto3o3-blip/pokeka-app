import { loadArchetypeAdoption } from '@/lib/cityStore'

// アーキタイプ名 → 代表カードの公式画像URL(pokemon-card.com) のマップを返す。
// 採用率データ(Firebase優先・キャッシュ済み)から生成。Supabaseストレージを一切使わず、
// 公式サイト直配信＝Supabase egress / Vercel画像コストともにゼロ。
// 代表カードは「アーキタイプ名の核になるポケモン」を優先し、無ければ最採用ポケモン→任意カード。
export async function getArchetypeCardImageMap(): Promise<Record<string, string>> {
    try {
        const adoption = await loadArchetypeAdoption()
        const out: Record<string, string> = {}
        for (const a of (adoption || [])) {
            const name = (a.archetype || '').trim()
            if (!name || out[name]) continue
            const core = name.replace(/BOX|ＢＯＸ|デッキ|ex|EX|\s+/gi, '').trim()
            const cards = a.cards || []
            const pick =
                (core ? cards.find(c => c.image && c.supertype === 'Pokémon' && c.name.includes(core)) : undefined)
                || cards.find(c => c.image && c.supertype === 'Pokémon')
                || cards.find(c => c.image)
            if (pick?.image) out[name] = pick.image
        }
        return out
    } catch {
        return {}
    }
}

// デッキのカードリストから代表カードの画像を選ぶ（詳細ページのヒーロー画像用）。
// 最採用のポケモンex系→最採用ポケモン→任意の画像ありカード、の順。
export function representativeCardImage(
    cards: { name?: string; imageUrl?: string | null; quantity?: number; supertype?: string | null }[] | null | undefined,
): string | undefined {
    const list = (cards || []).filter(c => c?.imageUrl)
    if (!list.length) return undefined
    const pokes = list.filter(c => (c.supertype || '').toLowerCase().includes('poké') || (c.supertype || '').toLowerCase().includes('pokemon') || (c.supertype === 'Pokémon'))
    const pool = pokes.length ? pokes : list
    const exs = pool.filter(c => /ex$/i.test(c.name || '') || (c.name || '').includes('ex'))
    const ranked = (exs.length ? exs : pool).slice().sort((a, b) => (b.quantity || 0) - (a.quantity || 0))
    return (ranked[0] || list[0]).imageUrl || undefined
}
