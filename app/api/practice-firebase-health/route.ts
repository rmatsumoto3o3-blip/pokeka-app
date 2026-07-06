import { NextResponse } from 'next/server'
import { isFirebaseAdminConfigured, practiceOwnerId } from '@/lib/firebase/admin'

export async function GET() {
    const requiredEnv = {
        FIREBASE_PROJECT_ID: Boolean(process.env.FIREBASE_PROJECT_ID),
        FIREBASE_CLIENT_EMAIL: Boolean(process.env.FIREBASE_CLIENT_EMAIL),
        FIREBASE_PRIVATE_KEY: Boolean(process.env.FIREBASE_PRIVATE_KEY),
    }

    return NextResponse.json({
        ok: true,
        configured: isFirebaseAdminConfigured(),
        ownerId: practiceOwnerId(),
        requiredEnv,
        cpuBattleEnabled: process.env.NEXT_PUBLIC_ENABLE_CPU_BATTLE === '1',
    })
}
