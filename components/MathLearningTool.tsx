'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'

interface Question {
    id: string
    type: 'plus' | 'minus' | 'multi'
    text: string
    val1: number
    val2: number
    answer: number
    choices: number[]
    image?: string
}

export default function MathLearningTool() {
    const [score, setScore] = useState(0)
    const [question, setQuestion] = useState<Question | null>(null)
    const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
    const [lives, setLives] = useState(5)
    const [isGameOver, setIsGameOver] = useState(false)

    // 子供向けの明るいカラーパレット
    const colors = [
        'bg-yellow-400', 'bg-blue-400', 'bg-green-400', 'bg-pink-400'
    ]

    const generateQuestion = () => {
        const types: ('plus' | 'minus')[] = ['plus', 'minus']
        const type = types[Math.floor(Math.random() * types.length)]
        
        let v1 = 0, v2 = 0, ans = 0, text = ""
        
        if (type === 'plus') {
            v1 = Math.floor(Math.random() * 50 + 1) * 10 // 最大500
            v2 = Math.floor(Math.random() * 8 + 1) * 10 // 最大80
            ans = v1 + v2
            text = `${v1} ダメージに、\n＋${v2} したら 合計は 何ダメージ？`
        } else {
            v1 = Math.floor(Math.random() * 41 + 10) * 10 // 100〜500
            // v2 が v1 を超えないように（答えがマイナスにならないように）ガード
            do {
                v2 = Math.floor(Math.random() * 50 + 1) * 10
            } while (v2 > v1)
            
            ans = v1 - v2
            text = `HP ${v1} の ポケモンが、\n${v2} ダメージ うけたら、\nのこりの HPは いくつ？`
        }

        const choices = [ans]
        while (choices.length < 4) {
            // 乱数の範囲を広げ（-50〜+50）、かつ結果が10未満にならないように調整
            const diff = (Math.floor(Math.random() * 11) - 5) * 10
            const wrong = Math.max(10, ans + (diff === 0 ? 10 : diff))
            if (!choices.includes(wrong)) choices.push(wrong)
        }

        setQuestion({
            id: Date.now().toString(),
            type,
            text,
            val1: v1,
            val2: v2,
            answer: ans,
            choices: choices.sort(() => Math.random() - 0.5)
        })
        setFeedback(null)
    }

    useEffect(() => {
        generateQuestion()
    }, [])

    const handleAnswer = (choice: number) => {
        if (isGameOver) return

        if (choice === question?.answer) {
            setFeedback('correct')
            setScore(prev => prev + 10)
            
            setTimeout(() => {
                setFeedback(null)
                generateQuestion()
            }, 800)
        } else {
            setFeedback('wrong')
            const nextLives = lives - 1
            setLives(nextLives)
            setTimeout(() => {
                setFeedback(null)
                if (nextLives <= 0) {
                    setIsGameOver(true)
                }
            }, 800)
        }
    }

    const resetGame = () => {
        setScore(0)
        setLives(5)
        setIsGameOver(false)
        generateQuestion()
    }

    if (!question) return null

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-3xl shadow-xl border-4 border-yellow-200 overflow-hidden">
            <div className="flex justify-between items-center mb-8">
                <div className="bg-yellow-100 px-4 py-2 rounded-full font-black text-yellow-700">
                    スコア: {score}
                </div>
                <div className="flex gap-1">
                    {[...Array(5)].map((_, i) => (
                        <span key={i} className={`text-2xl ${i < lives ? 'opacity-100' : 'opacity-20 grayscale'}`}>
                            ❤️
                        </span>
                    ))}
                </div>
            </div>

            <AnimatePresence mode="wait">
                {isGameOver ? (
                    <motion.div
                        key="result"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="text-center py-10"
                    >
                        <div className="text-6xl mb-6">📢</div>
                        <h2 className="text-4xl font-black text-blue-600 mb-4">しゅうりょう！</h2>
                        <p className="text-xl font-bold text-gray-600 mb-8">せいかいした かず: {score / 10}もん</p>
                        
                        <div className="flex flex-col gap-4">
                            <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={resetGame}
                                className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-2xl font-black py-4 rounded-2xl shadow-lg"
                            >
                                もういちど あそぶ
                            </motion.button>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        key={question.id}
                        initial={{ x: 300, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: -300, opacity: 0 }}
                        className="text-center"
                    >
                        <div className="relative w-48 h-48 mx-auto mb-6">
                            <motion.div
                                animate={{ y: [0, -10, 0] }}
                                transition={{ repeat: Infinity, duration: 2 }}
                            >
                                <Image src="/king.png" alt="Pokemon" width={192} height={192} className="drop-shadow-2xl" />
                            </motion.div>
                        </div>

                        <h2 className="text-2xl font-black text-gray-800 mb-8 leading-relaxed whitespace-pre-wrap">
                            {question.text}
                        </h2>

                        <div className="grid grid-cols-2 gap-4">
                            {question.choices.map((choice, idx) => (
                                <motion.button
                                    key={idx}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => handleAnswer(choice)}
                                    className={`${colors[idx]} text-white text-3xl font-black py-6 rounded-2xl shadow-lg border-b-8 border-black/20 transition-all`}
                                >
                                    {choice}
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {feedback && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 flex items-center justify-center pointer-events-none z-50"
                    >
                        {feedback === 'correct' ? (
                            <div className="bg-green-500 text-white text-6xl font-black px-12 py-6 rounded-full shadow-2xl rotate-12">
                                Good!
                            </div>
                        ) : (
                            <div className="bg-red-500 text-white text-6xl font-black px-12 py-6 rounded-full shadow-2xl -rotate-12">
                                おしい！
                            </div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}
