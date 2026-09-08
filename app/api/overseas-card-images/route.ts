import { NextRequest, NextResponse } from 'next/server'
import { FieldValue } from 'firebase-admin/firestore'
import { getFirebaseDb } from '@/lib/firebase/admin'

// 海外(PTCG)カードの「英語名 → 画像URL」キャッシュ。
// pokemontcg.io の名前解決はレート/安定性に難があるため、解決済みマップをここに貯める。
// 書き込みは秘密ヘッダー必須。読み取りは公開。ページはこのマップを読むだけ（描画時にAPIを叩かない）。

const MAX_ENTRIES = 8000
const docRef = () => {
    const db = getFirebaseDb()
    if (!db) return null
    return db.collection('overseasMeta').doc('cardImages')
}

const sanitize = (value: unknown): Record<string, string> => {
    if (!value || typeof value !== 'object') return {}
    const out: Record<string, string> = {}
    let n = 0
    for (const [k, v] of Object.entries(value as Record<string, unknown>)) {
        const name = String(k).trim().slice(0, 120)
        const url = String(v ?? '').trim().slice(0, 500)
        if (!name || !/^https:\/\//.test(url)) continue
        out[name] = url
        if (++n >= MAX_ENTRIES) break
    }
    return out
}

export async function GET() {
    const ref = docRef()
    if (!ref) {
        return NextResponse.json({ ok: false, configured: false, images: {} }, { status: 503 })
    }
    const snap = await ref.get()
    const data = snap.exists ? snap.data() : null
    return NextResponse.json({ ok: true, configured: true, images: data?.images ?? {}, updatedAt: data?.updatedAt ?? null })
}

export async function POST(request: NextRequest) {
    const secret = process.env.ENV_DECKS_SYNC_SECRET
    const provided = request.headers.get('x-env-decks-secret')
    if (!secret || provided !== secret) {
        return NextResponse.json({ ok: false, error: 'Unauthorized' }, { status: 401 })
    }
    const ref = docRef()
    if (!ref) {
        return NextResponse.json({ ok: false, configured: false, error: 'Firebase Admin is not configured' }, { status: 503 })
    }
    const body = await request.json().catch(() => ({})) as Record<string, unknown>
    const images = sanitize(body.images)
    if (Object.keys(images).length === 0) {
        return NextResponse.json({ ok: false, error: 'no valid images' }, { status: 400 })
    }
    // マージ保存（増分投入できるよう merge:true。images マップはネストされて deep-merge される）
    await ref.set({ images, updatedAt: FieldValue.serverTimestamp() }, { merge: true })

    const snap = await ref.get()
    const total = Object.keys(snap.data()?.images ?? {}).length
    return NextResponse.json({ ok: true, added: Object.keys(images).length, total })
}
