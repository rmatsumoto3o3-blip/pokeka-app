# Codex 作業指示書：海外大会データ集計画面 & SEO CSVレポート

> 対象リポジトリ: `rmatsumoto3o3-blip/pokeka-app`（PokéLix）
> 作成日: 2026-07-15
> このドキュメント単体で作業を始められるように書いてある。着手前に必ず全文を読むこと。

---

## 0. 共通の前提とルール（両タスク共通）

### 技術スタック（既存）
- **Next.js 16（App Router）** + **React 19** + **TypeScript**
- **Supabase**（PostgreSQL / Auth / Storage / RLS）… `@supabase/supabase-js`, `@supabase/ssr`
- **Tailwind CSS v4**
- **Recharts**（グラフ）
- データ収集は **Google Apps Script（GAS）** が担当（サイトは収集しない）
- ホスティングは **Vercel**（`main` へpushで自動デプロイ）

### アーキテクチャの鉄則（既存サイトと必ず揃える）
1. **「GASが1日1回スクレイピング → Supabaseに蓄積 → サイトはDBを読むだけ」**。ページ表示時に外部サイトへアクセスしない。
2. **重いクエリは必ずキャッシュする**。過去に、TOPページが毎リクエストで1000行(≈269KB)を無キャッシュ取得し、Supabaseのcached egressが無料枠5GBを超過(6.3GB)した事故がある。集計・一覧は `unstable_cache`（revalidate 3600〜86400）＋ページの `export const revalidate` を使い、DBアクセスを間引くこと。
3. **画像はSupabaseに複製しすぎない**。安定した公式CDNにある画像はURL直リンク。消えるリスクが高い画像だけStorageに保存する（判断基準は下記「ユニアリの前例」参照）。
4. **RLS必須**。公開テーブルは anon に `SELECT` のみ。書き込みは service role（GAS / サーバー側）だけ。

### 絶対に触らない・壊さないもの
- **秘密情報**：`SUPABASE_SERVICE_ROLE_KEY`、各種APIキー、`.env.local` を**コード・ログ・ドキュメント・Git・スクショに絶対書かない/コミットしない**。
- **既存の国内ポケカ、ユニオンアリーナ、それらのSupabaseテーブル**を壊さない。海外データは**専用テーブル・専用ルート**で分離する。
- Googleアカウント、GASのトリガー、Supabaseのプラン/設定を、ユーザーの明示指示なしに変更しない。

### ブランチ運用
- 作業用ブランチを切る（例 `feat/overseas-screen`, `feat/seo-report`）。`main` へ直接pushしない。
- 変更ごとに `npx tsc --noEmit --skipLibCheck` を通す。
- 動作確認は `npm run dev`（ポート3200）でローカル起動して行う。

---

## タスクA：海外大会データの「集計画面」と「仕組み」の作成

### A-0. 既存資料（必読）
- **`docs/overseas-data-collection-plan.md`** … 収集面（Limitless Play API、Google Sheets構成、GAS関数、正規化ルール、Supabase候補テーブル、Phase設計）が**すでに詳細に設計済み**。本タスクはその計画の **Phase 2（画面接続）と Phase 4（集計・監視）** を実装する位置づけ。計画と矛盾する設計は作らないこと。

### A-1. 最重要：ユニオンアリーナ実装を「完成済みテンプレート」として流用する
海外環境は、**ユニアリ（unionarena）機能とほぼ同じ構造**で作れる。まずユニアリの実装を読んで、同じパターンを海外向けに複製すること。

参照すべきユニアリの実物：
| 役割 | ユニアリの実装 | 海外で作るもの |
| --- | --- | --- |
| TOPページ | `app/unionarena/page.tsx` + `components/UnionArenaLandingPage.tsx` | `/overseas` TOP |
| デッキ一覧 | `app/unionarena/decks/page.tsx` | 海外デッキ一覧（地域/大会/順位フィルタ付き） |
| デッキ詳細（60枚表示） | `app/unionarena/decks/[id]/page.tsx` + `components/UnionArenaDeckCardGrid.tsx` | 海外デッキ詳細（英語名のまま60枚＋カード拡大） |
| サーバーアクション | `app/actions.ts` の `getUnionArena*Action` 群 | `getOverseas*Action` 群 |
| ヘッダーのゲーム切替 | `components/PublicHeader.tsx` の `game` prop | 「国内 / 海外」切替を追加 |
| GAS収集 | `gas/unionarena_scraper.gs` | 既存の海外GAS（計画書のプロジェクト）を使う |
| カード構成の永続化 | `card_list` JSONB列にカード構成を保存し、詳細ページはDBから読む | 同方式（`overseas_deck_cards` かJSONB） |

### A-2. Supabaseテーブル（計画書の候補構成に従う）
`docs/overseas-data-collection-plan.md` の「Supabase候補構成」に記載の以下を作る（migrationファイルは `supabase/` に置く。**適用はユーザー承認後**）：
- `overseas_tournaments` / `overseas_archetypes` / `overseas_results` / `overseas_deck_cards` / `overseas_archetype_stats` / `overseas_collection_runs`
- 一意制約・インデックス・RLSは計画書の指定通り。

### A-3. 画面に必要な集計（Phase 4 相当）
国内ポケカと同じ情報階層で見せる：
- **環境シェア（地域・期間・フォーマット別のデッキタイプ分布）** → `overseas_archetype_stats` に**事前集計**（GAS or サーバーバッチ）。画面はアクセスのたびに全結果を集計しない。
- **大会一覧 / デッキ一覧 / デッキ詳細（英語名のまま60枚）**。
- 国内との切替UI（「国内環境 / 海外環境」）。国内表示は一切変更しない。

