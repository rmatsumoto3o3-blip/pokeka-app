'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { useRouter } from 'next/navigation'
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
    const router = useRouter()
    const [deckAfterSetup, setDeckAfterSetup] = useState<CardData[]>([])
    const [selectedPrizeGuesses, setSelectedPrizeGuesses] = useState<Record<string, number>>({})
    const [gameState, setGameState] = useState<'idle' | 'setup' | 'playing' | 'result'>('idle')
    const [loading, setLoading] = useState(false)
    const [feedback, setFeedback] = useState('')
    const [accuracyScore, setAccuracyScore] = useState<number | null>(null)
    const [timer, setTimer] = useState(0)
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [activeTouchId, setActiveTouchId] = useState<string | null>(null)
    const [isDrawerOpen, setIsDrawerOpen] = useState(false)

    const handleTouchUpdate = useCallback((e: React.TouchEvent) => {
        const touch = e.touches[0]
        const target = document.elementFromPoint(touch.clientX, touch.clientY)
        const cardEl = target?.closest('[data-touch-id]')
        if (cardEl) {
            setActiveTouchId(cardEl.getAttribute('data-touch-id'))
        } else {
            setActiveTouchId(null)
        }
    }, [])

    const handleTouchEnd = useCallback(() => {
        setActiveTouchId(null)
    }, [])

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

        // Local accuracy calculation (Mathematical)
        let matches = 0
        Object.keys(selectedPrizeGuesses).forEach(name => {
            const guessed = selectedPrizeGuesses[name] || 0
            const actual = actualCounts[name] || 0
            matches += Math.min(guessed, actual)
        })
        const localScore = Math.round((matches / 6) * 100)
        setAccuracyScore(localScore)

        const res = await getPrizeTrainerFeedbackAction(selectedPrizeGuesses, actualCounts)
        if (res.success) {
            setFeedback(res.message || '')
            // Optional: overwrite with AI score if different logic is used, 
            // but usually mathematical one is the baseline.
            if (res.accuracyScore !== undefined) {
                setAccuracyScore(res.accuracyScore)
            }
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


    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        if (mins > 0) return `${mins}分${secs}秒`
        return `${secs}秒`
    }

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
                        <button
                            onClick={() => router.back()}
                            className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors font-bold text-sm bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <path d="m15 18-6-6 6-6" />
                            </svg>
                            戻る
                        </button>
                    ) : (
                        <button
                            onClick={() => setGameState('idle')}
                            className="flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors font-bold text-sm bg-white px-4 py-2 rounded-xl shadow-sm border border-slate-200"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                                <path d="m15 18-6-6 6-6" />
                            </svg>
                            入力画面へ戻る
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
                        TOPへ戻る
                    </Link>
                </div>

                <header className="text-center space-y-2">
                    <h1 className="text-3xl font-black text-slate-900 tracking-tighter">
                        PRIZE TRAINER
                    </h1>
                    <p className="text-slate-500 text-sm">サイドにある6枚を山札から推論せよ。</p>
                </header>

                {gameState === 'idle' && (
                    <div className="max-w-2xl mx-auto py-12 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="text-center space-y-4">
                            <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900">
                                Prize Trainer
                                <span className="block text-lg font-bold text-pink-500 mt-2 uppercase tracking-[0.3em]">サイド落ち推論特訓</span>
                            </h1>
                            <p className="text-slate-500 font-medium">
                                デッキコードを入力して、サイドに落ちた6枚を当てる訓練を開始しましょう。
                            </p>
                        </div>

                        <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-200 space-y-6">
                            <div className="space-y-2">
                                <label className="text-sm font-bold text-slate-700 ml-1">デッキコード</label>
                                <input
                                    type="text"
                                    value={deckCode}
                                    onChange={(e) => setDeckCode(e.target.value)}
                                    placeholder="例: pypMMp-mRE82M-pSypMy"
                                    className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl px-6 py-4 text-lg font-mono focus:outline-none focus:border-slate-900 transition-all"
                                />
                            </div>
                            <button
                                onClick={startTraining}
                                disabled={loading || !deckCode}
                                className="w-full bg-slate-900 text-white py-5 rounded-2xl font-black text-xl hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-xl shadow-slate-200 hover:-translate-y-1 active:translate-y-0"
                            >
                                {loading ? 'デッキを読み込み中...' : '特訓を開始する'}
                            </button>
                        </div>
                    </div>
                )}

                {gameState === 'playing' && (
                    <div className="flex flex-col h-[85vh] md:h-[80vh] md:flex-row gap-6 relative">
                        {/* Deck Cards List - Left Side */}
                        <div className="flex-1 flex flex-col min-w-0 bg-slate-900 rounded-3xl overflow-hidden shadow-2xl relative">
                            {/* Mobile Timer Overlay */}
                            <div className="md:hidden absolute top-4 right-4 z-50 bg-slate-900/80 backdrop-blur px-3 py-1.5 rounded-full border border-slate-700 text-white font-mono text-xs shadow-xl">
                                ⏱️ {formatTime(timer)}
                            </div>

                            <div className="p-4 border-b border-slate-800 flex justify-between items-center shrink-0">
                                <div>
                                    <h2 className="text-lg font-black text-white leading-none">残り山札</h2>
                                    <p className="text-slate-400 text-[10px] font-bold mt-1">
                                        ここから 6 枚がサイドに落ちています。({deckAfterSetup.length}枚)
                                    </p>
                                </div>
                                <div className="hidden md:block bg-slate-800 px-4 py-2 rounded-xl text-white font-mono shadow-inner border border-slate-700">
                                    <span className="text-slate-400 mr-2 text-xs uppercase font-black">Time</span>
                                    {formatTime(timer)}
                                </div>
                            </div>

                            <div
                                className="flex-1 overflow-y-auto flex flex-wrap content-start md:grid md:grid-cols-6 lg:grid-cols-8 gap-y-0 md:gap-1.5 p-[10px] md:p-[5px] custom-scrollbar overflow-x-hidden"
                                onTouchMove={handleTouchUpdate}
                                onTouchStart={handleTouchUpdate}
                                onTouchEnd={handleTouchEnd}
                                onTouchCancel={handleTouchEnd}
                            >
                                {deckAfterSetup.map((card, i) => (
                                    <div
                                        key={`${card.name}-${i}`}
                                        data-touch-id={`deck-${i}`}
                                        className={`w-[20%] -ml-[10%] -mt-3 md:mt-0 md:w-auto md:ml-0 aspect-[2/3] relative rounded overflow-hidden border border-slate-800 shadow-sm opacity-90 hover:opacity-100 hover:-translate-y-2 hover:scale-105 hover:shadow-xl hover:z-10 transition-all duration-200 cursor-pointer select-none
                                            ${activeTouchId === `deck-${i}` ? '-translate-y-12 scale-150 z-50 shadow-2xl opacity-100 brightness-110' : ''}`}
                                        style={{ WebkitTapHighlightColor: 'transparent' }}
                                    >
                                        <Image src={card.imageUrl} alt={card.name} fill className="object-cover" unoptimized />
                                    </div>
                                ))}
                            </div>

                            {/* Starting Hand Display - Clean List */}
                            <div className="pt-4 border-t border-slate-800 p-[5px]">
                                <h3 className="text-[10px] font-black text-slate-500 mb-2 tracking-[0.2em] uppercase flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-pink-500 rounded-full"></span>
                                    Starting Hand (手札)
                                </h3>
                                <div
                                    className="flex flex-wrap pl-[10%] md:pl-0 pb-1"
                                    onTouchMove={handleTouchUpdate}
                                    onTouchStart={handleTouchUpdate}
                                    onTouchEnd={handleTouchEnd}
                                    onTouchCancel={handleTouchEnd}
                                >
                                    {hand.map((card, i) => (
                                        <div
                                            key={`hand-${i}`}
                                            data-touch-id={`hand-${i}`}
                                            className={`w-[20%] -ml-[10%] md:w-20 md:ml-0 aspect-[2/3] relative rounded overflow-hidden border border-slate-700 shadow-lg hover:-translate-y-2 hover:scale-110 hover:shadow-2xl hover:z-10 transition-all duration-200 cursor-pointer select-none
                                                ${activeTouchId === `hand-${i}` ? '-translate-y-18 scale-150 z-50 shadow-2xl brightness-110' : ''}`}
                                            style={{ WebkitTapHighlightColor: 'transparent' }}
                                        >
                                            <Image src={card.imageUrl} alt={card.name} fill className="object-cover" unoptimized />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Mobile Overlay Backdrop */}
                        {isDrawerOpen && (
                            <div
                                className="md:hidden fixed inset-0 bg-slate-900/60 z-[90] animate-in fade-in duration-300"
                                onClick={() => setIsDrawerOpen(false)}
                            />
                        )}

                        {/* Inference Console - Sliding Drawer on Mobile */}
                        <div className={`
                            fixed inset-y-0 right-0 z-[100] w-[90%] md:w-auto md:relative md:inset-auto md:z-0
                            bg-white md:bg-transparent shadow-2xl md:shadow-none
                            transform transition-transform duration-300 ease-in-out
                            ${isDrawerOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
                        `}>
                            {/* Toggle Button for Mobile */}
                            <button
                                onClick={() => setIsDrawerOpen(!isDrawerOpen)}
                                className="md:hidden absolute left-[-40px] top-1/2 -translate-y-1/2 w-10 h-16 bg-white border-2 border-r-0 border-slate-200 rounded-l-xl shadow-[-4px_0_15px_rgba(0,0,0,0.1)] flex items-center justify-center text-slate-400"
                            >
                                <span className={`transform transition-transform duration-300 font-black text-xl ${isDrawerOpen ? 'rotate-180' : ''}`}>
                                    ‹
                                </span>
                            </button>

                            <div className="bg-white border-2 border-slate-200 text-slate-900 md:rounded-2xl p-6 space-y-6 flex flex-col h-full md:h-[85vh] overflow-hidden">
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
                    </div>
                )}

                {gameState === 'result' && (
                    <div className="max-w-4xl mx-auto space-y-6 animate-in fade-in zoom-in duration-500">
                        <div className="bg-white p-6 md:p-8 rounded-3xl shadow-2xl border space-y-6">
                            {/* Compact Header */}
                            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-slate-900 rounded-xl flex items-center justify-center text-xl shadow-lg shadow-slate-200">
                                        🏆
                                    </div>
                                    <h2 className="text-xl font-black text-slate-900">結果発表</h2>
                                </div>
                                <div className="flex gap-6 items-center">
                                    <div className="text-right">
                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Time</div>
                                        <div className="text-xl font-black text-slate-700 leading-none">
                                            {formatTime(timer)}
                                        </div>
                                    </div>
                                    <div className="w-px h-8 bg-slate-100" />
                                    <div className="text-right">
                                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Accuracy</div>
                                        <div className="text-3xl font-black text-slate-900 leading-none">
                                            {accuracyScore !== null ? `${accuracyScore}%` : '---'}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-8">
                                {/* Section 1: Your Guess */}
                                <div className="space-y-4">
                                    <div className="flex justify-between items-center px-2">
                                        <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                                            <span className="w-1.5 h-4 bg-blue-500 rounded-full"></span>
                                            あなたの予想
                                        </h3>
                                        <span className="text-[10px] font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">YOUR GUESS</span>
                                    </div>
                                    <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                                        {(() => {
                                            const guessedCards: any[] = []
                                            Object.entries(selectedPrizeGuesses).forEach(([name, count]) => {
                                                const cardInfo = fullDeck.find(d => d.name === name)
                                                if (cardInfo) {
                                                    for (let i = 0; i < count; i++) {
                                                        guessedCards.push(cardInfo)
                                                    }
                                                }
                                            })

                                            return guessedCards.slice(0, 6).map((card, i) => {
                                                const prevSameCards = guessedCards.slice(0, i).filter(c => c.name === card.name).length
                                                const actualCount = prizes.filter(p => p.name === card.name).length
                                                const isCorrect = actualCount > prevSameCards

                                                return (
                                                    <div key={`guess-${i}`} className={`flex flex-col gap-1.5 p-1 rounded-xl border-2 transition-all ${isCorrect ? 'border-blue-500 bg-blue-50 shadow-sm' : 'border-red-200 bg-red-50 opacity-80'}`}>
                                                        <div className="aspect-[2/3] relative rounded-lg overflow-hidden shadow-sm">
                                                            <Image src={card.imageUrl} alt={card.name} fill className="object-cover" unoptimized />
                                                        </div>
                                                        <div className="flex items-center justify-center py-0.5">
                                                            {isCorrect ? (
                                                                <span className="text-[10px] font-black text-blue-600">CORRECT</span>
                                                            ) : (
                                                                <span className="text-[10px] font-black text-red-600">WRONG</span>
                                                            )}
                                                        </div>
                                                    </div>
                                                )
                                            })
                                        })()}
                                    </div>
                                </div>

                                {/* Section 2: Actual Prizes */}
                                <div className="space-y-4 pt-4 border-t border-slate-100">
                                    <div className="flex justify-between items-center px-2">
                                        <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                                            <span className="w-1.5 h-4 bg-pink-500 rounded-full"></span>
                                            実際のサイド落ち
                                        </h3>
                                        <div className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full border border-slate-200">
                                            正解数: <span className="text-pink-600 font-black">
                                                {prizes.reduce((acc, card, i) => {
                                                    const cardOccurrences = prizes.slice(0, i + 1).filter(p => p.name === card.name).length
                                                    return acc + (selectedPrizeGuesses[card.name] >= cardOccurrences ? 1 : 0)
                                                }, 0)}
                                            </span> / 6
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 md:grid-cols-6 gap-2">
                                        {prizes.map((card, i) => {
                                            const guessedCount = selectedPrizeGuesses[card.name] || 0
                                            const cardOccurrences = prizes.slice(0, i + 1).filter(p => p.name === card.name).length
                                            const isCorrect = guessedCount >= cardOccurrences

                                            return (
                                                <div key={`prize-${i}`} className={`flex flex-col gap-1.5 p-1 rounded-xl border-2 transition-all ${isCorrect ? 'border-green-500 bg-green-50 shadow-sm' : 'border-slate-100 bg-slate-50/50 opacity-60'}`}>
                                                    <div className="aspect-[2/3] relative rounded-lg overflow-hidden shadow-sm">
                                                        <Image src={card.imageUrl} alt={card.name} fill className="object-cover" unoptimized />
                                                    </div>
                                                    <div className="flex items-center justify-center py-0.5">
                                                        {isCorrect ? (
                                                            <span className="text-[10px] font-black text-green-600">MATCH!</span>
                                                        ) : (
                                                            <span className="text-[10px] font-black text-slate-400">MISS</span>
                                                        )}
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
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
