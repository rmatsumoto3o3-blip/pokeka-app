// 海外(国際Standard)の英語カード名・アーキタイプ名 → 日本語名 辞書。
// Limitless由来データは英語名のみのため、ここで日本語へ変換する。
// 辞書に無いものは英語名のまま表示（誤訳を出さない方針）。新カードは随時追記。
// キーは normalizeName() で正規化した英語名（小文字・英数字のみ）。

export function normalizeName(s: string): string {
    return (s || '').toLowerCase().replace(/[^a-z0-9]/g, '')
}

// ---- カード名 EN → JA ----
const CARD_PAIRS: [string, string][] = [
    // 基本エネルギー
    ['Grass Energy', '基本草エネルギー'], ['Basic Grass Energy', '基本草エネルギー'],
    ['Fire Energy', '基本炎エネルギー'], ['Basic Fire Energy', '基本炎エネルギー'],
    ['Water Energy', '基本水エネルギー'], ['Basic Water Energy', '基本水エネルギー'],
    ['Lightning Energy', '基本雷エネルギー'], ['Basic Lightning Energy', '基本雷エネルギー'],
    ['Psychic Energy', '基本超エネルギー'], ['Basic Psychic Energy', '基本超エネルギー'],
    ['Fighting Energy', '基本闘エネルギー'], ['Basic Fighting Energy', '基本闘エネルギー'],
    ['Darkness Energy', '基本悪エネルギー'], ['Basic Darkness Energy', '基本悪エネルギー'],
    ['Metal Energy', '基本鋼エネルギー'], ['Basic Metal Energy', '基本鋼エネルギー'],
    // 特殊エネルギー
    ['Telepathic Psychic Energy', 'テレパス超エネルギー'],
    ['Legacy Energy', 'レガシーエネルギー'], ['Prism Energy', 'プリズムエネルギー'],
    ['Neo Upper Energy', 'ネオアッパーエネルギー'], ['Jet Energy', 'ジェットエネルギー'],
    ['Reversal Energy', 'リバーサルエネルギー'], ['Double Turbo Energy', 'ダブルターボエネルギー'],
    ['Boomerang Energy', 'ブーメランエネルギー'], ['Mist Energy', 'ミストエネルギー'],
    // サポート
    ['Iono', 'ナンジャモ'], ["Boss's Orders", 'ボスの指令'], ["Professor's Research", '博士の研究'],
    ['Arven', 'ペパー'], ['Roxanne', 'ツツジ'], ['Judge', 'ジャッジマン'], ['Kieran', 'スグリ'],
    ['Carmine', 'カルミ'], ['Briar', 'ブライア'], ['Crispin', 'クリスピン'], ['Cyrano', 'サザレ'],
    ['Dawn', 'ヒカリ'], ["Lana's Aid", 'スイレンのお世話'], ["Lillie's Determination", 'リーリエの決心'],
    ["Team Rocket's Petrel", 'ロケット団のプルート'],
    // グッズ
    ['Ultra Ball', 'ハイパーボール'], ['Nest Ball', 'ネストボール'], ['Poké Ball', 'モンスターボール'],
    ['Rare Candy', 'ふしぎなアメ'], ['Buddy-Buddy Poffin', 'なかよしポフィン'], ['Earthen Vessel', '大地の器'],
    ['Switch', 'ポケモンいれかえ'], ['Counter Catcher', 'カウンターキャッチャー'], ['Super Rod', 'すごいつりざお'],
    ['Night Stretcher', '夜のタンカ'], ['Poké Pad', 'ポケパッド'], ['Pokégear 3.0', 'ポケギア3.0'],
    ['Energy Retrieval', 'エネルギー回収'], ['Energy Switch', 'エネルギーつけかえ'], ['Energy Search', 'エネルギーサーチ'],
    ['Energy Recycler', 'エネルギーリサイクル'], ['Special Red Card', 'スペシャルレッドカード'],
    ['Unfair Stamp', 'アンフェアスタンプ'], ['Secret Box', 'ヒミツのハコ'], ['Air Balloon', 'ふうせん'],
    ['Crushing Hammer', 'クラッシュハンマー'],
    ['Bug Catching Set', 'むしとりセット'], ['Sacred Ash', 'せいなるはい'], ['Prime Catcher', 'プライムキャッチャー'],
    ['Pokémon Catcher', 'ポケモンキャッチャー'], ['Hyper Aroma', 'ハイパーアロマ'], ['Tool Scrapper', 'ツールスクラッパー'],
    ["Team Rocket's Transceiver", 'ロケット団のトランシーバー'],
    ['Superior Energy Retrieval', 'スーパーエネルギー回収'],
    // ポケモンのどうぐ・スタジアム
    ['Forest Seal Stone', '森の封印石'], ['Technical Machine: Evolution', 'わざマシン エヴォリューション'],
    ['Technical Machine: Devolution', 'わざマシン デヴォリューション'],
    ['Collapsed Stadium', '崩れたスタジアム'], ['PokéStop', 'ポケストップ'], ['Temple of Sinnoh', 'シンオウ神殿'],
    ['Area Zero Underdepths', 'エリアゼロの地下空洞'], ['Jamming Tower', 'ジャミングタワー'],
    ['Lucky Helmet', 'ラッキーヘルメット'], ['Hero’s Cape', '英雄のマント'], ['Prism Tower', 'プリズムタワー'],
    // ポケモン
    ['Dragapult ex', 'ドラパルトex'], ['Drakloak', 'ドロンチ'], ['Dreepy', 'ドラメシヤ'],
    ['Blaziken ex', 'バシャーモex'], ['Torchic', 'アチャモ'], ['Combusken', 'ワカシャモ'],
    ['Munkidori', 'マシマシラ'], ['Okidogi', 'イイネイヌ'], ['Fezandipiti ex', 'キチキギスex'],
    ['Pecharunt ex', 'モモワロウex'], ['Budew', 'スボミー'], ['Shaymin', 'シェイミ'],
    ['Meowth ex', 'ニャースex'], ['Latias ex', 'ラティアスex'], ['Yveltal', 'イベルタル'],
    ['Dunsparce', 'ノコッチ'], ['Dudunsparce', 'ノココッチ'], ['Abra', 'ケーシィ'], ['Kadabra', 'ユンゲラー'],
    ['Alakazam', 'フーディン'], ['Psyduck', 'コダック'], ['Golduck', 'ゴルダック'],
    ['Metagross', 'メタグロス'], ['Metang', 'メタング'], ['Beldum', 'ダンバル'],
    ['Mega Kangaskhan ex', 'メガガルーラex'], ['Genesect ex', 'ゲノセクトex'], ['Genesect', 'ゲノセクト'],
    ['Chien-Pao', 'パオジアン'], ['Chi-Yu', 'イーユイ'], ['Kyurem', 'キュレム'],
    ['Applin', 'カジッチュ'], ['Dipplin', 'カミッチュ'], ['Hydrapple ex', 'カミツオロチex'],
    ['Duskull', 'ヨマワル'], ['Dusclops', 'サマヨール'], ['Dusknoir', 'ヨノワール'],
    ['Snorunt', 'ユキワラシ'], ['Froslass', 'ユキメノコ'], ['Mega Froslass ex', 'メガユキメノコex'],
    ['Grookey', 'サルノリ'], ['Thwackey', 'バチンキー'], ['Goldeen', 'トサキント'], ['Seaking', 'アズマオウ'],
    ['Chikorita', 'チコリータ'], ['Bayleef', 'ベイリーフ'], ['Meganium', 'メガニウム'],
    ['Hoothoot', 'ホーホー'], ['Noctowl', 'ヨルノズク'], ['Celebi', 'セレビィ'],
    ['Pikipek', 'ツツケラ'], ['Toucannon', 'ドデカバシ'], ['Drilbur', 'モグリュー'],
    ['Mega Excadrill ex', 'メガドリュウズex'], ['Trumbeak', 'ケララッパ'],
    ['Weedle', 'ビードル'], ['Kakuna', 'コクーン'], ['Beedrill ex', 'スピアーex'],
    ['Riolu', 'リオル'], ['Mega Lucario ex', 'メガルカリオex'], ['Mega Absol ex', 'メガアブソルex'],
    ['Dedenne', 'デデンネ'], ['Smoochum', 'ムチュール'], ['Moltres', 'ファイヤー'],
    ['Slowpoke', 'ヤドン'], ['Slowking', 'ヤドキング'], ['Tatsugiri', 'シャリタツ'],
    ['Solrock', 'ソルロック'], ['Lunatone', 'ルナトーン'], ['Rellor', 'タマンチュラ'], ['Rabsca', 'ワナイダー'],
    ['Bloodmoon Ursaluna ex', 'ガチグマ アカツキex'], ['Teal Mask Ogerpon ex', 'オーガポン みどりのめんex'],
    ['Wellspring Mask Ogerpon ex', 'オーガポン いどのめんex'],
    ["N's Zorua", 'Nのゾロア'], ["N's Zoroark ex", 'Nのゾロアークex'], ["N's Zekrom", 'Nのゼクロム'],
    ["N's Reshiram", 'Nのレシラム'], ["N's Darumaka", 'Nのダルマッカ'], ["N's Darmanitan", 'Nのヒヒダルマ'],
    ["Marnie's Impidimp", 'マリィのベロバー'], ["Marnie's Morgrem", 'マリィのギモー'],
    ["Marnie's Grimmsnarl ex", 'マリィのオーロンゲex'],
    ['Fighting Gong', 'ファイトゴング'],
]

