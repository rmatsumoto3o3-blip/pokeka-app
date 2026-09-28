#!/usr/bin/env node
/**
 * シティリーグ収集データ（data/city/city_results_*.json）のデッキコードを
 * www.pokemon-card.com のデッキ確認ページから解決し、カード採用率を算出する。
 *
 * ・players.pokemon-card.com は Cloudflare で素の fetch を弾くが、
 *   デッキ確認ページ(www.pokemon-card.com/deck/confirm.html)は Node fetch 可。
 * ・デッキ解決結果は data/city/deck_cache.json にキャッシュ（再実行で再取得しない）。
 * ・公式サイトへの配慮で 1件ごとにランダム待機（既定 1.2〜2.4s）。本番はさらに遅く。
 *
 * 使い方:
 *   node scripts/city/resolve_adoption.mjs --in data/city/city_results_20260926-27.json \
 *     --limit 24 --league オープン --delayMin 1200 --delayMax 2400
 */
import fs from 'fs';
import path from 'path';

const args = Object.fromEntries(process.argv.slice(2).reduce((a, v, i, arr) => {
  if (v.startsWith('--')) a.push([v.slice(2), arr[i + 1] && !arr[i + 1].startsWith('--') ? arr[i + 1] : true]);
  return a;
}, []));

const IN = args.in || 'data/city/city_results_20260926-27.json';
const LIMIT = args.limit ? parseInt(args.limit, 10) : Infinity;
const LEAGUE = args.league || null;             // 例: オープン（未指定なら全リーグ）
const DELAY_MIN = parseInt(args.delayMin || '1200', 10);
const DELAY_MAX = parseInt(args.delayMax || '2400', 10);
const CACHE_PATH = 'data/city/deck_cache.json';
const OUT_PATH = args.out || 'data/city/adoption_city.json';

const sleep = (ms) => new Promise(r => setTimeout(r, ms));
const rnd = (a, b) => a + Math.floor(Math.random() * (b - a));

const INPUT_TYPE = {
  deck_pke: 'Pokémon', deck_gds: 'Item', deck_tool: 'Pokémon Tool',
  deck_sup: 'Supporter', deck_sta: 'Stadium', deck_ene: 'Energy',
  deck_tech: 'Technical Machine', deck_ajs: 'Item',
};

// デッキ確認ページHTML → [{name, quantity, supertype, image}]
function parseDeck(html) {
  const names = {};
  for (const m of html.matchAll(/PCGDECK\.searchItemName\[(\d+)\]='([^']*)';/g)) names[m[1]] = m[2];
  const namesAlt = {};
  for (const m of html.matchAll(/PCGDECK\.searchItemNameAlt\[(\d+)\]='([^']*)';/g)) namesAlt[m[1]] = m[2];
  const pict = {};
  for (const m of html.matchAll(/PCGDECK\.searchItemCardPict\[(\d+)\]='([^']*)';/g)) pict[m[1]] = m[2];
  if (Object.keys(names).length === 0) return null;

  const cards = [];
  for (const inputId of Object.keys(INPUT_TYPE)) {
    let val = '';
    let m = html.match(new RegExp(`<input[^>]*id=["']${inputId}["'][^>]*value=["']([^"']*)["']`, 'i'));
    if (m) val = m[1];
    else { const r = html.match(new RegExp(`<input[^>]*value=["']([^"']*)["'][^>]*id=["']${inputId}["']`, 'i')); if (r) val = r[1]; }
    if (!val) continue;
    for (const entry of val.split('-')) {
      const p = entry.split('_');
      if (p.length >= 2) {
        const id = p[0], qty = parseInt(p[1], 10);
        if (id && qty && (names[id] || namesAlt[id])) {
          cards.push({
            name: namesAlt[id] || names[id],
            quantity: qty,
            supertype: INPUT_TYPE[inputId],
            image: pict[id] ? `https://www.pokemon-card.com${pict[id]}` : null,
          });
        }
      }
    }
  }
  return cards;
}

