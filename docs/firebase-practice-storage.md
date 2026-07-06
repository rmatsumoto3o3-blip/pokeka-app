# Firebase Practice Storage

This project keeps Supabase for the existing app data and uses Firebase only for the practice tool's heavier data.

## What Is Stored

- Firestore: saved practice decks
  - Path: `practiceUsers/{PRACTICE_FIREBASE_OWNER_ID}/stores/practiceDecks`
- Cloud Storage: practice battle logs
  - Path: `practice-logs/{PRACTICE_FIREBASE_OWNER_ID}/{matchType}/{yyyy-mm-dd}/{logId}.json`
- Firestore: log index
  - Path: `practiceUsers/{PRACTICE_FIREBASE_OWNER_ID}/practiceLogIndex/{logId}`

## Required `.env.local`

Do not commit real credentials.

```env
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_STORAGE_BUCKET=
PRACTICE_FIREBASE_OWNER_ID=nexpure-private

# Local/private CPU battle switch. Keep this unset in public production.
NEXT_PUBLIC_ENABLE_CPU_BATTLE=1
CABT_BRIDGE_URL=http://127.0.0.1:8765
```

## Behavior

- If Firebase Admin is configured, `/practice` syncs saved decks to Firebase.
- If Firebase Admin is not configured, `/practice` keeps working with browser `localStorage`.
- Battle log upload is prepared at `POST /api/practice-logs`, but the UI does not yet call it automatically.
- CPU battle UI and `/api/local-cabt` are disabled unless `NEXT_PUBLIC_ENABLE_CPU_BATTLE=1`.

## Review Notes

- Do not move AI decision logic into frontend code.
- Keep CPU battle hidden or disabled in public production.
- Use Firebase for practice logs/decks only, so Supabase storage pressure does not increase.
