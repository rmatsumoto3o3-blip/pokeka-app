import { cert, getApps, initializeApp, type App } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { getStorage } from 'firebase-admin/storage'

type FirebaseAdminConfig = {
    projectId: string
    clientEmail: string
    privateKey: string
    storageBucket?: string
}

const normalizePrivateKey = (value: string) => value.replace(/\\n/g, '\n')

const readConfig = (): FirebaseAdminConfig | null => {
    const projectId = process.env.FIREBASE_PROJECT_ID
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL
    const privateKey = process.env.FIREBASE_PRIVATE_KEY

    if (!projectId || !clientEmail || !privateKey) return null

    return {
        projectId,
        clientEmail,
        privateKey: normalizePrivateKey(privateKey),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    }
}

export const isFirebaseAdminConfigured = () => readConfig() !== null

export const getFirebaseAdminApp = (): App | null => {
    const config = readConfig()
    if (!config) return null

    const existing = getApps()[0]
    if (existing) return existing

    return initializeApp({
        credential: cert({
            projectId: config.projectId,
            clientEmail: config.clientEmail,
            privateKey: config.privateKey,
        }),
        storageBucket: config.storageBucket,
    })
}

export const getFirebaseDb = () => {
    const app = getFirebaseAdminApp()
    return app ? getFirestore(app) : null
}

export const getFirebaseBucket = () => {
    const app = getFirebaseAdminApp()
    if (!app || !process.env.FIREBASE_STORAGE_BUCKET) return null
    return getStorage(app).bucket()
}

export const practiceOwnerId = () => {
    return process.env.PRACTICE_FIREBASE_OWNER_ID || 'local-owner'
}
