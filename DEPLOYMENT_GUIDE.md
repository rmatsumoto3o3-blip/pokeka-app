# デプロイとドメイン設定ガイド

このガイドでは、**Vercel** へのデプロイ方法と、**お名前.com** で取得したドメインの設定方法を説明します。

## 1. Vercelへのデプロイ

### 手順
1.  [Vercel Dashboard](https://vercel.com/dashboard) にアクセスし、ログインします。
2.  **"Add New..."** > **"Project"** をクリックします。
3.  **"Import Git Repository"** で `rmatsumoto3o3-blip/pokeka-app` を選択し、**"Import"** をクリックします。

### 設定項目 (Configure Project)
以下の項目を確認・設定して **"Deploy"** をクリックします。

*   **Framework Preset:** `Next.js` (自動検出されます)
*   **Root Directory:** `./` (そのままでOK)
*   **Environment Variables (環境変数):**
    *   `.env.local` の内容をコピーして入力します。
    *   **重要:** `NEXT_PUBLIC_SUPABASE_URL` と `NEXT_PUBLIC_SUPABASE_ANON_KEY` は少なくとも必須です。

デプロイが完了すると、`https://pokeka-app.vercel.app` のようなURLが発行されます。

---

## 2. カスタムドメインの設定 (お名前.com)

取得したサブドメイン **`pokelix.3o3.tech`** をVercelに紐付けます。

### Vercel側の設定
1.  Vercelのプロジェクトページで **"Settings"** > **"Domains"** を開きます。
2.  **`pokelix.3o3.tech`** と入力し、**"Add"** をクリックします。
3.  **"Recommended"** (推奨設定) として `CNAME` レコードの設定値が表示されます。
    *   Value: `cname.vercel-dns.com`

### お名前.comでの設定
1.  [お名前.com Navi](https://navi.onamae.com/) にログインします。
2.  **"DNS設定/転送設定"** > **"DNSレコード設定を利用する"** を選択します。
3.  ドメイン **`3o3.tech`** を選択し、**"入力画面へ進む"** をクリックします。
4.  以下のレコードを追加します。

| ホスト名 | TYPE | VALUE |
| :--- | :--- | :--- |
| **pokelix** | **CNAME** | **cname.vercel-dns.com** |

5.  **"追加"** を押し、確認画面へ進んで設定を完了させます。

### 完了確認
VercelのDomains画面に戻り、`pokelix.3o3.tech` に緑色のチェックマーク ✅ が付けば接続完了です（反映まで最大24〜48時間かかる場合があります）。

---

## 3. 本番環境での確認事項
デプロイ後、以下の機能が正常に動くか確認してください。

1.  **ログイン/新規登録:** Supabaseの「Site URL」設定も本番ドメインに変更する必要があります。
    *   Supabase Dashboard > Authentication > URL Configuration > **Site URL** を本番URLに変更。
    *   **Redirect URLs** に `https://(本番ドメイン)/auth/callback` などを追加。
2.  **OGP画像:** `opengraph-image.png` がSNSシェア時に正しく表示されるか。
3.  **ISR (キャッシュ):** トップページの戦績データが表示されるか。

以上で公開準備は完了です！
