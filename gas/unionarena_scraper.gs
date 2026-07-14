/**
 * ユニオンアリーナ 大会入賞デッキ 自動収集スクリプト
 *
 * 公式サイトの入賞デッキ一覧をスクレイピングし、Supabaseの
 * unionarena_deck_archetypes / unionarena_deck_records に書き込む。
 *
 * セットアップ:
 * 1. スプレッドシートの「拡張機能」→「Apps Script」でこのファイルを貼り付け
 * 2. 左メニューの「プロジェクトの設定」→「スクリプト プロパティ」で以下を追加:
 *    - SUPABASE_URL: SupabaseプロジェクトのURL（例: https://xxxx.supabase.co）
 *    - SUPABASE_SERVICE_ROLE_KEY: service_role キー（絶対に公開しないこと）
 * 3. 関数 syncUnionArenaDecks をトリガー（時間主導型、例: 1日1回）に設定
 */

const UNIONARENA_LIST_URL = 'https://www.unionarena-tcg.com/jp/decks/top-placing/';
const UNIONARENA_TITLES_URL = 'https://www.unionarena-tcg.com/jp/decks/titles/';
const UNIONARENA_ORIGIN = 'https://www.unionarena-tcg.com';
const UNIONARENA_STORAGE_BUCKET = 'unionarena-images';
const BANDAI_API = 'https://api.bandai-tcg-plus.com';
const UNIONARENA_GAME_TITLE_ID = 9;

// ------------------------------------------------------------------
// 画像を公式サイトから取得し Supabase Storage に保存して公開URLを返す。
// 既にStorageのURL（storage/v1/object/public を含む）ならそのまま返す。
// ------------------------------------------------------------------
function cacheImageToStorage_(supabaseUrl, serviceKey, sourceUrl, storagePath) {
    if (!sourceUrl) return sourceUrl;
    if (sourceUrl.indexOf('/storage/v1/object/public/') !== -1) return sourceUrl; // 既に自前保存済み

    const imgRes = UrlFetchApp.fetch(sourceUrl, { muteHttpExceptions: true, headers: { 'User-Agent': 'Mozilla/5.0' } });
    if (imgRes.getResponseCode() !== 200) {
        throw new Error('画像取得失敗 ' + imgRes.getResponseCode() + ' ' + sourceUrl);
    }
    const blob = imgRes.getBlob();
    const ext = (sourceUrl.split('?')[0].match(/\.(\w+)$/) || [null, 'png'])[1];
    const contentType = ext === 'webp' ? 'image/webp' : ext === 'jpg' || ext === 'jpeg' ? 'image/jpeg' : 'image/png';

    const upRes = UrlFetchApp.fetch(supabaseUrl + '/storage/v1/object/' + UNIONARENA_STORAGE_BUCKET + '/' + storagePath, {
        method: 'post',
        contentType: contentType,
        headers: { apikey: serviceKey, Authorization: 'Bearer ' + serviceKey, 'x-upsert': 'true' },
        payload: blob.getBytes(),
        muteHttpExceptions: true,
    });
    if (upRes.getResponseCode() >= 300) {
        throw new Error('画像アップロード失敗 ' + upRes.getResponseCode() + ' ' + upRes.getContentText());
    }
    return supabaseUrl + '/storage/v1/object/public/' + UNIONARENA_STORAGE_BUCKET + '/' + storagePath;
}

