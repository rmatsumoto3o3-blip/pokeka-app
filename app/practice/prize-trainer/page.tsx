'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { CardData, fetchDeckData } from '@/lib/deckParser'
import { supabase } from '@/lib/supabase'
import Image from 'next/image'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
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

    // Memoize random rotations for deck to prevent re-shuffling on every render
    const deckVisuals = useMemo(() => {
        return deckAfterSetup.map(() => ({
            rotate: (Math.random() - 0.5) * 6, // -3 to 3 deg
            x: (Math.random() - 0.5) * 8,      // -4 to 4 px
            y: (Math.random() - 0.5) * 8       // -4 to 4 px
        }))
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
        <div className="min-h-screen bg-slate-50 py-8 px-4">
            <div className="max-w-6xl mx-auto space-y-6">
                <header className="text-center space-y-2">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tighter">
                        PRIZE TRAINER <span className="text-pink-500">β</span>
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
                            <div className="flex-1 overflow-y-auto grid grid-cols-4 md:grid-cols-6 gap-x-4 gap-y-6 p-4 pr-6 custom-scrollbar">
                                {deckAfterSetup.map((card, i) => (
                                    <motion.div
                                        key={`${card.name}-${i}`}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{
                                            opacity: 0.9,
                                            scale: 1,
                                            rotate: deckVisuals[i]?.rotate || 0,
                                            x: deckVisuals[i]?.x || 0,
                                            y: deckVisuals[i]?.y || 0
                                        }}
                                        whileHover={{ scale: 1.1, opacity: 1, zIndex: 10, rotate: 0 }}
                                        className="aspect-[2/3] relative rounded overflow-hidden border border-slate-700 shadow-lg bg-white"
                                    >
                                        <Image src={card.imageUrl} alt={card.name} fill className="object-cover" unoptimized />
                                    </motion.div>
                                ))}
                            </div>

                            {/* Starting Hand Display - Fan Shape */}
                            <div className="pt-8 border-t border-slate-800 flex flex-col items-center">
                                <h3 className="text-[10px] font-black text-slate-500 mb-12 tracking-[0.2em] uppercase flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-pink-500 rounded-full animate-pulse"></span>
                                    Starting Hand
                                </h3>
                                <div className="relative h-32 w-full max-w-lg flex justify-center">
                                    {hand.map((card, i) => {
                                        const total = hand.length
                                        const index = i
                                        const mid = (total - 1) / 2
                                        const rotate = (index - mid) * 8 // 8 degree steps
                                        const x = (index - mid) * 45     // 45px horizontal spread
                                        const y = Math.pow(index - mid, 2) * 4 // Quadratic arc

                                        return (
                                            <motion.div
                                                key={`hand-${i}`}
                                                initial={{ opacity: 0, y: 100, rotate: 0 }}
                                                animate={{ opacity: 1, y, x, rotate }}
                                                whileHover={{
                                                    y: y - 40,
                                                    scale: 1.2,
                                                    zIndex: 50,
                                                    transition: { type: 'spring', stiffness: 300 }
                                                }}
                                                className="absolute w-20 md:w-24 aspect-[2/3] rounded-lg overflow-hidden border-2 border-slate-700 shadow-2xl bg-white origin-bottom cursor-pointer"
                                            >
                                                <Image src={card.imageUrl} alt={card.name} fill className="object-cover" unoptimized />
                                            </motion.div>
                                        )
                                    })}
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
