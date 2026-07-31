// 海外(国際Standard)の英語カード名・アーキタイプ名 → 日本語名 辞書。
// Limitless由来のデータは英語名しか無いため、ここで日本語へ変換する。
// 辞書に無いものは英語名のまま表示する（誤訳を出さない方針）。新カードは随時追記。
//
// キーは normalizeName() で正規化した英語名（小文字・英数字のみ）。

export function normalizeName(s: string): string {
    return (s || '').toLowerCase().replace(/[^a-z0-9]/g, '')
}

// ---- カード名 EN → JA（確度の高いものだけ）----
const CARD_PAIRS: [string, string][] = [
    // 基本エネルギー
    ['Basic Grass Energy', '基本草エネルギー'],
    ['Basic Fire Energy', '基本炎エネルギー'],
    ['Basic Water Energy', '基本水エネルギー'],
    ['Basic Lightning Energy', '基本雷エネルギー'],
    ['Basic Psychic Energy', '基本超エネルギー'],
    ['Basic Fighting Energy', '基本闘エネルギー'],
    ['Basic Darkness Energy', '基本悪エネルギー'],
    ['Basic Metal Energy', '基本鋼エネルギー'],
    ['Grass Energy', '基本草エネルギー'],
    ['Fire Energy', '基本炎エネルギー'],
    ['Water Energy', '基本水エネルギー'],
    ['Lightning Energy', '基本雷エネルギー'],
    ['Psychic Energy', '基本超エネルギー'],
    ['Fighting Energy', '基本闘エネルギー'],
    ['Darkness Energy', '基本悪エネルギー'],
    ['Metal Energy', '基本鋼エネルギー'],
    // 特殊エネルギー
    ['Jet Energy', 'ジェットエネルギー'],
    ['Legacy Energy', 'レガシーエネルギー'],
    ['Reversal Energy', 'リバーサルエネルギー'],
    ['Prism Energy', 'プリズムエネルギー'],
    ['Neo Upper Energy', 'ネオアッパーエネルギー'],
    ['Double Turbo Energy', 'ダブルターボエネルギー'],
    ['Luminous Energy', 'ルミナスエネルギー'],
    ['Gift Energy', 'ギフトエネルギー'],
    // サポート
    ['Iono', 'ナンジャモ'],
    ["Boss's Orders", 'ボスの指令'],
    ["Professor's Research", '博士の研究'],
    ['Arven', 'ペパー'],
    ['Roxanne', 'ツツジ'],
    ['Judge', 'ジャッジマン'],
    ['Kieran', 'スグリ'],
    ['Carmine', 'カルミ'],
    ['Briar', 'ブライア'],
    ['Iris', 'アイリス'],
    // グッズ
    ['Ultra Ball', 'ハイパーボール'],
    ['Nest Ball', 'ネストボール'],
    ['Poké Ball', 'モンスターボール'],
    ['Great Ball', 'スーパーボール'],
    ['Rare Candy', 'ふしぎなアメ'],
    ['Buddy-Buddy Poffin', 'なかよしポフィン'],
    ['Earthen Vessel', '大地の器'],
    ['Switch', 'ポケモンいれかえ'],
    ['Switch Cart', 'いれかえカート'],
    ['Counter Catcher', 'カウンターキャッチャー'],
    ['Super Rod', 'すごいつりざお'],
    ['Night Stretcher', '夜のタンカ'],
    ['Pokégear 3.0', 'ポケギア3.0'],
    ['Energy Retrieval', 'エネルギー回収'],
    ['Energy Search', 'エネルギーサーチ'],
    ['Trekking Shoes', 'トレッキングシューズ'],
    ['Prime Catcher', 'プライムキャッチャー'],
    ['Pokémon Catcher', 'ポケモンキャッチャー'],
    ['Hyper Aroma', 'ハイパーアロマ'],
    ["Ciphermaniac's Codebreaking", 'コード読解'],
    ['Technical Machine: Evolution', 'わざマシン エヴォリューション'],
    ['Technical Machine: Devolution', 'わざマシン デヴォリューション'],
    ['Technical Machine: Turbo Energize', 'わざマシン ターボエネルジー'],
    ['Secret Box', 'ヒミツのハコ'],
    ['Superior Energy Retrieval', 'スーパーエネルギー回収'],
    ['Energy Switch', 'エネルギーつけかえ'],
    // ポケモンのどうぐ・スタジアム
    ['Forest Seal Stone', '森の封印石'],
    ['Bravery Charm', 'いさましいおまもり'],
    ['Rescue Board', 'レスキューボード'],
    ['Defiance Band', 'まけんきハチマキ'],
    ['Technical Machine', 'わざマシン'],
    ['Collapsed Stadium', '崩れたスタジアム'],
    ['PokéStop', 'ポケストップ'],
    ['Temple of Sinnoh', 'シンオウ神殿'],
    ['Area Zero Underdepths', 'エリアゼロの地下空洞'],
    ['Jamming Tower', 'ジャミングタワー'],
    // 主要ポケモン（国際Standard）
    ['Dragapult ex', 'ドラパルトex'],
    ['Drakloak', 'ドロンチ'],
    ['Dreepy', 'ドラメシヤ'],
    ['Gardevoir ex', 'サーナイトex'],
    ['Kirlia', 'キルリア'],
    ['Ralts', 'ラルトス'],
    ['Charizard ex', 'リザードンex'],
    ['Charmander', 'ヒトカゲ'],
    ['Charmeleon', 'リザード'],
    ['Pidgeot ex', 'ピジョットex'],
    ['Pidgey', 'ポッポ'],
    ['Pidgeotto', 'ピジョン'],
    ['Raging Bolt ex', 'タケルライコex'],
    ['Gholdengo ex', 'サーフゴーex'],
    ['Gimmighoul', 'コレクレー'],
    ['Terapagos ex', 'テラパゴスex'],
    ['Iron Thorns ex', 'テツノイバラex'],
    ['Iron Crown ex', 'テツノカシラex'],
    ['Miraidon ex', 'ミライドンex'],
    ['Regidrago VSTAR', 'レジドラゴVSTAR'],
    ['Regidrago V', 'レジドラゴV'],
    ['Lugia VSTAR', 'ルギアVSTAR'],
    ['Lugia V', 'ルギアV'],
    ['Archeops', 'アーケオス'],
    ['Fezandipiti ex', 'キチキギスex'],
    ['Squawkabilly ex', 'イキリンコex'],
    ['Munkidori', 'モモワロウ'],
    ['Ogerpon ex', 'オーガポンex'],
    ['Teal Mask Ogerpon ex', 'オーガポン みどりのめんex'],
    ['Hearthflame Mask Ogerpon ex', 'オーガポン かまどのめんex'],
    ['Wellspring Mask Ogerpon ex', 'オーガポン いどのめんex'],
    ['Cornerstone Mask Ogerpon ex', 'オーガポン いしずえのめんex'],
    ['Klawf', 'ガケガニ'],
    ['Bloodmoon Ursaluna ex', 'ガチグマ アカツキex'],
    ['Snorlax', 'カビゴン'],
    ['Cinccino', 'チラチーノ'],
    ['Minccino', 'チラーミィ'],
    ['Rotom V', 'ロトムV'],
    ['Lumineon V', 'ネオラントV'],
    ['Radiant Greninja', 'かがやくゲッコウガ'],
    ['Mew ex', 'ミュウex'],
    ['Genesect V', 'ゲノセクトV'],
]

