/**
 * CPU対戦＋一人回しログ 統合 GAS Web App（1スプレッドシート・1デプロイ・1URL）
 * 役割：①CPU思考(think) ②対戦ログ(log→battle_logsタブ) ③一人回しログ(practice_log→practice_logsタブ)
 *
 * 方針：GASのクォータはGoogleアカウント単位なので、GASを分けても隔離にならない。
 *       1プロジェクトで action により振り分け、タブだけ分ける。過負荷対策はクライアントの
 *       バッチ送信＋（必要なら）%サンプリングで行う。
 *  - CORS回避：クライアントは Content-Type: text/plain でPOST。GASはJSON文字列を返す。
 *
 * デプロイ：Apps Script に貼り、[デプロイ]→[ウェブアプリ]（実行=自分／アクセス=全員）。
 *   発行URLを CPU思考(CPU_ENDPOINT) と 一人回しログ(NEXT_PUBLIC_PRACTICE_LOG_URL) の両方に使う。
 *
 * ---- 通信契約 ----
 * 思考: { action:"think", state:{...}, legalMoves:[...] } → { ok, moveIndex, reason }
 * 対戦ログ: { action:"log", game:{...} } → { ok, logId }
 * 一人回しログ: { action:"practice_log", session_id, deck_code, events:[{t,ts,p,...}], meta } → { ok, n }
 */

// 思考の重み（ここを触れば強さ/性格が変わる。後で設定シート化も可）
var WEIGHTS = {
  ko: 100,
  damage: 0.3,
  selfDamage: -0.2,
  attachToAttacker: 12,
  evolve: 14,
  draw: 8,
  drawLowHandBonus: 2,
  search: 9,
  bench: 6,
  benchOverextendPenalty: -4,
  retreat: 3,
  retreatCostPenalty: -1.5,
  pass: -50
};

var LOG_SHEET_NAME = 'battle_logs';
var PRACTICE_SHEET_NAME = 'practice_logs';

function doPost(e) {
  try {
    var body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    if (body.action === 'think') return json_(think_(body));
    if (body.action === 'log')   return json_(log_(body));
    if (body.action === 'practice_log') return json_(practiceLog_(body));
    return json_({ ok: false, error: 'unknown action' });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

// 疎通確認用
function doGet() {
  return json_({ ok: true, service: 'cpu_battle', now: new Date().toISOString() });
}

// ---- 思考：合法手を採点して最善を返す ----
function think_(body) {
  var state = body.state || {};
  var moves = body.legalMoves || [];
  if (!moves.length) return { ok: true, moveIndex: -1, reason: '合法手なし' };

  var best = -Infinity, bestIdx = 0, bestReason = '';
  for (var i = 0; i < moves.length; i++) {
    var s = scoreMove_(moves[i], state);
    if (s.score > best) { best = s.score; bestIdx = i; bestReason = s.reason; }
  }
  return { ok: true, moveIndex: bestIdx, reason: bestReason, score: best };
}

function scoreMove_(m, st) {
  var w = WEIGHTS, score = 0, reason = m.type;
  switch (m.type) {
    case 'attack':
      score += (m.damage || 0) * w.damage;
      score += (m.selfDamage || 0) * w.selfDamage;
      if (m.koTarget) { score += w.ko; reason = 'KOできる攻撃'; }
      else reason = '攻撃';
      break;
    case 'attachEnergy':
      score += m.toAttacker ? w.attachToAttacker : (w.attachToAttacker * 0.4);
      reason = 'エネ加速';
      break;
    case 'evolve': score += w.evolve; reason = '進化'; break;
    case 'draw': {
      var deficit = Math.max(0, 5 - (st.myHand || 0));
      score += w.draw + deficit * w.drawLowHandBonus;
      reason = 'ドロー';
      break;
    }
    case 'search': score += w.search; reason = 'サーチ'; break;
    case 'bench':
      score += w.bench + ((st.myBench || 0) >= 3 ? w.benchOverextendPenalty : 0);
      reason = 'ベンチ展開';
      break;
    case 'retreat':
      score += w.retreat + (m.cost || 0) * w.retreatCostPenalty;
      reason = '逃げ';
      break;
    case 'pass': score += w.pass; reason = 'パス'; break;
    default: score += 1;
  }
  return { score: score, reason: reason };
}

// ---- 対戦ログ保存：battle_logs に1行追記 ----
function log_(body) {
  var g = body.game || {};
  var sh = getLogSheet_();
  var logId = Utilities.getUuid();
  var now = new Date();
  var trace = '';
  try { trace = JSON.stringify(g.trace || []); } catch (e2) { trace = ''; }
  if (trace.length > 45000) trace = trace.slice(0, 45000) + '…(truncated)';
  sh.appendRow([
    now, logId, g.user || '', g.humanDeck || '', g.cpuDeck || '',
    g.result || '', g.turns || '', g.cpuVersion || '', trace
  ]);
  return { ok: true, logId: logId };
}

function getLogSheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sh = ss.getSheetByName(LOG_SHEET_NAME);
  if (!sh) {
    sh = ss.insertSheet(LOG_SHEET_NAME);
    sh.appendRow(['createdAt', 'logId', 'user', 'humanDeck', 'cpuDeck', 'result', 'turns', 'cpuVersion', 'trace']);
  }
  return sh;
}

// ---- 一人回しログ保存：1イベント=1行で practice_logs に追記 ----
function practiceLog_(body) {
  var events = body.events || [];
  if (!events.length) return { ok: true, n: 0 };
  var sh = getPracticeSheet_();
  var now = new Date();
  var sid = String(body.session_id || '');
  var deck = String(body.deck_code || '');
  var metaStr = body.meta ? JSON.stringify(body.meta) : '';
  var rows = events.map(function (ev) {
    return [now, sid, deck, String(ev.t || ''), ev.ts || '', ev.p || '', JSON.stringify(ev), metaStr];
  });
  sh.getRange(sh.getLastRow() + 1, 1, rows.length, rows[0].length).setValues(rows);
  return { ok: true, n: rows.length };
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
