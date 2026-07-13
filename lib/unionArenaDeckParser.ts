export interface UnionArenaCard {
    id: number
    code: string
    cardNumber: string
    name: string
    quantity: number
    imageUrl: string
    cost: string
    color: string
    type: string
}

export interface UnionArenaDeckData {
    mainDeck: UnionArenaCard[]
    sideDeck: UnionArenaCard[]
}

interface RawCard {
    id: number
    code: string
    card_number: string
    card_name: string
    card_count: number
    image_url: string
    cost: string
    color: string
    type: string
}

function mapCard(c: RawCard): UnionArenaCard {
    return {
        id: c.id,
        code: c.code,
        cardNumber: c.card_number,
        name: c.card_name,
        quantity: c.card_count,
        imageUrl: c.image_url,
        cost: c.cost,
        color: c.color,
        type: c.type,
    }
}

// deck_code (unionarena-tcg.com の大会デッキ一覧に載っているコード) から
// bandai-tcg-plus.com の公開API経由で実際のカードリストを取得する。
// 1. deck_code -> url_code（エンコードされたカード列）
// 2. url_code -> 実カードデータ（recipe展開）
export async function fetchUnionArenaDeckData(deckCode: string, gameTitleId = 9): Promise<UnionArenaDeckData> {
    const urlCodeRes = await fetch(
        `https://api.bandai-tcg-plus.com/api/user/deck/url_code?${new URLSearchParams({ deck_code: deckCode })}`,
        { cache: 'no-store' }
    )
    if (!urlCodeRes.ok) throw new Error('Failed to resolve deck code')
    const urlCodeData = await urlCodeRes.json()
    const urlCode = urlCodeData?.success?.url_code
    if (!urlCode) throw new Error('No url_code returned for this deck code')

    const recipeRes = await fetch(
        `https://api.bandai-tcg-plus.com/api/user/deck/recipe?${new URLSearchParams({
            url_code: urlCode,
            game_title_id: String(gameTitleId),
            encode: '0',
        })}`,
        { cache: 'no-store' }
    )
    if (!recipeRes.ok) throw new Error('Failed to fetch deck recipe')
    const recipeData = await recipeRes.json()
    const success = recipeData?.success
    if (!success) throw new Error('No recipe data returned')

    return {
        mainDeck: (success.main_deck || []).map(mapCard),
        sideDeck: (success.side_deck || []).map(mapCard),
    }
}