// ------------------------------------------------------------------
// deck_code から実カード構成を取得（bandai-tcg-plus.com 公開API 2段）。
// アプリの lib/unionArenaDeckParser.ts と同じ形の配列を返す。失敗時は null。
// ------------------------------------------------------------------
function fetchCardList_(deckCode) {
    try {
        const urlCodeRes = UrlFetchApp.fetch(BANDAI_API + '/api/user/deck/url_code?deck_code=' + encodeURIComponent(deckCode), { muteHttpExceptions: true });
        if (urlCodeRes.getResponseCode() !== 200) return null;
        const urlCode = JSON.parse(urlCodeRes.getContentText())?.success?.url_code;
        if (!urlCode) return null;

        const recipeRes = UrlFetchApp.fetch(
            BANDAI_API + '/api/user/deck/recipe?url_code=' + encodeURIComponent(urlCode)
            + '&game_title_id=' + UNIONARENA_GAME_TITLE_ID + '&encode=0',
            { muteHttpExceptions: true }
        );
        if (recipeRes.getResponseCode() !== 200) return null;
        const success = JSON.parse(recipeRes.getContentText())?.success;
        if (!success) return null;

        return (success.main_deck || []).map(function (c) {
            return {
                id: c.id,
                code: c.code,
                cardNumber: c.card_number,
                name: c.card_name,
                quantity: c.card_count,
                imageUrl: c.image_url,
                cost: c.cost,
                color: c.color,
                type: c.type,
            };
        });
    } catch (e) {
        Logger.log('fetchCardList_ error (' + deckCode + '): ' + e);
        return null;
    }
}

function syncUnionArenaDecks() {
    const props = PropertiesService.getScriptProperties();
    const supabaseUrl = props.getProperty('SUPABASE_URL');
    const serviceKey = props.getProperty('SUPABASE_SERVICE_ROLE_KEY');

    if (!supabaseUrl || !serviceKey) {
        throw new Error('スクリプトプロパティに SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY を設定してください');
    }

    const html = fetchListPageHtml_();
    const decks = parseDeckEntries_(html);

    Logger.log('検出したデッキ数: ' + decks.length);

    const archetypeCache = {}; // name -> archetype_id
    let inserted = 0;
    let skipped = 0;

    decks.forEach(function (deck) {
        try {
            const archetypeId = getOrCreateArchetype_(supabaseUrl, serviceKey, archetypeCache, deck.archetypeName);
            const wasInserted = upsertDeckRecord_(supabaseUrl, serviceKey, archetypeId, deck);
            if (wasInserted) {
                inserted++;
            } else {
                skipped++;
            }
        } catch (e) {
            Logger.log('エラー (deck_code=' + deck.deckCode + '): ' + e);
        }
    });

    Logger.log('新規登録: ' + inserted + '件 / 既存スキップ: ' + skipped + '件');
    logToSheet_(decks.length, inserted, skipped);
}

// ------------------------------------------------------------------
// 1. 大会入賞デッキ一覧ページを取得
// ------------------------------------------------------------------
function fetchListPageHtml_() {
    return fetchHtml_(UNIONARENA_LIST_URL);
}

function fetchHtml_(url) {
    const res = UrlFetchApp.fetch(url, {
        muteHttpExceptions: true,
        headers: { 'User-Agent': 'Mozilla/5.0' },
    });
    if (res.getResponseCode() !== 200) {
        throw new Error('ページの取得に失敗しました (' + url + '): ' + res.getResponseCode());
    }
    return res.getContentText();
}

