'use client'
import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'

const ADMIN_EMAILS = ['player1@pokeka.local']

type Ctx = {
    on: boolean
    existing: string[]   // 既存アーキタイプ（Supabase）
    auto: string[]       // 収集データからの自動検出名
    getOverride: (deckId: string) => string | undefined
    save: (deckId: string, archetype: string) => Promise<boolean>
}
const CityAdminCtx = createContext<Ctx | null>(null)
export const useCityAdmin = () => useContext(CityAdminCtx)

const SECRET_KEY = 'city-admin-secret'

// 公開ページは静的のまま。管理者判定はクライアント側で行い、区分UIの表示可否だけを切替。
// 認可は2経路: ① 管理パスワード（Supabase Auth非依存・障害時もOK）② 従来のSupabaseセッション。
// 書き込みは API 側でサーバー認可するので、表示スプーフでは保存できない。
export default function CityAdminProvider({
    existing, auto, initialOverrides, children,
}: {
    existing: string[]
    auto: string[]
    initialOverrides: Record<string, string>
    children: React.ReactNode
}) {
    const [isAdmin, setIsAdmin] = useState(false)
    const [secret, setSecret] = useState('')
    const [ov, setOv] = useState<Record<string, string>>(initialOverrides)
    const [flash, setFlash] = useState('')

    // 管理パスワードを検証（GETが200なら管理者）
    const verifySecret = useCallback(async (s: string): Promise<boolean> => {
        try {
            const res = await fetch('/api/city/archetype', { headers: { 'x-city-admin-secret': s } })
            return res.ok
        } catch { return false }
    }, [])

    useEffect(() => {
        let alive = true
        // ① 管理パスワード（localStorage / URL ?admin=XXX）
        let s = ''
        try { s = localStorage.getItem(SECRET_KEY) || '' } catch { /* ignore */ }
        try {
            const u = new URL(window.location.href)
            const q = u.searchParams.get('admin')
            if (q) { s = q; try { localStorage.setItem(SECRET_KEY, q) } catch { /* ignore */ }; u.searchParams.delete('admin'); window.history.replaceState({}, '', u.toString()) }
        } catch { /* ignore */ }
        if (s) {
            verifySecret(s).then(ok => {
                if (!alive) return
                if (ok) { setSecret(s); setIsAdmin(true) }
                else { try { localStorage.removeItem(SECRET_KEY) } catch { /* ignore */ } }
            })
        }
        // ② 従来のSupabaseセッション（getSession＝cookieローカル読み）
        const supabase = createClient()
        const check = (email: string | undefined) => { if (alive && ADMIN_EMAILS.includes(email || '')) setIsAdmin(true) }
        supabase.auth.getSession().then(({ data }) => check(data.session?.user?.email)).catch(() => { })
        const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => check(session?.user?.email))
        return () => { alive = false; sub.subscription.unsubscribe() }
    }, [verifySecret])

    const unlock = useCallback(async () => {
        const s = (window.prompt('管理パスワードを入力') || '').trim()
        if (!s) return
        if (await verifySecret(s)) {
            try { localStorage.setItem(SECRET_KEY, s) } catch { /* ignore */ }
            setSecret(s); setIsAdmin(true)
        } else {
            window.alert('パスワードが違います')
        }
    }, [verifySecret])

    const save = useCallback(async (deckId: string, arch: string) => {
        try {
            const res = await fetch('/api/city/archetype', {
                method: 'PATCH',
                headers: { 'content-type': 'application/json', ...(secret ? { 'x-city-admin-secret': secret } : {}) },
                body: JSON.stringify({ deck_id: deckId, archetype: arch }),
            })
            if (!res.ok) { setFlash('保存失敗（権限を確認）'); setTimeout(() => setFlash(''), 2500); return false }
            setOv(o => { const n = { ...o }; if (arch) n[deckId] = arch; else delete n[deckId]; return n })
            setFlash('保存しました'); setTimeout(() => setFlash(''), 1200)
            return true
        } catch { setFlash('通信エラー'); setTimeout(() => setFlash(''), 2500); return false }
    }, [secret])

    return (
        <CityAdminCtx.Provider value={{ on: isAdmin, existing, auto, getOverride: (d) => ov[d], save }}>
            {isAdmin ? (
                <div className="mb-4 flex items-center gap-3 bg-indigo-50 border border-indigo-100 rounded-lg px-3 py-2">
                    <span className="text-xs font-black text-indigo-800">管理者モード</span>
                    <span className="text-[11px] text-indigo-500">各デッキ下の「区分」を選ぶと即保存（分布は最大60秒で反映）</span>
                    {flash && <span className="text-[11px] font-bold text-emerald-700">{flash}</span>}
                </div>
            ) : (
                <div className="mb-2 text-right">
                    <button onClick={unlock} className="text-[10px] text-gray-300 hover:text-gray-500 transition" aria-label="管理">管理</button>
                </div>
            )}
            {children}
        </CityAdminCtx.Provider>
    )
}
