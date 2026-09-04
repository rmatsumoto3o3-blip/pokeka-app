import { NextResponse } from 'next/server'
import { createClient } from '@/utils/supabase/server'

export const dynamic = 'force-dynamic'

// ログイン中ユーザーの「最終アクセス時刻」を更新する軽量エンドポイント。
// 未ログインなら何もしない（負荷ほぼゼロ）。他人の情報は一切読み書きしない。
export async function POST() {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return NextResponse.json({ ok: true, online: false })
        }
        // 自分自身の last_seen だけを更新
        await supabase
            .from('users')
            .update({ last_seen: new Date().toISOString() })
            .eq('id', user.id)

        return NextResponse.json({ ok: true, online: true })
    } catch {
        // 失敗しても画面には影響させない
        return NextResponse.json({ ok: false })
    }
}
