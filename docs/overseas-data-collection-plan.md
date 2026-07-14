# 海外大会データ収集計画

> 更新日: 2026-07-14
> 状態: 収集APIの接続確認まで完了。Google Sheetsへの書き込み、Supabase migration、本番表示は未実施。

## 別PCへの引継ぎ情報

### 作業範囲

この計画はPokeLix / `pokeka-app` の海外大会データ機能専用とする。Kaggle、PTCGABC、CPU対戦、AI対戦、仮想対戦ログには触れない。

### 既存リソース

- GitHub: <https://github.com/rmatsumoto3o3-blip/pokeka-app>
- Google Sheets: <https://docs.google.com/spreadsheets/d/1WUN1Z2sPsa3QZEf1rNzdRwf8wWfkjSg-4u9si9Xyt48/edit>
- Spreadsheet ID: `1WUN1Z2sPsa3QZEf1rNzdRwf8wWfkjSg-4u9si9Xyt48`
- Apps Script: <https://script.google.com/home/projects/14U4XFFoJu94YmRQ67MWXzODLMoZz3hG_51GGbnRIr1HGdHB4KWzcqb9L/edit>
- Apps Script Project ID: `14U4XFFoJu94YmRQ67MWXzODLMoZz3hG_51GGbnRIr1HGdHB4KWzcqb9L`
- Supabase project URL: `https://ovsqbhtxulnoekugwtxh.supabase.co`

Spreadsheet IDとApps Script Project IDは別物なので取り違えない。Googleアカウント、共有設定、トリガー、Supabase設定は、ユーザーの明示指示なしに変更しない。

### 現在のGAS安全設定

Apps Scriptのスクリプトプロパティは、検証中は次の状態を維持する。

| プロパティ | 値 / 意味 |
| --- | --- |
| `SPREADSHEET_ID` | 上記Google SheetsのID |
| `DRY_RUN` | `true` |
| `WRITE_SHEETS` | `false` |
| `TOURNAMENT_LIMIT` | `3` |
| `TOP_N` | `16` |
| `REFRESH_EXISTING` | `false` |
| `LIMITLESS_TOURNAMENT_ID` | 最初は空欄。対象大会を1件選んだ後に設定 |
| `LIMITLESS_ACCESS_KEY` | 通常は空欄。大会APIの基本取得には不要 |

`SUPABASE_SERVICE_ROLE_KEY`は秘密情報である。値を計画書、コード、ログ、GitHub、スクリーンショットに記載しない。過去に露出した可能性があるため、本番同期開始前にローテーションする。

### 確認済みの実行結果

2026-07-14に `collectorCheck()` を実行し、Limitless Play APIからHTTP 200でPTCG大会を1件取得できた。この確認ではSheetsとSupabaseへの書き込みは発生していない。

次の担当者は、いきなり自動化やSupabase同期を行わず、本文の「再開手順」から始める。

## 目的

海外のポケモンカード大会結果をPokeLixへ追加し、日本国内の環境データと同じ操作感・表示形式で閲覧できるようにする。

- 大会、順位、デッキタイプ、デッキリストを共通形式へ正規化する。
- 海外データの原文は英語を正とし、日本語名は対応を確認できた項目だけ任意で追加する。
- Web画面を開くたびに外部サイトへアクセスせず、定期収集した結果をSupabaseから読む。
- 既存の国内ポケカ、ユニオンアリーナ、Supabaseテーブルへ干渉しない。

## データソース方針

### 1. 大規模な海外公式大会

`limitlesstcg.com/tournaments` に掲載されるRegional Championships、International Championshipsなどを主対象とする。

この大会データベース向けの公開APIは確認できていないため、自動取得を始める前に利用条件と取得許可を確認する。許可確認前は、Google SheetsまたはCSVへ必要項目を入力し、同じ取り込み経路を使って1大会ずつ検証する。

### 2. Limitless Online Platform

`play.limitlesstcg.com` の大会は、公式に文書化されたAPIから取得できる。大規模なオフライン公式大会とは別のデータソースとして扱い、`source = limitless_play` で区別する。

公開プロジェクトとしてAPIキーが必要になった場合はPokeLix名義で申請し、キーはサーバー側または収集処理の秘密情報として保存する。

### 3. カード情報・画像

英語カード名、セット、カード番号、画像URLの補完候補としてTCGdexを利用する。画像本体はSupabaseへ複製せず、原則として画像URLのみ保存する。

