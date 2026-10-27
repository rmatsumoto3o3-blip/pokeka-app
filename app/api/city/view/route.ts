import { NextResponse } from 'next/server'
import { buildCityView } from '@/lib/cityView'

// 絞り込み（月/日付/分布スコープ/並び替え）変更時だけ叩かれる。
// Cache-Control で CDN(エッジ)にキャッシュさせ、同一条件の再取得は関数を起動しない＝Active CPUを消費しない。
export const revalidate = 3600

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url)
    const view = await buildCityView({
        month: searchParams.get('month') ?? undefined,
        date: searchParams.get('date') ?? undefined,
        dist: searchParams.get('dist') ?? undefined,
        sort: searchParams.get('sort') ?? undefined,
    })
    return NextResponse.json(view, {
        headers: {
            'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
        },
    })
}
