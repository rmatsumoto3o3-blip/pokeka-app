import { NextRequest, NextResponse } from 'next/server'
import { revalidatePath, revalidateTag } from 'next/cache'
import { createClient } from '@/utils/supabase/server'
import { loadArchetypeMapDB, saveOverrideDB, saveRuleDB } from '@/lib/cityStore'

export const dynamic = 'force-dynamic'

const ADMIN_EMAILS = ['player1@pokeka.local']

// 管理者（Supabaseセッションのメールが ADMIN_EMAILS）だけ編集可
async function authed(): Promise<boolean> {
    try {
        const supabase = await createClient()
        const { data: { user } } = await supabase.auth.getUser()
        return !!user?.email && ADMIN_EMAILS.includes(user.email)
    } catch {
        return false
    }
}

// 現在のマップを返す（管理者のみ）
export async function GET() {
    if (!(await authed())) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    return NextResponse.json(await loadArchetypeMapDB())
}

// デッキ1件の区分（override）を更新。archetype が空なら解除。
export async function PATCH(req: NextRequest) {
    if (!(await authed())) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    let body: { deck_id?: string; archetype?: string }
    try { body = await req.json() } catch { return NextResponse.json({ error: 'bad json' }, { status: 400 }) }
    const id = (body.deck_id || '').trim()
    if (!id) return NextResponse.json({ error: 'deck_id required' }, { status: 400 })
    try {
        await saveOverrideDB(id, (body.archetype || '').trim())
        revalidatePath('/city'); revalidateTag('city-map')
        return NextResponse.json({ ok: true, deck_id: id, archetype: (body.archetype || '').trim() || null })
    } catch (e) {
        return NextResponse.json({ error: 'save failed', detail: String(e) }, { status: 500 })
    }
}

// 代表カード→既存アーキタイプ の一括エイリアス設定。{ rules: { rep: archetype } }
export async function POST(req: NextRequest) {
    if (!(await authed())) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
    let body: { rules?: Record<string, string> }
    try { body = await req.json() } catch { return NextResponse.json({ error: 'bad json' }, { status: 400 }) }
    const rules = body.rules || {}
    try {
        for (const [rep, arch] of Object.entries(rules)) await saveRuleDB(rep, (arch || '').trim())
        revalidatePath('/city'); revalidateTag('city-map')
        return NextResponse.json({ ok: true, rules: Object.keys(rules).length })
    } catch (e) {
        return NextResponse.json({ error: 'save failed', detail: String(e) }, { status: 500 })
    }
}
