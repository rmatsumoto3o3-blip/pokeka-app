'use client'

import { FC } from 'react'
import AddMatchForm from './AddMatchForm'

interface MatchRecordModalProps {
    isOpen: boolean
    onClose: () => void
    deckId: string
    userId: string
    onUpdate: () => void
}

const MatchRecordModal: FC<MatchRecordModalProps> = ({ isOpen, onClose, deckId, userId, onUpdate }) => {
    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-[110] flex items-end sm:items-center justify-center p-0 sm:p-4">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal Body */}
            <div className="relative w-full max-w-2xl bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl overflow-hidden max-h-[92vh] flex flex-col">
                <div className="p-1 px-6 pt-6 flex justify-between items-center bg-gray-50 border-b border-gray-100">
                    <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                        <span className="text-pink-500">📝</span> 試合結果の記録
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2 text-gray-400 hover:text-gray-900 transition-colors"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    <AddMatchForm
                        deckId={deckId}
                        userId={userId}
                        onSuccess={() => {
                            onUpdate()
                            onClose()
                        }}
                    />
                </div>
            </div>

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

export default MatchRecordModal
