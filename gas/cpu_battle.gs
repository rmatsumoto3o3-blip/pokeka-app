/**
 * CPU対戦＋ログ 統合 GAS Web App（1スプレッドシート・1デプロイ・1URL）
 *
 * 役割：
 *  ① CPU思考(think)：盤面(state)＋合法手(legalMoves)を受け取り、採点して1手返す
 *  ② 対戦ログ(log)：CPU対戦の結果を battle_logs タブに追記
 *  ③ 一人回しログ(practice_log)：一般ユーザーの匿名プレイを practice_logs タブに追記
 *  ④ ログ取得(doGet ?dump=practice)：practice_logs の最新行をJSONで返す（分析用）
 *
 * 方針：ルール（合法手の生成・適用・勝敗判定）はブラウザ側エンジンが担当。GASは軽量。
 *       CORS回避：クライアントは Content-Type: text/plain でPOST。GASはJSON文字列を返す。
 *
 * デプロイ：Apps Script に貼り、[デプロイ]→[ウェブアプリ]（実行=自分／アクセス=全員）。
 *
 * ---- 通信契約 ----
 * 思考: { action:"think", state:{...}, legalMoves:[...] } → { ok, moveIndex, reason }
 * 対戦ログ: { action:"log", game:{ user, humanDeck, cpuDeck, result, turns, trace, cpuVersion } } → { ok, logId }
 * 一人回しログ: { action:"practice_log", session_id, deck_code, events:[{t,ts,p,...}], meta } → { ok, n }
 * ログ取得(GET): ?dump=practice&n=300 → { ok, count, rows:[[受信時刻, session, deck, type, ts, player, event_json, meta], ...] }
 */

// 思考の重み（ここを触れば強さ/性格が変わる。後で設定シート化も可）
var WEIGHTS = {
  ko: 100,          // 相手をきぜつさせる
  damage: 0.3,      // 与ダメージ1あたり
  selfDamage: -0.2, // 自分に乗る反動ダメージ1あたり
  attachToAttacker: 12, // アタッカーにエネを付ける（攻撃準備）
  evolve: 14,       // 進化して盤面強化
  draw: 8,          // 手札が細い時のドロー
  drawLowHandBonus: 2,  // 手札が少ないほどドローの価値↑（1枚不足あたり）
  search: 9,        // 必要札サーチ
  bench: 6,         // ベンチ展開（盤面の厚み）
  benchOverextendPenalty: -4, // 展開しすぎ（既に3体以上）
  retreat: 3,       // 逃げ（不利な前を下げる）
  retreatCostPenalty: -1.5,   // 逃げエネ1あたり
  pass: -50         // 何もしないは最低評価（他に手があれば選ばない）
};

var LOG_SHEET_NAME = 'battle_logs';
var PRACTICE_SHEET_NAME = 'practice_logs';

// ============================ POST ルーティング ============================
function doPost(e) {
  try {
    var body = JSON.parse((e && e.postData && e.postData.contents) || '{}');
    if (body.action === 'think') return json_(think_(body));
    if (body.action === 'log') return json_(log_(body));
    if (body.action === 'practice_log') return json_(practiceLog_(body));
    return json_({ ok: false, error: 'unknown action' });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

// ============================ GET（疎通確認 ＋ ログ取得） ============================
function doGet(e) {
  var p = (e && e.parameter) || {};
  if (p.dump === 'practice') {
    var sh = getPracticeSheet_();
    var last = sh.getLastRow();
    var n = Math.min(parseInt(p.n || '300', 10) || 300, 3000);
    var start = Math.max(2, last - n + 1); // 1行目はヘッダ
    var rows = last >= 2 ? sh.getRange(start, 1, last - start + 1, 8).getValues() : [];
    return json_({ ok: true, count: rows.length, rows: rows });
  }
  return json_({ ok: true, service: 'cpu_battle', now: new Date().toISOString() });
}

// ============================ ① 思考 ============================
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
      var deficit = Math.max(0, 5 - (st.myHand || 0)); // 手札5枚を基準に不足ぶん
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
    default: score += 1; // 未知タイプは最小の正
  }
  return { score: score, reason: reason };
}

// ============================ ② 対戦ログ（battle_logs） ============================
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

// ============================ ③ 一人回しログ（practice_logs） ============================
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

// ============================ 共通 ============================
function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
