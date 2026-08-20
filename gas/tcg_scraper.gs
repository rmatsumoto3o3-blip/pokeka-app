/**
 * TCG大会デッキ収集スクリプト（ユニオンアリーナ ＋ ガンダムカードゲーム 統合）
 *
 * ・ユニアリ：公式の入賞デッキ一覧をスクレイプ → unionarena_* テーブル ＋ Firebase(environmentDecks/unionarena)
 * ・ガンダム：公式の大会結果を3階層クロール → 「ガンダム大会デッキ」シートへ追記 →
 *            （F列アーキタイプを手分類）→ gundam_* テーブル ＋ Firebase(environmentDecks/gundam)。
 *
 * 実行はスプレッドシートの「🔧 収集ツール」メニューから手動（トリガー任意）。
 * スクリプトプロパティ:
 *   - SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY（両ゲーム共有）
 *   - ENV_DECKS_SYNC_SECRET（Firebase同期用。Vercel の同名環境変数と同値。未設定ならFirebase同期はスキップ）
 *
 * 関数名は衝突しない（ユニアリ=無印/UNIONARENA_、ガンダム=gcg/GCG_）。
 * ⚠ 各公式サイトの規約（無断転載禁止）に配慮し、低速・差分・非公式明記で運用すること。
 */

// ====================================================================
// Firebase（environmentDecks/{game}）同期。Supabase制限中でもサイト表示を維持するための二重化。
// ====================================================================
const ENV_DECKS_ENDPOINT = 'https://www.pokelix.jp/api/env-decks';
const RECOMMENDED_DECKS_ENDPOINT = 'https://www.pokelix.jp/api/recommended-decks';

// game = 'unionarena' | 'gundam'。decks = [{deckCode, archetype, eventName, eventDate, rank}]（全件洗い替え）
function _pushEnvDecksToFirebase_(game, decks) {
    const secret = PropertiesService.getScriptProperties().getProperty('ENV_DECKS_SYNC_SECRET');
    if (!secret) { Logger.log('ENV_DECKS_SYNC_SECRET 未設定のため Firebase同期をスキップ (' + game + ')'); return; }
    if (!decks || !decks.length) { Logger.log('Firebase同期対象なし (' + game + ')'); return; }
    try {
        const res = UrlFetchApp.fetch(ENV_DECKS_ENDPOINT, {
            method: 'post',
            contentType: 'application/json',
            headers: { 'x-env-decks-secret': secret },
            payload: JSON.stringify({ game: game, decks: decks }),
            muteHttpExceptions: true,
        });
        Logger.log('Firebase同期(' + game + '): HTTP ' + res.getResponseCode() + ' ' + res.getContentText());
    } catch (e) {
        Logger.log('Firebase同期失敗(' + game + '): ' + e);
    }
}

// タイトル別/おすすめデッキを Firebase(recommendedDecks/{game}) へ。
// payload は { decks: [...] } / { series: [...] } / 両方。指定した方だけ洗い替え。
function _pushRecommendedToFirebase_(game, payload) {
    const secret = PropertiesService.getScriptProperties().getProperty('ENV_DECKS_SYNC_SECRET');
    if (!secret) { Logger.log('ENV_DECKS_SYNC_SECRET 未設定のため タイトル別同期をスキップ (' + game + ')'); return; }
    try {
        const body = Object.assign({ game: game }, payload || {});
        const res = UrlFetchApp.fetch(RECOMMENDED_DECKS_ENDPOINT, {
            method: 'post',
            contentType: 'application/json',
            headers: { 'x-env-decks-secret': secret },
            payload: JSON.stringify(body),
            muteHttpExceptions: true,
        });
        Logger.log('タイトル別同期(' + game + '): HTTP ' + res.getResponseCode() + ' ' + res.getContentText());
    } catch (e) {
        Logger.log('タイトル別同期失敗(' + game + '): ' + e);
    }
}

