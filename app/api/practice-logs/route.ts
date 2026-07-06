import { NextRequest, NextResponse } from 'next/server'
import { FieldValue } from 'firebase-admin/firestore'
import { getFirebaseBucket, getFirebaseDb, practiceOwnerId } from '@/lib/firebase/admin'

const safeId = (value: string) => value.replace(/[^a-zA-Z0-9_-]/g, '-').slice(0, 80)

export async function POST(request: NextRequest) {
    const db = getFirebaseDb()
    const bucket = getFirebaseBucket()
    if (!db || !bucket) {
        return NextResponse.json({
            ok: false,
            configured: false,
            error: 'Firebase Admin or Storage bucket is not configured',
        }, { status: 503 })
    }

    const body = await request.json().catch(() => ({})) as Record<string, unknown>
    const ownerId = practiceOwnerId()
    const now = new Date()
    const logId = safeId(typeof body.logId === 'string' ? body.logId : `${now.getTime()}`)
    const matchType = safeId(typeof body.matchType === 'string' ? body.matchType : 'practice')
    const objectPath = `practice-logs/${ownerId}/${matchType}/${now.toISOString().slice(0, 10)}/${logId}.json`
    const payload = {
        ...body,
        ownerId,
        receivedAt: now.toISOString(),
    }

    await bucket.file(objectPath).save(JSON.stringify(payload, null, 2), {
        contentType: 'application/json; charset=utf-8',
        resumable: false,
    })

    await db.collection('practiceUsers').doc(ownerId).collection('practiceLogIndex').doc(logId).set({
        logId,
        matchType,
        objectPath,
        createdAt: FieldValue.serverTimestamp(),
        humanDeckName: typeof body.humanDeckName === 'string' ? body.humanDeckName.slice(0, 120) : null,
        cpuDeckName: typeof body.cpuDeckName === 'string' ? body.cpuDeckName.slice(0, 120) : null,
        result: typeof body.result === 'string' ? body.result.slice(0, 120) : null,
    }, { merge: true })

    return NextResponse.json({
        ok: true,
        configured: true,
        logId,
        objectPath,
    })
}
