import { type Card } from './deckParser'

export interface VirtualPracticeDeckCard {
    id: number
    name: string
    quantity: number
    imageUrl?: string
    supertype: string
    subtypes?: string[]
    hp?: number
}

export interface VirtualPracticeDeck {
    id: string
    label: string
    source: string
    cards: VirtualPracticeDeckCard[]
}

const POKEMON_ICON_NAMES = new Set([
    'イベルタル',
    'イワパレス',
    'エースバーン',
    'オーロット',
    'ガブリアス',
    'シャンデラ',
    'スボミー',
    'ドンカラス',
    'ドラパルト',
    'ハラバリー',
    'バクフーン',
    'フーディン',
    'ポリゴンＺ',
    'メガスターミー',
    'メガフシギバナ',
    'メガミミロップ',
    'メガユキメノコ',
    'メガルカリオ',
    'ヨノワール',
    'ワナイダー',
])

function normalizePokemonIconName(name: string): string {
    return name
        .replace(/^ロケット団の/, '')
        .replace(/^ホップの/, '')
        .replace(/^シロナの/, '')
        .replace(/^ナンジャモの/, '')
        .replace(/ex$/i, '')
        .trim()
}

function pokemonIconImage(name: string): string | undefined {
    const iconName = normalizePokemonIconName(name)
    if (!POKEMON_ICON_NAMES.has(iconName)) return undefined
    return `/pokemon-icons/${encodeURIComponent(iconName)}.png`
}

