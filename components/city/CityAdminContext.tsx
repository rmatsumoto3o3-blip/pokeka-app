'use client'
import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

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

// 公開ページは静的のまま。管理者判定はクライアント側（ブラウザのSupabaseセッション）で行い、
// 区分UIの表示可否だけを切り替える。書き込みは API 側でサーバー認可する（表示スプーフでは保存不可）。
export default function CityAdminProvider({
    existing, auto, initialOverrides, children,
}: {
    existing: string[]
    auto: string[]
    initialOverrides: Record<string, string>
    children: React.ReactNode
}) {
    const [isAdmin, setIsAdmin] = useState(false)
    const [ov, setOv] = useState<Record<string, string>>(initialOverrides)
    const [flash, setFlash] = useState('')

    useEffect(() => {
        let alive = true
        supabase.auth.getUser().then(({ data }) => {
            const email = data.user?.email || ''
            if (alive) setIsAdmin(ADMIN_EMAILS.includes(email))
        }).catch(() => { })
        return () => { alive = false }
    }, [])

    const save = useCallback(async (deckId: string, arch: string) => {
        try {
            const res = await fetch('/api/city/archetype', {
                method: 'PATCH',
                headers: { 'content-type': 'application/json' },
                body: JSON.stringify({ deck_id: deckId, archetype: arch }),
            })
            if (!res.ok) { setFlash('保存失敗（権限を確認）'); setTimeout(() => setFlash(''), 2500); return false }
            setOv(o => { const n = { ...o }; if (arch) n[deckId] = arch; else delete n[deckId]; return n })
            setFlash('保存しました'); setTimeout(() => setFlash(''), 1200)
            return true
        } catch { setFlash('通信エラー'); setTimeout(() => setFlash(''), 2500); return false }
    }, [])

    return (
        <CityAdminCtx.Provider value={{ on: isAdmin, existing, auto, getOverride: (d) => ov[d], save }}>
            {isAdmin && (
                <div className="mb-4 flex items-center gap-3 bg-indigo-50 border border-indigo-100 rounded-lg px-3 py-2">
                    <span className="text-xs font-black text-indigo-800">管理者モード</span>
                    <span className="text-[11px] text-indigo-500">各デッキ下の「区分」を選ぶと即保存（分布は再読込で反映）</span>
                    {flash && <span className="text-[11px] font-bold text-emerald-700">{flash}</span>}
                </div>
            )}
            {children}
        </CityAdminCtx.Provider>
    )
}