async function fetchDeck(code) {
  const url = `https://www.pokemon-card.com/deck/confirm.html/deckID/${code}`;
  const res = await fetch(url, {
    headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120 Safari/537.36' },
  });
  if (!res.ok) throw new Error('HTTP ' + res.status);
  return parseDeck(await res.text());
}

function loadJSON(p, def) { try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return def; } }

(async () => {
  const events = loadJSON(IN, []);
  const cache = loadJSON(CACHE_PATH, {});
  fs.mkdirSync(path.dirname(CACHE_PATH), { recursive: true });

  // 対象デッキ（リーグ絞り込み・重複コードは1回だけ解決）
  const rows = [];
  for (const ev of events) {
    if (LEAGUE && ev.league !== LEAGUE) continue;
    for (const r of ev.results) if (r.deck_id) rows.push({ deck_id: r.deck_id, rank: r.rank, league: ev.league });
  }
  // 各デッキの最上位順位を控え、上位（1〜4位）から先に解決する
  const bestRank = {};
  for (const r of rows) bestRank[r.deck_id] = Math.min(bestRank[r.deck_id] ?? 99, r.rank);
  const uniqueCodes = [...new Set(rows.map(r => r.deck_id))]
    .sort((a, b) => (bestRank[a] - bestRank[b]));
  const todo = uniqueCodes.filter(c => !cache[c]).slice(0, LIMIT === Infinity ? undefined : LIMIT);

  console.log(`events=${events.length} targetDecks=${rows.length} uniqueCodes=${uniqueCodes.length} toFetch=${todo.length} cached=${uniqueCodes.length - todo.length}`);

  let ok = 0, fail = 0;
  for (let i = 0; i < todo.length; i++) {
    const code = todo[i];
    try {
      const cards = await fetchDeck(code);
      if (cards && cards.length) { cache[code] = cards; ok++; }
      else { cache[code] = null; fail++; }
    } catch (e) { cache[code] = null; fail++; process.stderr.write(`  ! ${code} ${e.message}\n`); }
    if ((i + 1) % 10 === 0 || i === todo.length - 1) {
      fs.writeFileSync(CACHE_PATH, JSON.stringify(cache));
      process.stdout.write(`  resolved ${i + 1}/${todo.length} (ok=${ok} fail=${fail})\n`);
    }
    if (i < todo.length - 1) await sleep(rnd(DELAY_MIN, DELAY_MAX));
  }
  fs.writeFileSync(CACHE_PATH, JSON.stringify(cache));

  // 採用率算出（解決済みデッキのみを母数に）
  const resolved = rows.filter(r => Array.isArray(cache[r.deck_id]));
  const totalDecks = resolved.length;
  const cardDeckCount = {};   // カード名 -> 含むデッキ数
  for (const r of resolved) {
    const uniqNames = new Set(cache[r.deck_id].map(c => c.name));
    for (const n of uniqNames) cardDeckCount[n] = (cardDeckCount[n] || 0) + 1;
  }
  const adoption = Object.entries(cardDeckCount)
    .map(([name, decks]) => ({ name, decks, rate: +(decks / totalDecks * 100).toFixed(1) }))
    .sort((a, b) => b.decks - a.decks);

  const out = { generatedAt: new Date().toISOString(), scope: LEAGUE || 'all', totalDecks, cards: adoption };
  fs.writeFileSync(OUT_PATH, JSON.stringify(out, null, 2));
  console.log(`\n採用率(母数 ${totalDecks}デッキ / scope=${out.scope}) 上位20:`);
  for (const c of adoption.slice(0, 20)) console.log(`  ${String(c.rate).padStart(5)}%  ${String(c.decks).padStart(3)}  ${c.name}`);
  console.log(`\n-> ${OUT_PATH}`);
})();
