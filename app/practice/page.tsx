'use client'

import { Suspense } from 'react'
import PublicHeader from '@/components/PublicHeader'
import PracticeTool from '@/components/PracticeTool'

export default function PracticePage() {
    return (
        <>
            <PublicHeader />
            <Suspense fallback={<div className="min-h-screen flex items-center justify-center">読み込み中...</div>}>
                <PracticeTool />
            </Suspense>
        </>
    )
}