export const VIRTUAL_PRACTICE_DECKS = [
    {
        "id": "alakazam_deck",
        "label": "フーディン",
        "source": "alakazam_deck.csv",
        "cards": [
            {
                "id": 5,
                "name": "基本【超】エネルギー",
                "supertype": "Energy",
                "subtypes": [],
                "quantity": 3
            },
            {
                "id": 19,
                "name": "テレパス【超】エネルギー",
                "supertype": "Energy",
                "subtypes": [],
                "quantity": 4
            },
            {
                "id": 65,
                "name": "ノコッチ",
                "supertype": "Pokémon",
                "subtypes": [
                    "Basic"
                ],
                "hp": 60,
                "quantity": 4
            },
            {
                "id": 66,
                "name": "ノココッチ",
                "supertype": "Pokémon",
                "subtypes": [
                    "Stage 1"
                ],
                "hp": 140,
                "quantity": 4
            },
            {
                "id": 741,
                "name": "ケーシィ",
                "supertype": "Pokémon",
                "subtypes": [
                    "Basic"
                ],
                "hp": 50,
                "quantity": 4
            },
            {
                "id": 742,
                "name": "ユンゲラー",
                "supertype": "Pokémon",
                "subtypes": [
                    "Stage 1"
                ],
                "hp": 80,
                "quantity": 4
            },
            {
                "id": 743,
                "name": "フーディン",
                "supertype": "Pokémon",
                "subtypes": [
                    "Stage 2"
                ],
                "hp": 140,
                "quantity": 3
            },
            {
                "id": 1079,
                "name": "ふしぎなアメ",
                "supertype": "Trainer",
                "subtypes": [
                    "Item"
                ],
                "quantity": 3
            },
            {
                "id": 1081,
                "name": "改造ハンマー",
                "supertype": "Trainer",
                "subtypes": [
                    "Item"
                ],
                "quantity": 3
            },
            {
                "id": 1086,
                "name": "なかよしポフィン",
                "supertype": "Trainer",
                "subtypes": [
                    "Item"
                ],
                "quantity": 4
            },
            {
                "id": 1097,
                "name": "夜のタンカ",
                "supertype": "Trainer",
                "subtypes": [
                    "Item"
                ],
                "quantity": 1
            },
            {
                "id": 1121,
                "name": "ハイパーボール",
                "supertype": "Trainer",
                "subtypes": [
                    "Item"
                ],
                "quantity": 4
            },
            {
                "id": 1129,
                "name": "せいなるはい",
                "supertype": "Trainer",
                "subtypes": [
                    "Item"
                ],
                "quantity": 1
            },
            {
                "id": 1146,
                "name": "ワンダーパッチ",
                "supertype": "Trainer",
                "subtypes": [
                    "Item"
                ],
                "quantity": 1
            },
            {
                "id": 1159,
                "name": "ヒーローマント",
                "supertype": "Trainer",
                "subtypes": [
                    "Pokémon Tool"
                ],
                "quantity": 1
            },
            {
                "id": 1182,
                "name": "ボスの指令",
                "supertype": "Trainer",
                "subtypes": [
                    "Supporter"
                ],
                "quantity": 3
            },
            {
                "id": 1184,
                "name": "スイレンのお世話",
                "supertype": "Trainer",
                "subtypes": [
                    "Supporter"
                ],
                "quantity": 1
            },
            {
                "id": 1225,
                "name": "トウコ",
                "supertype": "Trainer",
                "subtypes": [
                    "Supporter"
                ],
                "quantity": 4
            },
            {
                "id": 1231,
                "name": "ヒカリ",
                "supertype": "Trainer",
                "subtypes": [
                    "Supporter"
                ],
                "quantity": 4
            },
            {
                "id": 1264,
                "name": "バトルコロシアム",
                "supertype": "Trainer",
                "subtypes": [
                    "Stadium"
                ],
                "quantity": 4
            }
        ]
    },
    {
        "id": "alakazam_kadoraba_night_mine_deck",
        "label": "フーディン カドラバ/Nighttime Mine",
        "source": "alakazam_kadoraba_night_mine_deck.csv",
        "cards": [
            {
                "id": 5,
                "name": "基本【超】エネルギー",
                "supertype": "Energy",
                "subtypes": [],
                "quantity": 2
            },
            {
                "id": 13,
                "name": "リッチエネルギー",
                "supertype": "Energy",
                "subtypes": [],
                "quantity": 1
            },
            {
                "id": 19,
                "name": "テレパス【超】エネルギー",
                "supertype": "Energy",
                "subtypes": [],
                "quantity": 4
            },
            {
                "id": 66,
                "name": "ノココッチ",
                "supertype": "Pokémon",
                "subtypes": [
                    "Stage 1"
                ],
                "hp": 140,
                "quantity": 3
            },
            {
                "id": 140,
                "name": "キチキギスex",
                "supertype": "Pokémon",
                "subtypes": [
                    "Basic"
                ],
                "hp": 210,
                "quantity": 1
            },
            {
                "id": 305,
                "name": "ノコッチ",
                "supertype": "Pokémon",
                "subtypes": [
                    "Basic"
                ],
                "hp": 70,
                "quantity": 3
            },
            {
                "id": 741,
                "name": "ケーシィ",
                "supertype": "Pokémon",
                "subtypes": [
                    "Basic"
                ],
                "hp": 50,
                "quantity": 4
            },
            {
                "id": 742,
                "name": "ユンゲラー",
                "supertype": "Pokémon",
                "subtypes": [
                    "Stage 1"
                ],
                "hp": 80,
                "quantity": 4
            },
            {
                "id": 743,
                "name": "フーディン",
                "supertype": "Pokémon",
                "subtypes": [
                    "Stage 2"
                ],
                "hp": 140,
                "quantity": 3
            },
            {
                "id": 1079,
                "name": "ふしぎなアメ",
                "supertype": "Trainer",
                "subtypes": [
                    "Item"
                ],
                "quantity": 3
            },
            {
                "id": 1081,
                "name": "改造ハンマー",
                "supertype": "Trainer",
                "subtypes": [
                    "Item"
                ],
                "quantity": 4
            },
            {
                "id": 1086,
                "name": "なかよしポフィン",
                "supertype": "Trainer",
                "subtypes": [
                    "Item"
                ],
                "quantity": 4
            },
            {
                "id": 1097,
                "name": "夜のタンカ",
                "supertype": "Trainer",
                "subtypes": [
                    "Item"
                ],
                "quantity": 1
            },
            {
                "id": 1129,
                "name": "せいなるはい",
                "supertype": "Trainer",
                "subtypes": [
                    "Item"
                ],
                "quantity": 1
            },
            {
                "id": 1152,
                "name": "ポケパッド",
                "supertype": "Trainer",
                "subtypes": [
                    "Item"
                ],
                "quantity": 4
            },
            {
                "id": 1156,
                "name": "ラッキーメット",
                "supertype": "Trainer",
                "subtypes": [
                    "Pokémon Tool"
                ],
                "quantity": 1
            },
            {
                "id": 1174,
                "name": "ふうせん",
                "supertype": "Trainer",
                "subtypes": [
                    "Pokémon Tool"
                ],
                "quantity": 1
            },
            {
                "id": 1182,
                "name": "ボスの指令",
                "supertype": "Trainer",
                "subtypes": [
                    "Supporter"
                ],
                "quantity": 3
            },
            {
                "id": 1184,
                "name": "スイレンのお世話",
                "supertype": "Trainer",
                "subtypes": [
                    "Supporter"
                ],
                "quantity": 2
            },
            {
                "id": 1225,
                "name": "トウコ",
                "supertype": "Trainer",
                "subtypes": [
                    "Supporter"
                ],
                "quantity": 4
            },
            {
                "id": 1231,
                "name": "ヒカリ",
                "supertype": "Trainer",
                "subtypes": [
                    "Supporter"
                ],
                "quantity": 4
            },
            {
                "id": 1266,
                "name": "夜の鉱山",
                "supertype": "Trainer",
                "subtypes": [
                    "Stadium"
                ],
                "quantity": 3
            }
        ]
    },
    {
        "id": "alakazam_night_mine_deck",
        "label": "フーディン Nighttime Mine",
        "source": "alakazam_night_mine_deck.csv",
        "cards": [
            {
                "id": 5,
                "name": "基本【超】エネルギー",
                "supertype": "Energy",
                "subtypes": [],
                "quantity": 2
            },
            {
                "id": 13,
                "name": "リッチエネルギー",
                "supertype": "Energy",
                "subtypes": [],
                "quantity": 1
            },
            {
                "id": 19,
                "name": "テレパス【超】エネルギー",
                "supertype": "Energy",
                "subtypes": [],
                "quantity": 4
            },
            {
                "id": 66,
                "name": "ノココッチ",
                "supertype": "Pokémon",
                "subtypes": [
                    "Stage 1"
                ],
                "hp": 140,
                "quantity": 2
            },
            {
                "id": 140,
                "name": "キチキギスex",
                "supertype": "Pokémon",
                "subtypes": [
                    "Basic"
                ],
                "hp": 210,
                "quantity": 1
            },
            {
                "id": 142,
                "name": "ゲノセクト",
                "supertype": "Pokémon",
                "subtypes": [
                    "Basic"
                ],
                "hp": 110,
                "quantity": 1
            },
            {
                "id": 222,
                "name": "デデンネ",
                "supertype": "Pokémon",
                "subtypes": [
                    "Basic"
                ],
                "hp": 70,
                "quantity": 1
            },
            {
                "id": 305,
                "name": "ノコッチ",
                "supertype": "Pokémon",
                "subtypes": [
                    "Basic"
                ],
                "hp": 70,
                "quantity": 3
            },
            {
                "id": 741,
                "name": "ケーシィ",
                "supertype": "Pokémon",
                "subtypes": [
                    "Basic"
                ],
                "hp": 50,
                "quantity": 4
            },
            {
                "id": 742,
                "name": "ユンゲラー",
                "supertype": "Pokémon",
                "subtypes": [
                    "Stage 1"
                ],
                "hp": 80,
                "quantity": 4
            },
            {
                "id": 743,
                "name": "フーディン",
                "supertype": "Pokémon",
                "subtypes": [
                    "Stage 2"
                ],
                "hp": 140,
                "quantity": 3
            },
            {
                "id": 858,
                "name": "コダック",
                "supertype": "Pokémon",
                "subtypes": [
                    "Basic"
                ],
                "hp": 70,
                "quantity": 1
            },
            {
                "id": 1079,
                "name": "ふしぎなアメ",
                "supertype": "Trainer",
                "subtypes": [
                    "Item"
                ],
                "quantity": 3
            },
            {
                "id": 1081,
                "name": "改造ハンマー",
                "supertype": "Trainer",
                "subtypes": [
                    "Item"
                ],
                "quantity": 1
            },
            {
                "id": 1086,
                "name": "なかよしポフィン",
                "supertype": "Trainer",
                "subtypes": [
                    "Item"
                ],
                "quantity": 4
            },
            {
                "id": 1097,
                "name": "夜のタンカ",
                "supertype": "Trainer",
                "subtypes": [
                    "Item"
                ],
                "quantity": 1
            },
            {
                "id": 1129,
                "name": "せいなるはい",
                "supertype": "Trainer",
                "subtypes": [
                    "Item"
                ],
                "quantity": 1
            },
            {
                "id": 1152,
                "name": "ポケパッド",
                "supertype": "Trainer",
                "subtypes": [
                    "Item"
                ],
                "quantity": 4
            },
            {
                "id": 1156,
                "name": "ラッキーメット",
                "supertype": "Trainer",
                "subtypes": [
                    "Pokémon Tool"
                ],
                "quantity": 2
            },
            {
                "id": 1174,
                "name": "ふうせん",
                "supertype": "Trainer",
                "subtypes": [
                    "Pokémon Tool"
                ],
                "quantity": 1
            },
            {
                "id": 1182,
                "name": "ボスの指令",
                "supertype": "Trainer",
                "subtypes": [
                    "Supporter"
                ],
                "quantity": 3
            },
            {
                "id": 1184,
                "name": "スイレンのお世話",
                "supertype": "Trainer",
                "subtypes": [
                    "Supporter"
                ],
                "quantity": 1
            },
            {
                "id": 1225,
                "name": "トウコ",
                "supertype": "Trainer",
                "subtypes": [
                    "Supporter"
                ],
                "quantity": 4
            },
            {
                "id": 1231,
                "name": "ヒカリ",
                "supertype": "Trainer",
                "subtypes": [
                    "Supporter"
                ],
                "quantity": 4
            },
            {
                "id": 1266,
                "name": "夜の鉱山",
                "supertype": "Trainer",
                "subtypes": [
                    "Stadium"
                ],
                "quantity": 4
            }
        ]
    },
    {
        "id": "alakazam_third_ptcg_deck",
        "label": "フーディン THIRD PTCG",
        "source": "alakazam_third_ptcg_deck.csv",
        "cards": [
            {
                "id": 5,
                "name": "基本【超】エネルギー",
                "supertype": "Energy",
                "subtypes": [],
                "quantity": 3
            },
            {
                "id": 13,
                "name": "リッチエネルギー",
                "supertype": "Energy",
                "subtypes": [],
                "quantity": 1
            },
            {
                "id": 19,
                "name": "テレパス【超】エネルギー",
                "supertype": "Energy",
                "subtypes": [],
                "quantity": 4
            },
            {
                "id": 66,
                "name": "ノココッチ",
                "supertype": "Pokémon",
                "subtypes": [
                    "Stage 1"
                ],
                "hp": 140,
                "quantity": 3
            },
            {
                "id": 140,
                "name": "キチキギスex",
                "supertype": "Pokémon",
                "subtypes": [
                    "Basic"
                ],
                "hp": 210,
                "quantity": 1
            },
            {
                "id": 305,
                "name": "ノコッチ",
                "supertype": "Pokémon",
                "subtypes": [
                    "Basic"
                ],
                "hp": 70,
                "quantity": 3
            },
            {
                "id": 741,
                "name": "ケーシィ",
                "supertype": "Pokémon",
                "subtypes": [
                    "Basic"
                ],
                "hp": 50,
                "quantity": 4
            },
            {
                "id": 742,
                "name": "ユンゲラー",
                "supertype": "Pokémon",
                "subtypes": [
                    "Stage 1"
                ],
                "hp": 80,
                "quantity": 4
            },
            {
                "id": 743,
                "name": "フーディン",
                "supertype": "Pokémon",
                "subtypes": [
                    "Stage 2"
                ],
                "hp": 140,
                "quantity": 3
            },
            {
                "id": 1079,
                "name": "ふしぎなアメ",
                "supertype": "Trainer",
                "subtypes": [
                    "Item"
                ],
                "quantity": 3
            },
            {
                "id": 1081,
                "name": "改造ハンマー",
                "supertype": "Trainer",
                "subtypes": [
                    "Item"
                ],
                "quantity": 2
            },
            {
                "id": 1086,
                "name": "なかよしポフィン",
                "supertype": "Trainer",
                "subtypes": [
                    "Item"
                ],
                "quantity": 4
            },
            {
                "id": 1097,
                "name": "夜のタンカ",
                "supertype": "Trainer",
                "subtypes": [
                    "Item"
                ],
                "quantity": 2
            },
            {
                "id": 1129,
                "name": "せいなるはい",
                "supertype": "Trainer",
                "subtypes": [
                    "Item"
                ],
                "quantity": 1
            },
            {
                "id": 1146,
                "name": "ワンダーパッチ",
                "supertype": "Trainer",
                "subtypes": [
                    "Item"
                ],
                "quantity": 1
            },
            {
                "id": 1152,
                "name": "ポケパッド",
                "supertype": "Trainer",
                "subtypes": [
                    "Item"
                ],
                "quantity": 4
            },
            {
                "id": 1182,
                "name": "ボスの指令",
                "supertype": "Trainer",
                "subtypes": [
                    "Supporter"
                ],
                "quantity": 3
            },
            {
                "id": 1184,
                "name": "スイレンのお世話",
                "supertype": "Trainer",
                "subtypes": [
                    "Supporter"
                ],
                "quantity": 1
            },
            {
                "id": 1197,
                "name": "クセロシキのたくらみ",
                "supertype": "Trainer",
                "subtypes": [
                    "Supporter"
                ],
                "quantity": 1
            },
            {
                "id": 1225,
                "name": "トウコ",
                "supertype": "Trainer",
                "subtypes": [
                    "Supporter"
                ],
                "quantity": 4
            },
            {
                "id": 1227,
                "name": "リーリエの決心",
                "supertype": "Trainer",
                "subtypes": [
                    "Supporter"
                ],
                "quantity": 4
            },
            {
                "id": 1231,
                "name": "ヒカリ",
                "supertype": "Trainer",
                "subtypes": [
                    "Supporter"
                ],
                "quantity": 4
            }
        ]
    },
    {
        "id": "alakazam_tubotu_deck",
        "label": "フーディン tubotu",
        "source": "alakazam_tubotu_deck.csv",
        "cards": [
            {
                "id": 5,
                "name": "基本【超】エネルギー",
                "supertype": "Energy",
                "subtypes": [],
                "quantity": 2
            },
            {
                "id": 13,
                "name": "リッチエネルギー",
                "supertype": "Energy",
                "subtypes": [],
                "quantity": 1
            },
            {
                "id": 19,
                "name": "テレパス【超】エネルギー",
                "supertype": "Energy",
                "subtypes": [],
                "quantity": 4
            },
            {
                "id": 65,
                "name": "ノコッチ",
                "supertype": "Pokémon",
                "subtypes": [
                    "Basic"
                ],
                "hp": 60,
                "quantity": 3
            },
            {
                "id": 66,
                "name": "ノココッチ",
                "supertype": "Pokémon",
                "subtypes": [
                    "Stage 1"
                ],
                "hp": 140,
                "quantity": 3
            },
            {
                "id": 140,
                "name": "キチキギスex",
                "supertype": "Pokémon",
                "subtypes": [
                    "Basic"
                ],
                "hp": 210,
                "quantity": 1
            },
            {
                "id": 214,
                "name": "トゲキッス",
                "supertype": "Pokémon",
                "subtypes": [
                    "Stage 2"
                ],
                "hp": 140,
                "quantity": 1
            },
            {
                "id": 343,
                "name": "シェイミ",
                "supertype": "Pokémon",
                "subtypes": [
                    "Basic"
                ],
                "hp": 80,
                "quantity": 1
            },
            {
                "id": 741,
                "name": "ケーシィ",
                "supertype": "Pokémon",
                "subtypes": [
                    "Basic"
                ],
                "hp": 50,
                "quantity": 4
            },
            {
                "id": 742,
                "name": "ユンゲラー",
                "supertype": "Pokémon",
                "subtypes": [
                    "Stage 1"
                ],
                "hp": 80,
                "quantity": 4
            },
            {
                "id": 743,
                "name": "フーディン",
                "supertype": "Pokémon",
                "subtypes": [
                    "Stage 2"
                ],
                "hp": 140,
                "quantity": 4
            },
            {
                "id": 959,
                "name": "トゲピー",
                "supertype": "Pokémon",
                "subtypes": [
                    "Basic"
                ],
                "hp": 50,
                "quantity": 1
            },
            {
                "id": 1079,
                "name": "ふしぎなアメ",
                "supertype": "Trainer",
                "subtypes": [
                    "Item"
                ],
                "quantity": 3
            },
            {
                "id": 1081,
                "name": "改造ハンマー",
                "supertype": "Trainer",
                "subtypes": [
                    "Item"
                ],
                "quantity": 3
            },
            {
                "id": 1086,
                "name": "なかよしポフィン",
                "supertype": "Trainer",
                "subtypes": [
                    "Item"
                ],
                "quantity": 4
            },
            {
                "id": 1097,
                "name": "夜のタンカ",
                "supertype": "Trainer",
                "subtypes": [
                    "Item"
                ],
                "quantity": 1
            },
            {
                "id": 1129,
                "name": "せいなるはい",
                "supertype": "Trainer",
                "subtypes": [
                    "Item"
                ],
                "quantity": 1
            },
            {
                "id": 1146,
                "name": "ワンダーパッチ",
                "supertype": "Trainer",
                "subtypes": [
                    "Item"
                ],
                "quantity": 1
            },
            {
                "id": 1152,
                "name": "ポケパッド",
                "supertype": "Trainer",
                "subtypes": [
                    "Item"
                ],
                "quantity": 4
            },
            {
                "id": 1182,
                "name": "ボスの指令",
                "supertype": "Trainer",
                "subtypes": [
                    "Supporter"
                ],
                "quantity": 3
            },
            {
                "id": 1184,
                "name": "スイレンのお世話",
                "supertype": "Trainer",
                "subtypes": [
                    "Supporter"
                ],
                "quantity": 1
            },
            {
                "id": 1225,
                "name": "トウコ",
                "supertype": "Trainer",
                "subtypes": [
                    "Supporter"
                ],
                "quantity": 4
            },
            {
                "id": 1231,
                "name": "ヒカリ",
                "supertype": "Trainer",
                "subtypes": [
                    "Supporter"
                ],
                "quantity": 4
            },
            {
                "id": 1264,
                "name": "バトルコロシアム",
                "supertype": "Trainer",
                "subtypes": [
                    "Stadium"
                ],
                "quantity": 2
            }
        ]
    },
    {
        "id": "bomb_lopunny_deck",
        "label": "ミミロップ/メガスターミー",
        "source": "bomb_lopunny_deck.csv",
        "cards": [
            {
                "id": 3,
                "name": "基本【水】エネルギー",
                "supertype": "Energy",
                "subtypes": [],
                "quantity": 5
            },
            {
                "id": 11,
                "name": "ミストエネルギー",
                "supertype": "Energy",
                "subtypes": [],
                "quantity": 2
            },
            {
                "id": 17,
                "name": "イグニッションエネルギー",
                "supertype": "Energy",
                "subtypes": [],
                "quantity": 2
            },
            {
                "id": 66,
                "name": "ノココッチ",
                "supertype": "Pokémon",
                "subtypes": [
                    "Stage 1"
                ],
                "hp": 140,
                "quantity": 2
            },
            {
                "id": 174,
                "name": "スピンロトム",
                "supertype": "Pokémon",
                "subtypes": [
                    "Basic"
                ],
                "hp": 70,
                "quantity": 2
            },
            {
                "id": 305,
                "name": "ノコッチ",
                "supertype": "Pokémon",
                "subtypes": [
                    "Basic"
                ],
                "hp": 70,
                "quantity": 3
            },
            {
                "id": 848,
                "name": "ミミロル",
                "supertype": "Pokémon",
                "subtypes": [
                    "Basic"
                ],
                "hp": 70,
                "quantity": 3
            },
            {
                "id": 849,
                "name": "メガミミロップex",
                "supertype": "Pokémon",
                "subtypes": [
                    "Stage 1"
                ],
                "hp": 330,
                "quantity": 3
            },
            {
                "id": 1030,
                "name": "ヒトデマン",
                "supertype": "Pokémon",
                "subtypes": [
                    "Basic"
                ],
                "hp": 70,
                "quantity": 3
            },
            {
                "id": 1031,
                "name": "メガスターミーex",
                "supertype": "Pokémon",
                "subtypes": [
                    "Stage 1"
                ],
                "hp": 330,
                "quantity": 2
            },
            {
                "id": 1086,
                "name": "なかよしポフィン",
                "supertype": "Trainer",
                "subtypes": [
                    "Item"
                ],
                "quantity": 2
            },
            {
                "id": 1088,
                "name": "プライムキャッチャー",
                "supertype": "Trainer",
                "subtypes": [
                    "Item"
                ],
                "quantity": 1
            },
            {
                "id": 1121,
                "name": "ハイパーボール",
                "supertype": "Trainer",
                "subtypes": [
                    "Item"
                ],
                "quantity": 3
            },
            {
                "id": 1122,
                "name": "ポケギア3.0",
                "supertype": "Trainer",
                "subtypes": [
                    "Item"
                ],
                "quantity": 3
            },
            {
                "id": 1123,
                "name": "ポケモンいれかえ",
                "supertype": "Trainer",
                "subtypes": [
                    "Item"
                ],
                "quantity": 1
            },
            {
                "id": 1152,
                "name": "ポケパッド",
                "supertype": "Trainer",
                "subtypes": [
                    "Item"
                ],
                "quantity": 3
            },
            {
                "id": 1174,
                "name": "ふうせん",
                "supertype": "Trainer",
                "subtypes": [
                    "Pokémon Tool"
                ],
                "quantity": 3
            },
            {
                "id": 1182,
                "name": "ボスの指令",
                "supertype": "Trainer",
                "subtypes": [
                    "Supporter"
                ],
                "quantity": 3
            },
            {
                "id": 1189,
                "name": "セイジ",
                "supertype": "Trainer",
                "subtypes": [
                    "Supporter"
                ],
                "quantity": 3
            },
            {
                "id": 1225,
                "name": "トウコ",
                "supertype": "Trainer",
                "subtypes": [
                    "Supporter"
                ],
                "quantity": 3
            },
            {
                "id": 1227,
                "name": "リーリエの決心",
                "supertype": "Trainer",
                "subtypes": [
                    "Supporter"
                ],
                "quantity": 4
            },
            {
                "id": 1229,
                "name": "ミツルの思いやり",
                "supertype": "Trainer",
                "subtypes": [
                    "Supporter"
                ],
                "quantity": 2
            },
            {
                "id": 1264,
                "name": "バトルコロシアム",
                "supertype": "Trainer",
                "subtypes": [
                    "Stadium"
                ],
                "quantity": 2
            }
        ]
    },
    {
        "id": "chandelure_control_deck",
        "label": "シャンデラコントロール",
        "source": "chandelure_control_deck.csv",
        "cards": [
            {
                "id": 5,
                "name": "基本【超】エネルギー",
                "supertype": "Energy",
                "subtypes": [],
                "quantity": 4
            },
            {
                "id": 19,
                "name": "テレパス【超】エネルギー",
                "supertype": "Energy",
                "subtypes": [],
                "quantity": 4
            },
            {
                "id": 97,
                "name": "ヒトモシ",
                "supertype": "Pokémon",
                "subtypes": [
                    "Basic"
                ],
                "hp": 60,
                "quantity": 3
            },
            {
                "id": 98,
                "name": "シャンデラ",
                "supertype": "Pokémon",
                "subtypes": [
                    "Stage 2"
                ],
                "hp": 130,
                "quantity": 3
            },
            {
                "id": 164,
                "name": "キュワワー",
                "supertype": "Pokémon",
                "subtypes": [
                    "Basic"
                ],
                "hp": 70,
                "quantity": 4
            },
            {
                "id": 343,
                "name": "シェイミ",
                "supertype": "Pokémon",
                "subtypes": [
                    "Basic"
                ],
                "hp": 80,
                "quantity": 1
            },
            {
                "id": 494,
                "name": "ランプラー",
                "supertype": "Pokémon",
                "subtypes": [
                    "Stage 1"
                ],
                "hp": 80,
                "quantity": 2
            },
            {
                "id": 1079,
                "name": "ふしぎなアメ",
                "supertype": "Trainer",
                "subtypes": [
                    "Item"
                ],
                "quantity": 1
            },
            {
                "id": 1081,
                "name": "改造ハンマー",
                "supertype": "Trainer",
                "subtypes": [
                    "Item"
                ],
                "quantity": 1
            },
            {
                "id": 1086,
                "name": "なかよしポフィン",
                "supertype": "Trainer",
                "subtypes": [
                    "Item"
                ],
                "quantity": 4
            },
            {
                "id": 1097,
                "name": "夜のタンカ",
                "supertype": "Trainer",
                "subtypes": [
                    "Item"
                ],
                "quantity": 2
            },
            {
                "id": 1119,
                "name": "エネルギー転送",
                "supertype": "Trainer",
                "subtypes": [
                    "Item"
                ],
                "quantity": 2
            },
            {
                "id": 1120,
                "name": "クラッシュハンマー",
                "supertype": "Trainer",
                "subtypes": [
                    "Item"
                ],
                "quantity": 4
            },
            {
                "id": 1123,
                "name": "ポケモンいれかえ",
                "supertype": "Trainer",
                "subtypes": [
                    "Item"
                ],
                "quantity": 1
            },
            {
                "id": 1152,
                "name": "ポケパッド",
                "supertype": "Trainer",
                "subtypes": [
                    "Item"
                ],
                "quantity": 4
            },
            {
                "id": 1166,
                "name": "重力玉",
                "supertype": "Trainer",
                "subtypes": [
                    "Pokémon Tool"
                ],
                "quantity": 2
            },
            {
                "id": 1182,
                "name": "ボスの指令",
                "supertype": "Trainer",
                "subtypes": [
                    "Supporter"
                ],
                "quantity": 3
            },
            {
                "id": 1186,
                "name": "ビワ",
                "supertype": "Trainer",
                "subtypes": [
                    "Supporter"
                ],
                "quantity": 2
            },
            {
                "id": 1197,
                "name": "クセロシキのたくらみ",
                "supertype": "Trainer",
                "subtypes": [
                    "Supporter"
                ],
                "quantity": 3
            },
            {
                "id": 1225,
                "name": "トウコ",
                "supertype": "Trainer",
                "subtypes": [
                    "Supporter"
                ],
                "quantity": 3
            },
            {
                "id": 1227,
                "name": "リーリエの決心",
                "supertype": "Trainer",
                "subtypes": [
                    "Supporter"
                ],
                "quantity": 4
            },
            {
                "id": 1231,
                "name": "ヒカリ",
                "supertype": "Trainer",
                "subtypes": [
                    "Supporter"
                ],
                "quantity": 1
            },
            {
                "id": 1247,
                "name": "ニュートラルセンター",
                "supertype": "Trainer",
                "subtypes": [
                    "Stadium"
                ],
                "quantity": 1
            },
            {
                "id": 1264,
                "name": "バトルコロシアム",
                "supertype": "Trainer",
                "subtypes": [
                    "Stadium"
                ],
                "quantity": 1
            }
        ]
    },
    {
        "id": "crustle_deck",
        "label": "イワパレス",
        "source": "crustle_deck.csv",
        "cards": [
            {
                "id": 1,
                "name": "基本【草】エネルギー",
                "supertype": "Energy",
                "subtypes": [],
                "quantity": 19
            },
            {
                "id": 11,
                "name": "ミストエネルギー",
                "supertype": "Energy",
                "subtypes": [],
                "quantity": 4
            },
            {
                "id": 14,
                "name": "スパイクエネルギー",
                "supertype": "Energy",
                "subtypes": [],
                "quantity": 4
            },
            {
                "id": 18,
                "name": "グロウ【草】エネルギー",
                "supertype": "Energy",
                "subtypes": [],
                "quantity": 4
            },
            {
                "id": 344,
                "name": "イシズマイ",
                "supertype": "Pokémon",
                "subtypes": [
                    "Basic"
                ],
                "hp": 70,
                "quantity": 4
            },
            {
                "id": 345,
                "name": "イワパレス",
                "supertype": "Pokémon",
                "subtypes": [
                    "Stage 1"
                ],
                "hp": 150,
                "quantity": 4
            },
            {
                "id": 1086,
                "name": "なかよしポフィン",
                "supertype": "Trainer",
                "subtypes": [
                    "Item"
                ],
                "quantity": 4
            },
            {
                "id": 1147,
                "name": "ジャンボアイス",
                "supertype": "Trainer",
                "subtypes": [
                    "Item"
                ],
                "quantity": 4
            },
            {
                "id": 1159,
                "name": "ヒーローマント",
                "supertype": "Trainer",
                "subtypes": [
                    "Pokémon Tool"
                ],
                "quantity": 1
            },
            {
                "id": 1212,
                "name": "コック",
                "supertype": "Trainer",
                "subtypes": [
                    "Supporter"
                ],
                "quantity": 4
            },
            {
                "id": 1224,
                "name": "チェレン",
                "supertype": "Trainer",
                "subtypes": [
                    "Supporter"
                ],
                "quantity": 4
            },
            {
                "id": 1264,
                "name": "バトルコロシアム",
                "supertype": "Trainer",
                "subtypes": [
                    "Stadium"
                ],
                "quantity": 4
            }
        ]
    },
    {
        "id": "deck",
        "label": "ドラパルト",
        "source": "deck.csv",
        "cards": [
            {
                "id": 2,
                "name": "基本【炎】エネルギー",
                "supertype": "Energy",
                "subtypes": [],
                "quantity": 3
            },
            {
                "id": 5,
                "name": "基本【超】エネルギー",
                "supertype": "Energy",
                "subtypes": [],
                "quantity": 4
            },
            {
                "id": 7,
                "name": "基本【悪】エネルギー",
                "supertype": "Energy",
                "subtypes": [],
                "quantity": 2
            },
            {
                "id": 112,
                "name": "マシマシラ",
                "supertype": "Pokémon",
                "subtypes": [
                    "Basic"
                ],
                "hp": 110,
                "quantity": 2
            },
            {
                "id": 119,
                "name": "ドラメシヤ",
                "supertype": "Pokémon",
                "subtypes": [
                    "Basic"
                ],
                "hp": 70,
                "quantity": 4
            },
            {
                "id": 120,
                "name": "ドロンチ",
                "supertype": "Pokémon",
                "subtypes": [
                    "Stage 1"
                ],
                "hp": 90,
                "quantity": 4
            },
            {
                "id": 121,
                "name": "ドラパルトex",
                "supertype": "Pokémon",
                "subtypes": [
                    "Stage 2"
                ],
                "hp": 320,
                "quantity": 3
            },
            {
                "id": 140,
                "name": "キチキギスex",
                "supertype": "Pokémon",
                "subtypes": [
                    "Basic"
                ],
                "hp": 210,
                "quantity": 1
            },
            {
                "id": 235,
                "name": "スボミー",
                "supertype": "Pokémon",
                "subtypes": [
                    "Basic"
                ],
                "hp": 30,
                "quantity": 1
            },
            {
                "id": 272,
                "name": "リーリエのピッピex",
                "supertype": "Pokémon",
                "subtypes": [
                    "Basic"
                ],
                "hp": 190,
                "quantity": 1
            },
            {
                "id": 689,
                "name": "イベルタル",
                "supertype": "Pokémon",
                "subtypes": [
                    "Basic"
                ],
                "hp": 110,
                "quantity": 1
            },
            {
                "id": 791,
                "name": "ファイヤー",
                "supertype": "Pokémon",
                "subtypes": [
                    "Basic"
                ],
                "hp": 120,
                "quantity": 1
            },
            {
                "id": 1071,
                "name": "ニャースex",
                "supertype": "Pokémon",
                "subtypes": [
                    "Basic"
                ],
                "hp": 170,
                "quantity": 1
            },
            {
                "id": 1080,
                "name": "アンフェアスタンプ",
                "supertype": "Trainer",
                "subtypes": [
                    "Item"
                ],
                "quantity": 1
            },
            {
                "id": 1086,
                "name": "なかよしポフィン",
                "supertype": "Trainer",
                "subtypes": [
                    "Item"
                ],
                "quantity": 4
            },
            {
                "id": 1097,
                "name": "夜のタンカ",
                "supertype": "Trainer",
                "subtypes": [
                    "Item"
                ],
                "quantity": 3
            },
            {
                "id": 1121,
                "name": "ハイパーボール",
                "supertype": "Trainer",
                "subtypes": [
                    "Item"
                ],
                "quantity": 4
            },
            {
                "id": 1152,
                "name": "ポケパッド",
                "supertype": "Trainer",
                "subtypes": [
                    "Item"
                ],
                "quantity": 4
            },
            {
                "id": 1182,
                "name": "ボスの指令",
                "supertype": "Trainer",
                "subtypes": [
                    "Supporter"
                ],
                "quantity": 3
            },
            {
                "id": 1198,
                "name": "アカマツ",
                "supertype": "Trainer",
                "subtypes": [
                    "Supporter"
                ],
                "quantity": 3
            },
            {
                "id": 1210,
                "name": "タケシのスカウト",
                "supertype": "Trainer",
                "subtypes": [
                    "Supporter"
                ],
                "quantity": 1
            },
            {
                "id": 1213,
                "name": "ジャッジマン",
                "supertype": "Trainer",
                "subtypes": [
                    "Supporter"
                ],
                "quantity": 1
            },
            {
                "id": 1227,
                "name": "リーリエの決心",
                "supertype": "Trainer",
                "subtypes": [
                    "Supporter"
                ],
                "quantity": 4
            },
            {
                "id": 1231,
                "name": "ヒカリ",
                "supertype": "Trainer",
                "subtypes": [
                    "Supporter"
                ],
                "quantity": 1
            },
            {
                "id": 1240,
                "name": "メイのはげまし",
                "supertype": "Trainer",
                "subtypes": [
                    "Supporter"
                ],
                "quantity": 1
            },
            {
                "id": 1256,
                "name": "ロケット団の監視塔",
                "supertype": "Trainer",
                "subtypes": [
                    "Stadium"
                ],
                "quantity": 1
            },
            {
                "id": 1260,
                "name": "危ない廃墟",
                "supertype": "Trainer",
                "subtypes": [
                    "Stadium"
                ],
                "quantity": 1
            }
        ]
    },
    {
        "id": "festival_deck",
        "label": "おまつりおんど",
        "source": "festival_deck.csv",
        "cards": [
            {
                "id": 1,
                "name": "基本【草】エネルギー",
                "supertype": "Energy",
                "subtypes": [],
                "quantity": 14
            },
            {
                "id": 11,
                "name": "ミストエネルギー",
                "supertype": "Energy",
                "subtypes": [],
                "quantity": 2
            },
            {
                "id": 89,
                "name": "サルノリ",
                "supertype": "Pokémon",
                "subtypes": [
                    "Basic"
                ],
                "hp": 70,
                "quantity": 4
            },
            {
                "id": 90,
                "name": "バチンキー",
                "supertype": "Pokémon",
                "subtypes": [
                    "Stage 1"
                ],
                "hp": 100,
                "quantity": 4
            },
            {
                "id": 92,
                "name": "カジッチュ",
                "supertype": "Pokémon",
                "subtypes": [
                    "Basic"
                ],
                "hp": 40,
                "quantity": 4
            },
            {
                "id": 93,
                "name": "カミッチュ",
                "supertype": "Pokémon",
                "subtypes": [
                    "Stage 1"
                ],
                "hp": 80,
                "quantity": 4
            },
            {
                "id": 1071,
                "name": "ニャースex",
                "supertype": "Pokémon",
                "subtypes": [
                    "Basic"
                ],
                "hp": 170,
                "quantity": 1
            },
            {
                "id": 1086,
                "name": "なかよしポフィン",
                "supertype": "Trainer",
                "subtypes": [
                    "Item"
                ],
                "quantity": 4
            },
            {
                "id": 1097,
                "name": "夜のタンカ",
                "supertype": "Trainer",
                "subtypes": [
                    "Item"
                ],
                "quantity": 2
            },
            {
                "id": 1121,
                "name": "ハイパーボール",
                "supertype": "Trainer",
                "subtypes": [
                    "Item"
                ],
                "quantity": 4
            },
            {
                "id": 1152,
                "name": "ポケパッド",
                "supertype": "Trainer",
                "subtypes": [
                    "Item"
                ],
                "quantity": 4
            },
            {
                "id": 1182,
                "name": "ボスの指令",
                "supertype": "Trainer",
                "subtypes": [
                    "Supporter"
                ],
                "quantity": 3
            },
            {
                "id": 1227,
                "name": "リーリエの決心",
                "supertype": "Trainer",
                "subtypes": [
                    "Supporter"
                ],
                "quantity": 4
            },
            {
                "id": 1231,
                "name": "ヒカリ",
                "supertype": "Trainer",
                "subtypes": [
                    "Supporter"
                ],
                "quantity": 2
            },
            {
                "id": 1245,
                "name": "お祭り会場",
                "supertype": "Trainer",
                "subtypes": [
                    "Stadium"
                ],
                "quantity": 4
            }
        ]
    },
    {
        "id": "froslass_starmie_deck",
        "label": "メガユキメノコ/スターミー",
        "source": "froslass_starmie_deck.csv",
        "cards": [
            {
                "id": 3,
                "name": "基本【水】エネルギー",
                "supertype": "Energy",
                "subtypes": [],
                "quantity": 9
            },
            {
                "id": 11,
                "name": "ミストエネルギー",
                "supertype": "Energy",
                "subtypes": [],
                "quantity": 1
            },
            {
                "id": 12,
                "name": "レガシーエネルギー",
                "supertype": "Energy",
                "subtypes": [],
                "quantity": 1
            },
            {
                "id": 17,
                "name": "イグニッションエネルギー",
                "supertype": "Energy",
                "subtypes": [],
                "quantity": 1
            },
            {
                "id": 860,
                "name": "ユキワラシ",
                "supertype": "Pokémon",
                "subtypes": [
                    "Basic"
                ],
                "hp": 70,
                "quantity": 4
            },
            {
                "id": 861,
                "name": "メガユキメノコex",
                "supertype": "Pokémon",
                "subtypes": [
                    "Stage 1"
                ],
                "hp": 310,
                "quantity": 3
            },
            {
                "id": 1030,
                "name": "ヒトデマン",
                "supertype": "Pokémon",
                "subtypes": [
                    "Basic"
                ],
                "hp": 70,
                "quantity": 4
            },
            {
                "id": 1031,
                "name": "メガスターミーex",
                "supertype": "Pokémon",
                "subtypes": [
                    "Stage 1"
                ],
                "hp": 330,
                "quantity": 3
            },
            {
                "id": 1086,
                "name": "なかよしポフィン",
                "supertype": "Trainer",
                "subtypes": [
                    "Item"
                ],
                "quantity": 4
            },
            {
                "id": 1097,
                "name": "夜のタンカ",
                "supertype": "Trainer",
                "subtypes": [
                    "Item"
                ],
                "quantity": 1
            },
            {
                "id": 1119,
                "name": "エネルギー転送",
                "supertype": "Trainer",
                "subtypes": [
                    "Item"
                ],
                "quantity": 4
            },
            {
                "id": 1122,
                "name": "ポケギア3.0",
                "supertype": "Trainer",
                "subtypes": [
                    "Item"
                ],
                "quantity": 3
            },
            {
                "id": 1123,
                "name": "ポケモンいれかえ",
                "supertype": "Trainer",
                "subtypes": [
                    "Item"
                ],
                "quantity": 2
            },
            {
                "id": 1145,
                "name": "メガシグナル",
                "supertype": "Trainer",
                "subtypes": [
                    "Item"
                ],
                "quantity": 2
            },
            {
                "id": 1182,
                "name": "ボスの指令",
                "supertype": "Trainer",
                "subtypes": [
                    "Supporter"
                ],
                "quantity": 2
            },
            {
                "id": 1189,
                "name": "セイジ",
                "supertype": "Trainer",
                "subtypes": [
                    "Supporter"
                ],
                "quantity": 4
            },
            {
                "id": 1211,
                "name": "からておうの稽古",
                "supertype": "Trainer",
                "subtypes": [
                    "Supporter"
                ],
                "quantity": 1
            },
            {
                "id": 1225,
                "name": "トウコ",
                "supertype": "Trainer",
                "subtypes": [
                    "Supporter"
                ],
                "quantity": 2
            },
            {
                "id": 1227,
                "name": "リーリエの決心",
                "supertype": "Trainer",
                "subtypes": [
                    "Supporter"
                ],
                "quantity": 4
            },
            {
                "id": 1229,
                "name": "ミツルの思いやり",
                "supertype": "Trainer",
                "subtypes": [
                    "Supporter"
                ],
                "quantity": 3
            },
            {
                "id": 1252,
                "name": "グラビティーマウンテン",
                "supertype": "Trainer",
                "subtypes": [
                    "Stadium"
                ],
                "quantity": 2
            }
        ]
    },
    {
        "id": "hibiki_crustle_deck",
        "label": "ヒビキ/イワパレス",
        "source": "hibiki_crustle_deck.csv",
        "cards": [
            {
                "id": 1,
                "name": "基本【草】エネルギー",
                "supertype": "Energy",
                "subtypes": [],
                "quantity": 4
            },
            {
                "id": 2,
                "name": "基本【炎】エネルギー",
                "supertype": "Energy",
                "subtypes": [],
                "quantity": 8
            },
            {
                "id": 14,
                "name": "スパイクエネルギー",
                "supertype": "Energy",
                "subtypes": [],
                "quantity": 2
            },
            {
                "id": 18,
                "name": "グロウ【草】エネルギー",
                "supertype": "Energy",
                "subtypes": [],
                "quantity": 4
            },
            {
                "id": 344,
                "name": "イシズマイ",
                "supertype": "Pokémon",
                "subtypes": [
                    "Basic"
                ],
                "hp": 70,
                "quantity": 4
            },
            {
                "id": 345,
                "name": "イワパレス",
                "supertype": "Pokémon",
                "subtypes": [
                    "Stage 1"
                ],
                "hp": 150,
                "quantity": 4
            },
            {
                "id": 352,
                "name": "ヒビキのヒノアラシ",
                "supertype": "Pokémon",
                "subtypes": [
                    "Basic"
                ],
                "hp": 70,
                "quantity": 4
            },
            {
                "id": 353,
                "name": "ヒビキのマグマラシ",
                "supertype": "Pokémon",
                "subtypes": [
                    "Stage 1"
                ],
                "hp": 100,
                "quantity": 4
            },
            {
                "id": 354,
                "name": "ヒビキのバクフーン",
                "supertype": "Pokémon",
                "subtypes": [
                    "Stage 2"
                ],
                "hp": 170,
                "quantity": 4
            },
            {
                "id": 1079,
                "name": "ふしぎなアメ",
                "supertype": "Trainer",
                "subtypes": [
                    "Item"
                ],
                "quantity": 2
            },
            {
                "id": 1121,
                "name": "ハイパーボール",
                "supertype": "Trainer",
                "subtypes": [
                    "Item"
                ],
                "quantity": 3
            },
            {
                "id": 1152,
                "name": "ポケパッド",
                "supertype": "Trainer",
                "subtypes": [
                    "Item"
                ],
                "quantity": 2
            },
            {
                "id": 1159,
                "name": "ヒーローマント",
                "supertype": "Trainer",
                "subtypes": [
                    "Pokémon Tool"
                ],
                "quantity": 1
            },
            {
                "id": 1182,
                "name": "ボスの指令",
                "supertype": "Trainer",
                "subtypes": [
                    "Supporter"
                ],
                "quantity": 4
            },
            {
                "id": 1215,
                "name": "ヒビキの冒険",
                "supertype": "Trainer",
                "subtypes": [
                    "Supporter"
                ],
                "quantity": 4
            },
            {
                "id": 1227,
                "name": "リーリエの決心",
                "supertype": "Trainer",
                "subtypes": [
                    "Supporter"
                ],
                "quantity": 4
            },
            {
                "id": 1264,
                "name": "バトルコロシアム",
                "supertype": "Trainer",
                "subtypes": [
                    "Stadium"
                ],
                "quantity": 2
            }
        ]
    },
    {
        "id": "hibiki_typhlosion_deck",
        "label": "ヒビキ/バクフーン",
        "source": "hibiki_typhlosion_deck.csv",
        "cards": [
            {
                "id": 2,
                "name": "基本【炎】エネルギー",
                "supertype": "Energy",
                "subtypes": [],
                "quantity": 7
            },
            {
                "id": 202,
                "name": "ビクティニ",
                "supertype": "Pokémon",
                "subtypes": [
                    "Basic"
                ],
                "hp": 70,
                "quantity": 3
            },
            {
                "id": 352,
                "name": "ヒビキのヒノアラシ",
                "supertype": "Pokémon",
                "subtypes": [
                    "Basic"
                ],
                "hp": 70,
                "quantity": 4
            },
            {
                "id": 353,
                "name": "ヒビキのマグマラシ",
                "supertype": "Pokémon",
                "subtypes": [
                    "Stage 1"
                ],
                "hp": 100,
                "quantity": 4
            },
            {
                "id": 354,
                "name": "ヒビキのバクフーン",
                "supertype": "Pokémon",
                "subtypes": [
                    "Stage 2"
                ],
                "hp": 170,
                "quantity": 4
            },
            {
                "id": 1086,
                "name": "なかよしポフィン",
                "supertype": "Trainer",
                "subtypes": [
                    "Item"
                ],
                "quantity": 4
            },
            {
                "id": 1097,
                "name": "夜のタンカ",
                "supertype": "Trainer",
                "subtypes": [
                    "Item"
                ],
                "quantity": 4
            },
            {
                "id": 1114,
                "name": "とりかえチケット",
                "supertype": "Trainer",
                "subtypes": [
                    "Item"
                ],
                "quantity": 1
            },
            {
                "id": 1121,
                "name": "ハイパーボール",
                "supertype": "Trainer",
                "subtypes": [
                    "Item"
                ],
                "quantity": 4
            },
            {
                "id": 1123,
                "name": "ポケモンいれかえ",
                "supertype": "Trainer",
                "subtypes": [
                    "Item"
                ],
                "quantity": 2
            },
            {
                "id": 1152,
                "name": "ポケパッド",
                "supertype": "Trainer",
                "subtypes": [
                    "Item"
                ],
                "quantity": 4
            },
            {
                "id": 1158,
                "name": "マキシマムベルト",
                "supertype": "Trainer",
                "subtypes": [
                    "Pokémon Tool"
                ],
                "quantity": 1
            },
            {
                "id": 1175,
                "name": "ブレイブバングル",
                "supertype": "Trainer",
                "subtypes": [
                    "Pokémon Tool"
                ],
                "quantity": 4
            },
            {
                "id": 1187,
                "name": "マツバの確信",
                "supertype": "Trainer",
                "subtypes": [
                    "Supporter"
                ],
                "quantity": 2
            },
            {
                "id": 1215,
                "name": "ヒビキの冒険",
                "supertype": "Trainer",
                "subtypes": [
                    "Supporter"
                ],
                "quantity": 4
            },
            {
                "id": 1227,
                "name": "リーリエの決心",
                "supertype": "Trainer",
                "subtypes": [
                    "Supporter"
                ],
                "quantity": 4
            },
            {
                "id": 1264,
                "name": "バトルコロシアム",
                "supertype": "Trainer",
                "subtypes": [
                    "Stadium"
                ],
                "quantity": 4
            }
        ]
    },
    {
        "id": "hop_trevenant_deck",
        "label": "ホップ/オーロット",
        "source": "hop_trevenant_deck.csv",
        "cards": [
            {
                "id": 11,
                "name": "ミストエネルギー",
                "supertype": "Energy",
                "subtypes": [],
                "quantity": 4
            },
            {
                "id": 12,
                "name": "レガシーエネルギー",
                "supertype": "Energy",
                "subtypes": [],
                "quantity": 1
            },
            {
                "id": 19,
                "name": "テレパス【超】エネルギー",
                "supertype": "Energy",
                "subtypes": [],
                "quantity": 4
            },
            {
                "id": 65,
                "name": "ノコッチ",
                "supertype": "Pokémon",
                "subtypes": [
                    "Basic"
                ],
                "hp": 60,
                "quantity": 4
            },
            {
                "id": 66,
                "name": "ノココッチ",
                "supertype": "Pokémon",
                "subtypes": [
                    "Stage 1"
                ],
                "hp": 140,
                "quantity": 3
            },
            {
                "id": 304,
                "name": "ホップのカビゴン",
                "supertype": "Pokémon",
                "subtypes": [
                    "Basic"
                ],
                "hp": 150,
                "quantity": 2
            },
            {
                "id": 878,
                "name": "ホップのボクレー",
                "supertype": "Pokémon",
                "subtypes": [
                    "Basic"
                ],
                "hp": 70,
                "quantity": 4
            },
            {
                "id": 879,
                "name": "ホップのオーロット",
                "supertype": "Pokémon",
                "subtypes": [
                    "Stage 1"
                ],
                "hp": 140,
                "quantity": 2
            },
            {
                "id": 1086,
                "name": "なかよしポフィン",
                "supertype": "Trainer",
                "subtypes": [
                    "Item"
                ],
                "quantity": 4
            },
            {
                "id": 1097,
                "name": "夜のタンカ",
                "supertype": "Trainer",
                "subtypes": [
                    "Item"
                ],
                "quantity": 3
            },
            {
                "id": 1115,
                "name": "ホップのバッグ",
                "supertype": "Trainer",
                "subtypes": [
                    "Item"
                ],
                "quantity": 3
            },
            {
                "id": 1122,
                "name": "ポケギア3.0",
                "supertype": "Trainer",
                "subtypes": [
                    "Item"
                ],
                "quantity": 4
            },
            {
                "id": 1152,
                "name": "ポケパッド",
                "supertype": "Trainer",
                "subtypes": [
                    "Item"
                ],
                "quantity": 4
            },
            {
                "id": 1171,
                "name": "ホップのこだわりハチマキ",
                "supertype": "Trainer",
                "subtypes": [
                    "Pokémon Tool"
                ],
                "quantity": 4
            },
            {
                "id": 1182,
                "name": "ボスの指令",
                "supertype": "Trainer",
                "subtypes": [
                    "Supporter"
                ],
                "quantity": 2
            },
            {
                "id": 1194,
                "name": "アクロマの執念",
                "supertype": "Trainer",
                "subtypes": [
                    "Supporter"
                ],
                "quantity": 2
            },
            {
                "id": 1210,
                "name": "タケシのスカウト",
                "supertype": "Trainer",
                "subtypes": [
                    "Supporter"
                ],
                "quantity": 2
            },
            {
                "id": 1227,
                "name": "リーリエの決心",
                "supertype": "Trainer",
                "subtypes": [
                    "Supporter"
                ],
                "quantity": 4
            },
            {
                "id": 1255,
                "name": "ハロンタウン",
                "supertype": "Trainer",
                "subtypes": [
                    "Stadium"
                ],
                "quantity": 4
            }
        ]
    },
    {
        "id": "iono_lightning_deck",
        "label": "ナンジャモ雷",
        "source": "iono_lightning_deck.csv",
        "cards": [
            {
                "id": 4,
                "name": "基本【雷】エネルギー",
                "supertype": "Energy",
                "subtypes": [],
                "quantity": 22
            },
            {
                "id": 265,
                "name": "ナンジャモのビリリダマ",
                "supertype": "Pokémon",
                "subtypes": [
                    "Basic"
                ],
                "hp": 70,
                "quantity": 3
            },
            {
                "id": 268,
                "name": "ナンジャモのズピカ",
                "supertype": "Pokémon",
                "subtypes": [
                    "Basic"
                ],
                "hp": 60,
                "quantity": 3
            },
            {
                "id": 269,
                "name": "ナンジャモのハラバリーex",
                "supertype": "Pokémon",
                "subtypes": [
                    "Stage 1"
                ],
                "hp": 280,
                "quantity": 3
            },
            {
                "id": 270,
                "name": "ナンジャモのカイデン",
                "supertype": "Pokémon",
                "subtypes": [
                    "Basic"
                ],
                "hp": 60,
                "quantity": 3
            },
            {
                "id": 271,
                "name": "ナンジャモのタイカイデン",
                "supertype": "Pokémon",
                "subtypes": [
                    "Stage 1"
                ],
                "hp": 120,
                "quantity": 3
            },
            {
                "id": 1086,
                "name": "なかよしポフィン",
                "supertype": "Trainer",
                "subtypes": [
                    "Item"
                ],
                "quantity": 3
            },
            {
                "id": 1097,
                "name": "夜のタンカ",
                "supertype": "Trainer",
                "subtypes": [
                    "Item"
                ],
                "quantity": 2
            },
            {
                "id": 1110,
                "name": "つりざおMAX",
                "supertype": "Trainer",
                "subtypes": [
                    "Item"
                ],
                "quantity": 1
            },
            {
                "id": 1118,
                "name": "エネルギー回収",
                "supertype": "Trainer",
                "subtypes": [
                    "Item"
                ],
                "quantity": 1
            },
            {
                "id": 1121,
                "name": "ハイパーボール",
                "supertype": "Trainer",
                "subtypes": [
                    "Item"
                ],
                "quantity": 3
            },
            {
                "id": 1152,
                "name": "ポケパッド",
                "supertype": "Trainer",
                "subtypes": [
                    "Item"
                ],
                "quantity": 2
            },
            {
                "id": 1227,
                "name": "リーリエの決心",
                "supertype": "Trainer",
                "subtypes": [
                    "Supporter"
                ],
                "quantity": 4
            },
            {
                "id": 1233,
                "name": "カナリィ",
                "supertype": "Trainer",
                "subtypes": [
                    "Supporter"
                ],
                "quantity": 4
            },
            {
                "id": 1254,
                "name": "ハッコウシティ",
                "supertype": "Trainer",
                "subtypes": [
                    "Stadium"
                ],
                "quantity": 3
            }
        ]
    },
    {
        "id": "mega_abomasnow_deck",
        "label": "メガユキノオー",
        "source": "mega_abomasnow_deck.csv",
        "cards": [
            {
                "id": 3,
                "name": "基本【水】エネルギー",
                "supertype": "Energy",
                "subtypes": [],
                "quantity": 35
            },
            {
                "id": 721,
                "name": "カイオーガ",
                "supertype": "Pokémon",
                "subtypes": [
                    "Basic"
                ],
                "hp": 150,
                "quantity": 2
            },
            {
                "id": 722,
                "name": "ユキカブリ",
                "supertype": "Pokémon",
                "subtypes": [
                    "Basic"
                ],
                "hp": 90,
                "quantity": 4
            },
            {
                "id": 723,
                "name": "メガユキノオーex",
                "supertype": "Pokémon",
                "subtypes": [
                    "Stage 1"
                ],
                "hp": 350,
                "quantity": 4
            },
            {
                "id": 1145,
                "name": "メガシグナル",
                "supertype": "Trainer",
                "subtypes": [
                    "Item"
                ],
                "quantity": 4
            },
            {
                "id": 1158,
                "name": "マキシマムベルト",
                "supertype": "Trainer",
                "subtypes": [
                    "Pokémon Tool"
                ],
                "quantity": 1
            },
            {
                "id": 1205,
                "name": "シアノ",
                "supertype": "Trainer",
                "subtypes": [
                    "Supporter"
                ],
                "quantity": 2
            },
            {
                "id": 1227,
                "name": "リーリエの決心",
                "supertype": "Trainer",
                "subtypes": [
                    "Supporter"
                ],
                "quantity": 4
            },
            {
                "id": 1235,
                "name": "ウエートレス",
                "supertype": "Trainer",
                "subtypes": [
                    "Supporter"
                ],
                "quantity": 4
            }
        ]
    },
    {
        "id": "mega_lopunny_deck",
        "label": "メガミミロップ",
        "source": "mega_lopunny_deck.csv",
        "cards": [
            {
                "id": 2,
                "name": "基本【炎】エネルギー",
                "supertype": "Energy",
                "subtypes": [],
                "quantity": 3
            },
            {
                "id": 11,
                "name": "ミストエネルギー",
                "supertype": "Energy",
                "subtypes": [],
                "quantity": 4
            },
            {
                "id": 13,
                "name": "リッチエネルギー",
                "supertype": "Energy",
                "subtypes": [],
                "quantity": 1
            },
            {
                "id": 65,
                "name": "ノコッチ",
                "supertype": "Pokémon",
                "subtypes": [
                    "Basic"
                ],
                "hp": 60,
                "quantity": 1
            },
            {
                "id": 66,
                "name": "ノココッチ",
                "supertype": "Pokémon",
                "subtypes": [
                    "Stage 1"
                ],
                "hp": 140,
                "quantity": 3
            },
            {
                "id": 109,
                "name": "ケーシィ",
                "supertype": "Pokémon",
                "subtypes": [
                    "Basic"
                ],
                "hp": 40,
                "quantity": 1
            },
            {
                "id": 174,
                "name": "スピンロトム",
                "supertype": "Pokémon",
                "subtypes": [
                    "Basic"
                ],
                "hp": 70,
                "quantity": 1
            },
            {
                "id": 305,
                "name": "ノコッチ",
                "supertype": "Pokémon",
                "subtypes": [
                    "Basic"
                ],
                "hp": 70,
                "quantity": 3
            },
            {
                "id": 791,
                "name": "ファイヤー",
                "supertype": "Pokémon",
                "subtypes": [
                    "Basic"
                ],
                "hp": 120,
                "quantity": 1
            },
            {
                "id": 848,
                "name": "ミミロル",
                "supertype": "Pokémon",
                "subtypes": [
                    "Basic"
                ],
                "hp": 70,
                "quantity": 3
            },
            {
                "id": 849,
                "name": "メガミミロップex",
                "supertype": "Pokémon",
                "subtypes": [
                    "Stage 1"
                ],
                "hp": 330,
                "quantity": 3
            },
            {
                "id": 1086,
                "name": "なかよしポフィン",
                "supertype": "Trainer",
                "subtypes": [
                    "Item"
                ],
                "quantity": 3
            },
            {
                "id": 1097,
                "name": "夜のタンカ",
                "supertype": "Trainer",
                "subtypes": [
                    "Item"
                ],
                "quantity": 1
            },
            {
                "id": 1121,
                "name": "ハイパーボール",
                "supertype": "Trainer",
                "subtypes": [
                    "Item"
                ],
                "quantity": 3
            },
            {
                "id": 1122,
                "name": "ポケギア3.0",
                "supertype": "Trainer",
                "subtypes": [
                    "Item"
                ],
                "quantity": 4
            },
            {
                "id": 1152,
                "name": "ポケパッド",
                "supertype": "Trainer",
                "subtypes": [
                    "Item"
                ],
                "quantity": 4
            },
            {
                "id": 1174,
                "name": "ふうせん",
                "supertype": "Trainer",
                "subtypes": [
                    "Pokémon Tool"
                ],
                "quantity": 3
            },
            {
                "id": 1182,
                "name": "ボスの指令",
                "supertype": "Trainer",
                "subtypes": [
                    "Supporter"
                ],
                "quantity": 4
            },
            {
                "id": 1225,
                "name": "トウコ",
                "supertype": "Trainer",
                "subtypes": [
                    "Supporter"
                ],
                "quantity": 4
            },
            {
                "id": 1227,
                "name": "リーリエの決心",
                "supertype": "Trainer",
                "subtypes": [
                    "Supporter"
                ],
                "quantity": 3
            },
            {
                "id": 1229,
                "name": "ミツルの思いやり",
                "supertype": "Trainer",
                "subtypes": [
                    "Supporter"
                ],
                "quantity": 4
            },
            {
                "id": 1264,
                "name": "バトルコロシアム",
                "supertype": "Trainer",
                "subtypes": [
                    "Stadium"
                ],
                "quantity": 3
            }
        ]
    },
    {
        "id": "mega_lucario_deck",
        "label": "メガルカリオ",
        "source": "mega_lucario_deck.csv",
        "cards": [
            {
                "id": 6,
                "name": "基本【闘】エネルギー",
                "supertype": "Energy",
                "subtypes": [],
                "quantity": 14
            },
            {
                "id": 673,
                "name": "マクノシタ",
                "supertype": "Pokémon",
                "subtypes": [
                    "Basic"
                ],
                "hp": 80,
                "quantity": 2
            },
            {
                "id": 674,
                "name": "ハリテヤマ",
                "supertype": "Pokémon",
                "subtypes": [
                    "Stage 1"
                ],
                "hp": 150,
                "quantity": 2
            },
            {
                "id": 675,
                "name": "ルナトーン",
                "supertype": "Pokémon",
                "subtypes": [
                    "Basic"
                ],
                "hp": 110,
                "quantity": 2
            },
            {
                "id": 676,
                "name": "ソルロック",
                "supertype": "Pokémon",
                "subtypes": [
                    "Basic"
                ],
                "hp": 110,
                "quantity": 3
            },
            {
                "id": 677,
                "name": "リオル",
                "supertype": "Pokémon",
                "subtypes": [
                    "Basic"
                ],
                "hp": 80,
                "quantity": 4
            },
            {
                "id": 678,
                "name": "メガルカリオex",
                "supertype": "Pokémon",
                "subtypes": [
                    "Stage 1"
                ],
                "hp": 340,
                "quantity": 4
            },
            {
                "id": 1102,
                "name": "ダークボール",
                "supertype": "Trainer",
                "subtypes": [
                    "Item"
                ],
                "quantity": 4
            },
            {
                "id": 1123,
                "name": "ポケモンいれかえ",
                "supertype": "Trainer",
                "subtypes": [
                    "Item"
                ],
                "quantity": 2
            },
            {
                "id": 1141,
                "name": "パワープロテイン",
                "supertype": "Trainer",
                "subtypes": [
                    "Item"
                ],
                "quantity": 4
            },
            {
                "id": 1142,
                "name": "ファイトゴング",
                "supertype": "Trainer",
                "subtypes": [
                    "Item"
                ],
                "quantity": 4
            },
            {
                "id": 1152,
                "name": "ポケパッド",
                "supertype": "Trainer",
                "subtypes": [
                    "Item"
                ],
                "quantity": 2
            },
            {
                "id": 1159,
                "name": "ヒーローマント",
                "supertype": "Trainer",
                "subtypes": [
                    "Pokémon Tool"
                ],
                "quantity": 1
            },
            {
                "id": 1182,
                "name": "ボスの指令",
                "supertype": "Trainer",
                "subtypes": [
                    "Supporter"
                ],
                "quantity": 3
            },
            {
                "id": 1192,
                "name": "ゼイユ",
                "supertype": "Trainer",
                "subtypes": [
                    "Supporter"
                ],
                "quantity": 4
            },
            {
                "id": 1227,
                "name": "リーリエの決心",
                "supertype": "Trainer",
                "subtypes": [
                    "Supporter"
                ],
                "quantity": 4
            },
            {
                "id": 1252,
                "name": "グラビティーマウンテン",
                "supertype": "Trainer",
                "subtypes": [
                    "Stadium"
                ],
                "quantity": 1
            }
        ]
    },
    {
        "id": "mega_starmie_deck",
        "label": "メガスターミー",
        "source": "mega_starmie_deck.csv",
        "cards": [
            {
                "id": 3,
                "name": "基本【水】エネルギー",
                "supertype": "Energy",
                "subtypes": [],
                "quantity": 9
            },
            {
                "id": 17,
                "name": "イグニッションエネルギー",
                "supertype": "Energy",
                "subtypes": [],
                "quantity": 4
            },
            {
                "id": 666,
                "name": "エースバーン",
                "supertype": "Pokémon",
                "subtypes": [
                    "Stage 2"
                ],
                "hp": 160,
                "quantity": 4
            },
            {
                "id": 1030,
                "name": "ヒトデマン",
                "supertype": "Pokémon",
                "subtypes": [
                    "Basic"
                ],
                "hp": 70,
                "quantity": 3
            },
            {
                "id": 1031,
                "name": "メガスターミーex",
                "supertype": "Pokémon",
                "subtypes": [
                    "Stage 1"
                ],
                "hp": 330,
                "quantity": 3
            },
            {
                "id": 1086,
                "name": "なかよしポフィン",
                "supertype": "Trainer",
                "subtypes": [
                    "Item"
                ],
                "quantity": 4
            },
            {
                "id": 1097,
                "name": "夜のタンカ",
                "supertype": "Trainer",
                "subtypes": [
                    "Item"
                ],
                "quantity": 2
            },
            {
                "id": 1120,
                "name": "クラッシュハンマー",
                "supertype": "Trainer",
                "subtypes": [
                    "Item"
                ],
                "quantity": 4
            },
            {
                "id": 1121,
                "name": "ハイパーボール",
                "supertype": "Trainer",
                "subtypes": [
                    "Item"
                ],
                "quantity": 1
            },
            {
                "id": 1122,
                "name": "ポケギア3.0",
                "supertype": "Trainer",
                "subtypes": [
                    "Item"
                ],
                "quantity": 4
            },
            {
                "id": 1145,
                "name": "メガシグナル",
                "supertype": "Trainer",
                "subtypes": [
                    "Item"
                ],
                "quantity": 4
            },
            {
                "id": 1159,
                "name": "ヒーローマント",
                "supertype": "Trainer",
                "subtypes": [
                    "Pokémon Tool"
                ],
                "quantity": 1
            },
            {
                "id": 1182,
                "name": "ボスの指令",
                "supertype": "Trainer",
                "subtypes": [
                    "Supporter"
                ],
                "quantity": 1
            },
            {
                "id": 1189,
                "name": "セイジ",
                "supertype": "Trainer",
                "subtypes": [
                    "Supporter"
                ],
                "quantity": 4
            },
            {
                "id": 1223,
                "name": "クラウン",
                "supertype": "Trainer",
                "subtypes": [
                    "Supporter"
                ],
                "quantity": 2
            },
            {
                "id": 1225,
                "name": "トウコ",
                "supertype": "Trainer",
                "subtypes": [
                    "Supporter"
                ],
                "quantity": 2
            },
            {
                "id": 1227,
                "name": "リーリエの決心",
                "supertype": "Trainer",
                "subtypes": [
                    "Supporter"
                ],
                "quantity": 4
            },
            {
                "id": 1229,
                "name": "ミツルの思いやり",
                "supertype": "Trainer",
                "subtypes": [
                    "Supporter"
                ],
                "quantity": 4
            }
        ]
    },
    {
        "id": "rocket_honchkrow_deck",
        "label": "ロケット団ドンカラス",
        "source": "rocket_honchkrow_deck.csv",
        "cards": [
            {
                "id": 15,
                "name": "ロケット団エネルギー",
                "supertype": "Energy",
                "subtypes": [],
                "quantity": 4
            },
            {
                "id": 17,
                "name": "イグニッションエネルギー",
                "supertype": "Energy",
                "subtypes": [],
                "quantity": 4
            },
            {
                "id": 414,
                "name": "ロケット団のフリーザー",
                "supertype": "Pokémon",
                "subtypes": [
                    "Basic"
                ],
                "hp": 120,
                "quantity": 2
            },
            {
                "id": 463,
                "name": "ロケット団のヤミカラス",
                "supertype": "Pokémon",
                "subtypes": [
                    "Basic"
                ],
                "hp": 80,
                "quantity": 4
            },
            {
                "id": 473,
                "name": "ロケット団のポリゴン",
                "supertype": "Pokémon",
                "subtypes": [
                    "Basic"
                ],
                "hp": 60,
                "quantity": 2
            },
            {
                "id": 474,
                "name": "ロケット団のポリゴン2",
                "supertype": "Pokémon",
                "subtypes": [
                    "Stage 1"
                ],
                "hp": 90,
                "quantity": 2
            },
            {
                "id": 475,
                "name": "ロケット団のポリゴンZ",
                "supertype": "Pokémon",
                "subtypes": [
                    "Stage 2"
                ],
                "hp": 140,
                "quantity": 1
            },
            {
                "id": 891,
                "name": "ロケット団のドンカラス",
                "supertype": "Pokémon",
                "subtypes": [
                    "Stage 1"
                ],
                "hp": 130,
                "quantity": 4
            },
            {
                "id": 1077,
                "name": "ロトりぼう",
                "supertype": "Trainer",
                "subtypes": [
                    "Item"
                ],
                "quantity": 3
            },
            {
                "id": 1097,
                "name": "夜のタンカ",
                "supertype": "Trainer",
                "subtypes": [
                    "Item"
                ],
                "quantity": 2
            },
            {
                "id": 1109,
                "name": "ミラクルインカム",
                "supertype": "Trainer",
                "subtypes": [
                    "Item"
                ],
                "quantity": 1
            },
            {
                "id": 1121,
                "name": "ハイパーボール",
                "supertype": "Trainer",
                "subtypes": [
                    "Item"
                ],
                "quantity": 1
            },
            {
                "id": 1134,
                "name": "ロケット団のレシーバー",
                "supertype": "Trainer",
                "subtypes": [
                    "Item"
                ],
                "quantity": 4
            },
            {
                "id": 1152,
                "name": "ポケパッド",
                "supertype": "Trainer",
                "subtypes": [
                    "Item"
                ],
                "quantity": 3
            },
            {
                "id": 1216,
                "name": "ロケット団のアテナ",
                "supertype": "Trainer",
                "subtypes": [
                    "Supporter"
                ],
                "quantity": 4
            },
            {
                "id": 1217,
                "name": "ロケット団のアポロ",
                "supertype": "Trainer",
                "subtypes": [
                    "Supporter"
                ],
                "quantity": 4
            },
            {
                "id": 1218,
                "name": "ロケット団のサカキ",
                "supertype": "Trainer",
                "subtypes": [
                    "Supporter"
                ],
                "quantity": 4
            },
            {
                "id": 1219,
                "name": "ロケット団のラムダ",
                "supertype": "Trainer",
                "subtypes": [
                    "Supporter"
                ],
                "quantity": 4
            },
            {
                "id": 1220,
                "name": "ロケット団のランス",
                "supertype": "Trainer",
                "subtypes": [
                    "Supporter"
                ],
                "quantity": 4
            },
            {
                "id": 1257,
                "name": "ロケット団のファクトリー",
                "supertype": "Trainer",
                "subtypes": [
                    "Stadium"
                ],
                "quantity": 3
            }
        ]
    },
    {
        "id": "rocket_spidops_deck",
        "label": "ロケット団ワナイダー/ミュウツー",
        "source": "rocket_spidops_deck.csv",
        "cards": [
            {
                "id": 1,
                "name": "基本【草】エネルギー",
                "supertype": "Energy",
                "subtypes": [],
                "quantity": 6
            },
            {
                "id": 15,
                "name": "ロケット団エネルギー",
                "supertype": "Energy",
                "subtypes": [],
                "quantity": 4
            },
            {
                "id": 272,
                "name": "リーリエのピッピex",
                "supertype": "Pokémon",
                "subtypes": [
                    "Basic"
                ],
                "hp": 190,
                "quantity": 1
            },
            {
                "id": 400,
                "name": "ロケット団のタマンチュラ",
                "supertype": "Pokémon",
                "subtypes": [
                    "Basic"
                ],
                "hp": 50,
                "quantity": 4
            },
            {
                "id": 401,
                "name": "ロケット団のワナイダー",
                "supertype": "Pokémon",
                "subtypes": [
                    "Stage 1"
                ],
                "hp": 130,
                "quantity": 4
            },
            {
                "id": 414,
                "name": "ロケット団のフリーザー",
                "supertype": "Pokémon",
                "subtypes": [
                    "Basic"
                ],
                "hp": 120,
                "quantity": 2
            },
            {
                "id": 431,
                "name": "ロケット団のミュウツーex",
                "supertype": "Pokémon",
                "subtypes": [
                    "Basic"
                ],
                "hp": 280,
                "quantity": 2
            },
            {
                "id": 434,
                "name": "ロケット団のミミッキュ",
                "supertype": "Pokémon",
                "subtypes": [
                    "Basic"
                ],
                "hp": 60,
                "quantity": 2
            },
            {
                "id": 1094,
                "name": "むしとりセット",
                "supertype": "Trainer",
                "subtypes": [
                    "Item"
                ],
                "quantity": 2
            },
            {
                "id": 1097,
                "name": "夜のタンカ",
                "supertype": "Trainer",
                "subtypes": [
                    "Item"
                ],
                "quantity": 2
            },
            {
                "id": 1116,
                "name": "エネルギーつけかえ",
                "supertype": "Trainer",
                "subtypes": [
                    "Item"
                ],
                "quantity": 1
            },
            {
                "id": 1121,
                "name": "ハイパーボール",
                "supertype": "Trainer",
                "subtypes": [
                    "Item"
                ],
                "quantity": 4
            },
            {
                "id": 1134,
                "name": "ロケット団のレシーバー",
                "supertype": "Trainer",
                "subtypes": [
                    "Item"
                ],
                "quantity": 4
            },
            {
                "id": 1152,
                "name": "ポケパッド",
                "supertype": "Trainer",
                "subtypes": [
                    "Item"
                ],
                "quantity": 1
            },
            {
                "id": 1216,
                "name": "ロケット団のアテナ",
                "supertype": "Trainer",
                "subtypes": [
                    "Supporter"
                ],
                "quantity": 3
            },
            {
                "id": 1217,
                "name": "ロケット団のアポロ",
                "supertype": "Trainer",
                "subtypes": [
                    "Supporter"
                ],
                "quantity": 4
            },
            {
                "id": 1218,
                "name": "ロケット団のサカキ",
                "supertype": "Trainer",
                "subtypes": [
                    "Supporter"
                ],
                "quantity": 3
            },
            {
                "id": 1219,
                "name": "ロケット団のラムダ",
                "supertype": "Trainer",
                "subtypes": [
                    "Supporter"
                ],
                "quantity": 3
            },
            {
                "id": 1220,
                "name": "ロケット団のランス",
                "supertype": "Trainer",
                "subtypes": [
                    "Supporter"
                ],
                "quantity": 3
            },
            {
                "id": 1227,
                "name": "リーリエの決心",
                "supertype": "Trainer",
                "subtypes": [
                    "Supporter"
                ],
                "quantity": 1
            },
            {
                "id": 1257,
                "name": "ロケット団のファクトリー",
                "supertype": "Trainer",
                "subtypes": [
                    "Stadium"
                ],
                "quantity": 4
            }
        ]
    },
    {
        "id": "solrock_lunatone_deck",
        "label": "ルナソル",
        "source": "solrock_lunatone_deck.csv",
        "cards": [
            {
                "id": 6,
                "name": "基本【闘】エネルギー",
                "supertype": "Energy",
                "subtypes": [],
                "quantity": 10
            },
            {
                "id": 16,
                "name": "プリズムエネルギー",
                "supertype": "Energy",
                "subtypes": [],
                "quantity": 4
            },
            {
                "id": 116,
                "name": "イイネイヌ",
                "supertype": "Pokémon",
                "subtypes": [
                    "Basic"
                ],
                "hp": 130,
                "quantity": 3
            },
            {
                "id": 135,
                "name": "ガチグマ アカツキ",
                "supertype": "Pokémon",
                "subtypes": [
                    "Basic"
                ],
                "hp": 150,
                "quantity": 1
            },
            {
                "id": 675,
                "name": "ルナトーン",
                "supertype": "Pokémon",
                "subtypes": [
                    "Basic"
                ],
                "hp": 110,
                "quantity": 2
            },
            {
                "id": 676,
                "name": "ソルロック",
                "supertype": "Pokémon",
                "subtypes": [
                    "Basic"
                ],
                "hp": 110,
                "quantity": 4
            },
            {
                "id": 1051,
                "name": "カメテテ",
                "supertype": "Pokémon",
                "subtypes": [
                    "Basic"
                ],
                "hp": 80,
                "quantity": 2
            },
            {
                "id": 1052,
                "name": "ガメノデス",
                "supertype": "Pokémon",
                "subtypes": [
                    "Stage 1"
                ],
                "hp": 130,
                "quantity": 2
            },
            {
                "id": 1097,
                "name": "夜のタンカ",
                "supertype": "Trainer",
                "subtypes": [
                    "Item"
                ],
                "quantity": 3
            },
            {
                "id": 1142,
                "name": "ファイトゴング",
                "supertype": "Trainer",
                "subtypes": [
                    "Item"
                ],
                "quantity": 4
            },
            {
                "id": 1152,
                "name": "ポケパッド",
                "supertype": "Trainer",
                "subtypes": [
                    "Item"
                ],
                "quantity": 4
            },
            {
                "id": 1174,
                "name": "ふうせん",
                "supertype": "Trainer",
                "subtypes": [
                    "Pokémon Tool"
                ],
                "quantity": 2
            },
            {
                "id": 1182,
                "name": "ボスの指令",
                "supertype": "Trainer",
                "subtypes": [
                    "Supporter"
                ],
                "quantity": 3
            },
            {
                "id": 1194,
                "name": "アクロマの執念",
                "supertype": "Trainer",
                "subtypes": [
                    "Supporter"
                ],
                "quantity": 2
            },
            {
                "id": 1197,
                "name": "クセロシキのたくらみ",
                "supertype": "Trainer",
                "subtypes": [
                    "Supporter"
                ],
                "quantity": 1
            },
            {
                "id": 1213,
                "name": "ジャッジマン",
                "supertype": "Trainer",
                "subtypes": [
                    "Supporter"
                ],
                "quantity": 2
            },
            {
                "id": 1227,
                "name": "リーリエの決心",
                "supertype": "Trainer",
                "subtypes": [
                    "Supporter"
                ],
                "quantity": 4
            },
            {
                "id": 1238,
                "name": "タラゴン",
                "supertype": "Trainer",
                "subtypes": [
                    "Supporter"
                ],
                "quantity": 3
            },
            {
                "id": 1247,
                "name": "ニュートラルセンター",
                "supertype": "Trainer",
                "subtypes": [
                    "Stadium"
                ],
                "quantity": 1
            },
            {
                "id": 1264,
                "name": "バトルコロシアム",
                "supertype": "Trainer",
                "subtypes": [
                    "Stadium"
                ],
                "quantity": 3
            }
        ]
    },
    {
        "id": "walrein_control_deck",
        "label": "トドゼルガコントロール",
        "source": "walrein_control_deck.csv",
        "cards": [
            {
                "id": 3,
                "name": "基本【水】エネルギー",
                "supertype": "Energy",
                "subtypes": [],
                "quantity": 8
            },
            {
                "id": 66,
                "name": "ノココッチ",
                "supertype": "Pokémon",
                "subtypes": [
                    "Stage 1"
                ],
                "hp": 140,
                "quantity": 3
            },
            {
                "id": 235,
                "name": "スボミー",
                "supertype": "Pokémon",
                "subtypes": [
                    "Basic"
                ],
                "hp": 30,
                "quantity": 3
            },
            {
                "id": 305,
                "name": "ノコッチ",
                "supertype": "Pokémon",
                "subtypes": [
                    "Basic"
                ],
                "hp": 70,
                "quantity": 4
            },
            {
                "id": 941,
                "name": "タマザラシ",
                "supertype": "Pokémon",
                "subtypes": [
                    "Basic"
                ],
                "hp": 70,
                "quantity": 4
            },
            {
                "id": 942,
                "name": "トドグラー",
                "supertype": "Pokémon",
                "subtypes": [
                    "Stage 1"
                ],
                "hp": 100,
                "quantity": 3
            },
            {
                "id": 943,
                "name": "トドゼルガ",
                "supertype": "Pokémon",
                "subtypes": [
                    "Stage 2"
                ],
                "hp": 170,
                "quantity": 4
            },
            {
                "id": 1079,
                "name": "ふしぎなアメ",
                "supertype": "Trainer",
                "subtypes": [
                    "Item"
                ],
                "quantity": 4
            },
            {
                "id": 1080,
                "name": "アンフェアスタンプ",
                "supertype": "Trainer",
                "subtypes": [
                    "Item"
                ],
                "quantity": 1
            },
            {
                "id": 1081,
                "name": "改造ハンマー",
                "supertype": "Trainer",
                "subtypes": [
                    "Item"
                ],
                "quantity": 4
            },
            {
                "id": 1086,
                "name": "なかよしポフィン",
                "supertype": "Trainer",
                "subtypes": [
                    "Item"
                ],
                "quantity": 4
            },
            {
                "id": 1097,
                "name": "夜のタンカ",
                "supertype": "Trainer",
                "subtypes": [
                    "Item"
                ],
                "quantity": 2
            },
            {
                "id": 1120,
                "name": "クラッシュハンマー",
                "supertype": "Trainer",
                "subtypes": [
                    "Item"
                ],
                "quantity": 1
            },
            {
                "id": 1122,
                "name": "ポケギア3.0",
                "supertype": "Trainer",
                "subtypes": [
                    "Item"
                ],
                "quantity": 2
            },
            {
                "id": 1129,
                "name": "せいなるはい",
                "supertype": "Trainer",
                "subtypes": [
                    "Item"
                ],
                "quantity": 1
            },
            {
                "id": 1137,
                "name": "ツールスクラッパー",
                "supertype": "Trainer",
                "subtypes": [
                    "Item"
                ],
                "quantity": 1
            },
            {
                "id": 1152,
                "name": "ポケパッド",
                "supertype": "Trainer",
                "subtypes": [
                    "Item"
                ],
                "quantity": 2
            },
            {
                "id": 1174,
                "name": "ふうせん",
                "supertype": "Trainer",
                "subtypes": [
                    "Pokémon Tool"
                ],
                "quantity": 1
            },
            {
                "id": 1227,
                "name": "リーリエの決心",
                "supertype": "Trainer",
                "subtypes": [
                    "Supporter"
                ],
                "quantity": 4
            },
            {
                "id": 1231,
                "name": "ヒカリ",
                "supertype": "Trainer",
                "subtypes": [
                    "Supporter"
                ],
                "quantity": 4
            }
        ]
    }
] as const satisfies readonly VirtualPracticeDeck[]