### A-4. キャッシュ・負荷（egress事故を繰り返さない）
- 一覧・集計ページ：`export const revalidate = 3600`〜`86400`、重い集計は `unstable_cache`。
- 詳細ページ：`revalidate = 3600`。カード60枚はDB（保存済み構成）から読む。外部APIへは行かない。
- 画像はURL保存（TCGdex等）。Storage複製は原則しない。

### A-5. やらないこと（計画書の「現時点で実行しないこと」を厳守）
- ユーザー承認前の **Supabase migration適用・本番書き込み・Vercel環境変数変更・定期実行(cron/GAS trigger)** はしない。
- まずは **モック or dry-runデータでUIを組み、DB接続はユーザー承認後**に切り替える（計画書 Phase 2）。

### A-6. タスクAの完了条件
- `/overseas` のTOP・一覧・詳細が、ユニアリと同じ操作感で表示できる（英語カード名のまま）。
- 環境シェアは事前集計テーブルから読む（毎回全件計算しない）。
- 国内ポケカ・ユニアリの表示と挙動が一切変わっていない。
- ページ表示時に外部サイト/Sheetsへアクセスしない。型チェック通過。

---

## タスクB：SEO対策 — Search Console CSVからのレポート作成

### B-0. 背景・入力データ
Google Search Console の「検索パフォーマンス」エクスポート（ZIP内の複数CSV）を入力とする。ユーザーが手元に持っているファイル群の構成：

| ファイル | 列 |
| --- | --- |
| `クエリ.csv` | 上位のクエリ, クリック数, 表示回数, CTR, 掲載順位 |
| `ページ.csv` | 上位のページ, クリック数, 表示回数, CTR, 掲載順位 |
| `デバイス.csv` | デバイス, クリック数, 表示回数, CTR, 掲載順位 |
| `国.csv` | 国, クリック数, 表示回数, CTR, 掲載順位 |
| `検索での見え方.csv` | （空のことがある） |
| `フィルタ.csv` | 検索タイプ, 日付（期間メタ情報） |
| `平均読み込み時間のチャート.csv` | 期間, クリック数, 表示回数, CTR, 掲載順位（日次トレンド） |

英語UI版だと列名が `Top queries, Clicks, Impressions, CTR, Position` などになる。**日本語・英語どちらのヘッダーでも動く**ようにすること。

### B-1. 作るもの
CSV群を読み込み、**SEOレポート（分析結果）を生成する仕組み**。以下いずれかの形で実装（推奨は管理画面）：

- **推奨: 管理画面ページ**（`/admin` 配下、既存の管理者判定を流用）にCSVアップロードUIを付け、その場で集計・可視化する。
  - 既存の管理者判定・管理画面の作りは `app/admin/` 配下と `app/actions.ts` の `verifyAdminSession` を参照。
  - CSVパースはブラウザ内（クライアント）で完結させれば、Supabase負荷ゼロ・データを外部に送らない。
- または **スタンドアロンのNodeスクリプト**（`scripts/seo-report.mjs` など）で、CSVフォルダを入力にMarkdown/HTMLレポートを出力。

### B-2. レポートに出すべき洞察（最低限）
1. **サマリー**：合計クリック/表示、平均CTR、平均掲載順位、期間。日次トレンド（`平均読み込み時間のチャート.csv`）。
2. **主要流入クエリ**：クリック上位。
3. **改善余地の大きいクエリ**（重要）：
   - **表示回数は多いのにCTRが低い**（＝上位表示なのにクリックされない → タイトル/ディスクリプション改善候補）。
   - **掲載順位が11位前後**（＝2ページ目。あと少しで1ページ目 → コンテンツ強化候補）。
   - **CTRが高いのに表示回数が少ない**（＝刺さっているが露出不足 → 関連語の強化候補）。
4. **ページ別**：どのページが稼いでいるか（例：`/practice` が主力、`/simulator` は伸びしろ 等）。
5. **デバイス別 / 国別**の傾向。
6. **表記ゆれ・誤字クエリの取り込み状況**（例「シュミレーター」等の誤字流入）。

> 参考：過去分析では `/practice`（一人回し）が全クリックの過半を占める主力、TOPと`/simulator`はimpressionはあるがCTR/順位に改善余地、という結論だった。同種の「稼ぎ頭 / 伸びしろ」を自動で出せると良い。

### B-3. 実装上の注意
- CSVの数値は文字列で入る（`8.87%`, `3.84` 等）。CTRの`%`除去、順位・数値の parseFloat を丁寧に。
- 文字コード：Search ConsoleのCSVはUTF-8（BOM付きのことあり）。BOMを除去する。
- 日本語/英語ヘッダー両対応（列名マッピングを持つ）。
- 個人情報は含まれない（クエリと集計のみ）が、アップロードしたCSVを外部送信しない（クライアント内処理 or ローカルスクリプト）。

### B-4. タスクBの完了条件
- CSV一式を渡すと、上記の洞察を含むレポートが表示/出力される。
- 日本語・英語どちらのヘッダーのCSVでも動く。
- Supabaseや外部APIにデータを送らない。型チェック通過。

---

## 納品時の確認（両タスク共通）
1. 作業ブランチでコミット、PR作成（`main`直pushしない）。
2. `npx tsc --noEmit --skipLibCheck` がエラー0。
3. `npm run dev` で該当画面をローカル表示し、動作を確認（スクショ/手順を添える）。
4. 国内ポケカ・ユニアリの既存挙動に影響がないことを確認。
5. 秘密情報がコミットに含まれていないことを確認。