// ------------------------------------------------------------------
// 2. HTMLから <li class="decksDetail ..."> ブロックを1件ずつ抽出してパース
// ------------------------------------------------------------------
function parseDeckEntries_(html) {
    const decks = [];
    const blocks = html.split('<li class="decksDetail');

    // 先頭要素はブロック本体ではないので除外
    for (let i = 1; i < blocks.length; i++) {
        const block = blocks[i];

        const deckCodeMatch = block.match(/deck_code_recipe\/([A-Za-z0-9]+)/);
        if (!deckCodeMatch) continue;
        const deckCode = deckCodeMatch[1];

        const eventNameMatch = block.match(/decksCategory[^>]*>[\s\S]*?<a[^>]*>([^<]+)<\/a>/);
        const eventName = eventNameMatch ? decodeHtmlEntities_(eventNameMatch[1].trim()) : '';

        // デッキごとのサムネイル画像（シリーズロゴより優先して使う実際のカード/デッキ画像）
        const thumbMatch = block.match(/decksthumbnail"><img src="([^"]+)"/);
        const thumbnailUrl = thumbMatch ? UNIONARENA_ORIGIN + thumbMatch[1] : '';

        // decksTit の中身は "優勝<br>【紫】アイドルマスター シャイニーカラーズ" のような形式
        const titMatch = block.match(/js_decksTit">([\s\S]*?)<\/span>/);
        let rank = '';
        let deckName = ''; // 色タグ込みのフルネーム（例: 【紫】アイドルマスター シャイニーカラーズ）
        if (titMatch) {
            const parts = titMatch[1].split(/<br\s*\/?>/i).map(function (s) { return decodeHtmlEntities_(s.trim()); });
            rank = parts[0] || '';
            deckName = parts[1] || parts[0] || '';
        }

        const dateMatch = block.match(/decksHeadTit">更新日<\/span><br>([\d.]+)/);
        const rawDate = dateMatch ? dateMatch[1] : ''; // "2026.07.10"
        // "2026.07.10" -> "7/10"（ポケカ側の表記に合わせ、先頭ゼロは除去）
        const eventDate = rawDate
            ? rawDate.split('.').slice(1).map(function (n) { return String(parseInt(n, 10)); }).join('/')
            : '';

        if (!deckName) continue;

        decks.push({
            deckCode: deckCode,
            eventName: eventName,
            deckName: deckName,
            archetypeName: normalizeArchetypeName_(deckName),
            color: extractColor_(deckName),
            rank: normalizeRank_(rank),
            eventDate: eventDate,
            thumbnailUrl: thumbnailUrl,
        });
    }

    return decks;
}

// 【紫】アイドルマスター シャイニーカラーズ -> アイドルマスター シャイニーカラーズ（色タグを除去、シリーズ名のみ）
function normalizeArchetypeName_(name) {
    return name.replace(/^【[^】]+】/, '').trim();
}

// 【紫】アイドルマスター シャイニーカラーズ -> 紫（色タグの中身だけ抽出。無ければ空文字）
function extractColor_(name) {
    const m = name.match(/^【([^】]+)】/);
    return m ? m[1] : '';
}

// 公式ページの実表記は「優勝」「準優勝」「2位」「3位」「4位」等。
// event_rank はDB側もTEXT（自由形式）なのでそのまま通す。
function normalizeRank_(rank) {
    return rank;
}

function decodeHtmlEntities_(str) {
    return str
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        // ページ内で波ダッシュ(U+301C)と全角チルダ(U+FF5E)が混在しているため、
        // 同一シリーズ名として一致するよう全角チルダに統一する
        .replace(/〜/g, '～');
}

// ------------------------------------------------------------------
// 3. アーキタイプ名からIDを取得（無ければ新規作成）
// ------------------------------------------------------------------
function getOrCreateArchetype_(supabaseUrl, serviceKey, cache, name) {
    if (cache[name]) return cache[name];

    const headers = supabaseHeaders_(serviceKey);

    // 既存を検索
    const searchRes = UrlFetchApp.fetch(
        supabaseUrl + '/rest/v1/unionarena_deck_archetypes?name=eq.' + encodeURIComponent(name) + '&select=id',
        { headers: headers, muteHttpExceptions: true }
    );
    const existing = JSON.parse(searchRes.getContentText());
    if (existing && existing.length > 0) {
        cache[name] = existing[0].id;
        return existing[0].id;
    }

    // 無ければ新規作成
    const createRes = UrlFetchApp.fetch(supabaseUrl + '/rest/v1/unionarena_deck_archetypes', {
        method: 'post',
        headers: Object.assign({}, headers, { 'Content-Type': 'application/json', Prefer: 'return=representation' }),
        payload: JSON.stringify({ name: name }),
        muteHttpExceptions: true,
    });
    const created = JSON.parse(createRes.getContentText());
    if (!created || !created[0]) {
        throw new Error('アーキタイプ作成に失敗: ' + name + ' / ' + createRes.getContentText());
    }
    cache[name] = created[0].id;
    return created[0].id;
}

// ------------------------------------------------------------------
// 4. deck_code が未登録なら unionarena_deck_records に挿入（重複防止）。
//    既存レコードで color / deck_name / thumbnail_url が未設定なら追記する（過去分のバックフィル）。
// ------------------------------------------------------------------
function upsertDeckRecord_(supabaseUrl, serviceKey, archetypeId, deck) {
    const headers = supabaseHeaders_(serviceKey);

    const existsRes = UrlFetchApp.fetch(
        supabaseUrl + '/rest/v1/unionarena_deck_records?deck_code=eq.' + encodeURIComponent(deck.deckCode) + '&select=id,color,deck_name,thumbnail_url,card_list',
        { headers: headers, muteHttpExceptions: true }
    );
    const existing = JSON.parse(existsRes.getContentText());
    if (existing && existing.length > 0) {
        const row = existing[0];
        const needsThumb = !row.thumbnail_url || row.thumbnail_url.indexOf('/storage/v1/object/public/') === -1;
        const needsCards = !row.card_list;
        if (!row.color || !row.deck_name || needsThumb || needsCards) {
            const patch = { color: deck.color || null, deck_name: deck.deckName || null };
            if (needsThumb && deck.thumbnailUrl) {
                patch.thumbnail_url = safeCacheImage_(supabaseUrl, serviceKey, deck.thumbnailUrl, 'decks/' + row.id);
            }
            if (needsCards) {
                const cards = fetchCardList_(deck.deckCode);
                if (cards) patch.card_list = cards;
            }
            UrlFetchApp.fetch(
                supabaseUrl + '/rest/v1/unionarena_deck_records?id=eq.' + row.id,
                {
                    method: 'patch',
                    headers: Object.assign({}, headers, { 'Content-Type': 'application/json' }),
                    payload: JSON.stringify(patch),
                    muteHttpExceptions: true,
                }
            );
        }
        return false; // 既に登録済み（新規カウントはしない）
    }

    // 新規: まず挿入してidを得る → 画像をStorage保存・カード構成取得して更新
    const insertRes = UrlFetchApp.fetch(supabaseUrl + '/rest/v1/unionarena_deck_records', {
        method: 'post',
        headers: Object.assign({}, headers, { 'Content-Type': 'application/json', Prefer: 'return=representation' }),
        payload: JSON.stringify({
            deck_code: deck.deckCode,
            archetype_id: archetypeId,
            event_rank: deck.rank || null,
            event_date: deck.eventDate || null,
            event_location: deck.eventName || null,
            deck_name: deck.deckName || null,
            color: deck.color || null,
        }),
        muteHttpExceptions: true,
    });
    if (insertRes.getResponseCode() >= 300) {
        throw new Error('デッキ登録に失敗: ' + deck.deckCode + ' / ' + insertRes.getContentText());
    }
    const newId = JSON.parse(insertRes.getContentText())[0].id;

    const patch = {};
    if (deck.thumbnailUrl) patch.thumbnail_url = safeCacheImage_(supabaseUrl, serviceKey, deck.thumbnailUrl, 'decks/' + newId);
    const cards = fetchCardList_(deck.deckCode);
    if (cards) patch.card_list = cards;
    if (Object.keys(patch).length > 0) {
        UrlFetchApp.fetch(supabaseUrl + '/rest/v1/unionarena_deck_records?id=eq.' + newId, {
            method: 'patch',
            headers: Object.assign({}, headers, { 'Content-Type': 'application/json' }),
            payload: JSON.stringify(patch),
            muteHttpExceptions: true,
        });
    }
    return true;
}

// 画像キャッシュはエラーで全体を止めないよう握りつぶす（失敗時は元URLのまま）
function safeCacheImage_(supabaseUrl, serviceKey, sourceUrl, storagePath) {
    try {
        const ext = (sourceUrl.split('?')[0].match(/\.(\w+)$/) || [null, 'png'])[1];
        return cacheImageToStorage_(supabaseUrl, serviceKey, sourceUrl, storagePath + '.' + ext);
    } catch (e) {
        Logger.log('safeCacheImage_ error: ' + e);
        return sourceUrl;
    }
}

function supabaseHeaders_(serviceKey) {
    return {
        apikey: serviceKey,
        Authorization: 'Bearer ' + serviceKey,
    };
}

// ====================================================================
// シリーズ（参加タイトル）マスター同期 + アーキタイプのロゴ画像バックフィル
// ====================================================================
function syncUnionArenaSeries() {
    const props = PropertiesService.getScriptProperties();
    const supabaseUrl = props.getProperty('SUPABASE_URL');
    const serviceKey = props.getProperty('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !serviceKey) {
        throw new Error('スクリプトプロパティに SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY を設定してください');
    }

    // 「大会入賞デッキ」「タイトル別おすすめデッキ」両ページのフィルター一覧をマージ
    const seriesMap = {}; // tagCode -> { name, logoUrl }
    [UNIONARENA_LIST_URL, UNIONARENA_TITLES_URL].forEach(function (url) {
        const html = fetchHtml_(url);
        parseSeriesFilterList_(html).forEach(function (s) {
            seriesMap[s.tagCode] = s;
        });
    });
    const seriesList = Object.keys(seriesMap).map(function (k) { return seriesMap[k]; });

    Logger.log('検出したシリーズ数: ' + seriesList.length);

    const headers = supabaseHeaders_(serviceKey);
    let updated = 0;
    seriesList.forEach(function (s) {
        // ロゴ画像をStorageに保存し、以降は自前URLを使う
        const storedLogo = safeCacheImage_(supabaseUrl, serviceKey, s.logoUrl, 'series/' + s.tagCode);

        UrlFetchApp.fetch(supabaseUrl + '/rest/v1/unionarena_series', {
            method: 'post',
            headers: Object.assign({}, headers, {
                'Content-Type': 'application/json',
                Prefer: 'resolution=merge-duplicates',
            }),
            payload: JSON.stringify({ tag_code: s.tagCode, name: s.name, logo_url: storedLogo }),
            muteHttpExceptions: true,
        });

        // アーキタイプ名がシリーズ名と一致するものに、ロゴ画像を cover_image_url としてバックフィル
        const res = UrlFetchApp.fetch(
            supabaseUrl + '/rest/v1/unionarena_deck_archetypes?name=eq.' + encodeURIComponent(s.name) + '&cover_image_url=is.null',
            {
                method: 'patch',
                headers: Object.assign({}, headers, { 'Content-Type': 'application/json', Prefer: 'return=representation' }),
                payload: JSON.stringify({ cover_image_url: storedLogo }),
                muteHttpExceptions: true,
            }
        );
        const result = JSON.parse(res.getContentText() || '[]');
        if (result && result.length > 0) updated += result.length;
    });

    Logger.log('ロゴ画像を設定したアーキタイプ数: ' + updated);
}

// 「絞り込む」モーダル内の <a data-tags="XXX"><img class="filterLogo" src="..." alt="シリーズ名"> を抽出
function parseSeriesFilterList_(html) {
    const modalMatch = html.match(/id="csd_titles"[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/);
    const modalHtml = modalMatch ? modalMatch[0] : '';
    const series = [];
    const re = /data-tags="([A-Z0-9]+)"><img class="filterLogo" src="([^"]+)"[^>]*alt="([^"]*)"/g;
    let m;
    while ((m = re.exec(modalHtml))) {
        series.push({
            tagCode: m[1],
            logoUrl: UNIONARENA_ORIGIN + m[2],
            name: decodeHtmlEntities_(m[3]),
        });
    }
    return series;
}

// ====================================================================
// 公式おすすめデッキ（タイトル別おすすめデッキページ）同期
// ====================================================================
function syncUnionArenaRecommendedDecks() {
    const props = PropertiesService.getScriptProperties();
    const supabaseUrl = props.getProperty('SUPABASE_URL');
    const serviceKey = props.getProperty('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !serviceKey) {
        throw new Error('スクリプトプロパティに SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY を設定してください');
    }

    const html = fetchHtml_(UNIONARENA_TITLES_URL);
    const decks = parseRecommendedDeckEntries_(html);
    Logger.log('検出したおすすめデッキ数: ' + decks.length);

    const headers = supabaseHeaders_(serviceKey);
    let inserted = 0;
    decks.forEach(function (deck) {
        // 既存確認（画像・カード構成が保存済みかを見る）
        const exRes = UrlFetchApp.fetch(
            supabaseUrl + '/rest/v1/unionarena_recommended_decks?deck_code=eq.' + encodeURIComponent(deck.deckCode) + '&select=id,image_url,card_list',
            { headers: headers, muteHttpExceptions: true }
        );
        const ex = JSON.parse(exRes.getContentText() || '[]');
        let id = ex.length ? ex[0].id : null;
        const curImage = ex.length ? ex[0].image_url : null;
        const curCards = ex.length ? ex[0].card_list : null;

        // 基本情報をupsert（image_urlは自前URLを上書きしないよう含めない）
        const upRes = UrlFetchApp.fetch(supabaseUrl + '/rest/v1/unionarena_recommended_decks', {
            method: 'post',
            headers: Object.assign({}, headers, {
                'Content-Type': 'application/json',
                Prefer: 'resolution=merge-duplicates,return=representation',
            }),
            payload: JSON.stringify({
                deck_code: deck.deckCode,
                tag_code: deck.tagCode || null,
                deck_name: deck.deckName || null,
            }),
            muteHttpExceptions: true,
        });
        if (upRes.getResponseCode() >= 300) { Logger.log('rec upsert失敗: ' + deck.deckCode); return; }
        if (!id) id = JSON.parse(upRes.getContentText())[0].id;
        inserted++;

        // 画像Storage保存・カード構成保存（未保存のものだけ）
        const patch = {};
        const needImage = !curImage || curImage.indexOf('/storage/v1/object/public/') === -1;
        if (needImage && deck.imageUrl) patch.image_url = safeCacheImage_(supabaseUrl, serviceKey, deck.imageUrl, 'recommended/' + id);
        if (!curCards) { const cards = fetchCardList_(deck.deckCode); if (cards) patch.card_list = cards; }
        if (Object.keys(patch).length > 0) {
            UrlFetchApp.fetch(supabaseUrl + '/rest/v1/unionarena_recommended_decks?id=eq.' + id, {
                method: 'patch',
                headers: Object.assign({}, headers, { 'Content-Type': 'application/json' }),
                payload: JSON.stringify(patch),
                muteHttpExceptions: true,
            });
        }
    });

    Logger.log('登録/更新: ' + inserted + '件');
}

function parseRecommendedDeckEntries_(html) {
    const decks = [];
    const blocks = html.split('<li class="decksDetail');
    for (let i = 1; i < blocks.length; i++) {
        const block = blocks[i];

        const deckCodeMatch = block.match(/deck_code_recipe\/([A-Za-z0-9]+)/);
        if (!deckCodeMatch) continue;

        const tagMatch = block.match(/^[^>]*data-tags="([A-Z0-9]+)"/);
        const titMatch = block.match(/js_decksTit">([^<]+)<\/span>/);
        const thumbMatch = block.match(/decksthumbnail"><img src="([^"]+)"/);

        decks.push({
            deckCode: deckCodeMatch[1],
            tagCode: tagMatch ? tagMatch[1] : '',
            deckName: titMatch ? decodeHtmlEntities_(titMatch[1].trim()) : '',
            imageUrl: thumbMatch ? UNIONARENA_ORIGIN + thumbMatch[1] : '',
        });
    }
    return decks;
}

// ------------------------------------------------------------------
// 実行ログをスプレッドシートに残す（任意・デバッグ用）
// ------------------------------------------------------------------
function logToSheet_(total, inserted, skipped) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('実行ログ')
        || SpreadsheetApp.getActiveSpreadsheet().insertSheet('実行ログ');
    if (sheet.getLastRow() === 0) {
        sheet.appendRow(['実行日時', '検出件数', '新規登録', 'スキップ']);
    }
    sheet.appendRow([new Date(), total, inserted, skipped]);
}
