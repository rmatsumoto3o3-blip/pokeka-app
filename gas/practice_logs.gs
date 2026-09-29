/**
 * 一人回しプレイログ専用 GAS Web App（CPU思考GASとは別プロジェクトにする）。
 * ※ CPU対戦の思考(cpu_battle)とはクォータ・速度を分離するため、必ず別スプレッドシート＋別デプロイにする。
 *
 * デプロイ手順:
 *   1. 新しいスプレッドシートを用意（ここに practice_logs シートが自動作成される）
 *   2. 拡張機能 → Apps Script にこのコードを貼り付け
 *   3. デプロイ → 新しいデプロイ → 種類「ウェブアプリ」
 *        実行するユーザー=自分 / アクセスできるユーザー=全員
 *   4. 発行された /exec URL を Vercel と .env.local の NEXT_PUBLIC_PRACTICE_LOG_URL に設定
 *
 * 受信(POST body = JSON文字列):
 *   { action:"practice_log", session_id, deck_code, events:[{t, ts, p, ...}], meta }
 *   （action は無視してもよい。events があれば追記する）
 * → 1イベント=1行で practice_logs シートに追記。Supabaseは使わない。
 */

var PRACTICE_SHEET_NAME = 'practice_logs';

function doPost(e) {
  try {
    var body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    var events = body.events || [];
    if (!events.length) return json_({ ok: true, n: 0 });

    var sh = getPracticeSheet_();
    var now = new Date();
    var sid = String(body.session_id || '');
    var deck = String(body.deck_code || '');
    var metaStr = body.meta ? JSON.stringify(body.meta) : '';
    var rows = events.map(function (ev) {
      return [now, sid, deck, String(ev.t || ''), ev.ts || '', ev.p || '', JSON.stringify(ev), metaStr];
    });
    sh.getRange(sh.getLastRow() + 1, 1, rows.length, rows[0].length).setValues(rows);
    return json_({ ok: true, n: rows.length });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

function doGet() {
  return json_({ ok: true, service: 'practice_logs', now: new Date().toISOString() });
}

function getPracticeSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(PRACTICE_SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(PRACTICE_SHEET_NAME);
    sh.appendRow(['received_at', 'session_id', 'deck_code', 'type', 'ts_ms', 'player', 'event_json', 'meta']);
  }
  return sh;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