## 保存する言語

- `name_en`、`card_name_en`、`archetype_name_en` を基本データとする。
- 日本語対応が確実な場合だけ `name_ja` を保存する。
- 日本語名がない場合も英語のまま表示できるようにし、機械翻訳による誤ったカード名は作らない。
- デッキタイプ名の英日対応は専用の対応表へ集約し、大会結果ごとに重複保存しない。

## 収集・表示の流れ

1. 収集元ごとに大会一覧と大会結果を取得する。
2. 取得データを共通形式へ正規化する。
3. 大会ID、順位、カード枚数、重複データ、日付を検証する。
4. service roleを使うサーバー側処理だけがSupabaseへupsertする。
5. 表示用のデッキタイプ集計を定期処理で再計算する。
6. PokeLixはSupabase内の正規化済みデータと集計済みデータだけを読み込む。

ページ表示時に外部サイトをスクレイピングしない。収集に失敗しても、最後に正常取得できたデータを引き続き表示する。

## Google Sheetsの現行構成

現在のGoogle Sheetsは次の7タブで構成する。タブ名を勝手に変更しない。

1. `README`
2. `tournaments`
3. `results`
4. `cards`
5. `archetype_map`
6. `source_registry`
7. `lists`

自動収集の前に、`tournaments` / `results` / `cards` へ1大会分をdry runし、保存形式と画面表示を確認する。

### `tournaments`

| 列 | 内容 |
| --- | --- |
| `source` | `limitless_main`、`limitless_play`、`manual`など |
| `source_tournament_id` | 収集元で一意な大会ID |
| `name` | 大会名 |
| `short_name` | 画面表示用の短い大会名 |
| `event_date_start` | 開始日（YYYY-MM-DD） |
| `event_date_end` | 終了日（任意） |
| `city` | 開催都市 |
| `country_code` | ISO 2文字国コード |
| `region` | North America / Europe / Oceania / Latin America / Asia / Other |
| `player_count` | 参加人数 |
| `format` | Standardなど |
| `division` | Mastersなど |
| `source_url` | 出典URL |

### `results`

| 列 | 内容 |
| --- | --- |
| `source_result_id` | 収集元で一意な結果ID |
| `tournament_source_id` | 大会シートのID |
| `placing` | 最終順位 |
| `rank_label` | Top 8などの表示名（任意） |
| `player_name` | プレイヤー名 |
| `country_code` | 国コード（任意） |
| `archetype_name_en` | 英語デッキタイプ名 |
| `archetype_name_ja` | 確認済み日本語名（任意） |
| `deck_source_url` | デッキリスト出典URL |
| `wins` / `losses` / `ties` | 戦績（取得できる場合） |
| `decklist_public` | デッキ内容を表示可能か |

### `cards`

| 列 | 内容 |
| --- | --- |
| `source_result_id` | 結果シートのID |
| `card_key` | 同じカードを一意に識別するキー |
| `tcgdex_card_id` | TCGdex ID（取得できる場合） |
| `card_name_en` | 英語カード名 |
| `set_code` | セットコード |
| `collector_number` | カード番号 |
| `quantity` | 枚数 |
| `category` | Pokemon / Trainer / Energy |
| `image_url` | カード画像URL（任意） |

### `archetype_map`

海外のデッキタイプ名とPokeLix表示名の対応表。英語名を正とし、日本語名は人手で確認できた場合だけ追加する。同じ別名が複数のデッキタイプに分岐しないよう、対応はこのタブに集約する。

### `source_registry`

収集元、利用条件の確認状態、API/手動の区分、最後の成功日時、最後の失敗内容を管理する。利用許可が未確認の収集元は自動化対象にしない。

### `lists`

地域、フォーマット、ディビジョン、カテゴリなどの入力候補を管理する。

## GAS収集プログラム

### 対象API

- Base URL: `https://play.limitlesstcg.com/api`
- 大会一覧: `GET /tournaments?game=PTCG`
- 大会詳細: `GET /tournaments/{id}/details`
- 順位・デッキ: `GET /tournaments/{id}/standings`
- 公式仕様: <https://docs.limitlesstcg.com/developer/tournaments.html>

Limitless Playの大会APIと `limitlesstcg.com/tournaments` の大規模オフライン大会データベースは別物として扱う。後者は公開APIを確認できていないため、利用条件や許可を確認するまで自動スクレイピングしない。

