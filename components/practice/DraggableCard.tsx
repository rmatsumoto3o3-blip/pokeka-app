'use client'

import { useDraggable, useDroppable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'

export interface CardWithMetadata {
    playerPrefix: string
    type: string
    index: number
    card: unknown
}

export function DraggableCard({ id, data, children, className = "", onClick }: { id: string, data: CardWithMetadata, children: React.ReactNode, className?: string, onClick?: (e: React.MouseEvent) => void }) {
    const { attributes, listeners, setNodeRef: setDraggableRef, transform, isDragging } = useDraggable({
        id,
        data,
    })

    const { setNodeRef: setDroppableRef, isOver } = useDroppable({
        id,
    })

    const style = {
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0 : undefined,
        zIndex: isDragging ? 5000 : undefined,
        scale: isDragging ? '1.05' : '1',
    }

    return (
        <div
            ref={(node) => {
                setDraggableRef(node)
                setDroppableRef(node)
            }}
            style={style}
            {...listeners}
            {...attributes}
            className={`relative group inline-block cursor-grab active:cursor-grabbing select-none no-touch-menu no-select no-tap-highlight touch-none ${className} ${isOver ? 'ring-4 ring-red-400 rounded-lg' : ''}`}
            onClick={onClick}
        >
            {children}
        </div>
    )
}

export function DroppableZone({ id, children, className = "", style = {}, onClick }: { id: string, children: React.ReactNode, className?: string, style?: React.CSSProperties, onClick?: (e: React.MouseEvent) => void }) {
    const { isOver, setNodeRef } = useDroppable({
        id,
    })

    return (
        <div
            ref={setNodeRef}
            className={`${className} ${isOver ? 'ring-4 ring-blue-300 bg-blue-50/50' : ''} transition-all`}
            style={style}
            onClick={onClick}
        >
            {children}
        </div>
    )
}
