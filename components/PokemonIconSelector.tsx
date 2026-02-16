'use client'

import { useState, useMemo } from 'react'
import { POKEMON_ICONS } from '@/lib/constants'
import Image from 'next/image'

interface PokemonIconSelectorProps {
    selectedIcons: (string | null)[]
    onSelect: (icons: (string | null)[]) => void
    maxIcons?: number
    label?: string
}

export default function PokemonIconSelector({
    selectedIcons,
    onSelect,
    maxIcons = 2,
    label = 'アイコンを選択'
}: PokemonIconSelectorProps) {
    const [search, setSearch] = useState('')
    const [isOpen, setIsOpen] = useState(false)

    const filteredIcons = useMemo(() => {
        // Normalize search: NFC + Hiragana to Katakana
        const normalizedSearch = search
            .normalize('NFC')
            .replace(/[\u3041-\u3096]/g, m => String.fromCharCode(m.charCodeAt(0) + 0x60))
            .toLowerCase()

        if (!normalizedSearch) return POKEMON_ICONS

        return POKEMON_ICONS.filter(name => {
            const normalizedName = name
                .normalize('NFC')
                .replace(/[\u3041-\u3096]/g, m => String.fromCharCode(m.charCodeAt(0) + 0x60))
                .toLowerCase()
            return normalizedName.includes(normalizedSearch)
        })
    }, [search])

    const handleToggleIcon = (name: string) => {
        const currentIcons = selectedIcons.filter(Boolean) as string[]
        let newIcons: (string | null)[]

        if (currentIcons.includes(name)) {
            // Remove
            newIcons = currentIcons.filter(i => i !== name)
        } else {
            // Add if not at max
            if (currentIcons.length < maxIcons) {
                newIcons = [...currentIcons, name]
            } else {
                // Replace last one? Or do nothing? Let's just do nothing or replace.
                // Replace the oldest one for better UX
                newIcons = [...currentIcons.slice(1), name]
            }
        }

        // Pad with nulls
        while (newIcons.length < maxIcons) {
            newIcons.push(null)
        }

        onSelect(newIcons)
    }

    const removeIcon = (index: number) => {
        const newIcons = [...selectedIcons]
        newIcons[index] = null
        // Shift remaining icons to the left
        const filtered = newIcons.filter(Boolean)
        while (filtered.length < maxIcons) {
            filtered.push(null)
        }
        onSelect(filtered)
    }

    return (
        <div className="space-y-2">
            <label className="block text-sm font-bold text-gray-700">{label}</label>

            <div className="flex items-center gap-3">
                <div className="flex gap-2 p-2 bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 min-h-[56px] min-w-[120px]">
                    {selectedIcons.map((icon, idx) => (
                        <div key={idx} className="relative group">
                            {icon ? (
                                <div className="relative w-10 h-10 bg-white rounded-lg border border-gray-200 flex items-center justify-center p-1">
                                    <Image
                                        src={`/pokemon-icons/${icon}.png`}
                                        alt={icon}
                                        width={32}
                                        height={32}
                                        className="object-contain"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => removeIcon(idx)}
                                        className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5 shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
                                            <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
                                        </svg>
                                    </button>
                                </div>
                            ) : (
                                <div className="w-10 h-10 border border-gray-200 border-dashed rounded-lg bg-gray-50/50" />
                            )}
                        </div>
                    ))}
                </div>

                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className="px-4 py-2 bg-white border-2 border-gray-200 rounded-xl text-sm font-bold text-gray-600 hover:border-purple-300 hover:text-purple-600 transition shadow-sm"
                >
                    {isOpen ? '閉じる' : '選択する'}
                </button>
            </div>

            {isOpen && (
                <div className="bg-white border-2 border-gray-100 rounded-2xl p-4 shadow-xl space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="ポケモン名で検索..."
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-400"
                    />

                    <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2 max-h-60 overflow-y-auto p-1 custom-scrollbar">
                        {filteredIcons.map(name => {
                            const isSelected = selectedIcons.includes(name)
                            return (
                                <button
                                    key={name}
                                    type="button"
                                    onClick={() => handleToggleIcon(name)}
                                    title={name}
                                    className={`relative p-1.5 rounded-lg border-2 transition-all hover:scale-110 ${isSelected
                                        ? 'border-purple-500 bg-purple-50'
                                        : 'border-transparent bg-gray-50 hover:bg-white hover:border-gray-200'
                                        }`}
                                >
                                    <Image
                                        src={`/pokemon-icons/${name}.png`}
                                        alt={name}
                                        width={32}
                                        height={32}
                                        className="object-contain"
                                    />
                                    {isSelected && (
                                        <div className="absolute -top-1 -right-1 bg-purple-500 text-white rounded-full p-0.5">
                                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-2.5 h-2.5">
                                                <path fillRule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    )}
                                </button>
                            )
                        })}
                    </div>
                    {filteredIcons.length === 0 && (
                        <p className="text-center text-sm text-gray-400 py-4">見つかりませんでした</p>
                    )}
                </div>
            )}

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 6px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #E5E7EB;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #D1D5DB;
                }
            `}</style>
        </div>
    )
}