### GASの関数

| 関数 | 用途 |
| --- | --- |
| `collectorCheck` | API接続とPTCG大会1件の取得確認 |
| `previewRecentTournaments` | 最近の大会候補とIDを実行ログに表示 |
| `collectConfiguredTournament` | `LIMITLESS_TOURNAMENT_ID` の1大会を取得・正規化 |
| `collectRecentTournaments` | 安全性確認後の複数大会取得 |
| `validateCollectedSheets` | 必須列、重複、順位、カード枚数の検証 |
| `buildLocalExportSheet` | Supabase未接続のローカル表示テスト用JSON作成 |

### 重複防止と負荷制御

- `source + source_tournament_id` を大会の一意キーとする。
- `source_result_id` を結果の一意キーとする。
- 取得済み大会は `REFRESH_EXISTING=true` でない限り再取得しない。
- HTTP 429と一時エラーには間隔を空けて再試行する。
- ページ表示中にLimitlessやGoogle Sheetsへ取得しに行かない。
- 定期収集は最終的に1日1回。手動検証中はトリガーを作成しない。

### デッキリストの注意

Limitless APIの `decklist` はゲームごとに形式が異なる。大会・順位・デッキタイプの取得が成功しても、PTCGの60枚を正しく展開できない可能性がある。最初の1大会は次を手作業で確認する。

- 各デッキの枚数合計が60枚か。
- カード名、セット、番号、枚数が正しいか。
- 非公開デッキを公開データとして保存していないか。
- プレイヤーの非公開情報をログへ出していないか。

## 国内環境と同じ表示にする原則

海外環境は別テーブルと別収集経路で管理するが、画面は現行PokeLixの国内環境と同じ情報階層にする。

| 国内PokeLix | 海外環境 |
| --- | --- |
| `deck_archetypes` | `overseas_archetypes` |
| `deck_records` | `overseas_results` |
| `archetype_card_stats` | `overseas_archetype_stats` |
| 環境デッキ一覧 | 海外環境デッキ一覧 |
| デッキ詳細と60枚表示 | 英語名のまま同じレイアウトで60枚表示 |
| 期間・順位・デッキタイプ | 地域・大会・順位・デッキタイプを追加 |

カード名は英語のままでよい。誤対応を避けるため、日本語カード名はセットコードとカード番号が一致した場合に限り追加する。

入り口はポケカTOPと環境デッキ一覧から `/overseas` へ配置する。国内表示は変更せず、「国内環境 / 海外環境」を切り替えられる形にする。

## Supabase候補構成

migrationは未適用とする。国内とユニアリのテーブルに混ぜず、最低限次の海外専用テーブルを用意する。

- `overseas_tournaments`: 大会マスター
- `overseas_archetypes`: 英語デッキタイプと確認済み日本語名
- `overseas_results`: 順位、プレイヤー、戦績、デッキタイプ
- `overseas_deck_cards`: デッキごとのカードと枚数
- `overseas_archetype_stats`: 地域・期間・フォーマット別の事前集計
- `overseas_collection_runs`: 収集実行ログ（非公開）

一意制約は少なくとも次を含める。

- `overseas_tournaments (source, source_tournament_id)`
- `overseas_results (source_result_id)`
- `overseas_deck_cards (result_id, card_key)`

RLSを有効化し、anonは表示必要テーブルの `SELECT` のみ許可する。書き込みはservice roleを使うGASまたはサーバー側バッチに限定する。

## Supabaseの利用量を抑える設計

- 大会データは1日1回を基本に、更新分だけupsertする。
- 一覧ページは大会、結果、集計テーブルだけを読み、60枚のカード詳細はデッキ詳細を開いた時だけ取得する。
- 環境シェアはアクセスのたびに全結果から計算せず、`overseas_archetype_stats` に事前集計する。
- Next.js側でISRまたはサーバーキャッシュを使う。一覧・集計は1時間から24時間、詳細は必要に応じて再検証する。
- 画像はSupabase Storageへ複製せずURLを保存する。
- 大会日、地域、大会ID、デッキタイプにインデックスを付ける。
- 取得処理の実行結果だけをログへ残し、同じ大会を毎回全件追加しない。

この方式なら、通常の閲覧で外部取得処理や大量の書き込みは発生しない。Supabaseの通信は、定期収集時の差分書き込みと、画面表示時の小さな読み取りに分離される。

