'use client'

import { useState, Suspense } from 'react'
import PracticeTool from './PracticeTool'

export default function DeckPracticeLauncher({ deckCode }: { deckCode: string }) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <>
            <button
                onClick={() => setIsOpen(true)}
                className="inline-flex items-center gap-1.5 px-2.5 py-2 bg-blue-500 text-white rounded-lg font-bold text-sm hover:bg-blue-600 transition"
            >
                このデッキで一人回し
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-[100] bg-black/70 flex items-center justify-center p-0 sm:p-4">
                    <div className="w-full h-full sm:h-[90vh] sm:max-w-6xl bg-[#0a0a0c] sm:rounded-2xl overflow-hidden shadow-2xl">
                        <Suspense fallback={<div className="w-full h-full flex items-center justify-center text-white">読み込み中...</div>}>
                            <PracticeTool
                                initialCode1={deckCode}
                                embedded
                                onClose={() => setIsOpen(false)}
                            />
                        </Suspense>
                    </div>
                </div>
            )}
        </>
    )
}
