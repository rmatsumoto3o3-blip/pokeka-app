# Firebase Practice Storage

This project keeps Supabase for the existing app data and uses Firebase only for the practice tool's heavier data.

## What Is Stored

- Firestore: saved practice decks
  - Path: `practiceUsers/{PRACTICE_FIREBASE_OWNER_ID}/stores/practiceDecks`
- Firestore: practice battle logs
  - Path: `practiceUsers/{PRACTICE_FIREBASE_OWNER_ID}/practiceLogs/{logId}`

## Required `.env.local`

Do not commit real credentials.

```env
FIREBASE_PROJECT_ID=
FIREBASE_CLIENT_EMAIL=
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
PRACTICE_FIREBASE_OWNER_ID=nexpure-private

# Local/private CPU battle switch. Keep this unset in public production.
NEXT_PUBLIC_ENABLE_CPU_BATTLE=1
CABT_BRIDGE_URL=http://127.0.0.1:8765

# Optional. Required when the cabt bridge is exposed through Cloud Run.
CABT_BRIDGE_TOKEN=
```

## Behavior

- If Firebase Admin is configured, `/practice` syncs saved decks to Firebase.
- If Firebase Admin is not configured, `/practice` keeps working with browser `localStorage`.
- Battle log upload is prepared at `POST /api/practice-logs`, but the UI does not yet call it automatically.
- Practice logs are stored in Firestore only. Cloud Storage is not required.
- CPU battle UI and `/api/local-cabt` are disabled unless `NEXT_PUBLIC_ENABLE_CPU_BATTLE=1`.
- Firebase stores data only. The CPU engine itself runs in `ptcgabc` locally or on a server such as Cloud Run.
- For public/remote CPU battle, point `CABT_BRIDGE_URL` to the Cloud Run URL and set `CABT_BRIDGE_TOKEN` only on the server.

## Review Notes

- Do not move AI decision logic into frontend code.
- Keep CPU battle hidden or disabled in public production.
- Do not put CPU engine code or private AI logic in frontend bundles or Firestore documents.
- Use Firebase for practice logs/decks only, so Supabase storage pressure does not increase.
