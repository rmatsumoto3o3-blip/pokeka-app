'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Image from 'next/image'
import { fetchDeckData, buildDeck, shuffle, type Card } from '@/lib/deckParser'
import DeckPractice from '../../components/DeckPractice'

function PracticeContent() {
    const searchParams = useSearchParams()
    const [deckCode1, setDeckCode1] = useState(searchParams.get('code1') || '')
    const [deckCode2, setDeckCode2] = useState(searchParams.get('code2') || '')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [deck1, setDeck1] = useState<Card[]>([])
    const [deck2, setDeck2] = useState<Card[]>([])
    const [stadium1, setStadium1] = useState<Card | null>(null)
    const [stadium2, setStadium2] = useState<Card | null>(null)
    const [coinResult, setCoinResult] = useState<'heads' | 'tails' | null>(null)

    // Auto-load if deck codes are in URL
    useEffect(() => {
        const code1 = searchParams.get('code1')
        const code2 = searchParams.get('code2')
        if (code1 && !deck1.length) {
            setDeckCode1(code1)
            loadDecks(code1, code2 || '')
        }
    }, [searchParams])

    const loadDecks = async (code1?: string, code2?: string) => {
        const targetCode1 = code1 || deckCode1
        const targetCode2 = code2 || deckCode2

        if (!targetCode1 && !targetCode2) return

        setLoading(true)
        setError(null)

        try {
            if (targetCode1) {
                const cards1 = await fetchDeckData(targetCode1)
                const fullDeck1 = buildDeck(cards1)
                if (fullDeck1.length !== 60) {
                    throw new Error(`デッキ1は60枚である必要があります（現在: ${fullDeck1.length}枚）`)
                }
                setDeck1(shuffle(fullDeck1))
            }

            if (targetCode2) {
                const cards2 = await fetchDeckData(targetCode2)
                const fullDeck2 = buildDeck(cards2)
                if (fullDeck2.length !== 60) {
                    throw new Error(`デッキ2は60枚である必要があります（現在: ${fullDeck2.length}枚）`)
                }
                setDeck2(shuffle(fullDeck2))
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'デッキの読み込みに失敗しました')
            console.error('Failed to load deck:', err)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-1 sm:p-4">
            <div className="max-w-[1800px] mx-auto">
                {/* Header */}
                <div className="mb-4">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
                        🎮 1人回し練習
                    </h1>
                    <p className="text-sm text-gray-600">
                        デッキコードを入力して、対戦練習を始めましょう
                    </p>
                </div>

                {/* Deck Code Input */}
                {(!deck1.length || !deck2.length) && (
                    <div className="bg-white rounded-xl shadow-lg p-4 mb-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Deck 1 Input */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    デッキ1（自分）
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={deckCode1}
                                        onChange={(e) => setDeckCode1(e.target.value)}
                                        placeholder="デッキコードを入力"
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 text-sm"
                                        disabled={loading}
                                    />
                                </div>
                            </div>

                            {/* Deck 2 Input */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    デッキ2（相手）
                                </label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={deckCode2}
                                        onChange={(e) => setDeckCode2(e.target.value)}
                                        placeholder="デッキコードを入力"
                                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-gray-900 text-sm"
                                        disabled={loading}
                                    />
                                </div>
                            </div>
                        </div>

                        <button
                            onClick={() => loadDecks()}
                            disabled={loading || (!deckCode1 && !deckCode2)}
                            className="mt-4 w-full px-6 py-3 bg-purple-500 text-white rounded-lg font-semibold hover:bg-purple-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
                        >
                            {loading ? '読み込み中...' : 'デッキを読み込む'}
                        </button>

                        {error && (
                            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                                {error}
                            </div>
                        )}
                    </div>
                )}

                {/* Practice Area - 3 Column Layout */}
                {(deck1.length > 0 || deck2.length > 0) && (
                    <div className="w-full overflow-x-auto pb-4">
                        <div className="grid grid-cols-[calc(100%-2rem)_auto_calc(100%-2rem)] md:grid-cols-[calc(50%-1.5rem)_auto_calc(50%-1.5rem)] gap-4 w-full">
                            {/* Player 1 */}
                            {deck1.length > 0 && (
                                <DeckPractice
                                    deck={deck1}
                                    onReset={() => setDeck1([])}
                                    playerName="自分"
                                    compact={true}
                                    stadium={stadium1}
                                    onStadiumChange={(card: Card | null) => {
                                        setStadium1(card)
                                        setStadium2(null)
                                    }}
                                />
                            )}

                            {/* Center Column - Stadium & Tools */}
                            <div className="w-24 sm:w-28 md:w-32 flex-shrink-0 flex flex-col items-center">
                                <div className="bg-white rounded-lg shadow-lg p-2 sticky top-4 w-full flex flex-col items-center">
                                    <h2 className="text-[10px] sm:text-xs font-bold text-gray-900 mb-1 text-center w-full">スタジアム</h2>
                                    {(stadium1 || stadium2) ? (
                                        <div className="relative group flex justify-center">
                                            <Image
                                                src={(stadium1 || stadium2)!.imageUrl}
                                                alt={(stadium1 || stadium2)!.name}
                                                width={80}
                                                height={112}
                                                className="rounded shadow-lg"
                                            />
                                            <button
                                                onClick={() => {
                                                    setStadium1(null)
                                                    setStadium2(null)
                                                }}
                                                className="absolute top-0 -right-2 bg-red-500 text-white px-1 py-0.5 rounded text-[10px] opacity-0 group-hover:opacity-100 transition"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    ) : (
                                        <div
                                            className="rounded border-2 border-dashed border-gray-300 flex items-center justify-center text-gray-400 text-[10px] text-center p-2 mx-auto"
                                            style={{ width: '80px', height: '112px' }}
                                            onDragOver={(e) => e.preventDefault()}
                                            onDrop={(e) => {
                                                e.preventDefault()
                                                const source = e.dataTransfer.getData('source')
                                                const cardIndex = parseInt(e.dataTransfer.getData('cardIndex'))
                                                const playerName = e.dataTransfer.getData('playerName')

                                                if (source === 'hand' && !isNaN(cardIndex) && playerName) {
                                                    // Dispatch custom event to let DeckPractice handle the logic
                                                    const event = new CustomEvent('stadium-dropped', {
                                                        detail: { playerName, cardIndex }
                                                    })
                                                    window.dispatchEvent(event)
                                                }
                                            }}
                                        >
                                            なし
                                        </div>
                                    )}

                                    {/* Future: Damage Counters & Coins */}
                                    <div className="mt-4 flex flex-col gap-4">
                                        {/* Coin Flip */}
                                        <div className="bg-gray-50 rounded p-2 text-center">
                                            <h3 className="text-[10px] font-bold text-gray-500 mb-1">コイン</h3>
                                            <div className="flex justify-center mb-1">
                                                <div className={`w-12 h-12 rounded-full border-4 shadow-inner flex items-center justify-center transition-all duration-500 ${coinResult === 'heads' ? 'bg-red-500 border-gray-800' : coinResult === 'tails' ? 'bg-white border-gray-800' : 'bg-gray-200 border-gray-400'}`}>
                                                    <div className={`w-4 h-4 rounded-full border-2 ${coinResult === 'heads' ? 'bg-white border-gray-800' : coinResult === 'tails' ? 'bg-gray-800 border-gray-400' : 'bg-gray-400 border-gray-300'}`}></div>
                                                </div>
                                            </div>
                                            <div className="text-[10px] font-bold text-black h-4 mb-1">
                                                {coinResult === 'heads' ? 'オモテ' : coinResult === 'tails' ? 'ウラ' : '-'}
                                            </div>
                                            <button
                                                onClick={() => {
                                                    const result = Math.random() < 0.5 ? 'heads' : 'tails'
                                                    setCoinResult(result)
                                                }}
                                                className="w-full bg-blue-500 text-white text-[10px] py-1 rounded hover:bg-blue-600 transition"
                                            >
                                                投げる
                                            </button>
                                        </div>

                                        {/* Damage Counters */}
                                        <div className="bg-gray-50 rounded p-2 text-center">
                                            <h3 className="text-[10px] font-bold text-gray-500 mb-2">ダメカン</h3>
                                            <div className="flex flex-col items-center gap-2">
                                                {[100, 50, 10].map((value) => (
                                                    <div
                                                        key={value}
                                                        draggable
                                                        onDragStart={(e) => {
                                                            e.dataTransfer.setData('source', 'damage')
                                                            e.dataTransfer.setData('value', value.toString())
                                                        }}
                                                        className={`
                                                        rounded-full shadow-md flex items-center justify-center font-bold text-black border-2 border-white cursor-move hover:scale-110 transition
                                                        ${value === 100 ? 'w-10 h-10 bg-red-400 text-xs' : ''}
                                                        ${value === 50 ? 'w-8 h-8 bg-orange-300 text-[10px]' : ''}
                                                        ${value === 10 ? 'w-6 h-6 bg-yellow-300 text-[9px]' : ''}
                                                    `}
                                                    >
                                                        {value}
                                                    </div>
                                                ))}
                                                <p className="text-[8px] text-gray-400 mt-1">ドラッグして配置</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            {/* Player 2 */}
                            {deck2.length > 0 && (
                                <DeckPractice
                                    deck={deck2}
                                    onReset={() => setDeck2([])}
                                    playerName="相手"
                                    compact={true}
                                    stadium={stadium2}
                                    onStadiumChange={(card: Card | null) => {
                                        setStadium2(card)
                                        setStadium1(null)
                                    }}
                                />
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default function PracticePage() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center">読み込み中...</div>}>
            <PracticeContent />
        </Suspense>
    )
}