function placeholderImage(name: string, id: number): string {
    const text = `${name} #${id}`
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="360" height="504" viewBox="0 0 360 504">
        <rect width="360" height="504" rx="24" fill="#f8fafc"/>
        <rect x="18" y="18" width="324" height="468" rx="18" fill="#ffffff" stroke="#cbd5e1" stroke-width="4"/>
        <text x="180" y="220" text-anchor="middle" font-size="28" font-weight="700" fill="#0f172a" font-family="sans-serif">${escapeXml(text)}</text>
        <text x="180" y="268" text-anchor="middle" font-size="18" fill="#64748b" font-family="sans-serif">Virtual Deck Card</text>
    </svg>`
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`
}

function escapeXml(value: string): string {
    return value
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&apos;')
}

export function buildVirtualPracticeDeck(deckId: string): Card[] {
    const deck = VIRTUAL_PRACTICE_DECKS.find(item => item.id === deckId)
    if (!deck) return []

    return deck.cards.flatMap(card =>
        Array.from({ length: card.quantity }, () => ({
            name: card.name,
            imageUrl: (card as VirtualPracticeDeckCard).imageUrl || pokemonIconImage(card.name) || placeholderImage(card.name, card.id),
            supertype: card.supertype,
            subtypes: card.subtypes ? [...card.subtypes] : undefined,
            hp: 'hp' in card ? card.hp : undefined,
            cardId: card.id,
        }))
    )
}
