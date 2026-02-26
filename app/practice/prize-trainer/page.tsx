'use client'

import { useState, useEffect, useMemo } from 'react'
import { CardData, fetchDeckData } from '@/lib/deckParser'
import { supabase } from '@/lib/supabase'
import Image from 'next/image'
import Link from 'next/link'
import { getPrizeTrainerFeedbackAction } from '@/app/aiActions'

export default function PrizeTrainerPage() {
    const [deckCode, setDeckCode] = useState('')
    const [fullDeck, setFullDeck] = useState<CardData[]>([])
    const [prizes, setPrizes] = useState<CardData[]>([])
    const [hand, setHand] = useState<CardData[]>([])
    const [deckAfterSetup, setDeckAfterSetup] = useState<CardData[]>([])
    const [selectedPrizeGuesses, setSelectedPrizeGuesses] = useState<Record<string, number>>({})
    const [gameState, setGameState] = useState<'idle' | 'setup' | 'playing' | 'result'>('idle')
    const [loading, setLoading] = useState(false)
    const [feedback, setFeedback] = useState('')
    const [accuracyScore, setAccuracyScore] = useState<number | null>(null)
    const [timer, setTimer] = useState(0)
    const [isLoggedIn, setIsLoggedIn] = useState(false)

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            setIsLoggedIn(!!session)
        }
        checkAuth()
    }, [])

    // Start training
    const startTraining = async () => {
        if (!deckCode) return
        setLoading(true)
        try {
            const data = await fetchDeckData(deckCode)
            setFullDeck(data)

            // Expand quantity to individual cards
            const flatDeck: CardData[] = []
            data.forEach(c => {
                for (let i = 0; i < c.quantity; i++) {
                    flatDeck.push({ ...c, quantity: 1 })
                }
            })

            // Shuffle
            const shuffled = [...flatDeck].sort(() => Math.random() - 0.5)

            // Setup side (6) and hand (7) - only need remaining deck for user to see
            const prizeCards = shuffled.slice(0, 6)
            const handCards = shuffled.slice(6, 13)
            const remaining = shuffled.slice(13) // Keep randomized for better training

            setPrizes(prizeCards)
            setHand(handCards)
            setDeckAfterSetup(remaining)
            setGameState('playing')
            setTimer(0)
            setSelectedPrizeGuesses({})
            setFeedback('')
            setAccuracyScore(null)
        } catch (e) {
            alert('デッキ取得に失敗しました。')
        } finally {
            setLoading(false)
        }
    }

    // Submit answer
    const handleSubmit = async () => {
        setGameState('result')

        // Count actual prizes
        const actualCounts: Record<string, number> = {}
        prizes.forEach(p => {
            actualCounts[p.name] = (actualCounts[p.name] || 0) + 1
        })

        const res = await getPrizeTrainerFeedbackAction(selectedPrizeGuesses, actualCounts)
        if (res.success) {
            setFeedback(res.message || '')
            setAccuracyScore(res.accuracyScore || 0)
        }
    }

    const changeGuessCount = (name: string, delta: number) => {
        const currentTotal = Object.values(selectedPrizeGuesses).reduce((a, b) => a + b, 0)
        const currentCount = selectedPrizeGuesses[name] || 0
        const newCount = Math.max(0, currentCount + delta)

        if (delta > 0 && currentTotal >= 6) return // Max 6 cards

        setSelectedPrizeGuesses(prev => {
            const next = { ...prev }
            if (newCount === 0) {
                delete next[name]
            } else {
                next[name] = newCount
            }
            return next
        })
    }

    const currentTotalGuesses = Object.values(selectedPrizeGuesses).reduce((a, b) => a + b, 0)

    // Group deck cards by name to save space and eliminate scrolls
    const groupedDeck = useMemo(() => {
        const groups: Record<string, { card: CardData, count: number }> = {}
        deckAfterSetup.forEach(c => {
            if (!groups[c.name]) {
                groups[c.name] = { card: c, count: 0 }
            }
            groups[c.name].count++
        })
        return Object.values(groups)
    }, [deckAfterSetup])

    // Timer
    useEffect(() => {
        let interval: any
        if (gameState === 'playing') {
            interval = setInterval(() => setTimer(t => t + 1), 1000)
        }
        return () => clearInterval(interval)
    }, [gameState])

    return (
        <div className="min-h-screen bg-slate-50 py-8 px-4 relative">
            <div className="max-w-6xl mx-auto space-y-6">
                {/* Navigation Buttons */}
                <div className="flex justify-start gap-2">
                    {gameState === 'idle' ? (
                        <Link
                            href="/practice"
                            className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors font-bold text-sm bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <path d="m15 18-6-6 6-6" />
                            </svg>
                            前画面へ
                        </Link>
                    ) : (
                        <button
                            onClick={() => setGameState('idle')}
                            className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors font-bold text-sm bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <path d="m15 18-6-6 6-6" />
                            </svg>
                            入力に戻る
                        </button>
                    )}

                    <Link
                        href={isLoggedIn ? "/dashboard" : "/"}
                        className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors font-bold text-sm bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                            <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                            <polyline points="9 22 9 12 15 12 15 22" />
                        </svg>
                        TOPへ
                    </Link>
                </div>

                <header className="text-center space-y-2">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tighter">
                        PRIZE TRAINER
                    </h1>
                    <p className="text-slate-500 text-sm">サイドにある6枚を山札から推論せよ。</p>
                </header>

                {gameState === 'idle' && (
                    <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 max-w-md mx-auto space-y-4">
                        <label className="block text-sm font-bold text-slate-700">デッキコードを入力 (公式サイト)</label>
                        <input
                            type="text"
                            value={deckCode}
                            onChange={e => setDeckCode(e.target.value)}
                            placeholder="例: pXpyyy-XXXXXX-XXXXXX"
                            className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-pink-500 outline-none"
                        />
                        <button
                            onClick={startTraining}
                            disabled={loading || !deckCode}
                            className="w-full bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-800 transition disabled:opacity-50"
                        >
                            {loading ? '読み込み中...' : 'トレーニング開始'}
                        </button>
                    </div>
                )}

                {gameState === 'playing' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Searchable Deck List */}
                        <div className="lg:col-span-2 bg-slate-950 rounded-2xl border-4 border-slate-800 p-6 space-y-4 shadow-2xl h-[85vh] flex flex-col">
                            <div className="flex justify-between items-center">
                                <h2 className="font-bold flex items-center gap-2 text-white text-lg">
                                    <Image src="/king.png" alt="King" width={28} height={28} className="object-contain" />
                                    山札の中身 ({deckAfterSetup.length}枚)
                                </h2>
                                <span className="font-mono bg-slate-800 px-3 py-1 rounded-full text-sm text-pink-400 font-bold border border-slate-700">
                                    TIME: {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
                                </span>
                            </div>
                            <div className="flex-1 overflow-y-auto grid grid-cols-5 md:grid-cols-7 lg:grid-cols-8 gap-2 p-1 pr-3 custom-scrollbar">
                                {groupedDeck.map((group, i) => (
                                    <div
                                        key={`${group.card.name}-${i}`}
                                        className="aspect-[2/3] relative rounded overflow-hidden border border-slate-800 shadow-sm opacity-90 hover:opacity-100 hover:-translate-y-1 hover:scale-105 hover:shadow-xl hover:z-10 transition-all duration-200 cursor-pointer group"
                                    >
                                        <Image src={group.card.imageUrl} alt={group.card.name} fill className="object-cover" unoptimized />
                                        {/* Quantity Badge */}
                                        <div className="absolute bottom-1 right-1 bg-slate-900 border border-slate-700 text-white text-[10px] font-black px-1.5 py-0.5 rounded shadow-lg z-20 group-hover:scale-110 transition-transform">
                                            x{group.count}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Starting Hand Display - Clean List */}
                            <div className="pt-6 border-t border-slate-800">
                                <h3 className="text-[10px] font-black text-slate-500 mb-3 tracking-[0.2em] uppercase flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-pink-500 rounded-full"></span>
                                    Starting Hand (手札)
                                </h3>
                                <div className="flex flex-wrap gap-2 pb-2">
                                    {hand.map((card, i) => (
                                        <div
                                            key={`hand-${i}`}
                                            className="w-16 md:w-20 aspect-[2/3] relative rounded overflow-hidden border border-slate-700 shadow-lg hover:-translate-y-2 hover:scale-110 hover:shadow-2xl hover:z-10 transition-all duration-200 cursor-pointer"
                                        >
                                            <Image src={card.imageUrl} alt={card.name} fill className="object-cover" unoptimized />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Inference Console */}
                        <div className="bg-white border-2 border-slate-200 text-slate-900 rounded-2xl p-6 space-y-6 shadow-sm flex flex-col h-[85vh]">
                            <div>
                                <h3 className="text-lg font-bold mb-1">サイド落ち推論</h3>
                                <p className="text-slate-500 text-xs font-medium">元のデッキリストからサイドにあると思う6枚を選択してください。</p>
                            </div>

                            <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar space-y-2">
                                {fullDeck.map((card, i) => {
                                    const count = selectedPrizeGuesses[card.name] || 0
                                    return (
                                        <div
                                            key={i}
                                            className={`w-full flex justify-between items-center p-2 rounded-lg text-sm border-2 transition-colors ${count > 0 ? 'bg-pink-50 border-pink-200' : 'border-slate-50 bg-slate-50/30'}`}
                                        >
                                            <div className="flex-1 min-w-0 pr-2">
                                                <div className="truncate font-bold text-slate-800">{card.name}</div>
                                                <div className="text-[10px] text-slate-400">デッキ内: {card.quantity}枚</div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => changeGuessCount(card.name, -1)}
                                                    className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50 text-slate-600 font-bold transition-all disabled:opacity-20 shadow-sm"
                                                    disabled={count === 0}
                                                >
                                                    -
                                                </button>
                                                <span className={`w-5 text-center font-mono font-black text-base ${count > 0 ? 'text-pink-600' : 'text-slate-300'}`}>
                                                    {count}
                                                </span>
                                                <button
                                                    onClick={() => changeGuessCount(card.name, 1)}
                                                    className="w-8 h-8 rounded-lg bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-50 text-slate-600 font-bold transition-all disabled:opacity-20 shadow-sm"
                                                    disabled={currentTotalGuesses >= 6 || count >= card.quantity}
                                                >
                                                    +
                                                </button>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>

                            <div className="pt-4 border-t border-slate-100">
                                <div className="flex justify-between text-xs mb-3 font-bold text-slate-500">
                                    <span>選択済みカード</span>
                                    <span className={currentTotalGuesses === 6 ? 'text-pink-600 uppercase tracking-tighter' : ''}>
                                        {currentTotalGuesses} / 6 枚
                                    </span>
                                </div>
                                <button
                                    onClick={handleSubmit}
                                    disabled={currentTotalGuesses === 0}
                                    className="w-full bg-slate-900 text-white py-4 rounded-xl font-black hover:bg-slate-800 transition-all disabled:opacity-30 shadow-lg shadow-slate-200 transform active:scale-95"
                                >
                                    回答を送信
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {gameState === 'result' && (
                    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in zoom-in duration-500">
                        <div className="bg-white p-8 rounded-3xl shadow-2xl border text-center space-y-6">
                            <div className="inline-block p-4 bg-slate-50 rounded-full mb-2">
                                <span className="text-5xl">🏆</span>
                            </div>
                            <h2 className="text-3xl font-black">結果発表</h2>

                            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                                <div className="text-sm font-bold text-slate-500 uppercase tracking-widest mb-1">Inference Accuracy</div>
                                <div className="text-5xl font-black text-slate-900">{accuracyScore}%</div>
                                <div className="w-full max-w-xs mx-auto h-2 bg-slate-200 rounded-full mt-4 overflow-hidden">
                                    <div
                                        className="h-full bg-pink-500 transition-all duration-1000 ease-out"
                                        style={{ width: `${accuracyScore}%` }}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-6 gap-4 py-4">
                                {prizes.map((card, i) => {
                                    const actualCounts: Record<string, number> = {}
                                    prizes.forEach(p => actualCounts[p.name] = (actualCounts[p.name] || 0) + 1)

                                    const guessedCount = selectedPrizeGuesses[card.name] || 0
                                    // Identify if this specific card (by index) was "matched"
                                    // Logic: if we guessed N of this card, and it's one of the first N of this card in the actual prizes
                                    const cardOccurrences = prizes.slice(0, i + 1).filter(p => p.name === card.name).length
                                    const isCorrect = guessedCount >= cardOccurrences

                                    return (
                                        <div key={i} className={`flex flex-col gap-2 p-2 rounded-xl border ${isCorrect ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50 opacity-80'}`}>
                                            <div className="aspect-[2/3] relative rounded overflow-hidden shadow-sm">
                                                <Image src={card.imageUrl} alt={card.name} fill className="object-cover" unoptimized />
                                            </div>
                                            <div className="text-[10px] font-bold text-slate-700 truncate">{card.name}</div>
                                            <div className="text-[9px] flex justify-between">
                                                <span className="text-slate-400">予想: {guessedCount}</span>
                                                <span className={isCorrect ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
                                                    {isCorrect ? 'OK' : 'MISS'}
                                                </span>
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>

                            {feedback ? (
                                <div className="bg-slate-900 text-white p-6 rounded-2xl text-left relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-4 opacity-10 text-4xl font-black">AI COACH</div>
                                    <p className="text-slate-300 text-sm leading-relaxed italic">{feedback}</p>
                                </div>
                            ) : (
                                <div className="animate-pulse flex space-x-4 justify-center">
                                    <div className="h-4 bg-slate-200 rounded w-48"></div>
                                </div>
                            )}

                            <div className="flex flex-col md:flex-row gap-3 pt-4">
                                <button
                                    onClick={() => setGameState('idle')}
                                    className="flex-1 bg-slate-900 text-white py-4 rounded-xl font-bold hover:bg-slate-800 transition"
                                >
                                    もう一度
                                </button>
                                <button
                                    onClick={() => setGameState('playing')}
                                    className="flex-1 bg-white text-slate-900 border border-slate-200 py-4 rounded-xl font-bold hover:bg-slate-50 transition"
                                >
                                    同じデッキでリトライ
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #cbd5e1;
                    border-radius: 10px;
                }
            `}</style>
        </div>
    )
}
