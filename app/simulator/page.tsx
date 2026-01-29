'use client'

import PublicHeader from '@/components/PublicHeader'
import Footer from '@/components/Footer'
import SimulatorManager from '@/components/SimulatorManager'

export default async function SimulatorPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const resolvedParams = await searchParams
    const code = typeof resolvedParams.code === 'string' ? resolvedParams.code : undefined

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <PublicHeader />

            <main className="flex-grow pt-24 pb-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-10">
                        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-4">
                            初手確率シミュレーター
                        </h1>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                            公式デッキコードから、初手（7枚）に特定のカードを引ける確率や、<br className="hidden md:inline" />
                            サイド落ちを考慮して山札に残る確率を計算します。
                        </p>
                    </div>

                    <SimulatorManager initialDeckCode={code} />
                </div>
            </main>

            <Footer />
        </div>
    )
}
