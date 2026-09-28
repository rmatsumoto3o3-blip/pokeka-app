/**
 * 一人回しプレイログ受け口（Google スプレッドシート追記）。
 *
 * デプロイ手順:
 *   1. スプレッドシートを1つ用意（ここに practice_logs シートが自動作成される）
 *   2. 拡張機能 → Apps Script にこのコードを貼り付け
 *   3. デプロイ → 新しいデプロイ → 種類「ウェブアプリ」
 *        - 実行するユーザー: 自分
 *        - アクセスできるユーザー: 全員
 *   4. 発行された /exec URL を Vercel の環境変数 NEXT_PUBLIC_PRACTICE_LOG_URL に設定
 *
 * 受信(POST body = JSON文字列):
 *   { session_id, deck_code, events: [{t, ts, ...}], meta }
 * → 1イベント=1行で practice_logs シートに追記（Supabaseは使わない）。
 */

function doPost(e) {
  try {
    var body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    var events = body.events || [];
    if (!events.length) return _json_({ ok: true, n: 0 });

    var sh = _practiceSheet_();
    var now = new Date();
    var sid = String(body.session_id || '');
    var deck = String(body.deck_code || '');
    var metaStr = body.meta ? JSON.stringify(body.meta) : '';
    var rows = events.map(function (ev) {
      return [now, sid, deck, String(ev.t || ''), ev.ts || '', ev.p || '', JSON.stringify(ev), metaStr];
    });
    sh.getRange(sh.getLastRow() + 1, 1, rows.length, rows[0].length).setValues(rows);
    return _json_({ ok: true, n: rows.length });
  } catch (err) {
    return _json_({ ok: false, error: String(err) });
  }
}

function doGet() {
  return _json_({ ok: true, msg: 'practice log endpoint' });
}

function _practiceSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName('practice_logs');
  if (!sh) {
    sh = ss.insertSheet('practice_logs');
    sh.appendRow(['received_at', 'session_id', 'deck_code', 'type', 'ts_ms', 'player', 'event_json', 'meta']);
  }
  return sh;
}

function _json_(o) {
  return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON);
}
