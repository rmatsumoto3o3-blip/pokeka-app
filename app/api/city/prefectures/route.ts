import { NextResponse } from 'next/server'
import { buildPrefectureView } from '@/lib/cityView'

// 期間/地域の切替時のみ叩かれる。CDNキャッシュで Active CPU を消費させない。
export const revalidate = 300

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url)
    const view = await buildPrefectureView({
        period: searchParams.get('period') ?? undefined,
        region: searchParams.get('region') ?? undefined,
    })
    return NextResponse.json(view, {
        headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=3600' },
    })
}