const CARD_MAP: Record<string, string> = {}
CARD_PAIRS.forEach(([en, ja]) => { CARD_MAP[normalizeName(en)] = ja })

// ---- アーキタイプ名 EN → JA（主要のみ）----
const ARCHETYPE_PAIRS: [string, string][] = [
    ['Dragapult ex', 'ドラパルトex'],
    ['Gardevoir ex', 'サーナイトex'],
    ['Charizard ex', 'リザードンex'],
    ['Charizard ex Pidgeot ex', 'リザードンex/ピジョットex'],
    ['Raging Bolt ex', 'タケルライコex'],
    ['Raging Bolt ex Ogerpon', 'タケルライコex/オーガポン'],
    ['Gholdengo ex', 'サーフゴーex'],
    ['Terapagos ex', 'テラパゴスex'],
    ['Iron Thorns ex', 'テツノイバラex'],
    ['Miraidon ex', 'ミライドンex'],
    ['Regidrago VSTAR', 'レジドラゴVSTAR'],
    ['Lugia VSTAR', 'ルギアVSTAR'],
    ['Snorlax Stall', 'カビゴン(壁)'],
    ['Klawf', 'ガケガニ'],
    ['Pidgeot Control', 'ピジョットコントロール'],
]

const ARCHETYPE_MAP: Record<string, string> = {}
ARCHETYPE_PAIRS.forEach(([en, ja]) => { ARCHETYPE_MAP[normalizeName(en)] = ja })

// 英語名から日本語名を引く（無ければ undefined）
export function translateCardName(nameEn: string): string | undefined {
    return CARD_MAP[normalizeName(nameEn)]
}

export function translateArchetypeName(nameEn: string): string | undefined {
    return ARCHETYPE_MAP[normalizeName(nameEn)]
}
