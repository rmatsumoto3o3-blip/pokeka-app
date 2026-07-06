# Firebase Setup Checklist for PokeLix Practice

Use Firebase only for practice decks and practice logs. Keep Supabase as the main app database and auth source.

## 1. Create Firebase Project

1. Open Firebase Console.
2. Create a project for practice data, for example `pokelix-practice`.
3. Disable Google Analytics if you do not need it.

## 2. Enable Firestore

1. Go to Firestore Database.
2. Create database.
3. Start in production mode.
4. Choose the nearest region.

The app writes through Firebase Admin SDK, so client-side Firestore rules are not used by the current API.

## 3. Create Service Account Key

1. Firebase Console > Project settings > Service accounts.
2. Generate new private key.
3. Download the JSON file.
4. Copy these fields into `.env.local`:

```env
FIREBASE_PROJECT_ID=project_id
FIREBASE_CLIENT_EMAIL=client_email
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
PRACTICE_FIREBASE_OWNER_ID=nexpure-private
```

Keep this file private. It is already ignored by git.

## 4. Local CPU Battle

Only add this locally when you want CPU battle:

```env
NEXT_PUBLIC_ENABLE_CPU_BATTLE=1
CABT_BRIDGE_URL=http://127.0.0.1:8765
```

Do not set `NEXT_PUBLIC_ENABLE_CPU_BATTLE` in public production unless you intentionally want the CPU route visible.

## 5. Confirm Connection

Start Next.js and check:

```bash
curl -s http://localhost:3200/api/practice-firebase-health
curl -s http://localhost:3200/api/practice-decks
```

Expected health response after env setup:

```json
{
  "configured": true,
  "requiredEnv": {
    "FIREBASE_PROJECT_ID": true,
    "FIREBASE_CLIENT_EMAIL": true,
    "FIREBASE_PRIVATE_KEY": true
  }
}
```

## 6. Data Paths

Saved decks:

```text
practiceUsers/{PRACTICE_FIREBASE_OWNER_ID}/stores/practiceDecks
```

Battle logs:

```text
practiceUsers/{PRACTICE_FIREBASE_OWNER_ID}/practiceLogs/{logId}
```

## 7. Next Implementation Step

After Firebase connection succeeds:

1. Add anonymous practice ID for non-login users.
2. Replace fixed `PRACTICE_FIREBASE_OWNER_ID` with Supabase user ID or anonymous practice ID.
3. Hook CPU/human battle completion to `POST /api/practice-logs`.
4. Add deck JSON import/export buttons.