// ====================================================================
// メニュー（スプレッドシートを開くと表示。手動実行用）
// ====================================================================
function onOpen() {
    SpreadsheetApp.getUi().createMenu('🔧 収集ツール')
        .addItem('▶ ユニアリ 大会入賞デッキ 収集', 'syncUnionArenaDecks')
        .addItem('　 ユニアリ シリーズ同期', 'syncUnionArenaSeries')
        .addItem('　 ユニアリ おすすめデッキ同期', 'syncUnionArenaRecommendedDecks')
        .addSeparator()
        .addItem('▶ ガンダム 収集（→シート）', 'scrapeGundamToSheet')
        .addItem('▶ ガンダム 同期（シート→Supabase＋Firebase）', 'syncGundamSheetToSupabase')
        .addSeparator()
        .addItem('　 ユニアリ Firebaseだけ再送', 'pushUnionArenaToFirebaseOnly')
        .addItem('　 ガンダム Firebaseだけ再送', 'pushGundamToFirebaseOnly')
        .addToUi();
}

// ####################################################################
// ################  ユニオンアリーナ（unionarena_*）  ################
// ####################################################################

const UNIONARENA_LIST_URL = 'https://www.unionarena-tcg.com/jp/decks/top-placing/';
const UNIONARENA_TITLES_URL = 'https://www.unionarena-tcg.com/jp/decks/titles/';
const UNIONARENA_ORIGIN = 'https://www.unionarena-tcg.com';

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

    // --- Firebase（環境デッキ表示用）は Supabase の成否に関係なく先に洗い替え ---
    _pushEnvDecksToFirebase_('unionarena', _unionEnvDecks_(decks));

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

// 解析済みユニアリデッキ → env-decks 形（Firebase）
function _unionEnvDecks_(decks) {
    return (decks || []).map(function (d) {
        return {
            deckCode: d.deckCode,
            archetype: d.archetypeName,
            eventName: d.eventName,
            eventDate: d.eventDate,
            rank: d.rank,
        };
    });
}

// メニュー用：Supabaseを触らずユニアリのFirebaseだけ再送（公式一覧を取り直して洗い替え）
function pushUnionArenaToFirebaseOnly() {
    const decks = parseDeckEntries_(fetchListPageHtml_());
    _pushEnvDecksToFirebase_('unionarena', _unionEnvDecks_(decks));
}

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