## セキュリティ

- anon keyは公開読み取りだけに使う。
- service role keyはブラウザーへ渡さず、GASのスクリプトプロパティ、Vercelのサーバー環境変数、または専用の収集環境にだけ置く。
- service role key、APIキー、`.env.local` はGitへコミットしない。
- 海外公開テーブルはRLSを有効にし、匿名ユーザーにはSELECTだけ許可する。
- 収集実行ログは匿名公開しない。

## 実装段階

### Phase 0: 設計とAPI接続確認（完了）

- テーブル設計と未適用migrationを用意する。
- 収集元と利用条件を確認する。
- 本番DB、Vercel、定期実行は変更しない。

### Phase 1: Limitless Playの1大会をSheetsへ取り込み

- 直近の海外大会を1件選ぶ。
- Limitless Play APIから大会、結果、公開デッキカードをdry runする。
- dry runで重複、必須列、カード枚数を検証する。
- ユーザー確認後にGoogle Sheetsだけへ書き込み、Supabaseにはまだ送らない。

### Phase 2: PokeLix画面へ接続

- 現在の海外環境モックをSupabase読み取りへ切り替える。
- データが未登録または取得失敗の時だけモック／空状態を表示する。
- 国内環境と同じカード、順位、デッキ詳細の見た目を維持する。

### Phase 3: 自動収集

- 利用許可が確認できたデータソースだけを自動化する。
- 1日1回の差分収集、再試行、実行ログを追加する。
- 取得元ごとにアダプターを分け、仕様変更が他のデータソースへ波及しない構成にする。

### Phase 4: 集計と監視

- 地域、期間、フォーマット別のデッキシェアを日次集計する。
- 取得件数の急減、重複、60枚不一致を検知する。
- 最終更新日時と出典を画面へ表示する。

## 現時点で実行しないこと

- Supabaseへのmigration適用
- 本番データの書き込み
- Vercel環境変数の変更
- GAS、cron、GitHub Actionsの定期実行
- 利用条件を確認していないサイトへの自動スクレイピング
- 現在の海外環境モック画面のデータ接続切り替え

## 次の判断

最初の実装単位は「Limitless Playの海外大会1件をdry runし、確認後にGoogle Sheetsだけへ書き込む」とする。これにより、本番DBを変更せず、PokeLixの表示に必要な列とカード名・画像の対応精度を先に確認できる。

## 再開手順（別PCの担当者向け）

1. `pokeka-app` の `main` をpullし、本計画書を読む。
2. Gitのブランチ、差分、未追跡ファイルを確認する。
3. 上記Google SheetsとApps Scriptを、ユーザーが指定したGoogleアカウントで開く。権限や共有設定は変更しない。
4. スクリプトプロパティが `DRY_RUN=true` / `WRITE_SHEETS=false` であることを確認する。
5. `collectorCheck()` を実行する。HTTP 200とPTCG大会が返ることを確認する。
6. `previewRecentTournaments()` を実行し、対象大会IDを1件選ぶ。
7. `LIMITLESS_TOURNAMENT_ID` を設定し、`collectConfiguredTournament()` をdry runで実行する。
8. 大会名、日付、参加者数、順位、デッキタイプ、デッキ枚数、非公開データを検証する。
9. ユーザー確認後だけ `DRY_RUN=false` / `WRITE_SHEETS=true` にし、同じ1大会をSheetsへ書き込む。
10. `validateCollectedSheets()` を実行し、重複と60枚不一致を確認する。
11. `buildLocalExportSheet()` でJSONを作り、Supabase未接続のままローカル `/overseas` 表示を作る。
12. 表示確認の後に、ユーザーの明示承認を得てSupabase migrationとバッチupsertへ進む。

## 完了条件

- 1大会の取得からSheets検証までが、重複せず再実行できる。
- 非公開デッキを保存・表示しない。
- 60枚不一致を検出し、誤ったデッキを本番へ入れない。
- 英語カード名のまま、国内PokeLixと同じデッキ一覧・詳細レイアウトで表示できる。
- サイトの表示時にLimitlessやGoogle Sheetsへ直接アクセスしない。
- Supabaseは1日1回の差分upsertと事前集計データの読み取りに限定する。
- service role key、APIキー、`.env.local` がGit履歴に入っていない。
