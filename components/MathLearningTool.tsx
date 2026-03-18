'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'

type Difficulty = 'easy' | 'normal' | 'hard' | 'extra'

interface Question {
    id: string
    type: string
    text: string
    answer: number
    choices: number[]
}

export default function MathLearningTool() {
    const [difficulty, setDifficulty] = useState<Difficulty | null>(null)
    const [score, setScore] = useState(0)
    const [question, setQuestion] = useState<Question | null>(null)
    const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null)
    const [lives, setLives] = useState(5)
    const [isGameOver, setIsGameOver] = useState(false)

    // 子供向けの明るいカラーパレット
    const colors = [
        'bg-yellow-400', 'bg-blue-400', 'bg-green-400', 'bg-pink-400'
    ]

    const generateQuestion = (currentDiff: Difficulty) => {
        let v1 = 0, v2 = 0, ans = 0, text = ""
        const type = Math.random() > 0.5 ? 'plus' : 'minus'

        if (currentDiff === 'easy') {
            // かんたん：繰り上がり・繰り下がりなし（10単位）
            if (type === 'plus') {
                // 10の位で繰り上がらない：t1+t2 < 10
                const t1 = Math.floor(Math.random() * 9 + 1) // 1-9
                const t2 = Math.floor(Math.random() * (10 - t1)) // 0〜(9-t1)
                const h1 = Math.floor(Math.random() * 3) // 0-2 (0, 100, 200)
                const h2 = Math.floor(Math.random() * (3 - h1)) // 100の位も繰り上がらないように
                v1 = h1 * 100 + t1 * 10
                v2 = h2 * 100 + t2 * 10
                ans = v1 + v2
                text = `${v1} ダメージに、\n＋${v2} したら 合計は 何ダメージ？`
            } else {
                // 10の位で繰り下がらない：t1 >= t2
                const t1 = Math.floor(Math.random() * 9 + 1) // 1-9
                const t2 = Math.floor(Math.random() * (t1 + 1)) // 0〜t1
                const h1 = Math.floor(Math.random() * 3 + 1) // 1-3 (100, 200, 300)
                const h2 = Math.floor(Math.random() * h1) // 100の位も繰り下がらないように
                v1 = h1 * 100 + t1 * 10
                v2 = h2 * 100 + t2 * 10
                ans = v1 - v2
                text = `HP ${v1} の ポケモンが、\n${v2} ダメージ うけたら、\nのこりの HPは いくつ？`
            }
        } else if (currentDiff === 'normal') {
            // ふつう：繰り上がり・繰り下がりあり
            if (type === 'plus') {
                // 繰り上がりが発生するまでループ（差別化のため）
                // 10の位の和が10以上になるもの
                do {
                    v1 = Math.floor(Math.random() * 28 + 1) * 10 // 10~280
                    v2 = Math.floor(Math.random() * 8 + 1) * 10  // 10~80
                } while (((v1 % 100) + (v2 % 100)) < 100); 
                
                ans = v1 + v2
                text = `${v1} ダメージに、\n＋${v2} したら 合計は 何ダメージ？`
            } else {
                // 繰り下がりが発生するまでループ
                // 10の位が v1 < v2 になるもの
                do {
                    v1 = Math.floor(Math.random() * 41 + 10) * 10 // 100~500
                    v2 = Math.floor(Math.random() * 15 + 1) * 10  // 10~150
                } while (v2 > v1 || (v1 % 100) >= (v2 % 100));
                
                ans = v1 - v2
                text = `HP ${v1} の ポケモンが、\n${v2} ダメージ うけたら、\nのこりの HPは いくつ？`
            }
        } else if (currentDiff === 'hard') {
            // むずかしい：かけ算
            const baseDamage = [10, 20, 30, 40, 50][Math.floor(Math.random() * 5)]
            const multiplier = Math.floor(Math.random() * 8 + 2) // 2-9
            ans = baseDamage * multiplier
            text = `エネルギー 1まいに つき ${baseDamage} ダメージ。\nエネルギーが ${multiplier}まい ついていたら\n何ダメージ？`
        } else {
            // ちょーむずい：複合計算（かけ算・足し算・引き算）
            const rand = Math.random()
            if (rand < 0.25) {
                // 弱点 (×2)
                v1 = Math.floor(Math.random() * 15 + 1) * 10 // 10-150
                ans = v1 * 2
                text = `${v1} ダメージの ワザで、\nじゃくてん(×2)を ついたら、\n何ダメージ？`
            } else if (rand < 0.5) {
                // 抵抗力 (-30)
                v1 = Math.floor(Math.random() * 20 + 5) * 10 // 50-250
                ans = v1 - 30
                text = `${v1} ダメージの ワザ。\nあいてに ていこうりょく(-30)が あったら、\n何ダメージ？`
            } else if (rand < 0.75) {
                // 複合A：ベース + (枚数 × 追加) - 抵抗力
                const base = [30, 50, 80, 100][Math.floor(Math.random() * 4)]
                const add = [10, 20, 30][Math.floor(Math.random() * 3)]
                const count = Math.floor(Math.random() * 4 + 1) // 1-4
                ans = base + (add * count) - 30
                text = `${base} ダメージの ワザ。\nエネルギー 1まいに つき ＋${add} ダメージ。\nエネルギーが ${count}まい ついていて、\nていこうりょく(-30)の あいてには 何ダメージ？`
            } else {
                // 複合B：(ベース + 枚数 × 追加) × 2 (弱点)
                const base = [20, 40, 60][Math.floor(Math.random() * 3)]
                const add = [10, 20][Math.floor(Math.random() * 2)]
                const count = Math.floor(Math.random() * 3 + 1) // 1-3
                ans = (base + (add * count)) * 2
                text = `${base} ダメージの ワザ。\nエネルギー 1まいに つき ＋${add} ダメージ。\nエネルギーが ${count}まい ついていて、\nじゃくてん(×2)の あいてには 何ダメージ？`
            }
        }

        const choices = [ans]
        while (choices.length < 4) {
            const diff = (Math.floor(Math.random() * 11) - 5) * 10
            const wrong = Math.max(10, ans + (diff === 0 ? 20 : diff))
            if (!choices.includes(wrong)) choices.push(wrong)
        }

        setQuestion({
            id: Date.now().toString(),
            type: currentDiff,
            text,
            answer: ans,
            choices: choices.sort(() => Math.random() - 0.5)
        })
        setFeedback(null)
    }

    const selectDifficulty = (diff: Difficulty) => {
        setDifficulty(diff)
        setScore(0)
        setLives(5)
        setIsGameOver(false)
        generateQuestion(diff)
    }

    const handleAnswer = (choice: number) => {
        if (isGameOver || !difficulty) return

        if (choice === question?.answer) {
            setFeedback('correct')
            setScore(prev => prev + 10)
            setTimeout(() => {
                setFeedback(null)
                generateQuestion(difficulty)
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

    const resetToHome = () => {
        setDifficulty(null)
        setScore(0)
        setLives(5)
        setIsGameOver(false)
    }

    if (!difficulty) {
        return (
            <div className="max-w-2xl mx-auto p-8 bg-white rounded-3xl shadow-xl border-4 border-yellow-200">
                <h2 className="text-3xl font-black text-center text-gray-800 mb-8">むずかしさを えらんでね！</h2>
                <div className="grid grid-cols-1 gap-4">
                    <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => selectDifficulty('easy')} 
                        className="bg-green-400 hover:bg-green-500 text-white text-xl font-black py-6 rounded-2xl shadow-lg transition-all"
                    >
                        かんたん
                    </motion.button>
                    <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => selectDifficulty('normal')} 
                        className="bg-blue-400 hover:bg-blue-500 text-white text-xl font-black py-6 rounded-2xl shadow-lg transition-all"
                    >
                        ふつう
                    </motion.button>
                    <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => selectDifficulty('hard')} 
                        className="bg-orange-400 hover:bg-orange-500 text-white text-xl font-black py-6 rounded-2xl shadow-lg transition-all"
                    >
                        むずかしい
                    </motion.button>
                    <motion.button 
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => selectDifficulty('extra')} 
                        className="bg-purple-500 hover:bg-purple-600 text-white text-xl font-black py-6 rounded-2xl shadow-lg transition-all"
                    >
                        ちょーむずい
                    </motion.button>
                </div>
            </div>
        )
    }

    if (!question) return null

    return (
        <div className="max-w-2xl mx-auto p-6 bg-white rounded-3xl shadow-xl border-4 border-yellow-200 overflow-hidden">
            <div className="flex justify-between items-center mb-8">
                <div className="flex flex-col gap-1">
                    <div className="bg-yellow-100 px-4 py-1 rounded-full font-black text-yellow-700 text-sm">
                        スコア: {score}
                    </div>
                    <button onClick={resetToHome} className="text-xs font-bold text-gray-400 hover:text-gray-600 text-left px-2">
                        ← レベルを かえる
                    </button>
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
                                onClick={() => selectDifficulty(difficulty)}
                                className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-2xl font-black py-4 rounded-2xl shadow-lg"
                            >
                                もういちど あそぶ
                            </motion.button>
                            <button onClick={resetToHome} className="text-gray-500 font-bold hover:underline">
                                レベルを かえる
                            </button>
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
