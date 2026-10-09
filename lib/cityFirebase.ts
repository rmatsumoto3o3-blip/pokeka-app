// シティリーグ公開データの Firebase(Firestore) 読み書き層。
// 目的: 公開ページが city_decks を全件スキャンして Supabase egress を食う構造を解消する。
//   env decks と同じく「集計済みドキュメントを単発read」する。各ドキュメントは cityData コレクション配下。
//   書き込みは service-account 認証が要るため本番(Vercel)の API ルートからのみ行う。
import { getFirebaseDb } from './firebase/admin'
import type { ArchetypeMap, EventRec, Card } from './city'

const COL = 'cityData'

// 1ドキュメント読む。Firebase未設定(ローカル等)・未投入・失敗時は null。
async function readDoc<T>(docId: string): Promise<T | null> {
    try {
        const db = getFirebaseDb()
        if (!db) return null
        const snap = await db.collection(COL).doc(docId).get()
        if (!snap.exists) return null
        return (snap.data() as { payload?: T })?.payload ?? null
    } catch { return null }
}

export const fbReadEvents = () => readDoc<EventRec[]>('events')
export const fbReadDeckIndex = () => readDoc<{ reps: Record<string, string | null>; cardNames: string[]; cardCounts: Record<string, number>; total: number }>('deckIndex')
export const fbReadArchMap = () => readDoc<ArchetypeMap>('archMap')
export const fbReadWatchlist = () => readDoc<string[]>('watchlist')
export const fbReadExistingArch = () => readDoc<string[]>('existingArch')
// deck_archetypes（id↔名前・表示順・カバー画像）。TOPのTier表/優勝デッキのid紐付けに必要。
export type DeckArchetypeRow = { id: string; name: string; display_order: number | null; cover_image_url: string | null; created_at?: string }
export const fbReadDeckArchetypes = () => readDoc<DeckArchetypeRow[]>('deckArchetypes')
// 採用率は月別にドキュメント分割（全期間は 'all'）
export const fbReadAdoption = (month?: string) => readDoc<unknown>(`adoption_${month || 'all'}`)
// 日別デッキ構成（イベントカードのカード画像用）。recent日だけ投入される。
// 大規模日は1MiB超のためシャード化：comp_{date} が {__shards:N} のときは comp_{date}__0..N-1 を結合。
export const fbReadCompositions = async (date: string): Promise<Record<string, Card[]> | null> => {
    const head = await readDoc<Record<string, Card[]> & { __shards?: number }>(`comp_${date}`)
    if (!head) return null
    if (typeof head.__shards === 'number') {
        const merged: Record<string, Card[]> = {}
        for (let i = 0; i < head.__shards; i++) {
            const sh = await readDoc<Record<string, Card[]>>(`comp_${date}__${i}`)
            if (sh) Object.assign(merged, sh)
        }
        return merged
    }
    return head
}

// --- 書き込み（本番APIルート専用。service-account が無ければ何もしない） ---
export async function fbWriteDoc(docId: string, payload: unknown): Promise<boolean> {
    const db = getFirebaseDb()
    if (!db) return false
    await db.collection(COL).doc(docId).set({ payload, updatedAt: new Date().toISOString() })
    return true
}