function parseDeckEntries_(html) {
    const decks = [];
    const blocks = html.split('<li class="decksDetail');

    for (let i = 1; i < blocks.length; i++) {
        const block = blocks[i];

        const deckCodeMatch = block.match(/deck_code_recipe\/([A-Za-z0-9]+)/);
        if (!deckCodeMatch) continue;
        const deckCode = deckCodeMatch[1];

        const eventNameMatch = block.match(/decksCategory[^>]*>[\s\S]*?<a[^>]*>([^<]+)<\/a>/);
        const eventName = eventNameMatch ? decodeHtmlEntities_(eventNameMatch[1].trim()) : '';

        const thumbMatch = block.match(/decksthumbnail"><img src="([^"]+)"/);
        const thumbnailUrl = thumbMatch ? UNIONARENA_ORIGIN + thumbMatch[1] : '';

        const titMatch = block.match(/js_decksTit">([\s\S]*?)<\/span>/);
        let rank = '';
        let deckName = '';
        if (titMatch) {
            const parts = titMatch[1].split(/<br\s*\/?>/i).map(function (s) { return decodeHtmlEntities_(s.trim()); });
            rank = parts[0] || '';
            deckName = parts[1] || parts[0] || '';
        }

        const dateMatch = block.match(/decksHeadTit">更新日<\/span><br>([\d.]+)/);
        const rawDate = dateMatch ? dateMatch[1] : '';
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

function normalizeArchetypeName_(name) {
    return name.replace(/^【[^】]+】/, '').trim();
}

function extractColor_(name) {
    const m = name.match(/^【([^】]+)】/);
    return m ? m[1] : '';
}

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
        .replace(/〜/g, '～');
}

function getOrCreateArchetype_(supabaseUrl, serviceKey, cache, name) {
    if (cache[name]) return cache[name];

    const headers = supabaseHeaders_(serviceKey);

    const searchRes = UrlFetchApp.fetch(
        supabaseUrl + '/rest/v1/unionarena_deck_archetypes?name=eq.' + encodeURIComponent(name) + '&select=id',
        { headers: headers, muteHttpExceptions: true }
    );
    const existing = JSON.parse(searchRes.getContentText());
    if (existing && existing.length > 0) {
        cache[name] = existing[0].id;
        return existing[0].id;
    }

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

function upsertDeckRecord_(supabaseUrl, serviceKey, archetypeId, deck) {
    const headers = supabaseHeaders_(serviceKey);

    const existsRes = UrlFetchApp.fetch(
        supabaseUrl + '/rest/v1/unionarena_deck_records?deck_code=eq.' + encodeURIComponent(deck.deckCode) + '&select=id,color,deck_name,thumbnail_url',
        { headers: headers, muteHttpExceptions: true }
    );
    const existing = JSON.parse(existsRes.getContentText());
    if (existing && existing.length > 0) {
        const row = existing[0];
        if (!row.color || !row.deck_name || !row.thumbnail_url) {
            UrlFetchApp.fetch(
                supabaseUrl + '/rest/v1/unionarena_deck_records?id=eq.' + row.id,
                {
                    method: 'patch',
                    headers: Object.assign({}, headers, { 'Content-Type': 'application/json' }),
                    payload: JSON.stringify({
                        color: deck.color || null,
                        deck_name: deck.deckName || null,
                        thumbnail_url: deck.thumbnailUrl || null,
                    }),
                    muteHttpExceptions: true,
                }
            );
        }
        return false;
    }

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
            thumbnail_url: deck.thumbnailUrl || null,
        }),
        muteHttpExceptions: true,
    });

    if (insertRes.getResponseCode() >= 300) {
        throw new Error('デッキ登録に失敗: ' + deck.deckCode + ' / ' + insertRes.getContentText());
    }
    return true;
}

function supabaseHeaders_(serviceKey) {
    return {
        apikey: serviceKey,
        Authorization: 'Bearer ' + serviceKey,
    };
}

function syncUnionArenaSeries() {
    const props = PropertiesService.getScriptProperties();
    const supabaseUrl = props.getProperty('SUPABASE_URL');
    const serviceKey = props.getProperty('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !serviceKey) {
        throw new Error('スクリプトプロパティに SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY を設定してください');
    }

    const seriesMap = {};
    [UNIONARENA_LIST_URL, UNIONARENA_TITLES_URL].forEach(function (url) {
        const html = fetchHtml_(url);
        parseSeriesFilterList_(html).forEach(function (s) {
            seriesMap[s.tagCode] = s;
        });
    });
    const seriesList = Object.keys(seriesMap).map(function (k) { return seriesMap[k]; });

    Logger.log('検出したシリーズ数: ' + seriesList.length);

    // Firebase（recommendedDecks/unionarena）へシリーズ（タイトル）を洗い替え（Supabaseと独立）
    _pushRecommendedToFirebase_('unionarena', {
        series: seriesList.map(function (s) {
            return { tagCode: s.tagCode, name: s.name, logoUrl: s.logoUrl };
        }),
    });

    const headers = supabaseHeaders_(serviceKey);
    seriesList.forEach(function (s) {
        UrlFetchApp.fetch(supabaseUrl + '/rest/v1/unionarena_series', {
            method: 'post',
            headers: Object.assign({}, headers, {
                'Content-Type': 'application/json',
                Prefer: 'resolution=merge-duplicates',
            }),
            payload: JSON.stringify({ tag_code: s.tagCode, name: s.name, logo_url: s.logoUrl }),
            muteHttpExceptions: true,
        });
    });

    let updated = 0;
    seriesList.forEach(function (s) {
        const res = UrlFetchApp.fetch(
            supabaseUrl + '/rest/v1/unionarena_deck_archetypes?name=eq.' + encodeURIComponent(s.name) + '&cover_image_url=is.null',
            {
                method: 'patch',
                headers: Object.assign({}, headers, { 'Content-Type': 'application/json', Prefer: 'return=representation' }),
                payload: JSON.stringify({ cover_image_url: s.logoUrl }),
                muteHttpExceptions: true,
            }
        );
        const result = JSON.parse(res.getContentText() || '[]');
        if (result && result.length > 0) updated += result.length;
    });

    Logger.log('ロゴ画像を設定したアーキタイプ数: ' + updated);
}

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

    // Firebase（recommendedDecks/unionarena）へおすすめデッキを洗い替え（Supabaseと独立）
    _pushRecommendedToFirebase_('unionarena', {
        decks: decks.map(function (d) {
            return { deckCode: d.deckCode, tagCode: d.tagCode, deckName: d.deckName, imageUrl: d.imageUrl };
        }),
    });

    const headers = supabaseHeaders_(serviceKey);
    let inserted = 0;
    decks.forEach(function (deck) {
        const res = UrlFetchApp.fetch(supabaseUrl + '/rest/v1/unionarena_recommended_decks', {
            method: 'post',
            headers: Object.assign({}, headers, {
                'Content-Type': 'application/json',
                Prefer: 'resolution=merge-duplicates',
            }),
            payload: JSON.stringify({
                deck_code: deck.deckCode,
                tag_code: deck.tagCode || null,
                deck_name: deck.deckName || null,
                image_url: deck.imageUrl || null,
            }),
            muteHttpExceptions: true,
        });
        if (res.getResponseCode() < 300) inserted++;
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

function logToSheet_(total, inserted, skipped) {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('実行ログ')
        || SpreadsheetApp.getActiveSpreadsheet().insertSheet('実行ログ');
    if (sheet.getLastRow() === 0) {
        sheet.appendRow(['実行日時', '検出件数', '新規登録', 'スキップ']);
    }
    sheet.appendRow([new Date(), total, inserted, skipped]);
}

// ####################################################################
// ################  ガンダムカードゲーム（gundam_*）  ################
// ####################################################################
// 収集中は bandai を叩かず deck_code＋メタだけシートに集める。カードの中身は
// サイト表示時に gundamDeckParser が bandai から都度展開する（ユニアリと同型）。
// フロー: scrapeGundamToSheet（→シート）→ F列アーキタイプ手分類 → syncGundamSheetToSupabase

const GCG_RESULTS_URL = 'https://www.gundam-gcg.com/jp/tournament-results/';
const GCG_EVENT_BASE = 'https://www.gundam-gcg.com/jp/tournament-results/';
const GCG_SHEET_NAME = 'ガンダム大会デッキ';
const GCG_SLEEP_MIN_MS = 4000;              // リクエスト間の待機・下限（4秒）
const GCG_SLEEP_MAX_MS = 10000;             // リクエスト間の待機・上限（10秒）。毎回ランダム＝機械っぽさを消す
const GCG_TIME_BUDGET_MS = 4.5 * 60 * 1000; // 4.5分で中断→次回続行（GAS6分制限対策）

// 色の自動判定（同期時に deck_code→bandai から色を取得。ガンダムは1デッキ最大2色）
const GUNDAM_BANDAI_API = 'https://api.bandai-tcg-plus.com';
const GUNDAM_GAME_TITLE_ID = 15;
// 色名の固定並び順（同じ2色が必ず同じ名前になるように。実データのcolor表記に合わせて調整可）
const GCG_COLOR_ORDER = ['白', '青', '赤', '緑', '紫', '黒', '黄'];

function scrapeGundamToSheet() {
    const sheet = gcgGetSheet_();
    const known = gcgKnownDeckCodes_(sheet);
    const doneEvents = gcgLoadDoneEvents_();   // 処理済みイベントID（再実行はこれを丸ごと飛ばす）

    const start = new Date().getTime();
    const eventUrls = gcgParseEventUrls_(gcgFetchHtml_(GCG_RESULTS_URL));
    const remainingEvents = eventUrls.filter(function (u) { return !doneEvents[gcgEventId_(u)]; });
    Logger.log('検出イベント数: ' + eventUrls.length + ' / 未処理: ' + remainingEvents.length);

    const rows = [];
    let added = 0, skipped = 0, stoppedEarly = false, doneThisRun = 0;

    for (let ei = 0; ei < remainingEvents.length; ei++) {
        if (new Date().getTime() - start > GCG_TIME_BUDGET_MS) { stoppedEarly = true; break; }
        const eventUrl = remainingEvents[ei];

        let event;
        try {
            event = gcgParseEventPage_(gcgFetchHtml_(eventUrl));
        } catch (e) { Logger.log('イベント取得失敗: ' + eventUrl + ' / ' + e); continue; }
        gcgJitterSleep_();

        let eventCompleted = true;
        for (let pi = 0; pi < event.players.length; pi++) {
            if (new Date().getTime() - start > GCG_TIME_BUDGET_MS) { stoppedEarly = true; eventCompleted = false; break; }
            const p = event.players[pi];
            try {
                const pd = gcgFetchHtml_(p.deckPageUrl);
                gcgJitterSleep_();
                const m = pd.match(/deck_code=([A-Za-z0-9]+)/);
                if (!m) continue;
                const deckCode = m[1];
                if (known[deckCode]) { skipped++; continue; }
                known[deckCode] = true;
                rows.push([event.eventName, event.eventDate, p.rank, p.name, deckCode, '', '取得済 ' + gcgStamp_()]);
                added++;
            } catch (e) { Logger.log('プレイヤー処理失敗 (' + p.deckPageUrl + '): ' + e); }
        }
        // 全プレイヤーを最後まで処理し切ったイベントだけ「処理済み」に記録（途中中断は記録しない＝次回やり直す）
        if (eventCompleted) { doneEvents[gcgEventId_(eventUrl)] = true; doneThisRun++; }
        if (stoppedEarly) break;
    }

    if (rows.length) sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, 7).setValues(rows);
    gcgSaveDoneEvents_(doneEvents);
    Logger.log('シート追記: ' + added + ' / スキップ(既存): ' + skipped + ' / 完了イベント: ' + doneThisRun
        + (stoppedEarly ? ' （中断・次回続行）' : ' （全イベント完了）'));
    gcgLog_('scrape', eventUrls.length, added, skipped, stoppedEarly);
}

function syncGundamSheetToSupabase() {
    const props = PropertiesService.getScriptProperties();
    const supabaseUrl = props.getProperty('SUPABASE_URL');
    const serviceKey = props.getProperty('SUPABASE_SERVICE_ROLE_KEY');
    if (!supabaseUrl || !serviceKey) throw new Error('スクリプトプロパティ SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY を設定してください');

    const sheet = gcgGetSheet_();
    const last = sheet.getLastRow();
    if (last < 2) { Logger.log('データなし'); return; }
    const values = sheet.getRange(2, 1, last - 1, 7).getValues();

    const archetypeCache = {};
    const start = new Date().getTime();
    let synced = 0, already = 0, stoppedEarly = false;
    for (let i = 0; i < values.length; i++) {
        if (new Date().getTime() - start > GCG_TIME_BUDGET_MS) { stoppedEarly = true; break; }
        const r = values[i];
        const eventName = String(r[0] || '').trim();
        // B列がGoogleに日付型と解釈された場合、getValuesはDateで返る → "M/D" に整形（生Date文字列化を防ぐ）
        const eDateRaw = r[1];
        const eventDate = (eDateRaw instanceof Date && !isNaN(eDateRaw.getTime()))
            ? ((eDateRaw.getMonth() + 1) + '/' + eDateRaw.getDate())
            : String(eDateRaw || '').trim();
        const rank = String(r[2] || '').trim();
        const deckCode = String(r[4] || '').trim();
        let archetype = String(r[5] || '').trim();
        const status = String(r[6] || '');
        if (!deckCode) continue;
        if (status.indexOf('同期済') !== -1) { already++; continue; }

        // F列が空なら bandai から色を判定してアーキタイプに使う（F列に書き戻して以後は再取得しない）
        if (!archetype) {
            const colors = gcgFetchDeckColors_(deckCode);
            Utilities.sleep(1000 + Math.floor(Math.random() * 1500)); // bandaiは1〜2.5秒（大規模APIなので短め）
            if (colors) {
                archetype = colors;
                sheet.getRange(i + 2, 6).setValue(colors); // F列に書き戻し（キャッシュ）
            } else {
                archetype = '未分類';
            }
        }

        try {
            const archetypeId = gcgGetOrCreateArchetype_(supabaseUrl, serviceKey, archetypeCache, archetype);
            gcgUpsertDeck_(supabaseUrl, serviceKey, { deckCode: deckCode, archetypeId: archetypeId, rank: rank || null, eventDate: eventDate || null, eventName: eventName || null });
            sheet.getRange(i + 2, 7).setValue('同期済 ' + gcgStamp_());
            synced++;
        } catch (e) {
            sheet.getRange(i + 2, 7).setValue('エラー: ' + e);
            Logger.log('同期失敗 (' + deckCode + '): ' + e);
        }
    }
    Logger.log('同期: ' + synced + ' / 既に同期済: ' + already + (stoppedEarly ? ' （中断・次回続行）' : ' （完了）'));
    gcgLog_('sync', values.length, synced, already, stoppedEarly);

    // --- Firebase（environmentDecks/gundam）へ、シート全件を洗い替えで反映（Supabaseの成否と独立）---
    _pushEnvDecksToFirebase_('gundam', gcgSheetEnvDecks_(sheet));
}

// シート全行 → env-decks 形（Firebase）。deck_code 重複は排除、F列アーキタイプ（色）未設定は「未分類」。
function gcgSheetEnvDecks_(sheet) {
    const last = sheet.getLastRow();
    if (last < 2) return [];
    const values = sheet.getRange(2, 1, last - 1, 7).getValues();
    const out = [];
    const seen = {};
    for (let i = 0; i < values.length; i++) {
        const r = values[i];
        const deckCode = String(r[4] || '').trim();
        if (!deckCode || seen[deckCode]) continue;
        seen[deckCode] = true;
        const eDateRaw = r[1];
        const eventDate = (eDateRaw instanceof Date && !isNaN(eDateRaw.getTime()))
            ? ((eDateRaw.getMonth() + 1) + '/' + eDateRaw.getDate())
            : String(eDateRaw || '').trim();
        out.push({
            deckCode: deckCode,
            archetype: String(r[5] || '').trim() || '未分類',
            eventName: String(r[0] || '').trim(),
            eventDate: eventDate,
            rank: String(r[2] || '').trim(),
        });
    }
    return out;
}

// メニュー用：Supabaseを触らずガンダムのFirebaseだけ再送（シート現状を洗い替え）
function pushGundamToFirebaseOnly() {
    _pushEnvDecksToFirebase_('gundam', gcgSheetEnvDecks_(gcgGetSheet_()));
}

function gcgFetchHtml_(url) {
    const res = UrlFetchApp.fetch(url, {
        muteHttpExceptions: true,
        headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36' },
    });
    if (res.getResponseCode() !== 200) throw new Error('取得失敗 ' + res.getResponseCode() + ' ' + url);
    return res.getContentText();
}

function gcgParseEventUrls_(html) {
    const set = {};
    const re = /event\.php\?series=(\d+)&(?:amp;)?event=(\d+)/g;
    let m;
    while ((m = re.exec(html))) set[GCG_EVENT_BASE + 'event.php?series=' + m[1] + '&event=' + m[2]] = true;
    return Object.keys(set);
}

function gcgParseEventPage_(html) {
    const titleMatch = html.match(/<title>([^<|]+)/);
    const eventName = titleMatch ? gcgDecode_(titleMatch[1].trim()) : '';
    const dateMatch = html.match(/(20\d{2})[.\/](\d{1,2})[.\/](\d{1,2})/);
    const eventDate = dateMatch ? (parseInt(dateMatch[2], 10) + '/' + parseInt(dateMatch[3], 10)) : '';

    const players = [];
    const liRe = /<li class="userListDetail">([\s\S]*?)<\/li>/g;
    let li;
    while ((li = liRe.exec(html))) {
        const b = li[1];
        const noMatch = b.match(/players_deck\.php\?series=(\d+)&(?:amp;)?event=(\d+)&(?:amp;)?no=(\d+)/);
        if (!noMatch) continue;
        const rankMatch = b.match(/userInfoRank[^>]*>\s*([^<]+?)\s*</);
        const nameMatch = b.match(/userInfoName[^>]*>\s*([^<]+?)\s*</);
        players.push({
            rank: rankMatch ? gcgDecode_(rankMatch[1].trim()) : '',
            name: nameMatch ? gcgDecode_(nameMatch[1].trim()) : '',
            deckPageUrl: GCG_EVENT_BASE + 'players_deck.php?series=' + noMatch[1] + '&event=' + noMatch[2] + '&no=' + noMatch[3],
        });
    }
    return { eventName: eventName, eventDate: eventDate, players: players };
}

function gcgHeaders_(serviceKey) { return { apikey: serviceKey, Authorization: 'Bearer ' + serviceKey }; }

function gcgGetOrCreateArchetype_(supabaseUrl, serviceKey, cache, name) {
    if (cache[name]) return cache[name];
    const headers = gcgHeaders_(serviceKey);
    const searchRes = UrlFetchApp.fetch(
        supabaseUrl + '/rest/v1/gundam_deck_archetypes?name=eq.' + encodeURIComponent(name) + '&select=id',
        { headers: headers, muteHttpExceptions: true });
    const existing = JSON.parse(searchRes.getContentText() || '[]');
    if (existing.length > 0) { cache[name] = existing[0].id; return existing[0].id; }
    const createRes = UrlFetchApp.fetch(supabaseUrl + '/rest/v1/gundam_deck_archetypes', {
        method: 'post',
        headers: Object.assign({}, headers, { 'Content-Type': 'application/json', Prefer: 'return=representation' }),
        payload: JSON.stringify({ name: name }), muteHttpExceptions: true });
    const created = JSON.parse(createRes.getContentText() || '[]');
    if (!created[0]) throw new Error('アーキタイプ作成失敗: ' + name + ' / ' + createRes.getContentText());
    cache[name] = created[0].id;
    return created[0].id;
}

function gcgUpsertDeck_(supabaseUrl, serviceKey, deck) {
    const headers = gcgHeaders_(serviceKey);
    const res = UrlFetchApp.fetch(
        supabaseUrl + '/rest/v1/gundam_deck_records?on_conflict=deck_code',
        {
            method: 'post',
            headers: Object.assign({}, headers, { 'Content-Type': 'application/json', Prefer: 'resolution=merge-duplicates,return=minimal' }),
            payload: JSON.stringify({
                deck_code: deck.deckCode,
                archetype_id: deck.archetypeId,
                event_rank: deck.rank,
                event_date: deck.eventDate,
                event_location: deck.eventName,
            }),
            muteHttpExceptions: true,
        });
    if (res.getResponseCode() >= 300) throw new Error('登録失敗: ' + deck.deckCode + ' / ' + res.getContentText());
}

function gcgGetSheet_() {
    const ss = SpreadsheetApp.getActiveSpreadsheet();
    let sheet = ss.getSheetByName(GCG_SHEET_NAME);
    if (!sheet) {
        sheet = ss.insertSheet(GCG_SHEET_NAME);
        sheet.getRange(1, 1, 1, 7).setValues([['大会名', '開催日', '順位', 'プレイヤー', 'deck_code', 'アーキタイプ', '状態']]);
        sheet.getRange(1, 1, 1, 7).setFontWeight('bold').setBackground('#eef2f7');
        sheet.setFrozenRows(1);
    }
    return sheet;
}

function gcgKnownDeckCodes_(sheet) {
    const known = {};
    const last = sheet.getLastRow();
    if (last < 2) return known;
    sheet.getRange(2, 5, last - 1, 1).getValues().forEach(function (r) {
        const c = String(r[0] || '').trim(); if (c) known[c] = true;
    });
    return known;
}

// event.php?...&event=<ID> の <ID> を取り出す（処理済み判定のキー）
function gcgEventId_(url) {
    const m = String(url).match(/event=(\d+)/);
    return m ? m[1] : url;
}

// 処理済みイベントIDの集合をスクリプトプロパティから読む
function gcgLoadDoneEvents_() {
    try {
        const raw = PropertiesService.getScriptProperties().getProperty('GCG_DONE_EVENTS');
        if (!raw) return {};
        const arr = JSON.parse(raw);
        const map = {};
        arr.forEach(function (id) { map[id] = true; });
        return map;
    } catch (e) { return {}; }
}

// 処理済みイベントIDの集合を保存
function gcgSaveDoneEvents_(map) {
    try {
        PropertiesService.getScriptProperties().setProperty('GCG_DONE_EVENTS', JSON.stringify(Object.keys(map)));
    } catch (e) { Logger.log('done保存失敗: ' + e); }
}

function gcgDecode_(str) {
    return str.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/〜/g, '～');
}

function gcgStamp_() { return Utilities.formatDate(new Date(), 'JST', 'MM/dd HH:mm'); }

// リクエスト間の待機をランダム化（4〜10秒）。一定間隔の「機械っぽさ」を消す。
function gcgJitterSleep_() {
    Utilities.sleep(GCG_SLEEP_MIN_MS + Math.floor(Math.random() * (GCG_SLEEP_MAX_MS - GCG_SLEEP_MIN_MS + 1)));
}

// deck_code → bandai recipe から色を判定して「白」「白緑」等を返す（ガンダム最大2色）。
// 出てくる色（無色は除外）を固定順で並べる。取得失敗時は '' を返す。
function gcgFetchDeckColors_(deckCode) {
    try {
        const ucRes = UrlFetchApp.fetch(GUNDAM_BANDAI_API + '/api/user/deck/url_code?deck_code=' + encodeURIComponent(deckCode), { muteHttpExceptions: true });
        if (ucRes.getResponseCode() !== 200) return '';
        const uc = JSON.parse(ucRes.getContentText());
        const urlCode = uc && uc.success && uc.success.url_code;
        if (!urlCode) return '';
        const rcRes = UrlFetchApp.fetch(
            GUNDAM_BANDAI_API + '/api/user/deck/recipe?url_code=' + encodeURIComponent(urlCode)
            + '&game_title_id=' + GUNDAM_GAME_TITLE_ID + '&encode=0',
            { muteHttpExceptions: true }
        );
        if (rcRes.getResponseCode() !== 200) return '';
        const success = JSON.parse(rcRes.getContentText()).success;
        if (!success) return '';
        const seen = {};
        (success.main_deck || []).forEach(function (c) {
            const col = String(c.color || '').trim();
            if (col && col !== '無色' && col !== '-' && col !== 'なし') seen[col] = true;
        });
        const colors = Object.keys(seen).sort(function (a, b) { return gcgColorRank_(a) - gcgColorRank_(b); });
        return colors.slice(0, 2).join(''); // ルール上最大2色
    } catch (e) {
        Logger.log('色判定失敗 (' + deckCode + '): ' + e);
        return '';
    }
}

function gcgColorRank_(color) {
    const idx = GCG_COLOR_ORDER.indexOf(color);
    return idx === -1 ? 99 : idx;
}

function gcgLog_(kind, total, ok, other, stoppedEarly) {
    try {
        const ss = SpreadsheetApp.getActiveSpreadsheet();
        const sheet = ss.getSheetByName('ガンダム実行ログ') || ss.insertSheet('ガンダム実行ログ');
        if (sheet.getLastRow() === 0) sheet.appendRow(['実行日時', '種別', '件数', 'OK', 'その他', '状態']);
        sheet.appendRow([new Date(), kind, total, ok, other, stoppedEarly ? '中断(次回続行)' : '完了']);
    } catch (e) { Logger.log('ログ失敗: ' + e); }
}
