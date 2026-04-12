'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'

interface CoinTossOverlayProps {
    result: 'heads' | 'tails' | null
    onComplete: () => void
}

export default function CoinTossOverlay({ result, onComplete }: CoinTossOverlayProps) {
    const [isAnimating, setIsAnimating] = useState(true)

    useEffect(() => {
        if (result) {
            const timer = setTimeout(() => {
                setIsAnimating(false)
                setTimeout(onComplete, 2000) // Keep the result for 2 seconds then close
            }, 1500) // Animation duration
            return () => clearTimeout(timer)
        }
    }, [result, onComplete])

    if (!result) return null

    // Determine total rotation based on result
    // Heads (0), Tails (180). We add many rotations for the spin effect.
    const rotations = result === 'heads' ? 360 * 5 : 360 * 5 + 180

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-md pointer-events-auto"
            >
                <div className="relative perspective-1000">
                    {/* Coin Shadow */}
                    <motion.div
                        animate={{ 
                            scale: isAnimating ? [1, 1.2, 1] : 1,
                            opacity: isAnimating ? [0.2, 0.4, 0.2] : 0.3
                        }}
                        transition={{ duration: 1.5, ease: "easeInOut" }}
                        className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-32 h-8 bg-black/40 rounded-[100%] blur-xl"
                    />

                    {/* Main Coin Container */}
                    <motion.div
                        initial={{ 
                            y: 200, 
                            scale: 0.5, 
                            rotateX: 0, 
                            rotateY: 0 
                        }}
                        animate={{ 
                            y: isAnimating ? -150 : 0, 
                            scale: isAnimating ? 1.5 : 1.2,
                            rotateX: rotations,
                            rotateY: isAnimating ? 45 : 0
                        }}
                        transition={{ 
                            y: { duration: 1.5, ease: [0.23, 1, 0.32, 1] },
                            scale: { duration: 1.5, ease: [0.23, 1, 0.32, 1] },
                            rotateX: { duration: 1.5, ease: [0.45, 0, 0.55, 1] },
                            rotateY: { duration: 1.5, ease: "linear" }
                        }}
                        className="w-48 h-48 relative preserve-3d"
                    >
                        {/* Front Face (Heads - Gold Lucario) */}
                        <div className="absolute inset-0 w-full h-full rounded-full backface-hidden border-4 border-[#FFD700]/50 shadow-[inset_0_0_20px_rgba(255,215,0,0.5)] flex items-center justify-center"
                             style={{ 
                                 background: 'radial-gradient(circle at 30% 30%, #FFD700 0%, #B8860B 100%)',
                                 boxShadow: '0 0 30px rgba(255, 215, 0, 0.3), inset 0 0 20px rgba(0,0,0,0.2)'
                             }}>
                            <div className="w-4/5 h-4/5 relative flex flex-col items-center justify-center gap-1">
                                <div className="absolute inset-0 bg-white/20 blur-xl rounded-full" />
                                <Image
                                    src="/Lucario.png"
                                    alt="Heads"
                                    width={80}
                                    height={80}
                                    className="relative z-10 drop-shadow-lg scale-110"
                                />
                                <span className="text-white text-xl font-black italic drop-shadow-md z-10 uppercase tracking-widest mt-1">
                                    Heads
                                </span>
                            </div>
                        </div>

                        {/* Back Face (Tails - Silver PokeBall-like) */}
                        <div className="absolute inset-0 w-full h-full rounded-full backface-hidden border-4 border-[#C0C0C0]/50 shadow-[inset_0_0_20px_rgba(192,192,192,0.5)] flex items-center justify-center rotate-x-180"
                             style={{ 
                                 background: 'radial-gradient(circle at 70% 70%, #E0E0E0 0%, #708090 100%)',
                                 boxShadow: '0 0 30px rgba(192, 192, 192, 0.3), inset 0 0 20px rgba(0,0,0,0.2)'
                             }}>
                             <div className="w-4/5 h-4/5 relative flex flex-col items-center justify-center gap-1">
                                <div className="absolute inset-0 bg-blue-400/10 blur-xl rounded-full" />
                                {/* PokeBall Shape with CSS */}
                                <div className="w-20 h-20 rounded-full border-4 border-slate-700 overflow-hidden relative z-10 bg-white">
                                    <div className="absolute top-0 w-full h-1/2 bg-red-600 border-b-4 border-slate-700" />
                                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full border-4 border-slate-700 bg-white flex items-center justify-center">
                                        <div className="w-3 h-3 rounded-full bg-slate-200" />
                                    </div>
                                </div>
                                <span className="text-slate-800 text-xl font-black italic drop-shadow-md z-10 uppercase tracking-widest mt-1">
                                    Tails
                                </span>
                            </div>
                        </div>

                        {/* Coin Edge (Thickness) */}
                        <div className="absolute inset-0 rounded-full border-[10px] border-[#8B4513]/30 blur-[2px] -z-10" />
                    </motion.div>

                    {/* Result Text Overlay */}
                    {!isAnimating && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="absolute -bottom-24 left-1/2 -translate-x-1/2 text-center"
                        >
                            <h2 className={`text-4xl font-black uppercase tracking-widest drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]
                                ${result === 'heads' ? 'text-[#FFD700]' : 'text-gray-300'}`}
                            >
                                {result === 'heads' ? 'オモテ' : 'ウラ'}
                            </h2>
                            <p className="text-white/40 text-xs mt-2 uppercase font-bold tracking-widest">
                                {result === 'heads' ? 'LUCARIO SIDE' : 'POKEBALL SIDE'}
                            </p>
                        </motion.div>
                    )}
                </div>

                {/* Particle Burst Effect on Land */}
                {!isAnimating && (
                    <motion.div
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: [1, 2], opacity: [0.6, 0] }}
                        className={`absolute w-64 h-64 rounded-full 
                            ${result === 'heads' ? 'bg-[#FFD700]/20' : 'bg-white/20'}`}
                    />
                )}
            </motion.div>
        </AnimatePresence>
    )
}
