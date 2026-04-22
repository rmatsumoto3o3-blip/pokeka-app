'use client'

import { createPortal } from 'react-dom'
import Image from 'next/image'
import { DragOverlay } from '@dnd-kit/core'
import { type Card } from '@/lib/deckParser'
import { type CardStack, isEnergy, isPokemon, isSupporter, isTrainer, isRuleBox, getTopCard } from '@/lib/cardStack'
import {
    type DeckMenuState,
    type UltraBallState,
    type PoffinState,
    type ToukoState,
    type FightGongState,
    type LambdaState,
    type NightStretcherState,
    type GenesectState,
    type ArchaludonState,
    type TatsugiriState,
    type OgerponState,
    type ZoroarkState,
    type MeowthEXState,
    type IronLeavesEXState,
    type NPointUpState,
    type CyanoState,
    type OgerponWellspringState,
    type BugCatchingSetState,
    type EnergySwitchState,
    type EnergyRetrievalState,
    type NoctowlState,
    type MegaLucarioEXAttackState,
    type RagingBoltState,
    type DawnState,
    type FanCallState,
    type GlassTrumpetState,
    type TeraOrbState,
    type BrocksScoutState,
    type AkamatsuState,
} from './types'

interface CardEffectModalsProps {
    // Core state
    hand: Card[]
    remaining: Card[]
    setRemaining: React.Dispatch<React.SetStateAction<Card[]>>
    trash: Card[]
    battle: CardStack | null
    battleField: CardStack | null
    bench: (CardStack | null)[]
    idPrefix: string
    mobile: boolean
    sizes: { hand: { w: number; h: number }; battle: { w: number; h: number }; bench: { w: number; h: number } }

    // UI state
    showDeckViewer: boolean
    setShowDeckViewer: React.Dispatch<React.SetStateAction<boolean>>
    showTrashViewer: boolean
    setShowTrashViewer: React.Dispatch<React.SetStateAction<boolean>>
    deckCardMenu: DeckMenuState | null
    setDeckCardMenu: React.Dispatch<React.SetStateAction<DeckMenuState | null>>
    trashCardMenu: DeckMenuState | null
    setTrashCardMenu: React.Dispatch<React.SetStateAction<DeckMenuState | null>>
    peekDeckSearch: boolean
    setPeekDeckSearch: React.Dispatch<React.SetStateAction<boolean>>
    activeDragId: string | null
    activeDragData: any

    // Card effect states
    ultraBallState: UltraBallState | null
    setUltraBallState: React.Dispatch<React.SetStateAction<UltraBallState | null>>
    poffinState: PoffinState | null
    setPoffinState: React.Dispatch<React.SetStateAction<PoffinState | null>>
    toukoState: ToukoState | null
    setToukoState: React.Dispatch<React.SetStateAction<ToukoState | null>>
    fightGongState: FightGongState | null
    setFightGongState: React.Dispatch<React.SetStateAction<FightGongState | null>>
    lambdaState: LambdaState | null
    setLambdaState: React.Dispatch<React.SetStateAction<LambdaState | null>>
    nightStretcherState: NightStretcherState | null
    setNightStretcherState: React.Dispatch<React.SetStateAction<NightStretcherState | null>>
    genesectState: GenesectState | null
    setGenesectState: React.Dispatch<React.SetStateAction<GenesectState | null>>
    archaludonState: ArchaludonState | null
    setArchaludonState: React.Dispatch<React.SetStateAction<ArchaludonState | null>>
    tatsugiriState: TatsugiriState | null
    ogerponState: OgerponState | null
    setOgerponState: React.Dispatch<React.SetStateAction<OgerponState | null>>
    zoroarkState: ZoroarkState | null
    setZoroarkState: React.Dispatch<React.SetStateAction<ZoroarkState | null>>
    meowthEXState: MeowthEXState | null
    ironLeavesEXState: IronLeavesEXState | null
    setIronLeavesEXState: React.Dispatch<React.SetStateAction<IronLeavesEXState | null>>
    nPointUpState: NPointUpState | null
    setNPointUpState: React.Dispatch<React.SetStateAction<NPointUpState | null>>
    cyanoState: CyanoState | null
    ogerponWellspringState: OgerponWellspringState | null
    setOgerponWellspringState: React.Dispatch<React.SetStateAction<OgerponWellspringState | null>>
    bugCatchingSetState: BugCatchingSetState | null
    energySwitchState: EnergySwitchState | null
    setEnergySwitchState: React.Dispatch<React.SetStateAction<EnergySwitchState | null>>
    energyRetrievalState: EnergyRetrievalState | null
    setEnergyRetrievalState: React.Dispatch<React.SetStateAction<EnergyRetrievalState | null>>
    noctowlState: NoctowlState | null
    setNoctowlState: React.Dispatch<React.SetStateAction<NoctowlState | null>>
    megaLucarioEXAttackState: MegaLucarioEXAttackState | null
    setMegaLucarioEXAttackState: React.Dispatch<React.SetStateAction<MegaLucarioEXAttackState | null>>
    ragingBoltState: RagingBoltState | null
    setRagingBoltState: React.Dispatch<React.SetStateAction<RagingBoltState | null>>
    dawnState: DawnState | null
    fanCallState: FanCallState | null
    glassTrumpetState: GlassTrumpetState | null
    setGlassTrumpetState: React.Dispatch<React.SetStateAction<GlassTrumpetState | null>>
    teraOrbState: TeraOrbState | null
    setTeraOrbState: React.Dispatch<React.SetStateAction<TeraOrbState | null>>
    brocksScoutState: BrocksScoutState | null
    setBrocksScoutState: React.Dispatch<React.SetStateAction<BrocksScoutState | null>>
    akamatsuState: AkamatsuState | null
    setAkamatsuState: React.Dispatch<React.SetStateAction<AkamatsuState | null>>
    teisatsuCards: Card[] | null
    pokegearCards: Card[] | null
    pokePadState: Card[] | null
    setPokePadState: React.Dispatch<React.SetStateAction<Card[] | null>>
    setOnBoardSelection: React.Dispatch<React.SetStateAction<any>>

    // Functions
    shuffleDeck: () => void
    moveFromDeckToHand: (index: number) => void
    moveFromDeckToBench: (index: number) => void
    moveFromDeckToTrash: (index: number) => void
    moveFromDeckToBattleField: (index: number) => void
    moveFromTrashToHand: (index: number) => void
    moveFromTrashToDeck: (index: number) => void
    startAttachFromTrash: (index: number) => void
    handlePokePadSelect: (index: number) => void

    // Handlers
    handleUltraBallDiscardSelection: (i: number) => void
    handleUltraBallConfirmDiscard: () => void
    handleUltraBallSearchSelect: (i: number) => void
    handleUltraBallCancel: () => void
    handlePoffinSelect: (i: number) => void
    handlePoffinConfirm: () => void
    handleToukoSelect: (i: number) => void
    handleToukoConfirm: () => void
    handleFightGongSelect: (i: number) => void
    handleFightGongConfirm: () => void
    handleLambdaSelect: (i: number) => void
    handleLambdaConfirm: () => void
    handleNightStretcherSelect: (i: number) => void
    handleNightStretcherConfirm: () => void
    handleGenesectSelect: (i: number) => void
    handleGenesectConfirm: () => void
    handleArchaludonEnergySelect: (i: number) => void
    handleArchaludonTargetSelect: (type: 'battle' | 'bench', index: number) => void
    handleTatsugiriSelect: (i: number) => void
    handleTatsugiriConfirm: () => void
    handleOgerponSelect: (i: number) => void
    handleOgerponConfirm: () => void
    handleZoroarkSelect: (i: number) => void
    handleZoroarkConfirm: () => void
    handleMeowthEXSelect: (i: number) => void
    handleMeowthEXConfirm: () => void
    handleNPointUpSelectEnergy: (i: number) => void
    handleNPointUpConfirmEnergy: () => void
    handleCyanoSelect: (i: number) => void
    handleCyanoConfirm: () => void
    handleOgerponWellspringSelectCost: (i: number) => void
    handleOgerponWellspringConfirmCost: () => void
    handleBugCatchingSetSelect: (i: number) => void
    handleBugCatchingSetConfirm: () => void
    handleEnergySwitchSelectEnergy: (i: number) => void
    handleEnergyRetrievalSelect: (i: number) => void
    handleEnergyRetrievalConfirm: () => void
    handleNoctowlSelect: (i: number) => void
    handleNoctowlConfirm: () => void
    handleMegaLucarioEXSelectEnergy: (i: number) => void
    handleMegaLucarioEXConfirmEnergy: () => void
    handleExtremeAscentToggleEnergy: (source: 'battle' | 'bench', targetIndex: number, cardIndex: number, card: Card) => void
    handleExtremeAscentConfirm: () => void
    handleDawnSelect: (i: number) => void
    handleDawnConfirm: () => void
    handleDawnCancel: () => void
    handleFanCallSelect: (i: number) => void
    handleFanCallConfirm: () => void
    handleFanCallCancel: () => void
    handleGlassTrumpetEnergySelect: (i: number) => void
    handleGlassTrumpetConfirmEnergy: () => void
    handleTeraOrbSelect: (i: number) => void
    handleBrocksScoutSelect: (i: number) => void
    handleBrocksScoutConfirm: () => void
    handleAkamatsuSelectEnergy: (i: number) => void
    handleAkamatsuConfirmTwo: () => void
    handleAkamatsuSelectForHand: (i: number) => void
    handleTeisatsuSelect: (i: number) => void
    handlePokegearSelect: (i: number) => void
    handlePokegearCancel: () => void
}