const CARD_MAP: Record<string, string> = {}
CARD_PAIRS.forEach(([en, ja]) => { CARD_MAP[normalizeName(en)] = ja })

// ---- アーキタイプ名 EN → JA（実データの72種から確度の高いもの）----
const ARCHETYPE_PAIRS: [string, string][] = [
    ['Dragapult', 'ドラパルトex'], ['Dragapult Dusknoir', 'ドラパルトex(ヨノワール)'],
    ['Dragapult Blaziken', 'ドラパルトex＋バシャーモex'], ['Dragapult Dudunsparce', 'ドラパルトex(ノココッチ)'],
    ['Dragapult Froslass', 'ドラパルトex(ユキメノコ)'],
    ['Alakazam Dudunsparce', 'フーディン'], ['Festival Lead', 'おまつりおんど'],
    ['Mega Excadrill', 'メガドリュウズex'], ["N's Zoroark", 'Nのゾロアークex'], ['Slowking', 'ヤドキング'],
    ['Grimmsnarl Froslass', 'ばけがくれ'], ['Ogerpon Meganium Hydrapple', 'オーガポンバレット'],
    ['Ogerpon Meganium', 'オーガポンバレット'], ['Ogerpon Meganium Arboliva', 'オーガポンバレット'],
    ["Cynthia's Garchomp", 'シロナのガブリアスex'], ['Mega Absol Box', 'メガアブソルex'],
    ['Raging Bolt Ogerpon', 'タケルライコex'], ['Mega Greninja', 'メガゲッコウガex'],
    ['Mega Lucario', 'メガルカリオex'], ["Ethan's Typhlosion", 'ヒビキのバクフーン'],
    ["Steven's Metagross", 'ダイゴのメタグロスex'], ['Mega Venusaur', 'メガフシギバナex'],
    ['Blissey', 'ハピナスex'], ["Marnie's Grimmsnarl", 'マリィのオーロンゲex'],
    ['Iron Thorns', 'テツノイバラex'], ['Mega Dragonite', 'メガカイリューex'],
    ['Terapagos Noctowl', 'テラパゴスex'], ['Mega Starmie', 'メガスターミーex'],
    ['Mega Venusaur', 'メガフシギバナex'], ['Cornerstone Mask Ogerpon', 'オーガポン いしずえのめんex'],
    ['Metagross', 'メタグロス'], ['Genesect', 'ゲノセクト'], ['Iron Thorns', 'テツノイバラex'],
    ["Rocket's Mewtwo", 'ロケット団のミュウツーex'], ["Rocket's Honchkrow", 'ロケット団のドンカラス'],
    ['Slowking', 'ヤドキング'], ['Ceruledge', 'ソウブレイズ'], ['Greninja', 'ゲッコウガ'],
    ['Wailord', 'ホエルオー'], ['Blaziken Zoroark', 'バシャーモ＋ゾロアーク'],
]

const ARCHETYPE_MAP: Record<string, string> = {}
ARCHETYPE_PAIRS.forEach(([en, ja]) => { ARCHETYPE_MAP[normalizeName(en)] = ja })

export function translateCardName(nameEn: string): string | undefined {
    return CARD_MAP[normalizeName(nameEn)]
}

export function translateArchetypeName(nameEn: string): string | undefined {
    return ARCHETYPE_MAP[normalizeName(nameEn)]
}
