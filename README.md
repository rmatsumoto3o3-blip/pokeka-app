# ポケカ戦績記録アプリ

3名程度の小規模利用を想定した、ポケモンカードゲームの戦績を記録・管理するWebアプリケーションです。

## 技術スタック

- **フロントエンド**: Next.js 16 (React 19) + TypeScript
- **スタイリング**: Tailwind CSS
- **バックエンド/DB**: Supabase (PostgreSQL)
- **認証**: Supabase Authentication
- **ストレージ**: Supabase Storage
- **ホスティング**: Vercel

## セットアップ手順

### 1. 依存関係のインストール

```bash
npm install
```

### 2. Supabaseプロジェクトの設定

1. [Supabase](https://supabase.com)でプロジェクトを作成
2. プロジェクトのURLとAnon Keyを取得
3. `.env.local`ファイルを作成し、以下の環境変数を設定:

```env
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### 3. データベーススキーマの作成

Supabaseのダッシュボード > SQL Editorで、`supabase/schema.sql`のSQLを実行してください。

### 4. ストレージバケットの作成

Supabaseのダッシュボード > Storageで、`deck-images`という名前のバケットを作成してください。
- Public bucketとして作成
- Allowed MIME types: `image/*`

### 5. 開発サーバーの起動

```bash
npm run dev
```

アプリは http://localhost:3200 で起動します。

## 主な機能

- ユーザー認証(メール/パスワード)
- デッキ登録(デッキコード、名前、画像)
- 試合結果の記録(勝敗、対戦相手、メモ)
- 戦績の集計・表示(勝率、総試合数など)

## デプロイ

Vercelへのデプロイ:

```bash
vercel
```

環境変数を忘れずに設定してください。