export function CardEffectModals({
    hand, remaining, setRemaining, trash, battle, battleField, bench,
    idPrefix, mobile, sizes,
    showDeckViewer, setShowDeckViewer,
    showTrashViewer, setShowTrashViewer,
    deckCardMenu, setDeckCardMenu,
    trashCardMenu, setTrashCardMenu,
    peekDeckSearch, setPeekDeckSearch,
    activeDragId, activeDragData,
    ultraBallState, setUltraBallState,
    poffinState, setPoffinState,
    toukoState, setToukoState,
    fightGongState, setFightGongState,
    lambdaState, setLambdaState,
    nightStretcherState, setNightStretcherState,
    genesectState, setGenesectState,
    archaludonState, setArchaludonState,
    tatsugiriState,
    ogerponState, setOgerponState,
    zoroarkState, setZoroarkState,
    meowthEXState,
    ironLeavesEXState, setIronLeavesEXState,
    nPointUpState, setNPointUpState,
    cyanoState,
    ogerponWellspringState, setOgerponWellspringState,
    bugCatchingSetState,
    energySwitchState, setEnergySwitchState,
    energyRetrievalState, setEnergyRetrievalState,
    noctowlState, setNoctowlState,
    megaLucarioEXAttackState, setMegaLucarioEXAttackState,
    ragingBoltState, setRagingBoltState,
    dawnState,
    fanCallState,
    glassTrumpetState, setGlassTrumpetState,
    teraOrbState, setTeraOrbState,
    brocksScoutState, setBrocksScoutState,
    akamatsuState, setAkamatsuState,
    teisatsuCards, pokegearCards, pokePadState, setPokePadState,
    setOnBoardSelection,
    shuffleDeck,
    moveFromDeckToHand, moveFromDeckToBench, moveFromDeckToTrash, moveFromDeckToBattleField,
    moveFromTrashToHand, moveFromTrashToDeck, startAttachFromTrash,
    handlePokePadSelect,
    handleUltraBallDiscardSelection, handleUltraBallConfirmDiscard, handleUltraBallSearchSelect, handleUltraBallCancel,
    handlePoffinSelect, handlePoffinConfirm,
    handleToukoSelect, handleToukoConfirm,
    handleFightGongSelect, handleFightGongConfirm,
    handleLambdaSelect, handleLambdaConfirm,
    handleNightStretcherSelect, handleNightStretcherConfirm,
    handleGenesectSelect, handleGenesectConfirm,
    handleArchaludonEnergySelect, handleArchaludonTargetSelect,
    handleTatsugiriSelect, handleTatsugiriConfirm,
    handleOgerponSelect, handleOgerponConfirm,
    handleZoroarkSelect, handleZoroarkConfirm,
    handleMeowthEXSelect, handleMeowthEXConfirm,
    handleNPointUpSelectEnergy, handleNPointUpConfirmEnergy,
    handleCyanoSelect, handleCyanoConfirm,
    handleOgerponWellspringSelectCost, handleOgerponWellspringConfirmCost,
    handleBugCatchingSetSelect, handleBugCatchingSetConfirm,
    handleEnergySwitchSelectEnergy,
    handleEnergyRetrievalSelect, handleEnergyRetrievalConfirm,
    handleNoctowlSelect, handleNoctowlConfirm,
    handleMegaLucarioEXSelectEnergy, handleMegaLucarioEXConfirmEnergy,
    handleExtremeAscentToggleEnergy, handleExtremeAscentConfirm,
    handleDawnSelect, handleDawnConfirm, handleDawnCancel,
    handleFanCallSelect, handleFanCallConfirm, handleFanCallCancel,
    handleGlassTrumpetEnergySelect, handleGlassTrumpetConfirmEnergy,
    handleTeraOrbSelect,
    handleBrocksScoutSelect, handleBrocksScoutConfirm,
    handleAkamatsuSelectEnergy, handleAkamatsuConfirmTwo, handleAkamatsuSelectForHand,
    handleTeisatsuSelect, handlePokegearSelect, handlePokegearCancel,
}: CardEffectModalsProps) {
    return (
        <>
            {/* Modals */}
            {/* Deck Viewer Modal */}
            {
                showDeckViewer && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowDeckViewer(false)}>
                        <div className="bg-white rounded-lg p-4 max-w-4xl w-full max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold">山札確認 ({remaining.length}枚)</h2>
                                <div className="flex gap-2">
                                    <button onClick={() => { setShowDeckViewer(false); shuffleDeck(); }} className="bg-blue-600 text-white font-bold px-3 py-1 rounded shadow hover:bg-blue-700">シャッフルして閉じる</button>
                                    <button onClick={() => setShowDeckViewer(false)} className="bg-gray-200 text-gray-800 px-3 py-1 rounded hover:bg-gray-300">閉じる</button>
                                </div>
                            </div>
                            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-x-2 gap-y-6">
                                {remaining.map((card, i) => (
                                    <div
                                        key={i}
                                        className="relative group cursor-pointer"
                                        onClick={(e) => {
                                            const rect = e.currentTarget.getBoundingClientRect()
                                            const spaceBelow = window.innerHeight - rect.bottom
                                            const alignUp = spaceBelow < 220 // Threshold for menu visibility

                                            setDeckCardMenu({
                                                index: i,
                                                x: rect.left,
                                                y: alignUp ? rect.top + window.scrollY : rect.bottom + window.scrollY,
                                                align: alignUp ? 'up' : 'down'
                                            })
                                        }}
                                    >
                                        <Image
                                            src={card.imageUrl}
                                            alt={card.name}
                                            width={80}
                                            height={112}
                                            className="rounded shadow no-touch-menu no-select no-tap-highlight"
                                            draggable={false}
                                            unoptimized
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Deck Card Menu */}
            {
                deckCardMenu && typeof document !== 'undefined' ? createPortal(
                    <div
                        className="fixed inset-0 z-[10000]"
                        onClick={() => setDeckCardMenu(null)}
                    >
                        <div
                            className="absolute bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden flex flex-col min-w-[120px]"
                            style={{
                                left: Math.min(deckCardMenu.x, window.innerWidth - 130),
                                // If align is 'up', position bottom at Y. If 'down', position top at Y.
                                ...(deckCardMenu.align === 'up'
                                    ? { bottom: window.innerHeight - (deckCardMenu.y - window.scrollY) }
                                    : { top: deckCardMenu.y - window.scrollY }
                                )
                            }}
                            onClick={e => e.stopPropagation()}
                        >
                            <button
                                onClick={() => { moveFromDeckToHand(deckCardMenu.index); setDeckCardMenu(null); }}
                                className="px-4 py-3 hover:bg-gray-100 text-left text-sm font-bold border-b border-gray-100 text-black"
                            >手札へ</button>
                            <button
                                onClick={() => { moveFromDeckToBattleField(deckCardMenu.index); setDeckCardMenu(null); }}
                                className="px-4 py-3 hover:bg-gray-100 text-left text-sm font-bold border-b border-gray-100 text-black"
                            >バトル場へ</button>
                            <button
                                onClick={() => { moveFromDeckToBench(deckCardMenu.index); setDeckCardMenu(null); }}
                                className="px-4 py-3 hover:bg-gray-100 text-left text-sm font-bold border-b border-gray-100 text-black"
                            >ベンチへ</button>
                            <button
                                onClick={() => { moveFromDeckToTrash(deckCardMenu.index); setDeckCardMenu(null); }}
                                className="px-4 py-3 hover:bg-red-50 text-red-600 text-left text-sm font-black"
                            >トラッシュへ</button>
                        </div>
                    </div>,
                    document.body
                ) : null
            }

            {/* Akamatsu (Crispin) Modal */}
            {akamatsuState && (
                <div className={`fixed inset-0 z-[1000] flex items-center justify-center p-4 transition-all duration-300 ${akamatsuState.step === 'select_target' ? 'bg-transparent pointer-events-none' : (peekDeckSearch ? 'bg-black/10 pointer-events-auto' : 'bg-black/60 pointer-events-auto')
                    }`}>
                    <div className={`bg-white rounded-lg shadow-2xl animate-fade-in-up transition-all duration-300 pointer-events-auto ${akamatsuState.step === 'select_target'
                        ? 'fixed bottom-24 p-4 max-w-sm border-2 border-orange-500'
                        : peekDeckSearch ? 'opacity-0 pointer-events-none scale-95' : 'p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto'
                        }`}>
                        <div className="flex justify-between items-start mb-2">
                            <h2 className={`font-bold text-orange-600 ${akamatsuState.step === 'select_target' ? 'text-sm' : 'text-xl flex-1 text-center ml-8'}`}>アカマツ</h2>
                            {akamatsuState.step !== 'select_target' && (
                                <button
                                    onClick={() => setPeekDeckSearch(true)}
                                    className="bg-gray-100 hover:bg-gray-200 p-2 rounded-full text-gray-600 transition-colors"
                                    title="盤面を見る"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            )}
                        </div>

                        {akamatsuState.step === 'select_two' && (
                            <>
                                <p className="text-gray-600 text-center mb-6 text-sm">山札からちがうタイプの基本エネルギーを2枚まで選んでください。<br />(緑色の枠のカードが選択可能です)</p>
                                <div className="grid grid-cols-4 md:grid-cols-7 justify-center gap-[5px] mb-8 max-h-[50vh] overflow-y-auto p-4 bg-gray-50 rounded-inner shadow-inner">
                                    {akamatsuState.candidates.map((card, i) => {
                                        const isEnergyCard = isEnergy(card)
                                        const isSelected = akamatsuState.selectedIndices.includes(i)
                                        return (
                                            <div
                                                key={i}
                                                className={`relative cursor-pointer transition-all duration-200 rounded-lg w-fit mx-auto ${isEnergyCard
                                                    ? isSelected
                                                        ? 'ring-[6px] ring-orange-500 scale-110 z-10'
                                                        : 'ring-2 ring-green-400 hover:ring-4 hover:ring-green-500 hover:scale-105 shadow-[0_0_15px_rgba(74,222,128,0.5)]'
                                                    : 'opacity-40 grayscale pointer-events-none'
                                                    }`}
                                                onClick={() => isEnergyCard && handleAkamatsuSelectEnergy(i)}
                                            >
                                                <Image src={card.imageUrl} alt={card.name} width={90} height={126} className="rounded-lg shadow" unoptimized />
                                                {isSelected && (
                                                    <div className="absolute -top-3 -right-3 bg-orange-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-black shadow-lg border-2 border-white z-20">
                                                        {akamatsuState.selectedIndices.indexOf(i) + 1}
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                                <div className="flex justify-center gap-4">
                                    <button onClick={handleAkamatsuConfirmTwo} className="bg-orange-500 text-white font-bold px-8 py-2 rounded-full shadow-lg hover:bg-orange-600 disabled:opacity-50" disabled={akamatsuState.selectedIndices.length === 0}>
                                        決定 ({akamatsuState.selectedIndices.length}枚)
                                    </button>
                                    <button onClick={() => setAkamatsuState(null)} className="bg-gray-200 text-gray-800 font-bold px-8 py-2 rounded-full">中止</button>
                                </div>
                            </>
                        )}

                        {akamatsuState.step === 'select_for_hand' && (
                            <>
                                <p className="text-gray-600 text-center mb-6 text-sm">手札に加えるエネルギーを選択してください。<br />(選ばなかった方はポケモンに付けます)</p>
                                <div className="flex justify-center gap-10 mb-8">
                                    {akamatsuState.selectedIndices.map((realIdx, i) => (
                                        <div key={i} className="flex flex-col items-center gap-2">
                                            <div className="cursor-pointer hover:scale-105 transition-transform" onClick={() => handleAkamatsuSelectForHand(i)}>
                                                <Image src={akamatsuState.candidates[realIdx].imageUrl} alt="energy" width={140} height={196} className="rounded-lg shadow-xl" unoptimized />
                                            </div>
                                            <button onClick={() => handleAkamatsuSelectForHand(i)} className="bg-blue-500 text-white text-xs font-bold px-4 py-2 rounded-full">手札に加える</button>
                                        </div>
                                    ))}
                                </div>
                            </>
                        )}

                        {akamatsuState.step === 'select_target' && (
                            <div className="text-center">
                                <p className="text-sm font-bold text-gray-800 mb-1">付ける先のポケモンを直接クリックしてください</p>
                                <div className="flex justify-center items-center gap-4">
                                    <div className="relative">
                                        <Image
                                            src={akamatsuState.candidates[akamatsuState.selectedIndices.find(i => i !== akamatsuState.forHandIndex)!].imageUrl}
                                            alt="attaching" width={60} height={84} className="rounded shadow-lg border-2 border-green-500 animate-pulse" unoptimized
                                        />
                                    </div>
                                    <button onClick={() => { setAkamatsuState(null); setOnBoardSelection(null); }} className="bg-gray-200 text-gray-800 font-bold px-4 py-1 text-xs rounded-full">キャンセル</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}


            {/* Tatsugiri (Customer Service) Modal */}
            {tatsugiriState && (
                <div className={`fixed inset-0 z-[1000] flex items-center justify-center p-4 transition-all duration-300 ${peekDeckSearch ? 'bg-black/10' : 'bg-black/60'}`}>
                    <div className={`bg-white rounded-lg shadow-2xl p-6 max-w-4xl w-full max-h-[90vh] animate-fade-in-up transition-all duration-300 ${peekDeckSearch ? 'opacity-0 pointer-events-none scale-95' : 'opacity-100 overflow-y-auto'}`}>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-orange-500 flex-1 text-center ml-8">シャリタツ: きゃくよせ</h2>
                            <button
                                onClick={() => setPeekDeckSearch(true)}
                                className="bg-gray-100 hover:bg-gray-200 p-2 rounded-full text-gray-600"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>
                        <p className="text-gray-600 text-center mb-6 text-sm">山札の上から6枚を見て、サポートを1枚選んでください。<br />(オレンジ色の枠のカードが選択可能です)</p>

                        <div className="grid grid-cols-4 md:grid-cols-7 justify-center gap-[5px] mb-8 p-4 bg-gray-50 rounded-inner shadow-inner">
                            {tatsugiriState.candidates.map((card, i) => {
                                const isTarget = isSupporter(card)
                                const isSelected = tatsugiriState.selectedIndex === i
                                return (
                                    <div
                                        key={i}
                                        className={`relative cursor-pointer transition-all duration-200 rounded-lg w-fit mx-auto ${isTarget
                                            ? isSelected
                                                ? 'ring-[6px] ring-orange-500 scale-110 z-10'
                                                : 'ring-2 ring-blue-400 hover:ring-4 hover:ring-blue-500 hover:scale-105'
                                            : 'opacity-40 grayscale pointer-events-none'
                                            }`}
                                        onClick={() => isTarget && handleTatsugiriSelect(i)}
                                    >
                                        <Image src={card.imageUrl} alt={card.name} width={85} height={119} className="rounded-lg shadow" unoptimized />
                                        {isSelected && (
                                            <div className="absolute -top-3 -right-3 bg-orange-500 text-white w-7 h-7 rounded-full flex items-center justify-center font-black shadow-lg border-2 border-white z-20 text-xs text-center border">
                                                ✓
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>

                        <div className="flex justify-center gap-4">
                            <button
                                onClick={handleTatsugiriConfirm}
                                className="bg-orange-500 text-white font-bold px-8 py-2 rounded-full shadow-lg hover:bg-orange-600"
                            >
                                {tatsugiriState.selectedIndex !== null ? '決定' : '対象なし・終了'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Ogerpon Teal Mask ex (Teal Dance) Modal */}
            {ogerponState && (
                <div className={`fixed inset-0 z-[1000] flex items-center justify-center p-4 transition-all duration-300 ${peekDeckSearch ? 'bg-black/10' : 'bg-black/60'}`}>
                    <div className={`bg-white rounded-lg shadow-2xl p-6 max-w-4xl w-full max-h-[90vh] animate-fade-in-up transition-all duration-300 ${peekDeckSearch ? 'opacity-0 pointer-events-none scale-95' : 'opacity-100 overflow-y-auto'}`}>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-green-600 flex-1 text-center ml-8">オーガポン: みどりのまい</h2>
                            <button
                                onClick={() => setPeekDeckSearch(true)}
                                className="bg-gray-100 hover:bg-gray-200 p-2 rounded-full text-gray-600"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>
                        <p className="text-gray-600 text-center mb-6 text-sm">手札からこのポケモンにつける基本エネルギーを選んでください。</p>

                        <div className="grid grid-cols-4 md:grid-cols-7 justify-center gap-[5px] mb-8 p-4 bg-gray-50 rounded-inner shadow-inner">
                            {ogerponState.candidates.map((card, i) => {
                                const isTarget = isEnergy(card) // Simplification, strictly Basic Energy but relying on user or `isEnergy` + confirm check
                                const isSelected = ogerponState.selectedIndex === i
                                return (
                                    <div
                                        key={i}
                                        className={`relative cursor-pointer transition-all duration-200 rounded-lg w-fit mx-auto ${isTarget
                                            ? isSelected
                                                ? 'ring-[6px] ring-green-600 scale-110 z-10'
                                                : 'ring-2 ring-blue-400 hover:ring-4 hover:ring-blue-500 hover:scale-105'
                                            : 'opacity-40 grayscale pointer-events-none'
                                            }`}
                                        onClick={() => isTarget && handleOgerponSelect(i)}
                                    >
                                        <Image src={card.imageUrl} alt={card.name} width={85} height={119} className="rounded-lg shadow" unoptimized />
                                        {isSelected && (
                                            <div className="absolute -top-3 -right-3 bg-green-600 text-white w-7 h-7 rounded-full flex items-center justify-center font-black shadow-lg border-2 border-white z-20 text-xs text-center border">
                                                ✓
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>

                        <div className="flex justify-center gap-4">
                            <button
                                onClick={handleOgerponConfirm}
                                disabled={ogerponState.selectedIndex === null}
                                className="bg-green-600 text-white font-bold px-8 py-2 rounded-full shadow-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                決定
                            </button>
                            <button onClick={() => setOgerponState(null)} className="bg-gray-200 text-gray-800 font-bold px-8 py-2 rounded-full">中止</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Zoroark ex (Trade) Modal */}
            {zoroarkState && (
                <div className={`fixed inset-0 z-[1000] flex items-center justify-center p-4 transition-all duration-300 ${peekDeckSearch ? 'bg-black/10' : 'bg-black/60'}`}>
                    <div className={`bg-white rounded-lg shadow-2xl p-6 max-w-4xl w-full max-h-[90vh] animate-fade-in-up transition-all duration-300 ${peekDeckSearch ? 'opacity-0 pointer-events-none scale-95' : 'opacity-100 overflow-y-auto'}`}>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-700 flex-1 text-center ml-8">ゾロアーク: とりひき</h2>
                            <button
                                onClick={() => setPeekDeckSearch(true)}
                                className="bg-gray-100 hover:bg-gray-200 p-2 rounded-full text-gray-600"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>
                        <p className="text-gray-600 text-center mb-6 text-sm">手札からトラッシュするカードを1枚選んでください。</p>

                        <div className="grid grid-cols-4 md:grid-cols-7 justify-center gap-[5px] mb-8 p-4 bg-gray-50 rounded-inner shadow-inner">
                            {zoroarkState.candidates.map((card, i) => {
                                const isSelected = zoroarkState.selectedIndex === i
                                return (
                                    <div
                                        key={i}
                                        className={`relative cursor-pointer transition-all duration-200 rounded-lg w-fit mx-auto ${isSelected
                                            ? 'ring-[6px] ring-gray-600 scale-110 z-10'
                                            : 'ring-2 ring-blue-400 hover:ring-4 hover:ring-blue-500 hover:scale-105'
                                            }`}
                                        onClick={() => handleZoroarkSelect(i)}
                                    >
                                        <Image src={card.imageUrl} alt={card.name} width={85} height={119} className="rounded-lg shadow" unoptimized />
                                        {isSelected && (
                                            <div className="absolute -top-3 -right-3 bg-gray-600 text-white w-7 h-7 rounded-full flex items-center justify-center font-black shadow-lg border-2 border-white z-20 text-xs text-center border">
                                                ✓
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>

                        <div className="flex justify-center gap-4">
                            <button
                                onClick={handleZoroarkConfirm}
                                disabled={zoroarkState.selectedIndex === null}
                                className="bg-gray-700 text-white font-bold px-8 py-2 rounded-full shadow-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                決定
                            </button>
                            <button onClick={() => setZoroarkState(null)} className="bg-gray-200 text-gray-800 font-bold px-8 py-2 rounded-full">中止</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Meowth ex (Trump Card Catch) Modal */}
            {meowthEXState && (
                <div className={`fixed inset-0 z-[1000] flex items-center justify-center p-4 transition-all duration-300 ${peekDeckSearch ? 'bg-black/10' : 'bg-black/60'}`}>
                    <div className={`bg-white rounded-lg shadow-2xl p-6 max-w-4xl w-full max-h-[90vh] animate-fade-in-up transition-all duration-300 ${peekDeckSearch ? 'opacity-0 pointer-events-none scale-95' : 'opacity-100 overflow-y-auto'}`}>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-orange-600 flex-1 text-center ml-8">ニャースex: おくのてキャッチ</h2>
                            <button
                                onClick={() => setPeekDeckSearch(true)}
                                className="bg-gray-100 hover:bg-gray-200 p-2 rounded-full text-gray-600"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>
                        <p className="text-gray-600 text-center mb-6 text-sm">山札からサポートカードを1枚選んでください。<br />(オレンジ色の枠のカードが選択可能です)</p>

                        <div className="grid grid-cols-4 md:grid-cols-7 justify-center gap-[5px] mb-8 p-4 bg-gray-50 rounded-inner shadow-inner">
                            {meowthEXState.candidates.map((card, i) => {
                                const isTarget = isSupporter(card)
                                const isSelected = meowthEXState.selectedIndex === i
                                return (
                                    <div
                                        key={i}
                                        className={`relative cursor-pointer transition-all duration-200 rounded-lg w-fit mx-auto ${isTarget
                                            ? isSelected
                                                ? 'ring-[6px] ring-orange-600 scale-110 z-10'
                                                : 'ring-2 ring-orange-200 hover:ring-4 hover:ring-orange-400 hover:scale-105'
                                            : 'opacity-40 grayscale pointer-events-none'
                                            }`}
                                        onClick={() => isTarget && handleMeowthEXSelect(i)}
                                    >
                                        <Image src={card.imageUrl} alt={card.name} width={85} height={119} className="rounded-lg shadow" unoptimized />
                                        {isSelected && (
                                            <div className="absolute -top-3 -right-3 bg-orange-600 text-white w-7 h-7 rounded-full flex items-center justify-center font-black shadow-lg border-2 border-white z-20 text-xs text-center border">
                                                ✓
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>

                        <div className="flex justify-center gap-4">
                            <button
                                onClick={handleMeowthEXConfirm}
                                className="bg-orange-600 text-white font-bold px-8 py-2 rounded-full shadow-lg hover:bg-orange-700"
                            >
                                {meowthEXState.selectedIndex !== null ? '決定' : '対象なし・戻す'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Nのポイントアップ Modal */}
            {nPointUpState && (
                <div className={`fixed inset-0 z-[1000] flex items-center justify-center p-4 transition-all duration-300 ${nPointUpState.step === 'select_target' ? 'bg-transparent pointer-events-none' : (peekDeckSearch ? 'bg-black/10' : 'bg-black/60')}`}>
                    <div className={`bg-white rounded-lg shadow-2xl animate-fade-in-up transition-all duration-300 pointer-events-auto ${nPointUpState.step === 'select_target'
                        ? 'fixed bottom-24 p-4 max-w-sm border-2 border-orange-500'
                        : peekDeckSearch ? 'opacity-0 pointer-events-none scale-95' : 'p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto'
                        }`}>
                        <div className="flex justify-between items-start mb-2">
                            <h2 className={`font-bold text-orange-600 ${nPointUpState.step === 'select_target' ? 'text-sm' : 'text-xl flex-1 text-center ml-8'}`}>Nのポイントアップ</h2>
                            {nPointUpState.step !== 'select_target' && (
                                <button
                                    onClick={() => setPeekDeckSearch(true)}
                                    className="bg-gray-100 hover:bg-gray-200 p-2 rounded-full text-gray-600"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            )}
                        </div>

                        {nPointUpState.step === 'select_energy' && (
                            <>
                                <p className="text-gray-600 text-center mb-6 text-sm">トラッシュから基本エネルギーを1枚選んでください。<br />(オレンジ色の枠のカードが選択可能です)</p>
                                <div className="grid grid-cols-4 md:grid-cols-7 justify-center gap-[5px] mb-8 p-4 bg-gray-50 rounded-inner shadow-inner">
                                    {nPointUpState.candidates.map((card, i) => {
                                        const isTarget = isEnergy(card)
                                        const isSelected = nPointUpState.selectedIndex === i
                                        return (
                                            <div
                                                key={i}
                                                className={`relative cursor-pointer transition-all duration-200 rounded-lg w-fit mx-auto ${isTarget
                                                    ? isSelected
                                                        ? 'ring-[6px] ring-orange-500 scale-110 z-10'
                                                        : 'ring-2 ring-orange-200 hover:ring-4 hover:ring-orange-400 hover:scale-105'
                                                    : 'opacity-40 grayscale pointer-events-none'
                                                    }`}
                                                onClick={() => isTarget && handleNPointUpSelectEnergy(i)}
                                            >
                                                <Image src={card.imageUrl} alt={card.name} width={85} height={119} className="rounded-lg shadow" unoptimized />
                                                {isSelected && (
                                                    <div className="absolute -top-3 -right-3 bg-orange-600 text-white w-7 h-7 rounded-full flex items-center justify-center font-black shadow-lg border-2 border-white z-20 text-xs text-center border">
                                                        ✓
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                                <div className="flex justify-center gap-4">
                                    <button
                                        onClick={handleNPointUpConfirmEnergy}
                                        disabled={nPointUpState.selectedIndex === null}
                                        className="bg-orange-600 text-white font-bold px-8 py-2 rounded-full shadow-lg hover:bg-orange-700 disabled:opacity-50"
                                    >
                                        決定
                                    </button>
                                    <button onClick={() => setNPointUpState(null)} className="bg-gray-200 text-gray-800 font-bold px-8 py-2 rounded-full">中止</button>
                                </div>
                            </>
                        )}

                        {nPointUpState.step === 'select_target' && (
                            <div className="text-center">
                                <p className="text-sm font-bold text-gray-800 mb-1">付ける先のベンチポケモンを直接クリックしてください</p>
                                <div className="flex justify-center items-center gap-4">
                                    <div className="relative">
                                        <Image
                                            src={nPointUpState.candidates[nPointUpState.selectedIndex!].imageUrl}
                                            alt="attaching" width={60} height={84} className="rounded shadow-lg border-2 border-green-500 animate-pulse" unoptimized
                                        />
                                    </div>
                                    <button onClick={() => setNPointUpState(null)} className="bg-gray-200 text-gray-800 font-bold px-4 py-1 text-xs rounded-full">キャンセル</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* シアノ Modal */}
            {cyanoState && (
                <div className={`fixed inset-0 z-[1000] flex items-center justify-center p-4 transition-all duration-300 ${peekDeckSearch ? 'bg-black/10' : 'bg-black/60'}`}>
                    <div className={`bg-white rounded-lg shadow-2xl p-6 max-w-4xl w-full max-h-[90vh] animate-fade-in-up transition-all duration-300 ${peekDeckSearch ? 'opacity-0 pointer-events-none scale-95' : 'opacity-100 overflow-y-auto'}`}>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-blue-600 flex-1 text-center ml-8">シアノ</h2>
                            <button
                                onClick={() => setPeekDeckSearch(true)}
                                className="bg-gray-100 hover:bg-gray-200 p-2 rounded-full text-gray-600"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>
                        <p className="text-gray-600 text-center mb-6 text-sm">山札から「ポケモンex」を3枚まで選んでください。<br />(青色の枠のカードが選択可能です)</p>

                        <div className="grid grid-cols-4 md:grid-cols-7 justify-center gap-[5px] mb-8 p-4 bg-gray-50 rounded-inner shadow-inner">
                            {cyanoState.candidates.map((card, i) => {
                                const isTarget = card.name.includes('ex')
                                const isSelected = cyanoState.selectedIndices.includes(i)
                                return (
                                    <div
                                        key={i}
                                        className={`relative cursor-pointer transition-all duration-200 rounded-lg w-fit mx-auto ${isTarget
                                            ? isSelected
                                                ? 'ring-[6px] ring-blue-600 scale-110 z-10'
                                                : 'ring-2 ring-blue-200 hover:ring-4 hover:ring-blue-400 hover:scale-105'
                                            : 'opacity-40 grayscale pointer-events-none'
                                            }`}
                                        onClick={() => isTarget && handleCyanoSelect(i)}
                                    >
                                        <Image src={card.imageUrl} alt={card.name} width={85} height={119} className="rounded-lg shadow" unoptimized />
                                        {isSelected && (
                                            <div className="absolute -top-3 -right-3 bg-blue-600 text-white w-7 h-7 rounded-full flex items-center justify-center font-black shadow-lg border-2 border-white z-20 text-xs text-center border">
                                                {cyanoState.selectedIndices.indexOf(i) + 1}
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>

                        <div className="flex justify-center gap-4">
                            <button
                                onClick={handleCyanoConfirm}
                                className="bg-blue-600 text-white font-bold px-8 py-2 rounded-full shadow-lg hover:bg-blue-700"
                            >
                                {cyanoState.selectedIndices.length > 0 ? `決定 (${cyanoState.selectedIndices.length}枚)` : '対象なし・戻す'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* オーガポン いどのめんex (Energy Cost Selection) Modal */}
            {ogerponWellspringState && ogerponWellspringState.step === 'select_cost' && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/70">
                    <div className="bg-white rounded-lg shadow-2xl p-6 max-w-2xl w-full animate-fade-in-up">
                        <h2 className="text-xl font-bold mb-2 text-center text-blue-600">げきりゅうポンプ: コスト選択</h2>
                        <p className="text-gray-600 text-center mb-6 text-sm">山札に戻すエネルギーを{battleField?.cards.some(c => c.name.includes('きらめく結晶')) ? 2 : 3}枚選んでください。</p>

                        <div className="grid grid-cols-4 md:grid-cols-7 justify-center gap-4 mb-8 p-4 bg-gray-50 rounded-inner">
                            {battleField?.cards.map((card, i) => {
                                const isTarget = isEnergy(card)
                                const isSelected = ogerponWellspringState.selectedIndices.includes(i)
                                return (
                                    <div
                                        key={i}
                                        className={`relative cursor-pointer transition-all duration-200 rounded-lg ${isTarget
                                            ? isSelected
                                                ? 'ring-[6px] ring-blue-600 scale-110 z-10'
                                                : 'ring-2 ring-blue-200 hover:ring-4 hover:ring-blue-400 hover:scale-105'
                                            : 'opacity-40 grayscale pointer-events-none'
                                            }`}
                                        onClick={() => isTarget && handleOgerponWellspringSelectCost(i)}
                                    >
                                        <Image src={card.imageUrl} alt={card.name} width={100} height={140} className="rounded shadow" unoptimized />
                                        {isSelected && (
                                            <div className="absolute -top-3 -right-3 bg-blue-600 text-white w-8 h-8 rounded-full flex items-center justify-center font-black shadow-lg border-2 border-white">
                                                {ogerponWellspringState.selectedIndices.indexOf(i) + 1}
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>

                        <div className="flex justify-center gap-4">
                            <button
                                onClick={handleOgerponWellspringConfirmCost}
                                disabled={ogerponWellspringState.selectedIndices.length !== (battleField?.cards.some(c => c.name.includes('きらめく結晶')) ? 2 : 3)}
                                className="bg-blue-600 text-white font-bold px-8 py-2 rounded-full shadow-lg hover:bg-blue-700 disabled:opacity-50"
                            >
                                山札に戻して攻撃！
                            </button>
                            <button onClick={() => setOgerponWellspringState(null)} className="bg-gray-200 text-gray-800 font-bold px-8 py-2 rounded-full">キャンセル</button>
                        </div>
                    </div>
                </div>
            )}

            {/* むしとりセット Modal */}
            {bugCatchingSetState && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/70">
                    <div className="bg-white rounded-lg shadow-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-fade-in-up">
                        <h2 className="text-xl font-bold mb-2 text-center text-green-600">むしとりセット</h2>
                        <p className="text-gray-600 text-center mb-6 text-sm">山札の上から7枚です。ポケモンまたは基本草エネルギーを2枚まで選んでください。<br />(緑色の枠のカードが選択可能です)</p>

                        <div className="grid grid-cols-4 md:grid-cols-7 justify-center gap-2 mb-8 p-4 bg-gray-50 rounded-inner shadow-inner">
                            {bugCatchingSetState.candidates.map((card, i) => {
                                const isAnyPokemon = isPokemon(card)
                                const isBasicGrassEnergy = isEnergy(card) && card.name.includes('基本草エネルギー')
                                const isTarget = isAnyPokemon || isBasicGrassEnergy
                                const isSelected = bugCatchingSetState.selectedIndices.includes(i)
                                return (
                                    <div
                                        key={i}
                                        className={`relative cursor-pointer transition-all duration-200 rounded-lg ${isTarget
                                            ? isSelected
                                                ? 'ring-[6px] ring-green-600 scale-110 z-10'
                                                : 'ring-2 ring-green-200 hover:ring-4 hover:ring-green-400 hover:scale-105'
                                            : 'opacity-40 grayscale pointer-events-none'
                                            }`}
                                        onClick={() => isTarget && handleBugCatchingSetSelect(i)}
                                    >
                                        <Image src={card.imageUrl} alt={card.name} width={85} height={119} className="rounded shadow" unoptimized />
                                        {isSelected && (
                                            <div className="absolute -top-3 -right-3 bg-green-600 text-white w-7 h-7 rounded-full flex items-center justify-center font-black shadow-lg border-2 border-white z-20 text-xs text-center border">
                                                {bugCatchingSetState.selectedIndices.indexOf(i) + 1}
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>

                        <div className="flex justify-center gap-4">
                            <button
                                onClick={handleBugCatchingSetConfirm}
                                className="bg-green-600 text-white font-bold px-8 py-2 rounded-full shadow-lg hover:bg-green-700"
                            >
                                {bugCatchingSetState.selectedIndices.length > 0 ? `決定 (${bugCatchingSetState.selectedIndices.length}枚)` : '対象なし・戻す'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* エネルギーつけかえ Overlay / Modal */}
            {energySwitchState && (
                <div className={`fixed inset-0 z-[1000] flex items-center justify-center p-4 transition-colors duration-300 ${energySwitchState.step === 'select_energy' ? 'bg-black/70' : 'bg-transparent pointer-events-none'}`}>
                    <div className={`bg-white rounded-lg shadow-2xl animate-fade-in-up overflow-y-auto pointer-events-auto ${energySwitchState.step === 'select_energy'
                        ? 'p-6 max-w-xl w-full'
                        : 'fixed bottom-24 p-4 max-w-sm border-2 border-blue-500'
                        }`}>
                        <h2 className={`font-bold text-center text-blue-600 ${energySwitchState.step === 'select_energy' ? 'text-xl mb-4' : 'text-sm mb-1'}`}>エネルギーつけかえ</h2>

                        {energySwitchState.step === 'select_source_pokemon' && (
                            <p className="text-center text-gray-800 font-bold">エネルギーが付いている自分のポケモンを選択してください</p>
                        )}

                        {energySwitchState.step === 'select_energy' && (
                            <>
                                <p className="text-gray-600 text-center mb-6 text-sm">移動させるエネルギーを1つ選んでください。</p>
                                <div className="grid grid-cols-4 md:grid-cols-7 justify-center gap-4 mb-8">
                                    {(energySwitchState.sourceType === 'battle' ? battleField : bench[energySwitchState.sourceIndex!])?.cards.map((card, i) => {
                                        const isTarget = isEnergy(card)
                                        return (
                                            <div
                                                key={i}
                                                className={`relative cursor-pointer transition-all duration-200 rounded-lg ${isTarget
                                                    ? 'ring-2 ring-blue-200 hover:ring-4 hover:ring-blue-400 hover:scale-105'
                                                    : 'opacity-40 grayscale pointer-events-none'
                                                    }`}
                                                onClick={() => isTarget && handleEnergySwitchSelectEnergy(i)}
                                            >
                                                <Image src={card.imageUrl} alt={card.name} width={100} height={140} className="rounded shadow" unoptimized />
                                            </div>
                                        )
                                    })}
                                </div>
                                <div className="flex justify-center">
                                    <button onClick={() => setEnergySwitchState(null)} className="bg-gray-200 text-gray-800 font-bold px-8 py-2 rounded-full">キャンセル</button>
                                </div>
                            </>
                        )}

                        {energySwitchState.step === 'select_target_pokemon' && (
                            <div className="text-center">
                                <p className="text-sm font-bold text-gray-800 mb-1">つけ替え先の別のポケモンを選択してください</p>
                                <button onClick={() => setEnergySwitchState(null)} className="bg-gray-200 text-gray-800 font-bold px-4 py-1 text-xs rounded-full">キャンセル</button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* エネルギー回収 Modal */}
            {energyRetrievalState && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/70">
                    <div className="bg-white rounded-lg shadow-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-fade-in-up">
                        <h2 className="text-xl font-bold mb-2 text-center text-blue-600">エネルギー回収</h2>
                        <p className="text-gray-600 text-center mb-6 text-sm">トラッシュから基本エネルギーを2枚まで選んでください。<br />(青色の枠のカードが選択可能です)</p>

                        <div className="grid grid-cols-4 md:grid-cols-7 justify-center gap-2 mb-8 p-4 bg-gray-50 rounded-inner shadow-inner">
                            {energyRetrievalState.candidates.map((card, i) => {
                                const isTarget = isEnergy(card) && !card.subtypes?.includes('Special')
                                const isSelected = energyRetrievalState.selectedIndices.includes(i)
                                return (
                                    <div
                                        key={i}
                                        className={`relative cursor-pointer transition-all duration-200 rounded-lg ${isTarget
                                            ? isSelected
                                                ? 'ring-[6px] ring-blue-600 scale-110 z-10'
                                                : 'ring-2 ring-blue-200 hover:ring-4 hover:ring-blue-400 hover:scale-105'
                                            : 'opacity-40 grayscale pointer-events-none'
                                            }`}
                                        onClick={() => isTarget && handleEnergyRetrievalSelect(i)}
                                    >
                                        <Image src={card.imageUrl} alt={card.name} width={85} height={119} className="rounded shadow" unoptimized />
                                        {isSelected && (
                                            <div className="absolute -top-3 -right-3 bg-blue-600 text-white w-7 h-7 rounded-full flex items-center justify-center font-black shadow-lg border-2 border-white z-20 text-xs text-center border">
                                                {energyRetrievalState.selectedIndices.indexOf(i) + 1}
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>

                        <div className="flex justify-center gap-4">
                            <button
                                onClick={handleEnergyRetrievalConfirm}
                                className="bg-blue-600 text-white font-bold px-8 py-2 rounded-full shadow-lg hover:bg-blue-700"
                            >
                                {energyRetrievalState.selectedIndices.length > 0 ? `決定 (${energyRetrievalState.selectedIndices.length}枚)` : '対象なし・中止'}
                            </button>
                            <button onClick={() => setEnergyRetrievalState(null)} className="bg-gray-200 text-gray-800 font-bold px-8 py-2 rounded-full">戻る</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ヨルノズク Modal */}
            {noctowlState && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/70">
                    <div className="bg-white rounded-lg shadow-2xl p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto animate-fade-in-up">
                        <h2 className="text-xl font-bold mb-2 text-center text-yellow-600">ヨルノズク: ほうせきさがし</h2>
                        <p className="text-gray-600 text-center mb-6 text-sm">山札からトレーナーズを2枚まで選んでください。<br />(黄色の枠のカードが選択可能です)</p>

                        <div className="grid grid-cols-4 md:grid-cols-7 justify-center gap-2 mb-8 p-4 bg-gray-50 rounded-inner shadow-inner">
                            {noctowlState.candidates.map((card, i) => {
                                const isTarget = isTrainer(card)
                                const isSelected = noctowlState.selectedIndices.includes(i)
                                return (
                                    <div
                                        key={i}
                                        className={`relative cursor-pointer transition-all duration-200 rounded-lg ${isTarget
                                            ? isSelected
                                                ? 'ring-[6px] ring-yellow-600 scale-110 z-10'
                                                : 'ring-2 ring-yellow-200 hover:ring-4 hover:ring-yellow-400 hover:scale-105'
                                            : 'opacity-40 grayscale pointer-events-none'
                                            }`}
                                        onClick={() => isTarget && handleNoctowlSelect(i)}
                                    >
                                        <Image src={card.imageUrl} alt={card.name} width={85} height={119} className="rounded shadow" unoptimized />
                                        {isSelected && (
                                            <div className="absolute -top-3 -right-3 bg-yellow-600 text-white w-7 h-7 rounded-full flex items-center justify-center font-black shadow-lg border-2 border-white z-20 text-xs text-center border">
                                                {noctowlState.selectedIndices.indexOf(i) + 1}
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>

                        <div className="flex justify-center gap-4">
                            <button
                                onClick={handleNoctowlConfirm}
                                className="bg-yellow-600 text-white font-bold px-8 py-2 rounded-full shadow-lg hover:bg-yellow-700"
                            >
                                {noctowlState.selectedIndices.length > 0 ? `決定 (${noctowlState.selectedIndices.length}枚)` : '対象なし・戻す'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* メガルカリオex Modal & Overlay */}
            {megaLucarioEXAttackState && (
                <div className={`fixed inset-0 z-[1000] flex items-center justify-center p-4 transition-colors duration-300 ${megaLucarioEXAttackState.step === 'select_energy' ? 'bg-black/70' : 'bg-transparent pointer-events-none'}`}>
                    <div className={`bg-white rounded-lg shadow-2xl animate-fade-in-up overflow-y-auto pointer-events-auto ${megaLucarioEXAttackState.step === 'select_energy'
                        ? 'p-6 max-w-4xl w-full max-h-[90vh]'
                        : 'fixed bottom-24 p-4 max-w-sm border-2 border-orange-500'
                        }`}>
                        <h2 className={`font-bold text-center text-orange-600 ${megaLucarioEXAttackState.step === 'select_energy' ? 'text-xl mb-2' : 'text-sm mb-1'}`}>メガルカリオex: はどうづき</h2>

                        {megaLucarioEXAttackState.step === 'select_energy' && (
                            <>
                                <p className="text-gray-600 text-center mb-6 text-sm">トラッシュから基本闘エネルギーを3枚まで選んでください。<br />(オレンジ色の枠のカードが選択可能です)</p>
                                <div className="grid grid-cols-4 md:grid-cols-7 justify-center gap-2 mb-8 p-4 bg-gray-50 rounded-inner shadow-inner">
                                    {megaLucarioEXAttackState.candidates.map((card, i) => {
                                        const isTarget = isEnergy(card) && card.name.includes('基本闘エネルギー')
                                        const isSelected = megaLucarioEXAttackState.selectedIndices.includes(i)
                                        return (
                                            <div
                                                key={i}
                                                className={`relative cursor-pointer transition-all duration-200 rounded-lg ${isTarget
                                                    ? isSelected
                                                        ? 'ring-[6px] ring-orange-600 scale-110 z-10'
                                                        : 'ring-2 ring-orange-200 hover:ring-4 hover:ring-orange-400 hover:scale-105'
                                                    : 'opacity-40 grayscale pointer-events-none'
                                                    }`}
                                                onClick={() => isTarget && handleMegaLucarioEXSelectEnergy(i)}
                                            >
                                                <Image src={card.imageUrl} alt={card.name} width={85} height={119} className="rounded shadow" unoptimized />
                                                {isSelected && (
                                                    <div className="absolute -top-3 -right-3 bg-orange-600 text-white w-7 h-7 rounded-full flex items-center justify-center font-black shadow-lg border-2 border-white z-20 text-xs text-center border">
                                                        {megaLucarioEXAttackState.selectedIndices.indexOf(i) + 1}
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                                <div className="flex justify-center gap-4">
                                    <button
                                        onClick={handleMegaLucarioEXConfirmEnergy}
                                        className="bg-orange-600 text-white font-bold px-8 py-2 rounded-full shadow-lg hover:bg-orange-700 disabled:opacity-50"
                                        disabled={megaLucarioEXAttackState.selectedIndices.length === 0}
                                    >
                                        付ける先を選ぶ ({megaLucarioEXAttackState.selectedIndices.length}枚)
                                    </button>
                                    <button onClick={() => setMegaLucarioEXAttackState(null)} className="bg-gray-200 text-gray-800 font-bold px-8 py-2 rounded-full">戻る</button>
                                </div>
                            </>
                        )}

                        {megaLucarioEXAttackState.step === 'attach_energy' && (
                            <div className="text-center">
                                <p className="text-sm font-bold text-gray-800 mb-1">
                                    {megaLucarioEXAttackState.attachingIndex + 1}枚目: 付けるベンチポケモンを直接クリックしてください
                                </p>
                                <div className="flex justify-center items-center gap-4">
                                    <div className="relative">
                                        <Image
                                            src={megaLucarioEXAttackState.candidates[megaLucarioEXAttackState.selectedIndices[megaLucarioEXAttackState.attachingIndex]].imageUrl}
                                            alt="attaching" width={60} height={84} className="rounded shadow-lg border-2 border-orange-500 animate-pulse" unoptimized
                                        />
                                    </div>
                                    <button onClick={() => setMegaLucarioEXAttackState(null)} className="bg-gray-200 text-gray-800 font-bold px-4 py-1 text-xs rounded-full">キャンセル</button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}
            {/* Iron Leaves ex (Rapid Vernier) Overlay */}
            {ironLeavesEXState && ironLeavesEXState.active && (
                <div className="fixed inset-0 z-[1000] pointer-events-none">
                    <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-green-600 text-white px-6 py-4 rounded-xl shadow-2xl animate-bounce pointer-events-auto border-2 border-white">
                        <h3 className="font-bold text-center">テツノイサハex: ラピッドバーニア</h3>
                        <p className="text-xs text-green-50 text-center mt-1">
                            エネルギーが付いている自分のポケモンをクリックして、<br />
                            テツノイサハexへエネルギーを移動させてください。
                        </p>
                        <button
                            onClick={() => setIronLeavesEXState(null)}
                            className="mt-3 w-full bg-white text-green-600 font-bold py-1 rounded-lg text-sm hover:bg-green-50"
                        >
                            移動を終了する
                        </button>
                    </div>
                </div>
            )}

            {/* Ultra Ball Modal */}
            {/* Noctowl Selection Modal */}
            {noctowlState && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setNoctowlState(null)} />
                    <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b flex justify-between items-center bg-yellow-50">
                            <div>
                                <h3 className="text-xl font-black text-yellow-900">特性: ほうせきさがし (山札検索)</h3>
                                <p className="text-sm text-yellow-700">トレーナーズを2枚まで選択してください</p>
                            </div>
                            <button onClick={() => setNoctowlState(null)} className="text-gray-400 hover:text-gray-600 p-2">✕</button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6">
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
                                {noctowlState.candidates.map((card, i) => {
                                    const isSelected = noctowlState.selectedIndices.includes(i)
                                    return (
                                        <div
                                            key={i}
                                            onClick={() => handleNoctowlSelect(i)}
                                            className={`relative cursor-pointer transition-all duration-200 ${isSelected ? 'ring-4 ring-yellow-500 scale-105 z-10' : 'opacity-80 hover:opacity-100'}`}
                                        >
                                            <div className="aspect-[2/3] relative rounded-lg overflow-hidden shadow-md">
                                                <Image src={card.imageUrl} alt={card.name} fill className="object-cover" unoptimized />
                                                {isSelected && (
                                                    <div className="absolute inset-0 bg-yellow-500/20 flex items-center justify-center">
                                                        <div className="bg-yellow-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-lg">✓</div>
                                                    </div>
                                                )}
                                            </div>
                                            <p className="mt-1 text-[10px] text-center font-bold truncate">{card.name}</p>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                        <div className="p-6 border-t bg-gray-50 flex justify-between items-center">
                            <span className="font-bold text-gray-600">{noctowlState.selectedIndices.length} / 2 枚選択中</span>
                            <div className="flex gap-3">
                                <button onClick={() => setNoctowlState(null)} className="px-6 py-2 text-gray-500 font-bold">キャンセル</button>
                                <button
                                    onClick={handleNoctowlConfirm}
                                    className="bg-yellow-600 text-white font-black px-10 py-3 rounded-full shadow-lg hover:bg-yellow-700 transition active:scale-95"
                                >
                                    手札に加える
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Genesect ex Selection Modal */}
            {genesectState && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setGenesectState(null)} />
                    <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b flex justify-between items-center bg-red-50">
                            <div>
                                <h3 className="text-xl font-black text-red-900">特性: メタルシグナル (山札検索)</h3>
                                <p className="text-sm text-red-700">鋼タイプのポケモンを2枚まで選択してください</p>
                            </div>
                            <button onClick={() => setGenesectState(null)} className="text-gray-400 hover:text-gray-600 p-2">✕</button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6">
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
                                {genesectState.candidates.map((card, i) => {
                                    const isSelected = genesectState.selectedIndices.includes(i)
                                    return (
                                        <div
                                            key={i}
                                            onClick={() => handleGenesectSelect(i)}
                                            className={`relative cursor-pointer transition-all duration-200 ${isSelected ? 'ring-4 ring-red-500 scale-105 z-10' : 'opacity-80 hover:opacity-100'}`}
                                        >
                                            <div className="aspect-[2/3] relative rounded-lg overflow-hidden shadow-md">
                                                <Image src={card.imageUrl} alt={card.name} fill className="object-cover" unoptimized />
                                                {isSelected && (
                                                    <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center">
                                                        <div className="bg-red-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-lg">✓</div>
                                                    </div>
                                                )}
                                            </div>
                                            <p className="mt-1 text-[10px] text-center font-bold truncate">{card.name}</p>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                        <div className="p-6 border-t bg-gray-50 flex justify-between items-center">
                            <span className="font-bold text-gray-600">{genesectState.selectedIndices.length} / 2 枚選択中</span>
                            <div className="flex gap-3">
                                <button onClick={() => setGenesectState(null)} className="px-6 py-2 text-gray-500 font-bold">キャンセル</button>
                                <button
                                    onClick={handleGenesectConfirm}
                                    className="bg-red-600 text-white font-black px-10 py-3 rounded-full shadow-lg hover:bg-red-700 transition active:scale-95"
                                >
                                    手札に加える
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Archaludon ex Selection Modal */}
            {archaludonState && archaludonState.step === 'select_energy' && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setArchaludonState(null)} />
                    <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-6 border-b flex justify-between items-center bg-blue-50">
                            <div>
                                <h3 className="text-xl font-black text-blue-900">特性: ごうきんビルド (トラッシュ検索)</h3>
                                <p className="text-sm text-blue-700">基本鋼エネルギーを2枚まで選択してください</p>
                            </div>
                            <button onClick={() => setArchaludonState(null)} className="text-gray-400 hover:text-gray-600 p-2">✕</button>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6">
                            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-4">
                                {archaludonState.candidates.map((card, i) => {
                                    const isSelected = archaludonState.selectedEnergyIndices.includes(i)
                                    const isSteel = card.supertype === 'Energy' && card.name.includes('基本鋼')
                                    return (
                                        <div
                                            key={i}
                                            onClick={() => isSteel && handleArchaludonEnergySelect(i)}
                                            className={`relative cursor-pointer transition-all duration-200 
                                                ${isSteel ? '' : 'grayscale opacity-30 cursor-not-allowed'}
                                                ${isSelected ? 'ring-4 ring-blue-500 scale-105 z-10' : 'hover:opacity-100'}
                                            `}
                                        >
                                            <div className="aspect-[2/3] relative rounded-lg overflow-hidden shadow-md">
                                                <Image src={card.imageUrl} alt={card.name} fill className="object-cover" unoptimized />
                                                {isSelected && (
                                                    <div className="absolute inset-0 bg-blue-500/20 flex items-center justify-center">
                                                        <div className="bg-blue-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-bold shadow-lg">✓</div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                        <div className="p-6 border-t bg-gray-50 flex justify-between items-center">
                            <span className="font-bold text-gray-600">{archaludonState.selectedEnergyIndices.length} / 2 枚選択中</span>
                            <div className="flex gap-3">
                                <button onClick={() => setArchaludonState(null)} className="px-6 py-2 text-gray-500 font-bold">キャンセル</button>
                                <button
                                    onClick={() => setArchaludonState(prev => prev ? { ...prev, step: 'select_target' } : null)}
                                    disabled={archaludonState.selectedEnergyIndices.length === 0}
                                    className="bg-blue-600 text-white font-black px-10 py-3 rounded-full shadow-lg hover:bg-blue-700 disabled:bg-gray-300 disabled:shadow-none transition active:scale-95"
                                >
                                    つける先を選択
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Archaludon Target Selection Modal */}
            {archaludonState && archaludonState.step === 'select_target' && (
                <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 animate-in fade-in duration-200">
                    <div className="absolute inset-0 bg-gray-900/80 backdrop-blur-md" onClick={() => setArchaludonState(null)} />
                    <div className="relative text-center w-full max-w-2xl px-4">
                        <div className="bg-white rounded-3xl p-8 shadow-2xl border-4 border-blue-500 mb-8">
                            <h3 className="text-2xl font-black text-gray-900 mb-2">エネルギーをつける先を選択</h3>
                            <p className="text-blue-600 font-bold">バトル場またはベンチのポケモンを選択してください</p>
                        </div>

                        <div className="space-y-4">
                            {/* Battle Field Option */}
                            {battle && (
                                <button
                                    onClick={() => handleArchaludonTargetSelect('battle', 0)}
                                    className="w-full bg-white hover:bg-blue-50 p-6 rounded-2xl border-2 border-transparent hover:border-blue-500 transition-all flex items-center gap-6 group"
                                >
                                    <div className="w-16 h-24 relative flex-shrink-0 group-hover:scale-105 transition">
                                        <Image src={getTopCard(battle).imageUrl} alt="" fill className="object-cover rounded-lg shadow" unoptimized />
                                    </div>
                                    <div className="text-left">
                                        <div className="text-xs font-bold text-gray-500 mb-1 tracking-widest uppercase">Battle Field</div>
                                        <div className="text-xl font-black text-gray-900">{getTopCard(battle).name}</div>
                                    </div>
                                </button>
                            )}

                            {/* Bench Options */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {bench.map((stack, i) => stack && (
                                    <button
                                        key={i}
                                        onClick={() => handleArchaludonTargetSelect('bench', i)}
                                        className="bg-white hover:bg-blue-50 p-4 rounded-2xl border-2 border-transparent hover:border-blue-500 transition-all flex items-center gap-4 group"
                                    >
                                        <div className="w-12 h-16 relative flex-shrink-0 group-hover:scale-105 transition">
                                            <Image src={getTopCard(stack).imageUrl} alt="" fill className="object-cover rounded-lg shadow" unoptimized />
                                        </div>
                                        <div className="text-left">
                                            <div className="text-xs font-bold text-gray-500 mb-0.5 tracking-widest uppercase">Bench {i + 1}</div>
                                            <div className="text-sm font-black text-gray-900 truncate max-w-[120px]">{getTopCard(stack).name}</div>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={() => setArchaludonState(prev => prev ? { ...prev, step: 'select_energy' } : null)}
                            className="mt-12 bg-gray-800 text-white font-bold px-12 py-3 rounded-full hover:bg-gray-700 transition active:scale-95"
                        >
                            戻る
                        </button>
                    </div>
                </div>
            )}

            {ultraBallState && (
                <div className={`fixed inset-0 z-[1000] flex items-center justify-center p-4 transition-all duration-300 ${peekDeckSearch ? 'bg-black/10' : 'bg-black/60'}`}>
                    <div className={`bg-white rounded-lg shadow-2xl p-6 max-w-4xl w-full max-h-[90vh] animate-fade-in-up transition-all duration-300 ${peekDeckSearch ? 'opacity-0 pointer-events-none scale-95' : 'opacity-100 overflow-y-auto'}`}>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-yellow-600 flex-1 text-center ml-8">ハイパーボール</h2>
                            <button
                                onClick={() => setPeekDeckSearch(true)}
                                className="bg-gray-100 hover:bg-gray-200 p-2 rounded-full text-gray-600"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                    <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                </svg>
                            </button>
                        </div>

                        {ultraBallState.step === 'discard' && (
                            <>
                                <p className="text-gray-600 text-center mb-6 text-sm">トラッシュする手札を2枚選んでください。</p>
                                <div className="grid grid-cols-4 md:grid-cols-7 justify-center gap-[5px] mb-8">
                                    {ultraBallState.candidates.map((card, i) => {
                                        const isSelected = ultraBallState.handIndices.includes(i)
                                        return (
                                            <div
                                                key={i}
                                                className={`relative cursor-pointer transition-all duration-200 rounded-lg w-fit mx-auto ${isSelected ? 'ring-4 ring-yellow-500 scale-105 z-10' : 'hover:scale-105'
                                                    }`}
                                                onClick={() => handleUltraBallDiscardSelection(i)}
                                            >
                                                <Image src={card.imageUrl} alt={card.name} width={100} height={140} className="rounded-lg shadow" unoptimized />
                                                {isSelected && (
                                                    <div className="absolute inset-0 bg-yellow-500/20 rounded-lg flex items-center justify-center">
                                                        <div className="bg-yellow-500 text-white w-8 h-8 rounded-full flex items-center justify-center font-black shadow-lg border-2 border-white">
                                                            ✓
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })}
                                </div>
                                <div className="flex justify-center gap-4">
                                    <button
                                        onClick={handleUltraBallConfirmDiscard}
                                        className="bg-yellow-500 text-white font-bold px-8 py-2 rounded-full shadow-lg hover:bg-yellow-600 disabled:opacity-50"
                                        disabled={ultraBallState.handIndices.length !== 2}
                                    >
                                        2枚トラッシュして山札を見る
                                    </button>
                                    <button onClick={() => setUltraBallState(null)} className="bg-gray-200 text-gray-800 font-bold px-8 py-2 rounded-full">中止</button>
                                </div>
                            </>
                        )}

                        {ultraBallState.step === 'search' && (
                            <>
                                <p className="text-gray-600 text-center mb-6 text-sm">山札からポケモンを1枚選んでください。<br />(緑色の枠のカードが選択可能です)</p>
                                <div className="grid grid-cols-4 md:grid-cols-7 justify-center gap-[5px] mb-8 p-4 bg-gray-50 rounded-inner shadow-inner">
                                    {remaining.map((card, i) => {
                                        const isTarget = isPokemon(card)
                                        return (
                                            <div
                                                key={i}
                                                className={`relative cursor-pointer transition-all duration-200 rounded-lg w-fit mx-auto ${isTarget
                                                    ? 'ring-2 ring-green-400 hover:ring-4 hover:ring-green-500 hover:scale-110 z-10'
                                                    : 'opacity-40 grayscale pointer-events-none'
                                                    }`}
                                                onClick={() => isTarget && handleUltraBallSearchSelect(i)}
                                            >
                                                <Image src={card.imageUrl} alt={card.name} width={80} height={112} className="rounded-lg shadow" unoptimized />
                                            </div>
                                        )
                                    })}
                                </div>
                                <div className="flex justify-center">
                                    <button onClick={handleUltraBallCancel} className="bg-gray-200 text-gray-800 font-bold px-8 py-2 rounded-full">対象なし・中止</button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}

            {/* Dawn (ヒカリ) Modal */}
            {dawnState && (
                <div className={`fixed inset-0 z-[1000] flex items-center justify-center p-4 transition-all duration-300 ${peekDeckSearch ? 'bg-black/10' : 'bg-black/60'}`}>
                    <div className={`bg-white rounded-lg shadow-2xl p-6 max-w-4xl w-full max-h-[90vh] animate-fade-in-up transition-all duration-300 ${peekDeckSearch ? 'opacity-0 pointer-events-none scale-95' : 'opacity-100 overflow-y-auto'}`}>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-blue-600 flex-1 text-center ml-8">ヒカリ</h2>
                            <button onClick={() => setPeekDeckSearch(true)} className="bg-gray-100 hover:bg-gray-200 p-2 rounded-full text-gray-600">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>
                            </button>
                        </div>
                        <p className="text-gray-600 text-center mb-6 text-sm">山札からたね、1進化、2進化をそれぞれ1枚ずつ選んでください。<br />(緑色の枠のカードが選択可能です)</p>
                        <div className="grid grid-cols-4 md:grid-cols-7 justify-center gap-[5px] mb-8 p-4 bg-gray-50 rounded-inner shadow-inner">
                            {remaining.map((card, i) => {
                                const isTarget = isPokemon(card)
                                const isSelected = dawnState.selectedIndices.includes(i)
                                return (
                                    <div key={i} className={`relative cursor-pointer transition-all duration-200 rounded-lg w-fit mx-auto ${isTarget ? (isSelected ? 'ring-[6px] ring-blue-500 scale-110 z-10' : 'ring-2 ring-green-400 hover:ring-4 hover:ring-green-500 hover:scale-105') : 'opacity-40 grayscale pointer-events-none'}`} onClick={() => isTarget && handleDawnSelect(i)}>
                                        <Image src={card.imageUrl} alt={card.name} width={85} height={119} className="rounded-lg shadow" unoptimized />
                                        {isSelected && (
                                            <div className="absolute -top-3 -right-3 bg-blue-500 text-white w-7 h-7 rounded-full flex items-center justify-center font-black shadow-lg border-2 border-white z-20 text-xs text-center">{dawnState.selectedIndices.indexOf(i) + 1}</div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                        <div className="flex justify-center gap-4">
                            <button onClick={handleDawnConfirm} className="bg-blue-600 text-white font-bold px-8 py-2 rounded-full shadow-lg hover:bg-blue-700">
                                {dawnState.selectedIndices.length > 0 ? `${dawnState.selectedIndices.length}枚を手札に加える` : '対象なし・決定'}
                            </button>
                            <button onClick={handleDawnCancel} className="bg-gray-200 text-gray-800 font-bold px-8 py-2 rounded-full">キャンセル</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Fan Call (ファンコール) Modal */}
            {fanCallState && (
                <div className={`fixed inset-0 z-[1000] flex items-center justify-center p-4 transition-all duration-300 ${peekDeckSearch ? 'bg-black/10' : 'bg-black/60'}`}>
                    <div className={`bg-white rounded-lg shadow-2xl p-6 max-w-4xl w-full max-h-[90vh] animate-fade-in-up transition-all duration-300 ${peekDeckSearch ? 'opacity-0 pointer-events-none scale-95' : 'opacity-100 overflow-y-auto'}`}>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-gray-700 flex-1 text-center ml-8">ファンコール</h2>
                            <button onClick={() => setPeekDeckSearch(true)} className="bg-gray-100 hover:bg-gray-200 p-2 rounded-full text-gray-600">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>
                            </button>
                        </div>
                        <p className="text-gray-600 text-center mb-6 text-sm">山札からHP100以下の無色ポケモンを3枚まで選んでください。<br />(緑色の枠のポケモンが選択可能です)</p>
                        <div className="grid grid-cols-4 md:grid-cols-7 justify-center gap-[5px] mb-8 p-4 bg-gray-50 rounded-inner shadow-inner">
                            {remaining.map((card, i) => {
                                const isTarget = isPokemon(card)
                                const isSelected = fanCallState.selectedIndices.includes(i)
                                return (
                                    <div key={i} className={`relative cursor-pointer transition-all duration-200 rounded-lg w-fit mx-auto ${isTarget ? (isSelected ? 'ring-[6px] ring-gray-500 scale-110 z-10' : 'ring-2 ring-green-400 hover:ring-4 hover:ring-green-500 hover:scale-105') : 'opacity-40 grayscale pointer-events-none'}`} onClick={() => isTarget && handleFanCallSelect(i)}>
                                        <Image src={card.imageUrl} alt={card.name} width={85} height={119} className="rounded-lg shadow" unoptimized />
                                        {isSelected && (
                                            <div className="absolute -top-3 -right-3 bg-gray-600 text-white w-7 h-7 rounded-full flex items-center justify-center font-black shadow-lg border-2 border-white z-20 text-xs text-center">{fanCallState.selectedIndices.indexOf(i) + 1}</div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                        <div className="flex justify-center gap-4">
                            <button onClick={handleFanCallConfirm} className="bg-gray-600 text-white font-bold px-8 py-2 rounded-full shadow-lg hover:bg-gray-700">
                                {fanCallState.selectedIndices.length > 0 ? `${fanCallState.selectedIndices.length}枚を手札に加える` : '対象なし・決定'}
                            </button>
                            <button onClick={handleFanCallCancel} className="bg-gray-200 text-gray-800 font-bold px-8 py-2 rounded-full">キャンセル</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Glass Trumpet (ガラスのラッパ) UI */}
            {glassTrumpetState && (
                glassTrumpetState.step === 'select_energy' ? (
                    <div className="fixed inset-0 bg-black/60 z-[1000] flex items-center justify-center p-4">
                        <div className="bg-white rounded-lg shadow-2xl p-6 max-w-4xl w-full max-h-[90vh] animate-fade-in-up overflow-y-auto">
                            <div className="text-center mb-6">
                                <h2 className="text-xl font-bold text-cyan-600">ガラスのラッパ</h2>
                                <p className="text-gray-600 text-sm mt-2">
                                    トラッシュから基本エネルギーを2枚選んでください。
                                </p>
                            </div>

                            <div className="grid grid-cols-4 md:grid-cols-7 justify-center gap-[5px] mb-8">
                                {glassTrumpetState.candidates.map((card, i) => {
                                    const isSelected = glassTrumpetState.selectedEnergyIndices.includes(i)
                                    return (
                                        <div key={i} className={`relative cursor-pointer transition-all duration-200 rounded-lg w-fit mx-auto ${isSelected ? 'ring-4 ring-cyan-500 scale-105 z-10' : 'hover:scale-105'}`} onClick={() => handleGlassTrumpetEnergySelect(i)}>
                                            <Image src={card.imageUrl} alt={card.name} width={85} height={119} className="rounded-lg shadow" unoptimized />
                                            {isSelected && (
                                                <div className="absolute inset-0 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                                                    <div className="bg-cyan-500 text-white w-7 h-7 rounded-full flex items-center justify-center font-black shadow-lg border-2 border-white">{glassTrumpetState.selectedEnergyIndices.indexOf(i) + 1}</div>
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                            <div className="flex justify-center gap-4">
                                <button onClick={handleGlassTrumpetConfirmEnergy} className="bg-cyan-600 text-white font-bold px-8 py-2 rounded-full shadow-lg hover:bg-cyan-700 disabled:opacity-50" disabled={glassTrumpetState.selectedEnergyIndices.length === 0}>
                                    付けるポケモンを選ぶ ({glassTrumpetState.selectedEnergyIndices.length}枚)
                                </button>
                                <button onClick={() => setGlassTrumpetState(null)} className="bg-gray-200 text-gray-800 font-bold px-8 py-2 rounded-full">キャンセル</button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-[2000] animate-bounce-in w-full max-w-lg px-4">
                        <div className="bg-cyan-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center justify-between gap-4 border-2 border-cyan-400 backdrop-blur-md bg-opacity-90">
                            <div className="flex items-center gap-4 min-w-0">
                                <div className="flex -space-x-4 flex-shrink-0">
                                    {glassTrumpetState.selectedEnergyIndices.map((idx, i) => (
                                        <div key={i} className="relative">
                                            <div className="w-10 h-14 rounded overflow-hidden border-2 border-white shadow-lg">
                                                <Image src={trash[idx].imageUrl} alt="energy" width={40} height={56} className="object-cover" unoptimized />
                                            </div>
                                            {i === 0 && <div className="absolute -top-2 -left-2 bg-yellow-400 text-black text-[10px] font-black px-1.5 py-0.5 rounded-full border border-white">次</div>}
                                        </div>
                                    ))}
                                </div>
                                <div className="flex flex-col min-w-0">
                                    <span className="font-black text-sm sm:text-base tracking-wider truncate">対象のポケモンを選択してください</span>
                                    <span className="text-cyan-100 text-[10px] sm:text-xs font-bold">ベンチのポケモンをクリックしてエネルギーを付けます</span>
                                </div>
                            </div>
                            <button
                                onClick={() => setGlassTrumpetState(null)}
                                className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-full transition-colors flex-shrink-0"
                                title="キャンセル"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    </div>
                )
            )}

            {/* Raging Bolt ex (タケルライコex) UI */}
            {ragingBoltState && (
                <div className="fixed inset-0 bg-black/60 z-[1000] flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-2xl p-6 max-w-4xl w-full max-h-[90vh] animate-fade-in-up overflow-y-auto">
                        <div className="text-center mb-6">
                            <h2 className="text-xl font-bold text-red-600">きょくらいごう (タケルライコex)</h2>
                            <p className="text-gray-600 text-sm mt-2">
                                自分の場のポケモンについている基本エネルギーを好きなだけ選び、トラッシュしてください。
                            </p>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                            {/* Battle Field */}
                            {battleField && battleField.cards.some((c, i) => i > 0 && isEnergy(c) && (c.subtypes?.includes('Basic') || !c.subtypes?.includes('Special'))) && (
                                <div className="bg-red-50 p-4 rounded-xl border border-red-100">
                                    <h3 className="text-red-700 font-bold mb-3 text-center">バトル場</h3>
                                    <div className="flex flex-wrap justify-center gap-2">
                                        {battleField.cards.map((card, i) => {
                                            if (i === 0) return null // Skip the Pokemon card itself
                                            if (!(isEnergy(card) && (card.subtypes?.includes('Basic') || !card.subtypes?.includes('Special')))) return null
                                            const isSelected = ragingBoltState.selectedEnergies.some(e => e.source === 'battle' && e.cardIndex === i)
                                            return (
                                                <div key={i} className={`relative cursor-pointer transition-all ${isSelected ? 'ring-4 ring-red-500 scale-105' : 'hover:scale-105 opacity-60'}`} onClick={() => handleExtremeAscentToggleEnergy('battle', 0, i, card)}>
                                                    <Image src={card.imageUrl} alt={card.name} width={60} height={84} className="rounded shadow" unoptimized />
                                                    {isSelected && (
                                                        <div className="absolute inset-0 bg-red-500/20 rounded-lg flex items-center justify-center">
                                                            <div className="bg-red-500 text-white p-1 rounded-full">
                                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                </svg>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </div>
                                </div>
                            )}

                            {/* Bench */}
                            {bench.map((stack, benchIdx) => {
                                if (!stack || !stack.cards.some((c, i) => i > 0 && isEnergy(c) && (c.subtypes?.includes('Basic') || !c.subtypes?.includes('Special')))) return null
                                return (
                                    <div key={benchIdx} className="bg-gray-50 p-4 rounded-xl border border-gray-100">
                                        <h3 className="text-gray-700 font-bold mb-3 text-center">ベンチ {benchIdx + 1}</h3>
                                        <div className="flex flex-wrap justify-center gap-2">
                                            {stack.cards.map((card, i) => {
                                                if (i === 0) return null
                                                if (!(isEnergy(card) && (card.subtypes?.includes('Basic') || !card.subtypes?.includes('Special')))) return null
                                                const isSelected = ragingBoltState.selectedEnergies.some(e => e.source === 'bench' && e.targetIndex === benchIdx && e.cardIndex === i)
                                                return (
                                                    <div key={i} className={`relative cursor-pointer transition-all ${isSelected ? 'ring-4 ring-red-500 scale-105' : 'hover:scale-105 opacity-60'}`} onClick={() => handleExtremeAscentToggleEnergy('bench', benchIdx, i, card)}>
                                                        <Image src={card.imageUrl} alt={card.name} width={60} height={84} className="rounded shadow" unoptimized />
                                                        {isSelected && (
                                                            <div className="absolute inset-0 bg-red-500/20 rounded-lg flex items-center justify-center">
                                                                <div className="bg-red-500 text-white p-1 rounded-full">
                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
                                                                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                                                                    </svg>
                                                                </div>
                                                            </div>
                                                        )}
                                                    </div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>

                        <div className="flex justify-center gap-4">
                            <button onClick={handleExtremeAscentConfirm} className="bg-red-600 text-white font-bold px-8 py-2 rounded-full shadow-lg hover:bg-red-700">
                                {ragingBoltState.selectedEnergies.length > 0 ? `${ragingBoltState.selectedEnergies.length}枚をトラッシュする` : 'トラッシュせずに終了'}
                            </button>
                            <button onClick={() => setRagingBoltState(null)} className="bg-gray-200 text-gray-800 font-bold px-8 py-2 rounded-full">キャンセル</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Tera Orb (テラスタルオーブ) Modal */}
            {teraOrbState && (
                <div className={`fixed inset-0 z-[1000] flex items-center justify-center p-4 transition-all duration-300 ${peekDeckSearch ? 'bg-black/10' : 'bg-black/60'}`}>
                    <div className={`bg-white rounded-lg shadow-2xl p-6 max-w-4xl w-full max-h-[90vh] animate-fade-in-up transition-all duration-300 ${peekDeckSearch ? 'opacity-0 pointer-events-none scale-95' : 'opacity-100 overflow-y-auto'}`}>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-indigo-700 flex-1 text-center ml-8">テラスタルオーブ</h2>
                            <button onClick={() => setPeekDeckSearch(true)} className="bg-gray-100 hover:bg-gray-200 p-2 rounded-full text-gray-600">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>
                            </button>
                        </div>
                        <p className="text-gray-600 text-center mb-6 text-sm">山札からポケモンを1枚選んでください。<br />(緑色の枠のカードが選択可能です)</p>
                        <div className="grid grid-cols-4 md:grid-cols-7 justify-center gap-[5px] mb-8 p-4 bg-gray-50 rounded-inner shadow-inner">
                            {remaining.map((card, i) => {
                                const isTarget = isPokemon(card)
                                return (
                                    <div key={i} className={`relative cursor-pointer transition-all duration-200 rounded-lg w-fit mx-auto ${isTarget ? 'ring-2 ring-green-400 hover:ring-4 hover:ring-green-500 hover:scale-110 z-10' : 'opacity-40 grayscale pointer-events-none'}`} onClick={() => isTarget && handleTeraOrbSelect(i)}>
                                        <Image src={card.imageUrl} alt={card.name} width={80} height={112} className="rounded-lg shadow" unoptimized />
                                    </div>
                                )
                            })}
                        </div>
                        <div className="flex justify-center">
                            <button onClick={() => { setRemaining(prev => [...prev].sort(() => Math.random() - 0.5)); setTeraOrbState(null); alert("山札をシャッフルしました"); }} className="bg-gray-200 text-gray-800 font-bold px-8 py-2 rounded-full">対象なし・中止</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Brock's Scout (タケシのスカウト) Modal */}
            {brocksScoutState && (
                <div className={`fixed inset-0 z-[1000] flex items-center justify-center p-4 transition-all duration-300 ${peekDeckSearch ? 'bg-black/10' : 'bg-black/60'}`}>
                    <div className={`bg-white rounded-lg shadow-2xl p-6 max-w-4xl w-full max-h-[90vh] animate-fade-in-up transition-all duration-300 ${peekDeckSearch ? 'opacity-0 pointer-events-none scale-95' : 'opacity-100 overflow-y-auto'}`}>
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold text-stone-800 flex-1 text-center ml-8">タケシのスカウト</h2>
                            <button onClick={() => setPeekDeckSearch(true)} className="bg-gray-100 hover:bg-gray-200 p-2 rounded-full text-gray-600">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path d="M10 12a2 2 0 100-4 2 2 0 000 4z" /><path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" /></svg>
                            </button>
                        </div>
                        <p className="text-gray-600 text-center mb-6 text-sm">山札からたねポケモンを2枚まで、または進化ポケモンを1枚選んでください。<br />(緑色の枠のポケモンが選択可能です)</p>
                        <div className="grid grid-cols-4 md:grid-cols-7 justify-center gap-[5px] mb-8 p-4 bg-gray-50 rounded-inner shadow-inner">
                            {remaining.map((card, i) => {
                                const isTarget = isPokemon(card)
                                const isSelected = brocksScoutState.selectedIndices.includes(i)
                                return (
                                    <div key={i} className={`relative cursor-pointer transition-all duration-200 rounded-lg w-fit mx-auto ${isTarget ? (isSelected ? 'ring-[6px] ring-stone-600 scale-110 z-10' : 'ring-2 ring-green-400 hover:ring-4 hover:ring-green-500 hover:scale-105 shadow-[0_0_15px_rgba(74,222,128,0.5)]') : 'opacity-40 grayscale pointer-events-none'}`} onClick={() => isTarget && handleBrocksScoutSelect(i)}>
                                        <Image src={card.imageUrl} alt={card.name} width={85} height={119} className="rounded-lg shadow" unoptimized />
                                        {isSelected && (
                                            <div className="absolute -top-3 -right-3 bg-stone-800 text-white w-7 h-7 rounded-full flex items-center justify-center font-black shadow-lg border-2 border-white z-20 text-xs text-center">{brocksScoutState.selectedIndices.indexOf(i) + 1}</div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                        <div className="flex justify-center gap-4">
                            <button onClick={handleBrocksScoutConfirm} className="bg-stone-800 text-white font-bold px-8 py-2 rounded-full shadow-lg hover:bg-stone-900">
                                {brocksScoutState.selectedIndices.length > 0 ? `${brocksScoutState.selectedIndices.length}枚を手札に加える` : '対象なし・決定'}
                            </button>
                            <button onClick={() => { setRemaining(prev => [...prev].sort(() => Math.random() - 0.5)); setBrocksScoutState(null); alert("山札をシャッフルしました"); }} className="bg-gray-200 text-gray-800 font-bold px-8 py-2 rounded-full">中止</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Buddy-Buddy Poffin Modal */}
            {
                poffinState && (
                    <div className={`fixed inset-0 z-[1000] flex items-center justify-center p-4 transition-all duration-300 ${peekDeckSearch ? 'bg-black/10' : 'bg-black/60'}`}>
                        <div className={`bg-white rounded-lg shadow-2xl p-6 max-w-4xl w-full max-h-[90vh] animate-fade-in-up transition-all duration-300 ${peekDeckSearch ? 'opacity-0 pointer-events-none scale-95' : 'opacity-100 overflow-y-auto'}`}>
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-pink-600 flex-1 text-center ml-8">なかよしポフィン</h2>
                                <button
                                    onClick={() => setPeekDeckSearch(true)}
                                    className="bg-gray-100 hover:bg-gray-200 p-2 rounded-full text-gray-600"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </div>
                            <p className="text-gray-600 text-center mb-6 text-sm">山札からHP70以下のたねポケモンを2枚まで選んでください。<br />(緑色の枠のポケモンが選択可能です)</p>

                            <div className="grid grid-cols-4 md:grid-cols-7 justify-center gap-[5px] mb-8 p-4 bg-gray-50 rounded-inner shadow-inner">
                                {remaining.map((card, i) => {
                                    const isTarget = isPokemon(card) // HP check not possible with current data
                                    const isSelected = poffinState.selectedIndices.includes(i)
                                    return (
                                        <div
                                            key={i}
                                            className={`relative cursor-pointer transition-all duration-200 rounded-lg w-fit mx-auto ${isTarget
                                                ? isSelected
                                                    ? 'ring-[6px] ring-pink-500 scale-110 z-10'
                                                    : 'ring-2 ring-green-400 hover:ring-4 hover:ring-green-500 hover:scale-105 shadow-[0_0_15px_rgba(74,222,128,0.5)]'
                                                : 'opacity-40 grayscale pointer-events-none'
                                                }`}
                                            onClick={() => isTarget && handlePoffinSelect(i)}
                                        >
                                            <Image src={card.imageUrl} alt={card.name} width={85} height={119} className="rounded-lg shadow" unoptimized />
                                            {isSelected && (
                                                <div className="absolute -top-3 -right-3 bg-pink-500 text-white w-7 h-7 rounded-full flex items-center justify-center font-black shadow-lg border-2 border-white z-20 text-xs text-center">
                                                    {poffinState.selectedIndices.indexOf(i) + 1}
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>

                            <div className="flex justify-center gap-4">
                                <button
                                    onClick={handlePoffinConfirm}
                                    className="bg-pink-500 text-white font-bold px-8 py-2 rounded-full shadow-lg hover:bg-pink-600"
                                >
                                    {poffinState.selectedIndices.length > 0 ? `${poffinState.selectedIndices.length}枚をベンチに出す` : '対象なし・決定'}
                                </button>
                                <button onClick={() => setPoffinState(null)} className="bg-gray-200 text-gray-800 font-bold px-8 py-2 rounded-full">中止</button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Touko Modal */}
            {
                toukoState && (
                    <div className={`fixed inset-0 z-[1000] flex items-center justify-center p-4 transition-all duration-300 ${peekDeckSearch ? 'bg-black/10' : 'bg-black/60'}`}>
                        <div className={`bg-white rounded-lg shadow-2xl p-6 max-w-4xl w-full max-h-[90vh] animate-fade-in-up transition-all duration-300 ${peekDeckSearch ? 'opacity-0 pointer-events-none scale-95' : 'opacity-100 overflow-y-auto'}`}>
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-green-600 flex-1 text-center ml-8">トウコ</h2>
                                <button
                                    onClick={() => setPeekDeckSearch(true)}
                                    className="bg-gray-100 hover:bg-gray-200 p-2 rounded-full text-gray-600 transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </div>
                            <p className="text-gray-600 text-center mb-6 text-sm">山札から進化ポケモンとエネルギーを1枚ずつ選んでください。<br />(青い枠のカードが選択可能です)</p>

                            <div className="grid grid-cols-4 md:grid-cols-7 justify-center gap-[5px] mb-8 p-4 bg-gray-50 rounded-inner shadow-inner">
                                {remaining.map((card, i) => {
                                    const canSelectPokemon = isPokemon(card)
                                    const canSelectEnergy = isEnergy(card)
                                    const isSelected = toukoState.selectedPokemonIndex === i || toukoState.selectedEnergyIndex === i
                                    const isSelectable = canSelectPokemon || canSelectEnergy

                                    return (
                                        <div
                                            key={i}
                                            className={`relative cursor-pointer transition-all duration-200 rounded-lg w-fit mx-auto ${isSelectable
                                                ? isSelected
                                                    ? 'ring-[6px] ring-green-600 scale-110 z-10'
                                                    : 'ring-2 ring-blue-400 hover:ring-4 hover:ring-blue-500 hover:scale-105'
                                                : 'opacity-40 grayscale pointer-events-none'
                                                }`}
                                            onClick={() => isSelectable && handleToukoSelect(i)}
                                        >
                                            <Image src={card.imageUrl} alt={card.name} width={85} height={119} className="rounded-lg shadow" unoptimized />
                                            {isSelected && (
                                                <div className="absolute -top-3 -right-3 bg-green-600 text-white w-7 h-7 rounded-full flex items-center justify-center font-black shadow-lg border-2 border-white z-20 text-xs text-center border">
                                                    ✓
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>

                            <div className="flex justify-center gap-4">
                                <button
                                    onClick={handleToukoConfirm}
                                    className="bg-green-600 text-white font-bold px-8 py-2 rounded-full shadow-lg hover:bg-green-700"
                                >
                                    決定
                                </button>
                                <button onClick={() => setToukoState(null)} className="bg-gray-200 text-gray-800 font-bold px-8 py-2 rounded-full">中止</button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Fight Gong Modal */}
            {
                fightGongState && (
                    <div className={`fixed inset-0 z-[1000] flex items-center justify-center p-4 transition-all duration-300 ${peekDeckSearch ? 'bg-black/10' : 'bg-black/60'}`}>
                        <div className={`bg-white rounded-lg shadow-2xl p-6 max-w-4xl w-full max-h-[90vh] animate-fade-in-up transition-all duration-300 ${peekDeckSearch ? 'opacity-0 pointer-events-none scale-95' : 'opacity-100 overflow-y-auto'}`}>
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-orange-600 flex-1 text-center ml-8">ファイトゴング</h2>
                                <button
                                    onClick={() => setPeekDeckSearch(true)}
                                    className="bg-gray-100 hover:bg-gray-200 p-2 rounded-full text-gray-600 transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </div>
                            <p className="text-gray-600 text-center mb-6 text-sm">山札から闘タイプのたねポケモンまたは基本エネルギーを1枚選んでください。<br />(青い枠のカードが選択可能です)</p>

                            <div className="grid grid-cols-4 md:grid-cols-7 justify-center gap-[5px] mb-8 p-4 bg-gray-50 rounded-inner shadow-inner">
                                {remaining.map((card, i) => {
                                    const isTarget = isPokemon(card) || isEnergy(card)
                                    const isSelected = fightGongState.selectedIndex === i
                                    return (
                                        <div
                                            key={i}
                                            className={`relative cursor-pointer transition-all duration-200 rounded-lg w-fit mx-auto ${isTarget
                                                ? isSelected
                                                    ? 'ring-[6px] ring-orange-500 scale-110 z-10'
                                                    : 'ring-2 ring-blue-400 hover:ring-4 hover:ring-blue-500 hover:scale-105'
                                                : 'opacity-40 grayscale pointer-events-none'
                                                }`}
                                            onClick={() => isTarget && handleFightGongSelect(i)}
                                        >
                                            <Image src={card.imageUrl} alt={card.name} width={85} height={119} className="rounded-lg shadow" unoptimized />
                                            {isSelected && (
                                                <div className="absolute -top-3 -right-3 bg-orange-500 text-white w-7 h-7 rounded-full flex items-center justify-center font-black shadow-lg border-2 border-white z-20 text-xs text-center border">
                                                    ✓
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>

                            <div className="flex justify-center gap-4">
                                <button
                                    onClick={handleFightGongConfirm}
                                    className="bg-orange-500 text-white font-bold px-8 py-2 rounded-full shadow-lg hover:bg-orange-600"
                                >
                                    決定
                                </button>
                                <button onClick={() => setFightGongState(null)} className="bg-gray-200 text-gray-800 font-bold px-8 py-2 rounded-full">中止</button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Rocket's Lambda Modal */}
            {
                lambdaState && (
                    <div className={`fixed inset-0 z-[1000] flex items-center justify-center p-4 transition-all duration-300 ${peekDeckSearch ? 'bg-black/10' : 'bg-black/60'}`}>
                        <div className={`bg-white rounded-lg shadow-2xl p-6 max-w-4xl w-full max-h-[90vh] animate-fade-in-up transition-all duration-300 ${peekDeckSearch ? 'opacity-0 pointer-events-none scale-95' : 'opacity-100 overflow-y-auto'}`}>
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-purple-600 flex-1 text-center ml-8">ロケット団のラムダ</h2>
                                <button
                                    onClick={() => setPeekDeckSearch(true)}
                                    className="bg-gray-100 hover:bg-gray-200 p-2 rounded-full text-gray-600 transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </div>
                            <p className="text-gray-600 text-center mb-6 text-sm">山札からトレーナーズを2枚まで選んでください。<br />(青い枠のカードが選択可能です)</p>

                            <div className="grid grid-cols-4 md:grid-cols-7 justify-center gap-[5px] mb-8 p-4 bg-gray-50 rounded-inner shadow-inner">
                                {lambdaState.candidates.map((card, i) => {
                                    const isSearchTarget = isTrainer(card)
                                    const isSelected = lambdaState.selectedIndex === i
                                    return (
                                        <div
                                            key={i}
                                            className={`relative cursor-pointer transition-all duration-200 rounded-lg w-fit mx-auto ${isSearchTarget
                                                ? isSelected
                                                    ? 'ring-[6px] ring-purple-600 scale-110 z-10'
                                                    : 'ring-2 ring-blue-400 hover:ring-4 hover:ring-blue-500 hover:scale-105'
                                                : 'opacity-40 grayscale pointer-events-none'
                                                }`}
                                            onClick={() => isSearchTarget && handleLambdaSelect(i)}
                                        >
                                            <Image src={card.imageUrl} alt={card.name} width={85} height={119} className="rounded-lg shadow" unoptimized />
                                            {isSelected && (
                                                <div className="absolute -top-3 -right-3 bg-purple-600 text-white w-7 h-7 rounded-full flex items-center justify-center font-black shadow-lg border-2 border-white z-20 text-xs text-center border">
                                                    ✓
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>

                            <div className="flex justify-center gap-4">
                                <button
                                    onClick={handleLambdaConfirm}
                                    className="bg-purple-600 text-white font-bold px-8 py-2 rounded-full shadow-lg hover:bg-purple-700"
                                >
                                    決定
                                </button>
                                <button onClick={() => setLambdaState(null)} className="bg-gray-200 text-gray-800 font-bold px-8 py-2 rounded-full">中止</button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Night Stretcher Modal */}
            {
                nightStretcherState && (
                    <div className={`fixed inset-0 z-[1000] flex items-center justify-center p-4 transition-all duration-300 ${peekDeckSearch ? 'bg-black/10' : 'bg-black/60'}`}>
                        <div className={`bg-white rounded-lg shadow-2xl p-6 max-w-4xl w-full max-h-[90vh] animate-fade-in-up transition-all duration-300 ${peekDeckSearch ? 'opacity-0 pointer-events-none scale-95' : 'opacity-100 overflow-y-auto'}`}>
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-indigo-900 flex-1 text-center ml-8">夜のタンカ</h2>
                                <button
                                    onClick={() => setPeekDeckSearch(true)}
                                    className="bg-gray-100 hover:bg-gray-200 p-2 rounded-full text-gray-600 transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </div>
                            <p className="text-gray-600 text-center mb-6 text-sm">トラッシュからポケモンまたは基本エネルギーを1枚選んでください。<br />(青い枠のカードが選択可能です)</p>

                            <div className="grid grid-cols-4 md:grid-cols-7 justify-center gap-[5px] mb-8 p-4 bg-gray-50 rounded-inner shadow-inner">
                                {nightStretcherState.candidates.map((card, i) => {
                                    const isRecoverTarget = isPokemon(card) || isEnergy(card)
                                    const isSelected = nightStretcherState.selectedIndex === i
                                    return (
                                        <div
                                            key={i}
                                            className={`relative cursor-pointer transition-all duration-200 rounded-lg w-fit mx-auto ${isRecoverTarget
                                                ? isSelected
                                                    ? 'ring-[6px] ring-indigo-900 scale-110 z-10'
                                                    : 'ring-2 ring-blue-400 hover:ring-4 hover:ring-blue-500 hover:scale-105'
                                                : 'opacity-40 grayscale pointer-events-none'
                                                }`}
                                            onClick={() => isRecoverTarget && handleNightStretcherSelect(i)}
                                        >
                                            <Image src={card.imageUrl} alt={card.name} width={85} height={119} className="rounded-lg shadow" unoptimized />
                                            {isSelected && (
                                                <div className="absolute -top-3 -right-3 bg-indigo-900 text-white w-7 h-7 rounded-full flex items-center justify-center font-black shadow-lg border-2 border-white z-20 text-xs text-center border">
                                                    ✓
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>

                            <div className="flex justify-center gap-4">
                                <button
                                    onClick={handleNightStretcherConfirm}
                                    className="bg-indigo-900 text-white font-bold px-8 py-2 rounded-full shadow-lg hover:bg-indigo-800"
                                >
                                    決定
                                </button>
                                <button onClick={() => setNightStretcherState(null)} className="bg-gray-200 text-gray-800 font-bold px-8 py-2 rounded-full">中止</button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Poke Pad Modal */}
            {
                pokePadState && (
                    <div className={`fixed inset-0 z-[1000] flex items-center justify-center p-4 transition-all duration-300 ${peekDeckSearch ? 'bg-black/10' : 'bg-black/60'}`}>
                        <div className={`bg-white rounded-lg shadow-2xl p-6 max-w-4xl w-full max-h-[90vh] animate-fade-in-up transition-all duration-300 ${peekDeckSearch ? 'opacity-0 pointer-events-none scale-95' : 'opacity-100 overflow-y-auto'}`}>
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-blue-600 flex-1 text-center ml-8">ポケパッド</h2>
                                <button
                                    onClick={() => setPeekDeckSearch(true)}
                                    className="bg-gray-100 hover:bg-gray-200 p-2 rounded-full text-gray-600 transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </div>
                            <p className="text-gray-600 text-center mb-6 text-sm">
                                山札からポケモン（「ルールを持つポケモン」をのぞく）を1枚選んでください。<br />
                                (青色の枠のカードが選択可能です)
                            </p>

                            <div className="grid grid-cols-4 md:grid-cols-7 justify-center gap-[5px] mb-8 p-4 bg-gray-50 rounded-inner shadow-inner">
                                {pokePadState.map((card, i) => {
                                    const isSearchTarget = isPokemon(card) && !isRuleBox(card)
                                    return (
                                        <div
                                            key={i}
                                            className={`relative cursor-pointer transition-all duration-200 rounded-lg w-fit mx-auto ${isSearchTarget
                                                ? 'ring-2 ring-blue-400 hover:ring-4 hover:ring-blue-500 hover:scale-105 shadow-[0_0_15px_rgba(59,130,246,0.3)]'
                                                : 'opacity-40 grayscale pointer-events-none'
                                                }`}
                                            onClick={() => isSearchTarget && handlePokePadSelect(i)}
                                        >
                                            <Image src={card.imageUrl} alt={card.name} width={90} height={126} className="rounded-lg shadow" unoptimized />
                                        </div>
                                    )
                                })}
                            </div>

                            <div className="flex justify-center">
                                <button onClick={() => setPokePadState(null)} className="bg-gray-200 text-gray-800 font-bold px-8 py-2 rounded-full">閉じる</button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Teisatsu Shirei Modal */}
            {
                teisatsuCards && (
                    <div className="fixed inset-0 bg-black/50 z-[1000] flex items-center justify-center p-4">
                        <div className="bg-white rounded-lg p-6 max-w-2xl w-full shadow-2xl animate-fade-in-up">
                            <h2 className="text-xl font-bold mb-2 text-center">ていさつしれい</h2>
                            <p className="text-gray-600 text-center mb-6 text-sm">手札に加えるカードを1枚選んでください。<br />（選ばなかったカードは山札の下に戻ります）</p>

                            <div className="flex justify-center gap-6 sm:gap-10">
                                {teisatsuCards.map((card, i) => (
                                    <div
                                        key={i}
                                        className="relative group cursor-pointer hover:scale-105 transition-transform"
                                        onClick={() => handleTeisatsuSelect(i)}
                                    >
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-xs font-bold px-2 py-0.5 rounded shadow z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                                            手札に加える
                                        </div>
                                        <Image
                                            src={card.imageUrl}
                                            alt={card.name}
                                            width={140}
                                            height={196}
                                            className="rounded-lg shadow-lg border-2 border-transparent hover:border-blue-500"
                                            unoptimized
                                        />
                                        <div className="mt-2 text-center text-sm font-bold text-gray-700">{card.name}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Pokegear 3.0 Modal */}
            {
                pokegearCards && (
                    <div className={`fixed inset-0 z-[1000] flex items-center justify-center p-4 transition-all duration-300 ${peekDeckSearch ? 'bg-black/10' : 'bg-black/60'}`}>
                        <div className={`bg-white rounded-lg shadow-2xl p-6 max-w-4xl w-full max-h-[90vh] animate-fade-in-up transition-all duration-300 ${peekDeckSearch ? 'opacity-0 pointer-events-none scale-95' : 'opacity-100 overflow-y-auto'}`}>
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-blue-600 flex-1 text-center ml-8">ポケギア3.0</h2>
                                <button
                                    onClick={() => setPeekDeckSearch(true)}
                                    className="bg-gray-100 hover:bg-gray-200 p-2 rounded-full text-gray-600 transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                                        <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                                    </svg>
                                </button>
                            </div>
                            <p className="text-gray-600 text-center mb-6 text-sm">手札に加えるカードを1枚選んでください。<br />（選ばなかったカードは山札に戻してシャッフルされます）</p>

                            <div className="grid grid-cols-4 md:grid-cols-7 justify-center gap-[5px] mb-8 p-4 bg-gray-50 rounded-inner shadow-inner">
                                {pokegearCards.map((card, i) => (
                                    <div
                                        key={i}
                                        className="relative group cursor-pointer hover:scale-105 transition-transform w-fit mx-auto"
                                        onClick={() => handlePokegearSelect(i)}
                                    >
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow z-10 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                                            手札に加える
                                        </div>
                                        <Image
                                            src={card.imageUrl}
                                            alt={card.name}
                                            width={100}
                                            height={140}
                                            className="rounded-lg shadow-lg border-2 border-transparent hover:border-blue-500"
                                            unoptimized
                                        />
                                        <div className="mt-1 text-center text-[10px] font-bold text-gray-700 truncate w-[100px]">{card.name}</div>
                                    </div>
                                ))}
                            </div>

                            <div className="mt-4 flex justify-center">
                                <button
                                    onClick={handlePokegearCancel}
                                    className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold px-6 py-2 rounded-full shadow-sm"
                                >
                                    加えない (全て戻す)
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Trash Viewer Modal */}
            {
                showTrashViewer && (
                    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowTrashViewer(false)}>
                        <div className="bg-white rounded-lg p-4 max-w-4xl w-full max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
                            <div className="flex justify-between items-center mb-4">
                                <h2 className="text-xl font-bold text-red-600">トラッシュ ({trash.length}枚)</h2>
                                <button onClick={() => setShowTrashViewer(false)} className="bg-gray-200 text-gray-800 px-3 py-1 rounded">閉じる</button>
                            </div>
                            <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 gap-2">
                                {trash.map((card, i) => (
                                    <div key={i} className="relative group cursor-pointer" onClick={(e) => {
                                        const rect = e.currentTarget.getBoundingClientRect()
                                        setTrashCardMenu({
                                            index: i,
                                            x: rect.left,
                                            y: rect.bottom + window.scrollY
                                        })
                                    }}>
                                        <Image
                                            src={card.imageUrl}
                                            alt={card.name}
                                            width={80}
                                            height={112}
                                            className="rounded shadow no-touch-menu no-select no-tap-highlight"
                                            draggable={false}
                                            unoptimized
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )
            }

            {/* Trash Card Menu */}
            {
                trashCardMenu && (
                    <div
                        className="fixed inset-0 z-[100]"
                        onClick={() => setTrashCardMenu(null)}
                    >
                        <div
                            className="absolute bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden flex flex-col min-w-[140px]"
                            style={{
                                top: Math.min(trashCardMenu.y, window.innerHeight - 150),
                                left: Math.min(trashCardMenu.x, window.innerWidth - 150)
                            }}
                            onClick={e => e.stopPropagation()}
                        >
                            <button
                                onClick={() => moveFromTrashToHand(trashCardMenu.index)}
                                className="px-4 py-3 hover:bg-gray-100 text-left text-sm font-bold border-b border-gray-100 text-black"
                            >手札に加える</button>
                            <button
                                onClick={() => moveFromTrashToDeck(trashCardMenu.index)}
                                className="px-4 py-3 hover:bg-gray-100 text-left text-sm font-bold border-b border-gray-100 text-black"
                            >山札に戻す</button>
                            {isEnergy(trash[trashCardMenu.index]) && (
                                <button
                                    onClick={() => startAttachFromTrash(trashCardMenu.index)}
                                    className="px-4 py-3 hover:bg-green-50 text-green-700 text-left text-sm font-black"
                                >ポケモンにつける</button>
                            )}
                        </div>
                    </div>
                )
            }


            {/* Drag Overlay */}
            <DragOverlay dropAnimation={null}>
                {activeDragId ? (
                    <div className="w-[100px] h-[140px] rounded-lg shadow-2xl overflow-hidden ring-2 ring-yellow-400 opacity-90 pointer-events-none transform scale-110">
                        {(() => {
                            const findCardImage = () => {
                                // Search hand
                                if (activeDragId && activeDragId.startsWith(`${idPrefix}-hand-card-`)) {
                                    const index = parseInt(activeDragId.replace(`${idPrefix}-hand-card-`, ''))
                                    const handCard = hand[index]
                                    if (handCard) return handCard.imageUrl
                                }

                                // Search Battle
                                if (activeDragId === `${idPrefix}-battle-card` && battleField) {
                                    let topPokemonIndex = -1
                                    for (let i = battleField.cards.length - 1; i >= 0; i--) {
                                        if (isPokemon(battleField.cards[i])) {
                                            topPokemonIndex = i
                                            break
                                        }
                                    }
                                    if (topPokemonIndex === -1 && battleField.cards.length > 0) topPokemonIndex = 0
                                    return battleField.cards[topPokemonIndex]?.imageUrl
                                }

                                // Search Bench
                                if (activeDragId && activeDragId.startsWith(`${idPrefix}-bench-card-`)) {
                                    const index = parseInt(activeDragId.replace(`${idPrefix}-bench-card-`, ''))
                                    const stack = bench[index]
                                    if (stack) {
                                        let topPokemonIndex = -1
                                        for (let i = stack.cards.length - 1; i >= 0; i--) {
                                            if (isPokemon(stack.cards[i])) {
                                                topPokemonIndex = i
                                                break
                                            }
                                        }
                                        if (topPokemonIndex === -1 && stack.cards.length > 0) topPokemonIndex = 0
                                        return stack.cards[topPokemonIndex]?.imageUrl
                                    }
                                }
                                return null
                            }
                            const imgUrl = findCardImage()
                            if (imgUrl) return <Image src={imgUrl} alt="dragging" fill className="object-cover" unoptimized />
                            return <div className="bg-blue-900 w-full h-full border-2 border-white" />
                        })()}
                    </div>
                ) : null}
            </DragOverlay>

            {/* Peek Restoration Layer */}
            {peekDeckSearch && (
                <div
                    className="fixed inset-0 z-[2000] cursor-pointer group"
                    onClick={() => setPeekDeckSearch(false)}
                >
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-black/60 text-white px-8 py-4 rounded-full font-bold shadow-2xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        </svg>
                        タップして戻る
                    </div>
                </div>
            )}



        </>
    )
}
