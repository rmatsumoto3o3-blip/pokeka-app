import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { representativeCard, buildArchetypeCardAdoption, type Card, type EventRec, type ArchetypeMap } from '@/lib/city'
import { fbWriteDoc } from '@/lib/cityFirebase'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 300

// シティ公開データを Supabase から1回だけ全件読み、集計済みドキュメントを Firestore(cityData/*) へ投入する。
// 以後、公開ページ(/city, /city/archetypes, /city/prefectures)は Firebase だけを読むため Supabase egress がゼロになる。
// 認証: x-city-sync-secret ヘッダ（CITY_SYNC_SECRET、無ければ ENV_DECKS_SYNC_SECRET と一致）。
export async function POST(request: NextRequest) {
    // --- モードA: ドキュメント直接投入（{docs:{id:payload}}）。Supabaseが使えない間の seed 用。
    //     認可は service-role キー（既に Vercel 環境にある SUPABASE_SERVICE_ROLE_KEY）と一致で判定。
    let body: unknown = null
    try { body = await request.json() } catch { /* body 無し＝モードB */ }
    if (body && typeof body === 'object' && 'docs' in (body as Record<string, unknown>)) {
        const svc = process.env.SUPABASE_SERVICE_ROLE_KEY
        const key = request.headers.get('x-sync-key')
        if (!svc || key !== svc) return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
        const docs = (body as { docs: Record<string, unknown> }).docs
        const results: Record<string, string> = {}
        for (const [id, payload] of Object.entries(docs)) {
            try { const okw = await fbWriteDoc(id, payload); results[id] = okw ? 'ok' : 'no-firebase' }
            catch (e) { results[id] = 'ERR ' + String((e as Error).message || e) }
        }
        return NextResponse.json({ ok: true, mode: 'write-docs', writes: results })
    }

    // --- モードB: Supabase から集計して投入（Supabase 復帰後用） ---
    const secret = process.env.CITY_SYNC_SECRET || process.env.ENV_DECKS_SYNC_SECRET
    const provided = request.headers.get('x-city-sync-secret')
    if (!secret || provided !== secret) {
        return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
    }

    const url = process.env.NEXT_PUBLIC_SUPABASE_URL
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!url || !key) return NextResponse.json({ ok: false, error: 'supabase env missing' }, { status: 500 })
    const sb = createClient(url, key)

    try {
        // 1) city_events（小・全件）
        const { data: evData, error: evErr } = await sb.from('city_events')
            .select('event_holding_id, date, shop, prefecture, league, entrants_count, results')
            .order('date', { ascending: false })
        if (evErr) throw new Error('city_events: ' + evErr.message)
        const events = (evData || []) as EventRec[]

        // 2) city_decks（大・全件）を1回だけ読んでメモリに保持
        const deckCards: Record<string, Card[]> = {}
        let from = 0; const size = 1000
        for (;;) {
            const { data, error } = await sb.from('city_decks').select('deck_code, cards').range(from, from + size - 1)
            if (error) throw new Error('city_decks: ' + error.message)
            const rows = (data || []) as { deck_code: string; cards: Card[] }[]
            for (const r of rows) deckCards[r.deck_code] = r.cards
            if (rows.length < size) break
            from += size
        }

        // 3) 区分・注目カード・既存アーキタイプ
        const [ov, rl, wl, ex] = await Promise.all([
            sb.from('city_deck_archetypes').select('deck_code, archetype'),
            sb.from('city_archetype_rules').select('representative, archetype'),
            sb.from('city_watchlist').select('card_name').order('sort_order', { ascending: true }),
            sb.from('deck_archetypes').select('name'),
        ])
        const overrides: Record<string, string> = {}
        for (const r of (ov.data || []) as { deck_code: string; archetype: string }[]) overrides[r.deck_code] = r.archetype
        const rules: Record<string, string> = {}
        for (const r of (rl.data || []) as { representative: string; archetype: string }[]) rules[r.representative] = r.archetype
        const archMap: ArchetypeMap = { rules, overrides }
        const watchlist = ((wl.data || []) as { card_name: string }[]).map(r => r.card_name).filter(Boolean)
        const existingArch = [...new Set(((ex.data || []) as { name: string }[]).map(a => (a.name || '').trim()).filter(Boolean))]
            .sort((a, b) => a.localeCompare(b, 'ja'))

        // 4) deckIndex（reps / cardNames / cardCounts / total）を集計
        const reps: Record<string, string | null> = {}
        const cardCounts: Record<string, number> = {}
        const nameSet = new Set<string>()
        let total = 0
        for (const [code, cards] of Object.entries(deckCards)) {
            reps[code] = representativeCard(cards)
            total++
            const uniq = new Set<string>()
            for (const c of (cards || [])) if (c?.name) { nameSet.add(c.name); uniq.add(c.name) }
            for (const n of uniq) cardCounts[n] = (cardCounts[n] || 0) + 1
        }
        const deckIndex = { reps, cardNames: [...nameSet].sort((a, b) => a.localeCompare(b, 'ja')), cardCounts, total }

        // 5) 採用率（全期間＋月別）
        const months = [...new Set(events.map(e => e.date.slice(0, 6)))].sort((a, b) => b.localeCompare(a))
        const adoptionAll = buildArchetypeCardAdoption(events, deckCards, archMap)
        const adoptionByMonth: Record<string, ReturnType<typeof buildArchetypeCardAdoption>> = {}
        for (const m of months) adoptionByMonth[m] = buildArchetypeCardAdoption(events, deckCards, archMap, m)

        // 6) 直近日の構成（イベントカードのカード画像用）。直近14日分だけ。
        const dates = [...new Set(events.map(e => e.date))].sort((a, b) => b.localeCompare(a)).slice(0, 14)
        const compByDate: Record<string, Record<string, Card[]>> = {}
        for (const d of dates) {
            const codes = new Set(events.filter(e => e.date === d).flatMap(e => e.results.map(r => r.deck_id)))
            const m: Record<string, Card[]> = {}
            for (const code of codes) if (deckCards[code]) m[code] = deckCards[code]
            compByDate[d] = m
        }

        // 7) Firestore へ書き込み（1ドキュメントずつ・サイズ超過は個別に報告）
        const results: Record<string, string> = {}
        const put = async (id: string, payload: unknown) => {
            try { await fbWriteDoc(id, payload); results[id] = 'ok' }
            catch (e) { results[id] = 'ERR ' + String((e as Error).message || e) }
        }
        await put('events', events)
        await put('deckIndex', deckIndex)
        await put('archMap', archMap)
        await put('watchlist', watchlist)
        await put('existingArch', existingArch)
        await put('adoption_all', adoptionAll)
        for (const m of months) await put(`adoption_${m}`, adoptionByMonth[m])
        for (const d of dates) await put(`comp_${d}`, compByDate[d])

        return NextResponse.json({
            ok: true,
            counts: { events: events.length, decks: total, months: months.length, compDates: dates.length },
            writes: results,
        })
    } catch (e) {
        return NextResponse.json({ ok: false, error: String((e as Error).message || e) }, { status: 500 })
    }
}
