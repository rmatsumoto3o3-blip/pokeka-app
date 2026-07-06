import { NextRequest, NextResponse } from 'next/server'
import { FieldValue } from 'firebase-admin/firestore'
import { getFirebaseDb, practiceOwnerId } from '@/lib/firebase/admin'

const safeId = (value: string) => value.replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 80)
const MAX_FIRESTORE_LOG_BYTES = 900_000

export async function POST(request: NextRequest) {
    const db = getFirebaseDb()
    if (!db) {
        return NextResponse.json({
            ok: false,
            configured: false,
            error: 'Firebase Admin is not configured',
        }, { status: 503 })
    }

    const body = await request.json().catch(() => ({})) as Record<string, unknown>
    const ownerId = practiceOwnerId()
    const now = new Date()
    const logId = safeId(typeof body.logId === 'string' ? body.logId : `${now.getTime()}`)
    const matchType = safeId(typeof body.matchType === 'string' ? body.matchType : 'practice')
    const payload = {
        ...body,
        ownerId,
        receivedAt: now.toISOString(),
    }
    const payloadBytes = Buffer.byteLength(JSON.stringify(payload), 'utf8')

    if (payloadBytes > MAX_FIRESTORE_LOG_BYTES) {
        return NextResponse.json({
            ok: false,
            configured: true,
            error: 'Practice log is too large for Firestore-only storage',
            maxBytes: MAX_FIRESTORE_LOG_BYTES,
            payloadBytes,
        }, { status: 413 })
    }

    await db.collection('practiceUsers').doc(ownerId).collection('practiceLogs').doc(logId).set({
        ...payload,
        logId,
        matchType,
        payloadBytes,
        createdAt: FieldValue.serverTimestamp(),
        humanDeckName: typeof body.humanDeckName === 'string' ? body.humanDeckName.slice(0, 120) : null,
        cpuDeckName: typeof body.cpuDeckName === 'string' ? body.cpuDeckName.slice(0, 120) : null,
        result: typeof body.result === 'string' ? body.result.slice(0, 120) : null,
    }, { merge: true })

    return NextResponse.json({
        ok: true,
        configured: true,
        logId,
        payloadBytes,
    })
}
