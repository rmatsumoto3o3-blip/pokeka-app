'use server'

// ガンダムカードゲームのデッキコードから、bandai-tcg-plus のレシピを取得する。
// フロー: deck_code → url_code → recipe(main_deck 50枚)。
// リソースデッキ(10枚)はレシピに含まれない（汎用リソースのため）ので、一人回し側で固定10枚とする。

const BANDAI_API = 'https://api.bandai-tcg-plus.com'
const GAME_TITLE_ID = 15

export type GundamDeckCardType = 'unit' | 'pilot' | 'command' | 'base'
export type GundamDeckCard = {
    cardNumber: string
    name: string
    type: GundamDeckCardType
    color: string
    level: number
    cost: number
    imageUrl: string
    count: number
}

const TYPE_MAP: Record<string, GundamDeckCardType> = { UNIT: 'unit', PILOT: 'pilot', COMMAND: 'command', BASE: 'base' }

export async function fetchGundamDeckByCode(
    deckCodeRaw: string,
): Promise<{ ok: true; cards: GundamDeckCard[]; total: number } | { ok: false; error: string }> {
    const deckCode = (deckCodeRaw || '').trim()
    if (!deckCode) return { ok: false, error: 'デッキコードを入力してください' }
    // deck_code は英数字。URLやスペースが混じっても拾えるように抽出。
    const m = deckCode.match(/([A-Za-z0-9]{8,})/)
    const code = m ? m[1] : deckCode

    try {
        const ucRes = await fetch(`${BANDAI_API}/api/user/deck/url_code?deck_code=${encodeURIComponent(code)}`, {
            headers: { 'User-Agent': 'Mozilla/5.0' },
            cache: 'no-store',
        })
        if (!ucRes.ok) return { ok: false, error: `デッキコードが見つかりません（${ucRes.status}）` }
        const ucJson = await ucRes.json()
        const urlCode: string | undefined = ucJson?.success?.url_code
        if (!urlCode) return { ok: false, error: 'デッキコードの展開に失敗しました' }

        const rcRes = await fetch(
            `${BANDAI_API}/api/user/deck/recipe?url_code=${encodeURIComponent(urlCode)}&game_title_id=${GAME_TITLE_ID}&encode=0`,
            { headers: { 'User-Agent': 'Mozilla/5.0' }, cache: 'no-store' },
        )
        if (!rcRes.ok) return { ok: false, error: `レシピ取得に失敗しました（${rcRes.status}）` }
        const success = (await rcRes.json())?.success
        const main = success?.main_deck
        if (!Array.isArray(main) || main.length === 0) return { ok: false, error: 'デッキの中身が取得できませんでした' }

        const cards: GundamDeckCard[] = []
        let total = 0
        for (const c of main) {
            const t = TYPE_MAP[String(c?.type || '').toUpperCase()]
            if (!t) continue // リソース等の想定外タイプは除外
            const count = Math.max(1, parseInt(String(c?.card_count ?? 1), 10) || 1)
            total += count
            cards.push({
                cardNumber: String(c?.card_number || ''),
                name: String(c?.card_name || ''),
                type: t,
                color: String(c?.color || ''),
                level: parseInt(String(c?.level ?? 0), 10) || 0,
                cost: parseInt(String(c?.cost ?? 0), 10) || 0,
                imageUrl: String(c?.image_url || ''),
                count,
            })
        }
        if (!cards.length) return { ok: false, error: 'メインデッキのカードが見つかりませんでした' }
        return { ok: true, cards, total }
    } catch (e) {
        return { ok: false, error: '通信エラーが発生しました。時間をおいて再度お試しください' }
    }
}
