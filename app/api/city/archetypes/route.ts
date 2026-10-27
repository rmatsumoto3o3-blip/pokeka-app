import { NextResponse } from 'next/server'
import { loadArchetypeAdoption } from '@/lib/cityStore'

// 月タブ切替時のみ叩かれる。CDNキャッシュで Active CPU を消費させない。
export const revalidate = 3600

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url)
    const month = searchParams.get('month') || undefined
    const data = await loadArchetypeAdoption(month)
    return NextResponse.json({ data }, {
        headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' },
    })
}
