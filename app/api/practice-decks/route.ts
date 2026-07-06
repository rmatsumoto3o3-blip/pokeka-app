import { NextRequest, NextResponse } from 'next/server'
import { FieldValue } from 'firebase-admin/firestore'
import { getFirebaseDb, practiceOwnerId } from '@/lib/firebase/admin'

type SavedPracticeDeckLine = {
    cardId: number
    quantity: number
}

type SavedPracticeDeck = {
    id: string
    name: string
    cards: SavedPracticeDeckLine[]
    createdAt: string
    updatedAt: string
}

const sanitizeDecks = (value: unknown): SavedPracticeDeck[] => {
    if (!Array.isArray(value)) return []

    return value.flatMap(item => {
        if (!item || typeof item !== 'object') return []
        const record = item as Record<string, unknown>
        const cards = Array.isArray(record.cards)
            ? record.cards.flatMap(line => {
                if (!line || typeof line !== 'object') return []
                const cardLine = line as Record<string, unknown>
                const cardId = Number(cardLine.cardId)
                const quantity = Number(cardLine.quantity)
                if (!Number.isInteger(cardId) || !Number.isInteger(quantity)) return []
                if (cardId <= 0 || quantity <= 0 || quantity > 60) return []
                return [{ cardId, quantity }]
            })
            : []

        const total = cards.reduce((sum, line) => sum + line.quantity, 0)
        if (!record.id || !record.name || cards.length === 0 || total !== 60) return []

        return [{
            id: String(record.id).slice(0, 120),
            name: String(record.name).slice(0, 120),
            cards,
            createdAt: typeof record.createdAt === 'string' ? record.createdAt : new Date().toISOString(),
            updatedAt: typeof record.updatedAt === 'string' ? record.updatedAt : new Date().toISOString(),
        }]
    })
}

const deckStoreRef = () => {
    const db = getFirebaseDb()
    if (!db) return null
    return db.collection('practiceUsers').doc(practiceOwnerId()).collection('stores').doc('practiceDecks')
}

export async function GET() {
    const ref = deckStoreRef()
    if (!ref) {
        return NextResponse.json({
            ok: false,
            configured: false,
            decks: [],
            error: 'Firebase Admin is not configured',
        }, { status: 503 })
    }

    const snapshot = await ref.get()
    const data = snapshot.exists ? snapshot.data() : null
    return NextResponse.json({
        ok: true,
        configured: true,
        decks: sanitizeDecks(data?.decks),
        updatedAt: data?.updatedAt ?? null,
    })
}

export async function POST(request: NextRequest) {
    const ref = deckStoreRef()
    if (!ref) {
        return NextResponse.json({
            ok: false,
            configured: false,
            error: 'Firebase Admin is not configured',
        }, { status: 503 })
    }

    const body = await request.json().catch(() => ({}))
    const decks = sanitizeDecks((body as Record<string, unknown>).decks)

    await ref.set({
        decks,
        updatedAt: FieldValue.serverTimestamp(),
    }, { merge: true })

    return NextResponse.json({
        ok: true,
        configured: true,
        count: decks.length,
    })
}
