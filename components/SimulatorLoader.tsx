'use client'

import { useSearchParams } from 'next/navigation'
import SimulatorManager from '@/components/SimulatorManager'

// URL の ?code= を読む唯一のクライアント境界。
// これを <Suspense> で囲うことで、ページ本体（h1・導入文・SEO本文）は
// サーバー側で静的レンダリングされ、useSearchParams による CSR バイアウトを防ぐ。
export default function SimulatorLoader() {
    const code = useSearchParams().get('code') ?? undefined
    return <SimulatorManager initialDeckCode={code} />
}
