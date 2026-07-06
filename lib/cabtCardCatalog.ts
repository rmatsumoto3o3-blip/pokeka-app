import type { Card } from './deckParser'

export type CabtCardCatalogEntry = Card & {
    expansion?: string
    collectionNumber?: string
}

export const CABT_CARD_CATALOG: Record<number, CabtCardCatalogEntry> = {
    "1": {
        "cardId": 1,
        "name": "基本【草】エネルギー",
        "imageUrl": "/cabt-card-images/1.webp",
        "supertype": "Energy",
        "subtypes": [
            "Basic Energy"
        ],
        "expansion": "",
        "collectionNumber": "GRA"
    },
    "2": {
        "cardId": 2,
        "name": "基本【炎】エネルギー",
        "imageUrl": "/cabt-card-images/2.webp",
        "supertype": "Energy",
        "subtypes": [
            "Basic Energy"
        ],
        "expansion": "",
        "collectionNumber": "FIR"
    },
    "3": {
        "cardId": 3,
        "name": "基本【水】エネルギー",
        "imageUrl": "/cabt-card-images/3.webp",
        "supertype": "Energy",
        "subtypes": [
            "Basic Energy"
        ],
        "expansion": "",
        "collectionNumber": "WAT"
    },
    "4": {
        "cardId": 4,
        "name": "基本【雷】エネルギー",
        "imageUrl": "/cabt-card-images/4.webp",
        "supertype": "Energy",
        "subtypes": [
            "Basic Energy"
        ],
        "expansion": "",
        "collectionNumber": "LIG"
    },
    "5": {
        "cardId": 5,
        "name": "基本【超】エネルギー",
        "imageUrl": "/cabt-card-images/5.webp",
        "supertype": "Energy",
        "subtypes": [
            "Basic Energy"
        ],
        "expansion": "",
        "collectionNumber": "PSY"
    },
    "6": {
        "cardId": 6,
        "name": "基本【闘】エネルギー",
        "imageUrl": "/cabt-card-images/6.webp",
        "supertype": "Energy",
        "subtypes": [
            "Basic Energy"
        ],
        "expansion": "",
        "collectionNumber": "FIG"
    },
    "7": {
        "cardId": 7,
        "name": "基本【悪】エネルギー",
        "imageUrl": "/cabt-card-images/7.webp",
        "supertype": "Energy",
        "subtypes": [
            "Basic Energy"
        ],
        "expansion": "",
        "collectionNumber": "DAR"
    },
    "8": {
        "cardId": 8,
        "name": "基本【鋼】エネルギー",
        "imageUrl": "/cabt-card-images/8.webp",
        "supertype": "Energy",
        "subtypes": [
            "Basic Energy"
        ],
        "expansion": "",
        "collectionNumber": "MET"
    },
    "9": {
        "cardId": 9,
        "name": "ブーメランエネルギー",
        "imageUrl": "/cabt-card-images/9.webp",
        "supertype": "Energy",
        "subtypes": [
            "Special Energy"
        ],
        "expansion": "MC",
        "collectionNumber": "738/742"
    },
    "10": {
        "cardId": 10,
        "name": "ネオアッパーエネルギー",
        "imageUrl": "/cabt-card-images/10.webp",
        "supertype": "Energy",
        "subtypes": [
            "Special Energy"
        ],
        "expansion": "SV5K",
        "collectionNumber": "071/071"
    },
    "11": {
        "cardId": 11,
        "name": "ミストエネルギー",
        "imageUrl": "/cabt-card-images/11.webp",
        "supertype": "Energy",
        "subtypes": [
            "Special Energy"
        ],
        "expansion": "SVN",
        "collectionNumber": "043/045"
    },
    "12": {
        "cardId": 12,
        "name": "レガシーエネルギー",
        "imageUrl": "/cabt-card-images/12.webp",
        "supertype": "Energy",
        "subtypes": [
            "Special Energy"
        ],
        "expansion": "MC",
        "collectionNumber": "741/742"
    },
    "13": {
        "cardId": 13,
        "name": "リッチエネルギー",
        "imageUrl": "/cabt-card-images/13.webp",
        "supertype": "Energy",
        "subtypes": [
            "Special Energy"
        ],
        "expansion": "MC",
        "collectionNumber": "740/742"
    },
    "14": {
        "cardId": 14,
        "name": "スパイクエネルギー",
        "imageUrl": "/cabt-card-images/14.webp",
        "supertype": "Energy",
        "subtypes": [
            "Special Energy"
        ],
        "expansion": "MC",
        "collectionNumber": "737/742"
    },
    "15": {
        "cardId": 15,
        "name": "ロケット団エネルギー",
        "imageUrl": "/cabt-card-images/15.webp",
        "supertype": "Energy",
        "subtypes": [
            "Special Energy"
        ],
        "expansion": "MC",
        "collectionNumber": "742/742"
    },
    "16": {
        "cardId": 16,
        "name": "プリズムエネルギー",
        "imageUrl": "/cabt-card-images/16.webp",
        "supertype": "Energy",
        "subtypes": [
            "Special Energy"
        ],
        "expansion": "MC",
        "collectionNumber": "739/742"
    },
    "17": {
        "cardId": 17,
        "name": "イグニッションエネルギー",
        "imageUrl": "/cabt-card-images/17.webp",
        "supertype": "Energy",
        "subtypes": [
            "Special Energy"
        ],
        "expansion": "MC",
        "collectionNumber": "736/742"
    },
    "18": {
        "cardId": 18,
        "name": "グロウ【草】エネルギー",
        "imageUrl": "/cabt-card-images/18.webp",
        "supertype": "Energy",
        "subtypes": [
            "Special Energy"
        ],
        "expansion": "M3",
        "collectionNumber": "078/080"
    },
    "19": {
        "cardId": 19,
        "name": "テレパス【超】エネルギー",
        "imageUrl": "/cabt-card-images/19.webp",
        "supertype": "Energy",
        "subtypes": [
            "Special Energy"
        ],
        "expansion": "M3",
        "collectionNumber": "079/080"
    },
    "20": {
        "cardId": 20,
        "name": "ロック【闘】エネルギー",
        "imageUrl": "/cabt-card-images/20.webp",
        "supertype": "Energy",
        "subtypes": [
            "Special Energy"
        ],
        "expansion": "M3",
        "collectionNumber": "080/080"
    },
    "21": {
        "cardId": 21,
        "name": "ズルズキン",
        "imageUrl": "/cabt-card-images/21.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "PROMO",
        "collectionNumber": "158/SV-P",
        "hp": 120
    },
    "22": {
        "cardId": 22,
        "name": "ヒポポタス",
        "imageUrl": "/cabt-card-images/22.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "PROMO",
        "collectionNumber": "186/SV-P",
        "hp": 90
    },
    "23": {
        "cardId": 23,
        "name": "カバルドン",
        "imageUrl": "/cabt-card-images/23.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "PROMO",
        "collectionNumber": "187/SV-P",
        "hp": 160
    },
    "24": {
        "cardId": 24,
        "name": "ロケット団のガルーラex",
        "imageUrl": "/cabt-card-images/24.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "PROMO",
        "collectionNumber": "265/SV-P",
        "hp": 230
    },
    "25": {
        "cardId": 25,
        "name": "カイロス",
        "imageUrl": "/cabt-card-images/25.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV5a",
        "collectionNumber": "003/066",
        "hp": 110
    },
    "26": {
        "cardId": 26,
        "name": "リーフィア",
        "imageUrl": "/cabt-card-images/26.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "MC",
        "collectionNumber": "037/742",
        "hp": 120
    },
    "27": {
        "cardId": 27,
        "name": "テツノイサハ",
        "imageUrl": "/cabt-card-images/27.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV5a",
        "collectionNumber": "007/066",
        "hp": 120
    },
    "28": {
        "cardId": 28,
        "name": "チャデス",
        "imageUrl": "/cabt-card-images/28.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV8a",
        "collectionNumber": "017/187",
        "hp": 30
    },
    "29": {
        "cardId": 29,
        "name": "ヤバソチャex",
        "imageUrl": "/cabt-card-images/29.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "MC",
        "collectionNumber": "079/742",
        "hp": 240
    },
    "30": {
        "cardId": 30,
        "name": "マグカルゴex",
        "imageUrl": "/cabt-card-images/30.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "MC",
        "collectionNumber": "096/742",
        "hp": 270
    },
    "31": {
        "cardId": 31,
        "name": "イーユイ",
        "imageUrl": "/cabt-card-images/31.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV5a",
        "collectionNumber": "018/066",
        "hp": 110
    },
    "32": {
        "cardId": 32,
        "name": "グレイシア",
        "imageUrl": "/cabt-card-images/32.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "SV8a",
        "collectionNumber": "040/187",
        "hp": 120
    },
    "33": {
        "cardId": 33,
        "name": "ケロマツ",
        "imageUrl": "/cabt-card-images/33.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV5a",
        "collectionNumber": "023/066",
        "hp": 60
    },
    "34": {
        "cardId": 34,
        "name": "ゲコガシラ",
        "imageUrl": "/cabt-card-images/34.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "SV5a",
        "collectionNumber": "024/066",
        "hp": 90
    },
    "35": {
        "cardId": 35,
        "name": "ウネルミナモ",
        "imageUrl": "/cabt-card-images/35.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "221/742",
        "hp": 130
    },
    "36": {
        "cardId": 36,
        "name": "モルペコ",
        "imageUrl": "/cabt-card-images/36.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "270/742",
        "hp": 70
    },
    "37": {
        "cardId": 37,
        "name": "テツノイバラex",
        "imageUrl": "/cabt-card-images/37.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "282/742",
        "hp": 230
    },
    "38": {
        "cardId": 38,
        "name": "キリンリキ",
        "imageUrl": "/cabt-card-images/38.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "301/742",
        "hp": 100
    },
    "39": {
        "cardId": 39,
        "name": "ラブトロス",
        "imageUrl": "/cabt-card-images/39.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "346/742",
        "hp": 120
    },
    "40": {
        "cardId": 40,
        "name": "ゲッコウガex",
        "imageUrl": "/cabt-card-images/40.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/2進化"
        ],
        "expansion": "SV5a",
        "collectionNumber": "045/066",
        "hp": 310
    },
    "41": {
        "cardId": 41,
        "name": "ディンルー",
        "imageUrl": "/cabt-card-images/41.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV5a",
        "collectionNumber": "047/066",
        "hp": 140
    },
    "42": {
        "cardId": 42,
        "name": "カジッチュ",
        "imageUrl": "/cabt-card-images/42.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV5a",
        "collectionNumber": "048/066",
        "hp": 40
    },
    "43": {
        "cardId": 43,
        "name": "イーブイ",
        "imageUrl": "/cabt-card-images/43.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV5a",
        "collectionNumber": "050/066",
        "hp": 50
    },
    "44": {
        "cardId": 44,
        "name": "ガチグマ アカツキex",
        "imageUrl": "/cabt-card-images/44.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "625/742",
        "hp": 260
    },
    "45": {
        "cardId": 45,
        "name": "シェイミ",
        "imageUrl": "/cabt-card-images/45.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "039/742",
        "hp": 70
    },
    "46": {
        "cardId": 46,
        "name": "ウガツホムラex",
        "imageUrl": "/cabt-card-images/46.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "151/742",
        "hp": 230
    },
    "47": {
        "cardId": 47,
        "name": "ワニノコ",
        "imageUrl": "/cabt-card-images/47.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "164/742",
        "hp": 70
    },
    "48": {
        "cardId": 48,
        "name": "アリゲイツ",
        "imageUrl": "/cabt-card-images/48.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "MC",
        "collectionNumber": "166/742",
        "hp": 90
    },
    "49": {
        "cardId": 49,
        "name": "オーダイル",
        "imageUrl": "/cabt-card-images/49.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/2進化"
        ],
        "expansion": "MC",
        "collectionNumber": "168/742",
        "hp": 180
    },
    "50": {
        "cardId": 50,
        "name": "ウミディグダ",
        "imageUrl": "/cabt-card-images/50.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV8a",
        "collectionNumber": "042/187",
        "hp": 60
    },
    "51": {
        "cardId": 51,
        "name": "イルカマン",
        "imageUrl": "/cabt-card-images/51.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "SV5K",
        "collectionNumber": "023/071",
        "hp": 150
    },
    "52": {
        "cardId": 52,
        "name": "ウミトリオex",
        "imageUrl": "/cabt-card-images/52.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "SV5K",
        "collectionNumber": "025/071",
        "hp": 250
    },
    "53": {
        "cardId": 53,
        "name": "マリル",
        "imageUrl": "/cabt-card-images/53.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV5K",
        "collectionNumber": "026/071",
        "hp": 70
    },
    "54": {
        "cardId": 54,
        "name": "ドーミラー",
        "imageUrl": "/cabt-card-images/54.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV5K",
        "collectionNumber": "028/071",
        "hp": 80
    },
    "55": {
        "cardId": 55,
        "name": "ドータクン",
        "imageUrl": "/cabt-card-images/55.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "SV5K",
        "collectionNumber": "029/071",
        "hp": 110
    },
    "56": {
        "cardId": 56,
        "name": "ハバタクカミ",
        "imageUrl": "/cabt-card-images/56.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "355/742",
        "hp": 90
    },
    "57": {
        "cardId": 57,
        "name": "ジーランス",
        "imageUrl": "/cabt-card-images/57.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV8a",
        "collectionNumber": "079/187",
        "hp": 100
    },
    "58": {
        "cardId": 58,
        "name": "イダイナキバ",
        "imageUrl": "/cabt-card-images/58.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV8a",
        "collectionNumber": "086/187",
        "hp": 140
    },
    "59": {
        "cardId": 59,
        "name": "ゴース",
        "imageUrl": "/cabt-card-images/59.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "441/742",
        "hp": 60
    },
    "60": {
        "cardId": 60,
        "name": "ゴースト",
        "imageUrl": "/cabt-card-images/60.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "MC",
        "collectionNumber": "443/742",
        "hp": 90
    },
    "61": {
        "cardId": 61,
        "name": "トドロクツキ",
        "imageUrl": "/cabt-card-images/61.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV8a",
        "collectionNumber": "100/187",
        "hp": 140
    },
    "62": {
        "cardId": 62,
        "name": "コライドン",
        "imageUrl": "/cabt-card-images/62.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "550/742",
        "hp": 140
    },
    "63": {
        "cardId": 63,
        "name": "タケルライコex",
        "imageUrl": "/cabt-card-images/63.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "554/742",
        "hp": 240
    },
    "64": {
        "cardId": 64,
        "name": "ホーホー",
        "imageUrl": "/cabt-card-images/64.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV5K",
        "collectionNumber": "054/071",
        "hp": 70
    },
    "65": {
        "cardId": 65,
        "name": "ノコッチ",
        "imageUrl": "/cabt-card-images/65.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV8a",
        "collectionNumber": "129/187",
        "hp": 60
    },
    "66": {
        "cardId": 66,
        "name": "ノココッチ",
        "imageUrl": "/cabt-card-images/66.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "SV8a",
        "collectionNumber": "130/187",
        "hp": 140
    },
    "67": {
        "cardId": 67,
        "name": "クヌギダマ",
        "imageUrl": "/cabt-card-images/67.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV5M",
        "collectionNumber": "002/071",
        "hp": 70
    },
    "68": {
        "cardId": 68,
        "name": "タネボー",
        "imageUrl": "/cabt-card-images/68.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV5M",
        "collectionNumber": "003/071",
        "hp": 60
    },
    "69": {
        "cardId": 69,
        "name": "コノハナ",
        "imageUrl": "/cabt-card-images/69.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "SV5M",
        "collectionNumber": "004/071",
        "hp": 90
    },
    "70": {
        "cardId": 70,
        "name": "ダーテング",
        "imageUrl": "/cabt-card-images/70.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/2進化"
        ],
        "expansion": "SV5M",
        "collectionNumber": "005/071",
        "hp": 150
    },
    "71": {
        "cardId": 71,
        "name": "シキジカ",
        "imageUrl": "/cabt-card-images/71.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV5M",
        "collectionNumber": "008/071",
        "hp": 70
    },
    "72": {
        "cardId": 72,
        "name": "メブキジカ",
        "imageUrl": "/cabt-card-images/72.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "SV5M",
        "collectionNumber": "009/071",
        "hp": 130
    },
    "73": {
        "cardId": 73,
        "name": "シガロコ",
        "imageUrl": "/cabt-card-images/73.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV8a",
        "collectionNumber": "013/187",
        "hp": 50
    },
    "74": {
        "cardId": 74,
        "name": "ベラカス",
        "imageUrl": "/cabt-card-images/74.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "SV8a",
        "collectionNumber": "014/187",
        "hp": 70
    },
    "75": {
        "cardId": 75,
        "name": "テツノイサハex",
        "imageUrl": "/cabt-card-images/75.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "077/742",
        "hp": 220
    },
    "76": {
        "cardId": 76,
        "name": "マグマッグ",
        "imageUrl": "/cabt-card-images/76.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV5M",
        "collectionNumber": "017/071",
        "hp": 80
    },
    "77": {
        "cardId": 77,
        "name": "ニャビー",
        "imageUrl": "/cabt-card-images/77.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "130/742",
        "hp": 70
    },
    "78": {
        "cardId": 78,
        "name": "ニャヒート",
        "imageUrl": "/cabt-card-images/78.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "MC",
        "collectionNumber": "131/742",
        "hp": 100
    },
    "79": {
        "cardId": 79,
        "name": "ガオガエンex",
        "imageUrl": "/cabt-card-images/79.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/2進化"
        ],
        "expansion": "MC",
        "collectionNumber": "132/742",
        "hp": 320
    },
    "80": {
        "cardId": 80,
        "name": "テツノカシラex",
        "imageUrl": "/cabt-card-images/80.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "361/742",
        "hp": 220
    },
    "81": {
        "cardId": 81,
        "name": "モグリュー",
        "imageUrl": "/cabt-card-images/81.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV8a",
        "collectionNumber": "083/187",
        "hp": 70
    },
    "82": {
        "cardId": 82,
        "name": "ドリュウズ",
        "imageUrl": "/cabt-card-images/82.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "SV5M",
        "collectionNumber": "040/071",
        "hp": 130
    },
    "83": {
        "cardId": 83,
        "name": "リキキリンex",
        "imageUrl": "/cabt-card-images/83.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "MC",
        "collectionNumber": "486/742",
        "hp": 260
    },
    "84": {
        "cardId": 84,
        "name": "ハッサムex",
        "imageUrl": "/cabt-card-images/84.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "MC",
        "collectionNumber": "492/742",
        "hp": 270
    },
    "85": {
        "cardId": 85,
        "name": "ダンバル",
        "imageUrl": "/cabt-card-images/85.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "496/742",
        "hp": 70
    },
    "86": {
        "cardId": 86,
        "name": "メタング",
        "imageUrl": "/cabt-card-images/86.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "MC",
        "collectionNumber": "497/742",
        "hp": 100
    },
    "87": {
        "cardId": 87,
        "name": "ミライドン",
        "imageUrl": "/cabt-card-images/87.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "552/742",
        "hp": 110
    },
    "88": {
        "cardId": 88,
        "name": "バルビート",
        "imageUrl": "/cabt-card-images/88.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV6",
        "collectionNumber": "004/101",
        "hp": 70
    },
    "89": {
        "cardId": 89,
        "name": "サルノリ",
        "imageUrl": "/cabt-card-images/89.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV8a",
        "collectionNumber": "006/187",
        "hp": 70
    },
    "90": {
        "cardId": 90,
        "name": "バチンキー",
        "imageUrl": "/cabt-card-images/90.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "SV8a",
        "collectionNumber": "007/187",
        "hp": 100
    },
    "91": {
        "cardId": 91,
        "name": "ゴリランダー",
        "imageUrl": "/cabt-card-images/91.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/2進化"
        ],
        "expansion": "SV6",
        "collectionNumber": "010/101",
        "hp": 180
    },
    "92": {
        "cardId": 92,
        "name": "カジッチュ",
        "imageUrl": "/cabt-card-images/92.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV6",
        "collectionNumber": "011/101",
        "hp": 40
    },
    "93": {
        "cardId": 93,
        "name": "カミッチュ",
        "imageUrl": "/cabt-card-images/93.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "SV8a",
        "collectionNumber": "009/187",
        "hp": 80
    },
    "94": {
        "cardId": 94,
        "name": "ヤバソチャ",
        "imageUrl": "/cabt-card-images/94.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "SV8a",
        "collectionNumber": "018/187",
        "hp": 70
    },
    "95": {
        "cardId": 95,
        "name": "オーガポン みどりのめん",
        "imageUrl": "/cabt-card-images/95.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "080/742",
        "hp": 110
    },
    "96": {
        "cardId": 96,
        "name": "オーガポン みどりのめんex",
        "imageUrl": "/cabt-card-images/96.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "082/742",
        "hp": 210
    },
    "97": {
        "cardId": 97,
        "name": "ヒトモシ",
        "imageUrl": "/cabt-card-images/97.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV6",
        "collectionNumber": "019/101",
        "hp": 60
    },
    "98": {
        "cardId": 98,
        "name": "シャンデラ",
        "imageUrl": "/cabt-card-images/98.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/2進化"
        ],
        "expansion": "SV6",
        "collectionNumber": "021/101",
        "hp": 130
    },
    "99": {
        "cardId": 99,
        "name": "オーガポン かまどのめんex",
        "imageUrl": "/cabt-card-images/99.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "149/742",
        "hp": 210
    },
    "100": {
        "cardId": 100,
        "name": "トサキント",
        "imageUrl": "/cabt-card-images/100.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV8a",
        "collectionNumber": "028/187",
        "hp": 50
    },
    "101": {
        "cardId": 101,
        "name": "ルージュラ",
        "imageUrl": "/cabt-card-images/101.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV6",
        "collectionNumber": "028/101",
        "hp": 90
    },
    "102": {
        "cardId": 102,
        "name": "ミロカロス",
        "imageUrl": "/cabt-card-images/102.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "SV8a",
        "collectionNumber": "036/187",
        "hp": 120
    },
    "103": {
        "cardId": 103,
        "name": "ユキワラシ",
        "imageUrl": "/cabt-card-images/103.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "186/742",
        "hp": 60
    },
    "104": {
        "cardId": 104,
        "name": "ユキメノコ",
        "imageUrl": "/cabt-card-images/104.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "SV8a",
        "collectionNumber": "038/187",
        "hp": 90
    },
    "105": {
        "cardId": 105,
        "name": "ナミイルカ",
        "imageUrl": "/cabt-card-images/105.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "214/742",
        "hp": 70
    },
    "106": {
        "cardId": 106,
        "name": "イルカマン",
        "imageUrl": "/cabt-card-images/106.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "MC",
        "collectionNumber": "215/742",
        "hp": 100
    },
    "107": {
        "cardId": 107,
        "name": "イルカマンex",
        "imageUrl": "/cabt-card-images/107.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "MC",
        "collectionNumber": "216/742",
        "hp": 340
    },
    "108": {
        "cardId": 108,
        "name": "オーガポン いどのめんex",
        "imageUrl": "/cabt-card-images/108.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "224/742",
        "hp": 210
    },
    "109": {
        "cardId": 109,
        "name": "ケーシィ",
        "imageUrl": "/cabt-card-images/109.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV8a",
        "collectionNumber": "057/187",
        "hp": 40
    },
    "110": {
        "cardId": 110,
        "name": "ペロリーム",
        "imageUrl": "/cabt-card-images/110.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "SV6",
        "collectionNumber": "052/101",
        "hp": 120
    },
    "111": {
        "cardId": 111,
        "name": "スナバァ",
        "imageUrl": "/cabt-card-images/111.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV6",
        "collectionNumber": "053/101",
        "hp": 90
    },
    "112": {
        "cardId": 112,
        "name": "マシマシラ",
        "imageUrl": "/cabt-card-images/112.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "358/742",
        "hp": 110
    },
    "113": {
        "cardId": 113,
        "name": "ドッコラー",
        "imageUrl": "/cabt-card-images/113.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV6",
        "collectionNumber": "059/101",
        "hp": 80
    },
    "114": {
        "cardId": 114,
        "name": "ドテッコツ",
        "imageUrl": "/cabt-card-images/114.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "SV6",
        "collectionNumber": "060/101",
        "hp": 100
    },
    "115": {
        "cardId": 115,
        "name": "ローブシン",
        "imageUrl": "/cabt-card-images/115.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/2進化"
        ],
        "expansion": "SV6",
        "collectionNumber": "061/101",
        "hp": 180
    },
    "116": {
        "cardId": 116,
        "name": "イイネイヌ",
        "imageUrl": "/cabt-card-images/116.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "426/742",
        "hp": 130
    },
    "117": {
        "cardId": 117,
        "name": "オーガポン いしずえのめんex",
        "imageUrl": "/cabt-card-images/117.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "428/742",
        "hp": 210
    },
    "118": {
        "cardId": 118,
        "name": "ヒードラン",
        "imageUrl": "/cabt-card-images/118.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV6",
        "collectionNumber": "076/101",
        "hp": 140
    },
    "119": {
        "cardId": 119,
        "name": "ドラメシヤ",
        "imageUrl": "/cabt-card-images/119.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "546/742",
        "hp": 70
    },
    "120": {
        "cardId": 120,
        "name": "ドロンチ",
        "imageUrl": "/cabt-card-images/120.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "MC",
        "collectionNumber": "547/742",
        "hp": 90
    },
    "121": {
        "cardId": 121,
        "name": "ドラパルトex",
        "imageUrl": "/cabt-card-images/121.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/2進化"
        ],
        "expansion": "MC",
        "collectionNumber": "548/742",
        "hp": 320
    },
    "122": {
        "cardId": 122,
        "name": "シャリタツ",
        "imageUrl": "/cabt-card-images/122.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "549/742",
        "hp": 70
    },
    "123": {
        "cardId": 123,
        "name": "カモネギ",
        "imageUrl": "/cabt-card-images/123.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV6",
        "collectionNumber": "083/101",
        "hp": 70
    },
    "124": {
        "cardId": 124,
        "name": "ラッキー",
        "imageUrl": "/cabt-card-images/124.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "561/742",
        "hp": 120
    },
    "125": {
        "cardId": 125,
        "name": "ハピナスex",
        "imageUrl": "/cabt-card-images/125.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "MC",
        "collectionNumber": "562/742",
        "hp": 300
    },
    "126": {
        "cardId": 126,
        "name": "デンチュラ",
        "imageUrl": "/cabt-card-images/126.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "MC",
        "collectionNumber": "050/742",
        "hp": 100
    },
    "127": {
        "cardId": 127,
        "name": "モクロー",
        "imageUrl": "/cabt-card-images/127.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV6a",
        "collectionNumber": "003/064",
        "hp": 70
    },
    "128": {
        "cardId": 128,
        "name": "フクスロー",
        "imageUrl": "/cabt-card-images/128.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "SV6a",
        "collectionNumber": "004/064",
        "hp": 90
    },
    "129": {
        "cardId": 129,
        "name": "ジュナイパー",
        "imageUrl": "/cabt-card-images/129.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/2進化"
        ],
        "expansion": "SV6a",
        "collectionNumber": "005/064",
        "hp": 150
    },
    "130": {
        "cardId": 130,
        "name": "ブロロロームex",
        "imageUrl": "/cabt-card-images/130.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "SV6a",
        "collectionNumber": "015/064",
        "hp": 280
    },
    "131": {
        "cardId": 131,
        "name": "ヨマワル",
        "imageUrl": "/cabt-card-images/131.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "308/742",
        "hp": 60
    },
    "132": {
        "cardId": 132,
        "name": "サマヨール",
        "imageUrl": "/cabt-card-images/132.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "MC",
        "collectionNumber": "309/742",
        "hp": 90
    },
    "133": {
        "cardId": 133,
        "name": "ヨノワール",
        "imageUrl": "/cabt-card-images/133.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/2進化"
        ],
        "expansion": "MC",
        "collectionNumber": "310/742",
        "hp": 160
    },
    "134": {
        "cardId": 134,
        "name": "ニンフィア",
        "imageUrl": "/cabt-card-images/134.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "SV8a",
        "collectionNumber": "068/187",
        "hp": 120
    },
    "135": {
        "cardId": 135,
        "name": "ガチグマ アカツキ",
        "imageUrl": "/cabt-card-images/135.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "415/742",
        "hp": 150
    },
    "136": {
        "cardId": 136,
        "name": "ゾロア",
        "imageUrl": "/cabt-card-images/136.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV8a",
        "collectionNumber": "096/187",
        "hp": 70
    },
    "137": {
        "cardId": 137,
        "name": "ゾロアーク",
        "imageUrl": "/cabt-card-images/137.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "SV8a",
        "collectionNumber": "097/187",
        "hp": 120
    },
    "138": {
        "cardId": 138,
        "name": "イイネイヌex",
        "imageUrl": "/cabt-card-images/138.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "488/742",
        "hp": 250
    },
    "139": {
        "cardId": 139,
        "name": "マシマシラex",
        "imageUrl": "/cabt-card-images/139.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV8a",
        "collectionNumber": "103/187",
        "hp": 210
    },
    "140": {
        "cardId": 140,
        "name": "キチキギスex",
        "imageUrl": "/cabt-card-images/140.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "489/742",
        "hp": 210
    },
    "141": {
        "cardId": 141,
        "name": "モモワロウex",
        "imageUrl": "/cabt-card-images/141.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "491/742",
        "hp": 190
    },
    "142": {
        "cardId": 142,
        "name": "ゲノセクト",
        "imageUrl": "/cabt-card-images/142.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV6a",
        "collectionNumber": "040/064",
        "hp": 110
    },
    "143": {
        "cardId": 143,
        "name": "ブロロン",
        "imageUrl": "/cabt-card-images/143.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV8a",
        "collectionNumber": "114/187",
        "hp": 70
    },
    "144": {
        "cardId": 144,
        "name": "キュレム",
        "imageUrl": "/cabt-card-images/144.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV6a",
        "collectionNumber": "047/064",
        "hp": 130
    },
    "145": {
        "cardId": 145,
        "name": "イーブイ",
        "imageUrl": "/cabt-card-images/145.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "PROMO",
        "collectionNumber": "196/SV-P",
        "hp": 70
    },
    "146": {
        "cardId": 146,
        "name": "リリーラ",
        "imageUrl": "/cabt-card-images/146.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "SV7",
        "collectionNumber": "003/102",
        "hp": 100
    },
    "147": {
        "cardId": 147,
        "name": "ユレイドル",
        "imageUrl": "/cabt-card-images/147.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/2進化"
        ],
        "expansion": "SV7",
        "collectionNumber": "004/102",
        "hp": 150
    },
    "148": {
        "cardId": 148,
        "name": "カットロトム",
        "imageUrl": "/cabt-card-images/148.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV7",
        "collectionNumber": "006/102",
        "hp": 90
    },
    "149": {
        "cardId": 149,
        "name": "カジッチュ",
        "imageUrl": "/cabt-card-images/149.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "062/742",
        "hp": 40
    },
    "150": {
        "cardId": 150,
        "name": "カミツオロチex",
        "imageUrl": "/cabt-card-images/150.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/2進化"
        ],
        "expansion": "MC",
        "collectionNumber": "064/742",
        "hp": 330
    },
    "151": {
        "cardId": 151,
        "name": "ヒバニー",
        "imageUrl": "/cabt-card-images/151.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "137/742",
        "hp": 70
    },
    "152": {
        "cardId": 152,
        "name": "ラビフット",
        "imageUrl": "/cabt-card-images/152.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "MC",
        "collectionNumber": "138/742",
        "hp": 90
    },
    "153": {
        "cardId": 153,
        "name": "エースバーンex",
        "imageUrl": "/cabt-card-images/153.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/2進化"
        ],
        "expansion": "MC",
        "collectionNumber": "139/742",
        "hp": 320
    },
    "154": {
        "cardId": 154,
        "name": "ラプラスex",
        "imageUrl": "/cabt-card-images/154.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV7",
        "collectionNumber": "019/102",
        "hp": 220
    },
    "155": {
        "cardId": 155,
        "name": "アバゴーラ",
        "imageUrl": "/cabt-card-images/155.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/2進化"
        ],
        "expansion": "SV7",
        "collectionNumber": "023/102",
        "hp": 160
    },
    "156": {
        "cardId": 156,
        "name": "ケケンカニ",
        "imageUrl": "/cabt-card-images/156.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "MC",
        "collectionNumber": "209/742",
        "hp": 160
    },
    "157": {
        "cardId": 157,
        "name": "カムカメ",
        "imageUrl": "/cabt-card-images/157.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV7",
        "collectionNumber": "025/102",
        "hp": 80
    },
    "158": {
        "cardId": 158,
        "name": "カジリガメ",
        "imageUrl": "/cabt-card-images/158.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "SV7",
        "collectionNumber": "026/102",
        "hp": 140
    },
    "159": {
        "cardId": 159,
        "name": "ミガルーサ",
        "imageUrl": "/cabt-card-images/159.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "219/742",
        "hp": 130
    },
    "160": {
        "cardId": 160,
        "name": "バチュル",
        "imageUrl": "/cabt-card-images/160.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "254/742",
        "hp": 30
    },
    "161": {
        "cardId": 161,
        "name": "デンチュラex",
        "imageUrl": "/cabt-card-images/161.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "MC",
        "collectionNumber": "255/742",
        "hp": 260
    },
    "162": {
        "cardId": 162,
        "name": "ヤドン",
        "imageUrl": "/cabt-card-images/162.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV7",
        "collectionNumber": "038/102",
        "hp": 80
    },
    "163": {
        "cardId": 163,
        "name": "ヤドキング",
        "imageUrl": "/cabt-card-images/163.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "SV7",
        "collectionNumber": "039/102",
        "hp": 120
    },
    "164": {
        "cardId": 164,
        "name": "キュワワー",
        "imageUrl": "/cabt-card-images/164.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV7",
        "collectionNumber": "042/102",
        "hp": 70
    },
    "165": {
        "cardId": 165,
        "name": "ギアル",
        "imageUrl": "/cabt-card-images/165.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV7",
        "collectionNumber": "067/102",
        "hp": 60
    },
    "166": {
        "cardId": 166,
        "name": "ギギアル",
        "imageUrl": "/cabt-card-images/166.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "SV7",
        "collectionNumber": "068/102",
        "hp": 90
    },
    "167": {
        "cardId": 167,
        "name": "ギギギアル",
        "imageUrl": "/cabt-card-images/167.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/2進化"
        ],
        "expansion": "SV7",
        "collectionNumber": "069/102",
        "hp": 140
    },
    "168": {
        "cardId": 168,
        "name": "メルタン",
        "imageUrl": "/cabt-card-images/168.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV7",
        "collectionNumber": "070/102",
        "hp": 70
    },
    "169": {
        "cardId": 169,
        "name": "ジュラルドン",
        "imageUrl": "/cabt-card-images/169.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "524/742",
        "hp": 130
    },
    "170": {
        "cardId": 170,
        "name": "ブリジュラス",
        "imageUrl": "/cabt-card-images/170.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "MC",
        "collectionNumber": "525/742",
        "hp": 180
    },
    "171": {
        "cardId": 171,
        "name": "タケルライコ",
        "imageUrl": "/cabt-card-images/171.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV7",
        "collectionNumber": "075/102",
        "hp": 130
    },
    "172": {
        "cardId": 172,
        "name": "ホーホー",
        "imageUrl": "/cabt-card-images/172.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "572/742",
        "hp": 70
    },
    "173": {
        "cardId": 173,
        "name": "ヨルノズク",
        "imageUrl": "/cabt-card-images/173.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "MC",
        "collectionNumber": "573/742",
        "hp": 100
    },
    "174": {
        "cardId": 174,
        "name": "スピンロトム",
        "imageUrl": "/cabt-card-images/174.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M2a",
        "collectionNumber": "139/193",
        "hp": 70
    },
    "175": {
        "cardId": 175,
        "name": "バッフロン",
        "imageUrl": "/cabt-card-images/175.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M2a",
        "collectionNumber": "140/193",
        "hp": 100
    },
    "176": {
        "cardId": 176,
        "name": "テラパゴスex",
        "imageUrl": "/cabt-card-images/176.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "630/742",
        "hp": 230
    },
    "177": {
        "cardId": 177,
        "name": "タマタマ",
        "imageUrl": "/cabt-card-images/177.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "009/742",
        "hp": 30
    },
    "178": {
        "cardId": 178,
        "name": "ザルード",
        "imageUrl": "/cabt-card-images/178.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV7a",
        "collectionNumber": "005/064",
        "hp": 120
    },
    "179": {
        "cardId": 179,
        "name": "ブラックキュレムex",
        "imageUrl": "/cabt-card-images/179.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "204/742",
        "hp": 230
    },
    "180": {
        "cardId": 180,
        "name": "ハギギシリ",
        "imageUrl": "/cabt-card-images/180.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV7a",
        "collectionNumber": "012/064",
        "hp": 110
    },
    "181": {
        "cardId": 181,
        "name": "ウェルカモ",
        "imageUrl": "/cabt-card-images/181.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "MC",
        "collectionNumber": "212/742",
        "hp": 100
    },
    "182": {
        "cardId": 182,
        "name": "ウェーニバル",
        "imageUrl": "/cabt-card-images/182.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/2進化"
        ],
        "expansion": "MC",
        "collectionNumber": "213/742",
        "hp": 170
    },
    "183": {
        "cardId": 183,
        "name": "ムチュール",
        "imageUrl": "/cabt-card-images/183.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV7a",
        "collectionNumber": "018/064",
        "hp": 30
    },
    "184": {
        "cardId": 184,
        "name": "ラティアスex",
        "imageUrl": "/cabt-card-images/184.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "312/742",
        "hp": 210
    },
    "185": {
        "cardId": 185,
        "name": "ヒラヒナ",
        "imageUrl": "/cabt-card-images/185.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV7a",
        "collectionNumber": "022/064",
        "hp": 40
    },
    "186": {
        "cardId": 186,
        "name": "コレクレー",
        "imageUrl": "/cabt-card-images/186.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV7a",
        "collectionNumber": "024/064",
        "hp": 70
    },
    "187": {
        "cardId": 187,
        "name": "ナックラー",
        "imageUrl": "/cabt-card-images/187.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV7a",
        "collectionNumber": "025/064",
        "hp": 60
    },
    "188": {
        "cardId": 188,
        "name": "ビブラーバ",
        "imageUrl": "/cabt-card-images/188.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "SV7a",
        "collectionNumber": "026/064",
        "hp": 90
    },
    "189": {
        "cardId": 189,
        "name": "フライゴンex",
        "imageUrl": "/cabt-card-images/189.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/2進化"
        ],
        "expansion": "SV7a",
        "collectionNumber": "027/064",
        "hp": 310
    },
    "190": {
        "cardId": 190,
        "name": "ブリジュラスex",
        "imageUrl": "/cabt-card-images/190.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "MC",
        "collectionNumber": "526/742",
        "hp": 300
    },
    "191": {
        "cardId": 191,
        "name": "サーフゴー",
        "imageUrl": "/cabt-card-images/191.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "MC",
        "collectionNumber": "534/742",
        "hp": 130
    },
    "192": {
        "cardId": 192,
        "name": "テツノカシラ",
        "imageUrl": "/cabt-card-images/192.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "536/742",
        "hp": 130
    },
    "193": {
        "cardId": 193,
        "name": "アローラ ナッシーex",
        "imageUrl": "/cabt-card-images/193.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "MC",
        "collectionNumber": "537/742",
        "hp": 300
    },
    "194": {
        "cardId": 194,
        "name": "チルタリス",
        "imageUrl": "/cabt-card-images/194.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "SV7a",
        "collectionNumber": "041/064",
        "hp": 120
    },
    "195": {
        "cardId": 195,
        "name": "ディアルガ",
        "imageUrl": "/cabt-card-images/195.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV7a",
        "collectionNumber": "042/064",
        "hp": 130
    },
    "196": {
        "cardId": 196,
        "name": "バクガメス",
        "imageUrl": "/cabt-card-images/196.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV7a",
        "collectionNumber": "044/064",
        "hp": 120
    },
    "197": {
        "cardId": 197,
        "name": "チルット",
        "imageUrl": "/cabt-card-images/197.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV7a",
        "collectionNumber": "048/064",
        "hp": 50
    },
    "198": {
        "cardId": 198,
        "name": "アイアントex",
        "imageUrl": "/cabt-card-images/198.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "052/742",
        "hp": 190
    },
    "199": {
        "cardId": 199,
        "name": "コフキムシ",
        "imageUrl": "/cabt-card-images/199.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV8",
        "collectionNumber": "004/106",
        "hp": 40
    },
    "200": {
        "cardId": 200,
        "name": "コフーライ",
        "imageUrl": "/cabt-card-images/200.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "SV8",
        "collectionNumber": "005/106",
        "hp": 80
    },
    "201": {
        "cardId": 201,
        "name": "チオンジェン",
        "imageUrl": "/cabt-card-images/201.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV8",
        "collectionNumber": "010/106",
        "hp": 130
    },
    "202": {
        "cardId": 202,
        "name": "ビクティニ",
        "imageUrl": "/cabt-card-images/202.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV8",
        "collectionNumber": "012/106",
        "hp": 70
    },
    "203": {
        "cardId": 203,
        "name": "ラウドボーン",
        "imageUrl": "/cabt-card-images/203.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/2進化"
        ],
        "expansion": "MC",
        "collectionNumber": "144/742",
        "hp": 180
    },
    "204": {
        "cardId": 204,
        "name": "カルボウ",
        "imageUrl": "/cabt-card-images/204.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV8",
        "collectionNumber": "020/106",
        "hp": 80
    },
    "205": {
        "cardId": 205,
        "name": "スコヴィランex",
        "imageUrl": "/cabt-card-images/205.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "MC",
        "collectionNumber": "147/742",
        "hp": 260
    },
    "206": {
        "cardId": 206,
        "name": "ヒンバス",
        "imageUrl": "/cabt-card-images/206.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "184/742",
        "hp": 30
    },
    "207": {
        "cardId": 207,
        "name": "ミロカロスex",
        "imageUrl": "/cabt-card-images/207.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "MC",
        "collectionNumber": "185/742",
        "hp": 270
    },
    "208": {
        "cardId": 208,
        "name": "カラナクシ",
        "imageUrl": "/cabt-card-images/208.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV8",
        "collectionNumber": "030/106",
        "hp": 70
    },
    "209": {
        "cardId": 209,
        "name": "パオジアン",
        "imageUrl": "/cabt-card-images/209.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M2a",
        "collectionNumber": "043/193",
        "hp": 120
    },
    "210": {
        "cardId": 210,
        "name": "ピカチュウex",
        "imageUrl": "/cabt-card-images/210.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M2a",
        "collectionNumber": "044/193",
        "hp": 200
    },
    "211": {
        "cardId": 211,
        "name": "レアコイル",
        "imageUrl": "/cabt-card-images/211.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "MC",
        "collectionNumber": "232/742",
        "hp": 100
    },
    "212": {
        "cardId": 212,
        "name": "ロトム",
        "imageUrl": "/cabt-card-images/212.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "248/742",
        "hp": 80
    },
    "213": {
        "cardId": 213,
        "name": "カプ・コケコ",
        "imageUrl": "/cabt-card-images/213.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "265/742",
        "hp": 120
    },
    "214": {
        "cardId": 214,
        "name": "トゲキッス",
        "imageUrl": "/cabt-card-images/214.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/2進化"
        ],
        "expansion": "MC",
        "collectionNumber": "293/742",
        "hp": 140
    },
    "215": {
        "cardId": 215,
        "name": "ユクシー",
        "imageUrl": "/cabt-card-images/215.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "314/742",
        "hp": 70
    },
    "216": {
        "cardId": 216,
        "name": "エムリット",
        "imageUrl": "/cabt-card-images/216.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "315/742",
        "hp": 70
    },
    "217": {
        "cardId": 217,
        "name": "アグノム",
        "imageUrl": "/cabt-card-images/217.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "316/742",
        "hp": 70
    },
    "218": {
        "cardId": 218,
        "name": "デスマス",
        "imageUrl": "/cabt-card-images/218.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "319/742",
        "hp": 70
    },
    "219": {
        "cardId": 219,
        "name": "デスカーン",
        "imageUrl": "/cabt-card-images/219.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "MC",
        "collectionNumber": "321/742",
        "hp": 120
    },
    "220": {
        "cardId": 220,
        "name": "ニャスパー",
        "imageUrl": "/cabt-card-images/220.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "331/742",
        "hp": 60
    },
    "221": {
        "cardId": 221,
        "name": "ニャオニクス",
        "imageUrl": "/cabt-card-images/221.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "MC",
        "collectionNumber": "332/742",
        "hp": 90
    },
    "222": {
        "cardId": 222,
        "name": "デデンネ",
        "imageUrl": "/cabt-card-images/222.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV8",
        "collectionNumber": "055/106",
        "hp": 70
    },
    "223": {
        "cardId": 223,
        "name": "シロデスナex",
        "imageUrl": "/cabt-card-images/223.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "SV8",
        "collectionNumber": "057/106",
        "hp": 280
    },
    "224": {
        "cardId": 224,
        "name": "コノヨザル",
        "imageUrl": "/cabt-card-images/224.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/2進化"
        ],
        "expansion": "SV8",
        "collectionNumber": "062/106",
        "hp": 140
    },
    "225": {
        "cardId": 225,
        "name": "トリトドン",
        "imageUrl": "/cabt-card-images/225.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "SV8",
        "collectionNumber": "066/106",
        "hp": 130
    },
    "226": {
        "cardId": 226,
        "name": "コライドン",
        "imageUrl": "/cabt-card-images/226.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV8",
        "collectionNumber": "069/106",
        "hp": 130
    },
    "227": {
        "cardId": 227,
        "name": "モノズ",
        "imageUrl": "/cabt-card-images/227.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV8",
        "collectionNumber": "070/106",
        "hp": 70
    },
    "228": {
        "cardId": 228,
        "name": "ジヘッド",
        "imageUrl": "/cabt-card-images/228.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "SV8",
        "collectionNumber": "071/106",
        "hp": 100
    },
    "229": {
        "cardId": 229,
        "name": "サザンドラex",
        "imageUrl": "/cabt-card-images/229.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/2進化"
        ],
        "expansion": "SV8",
        "collectionNumber": "072/106",
        "hp": 330
    },
    "230": {
        "cardId": 230,
        "name": "モモワロウ",
        "imageUrl": "/cabt-card-images/230.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "490/742",
        "hp": 80
    },
    "231": {
        "cardId": 231,
        "name": "シャリタツex",
        "imageUrl": "/cabt-card-images/231.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV8",
        "collectionNumber": "081/106",
        "hp": 160
    },
    "232": {
        "cardId": 232,
        "name": "ケッキングex",
        "imageUrl": "/cabt-card-images/232.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/2進化"
        ],
        "expansion": "MC",
        "collectionNumber": "583/742",
        "hp": 340
    },
    "233": {
        "cardId": 233,
        "name": "バッフロン",
        "imageUrl": "/cabt-card-images/233.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV8",
        "collectionNumber": "087/106",
        "hp": 130
    },
    "234": {
        "cardId": 234,
        "name": "テラパゴス",
        "imageUrl": "/cabt-card-images/234.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "629/742",
        "hp": 120
    },
    "235": {
        "cardId": 235,
        "name": "スボミー",
        "imageUrl": "/cabt-card-images/235.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M2a",
        "collectionNumber": "011/193",
        "hp": 30
    },
    "236": {
        "cardId": 236,
        "name": "リーフィアex",
        "imageUrl": "/cabt-card-images/236.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "MC",
        "collectionNumber": "038/742",
        "hp": 270
    },
    "237": {
        "cardId": 237,
        "name": "モンメン",
        "imageUrl": "/cabt-card-images/237.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV8a",
        "collectionNumber": "004/187",
        "hp": 60
    },
    "238": {
        "cardId": 238,
        "name": "エルフーン",
        "imageUrl": "/cabt-card-images/238.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "SV8a",
        "collectionNumber": "005/187",
        "hp": 100
    },
    "239": {
        "cardId": 239,
        "name": "ブースターex",
        "imageUrl": "/cabt-card-images/239.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "MC",
        "collectionNumber": "094/742",
        "hp": 270
    },
    "240": {
        "cardId": 240,
        "name": "アズマオウ",
        "imageUrl": "/cabt-card-images/240.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "SV8a",
        "collectionNumber": "029/187",
        "hp": 110
    },
    "241": {
        "cardId": 241,
        "name": "シャワーズex",
        "imageUrl": "/cabt-card-images/241.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "MC",
        "collectionNumber": "161/742",
        "hp": 280
    },
    "242": {
        "cardId": 242,
        "name": "ヒンバス",
        "imageUrl": "/cabt-card-images/242.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV8a",
        "collectionNumber": "035/187",
        "hp": 30
    },
    "243": {
        "cardId": 243,
        "name": "グレイシアex",
        "imageUrl": "/cabt-card-images/243.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "MC",
        "collectionNumber": "162/742",
        "hp": 270
    },
    "244": {
        "cardId": 244,
        "name": "サンダースex",
        "imageUrl": "/cabt-card-images/244.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "MC",
        "collectionNumber": "238/742",
        "hp": 260
    },
    "245": {
        "cardId": 245,
        "name": "フーディン",
        "imageUrl": "/cabt-card-images/245.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/2進化"
        ],
        "expansion": "SV8a",
        "collectionNumber": "059/187",
        "hp": 140
    },
    "246": {
        "cardId": 246,
        "name": "エーフィex",
        "imageUrl": "/cabt-card-images/246.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "MC",
        "collectionNumber": "298/742",
        "hp": 270
    },
    "247": {
        "cardId": 247,
        "name": "ペロッパフ",
        "imageUrl": "/cabt-card-images/247.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV8a",
        "collectionNumber": "067/187",
        "hp": 50
    },
    "248": {
        "cardId": 248,
        "name": "ブラッキーex",
        "imageUrl": "/cabt-card-images/248.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "MC",
        "collectionNumber": "446/742",
        "hp": 280
    },
    "249": {
        "cardId": 249,
        "name": "イーブイex",
        "imageUrl": "/cabt-card-images/249.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "566/742",
        "hp": 200
    },
    "250": {
        "cardId": 250,
        "name": "ホーホー",
        "imageUrl": "/cabt-card-images/250.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV8a",
        "collectionNumber": "127/187",
        "hp": 80
    },
    "251": {
        "cardId": 251,
        "name": "レジギガス",
        "imageUrl": "/cabt-card-images/251.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV8a",
        "collectionNumber": "132/187",
        "hp": 160
    },
    "252": {
        "cardId": 252,
        "name": "キャタピー",
        "imageUrl": "/cabt-card-images/252.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV9",
        "collectionNumber": "001/100",
        "hp": 50
    },
    "253": {
        "cardId": 253,
        "name": "トランセル",
        "imageUrl": "/cabt-card-images/253.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "SV9",
        "collectionNumber": "002/100",
        "hp": 90
    },
    "254": {
        "cardId": 254,
        "name": "バタフリー",
        "imageUrl": "/cabt-card-images/254.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/2進化"
        ],
        "expansion": "SV9",
        "collectionNumber": "003/100",
        "hp": 120
    },
    "255": {
        "cardId": 255,
        "name": "マラカッチ",
        "imageUrl": "/cabt-card-images/255.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV9",
        "collectionNumber": "006/100",
        "hp": 110
    },
    "256": {
        "cardId": 256,
        "name": "ブーバーン",
        "imageUrl": "/cabt-card-images/256.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "MC",
        "collectionNumber": "092/742",
        "hp": 130
    },
    "257": {
        "cardId": 257,
        "name": "Nのダルマッカ",
        "imageUrl": "/cabt-card-images/257.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "118/742",
        "hp": 80
    },
    "258": {
        "cardId": 258,
        "name": "Nのヒヒダルマ",
        "imageUrl": "/cabt-card-images/258.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "MC",
        "collectionNumber": "119/742",
        "hp": 140
    },
    "259": {
        "cardId": 259,
        "name": "ボルケニオンex",
        "imageUrl": "/cabt-card-images/259.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "129/742",
        "hp": 220
    },
    "260": {
        "cardId": 260,
        "name": "ハスボー",
        "imageUrl": "/cabt-card-images/260.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "175/742",
        "hp": 60
    },
    "261": {
        "cardId": 261,
        "name": "ハスブレロ",
        "imageUrl": "/cabt-card-images/261.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "MC",
        "collectionNumber": "176/742",
        "hp": 90
    },
    "262": {
        "cardId": 262,
        "name": "ルンパッパ",
        "imageUrl": "/cabt-card-images/262.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/2進化"
        ],
        "expansion": "MC",
        "collectionNumber": "177/742",
        "hp": 140
    },
    "263": {
        "cardId": 263,
        "name": "ホエルコ",
        "imageUrl": "/cabt-card-images/263.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "180/742",
        "hp": 130
    },
    "264": {
        "cardId": 264,
        "name": "ホエルオー",
        "imageUrl": "/cabt-card-images/264.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "MC",
        "collectionNumber": "181/742",
        "hp": 240
    },
    "265": {
        "cardId": 265,
        "name": "ナンジャモのビリリダマ",
        "imageUrl": "/cabt-card-images/265.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "234/742",
        "hp": 70
    },
    "266": {
        "cardId": 266,
        "name": "ナンジャモのマルマイン",
        "imageUrl": "/cabt-card-images/266.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "MC",
        "collectionNumber": "235/742",
        "hp": 100
    },
    "267": {
        "cardId": 267,
        "name": "Nのバチュル",
        "imageUrl": "/cabt-card-images/267.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV9",
        "collectionNumber": "028/100",
        "hp": 40
    },
    "268": {
        "cardId": 268,
        "name": "ナンジャモのズピカ",
        "imageUrl": "/cabt-card-images/268.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "273/742",
        "hp": 60
    },
    "269": {
        "cardId": 269,
        "name": "ナンジャモのハラバリーex",
        "imageUrl": "/cabt-card-images/269.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "MC",
        "collectionNumber": "274/742",
        "hp": 280
    },
    "270": {
        "cardId": 270,
        "name": "ナンジャモのカイデン",
        "imageUrl": "/cabt-card-images/270.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "278/742",
        "hp": 60
    },
    "271": {
        "cardId": 271,
        "name": "ナンジャモのタイカイデン",
        "imageUrl": "/cabt-card-images/271.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "MC",
        "collectionNumber": "279/742",
        "hp": 120
    },
    "272": {
        "cardId": 272,
        "name": "リーリエのピッピex",
        "imageUrl": "/cabt-card-images/272.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "287/742",
        "hp": 190
    },
    "273": {
        "cardId": 273,
        "name": "ジュペッタ",
        "imageUrl": "/cabt-card-images/273.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "SV9",
        "collectionNumber": "036/100",
        "hp": 90
    },
    "274": {
        "cardId": 274,
        "name": "ダンバル",
        "imageUrl": "/cabt-card-images/274.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV9",
        "collectionNumber": "037/100",
        "hp": 60
    },
    "275": {
        "cardId": 275,
        "name": "メタング",
        "imageUrl": "/cabt-card-images/275.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "SV9",
        "collectionNumber": "038/100",
        "hp": 100
    },
    "276": {
        "cardId": 276,
        "name": "メタグロス",
        "imageUrl": "/cabt-card-images/276.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/2進化"
        ],
        "expansion": "SV9",
        "collectionNumber": "039/100",
        "hp": 170
    },
    "277": {
        "cardId": 277,
        "name": "Nのシンボラー",
        "imageUrl": "/cabt-card-images/277.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV9",
        "collectionNumber": "040/100",
        "hp": 110
    },
    "278": {
        "cardId": 278,
        "name": "リーリエのアブリー",
        "imageUrl": "/cabt-card-images/278.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "338/742",
        "hp": 30
    },
    "279": {
        "cardId": 279,
        "name": "リーリエのアブリボン",
        "imageUrl": "/cabt-card-images/279.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "MC",
        "collectionNumber": "339/742",
        "hp": 70
    },
    "280": {
        "cardId": 280,
        "name": "リーリエのキュワワー",
        "imageUrl": "/cabt-card-images/280.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "340/742",
        "hp": 70
    },
    "281": {
        "cardId": 281,
        "name": "ウリムー",
        "imageUrl": "/cabt-card-images/281.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "362/742",
        "hp": 70
    },
    "282": {
        "cardId": 282,
        "name": "イノムー",
        "imageUrl": "/cabt-card-images/282.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "MC",
        "collectionNumber": "363/742",
        "hp": 100
    },
    "283": {
        "cardId": 283,
        "name": "マンムーex",
        "imageUrl": "/cabt-card-images/283.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/2進化"
        ],
        "expansion": "MC",
        "collectionNumber": "364/742",
        "hp": 340
    },
    "284": {
        "cardId": 284,
        "name": "ヨーギラス",
        "imageUrl": "/cabt-card-images/284.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV9",
        "collectionNumber": "047/100",
        "hp": 70
    },
    "285": {
        "cardId": 285,
        "name": "サナギラス",
        "imageUrl": "/cabt-card-images/285.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "SV9",
        "collectionNumber": "048/100",
        "hp": 90
    },
    "286": {
        "cardId": 286,
        "name": "イワンコ",
        "imageUrl": "/cabt-card-images/286.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV9",
        "collectionNumber": "051/100",
        "hp": 70
    },
    "287": {
        "cardId": 287,
        "name": "ルガルガン",
        "imageUrl": "/cabt-card-images/287.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "SV9",
        "collectionNumber": "052/100",
        "hp": 120
    },
    "288": {
        "cardId": 288,
        "name": "ホップのスナヘビ",
        "imageUrl": "/cabt-card-images/288.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV9",
        "collectionNumber": "053/100",
        "hp": 80
    },
    "289": {
        "cardId": 289,
        "name": "ホップのサダイジャ",
        "imageUrl": "/cabt-card-images/289.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "SV9",
        "collectionNumber": "054/100",
        "hp": 140
    },
    "290": {
        "cardId": 290,
        "name": "バンギラス",
        "imageUrl": "/cabt-card-images/290.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/2進化"
        ],
        "expansion": "SV9",
        "collectionNumber": "058/100",
        "hp": 190
    },
    "291": {
        "cardId": 291,
        "name": "Nのチョロネコ",
        "imageUrl": "/cabt-card-images/291.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "457/742",
        "hp": 70
    },
    "292": {
        "cardId": 292,
        "name": "Nのゾロア",
        "imageUrl": "/cabt-card-images/292.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "469/742",
        "hp": 70
    },
    "293": {
        "cardId": 293,
        "name": "Nのゾロアークex",
        "imageUrl": "/cabt-card-images/293.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "MC",
        "collectionNumber": "470/742",
        "hp": 280
    },
    "294": {
        "cardId": 294,
        "name": "Nのギアル",
        "imageUrl": "/cabt-card-images/294.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV9",
        "collectionNumber": "064/100",
        "hp": 60
    },
    "295": {
        "cardId": 295,
        "name": "Nのギギアル",
        "imageUrl": "/cabt-card-images/295.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "SV9",
        "collectionNumber": "065/100",
        "hp": 90
    },
    "296": {
        "cardId": 296,
        "name": "Nのギギギアル",
        "imageUrl": "/cabt-card-images/296.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/2進化"
        ],
        "expansion": "SV9",
        "collectionNumber": "066/100",
        "hp": 160
    },
    "297": {
        "cardId": 297,
        "name": "マギアナ",
        "imageUrl": "/cabt-card-images/297.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "515/742",
        "hp": 90
    },
    "298": {
        "cardId": 298,
        "name": "ホップのアーマーガア",
        "imageUrl": "/cabt-card-images/298.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/2進化"
        ],
        "expansion": "MC",
        "collectionNumber": "520/742",
        "hp": 170
    },
    "299": {
        "cardId": 299,
        "name": "ホップのザシアンex",
        "imageUrl": "/cabt-card-images/299.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "527/742",
        "hp": 230
    },
    "300": {
        "cardId": 300,
        "name": "タツベイ",
        "imageUrl": "/cabt-card-images/300.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "538/742",
        "hp": 70
    },
    "301": {
        "cardId": 301,
        "name": "コモルー",
        "imageUrl": "/cabt-card-images/301.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "MC",
        "collectionNumber": "539/742",
        "hp": 100
    },
    "302": {
        "cardId": 302,
        "name": "ボーマンダex",
        "imageUrl": "/cabt-card-images/302.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/2進化"
        ],
        "expansion": "MC",
        "collectionNumber": "540/742",
        "hp": 320
    },
    "303": {
        "cardId": 303,
        "name": "Nのレシラム",
        "imageUrl": "/cabt-card-images/303.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "545/742",
        "hp": 130
    },
    "304": {
        "cardId": 304,
        "name": "ホップのカビゴン",
        "imageUrl": "/cabt-card-images/304.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "569/742",
        "hp": 150
    },
    "305": {
        "cardId": 305,
        "name": "ノコッチ",
        "imageUrl": "/cabt-card-images/305.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "574/742",
        "hp": 70
    },
    "306": {
        "cardId": 306,
        "name": "ノココッチex",
        "imageUrl": "/cabt-card-images/306.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "MC",
        "collectionNumber": "575/742",
        "hp": 270
    },
    "307": {
        "cardId": 307,
        "name": "ホップのココガラ",
        "imageUrl": "/cabt-card-images/307.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "622/742",
        "hp": 60
    },
    "308": {
        "cardId": 308,
        "name": "ホップのアオガラス",
        "imageUrl": "/cabt-card-images/308.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "MC",
        "collectionNumber": "623/742",
        "hp": 90
    },
    "309": {
        "cardId": 309,
        "name": "ホップのウールー",
        "imageUrl": "/cabt-card-images/309.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M2a",
        "collectionNumber": "141/193",
        "hp": 70
    },
    "310": {
        "cardId": 310,
        "name": "ホップのバイウールー",
        "imageUrl": "/cabt-card-images/310.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "M2a",
        "collectionNumber": "142/193",
        "hp": 120
    },
    "311": {
        "cardId": 311,
        "name": "ホップのウッウ",
        "imageUrl": "/cabt-card-images/311.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "624/742",
        "hp": 110
    },
    "312": {
        "cardId": 312,
        "name": "スナノケガワ",
        "imageUrl": "/cabt-card-images/312.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "424/742",
        "hp": 120
    },
    "313": {
        "cardId": 313,
        "name": "ミライドンex",
        "imageUrl": "/cabt-card-images/313.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "553/742",
        "hp": 220
    },
    "314": {
        "cardId": 314,
        "name": "マリル",
        "imageUrl": "/cabt-card-images/314.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SVI",
        "collectionNumber": "013/066",
        "hp": 70
    },
    "315": {
        "cardId": 315,
        "name": "マリルリ",
        "imageUrl": "/cabt-card-images/315.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "SVLN",
        "collectionNumber": "004/022",
        "hp": 120
    },
    "316": {
        "cardId": 316,
        "name": "ニンフィアex",
        "imageUrl": "/cabt-card-images/316.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "MC",
        "collectionNumber": "299/742",
        "hp": 270
    },
    "317": {
        "cardId": 317,
        "name": "イーブイ",
        "imageUrl": "/cabt-card-images/317.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "565/742",
        "hp": 50
    },
    "318": {
        "cardId": 318,
        "name": "ホウオウ",
        "imageUrl": "/cabt-card-images/318.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SVLS",
        "collectionNumber": "003/022",
        "hp": 130
    },
    "319": {
        "cardId": 319,
        "name": "カルボウ",
        "imageUrl": "/cabt-card-images/319.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M2a",
        "collectionNumber": "030/193",
        "hp": 70
    },
    "320": {
        "cardId": 320,
        "name": "ソウブレイズex",
        "imageUrl": "/cabt-card-images/320.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "M2a",
        "collectionNumber": "031/193",
        "hp": 270
    },
    "321": {
        "cardId": 321,
        "name": "チュリネ",
        "imageUrl": "/cabt-card-images/321.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SVM",
        "collectionNumber": "007/175",
        "hp": 50
    },
    "322": {
        "cardId": 322,
        "name": "ドレディア",
        "imageUrl": "/cabt-card-images/322.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "SVM",
        "collectionNumber": "008/175",
        "hp": 110
    },
    "323": {
        "cardId": 323,
        "name": "マメバッタ",
        "imageUrl": "/cabt-card-images/323.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SVM",
        "collectionNumber": "013/175",
        "hp": 50
    },
    "324": {
        "cardId": 324,
        "name": "アチャモ",
        "imageUrl": "/cabt-card-images/324.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SVM",
        "collectionNumber": "014/175",
        "hp": 60
    },
    "325": {
        "cardId": 325,
        "name": "ワカシャモ",
        "imageUrl": "/cabt-card-images/325.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "SVM",
        "collectionNumber": "015/175",
        "hp": 90
    },
    "326": {
        "cardId": 326,
        "name": "バシャーモex",
        "imageUrl": "/cabt-card-images/326.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/2進化"
        ],
        "expansion": "SVM",
        "collectionNumber": "016/175",
        "hp": 320
    },
    "327": {
        "cardId": 327,
        "name": "ヤドン",
        "imageUrl": "/cabt-card-images/327.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SVM",
        "collectionNumber": "027/175",
        "hp": 70
    },
    "328": {
        "cardId": 328,
        "name": "ピカチュウex",
        "imageUrl": "/cabt-card-images/328.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SVM",
        "collectionNumber": "038/175",
        "hp": 190
    },
    "329": {
        "cardId": 329,
        "name": "カプ・コケコex",
        "imageUrl": "/cabt-card-images/329.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SVM",
        "collectionNumber": "046/175",
        "hp": 200
    },
    "330": {
        "cardId": 330,
        "name": "ニンフィア",
        "imageUrl": "/cabt-card-images/330.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "SVM",
        "collectionNumber": "050/175",
        "hp": 120
    },
    "331": {
        "cardId": 331,
        "name": "ゼルネアスex",
        "imageUrl": "/cabt-card-images/331.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SVM",
        "collectionNumber": "052/175",
        "hp": 210
    },
    "332": {
        "cardId": 332,
        "name": "ダダリン",
        "imageUrl": "/cabt-card-images/332.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SVM",
        "collectionNumber": "055/175",
        "hp": 130
    },
    "333": {
        "cardId": 333,
        "name": "リオル",
        "imageUrl": "/cabt-card-images/333.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SVM",
        "collectionNumber": "064/175",
        "hp": 70
    },
    "334": {
        "cardId": 334,
        "name": "ニューラ",
        "imageUrl": "/cabt-card-images/334.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SVM",
        "collectionNumber": "075/175",
        "hp": 60
    },
    "335": {
        "cardId": 335,
        "name": "ドーミラー",
        "imageUrl": "/cabt-card-images/335.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SVM",
        "collectionNumber": "081/175",
        "hp": 70
    },
    "336": {
        "cardId": 336,
        "name": "ザシアンex",
        "imageUrl": "/cabt-card-images/336.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SVM",
        "collectionNumber": "089/175",
        "hp": 220
    },
    "337": {
        "cardId": 337,
        "name": "ルギアex",
        "imageUrl": "/cabt-card-images/337.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SVM",
        "collectionNumber": "097/175",
        "hp": 220
    },
    "338": {
        "cardId": 338,
        "name": "ヒビキのカイロス",
        "imageUrl": "/cabt-card-images/338.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M2a",
        "collectionNumber": "001/193",
        "hp": 120
    },
    "339": {
        "cardId": 339,
        "name": "ヤンヤンマ",
        "imageUrl": "/cabt-card-images/339.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "021/742",
        "hp": 70
    },
    "340": {
        "cardId": 340,
        "name": "メガヤンマex",
        "imageUrl": "/cabt-card-images/340.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "MC",
        "collectionNumber": "022/742",
        "hp": 280
    },
    "341": {
        "cardId": 341,
        "name": "シロナのロゼリア",
        "imageUrl": "/cabt-card-images/341.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "032/742",
        "hp": 70
    },
    "342": {
        "cardId": 342,
        "name": "シロナのロズレイド",
        "imageUrl": "/cabt-card-images/342.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "MC",
        "collectionNumber": "033/742",
        "hp": 130
    },
    "343": {
        "cardId": 343,
        "name": "シェイミ",
        "imageUrl": "/cabt-card-images/343.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MA",
        "collectionNumber": "001/043",
        "hp": 80
    },
    "344": {
        "cardId": 344,
        "name": "イシズマイ",
        "imageUrl": "/cabt-card-images/344.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "045/742",
        "hp": 70
    },
    "345": {
        "cardId": 345,
        "name": "イワパレス",
        "imageUrl": "/cabt-card-images/345.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "MC",
        "collectionNumber": "046/742",
        "hp": 150
    },
    "346": {
        "cardId": 346,
        "name": "カジッチュ",
        "imageUrl": "/cabt-card-images/346.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV9a",
        "collectionNumber": "009/063",
        "hp": 40
    },
    "347": {
        "cardId": 347,
        "name": "カミッチュ",
        "imageUrl": "/cabt-card-images/347.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "SV9a",
        "collectionNumber": "010/063",
        "hp": 90
    },
    "348": {
        "cardId": 348,
        "name": "カミツオロチ",
        "imageUrl": "/cabt-card-images/348.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/2進化"
        ],
        "expansion": "SV9a",
        "collectionNumber": "011/063",
        "hp": 170
    },
    "349": {
        "cardId": 349,
        "name": "オーガポン みどりのめん",
        "imageUrl": "/cabt-card-images/349.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "081/742",
        "hp": 110
    },
    "350": {
        "cardId": 350,
        "name": "ポニータ",
        "imageUrl": "/cabt-card-images/350.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV9a",
        "collectionNumber": "013/063",
        "hp": 70
    },
    "351": {
        "cardId": 351,
        "name": "ギャロップ",
        "imageUrl": "/cabt-card-images/351.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "MC",
        "collectionNumber": "090/742",
        "hp": 110
    },
    "352": {
        "cardId": 352,
        "name": "ヒビキのヒノアラシ",
        "imageUrl": "/cabt-card-images/352.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV9a",
        "collectionNumber": "015/063",
        "hp": 70
    },
    "353": {
        "cardId": 353,
        "name": "ヒビキのマグマラシ",
        "imageUrl": "/cabt-card-images/353.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "SV9a",
        "collectionNumber": "016/063",
        "hp": 100
    },
    "354": {
        "cardId": 354,
        "name": "ヒビキのバクフーン",
        "imageUrl": "/cabt-card-images/354.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/2進化"
        ],
        "expansion": "SV9a",
        "collectionNumber": "017/063",
        "hp": 170
    },
    "355": {
        "cardId": 355,
        "name": "ヒビキのマグマッグ",
        "imageUrl": "/cabt-card-images/355.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M2a",
        "collectionNumber": "018/193",
        "hp": 80
    },
    "356": {
        "cardId": 356,
        "name": "ヒビキのマグカルゴ",
        "imageUrl": "/cabt-card-images/356.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "M2a",
        "collectionNumber": "019/193",
        "hp": 130
    },
    "357": {
        "cardId": 357,
        "name": "ヒビキのホウオウex",
        "imageUrl": "/cabt-card-images/357.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M2a",
        "collectionNumber": "021/193",
        "hp": 230
    },
    "358": {
        "cardId": 358,
        "name": "オーガポン かまどのめん",
        "imageUrl": "/cabt-card-images/358.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "148/742",
        "hp": 110
    },
    "359": {
        "cardId": 359,
        "name": "カスミのコダック",
        "imageUrl": "/cabt-card-images/359.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV9a",
        "collectionNumber": "022/063",
        "hp": 70
    },
    "360": {
        "cardId": 360,
        "name": "カスミのヒトデマン",
        "imageUrl": "/cabt-card-images/360.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "155/742",
        "hp": 70
    },
    "361": {
        "cardId": 361,
        "name": "カスミのスターミー",
        "imageUrl": "/cabt-card-images/361.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "MC",
        "collectionNumber": "156/742",
        "hp": 100
    },
    "362": {
        "cardId": 362,
        "name": "カスミのコイキング",
        "imageUrl": "/cabt-card-images/362.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "157/742",
        "hp": 30
    },
    "363": {
        "cardId": 363,
        "name": "カスミのギャラドス",
        "imageUrl": "/cabt-card-images/363.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "MC",
        "collectionNumber": "158/742",
        "hp": 180
    },
    "364": {
        "cardId": 364,
        "name": "カスミのラプラス",
        "imageUrl": "/cabt-card-images/364.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "160/742",
        "hp": 110
    },
    "365": {
        "cardId": 365,
        "name": "シロナのヒンバス",
        "imageUrl": "/cabt-card-images/365.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV9a",
        "collectionNumber": "028/063",
        "hp": 30
    },
    "366": {
        "cardId": 366,
        "name": "シロナのミロカロス",
        "imageUrl": "/cabt-card-images/366.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "SV9a",
        "collectionNumber": "029/063",
        "hp": 130
    },
    "367": {
        "cardId": 367,
        "name": "ブイゼル",
        "imageUrl": "/cabt-card-images/367.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "193/742",
        "hp": 70
    },
    "368": {
        "cardId": 368,
        "name": "フローゼル",
        "imageUrl": "/cabt-card-images/368.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "MC",
        "collectionNumber": "194/742",
        "hp": 120
    },
    "369": {
        "cardId": 369,
        "name": "ヘイラッシャex",
        "imageUrl": "/cabt-card-images/369.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "220/742",
        "hp": 260
    },
    "370": {
        "cardId": 370,
        "name": "オーガポン いどのめん",
        "imageUrl": "/cabt-card-images/370.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "223/742",
        "hp": 110
    },
    "371": {
        "cardId": 371,
        "name": "エレブー",
        "imageUrl": "/cabt-card-images/371.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "236/742",
        "hp": 90
    },
    "372": {
        "cardId": 372,
        "name": "エレキブルex",
        "imageUrl": "/cabt-card-images/372.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "MC",
        "collectionNumber": "237/742",
        "hp": 280
    },
    "373": {
        "cardId": 373,
        "name": "ヒビキのピチュー",
        "imageUrl": "/cabt-card-images/373.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "241/742",
        "hp": 30
    },
    "374": {
        "cardId": 374,
        "name": "ラクライ",
        "imageUrl": "/cabt-card-images/374.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "242/742",
        "hp": 60
    },
    "375": {
        "cardId": 375,
        "name": "ライボルト",
        "imageUrl": "/cabt-card-images/375.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "MC",
        "collectionNumber": "243/742",
        "hp": 120
    },
    "376": {
        "cardId": 376,
        "name": "ロトム",
        "imageUrl": "/cabt-card-images/376.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV9a",
        "collectionNumber": "039/063",
        "hp": 60
    },
    "377": {
        "cardId": 377,
        "name": "ゼラオラ",
        "imageUrl": "/cabt-card-images/377.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M2a",
        "collectionNumber": "055/193",
        "hp": 100
    },
    "378": {
        "cardId": 378,
        "name": "ヒビキのウソッキー",
        "imageUrl": "/cabt-card-images/378.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV9a",
        "collectionNumber": "041/063",
        "hp": 110
    },
    "379": {
        "cardId": 379,
        "name": "シロナのフカマル",
        "imageUrl": "/cabt-card-images/379.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "376/742",
        "hp": 70
    },
    "380": {
        "cardId": 380,
        "name": "シロナのガバイト",
        "imageUrl": "/cabt-card-images/380.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "MC",
        "collectionNumber": "377/742",
        "hp": 100
    },
    "381": {
        "cardId": 381,
        "name": "シロナのガブリアスex",
        "imageUrl": "/cabt-card-images/381.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/2進化"
        ],
        "expansion": "MC",
        "collectionNumber": "378/742",
        "hp": 330
    },
    "382": {
        "cardId": 382,
        "name": "ドロバンコ",
        "imageUrl": "/cabt-card-images/382.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV9a",
        "collectionNumber": "045/063",
        "hp": 90
    },
    "383": {
        "cardId": 383,
        "name": "バンバドロ",
        "imageUrl": "/cabt-card-images/383.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "MC",
        "collectionNumber": "406/742",
        "hp": 150
    },
    "384": {
        "cardId": 384,
        "name": "ペパーのノノクラゲ",
        "imageUrl": "/cabt-card-images/384.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "419/742",
        "hp": 70
    },
    "385": {
        "cardId": 385,
        "name": "ペパーのリククラゲ",
        "imageUrl": "/cabt-card-images/385.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "MC",
        "collectionNumber": "420/742",
        "hp": 140
    },
    "386": {
        "cardId": 386,
        "name": "オーガポン いしずえのめん",
        "imageUrl": "/cabt-card-images/386.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "427/742",
        "hp": 110
    },
    "387": {
        "cardId": 387,
        "name": "シロナのミカルゲ",
        "imageUrl": "/cabt-card-images/387.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M2a",
        "collectionNumber": "108/193",
        "hp": 70
    },
    "388": {
        "cardId": 388,
        "name": "ペパーのオラチフ",
        "imageUrl": "/cabt-card-images/388.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "483/742",
        "hp": 70
    },
    "389": {
        "cardId": 389,
        "name": "ペパーのマフィティフex",
        "imageUrl": "/cabt-card-images/389.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "MC",
        "collectionNumber": "484/742",
        "hp": 270
    },
    "390": {
        "cardId": 390,
        "name": "ケンタロス",
        "imageUrl": "/cabt-card-images/390.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "563/742",
        "hp": 130
    },
    "391": {
        "cardId": 391,
        "name": "ペパーのホシガリス",
        "imageUrl": "/cabt-card-images/391.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV9a",
        "collectionNumber": "054/063",
        "hp": 60
    },
    "392": {
        "cardId": 392,
        "name": "ペパーのヨクバリス",
        "imageUrl": "/cabt-card-images/392.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "SV9a",
        "collectionNumber": "055/063",
        "hp": 120
    },
    "393": {
        "cardId": 393,
        "name": "クヌギダマ",
        "imageUrl": "/cabt-card-images/393.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV10",
        "collectionNumber": "001/098",
        "hp": 70
    },
    "394": {
        "cardId": 394,
        "name": "キノココ",
        "imageUrl": "/cabt-card-images/394.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "027/742",
        "hp": 60
    },
    "395": {
        "cardId": 395,
        "name": "キノガッサ",
        "imageUrl": "/cabt-card-images/395.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "MC",
        "collectionNumber": "029/742",
        "hp": 120
    },
    "396": {
        "cardId": 396,
        "name": "カットロトム",
        "imageUrl": "/cabt-card-images/396.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV10",
        "collectionNumber": "004/098",
        "hp": 70
    },
    "397": {
        "cardId": 397,
        "name": "カリキリ",
        "imageUrl": "/cabt-card-images/397.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV10",
        "collectionNumber": "005/098",
        "hp": 60
    },
    "398": {
        "cardId": 398,
        "name": "ラランテス",
        "imageUrl": "/cabt-card-images/398.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "SV10",
        "collectionNumber": "006/098",
        "hp": 120
    },
    "399": {
        "cardId": 399,
        "name": "ロケット団のサッチムシ",
        "imageUrl": "/cabt-card-images/399.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV10",
        "collectionNumber": "007/098",
        "hp": 60
    },
    "400": {
        "cardId": 400,
        "name": "ロケット団のタマンチュラ",
        "imageUrl": "/cabt-card-images/400.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M2a",
        "collectionNumber": "015/193",
        "hp": 50
    },
    "401": {
        "cardId": 401,
        "name": "ロケット団のワナイダー",
        "imageUrl": "/cabt-card-images/401.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "M2a",
        "collectionNumber": "016/193",
        "hp": 130
    },
    "402": {
        "cardId": 402,
        "name": "ミニーブ",
        "imageUrl": "/cabt-card-images/402.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "069/742",
        "hp": 60
    },
    "403": {
        "cardId": 403,
        "name": "オリーニョ",
        "imageUrl": "/cabt-card-images/403.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "MC",
        "collectionNumber": "070/742",
        "hp": 90
    },
    "404": {
        "cardId": 404,
        "name": "オリーヴァex",
        "imageUrl": "/cabt-card-images/404.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/2進化"
        ],
        "expansion": "MC",
        "collectionNumber": "071/742",
        "hp": 310
    },
    "405": {
        "cardId": 405,
        "name": "ガーディ",
        "imageUrl": "/cabt-card-images/405.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV10",
        "collectionNumber": "013/098",
        "hp": 80
    },
    "406": {
        "cardId": 406,
        "name": "ウインディ",
        "imageUrl": "/cabt-card-images/406.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "SV10",
        "collectionNumber": "014/098",
        "hp": 140
    },
    "407": {
        "cardId": 407,
        "name": "ロケット団のファイヤーex",
        "imageUrl": "/cabt-card-images/407.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV10",
        "collectionNumber": "015/098",
        "hp": 220
    },
    "408": {
        "cardId": 408,
        "name": "ロケット団のデルビル",
        "imageUrl": "/cabt-card-images/408.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "099/742",
        "hp": 70
    },
    "409": {
        "cardId": 409,
        "name": "ロケット団のヘルガー",
        "imageUrl": "/cabt-card-images/409.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "MC",
        "collectionNumber": "100/742",
        "hp": 130
    },
    "410": {
        "cardId": 410,
        "name": "アチャモ",
        "imageUrl": "/cabt-card-images/410.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV10",
        "collectionNumber": "018/098",
        "hp": 70
    },
    "411": {
        "cardId": 411,
        "name": "ワカシャモ",
        "imageUrl": "/cabt-card-images/411.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "SV10",
        "collectionNumber": "019/098",
        "hp": 100
    },
    "412": {
        "cardId": 412,
        "name": "バシャーモ",
        "imageUrl": "/cabt-card-images/412.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/2進化"
        ],
        "expansion": "SV10",
        "collectionNumber": "020/098",
        "hp": 170
    },
    "413": {
        "cardId": 413,
        "name": "ヒートロトム",
        "imageUrl": "/cabt-card-images/413.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV10",
        "collectionNumber": "021/098",
        "hp": 80
    },
    "414": {
        "cardId": 414,
        "name": "ロケット団のフリーザー",
        "imageUrl": "/cabt-card-images/414.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M2a",
        "collectionNumber": "034/193",
        "hp": 120
    },
    "415": {
        "cardId": 415,
        "name": "パールル",
        "imageUrl": "/cabt-card-images/415.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV10",
        "collectionNumber": "023/098",
        "hp": 60
    },
    "416": {
        "cardId": 416,
        "name": "ハンテール",
        "imageUrl": "/cabt-card-images/416.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "SV10",
        "collectionNumber": "024/098",
        "hp": 110
    },
    "417": {
        "cardId": 417,
        "name": "サクラビス",
        "imageUrl": "/cabt-card-images/417.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "SV10",
        "collectionNumber": "025/098",
        "hp": 90
    },
    "418": {
        "cardId": 418,
        "name": "ユキカブリ",
        "imageUrl": "/cabt-card-images/418.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV10",
        "collectionNumber": "026/098",
        "hp": 90
    },
    "419": {
        "cardId": 419,
        "name": "ユキノオー",
        "imageUrl": "/cabt-card-images/419.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "SV10",
        "collectionNumber": "027/098",
        "hp": 150
    },
    "420": {
        "cardId": 420,
        "name": "ウォッシュロトム",
        "imageUrl": "/cabt-card-images/420.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV10",
        "collectionNumber": "028/098",
        "hp": 80
    },
    "421": {
        "cardId": 421,
        "name": "サシカマス",
        "imageUrl": "/cabt-card-images/421.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV10",
        "collectionNumber": "029/098",
        "hp": 70
    },
    "422": {
        "cardId": 422,
        "name": "カマスジョー",
        "imageUrl": "/cabt-card-images/422.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "SV10",
        "collectionNumber": "030/098",
        "hp": 130
    },
    "423": {
        "cardId": 423,
        "name": "アルクジラ",
        "imageUrl": "/cabt-card-images/423.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV10",
        "collectionNumber": "031/098",
        "hp": 100
    },
    "424": {
        "cardId": 424,
        "name": "ハルクジラex",
        "imageUrl": "/cabt-card-images/424.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "SV10",
        "collectionNumber": "032/098",
        "hp": 300
    },
    "425": {
        "cardId": 425,
        "name": "ロケット団のサンダー",
        "imageUrl": "/cabt-card-images/425.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV10",
        "collectionNumber": "033/098",
        "hp": 120
    },
    "426": {
        "cardId": 426,
        "name": "ロケット団のメリープ",
        "imageUrl": "/cabt-card-images/426.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV10",
        "collectionNumber": "034/098",
        "hp": 60
    },
    "427": {
        "cardId": 427,
        "name": "ロケット団のモココ",
        "imageUrl": "/cabt-card-images/427.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "SV10",
        "collectionNumber": "035/098",
        "hp": 90
    },
    "428": {
        "cardId": 428,
        "name": "ロケット団のデンリュウ",
        "imageUrl": "/cabt-card-images/428.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/2進化"
        ],
        "expansion": "SV10",
        "collectionNumber": "036/098",
        "hp": 140
    },
    "429": {
        "cardId": 429,
        "name": "ロケット団のスリープ",
        "imageUrl": "/cabt-card-images/429.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "288/742",
        "hp": 80
    },
    "430": {
        "cardId": 430,
        "name": "ロケット団のスリーパー",
        "imageUrl": "/cabt-card-images/430.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "MC",
        "collectionNumber": "289/742",
        "hp": 130
    },
    "431": {
        "cardId": 431,
        "name": "ロケット団のミュウツーex",
        "imageUrl": "/cabt-card-images/431.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "290/742",
        "hp": 280
    },
    "432": {
        "cardId": 432,
        "name": "ロケット団のソーナンス",
        "imageUrl": "/cabt-card-images/432.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV10",
        "collectionNumber": "040/098",
        "hp": 110
    },
    "433": {
        "cardId": 433,
        "name": "ロケット団のリーシャン",
        "imageUrl": "/cabt-card-images/433.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV10",
        "collectionNumber": "041/098",
        "hp": 30
    },
    "434": {
        "cardId": 434,
        "name": "ロケット団のミミッキュ",
        "imageUrl": "/cabt-card-images/434.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "341/742",
        "hp": 60
    },
    "435": {
        "cardId": 435,
        "name": "ロケット団のレドームシ",
        "imageUrl": "/cabt-card-images/435.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "SV10",
        "collectionNumber": "043/098",
        "hp": 80
    },
    "436": {
        "cardId": 436,
        "name": "ロケット団のイオルブ",
        "imageUrl": "/cabt-card-images/436.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/2進化"
        ],
        "expansion": "SV10",
        "collectionNumber": "044/098",
        "hp": 130
    },
    "437": {
        "cardId": 437,
        "name": "マンキー",
        "imageUrl": "/cabt-card-images/437.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV10",
        "collectionNumber": "045/098",
        "hp": 70
    },
    "438": {
        "cardId": 438,
        "name": "オコリザル",
        "imageUrl": "/cabt-card-images/438.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "SV10",
        "collectionNumber": "046/098",
        "hp": 110
    },
    "439": {
        "cardId": 439,
        "name": "コノヨザル",
        "imageUrl": "/cabt-card-images/439.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/2進化"
        ],
        "expansion": "SV10",
        "collectionNumber": "047/098",
        "hp": 150
    },
    "440": {
        "cardId": 440,
        "name": "ロケット団のヨーギラス",
        "imageUrl": "/cabt-card-images/440.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV10",
        "collectionNumber": "048/098",
        "hp": 70
    },
    "441": {
        "cardId": 441,
        "name": "ロケット団のサナギラス",
        "imageUrl": "/cabt-card-images/441.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "SV10",
        "collectionNumber": "049/098",
        "hp": 100
    },
    "442": {
        "cardId": 442,
        "name": "ロケット団のバンギラス",
        "imageUrl": "/cabt-card-images/442.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/2進化"
        ],
        "expansion": "SV10",
        "collectionNumber": "050/098",
        "hp": 180
    },
    "443": {
        "cardId": 443,
        "name": "ノズパス",
        "imageUrl": "/cabt-card-images/443.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV10",
        "collectionNumber": "051/098",
        "hp": 80
    },
    "444": {
        "cardId": 444,
        "name": "ダイノーズ",
        "imageUrl": "/cabt-card-images/444.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "SV10",
        "collectionNumber": "052/098",
        "hp": 140
    },
    "445": {
        "cardId": 445,
        "name": "アサナン",
        "imageUrl": "/cabt-card-images/445.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV10",
        "collectionNumber": "053/098",
        "hp": 70
    },
    "446": {
        "cardId": 446,
        "name": "チャーレム",
        "imageUrl": "/cabt-card-images/446.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "SV10",
        "collectionNumber": "054/098",
        "hp": 120
    },
    "447": {
        "cardId": 447,
        "name": "レジロックex",
        "imageUrl": "/cabt-card-images/447.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "374/742",
        "hp": 230
    },
    "448": {
        "cardId": 448,
        "name": "ロケット団のアーボ",
        "imageUrl": "/cabt-card-images/448.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV10",
        "collectionNumber": "056/098",
        "hp": 70
    },
    "449": {
        "cardId": 449,
        "name": "ロケット団のアーボック",
        "imageUrl": "/cabt-card-images/449.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "SV10",
        "collectionNumber": "057/098",
        "hp": 130
    },
    "450": {
        "cardId": 450,
        "name": "ロケット団のニドラン♀",
        "imageUrl": "/cabt-card-images/450.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "432/742",
        "hp": 70
    },
    "451": {
        "cardId": 451,
        "name": "ロケット団のニドリーナ",
        "imageUrl": "/cabt-card-images/451.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "MC",
        "collectionNumber": "433/742",
        "hp": 90
    },
    "452": {
        "cardId": 452,
        "name": "ロケット団のニドクイン",
        "imageUrl": "/cabt-card-images/452.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/2進化"
        ],
        "expansion": "MC",
        "collectionNumber": "434/742",
        "hp": 170
    },
    "453": {
        "cardId": 453,
        "name": "ロケット団のニドラン♂",
        "imageUrl": "/cabt-card-images/453.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "435/742",
        "hp": 70
    },
    "454": {
        "cardId": 454,
        "name": "ロケット団のニドリーノ",
        "imageUrl": "/cabt-card-images/454.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "MC",
        "collectionNumber": "436/742",
        "hp": 100
    },
    "455": {
        "cardId": 455,
        "name": "ロケット団のニドキングex",
        "imageUrl": "/cabt-card-images/455.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/2進化"
        ],
        "expansion": "MC",
        "collectionNumber": "437/742",
        "hp": 330
    },
    "456": {
        "cardId": 456,
        "name": "ロケット団のズバット",
        "imageUrl": "/cabt-card-images/456.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "438/742",
        "hp": 50
    },
    "457": {
        "cardId": 457,
        "name": "ロケット団のゴルバット",
        "imageUrl": "/cabt-card-images/457.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "MC",
        "collectionNumber": "439/742",
        "hp": 80
    },
    "458": {
        "cardId": 458,
        "name": "ロケット団のクロバットex",
        "imageUrl": "/cabt-card-images/458.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/2進化"
        ],
        "expansion": "MC",
        "collectionNumber": "440/742",
        "hp": 310
    },
    "459": {
        "cardId": 459,
        "name": "ロケット団のベトベター",
        "imageUrl": "/cabt-card-images/459.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV10",
        "collectionNumber": "067/098",
        "hp": 80
    },
    "460": {
        "cardId": 460,
        "name": "ロケット団のベトベトン",
        "imageUrl": "/cabt-card-images/460.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "SV10",
        "collectionNumber": "068/098",
        "hp": 150
    },
    "461": {
        "cardId": 461,
        "name": "ロケット団のドガース",
        "imageUrl": "/cabt-card-images/461.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV10",
        "collectionNumber": "069/098",
        "hp": 70
    },
    "462": {
        "cardId": 462,
        "name": "ロケット団のマタドガス",
        "imageUrl": "/cabt-card-images/462.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "SV10",
        "collectionNumber": "070/098",
        "hp": 130
    },
    "463": {
        "cardId": 463,
        "name": "ロケット団のヤミカラス",
        "imageUrl": "/cabt-card-images/463.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "447/742",
        "hp": 80
    },
    "464": {
        "cardId": 464,
        "name": "ロケット団のニューラ",
        "imageUrl": "/cabt-card-images/464.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "448/742",
        "hp": 80
    },
    "465": {
        "cardId": 465,
        "name": "フォレトス",
        "imageUrl": "/cabt-card-images/465.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "SV10",
        "collectionNumber": "073/098",
        "hp": 130
    },
    "466": {
        "cardId": 466,
        "name": "エアームド",
        "imageUrl": "/cabt-card-images/466.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV10",
        "collectionNumber": "074/098",
        "hp": 110
    },
    "467": {
        "cardId": 467,
        "name": "ザマゼンタ",
        "imageUrl": "/cabt-card-images/467.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV10",
        "collectionNumber": "075/098",
        "hp": 130
    },
    "468": {
        "cardId": 468,
        "name": "ロケット団のコラッタ",
        "imageUrl": "/cabt-card-images/468.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "555/742",
        "hp": 50
    },
    "469": {
        "cardId": 469,
        "name": "ロケット団のラッタ",
        "imageUrl": "/cabt-card-images/469.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "MC",
        "collectionNumber": "556/742",
        "hp": 90
    },
    "470": {
        "cardId": 470,
        "name": "ロケット団のニャース",
        "imageUrl": "/cabt-card-images/470.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "559/742",
        "hp": 70
    },
    "471": {
        "cardId": 471,
        "name": "ロケット団のペルシアンex",
        "imageUrl": "/cabt-card-images/471.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "MC",
        "collectionNumber": "560/742",
        "hp": 260
    },
    "472": {
        "cardId": 472,
        "name": "ガルーラ",
        "imageUrl": "/cabt-card-images/472.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV10",
        "collectionNumber": "080/098",
        "hp": 120
    },
    "473": {
        "cardId": 473,
        "name": "ロケット団のポリゴン",
        "imageUrl": "/cabt-card-images/473.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV10",
        "collectionNumber": "081/098",
        "hp": 60
    },
    "474": {
        "cardId": 474,
        "name": "ロケット団のポリゴン2",
        "imageUrl": "/cabt-card-images/474.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "SV10",
        "collectionNumber": "082/098",
        "hp": 90
    },
    "475": {
        "cardId": 475,
        "name": "ロケット団のポリゴンZ",
        "imageUrl": "/cabt-card-images/475.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/2進化"
        ],
        "expansion": "SV10",
        "collectionNumber": "083/098",
        "hp": 140
    },
    "476": {
        "cardId": 476,
        "name": "スバメ",
        "imageUrl": "/cabt-card-images/476.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "579/742",
        "hp": 60
    },
    "477": {
        "cardId": 477,
        "name": "オオスバメ",
        "imageUrl": "/cabt-card-images/477.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "MC",
        "collectionNumber": "580/742",
        "hp": 100
    },
    "478": {
        "cardId": 478,
        "name": "イキリンコ",
        "imageUrl": "/cabt-card-images/478.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV10",
        "collectionNumber": "086/098",
        "hp": 70
    },
    "479": {
        "cardId": 479,
        "name": "ツタージャ",
        "imageUrl": "/cabt-card-images/479.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "040/742",
        "hp": 70
    },
    "480": {
        "cardId": 480,
        "name": "ジャノビー",
        "imageUrl": "/cabt-card-images/480.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "MC",
        "collectionNumber": "041/742",
        "hp": 100
    },
    "481": {
        "cardId": 481,
        "name": "ジャローダex",
        "imageUrl": "/cabt-card-images/481.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/2進化"
        ],
        "expansion": "MC",
        "collectionNumber": "042/742",
        "hp": 320
    },
    "482": {
        "cardId": 482,
        "name": "ヤナップ",
        "imageUrl": "/cabt-card-images/482.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV11B",
        "collectionNumber": "004/086",
        "hp": 70
    },
    "483": {
        "cardId": 483,
        "name": "ヤナッキー",
        "imageUrl": "/cabt-card-images/483.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "SV11B",
        "collectionNumber": "005/086",
        "hp": 100
    },
    "484": {
        "cardId": 484,
        "name": "チュリネ",
        "imageUrl": "/cabt-card-images/484.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV11B",
        "collectionNumber": "006/086",
        "hp": 60
    },
    "485": {
        "cardId": 485,
        "name": "ドレディア",
        "imageUrl": "/cabt-card-images/485.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "SV11B",
        "collectionNumber": "007/086",
        "hp": 100
    },
    "486": {
        "cardId": 486,
        "name": "マラカッチ",
        "imageUrl": "/cabt-card-images/486.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV11B",
        "collectionNumber": "008/086",
        "hp": 100
    },
    "487": {
        "cardId": 487,
        "name": "カブルモ",
        "imageUrl": "/cabt-card-images/487.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV11B",
        "collectionNumber": "009/086",
        "hp": 60
    },
    "488": {
        "cardId": 488,
        "name": "タマゲタケ",
        "imageUrl": "/cabt-card-images/488.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "048/742",
        "hp": 50
    },
    "489": {
        "cardId": 489,
        "name": "モロバレル",
        "imageUrl": "/cabt-card-images/489.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "MC",
        "collectionNumber": "049/742",
        "hp": 120
    },
    "490": {
        "cardId": 490,
        "name": "ビクティニ",
        "imageUrl": "/cabt-card-images/490.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "107/742",
        "hp": 80
    },
    "491": {
        "cardId": 491,
        "name": "ダルマッカ",
        "imageUrl": "/cabt-card-images/491.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "116/742",
        "hp": 80
    },
    "492": {
        "cardId": 492,
        "name": "ヒヒダルマ",
        "imageUrl": "/cabt-card-images/492.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "MC",
        "collectionNumber": "117/742",
        "hp": 140
    },
    "493": {
        "cardId": 493,
        "name": "ヒトモシ",
        "imageUrl": "/cabt-card-images/493.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV11B",
        "collectionNumber": "015/086",
        "hp": 60
    },
    "494": {
        "cardId": 494,
        "name": "ランプラー",
        "imageUrl": "/cabt-card-images/494.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "SV11B",
        "collectionNumber": "016/086",
        "hp": 80
    },
    "495": {
        "cardId": 495,
        "name": "シャンデラ",
        "imageUrl": "/cabt-card-images/495.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/2進化"
        ],
        "expansion": "SV11B",
        "collectionNumber": "017/086",
        "hp": 150
    },
    "496": {
        "cardId": 496,
        "name": "メラルバ",
        "imageUrl": "/cabt-card-images/496.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV11B",
        "collectionNumber": "018/086",
        "hp": 60
    },
    "497": {
        "cardId": 497,
        "name": "ウルガモス",
        "imageUrl": "/cabt-card-images/497.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "MC",
        "collectionNumber": "124/742",
        "hp": 120
    },
    "498": {
        "cardId": 498,
        "name": "ヒヤップ",
        "imageUrl": "/cabt-card-images/498.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV11B",
        "collectionNumber": "020/086",
        "hp": 70
    },
    "499": {
        "cardId": 499,
        "name": "ヒヤッキー",
        "imageUrl": "/cabt-card-images/499.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "SV11B",
        "collectionNumber": "021/086",
        "hp": 100
    },
    "500": {
        "cardId": 500,
        "name": "オタマロ",
        "imageUrl": "/cabt-card-images/500.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV11B",
        "collectionNumber": "022/086",
        "hp": 60
    },
    "501": {
        "cardId": 501,
        "name": "ガマガル",
        "imageUrl": "/cabt-card-images/501.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "SV11B",
        "collectionNumber": "023/086",
        "hp": 90
    },
    "502": {
        "cardId": 502,
        "name": "ガマゲロゲ",
        "imageUrl": "/cabt-card-images/502.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/2進化"
        ],
        "expansion": "SV11B",
        "collectionNumber": "024/086",
        "hp": 170
    },
    "503": {
        "cardId": 503,
        "name": "プロトーガ",
        "imageUrl": "/cabt-card-images/503.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "SV11B",
        "collectionNumber": "025/086",
        "hp": 100
    },
    "504": {
        "cardId": 504,
        "name": "アバゴーラ",
        "imageUrl": "/cabt-card-images/504.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/2進化"
        ],
        "expansion": "SV11B",
        "collectionNumber": "026/086",
        "hp": 180
    },
    "505": {
        "cardId": 505,
        "name": "ママンボウ",
        "imageUrl": "/cabt-card-images/505.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV11B",
        "collectionNumber": "027/086",
        "hp": 110
    },
    "506": {
        "cardId": 506,
        "name": "クマシュン",
        "imageUrl": "/cabt-card-images/506.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV11B",
        "collectionNumber": "028/086",
        "hp": 70
    },
    "507": {
        "cardId": 507,
        "name": "ツンベアー",
        "imageUrl": "/cabt-card-images/507.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "SV11B",
        "collectionNumber": "029/086",
        "hp": 150
    },
    "508": {
        "cardId": 508,
        "name": "フリージオ",
        "imageUrl": "/cabt-card-images/508.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV11B",
        "collectionNumber": "030/086",
        "hp": 90
    },
    "509": {
        "cardId": 509,
        "name": "キュレムex",
        "imageUrl": "/cabt-card-images/509.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "203/742",
        "hp": 230
    },
    "510": {
        "cardId": 510,
        "name": "エモンガ",
        "imageUrl": "/cabt-card-images/510.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "253/742",
        "hp": 70
    },
    "511": {
        "cardId": 511,
        "name": "シビシラス",
        "imageUrl": "/cabt-card-images/511.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "256/742",
        "hp": 40
    },
    "512": {
        "cardId": 512,
        "name": "シビビール",
        "imageUrl": "/cabt-card-images/512.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "MC",
        "collectionNumber": "257/742",
        "hp": 90
    },
    "513": {
        "cardId": 513,
        "name": "シビルドン",
        "imageUrl": "/cabt-card-images/513.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/2進化"
        ],
        "expansion": "SV11B",
        "collectionNumber": "035/086",
        "hp": 160
    },
    "514": {
        "cardId": 514,
        "name": "ボルトロス",
        "imageUrl": "/cabt-card-images/514.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "258/742",
        "hp": 120
    },
    "515": {
        "cardId": 515,
        "name": "ゼクロムex",
        "imageUrl": "/cabt-card-images/515.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "259/742",
        "hp": 230
    },
    "516": {
        "cardId": 516,
        "name": "ムンナ",
        "imageUrl": "/cabt-card-images/516.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV11B",
        "collectionNumber": "038/086",
        "hp": 70
    },
    "517": {
        "cardId": 517,
        "name": "ムシャーナ",
        "imageUrl": "/cabt-card-images/517.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "SV11B",
        "collectionNumber": "039/086",
        "hp": 120
    },
    "518": {
        "cardId": 518,
        "name": "ユニラン",
        "imageUrl": "/cabt-card-images/518.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV11B",
        "collectionNumber": "040/086",
        "hp": 40
    },
    "519": {
        "cardId": 519,
        "name": "ダブラン",
        "imageUrl": "/cabt-card-images/519.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "SV11B",
        "collectionNumber": "041/086",
        "hp": 70
    },
    "520": {
        "cardId": 520,
        "name": "ランクルス",
        "imageUrl": "/cabt-card-images/520.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/2進化"
        ],
        "expansion": "SV11B",
        "collectionNumber": "042/086",
        "hp": 140
    },
    "521": {
        "cardId": 521,
        "name": "リグレー",
        "imageUrl": "/cabt-card-images/521.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV11B",
        "collectionNumber": "043/086",
        "hp": 60
    },
    "522": {
        "cardId": 522,
        "name": "オーベム",
        "imageUrl": "/cabt-card-images/522.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "SV11B",
        "collectionNumber": "044/086",
        "hp": 90
    },
    "523": {
        "cardId": 523,
        "name": "ゴビット",
        "imageUrl": "/cabt-card-images/523.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV11B",
        "collectionNumber": "045/086",
        "hp": 90
    },
    "524": {
        "cardId": 524,
        "name": "ゴルーグ",
        "imageUrl": "/cabt-card-images/524.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "SV11B",
        "collectionNumber": "046/086",
        "hp": 160
    },
    "525": {
        "cardId": 525,
        "name": "メロエッタex",
        "imageUrl": "/cabt-card-images/525.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV11B",
        "collectionNumber": "047/086",
        "hp": 200
    },
    "526": {
        "cardId": 526,
        "name": "モグリュー",
        "imageUrl": "/cabt-card-images/526.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "385/742",
        "hp": 70
    },
    "527": {
        "cardId": 527,
        "name": "ドリュウズex",
        "imageUrl": "/cabt-card-images/527.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "MC",
        "collectionNumber": "387/742",
        "hp": 270
    },
    "528": {
        "cardId": 528,
        "name": "ドッコラー",
        "imageUrl": "/cabt-card-images/528.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "388/742",
        "hp": 70
    },
    "529": {
        "cardId": 529,
        "name": "ドテッコツ",
        "imageUrl": "/cabt-card-images/529.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "MC",
        "collectionNumber": "389/742",
        "hp": 100
    },
    "530": {
        "cardId": 530,
        "name": "ローブシン",
        "imageUrl": "/cabt-card-images/530.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/2進化"
        ],
        "expansion": "MC",
        "collectionNumber": "390/742",
        "hp": 140
    },
    "531": {
        "cardId": 531,
        "name": "ナゲキ",
        "imageUrl": "/cabt-card-images/531.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV11B",
        "collectionNumber": "053/086",
        "hp": 130
    },
    "532": {
        "cardId": 532,
        "name": "イシズマイ",
        "imageUrl": "/cabt-card-images/532.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV11B",
        "collectionNumber": "054/086",
        "hp": 70
    },
    "533": {
        "cardId": 533,
        "name": "イワパレス",
        "imageUrl": "/cabt-card-images/533.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "SV11B",
        "collectionNumber": "055/086",
        "hp": 150
    },
    "534": {
        "cardId": 534,
        "name": "ランドロス",
        "imageUrl": "/cabt-card-images/534.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "398/742",
        "hp": 130
    },
    "535": {
        "cardId": 535,
        "name": "フシデ",
        "imageUrl": "/cabt-card-images/535.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV11B",
        "collectionNumber": "057/086",
        "hp": 80
    },
    "536": {
        "cardId": 536,
        "name": "ホイーガ",
        "imageUrl": "/cabt-card-images/536.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "SV11B",
        "collectionNumber": "058/086",
        "hp": 100
    },
    "537": {
        "cardId": 537,
        "name": "ペンドラー",
        "imageUrl": "/cabt-card-images/537.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/2進化"
        ],
        "expansion": "SV11B",
        "collectionNumber": "059/086",
        "hp": 160
    },
    "538": {
        "cardId": 538,
        "name": "メグロコ",
        "imageUrl": "/cabt-card-images/538.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV11B",
        "collectionNumber": "060/086",
        "hp": 70
    },
    "539": {
        "cardId": 539,
        "name": "ワルビル",
        "imageUrl": "/cabt-card-images/539.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "SV11B",
        "collectionNumber": "061/086",
        "hp": 100
    },
    "540": {
        "cardId": 540,
        "name": "ワルビアル",
        "imageUrl": "/cabt-card-images/540.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/2進化"
        ],
        "expansion": "SV11B",
        "collectionNumber": "062/086",
        "hp": 170
    },
    "541": {
        "cardId": 541,
        "name": "バルチャイ",
        "imageUrl": "/cabt-card-images/541.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV11B",
        "collectionNumber": "063/086",
        "hp": 70
    },
    "542": {
        "cardId": 542,
        "name": "バルジーナ",
        "imageUrl": "/cabt-card-images/542.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "SV11B",
        "collectionNumber": "064/086",
        "hp": 110
    },
    "543": {
        "cardId": 543,
        "name": "シュバルゴ",
        "imageUrl": "/cabt-card-images/543.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "MC",
        "collectionNumber": "505/742",
        "hp": 130
    },
    "544": {
        "cardId": 544,
        "name": "コマタナ",
        "imageUrl": "/cabt-card-images/544.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "510/742",
        "hp": 60
    },
    "545": {
        "cardId": 545,
        "name": "キリキザン",
        "imageUrl": "/cabt-card-images/545.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "MC",
        "collectionNumber": "511/742",
        "hp": 120
    },
    "546": {
        "cardId": 546,
        "name": "コバルオン",
        "imageUrl": "/cabt-card-images/546.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV11B",
        "collectionNumber": "068/086",
        "hp": 120
    },
    "547": {
        "cardId": 547,
        "name": "ゲノセクトex",
        "imageUrl": "/cabt-card-images/547.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "512/742",
        "hp": 220
    },
    "548": {
        "cardId": 548,
        "name": "キバゴ",
        "imageUrl": "/cabt-card-images/548.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV11B",
        "collectionNumber": "070/086",
        "hp": 70
    },
    "549": {
        "cardId": 549,
        "name": "オノンド",
        "imageUrl": "/cabt-card-images/549.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "SV11B",
        "collectionNumber": "071/086",
        "hp": 100
    },
    "550": {
        "cardId": 550,
        "name": "オノノクス",
        "imageUrl": "/cabt-card-images/550.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/2進化"
        ],
        "expansion": "SV11B",
        "collectionNumber": "072/086",
        "hp": 170
    },
    "551": {
        "cardId": 551,
        "name": "マメパト",
        "imageUrl": "/cabt-card-images/551.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "598/742",
        "hp": 60
    },
    "552": {
        "cardId": 552,
        "name": "ハトーボー",
        "imageUrl": "/cabt-card-images/552.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "MC",
        "collectionNumber": "599/742",
        "hp": 80
    },
    "553": {
        "cardId": 553,
        "name": "ケンホロウ",
        "imageUrl": "/cabt-card-images/553.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/2進化"
        ],
        "expansion": "MC",
        "collectionNumber": "600/742",
        "hp": 150
    },
    "554": {
        "cardId": 554,
        "name": "タブンネ",
        "imageUrl": "/cabt-card-images/554.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "601/742",
        "hp": 100
    },
    "555": {
        "cardId": 555,
        "name": "チラーミィ",
        "imageUrl": "/cabt-card-images/555.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "603/742",
        "hp": 60
    },
    "556": {
        "cardId": 556,
        "name": "チラチーノ",
        "imageUrl": "/cabt-card-images/556.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "MC",
        "collectionNumber": "604/742",
        "hp": 100
    },
    "557": {
        "cardId": 557,
        "name": "クルミル",
        "imageUrl": "/cabt-card-images/557.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV11W",
        "collectionNumber": "001/086",
        "hp": 50
    },
    "558": {
        "cardId": 558,
        "name": "クルマユ",
        "imageUrl": "/cabt-card-images/558.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "SV11W",
        "collectionNumber": "002/086",
        "hp": 80
    },
    "559": {
        "cardId": 559,
        "name": "ハハコモリ",
        "imageUrl": "/cabt-card-images/559.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/2進化"
        ],
        "expansion": "SV11W",
        "collectionNumber": "003/086",
        "hp": 130
    },
    "560": {
        "cardId": 560,
        "name": "モンメン",
        "imageUrl": "/cabt-card-images/560.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "043/742",
        "hp": 60
    },
    "561": {
        "cardId": 561,
        "name": "エルフーンex",
        "imageUrl": "/cabt-card-images/561.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "MC",
        "collectionNumber": "044/742",
        "hp": 230
    },
    "562": {
        "cardId": 562,
        "name": "シキジカ",
        "imageUrl": "/cabt-card-images/562.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV11W",
        "collectionNumber": "006/086",
        "hp": 70
    },
    "563": {
        "cardId": 563,
        "name": "メブキジカ",
        "imageUrl": "/cabt-card-images/563.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "SV11W",
        "collectionNumber": "007/086",
        "hp": 130
    },
    "564": {
        "cardId": 564,
        "name": "チョボマキ",
        "imageUrl": "/cabt-card-images/564.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV11W",
        "collectionNumber": "008/086",
        "hp": 60
    },
    "565": {
        "cardId": 565,
        "name": "アギルダー",
        "imageUrl": "/cabt-card-images/565.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "SV11W",
        "collectionNumber": "009/086",
        "hp": 100
    },
    "566": {
        "cardId": 566,
        "name": "ビリジオン",
        "imageUrl": "/cabt-card-images/566.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "054/742",
        "hp": 120
    },
    "567": {
        "cardId": 567,
        "name": "ポカブ",
        "imageUrl": "/cabt-card-images/567.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "108/742",
        "hp": 70
    },
    "568": {
        "cardId": 568,
        "name": "チャオブー",
        "imageUrl": "/cabt-card-images/568.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "MC",
        "collectionNumber": "110/742",
        "hp": 110
    },
    "569": {
        "cardId": 569,
        "name": "エンブオー",
        "imageUrl": "/cabt-card-images/569.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/2進化"
        ],
        "expansion": "MC",
        "collectionNumber": "112/742",
        "hp": 180
    },
    "570": {
        "cardId": 570,
        "name": "バオップ",
        "imageUrl": "/cabt-card-images/570.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV11W",
        "collectionNumber": "014/086",
        "hp": 70
    },
    "571": {
        "cardId": 571,
        "name": "バオッキー",
        "imageUrl": "/cabt-card-images/571.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "SV11W",
        "collectionNumber": "015/086",
        "hp": 100
    },
    "572": {
        "cardId": 572,
        "name": "クイタラン",
        "imageUrl": "/cabt-card-images/572.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "120/742",
        "hp": 120
    },
    "573": {
        "cardId": 573,
        "name": "レシラムex",
        "imageUrl": "/cabt-card-images/573.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "126/742",
        "hp": 230
    },
    "574": {
        "cardId": 574,
        "name": "ミジュマル",
        "imageUrl": "/cabt-card-images/574.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV11W",
        "collectionNumber": "018/086",
        "hp": 70
    },
    "575": {
        "cardId": 575,
        "name": "フタチマル",
        "imageUrl": "/cabt-card-images/575.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "SV11W",
        "collectionNumber": "019/086",
        "hp": 100
    },
    "576": {
        "cardId": 576,
        "name": "ダイケンキ",
        "imageUrl": "/cabt-card-images/576.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/2進化"
        ],
        "expansion": "SV11W",
        "collectionNumber": "020/086",
        "hp": 160
    },
    "577": {
        "cardId": 577,
        "name": "バスラオ",
        "imageUrl": "/cabt-card-images/577.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV11W",
        "collectionNumber": "021/086",
        "hp": 90
    },
    "578": {
        "cardId": 578,
        "name": "コアルヒー",
        "imageUrl": "/cabt-card-images/578.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "197/742",
        "hp": 70
    },
    "579": {
        "cardId": 579,
        "name": "スワンナ",
        "imageUrl": "/cabt-card-images/579.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "MC",
        "collectionNumber": "198/742",
        "hp": 120
    },
    "580": {
        "cardId": 580,
        "name": "バニプッチ",
        "imageUrl": "/cabt-card-images/580.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "199/742",
        "hp": 60
    },
    "581": {
        "cardId": 581,
        "name": "バニリッチ",
        "imageUrl": "/cabt-card-images/581.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "MC",
        "collectionNumber": "200/742",
        "hp": 90
    },
    "582": {
        "cardId": 582,
        "name": "バイバニラ",
        "imageUrl": "/cabt-card-images/582.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/2進化"
        ],
        "expansion": "MC",
        "collectionNumber": "201/742",
        "hp": 150
    },
    "583": {
        "cardId": 583,
        "name": "ケルディオex",
        "imageUrl": "/cabt-card-images/583.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "205/742",
        "hp": 210
    },
    "584": {
        "cardId": 584,
        "name": "シママ",
        "imageUrl": "/cabt-card-images/584.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "250/742",
        "hp": 60
    },
    "585": {
        "cardId": 585,
        "name": "ゼブライカ",
        "imageUrl": "/cabt-card-images/585.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "MC",
        "collectionNumber": "252/742",
        "hp": 120
    },
    "586": {
        "cardId": 586,
        "name": "バチュル",
        "imageUrl": "/cabt-card-images/586.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV11W",
        "collectionNumber": "030/086",
        "hp": 40
    },
    "587": {
        "cardId": 587,
        "name": "デンチュラ",
        "imageUrl": "/cabt-card-images/587.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "SV11W",
        "collectionNumber": "031/086",
        "hp": 90
    },
    "588": {
        "cardId": 588,
        "name": "マッギョ",
        "imageUrl": "/cabt-card-images/588.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV11W",
        "collectionNumber": "032/086",
        "hp": 110
    },
    "589": {
        "cardId": 589,
        "name": "コロモリ",
        "imageUrl": "/cabt-card-images/589.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV11W",
        "collectionNumber": "033/086",
        "hp": 60
    },
    "590": {
        "cardId": 590,
        "name": "ココロモリ",
        "imageUrl": "/cabt-card-images/590.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "SV11W",
        "collectionNumber": "034/086",
        "hp": 90
    },
    "591": {
        "cardId": 591,
        "name": "シンボラー",
        "imageUrl": "/cabt-card-images/591.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV11W",
        "collectionNumber": "035/086",
        "hp": 120
    },
    "592": {
        "cardId": 592,
        "name": "デスマス",
        "imageUrl": "/cabt-card-images/592.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "320/742",
        "hp": 70
    },
    "593": {
        "cardId": 593,
        "name": "デスカーン",
        "imageUrl": "/cabt-card-images/593.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "MC",
        "collectionNumber": "322/742",
        "hp": 120
    },
    "594": {
        "cardId": 594,
        "name": "ゴチム",
        "imageUrl": "/cabt-card-images/594.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "323/742",
        "hp": 70
    },
    "595": {
        "cardId": 595,
        "name": "ゴチミル",
        "imageUrl": "/cabt-card-images/595.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "MC",
        "collectionNumber": "324/742",
        "hp": 90
    },
    "596": {
        "cardId": 596,
        "name": "ゴチルゼル",
        "imageUrl": "/cabt-card-images/596.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/2進化"
        ],
        "expansion": "MC",
        "collectionNumber": "325/742",
        "hp": 150
    },
    "597": {
        "cardId": 597,
        "name": "プルリル",
        "imageUrl": "/cabt-card-images/597.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV11W",
        "collectionNumber": "041/086",
        "hp": 80
    },
    "598": {
        "cardId": 598,
        "name": "ブルンゲルex",
        "imageUrl": "/cabt-card-images/598.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "SV11W",
        "collectionNumber": "042/086",
        "hp": 270
    },
    "599": {
        "cardId": 599,
        "name": "ダンゴロ",
        "imageUrl": "/cabt-card-images/599.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV11W",
        "collectionNumber": "043/086",
        "hp": 80
    },
    "600": {
        "cardId": 600,
        "name": "ガントル",
        "imageUrl": "/cabt-card-images/600.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "SV11W",
        "collectionNumber": "044/086",
        "hp": 110
    },
    "601": {
        "cardId": 601,
        "name": "ギガイアス",
        "imageUrl": "/cabt-card-images/601.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/2進化"
        ],
        "expansion": "SV11W",
        "collectionNumber": "045/086",
        "hp": 170
    },
    "602": {
        "cardId": 602,
        "name": "ダゲキ",
        "imageUrl": "/cabt-card-images/602.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "391/742",
        "hp": 110
    },
    "603": {
        "cardId": 603,
        "name": "アーケン",
        "imageUrl": "/cabt-card-images/603.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "MC",
        "collectionNumber": "392/742",
        "hp": 80
    },
    "604": {
        "cardId": 604,
        "name": "アーケオス",
        "imageUrl": "/cabt-card-images/604.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/2進化"
        ],
        "expansion": "MC",
        "collectionNumber": "393/742",
        "hp": 140
    },
    "605": {
        "cardId": 605,
        "name": "コジョフー",
        "imageUrl": "/cabt-card-images/605.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "395/742",
        "hp": 60
    },
    "606": {
        "cardId": 606,
        "name": "コジョンド",
        "imageUrl": "/cabt-card-images/606.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "MC",
        "collectionNumber": "396/742",
        "hp": 100
    },
    "607": {
        "cardId": 607,
        "name": "テラキオン",
        "imageUrl": "/cabt-card-images/607.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV11W",
        "collectionNumber": "051/086",
        "hp": 140
    },
    "608": {
        "cardId": 608,
        "name": "チョロネコ",
        "imageUrl": "/cabt-card-images/608.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV11W",
        "collectionNumber": "052/086",
        "hp": 60
    },
    "609": {
        "cardId": 609,
        "name": "レパルダス",
        "imageUrl": "/cabt-card-images/609.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "SV11W",
        "collectionNumber": "053/086",
        "hp": 110
    },
    "610": {
        "cardId": 610,
        "name": "ズルッグ",
        "imageUrl": "/cabt-card-images/610.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV11W",
        "collectionNumber": "054/086",
        "hp": 70
    },
    "611": {
        "cardId": 611,
        "name": "ズルズキン",
        "imageUrl": "/cabt-card-images/611.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "SV11W",
        "collectionNumber": "055/086",
        "hp": 120
    },
    "612": {
        "cardId": 612,
        "name": "ヤブクロン",
        "imageUrl": "/cabt-card-images/612.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "465/742",
        "hp": 70
    },
    "613": {
        "cardId": 613,
        "name": "ダストダス",
        "imageUrl": "/cabt-card-images/613.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "MC",
        "collectionNumber": "466/742",
        "hp": 140
    },
    "614": {
        "cardId": 614,
        "name": "ゾロア",
        "imageUrl": "/cabt-card-images/614.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "467/742",
        "hp": 70
    },
    "615": {
        "cardId": 615,
        "name": "ゾロアーク",
        "imageUrl": "/cabt-card-images/615.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "MC",
        "collectionNumber": "468/742",
        "hp": 120
    },
    "616": {
        "cardId": 616,
        "name": "モノズ",
        "imageUrl": "/cabt-card-images/616.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "476/742",
        "hp": 80
    },
    "617": {
        "cardId": 617,
        "name": "ジヘッド",
        "imageUrl": "/cabt-card-images/617.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "MC",
        "collectionNumber": "477/742",
        "hp": 110
    },
    "618": {
        "cardId": 618,
        "name": "サザンドラex",
        "imageUrl": "/cabt-card-images/618.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/2進化"
        ],
        "expansion": "MC",
        "collectionNumber": "478/742",
        "hp": 330
    },
    "619": {
        "cardId": 619,
        "name": "テッシード",
        "imageUrl": "/cabt-card-images/619.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV11W",
        "collectionNumber": "063/086",
        "hp": 70
    },
    "620": {
        "cardId": 620,
        "name": "ナットレイ",
        "imageUrl": "/cabt-card-images/620.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "SV11W",
        "collectionNumber": "064/086",
        "hp": 140
    },
    "621": {
        "cardId": 621,
        "name": "ギアル",
        "imageUrl": "/cabt-card-images/621.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "506/742",
        "hp": 60
    },
    "622": {
        "cardId": 622,
        "name": "ギギアル",
        "imageUrl": "/cabt-card-images/622.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "MC",
        "collectionNumber": "507/742",
        "hp": 90
    },
    "623": {
        "cardId": 623,
        "name": "ギギギアル",
        "imageUrl": "/cabt-card-images/623.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/2進化"
        ],
        "expansion": "MC",
        "collectionNumber": "508/742",
        "hp": 150
    },
    "624": {
        "cardId": 624,
        "name": "アイアント",
        "imageUrl": "/cabt-card-images/624.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV11W",
        "collectionNumber": "068/086",
        "hp": 110
    },
    "625": {
        "cardId": 625,
        "name": "クリムガン",
        "imageUrl": "/cabt-card-images/625.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "544/742",
        "hp": 120
    },
    "626": {
        "cardId": 626,
        "name": "ミネズミ",
        "imageUrl": "/cabt-card-images/626.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV11W",
        "collectionNumber": "070/086",
        "hp": 60
    },
    "627": {
        "cardId": 627,
        "name": "ミルホッグ",
        "imageUrl": "/cabt-card-images/627.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "SV11W",
        "collectionNumber": "071/086",
        "hp": 90
    },
    "628": {
        "cardId": 628,
        "name": "ヨーテリー",
        "imageUrl": "/cabt-card-images/628.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SV11W",
        "collectionNumber": "072/086",
        "hp": 60
    },
    "629": {
        "cardId": 629,
        "name": "ハーデリア",
        "imageUrl": "/cabt-card-images/629.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "SV11W",
        "collectionNumber": "073/086",
        "hp": 90
    },
    "630": {
        "cardId": 630,
        "name": "ムーランド",
        "imageUrl": "/cabt-card-images/630.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/2進化"
        ],
        "expansion": "SV11W",
        "collectionNumber": "074/086",
        "hp": 160
    },
    "631": {
        "cardId": 631,
        "name": "バッフロンex",
        "imageUrl": "/cabt-card-images/631.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "605/742",
        "hp": 220
    },
    "632": {
        "cardId": 632,
        "name": "ワシボン",
        "imageUrl": "/cabt-card-images/632.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "606/742",
        "hp": 70
    },
    "633": {
        "cardId": 633,
        "name": "ウォーグル",
        "imageUrl": "/cabt-card-images/633.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "MC",
        "collectionNumber": "607/742",
        "hp": 140
    },
    "634": {
        "cardId": 634,
        "name": "トルネロス",
        "imageUrl": "/cabt-card-images/634.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "610/742",
        "hp": 120
    },
    "635": {
        "cardId": 635,
        "name": "ダイゴのヤジロン",
        "imageUrl": "/cabt-card-images/635.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SVOD",
        "collectionNumber": "001/018",
        "hp": 60
    },
    "636": {
        "cardId": 636,
        "name": "ダイゴのネンドール",
        "imageUrl": "/cabt-card-images/636.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "SVOD",
        "collectionNumber": "002/018",
        "hp": 120
    },
    "637": {
        "cardId": 637,
        "name": "ダイゴのメレシー",
        "imageUrl": "/cabt-card-images/637.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SVOD",
        "collectionNumber": "003/018",
        "hp": 80
    },
    "638": {
        "cardId": 638,
        "name": "ダイゴのエアームド",
        "imageUrl": "/cabt-card-images/638.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "494/742",
        "hp": 120
    },
    "639": {
        "cardId": 639,
        "name": "ダイゴのダンバル",
        "imageUrl": "/cabt-card-images/639.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SVOD",
        "collectionNumber": "019/018",
        "hp": 70
    },
    "640": {
        "cardId": 640,
        "name": "ダイゴのメタング",
        "imageUrl": "/cabt-card-images/640.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "SVOD",
        "collectionNumber": "006/018",
        "hp": 100
    },
    "641": {
        "cardId": 641,
        "name": "ダイゴのメタグロスex",
        "imageUrl": "/cabt-card-images/641.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/2進化"
        ],
        "expansion": "SVOD",
        "collectionNumber": "007/018",
        "hp": 340
    },
    "642": {
        "cardId": 642,
        "name": "マリィのチョロネコ",
        "imageUrl": "/cabt-card-images/642.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "458/742",
        "hp": 60
    },
    "643": {
        "cardId": 643,
        "name": "マリィのレパルダス",
        "imageUrl": "/cabt-card-images/643.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "MC",
        "collectionNumber": "459/742",
        "hp": 100
    },
    "644": {
        "cardId": 644,
        "name": "マリィのズルッグ",
        "imageUrl": "/cabt-card-images/644.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "463/742",
        "hp": 70
    },
    "645": {
        "cardId": 645,
        "name": "マリィのズルズキン",
        "imageUrl": "/cabt-card-images/645.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "MC",
        "collectionNumber": "464/742",
        "hp": 120
    },
    "646": {
        "cardId": 646,
        "name": "マリィのベロバー",
        "imageUrl": "/cabt-card-images/646.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SVOM",
        "collectionNumber": "005/019",
        "hp": 70
    },
    "647": {
        "cardId": 647,
        "name": "マリィのギモー",
        "imageUrl": "/cabt-card-images/647.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "SVOM",
        "collectionNumber": "006/019",
        "hp": 100
    },
    "648": {
        "cardId": 648,
        "name": "マリィのオーロンゲex",
        "imageUrl": "/cabt-card-images/648.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/2進化"
        ],
        "expansion": "SVOM",
        "collectionNumber": "007/019",
        "hp": 320
    },
    "649": {
        "cardId": 649,
        "name": "マリィのモルペコ",
        "imageUrl": "/cabt-card-images/649.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "SVOM",
        "collectionNumber": "020/019",
        "hp": 70
    },
    "650": {
        "cardId": 650,
        "name": "フシギダネ",
        "imageUrl": "/cabt-card-images/650.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M1L",
        "collectionNumber": "001/063",
        "hp": 80
    },
    "651": {
        "cardId": 651,
        "name": "フシギソウ",
        "imageUrl": "/cabt-card-images/651.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "M1L",
        "collectionNumber": "002/063",
        "hp": 110
    },
    "652": {
        "cardId": 652,
        "name": "メガフシギバナex",
        "imageUrl": "/cabt-card-images/652.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/2進化"
        ],
        "expansion": "M1L",
        "collectionNumber": "003/063",
        "hp": 380
    },
    "653": {
        "cardId": 653,
        "name": "タマタマ",
        "imageUrl": "/cabt-card-images/653.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M1L",
        "collectionNumber": "004/063",
        "hp": 60
    },
    "654": {
        "cardId": 654,
        "name": "ナッシー",
        "imageUrl": "/cabt-card-images/654.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "M1L",
        "collectionNumber": "005/063",
        "hp": 140
    },
    "655": {
        "cardId": 655,
        "name": "セレビィ",
        "imageUrl": "/cabt-card-images/655.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M1L",
        "collectionNumber": "006/063",
        "hp": 80
    },
    "656": {
        "cardId": 656,
        "name": "タネボー",
        "imageUrl": "/cabt-card-images/656.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M1L",
        "collectionNumber": "007/063",
        "hp": 60
    },
    "657": {
        "cardId": 657,
        "name": "コノハナ",
        "imageUrl": "/cabt-card-images/657.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "M1L",
        "collectionNumber": "008/063",
        "hp": 100
    },
    "658": {
        "cardId": 658,
        "name": "ダーテング",
        "imageUrl": "/cabt-card-images/658.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/2進化"
        ],
        "expansion": "M1L",
        "collectionNumber": "009/063",
        "hp": 160
    },
    "659": {
        "cardId": 659,
        "name": "ロコン",
        "imageUrl": "/cabt-card-images/659.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M1L",
        "collectionNumber": "010/063",
        "hp": 70
    },
    "660": {
        "cardId": 660,
        "name": "キュウコン",
        "imageUrl": "/cabt-card-images/660.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "M1L",
        "collectionNumber": "011/063",
        "hp": 120
    },
    "661": {
        "cardId": 661,
        "name": "ドンメル",
        "imageUrl": "/cabt-card-images/661.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M1L",
        "collectionNumber": "012/063",
        "hp": 80
    },
    "662": {
        "cardId": 662,
        "name": "メガバクーダex",
        "imageUrl": "/cabt-card-images/662.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "M1L",
        "collectionNumber": "013/063",
        "hp": 340
    },
    "663": {
        "cardId": 663,
        "name": "ボルケニオン",
        "imageUrl": "/cabt-card-images/663.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M1L",
        "collectionNumber": "014/063",
        "hp": 130
    },
    "664": {
        "cardId": 664,
        "name": "ヒバニー",
        "imageUrl": "/cabt-card-images/664.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M1L",
        "collectionNumber": "015/063",
        "hp": 70
    },
    "665": {
        "cardId": 665,
        "name": "ラビフット",
        "imageUrl": "/cabt-card-images/665.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "M1L",
        "collectionNumber": "016/063",
        "hp": 100
    },
    "666": {
        "cardId": 666,
        "name": "エースバーン",
        "imageUrl": "/cabt-card-images/666.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/2進化"
        ],
        "expansion": "M1L",
        "collectionNumber": "017/063",
        "hp": 160
    },
    "667": {
        "cardId": 667,
        "name": "ヘイガニ",
        "imageUrl": "/cabt-card-images/667.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M1L",
        "collectionNumber": "018/063",
        "hp": 80
    },
    "668": {
        "cardId": 668,
        "name": "コレクレー",
        "imageUrl": "/cabt-card-images/668.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "356/742",
        "hp": 70
    },
    "669": {
        "cardId": 669,
        "name": "サンド",
        "imageUrl": "/cabt-card-images/669.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M1L",
        "collectionNumber": "020/063",
        "hp": 70
    },
    "670": {
        "cardId": 670,
        "name": "サンドパン",
        "imageUrl": "/cabt-card-images/670.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "M1L",
        "collectionNumber": "021/063",
        "hp": 120
    },
    "671": {
        "cardId": 671,
        "name": "イワーク",
        "imageUrl": "/cabt-card-images/671.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M1L",
        "collectionNumber": "022/063",
        "hp": 120
    },
    "672": {
        "cardId": 672,
        "name": "バルキー",
        "imageUrl": "/cabt-card-images/672.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M1L",
        "collectionNumber": "023/063",
        "hp": 30
    },
    "673": {
        "cardId": 673,
        "name": "マクノシタ",
        "imageUrl": "/cabt-card-images/673.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M1L",
        "collectionNumber": "024/063",
        "hp": 80
    },
    "674": {
        "cardId": 674,
        "name": "ハリテヤマ",
        "imageUrl": "/cabt-card-images/674.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "M1L",
        "collectionNumber": "025/063",
        "hp": 150
    },
    "675": {
        "cardId": 675,
        "name": "ルナトーン",
        "imageUrl": "/cabt-card-images/675.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "371/742",
        "hp": 110
    },
    "676": {
        "cardId": 676,
        "name": "ソルロック",
        "imageUrl": "/cabt-card-images/676.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "372/742",
        "hp": 110
    },
    "677": {
        "cardId": 677,
        "name": "リオル",
        "imageUrl": "/cabt-card-images/677.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M2a",
        "collectionNumber": "091/193",
        "hp": 80
    },
    "678": {
        "cardId": 678,
        "name": "メガルカリオex",
        "imageUrl": "/cabt-card-images/678.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "M2a",
        "collectionNumber": "092/193",
        "hp": 340
    },
    "679": {
        "cardId": 679,
        "name": "グレッグル",
        "imageUrl": "/cabt-card-images/679.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "382/742",
        "hp": 70
    },
    "680": {
        "cardId": 680,
        "name": "ドクロッグ",
        "imageUrl": "/cabt-card-images/680.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "MC",
        "collectionNumber": "384/742",
        "hp": 130
    },
    "681": {
        "cardId": 681,
        "name": "マーシャドー",
        "imageUrl": "/cabt-card-images/681.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "408/742",
        "hp": 90
    },
    "682": {
        "cardId": 682,
        "name": "イシヘンジン",
        "imageUrl": "/cabt-card-images/682.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "414/742",
        "hp": 130
    },
    "683": {
        "cardId": 683,
        "name": "コジオ",
        "imageUrl": "/cabt-card-images/683.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "416/742",
        "hp": 70
    },
    "684": {
        "cardId": 684,
        "name": "ジオヅム",
        "imageUrl": "/cabt-card-images/684.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "MC",
        "collectionNumber": "417/742",
        "hp": 110
    },
    "685": {
        "cardId": 685,
        "name": "キョジオーン",
        "imageUrl": "/cabt-card-images/685.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/2進化"
        ],
        "expansion": "MC",
        "collectionNumber": "418/742",
        "hp": 180
    },
    "686": {
        "cardId": 686,
        "name": "シザリガー",
        "imageUrl": "/cabt-card-images/686.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "M1L",
        "collectionNumber": "037/063",
        "hp": 130
    },
    "687": {
        "cardId": 687,
        "name": "メガアブソルex",
        "imageUrl": "/cabt-card-images/687.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M1L",
        "collectionNumber": "038/063",
        "hp": 280
    },
    "688": {
        "cardId": 688,
        "name": "ミカルゲ",
        "imageUrl": "/cabt-card-images/688.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "455/742",
        "hp": 80
    },
    "689": {
        "cardId": 689,
        "name": "イベルタル",
        "imageUrl": "/cabt-card-images/689.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "481/742",
        "hp": 110
    },
    "690": {
        "cardId": 690,
        "name": "クスネ",
        "imageUrl": "/cabt-card-images/690.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M1L",
        "collectionNumber": "041/063",
        "hp": 70
    },
    "691": {
        "cardId": 691,
        "name": "フォクスライ",
        "imageUrl": "/cabt-card-images/691.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "M1L",
        "collectionNumber": "042/063",
        "hp": 120
    },
    "692": {
        "cardId": 692,
        "name": "シルシュルー",
        "imageUrl": "/cabt-card-images/692.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M1L",
        "collectionNumber": "043/063",
        "hp": 60
    },
    "693": {
        "cardId": 693,
        "name": "タギングル",
        "imageUrl": "/cabt-card-images/693.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "M1L",
        "collectionNumber": "044/063",
        "hp": 100
    },
    "694": {
        "cardId": 694,
        "name": "ハガネール",
        "imageUrl": "/cabt-card-images/694.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "M1L",
        "collectionNumber": "045/063",
        "hp": 200
    },
    "695": {
        "cardId": 695,
        "name": "メガクチートex",
        "imageUrl": "/cabt-card-images/695.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M1L",
        "collectionNumber": "046/063",
        "hp": 270
    },
    "696": {
        "cardId": 696,
        "name": "ディアルガ",
        "imageUrl": "/cabt-card-images/696.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "502/742",
        "hp": 140
    },
    "697": {
        "cardId": 697,
        "name": "カヌチャン",
        "imageUrl": "/cabt-card-images/697.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "528/742",
        "hp": 70
    },
    "698": {
        "cardId": 698,
        "name": "ナカヌチャン",
        "imageUrl": "/cabt-card-images/698.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "MC",
        "collectionNumber": "529/742",
        "hp": 90
    },
    "699": {
        "cardId": 699,
        "name": "デカヌチャン",
        "imageUrl": "/cabt-card-images/699.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/2進化"
        ],
        "expansion": "MC",
        "collectionNumber": "530/742",
        "hp": 160
    },
    "700": {
        "cardId": 700,
        "name": "サーフゴー",
        "imageUrl": "/cabt-card-images/700.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "MC",
        "collectionNumber": "535/742",
        "hp": 130
    },
    "701": {
        "cardId": 701,
        "name": "オニスズメ",
        "imageUrl": "/cabt-card-images/701.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "557/742",
        "hp": 60
    },
    "702": {
        "cardId": 702,
        "name": "オニドリル",
        "imageUrl": "/cabt-card-images/702.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "MC",
        "collectionNumber": "558/742",
        "hp": 100
    },
    "703": {
        "cardId": 703,
        "name": "ミルタンク",
        "imageUrl": "/cabt-card-images/703.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "578/742",
        "hp": 120
    },
    "704": {
        "cardId": 704,
        "name": "ヤングース",
        "imageUrl": "/cabt-card-images/704.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M1L",
        "collectionNumber": "055/063",
        "hp": 70
    },
    "705": {
        "cardId": 705,
        "name": "デカグース",
        "imageUrl": "/cabt-card-images/705.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "M1L",
        "collectionNumber": "056/063",
        "hp": 100
    },
    "706": {
        "cardId": 706,
        "name": "モンジャラ",
        "imageUrl": "/cabt-card-images/706.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M1S",
        "collectionNumber": "001/063",
        "hp": 80
    },
    "707": {
        "cardId": 707,
        "name": "モジャンボ",
        "imageUrl": "/cabt-card-images/707.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "M1S",
        "collectionNumber": "002/063",
        "hp": 150
    },
    "708": {
        "cardId": 708,
        "name": "チコリータ",
        "imageUrl": "/cabt-card-images/708.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M1S",
        "collectionNumber": "003/063",
        "hp": 70
    },
    "709": {
        "cardId": 709,
        "name": "ベイリーフ",
        "imageUrl": "/cabt-card-images/709.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "M1S",
        "collectionNumber": "004/063",
        "hp": 110
    },
    "710": {
        "cardId": 710,
        "name": "メガニウム",
        "imageUrl": "/cabt-card-images/710.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/2進化"
        ],
        "expansion": "M1S",
        "collectionNumber": "005/063",
        "hp": 160
    },
    "711": {
        "cardId": 711,
        "name": "ツボツボ",
        "imageUrl": "/cabt-card-images/711.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "023/742",
        "hp": 80
    },
    "712": {
        "cardId": 712,
        "name": "ツチニン",
        "imageUrl": "/cabt-card-images/712.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M1S",
        "collectionNumber": "007/063",
        "hp": 50
    },
    "713": {
        "cardId": 713,
        "name": "テッカニン",
        "imageUrl": "/cabt-card-images/713.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "M1S",
        "collectionNumber": "008/063",
        "hp": 80
    },
    "714": {
        "cardId": 714,
        "name": "ダダリン",
        "imageUrl": "/cabt-card-images/714.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M1S",
        "collectionNumber": "009/063",
        "hp": 120
    },
    "715": {
        "cardId": 715,
        "name": "シシコ",
        "imageUrl": "/cabt-card-images/715.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M1S",
        "collectionNumber": "010/063",
        "hp": 70
    },
    "716": {
        "cardId": 716,
        "name": "カエンジシ",
        "imageUrl": "/cabt-card-images/716.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "M1S",
        "collectionNumber": "011/063",
        "hp": 130
    },
    "717": {
        "cardId": 717,
        "name": "ヤクデ",
        "imageUrl": "/cabt-card-images/717.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M1S",
        "collectionNumber": "012/063",
        "hp": 80
    },
    "718": {
        "cardId": 718,
        "name": "マルヤクデ",
        "imageUrl": "/cabt-card-images/718.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "M1S",
        "collectionNumber": "013/063",
        "hp": 140
    },
    "719": {
        "cardId": 719,
        "name": "イーユイ",
        "imageUrl": "/cabt-card-images/719.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M1S",
        "collectionNumber": "014/063",
        "hp": 110
    },
    "720": {
        "cardId": 720,
        "name": "マンタイン",
        "imageUrl": "/cabt-card-images/720.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "173/742",
        "hp": 110
    },
    "721": {
        "cardId": 721,
        "name": "カイオーガ",
        "imageUrl": "/cabt-card-images/721.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M1S",
        "collectionNumber": "016/063",
        "hp": 150
    },
    "722": {
        "cardId": 722,
        "name": "ユキカブリ",
        "imageUrl": "/cabt-card-images/722.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M1S",
        "collectionNumber": "017/063",
        "hp": 90
    },
    "723": {
        "cardId": 723,
        "name": "メガユキノオーex",
        "imageUrl": "/cabt-card-images/723.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "M1S",
        "collectionNumber": "018/063",
        "hp": 350
    },
    "724": {
        "cardId": 724,
        "name": "ウデッポウ",
        "imageUrl": "/cabt-card-images/724.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M1S",
        "collectionNumber": "019/063",
        "hp": 80
    },
    "725": {
        "cardId": 725,
        "name": "ブロスター",
        "imageUrl": "/cabt-card-images/725.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "M1S",
        "collectionNumber": "020/063",
        "hp": 130
    },
    "726": {
        "cardId": 726,
        "name": "メッソン",
        "imageUrl": "/cabt-card-images/726.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M1S",
        "collectionNumber": "021/063",
        "hp": 70
    },
    "727": {
        "cardId": 727,
        "name": "ジメレオン",
        "imageUrl": "/cabt-card-images/727.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "M1S",
        "collectionNumber": "022/063",
        "hp": 100
    },
    "728": {
        "cardId": 728,
        "name": "インテレオン",
        "imageUrl": "/cabt-card-images/728.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/2進化"
        ],
        "expansion": "M1S",
        "collectionNumber": "023/063",
        "hp": 150
    },
    "729": {
        "cardId": 729,
        "name": "ユキハミ",
        "imageUrl": "/cabt-card-images/729.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M1S",
        "collectionNumber": "024/063",
        "hp": 50
    },
    "730": {
        "cardId": 730,
        "name": "モスノウ",
        "imageUrl": "/cabt-card-images/730.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "M1S",
        "collectionNumber": "025/063",
        "hp": 110
    },
    "731": {
        "cardId": 731,
        "name": "コオリッポ",
        "imageUrl": "/cabt-card-images/731.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M1S",
        "collectionNumber": "026/063",
        "hp": 110
    },
    "732": {
        "cardId": 732,
        "name": "コイル",
        "imageUrl": "/cabt-card-images/732.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M1S",
        "collectionNumber": "027/063",
        "hp": 70
    },
    "733": {
        "cardId": 733,
        "name": "レアコイル",
        "imageUrl": "/cabt-card-images/733.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "M1S",
        "collectionNumber": "028/063",
        "hp": 90
    },
    "734": {
        "cardId": 734,
        "name": "ジバコイル",
        "imageUrl": "/cabt-card-images/734.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/2進化"
        ],
        "expansion": "M1S",
        "collectionNumber": "029/063",
        "hp": 160
    },
    "735": {
        "cardId": 735,
        "name": "ライコウ",
        "imageUrl": "/cabt-card-images/735.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M1S",
        "collectionNumber": "030/063",
        "hp": 120
    },
    "736": {
        "cardId": 736,
        "name": "ラクライ",
        "imageUrl": "/cabt-card-images/736.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M1S",
        "collectionNumber": "031/063",
        "hp": 70
    },
    "737": {
        "cardId": 737,
        "name": "メガライボルトex",
        "imageUrl": "/cabt-card-images/737.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "M1S",
        "collectionNumber": "032/063",
        "hp": 330
    },
    "738": {
        "cardId": 738,
        "name": "パチリス",
        "imageUrl": "/cabt-card-images/738.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "247/742",
        "hp": 70
    },
    "739": {
        "cardId": 739,
        "name": "エリキテル",
        "imageUrl": "/cabt-card-images/739.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M1S",
        "collectionNumber": "034/063",
        "hp": 70
    },
    "740": {
        "cardId": 740,
        "name": "エレザード",
        "imageUrl": "/cabt-card-images/740.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "M1S",
        "collectionNumber": "035/063",
        "hp": 120
    },
    "741": {
        "cardId": 741,
        "name": "ケーシィ",
        "imageUrl": "/cabt-card-images/741.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M1S",
        "collectionNumber": "036/063",
        "hp": 50
    },
    "742": {
        "cardId": 742,
        "name": "ユンゲラー",
        "imageUrl": "/cabt-card-images/742.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "M1S",
        "collectionNumber": "037/063",
        "hp": 80
    },
    "743": {
        "cardId": 743,
        "name": "フーディン",
        "imageUrl": "/cabt-card-images/743.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/2進化"
        ],
        "expansion": "M1S",
        "collectionNumber": "038/063",
        "hp": 140
    },
    "744": {
        "cardId": 744,
        "name": "ルージュラ",
        "imageUrl": "/cabt-card-images/744.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M1S",
        "collectionNumber": "039/063",
        "hp": 110
    },
    "745": {
        "cardId": 745,
        "name": "ラルトス",
        "imageUrl": "/cabt-card-images/745.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M2a",
        "collectionNumber": "069/193",
        "hp": 70
    },
    "746": {
        "cardId": 746,
        "name": "キルリア",
        "imageUrl": "/cabt-card-images/746.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "M2a",
        "collectionNumber": "070/193",
        "hp": 100
    },
    "747": {
        "cardId": 747,
        "name": "メガサーナイトex",
        "imageUrl": "/cabt-card-images/747.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/2進化"
        ],
        "expansion": "M2a",
        "collectionNumber": "071/193",
        "hp": 360
    },
    "748": {
        "cardId": 748,
        "name": "ヌケニン",
        "imageUrl": "/cabt-card-images/748.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "M1S",
        "collectionNumber": "043/063",
        "hp": 60
    },
    "749": {
        "cardId": 749,
        "name": "バネブー",
        "imageUrl": "/cabt-card-images/749.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "305/742",
        "hp": 70
    },
    "750": {
        "cardId": 750,
        "name": "ブーピッグ",
        "imageUrl": "/cabt-card-images/750.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "MC",
        "collectionNumber": "306/742",
        "hp": 120
    },
    "751": {
        "cardId": 751,
        "name": "ゼルネアス",
        "imageUrl": "/cabt-card-images/751.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M1S",
        "collectionNumber": "046/063",
        "hp": 120
    },
    "752": {
        "cardId": 752,
        "name": "ボチ",
        "imageUrl": "/cabt-card-images/752.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "349/742",
        "hp": 80
    },
    "753": {
        "cardId": 753,
        "name": "ハカドッグ",
        "imageUrl": "/cabt-card-images/753.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "MC",
        "collectionNumber": "350/742",
        "hp": 140
    },
    "754": {
        "cardId": 754,
        "name": "メガラティアスex",
        "imageUrl": "/cabt-card-images/754.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M1S",
        "collectionNumber": "049/063",
        "hp": 280
    },
    "755": {
        "cardId": 755,
        "name": "ラティオス",
        "imageUrl": "/cabt-card-images/755.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M1S",
        "collectionNumber": "050/063",
        "hp": 130
    },
    "756": {
        "cardId": 756,
        "name": "メガガルーラex",
        "imageUrl": "/cabt-card-images/756.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M1S",
        "collectionNumber": "051/063",
        "hp": 300
    },
    "757": {
        "cardId": 757,
        "name": "デリバード",
        "imageUrl": "/cabt-card-images/757.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M1S",
        "collectionNumber": "052/063",
        "hp": 90
    },
    "758": {
        "cardId": 758,
        "name": "ミミロル",
        "imageUrl": "/cabt-card-images/758.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "593/742",
        "hp": 70
    },
    "759": {
        "cardId": 759,
        "name": "ミミロップ",
        "imageUrl": "/cabt-card-images/759.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "MC",
        "collectionNumber": "594/742",
        "hp": 110
    },
    "760": {
        "cardId": 760,
        "name": "ヌイコグマ",
        "imageUrl": "/cabt-card-images/760.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M1S",
        "collectionNumber": "055/063",
        "hp": 70
    },
    "761": {
        "cardId": 761,
        "name": "キテルグマ",
        "imageUrl": "/cabt-card-images/761.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "M1S",
        "collectionNumber": "056/063",
        "hp": 130
    },
    "762": {
        "cardId": 762,
        "name": "ブルー",
        "imageUrl": "/cabt-card-images/762.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "303/742",
        "hp": 70
    },
    "763": {
        "cardId": 763,
        "name": "グランブル",
        "imageUrl": "/cabt-card-images/763.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "MC",
        "collectionNumber": "304/742",
        "hp": 130
    },
    "764": {
        "cardId": 764,
        "name": "クレセリア",
        "imageUrl": "/cabt-card-images/764.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MBD",
        "collectionNumber": "003/021",
        "hp": 120
    },
    "765": {
        "cardId": 765,
        "name": "メロエッタ",
        "imageUrl": "/cabt-card-images/765.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MBD",
        "collectionNumber": "022/021",
        "hp": 90
    },
    "766": {
        "cardId": 766,
        "name": "メガディアンシーex",
        "imageUrl": "/cabt-card-images/766.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MBD",
        "collectionNumber": "005/021",
        "hp": 270
    },
    "767": {
        "cardId": 767,
        "name": "ミミッキュ",
        "imageUrl": "/cabt-card-images/767.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MBD",
        "collectionNumber": "006/021",
        "hp": 70
    },
    "768": {
        "cardId": 768,
        "name": "マホミル",
        "imageUrl": "/cabt-card-images/768.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MBD",
        "collectionNumber": "007/021",
        "hp": 50
    },
    "769": {
        "cardId": 769,
        "name": "マホイップ",
        "imageUrl": "/cabt-card-images/769.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "MBD",
        "collectionNumber": "008/021",
        "hp": 90
    },
    "770": {
        "cardId": 770,
        "name": "ゴース",
        "imageUrl": "/cabt-card-images/770.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "442/742",
        "hp": 70
    },
    "771": {
        "cardId": 771,
        "name": "ゴースト",
        "imageUrl": "/cabt-card-images/771.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "MC",
        "collectionNumber": "444/742",
        "hp": 100
    },
    "772": {
        "cardId": 772,
        "name": "メガゲンガーex",
        "imageUrl": "/cabt-card-images/772.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/2進化"
        ],
        "expansion": "MBG",
        "collectionNumber": "003/021",
        "hp": 350
    },
    "773": {
        "cardId": 773,
        "name": "ヤミカラス",
        "imageUrl": "/cabt-card-images/773.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MBG",
        "collectionNumber": "004/021",
        "hp": 60
    },
    "774": {
        "cardId": 774,
        "name": "ドンカラス",
        "imageUrl": "/cabt-card-images/774.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "MBG",
        "collectionNumber": "005/021",
        "hp": 130
    },
    "775": {
        "cardId": 775,
        "name": "ヤミラミ",
        "imageUrl": "/cabt-card-images/775.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MBG",
        "collectionNumber": "006/021",
        "hp": 80
    },
    "776": {
        "cardId": 776,
        "name": "アブソル",
        "imageUrl": "/cabt-card-images/776.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MBG",
        "collectionNumber": "007/021",
        "hp": 110
    },
    "777": {
        "cardId": 777,
        "name": "ムゲンダイナ",
        "imageUrl": "/cabt-card-images/777.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MBG",
        "collectionNumber": "008/021",
        "hp": 150
    },
    "778": {
        "cardId": 778,
        "name": "ナゾノクサ",
        "imageUrl": "/cabt-card-images/778.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M2",
        "collectionNumber": "001/080",
        "hp": 50
    },
    "779": {
        "cardId": 779,
        "name": "クサイハナ",
        "imageUrl": "/cabt-card-images/779.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "M2",
        "collectionNumber": "002/080",
        "hp": 70
    },
    "780": {
        "cardId": 780,
        "name": "ラフレシア",
        "imageUrl": "/cabt-card-images/780.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/2進化"
        ],
        "expansion": "M2",
        "collectionNumber": "003/080",
        "hp": 150
    },
    "781": {
        "cardId": 781,
        "name": "メガヘラクロスex",
        "imageUrl": "/cabt-card-images/781.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M2",
        "collectionNumber": "004/080",
        "hp": 280
    },
    "782": {
        "cardId": 782,
        "name": "ハスボー",
        "imageUrl": "/cabt-card-images/782.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M2",
        "collectionNumber": "005/080",
        "hp": 70
    },
    "783": {
        "cardId": 783,
        "name": "ハスブレロ",
        "imageUrl": "/cabt-card-images/783.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "M2",
        "collectionNumber": "006/080",
        "hp": 90
    },
    "784": {
        "cardId": 784,
        "name": "ルンパッパ",
        "imageUrl": "/cabt-card-images/784.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/2進化"
        ],
        "expansion": "M2",
        "collectionNumber": "007/080",
        "hp": 160
    },
    "785": {
        "cardId": 785,
        "name": "ゲノセクト",
        "imageUrl": "/cabt-card-images/785.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M2",
        "collectionNumber": "008/080",
        "hp": 120
    },
    "786": {
        "cardId": 786,
        "name": "マメバッタ",
        "imageUrl": "/cabt-card-images/786.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M2",
        "collectionNumber": "009/080",
        "hp": 50
    },
    "787": {
        "cardId": 787,
        "name": "エクスレッグ",
        "imageUrl": "/cabt-card-images/787.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "M2",
        "collectionNumber": "010/080",
        "hp": 120
    },
    "788": {
        "cardId": 788,
        "name": "ヒトカゲ",
        "imageUrl": "/cabt-card-images/788.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M2",
        "collectionNumber": "011/080",
        "hp": 80
    },
    "789": {
        "cardId": 789,
        "name": "リザード",
        "imageUrl": "/cabt-card-images/789.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "M2",
        "collectionNumber": "012/080",
        "hp": 110
    },
    "790": {
        "cardId": 790,
        "name": "メガリザードンXex",
        "imageUrl": "/cabt-card-images/790.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/2進化"
        ],
        "expansion": "M2",
        "collectionNumber": "013/080",
        "hp": 360
    },
    "791": {
        "cardId": 791,
        "name": "ファイヤー",
        "imageUrl": "/cabt-card-images/791.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M2",
        "collectionNumber": "014/080",
        "hp": 120
    },
    "792": {
        "cardId": 792,
        "name": "ダルマッカ",
        "imageUrl": "/cabt-card-images/792.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M2",
        "collectionNumber": "015/080",
        "hp": 80
    },
    "793": {
        "cardId": 793,
        "name": "ヒヒダルマ",
        "imageUrl": "/cabt-card-images/793.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "M2",
        "collectionNumber": "016/080",
        "hp": 150
    },
    "794": {
        "cardId": 794,
        "name": "レシラム",
        "imageUrl": "/cabt-card-images/794.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M2",
        "collectionNumber": "017/080",
        "hp": 130
    },
    "795": {
        "cardId": 795,
        "name": "オドリドリex",
        "imageUrl": "/cabt-card-images/795.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M2",
        "collectionNumber": "018/080",
        "hp": 190
    },
    "796": {
        "cardId": 796,
        "name": "カルボウ",
        "imageUrl": "/cabt-card-images/796.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M2",
        "collectionNumber": "019/080",
        "hp": 70
    },
    "797": {
        "cardId": 797,
        "name": "ソウブレイズ",
        "imageUrl": "/cabt-card-images/797.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "M2",
        "collectionNumber": "020/080",
        "hp": 140
    },
    "798": {
        "cardId": 798,
        "name": "パウワウ",
        "imageUrl": "/cabt-card-images/798.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M2",
        "collectionNumber": "021/080",
        "hp": 80
    },
    "799": {
        "cardId": 799,
        "name": "ジュゴン",
        "imageUrl": "/cabt-card-images/799.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "M2",
        "collectionNumber": "022/080",
        "hp": 130
    },
    "800": {
        "cardId": 800,
        "name": "ウリムー",
        "imageUrl": "/cabt-card-images/800.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M2",
        "collectionNumber": "023/080",
        "hp": 70
    },
    "801": {
        "cardId": 801,
        "name": "イノムー",
        "imageUrl": "/cabt-card-images/801.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "M2",
        "collectionNumber": "024/080",
        "hp": 100
    },
    "802": {
        "cardId": 802,
        "name": "マンムー",
        "imageUrl": "/cabt-card-images/802.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/2進化"
        ],
        "expansion": "M2",
        "collectionNumber": "025/080",
        "hp": 180
    },
    "803": {
        "cardId": 803,
        "name": "スイクン",
        "imageUrl": "/cabt-card-images/803.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M2",
        "collectionNumber": "026/080",
        "hp": 130
    },
    "804": {
        "cardId": 804,
        "name": "ポッチャマ",
        "imageUrl": "/cabt-card-images/804.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M2",
        "collectionNumber": "027/080",
        "hp": 70
    },
    "805": {
        "cardId": 805,
        "name": "ポッタイシ",
        "imageUrl": "/cabt-card-images/805.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "M2",
        "collectionNumber": "028/080",
        "hp": 100
    },
    "806": {
        "cardId": 806,
        "name": "ロトムex",
        "imageUrl": "/cabt-card-images/806.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M2",
        "collectionNumber": "029/080",
        "hp": 190
    },
    "807": {
        "cardId": 807,
        "name": "ワンパチ",
        "imageUrl": "/cabt-card-images/807.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M2",
        "collectionNumber": "030/080",
        "hp": 70
    },
    "808": {
        "cardId": 808,
        "name": "パルスワン",
        "imageUrl": "/cabt-card-images/808.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "M2",
        "collectionNumber": "031/080",
        "hp": 130
    },
    "809": {
        "cardId": 809,
        "name": "パモ",
        "imageUrl": "/cabt-card-images/809.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M2",
        "collectionNumber": "032/080",
        "hp": 60
    },
    "810": {
        "cardId": 810,
        "name": "パモット",
        "imageUrl": "/cabt-card-images/810.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "M2",
        "collectionNumber": "033/080",
        "hp": 90
    },
    "811": {
        "cardId": 811,
        "name": "パーモット",
        "imageUrl": "/cabt-card-images/811.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/2進化"
        ],
        "expansion": "M2",
        "collectionNumber": "034/080",
        "hp": 140
    },
    "812": {
        "cardId": 812,
        "name": "ムウマ",
        "imageUrl": "/cabt-card-images/812.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M2",
        "collectionNumber": "035/080",
        "hp": 70
    },
    "813": {
        "cardId": 813,
        "name": "ムウマージex",
        "imageUrl": "/cabt-card-images/813.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "M2",
        "collectionNumber": "036/080",
        "hp": 260
    },
    "814": {
        "cardId": 814,
        "name": "モンメン",
        "imageUrl": "/cabt-card-images/814.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M2",
        "collectionNumber": "037/080",
        "hp": 60
    },
    "815": {
        "cardId": 815,
        "name": "エルフーン",
        "imageUrl": "/cabt-card-images/815.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "M2",
        "collectionNumber": "038/080",
        "hp": 90
    },
    "816": {
        "cardId": 816,
        "name": "ザシアン",
        "imageUrl": "/cabt-card-images/816.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M2",
        "collectionNumber": "039/080",
        "hp": 130
    },
    "817": {
        "cardId": 817,
        "name": "アノクサ",
        "imageUrl": "/cabt-card-images/817.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M2",
        "collectionNumber": "040/080",
        "hp": 50
    },
    "818": {
        "cardId": 818,
        "name": "アノホラグサ",
        "imageUrl": "/cabt-card-images/818.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "M2",
        "collectionNumber": "041/080",
        "hp": 100
    },
    "819": {
        "cardId": 819,
        "name": "パルデア ケンタロス",
        "imageUrl": "/cabt-card-images/819.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M2",
        "collectionNumber": "042/080",
        "hp": 130
    },
    "820": {
        "cardId": 820,
        "name": "グライガー",
        "imageUrl": "/cabt-card-images/820.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M2",
        "collectionNumber": "043/080",
        "hp": 70
    },
    "821": {
        "cardId": 821,
        "name": "グライオン",
        "imageUrl": "/cabt-card-images/821.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "M2",
        "collectionNumber": "044/080",
        "hp": 120
    },
    "822": {
        "cardId": 822,
        "name": "ナックラー",
        "imageUrl": "/cabt-card-images/822.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M2",
        "collectionNumber": "045/080",
        "hp": 70
    },
    "823": {
        "cardId": 823,
        "name": "ビブラーバ",
        "imageUrl": "/cabt-card-images/823.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "M2",
        "collectionNumber": "046/080",
        "hp": 90
    },
    "824": {
        "cardId": 824,
        "name": "フライゴン",
        "imageUrl": "/cabt-card-images/824.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/2進化"
        ],
        "expansion": "M2",
        "collectionNumber": "047/080",
        "hp": 150
    },
    "825": {
        "cardId": 825,
        "name": "ニューラ",
        "imageUrl": "/cabt-card-images/825.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M2",
        "collectionNumber": "048/080",
        "hp": 70
    },
    "826": {
        "cardId": 826,
        "name": "マニューラ",
        "imageUrl": "/cabt-card-images/826.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "M2",
        "collectionNumber": "049/080",
        "hp": 90
    },
    "827": {
        "cardId": 827,
        "name": "キバニア",
        "imageUrl": "/cabt-card-images/827.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M2",
        "collectionNumber": "050/080",
        "hp": 70
    },
    "828": {
        "cardId": 828,
        "name": "メガサメハダーex",
        "imageUrl": "/cabt-card-images/828.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "M2",
        "collectionNumber": "051/080",
        "hp": 330
    },
    "829": {
        "cardId": 829,
        "name": "ハブネーク",
        "imageUrl": "/cabt-card-images/829.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M2",
        "collectionNumber": "052/080",
        "hp": 120
    },
    "830": {
        "cardId": 830,
        "name": "メグロコ",
        "imageUrl": "/cabt-card-images/830.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M2",
        "collectionNumber": "053/080",
        "hp": 70
    },
    "831": {
        "cardId": 831,
        "name": "ワルビル",
        "imageUrl": "/cabt-card-images/831.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "M2",
        "collectionNumber": "054/080",
        "hp": 100
    },
    "832": {
        "cardId": 832,
        "name": "ワルビアル",
        "imageUrl": "/cabt-card-images/832.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/2進化"
        ],
        "expansion": "M2",
        "collectionNumber": "055/080",
        "hp": 170
    },
    "833": {
        "cardId": 833,
        "name": "エレズン",
        "imageUrl": "/cabt-card-images/833.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M2",
        "collectionNumber": "056/080",
        "hp": 70
    },
    "834": {
        "cardId": 834,
        "name": "ストリンダー",
        "imageUrl": "/cabt-card-images/834.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "M2",
        "collectionNumber": "057/080",
        "hp": 140
    },
    "835": {
        "cardId": 835,
        "name": "エンペルトex",
        "imageUrl": "/cabt-card-images/835.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/2進化"
        ],
        "expansion": "M2",
        "collectionNumber": "058/080",
        "hp": 320
    },
    "836": {
        "cardId": 836,
        "name": "ドーミラー",
        "imageUrl": "/cabt-card-images/836.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M2",
        "collectionNumber": "059/080",
        "hp": 80
    },
    "837": {
        "cardId": 837,
        "name": "ドータクン",
        "imageUrl": "/cabt-card-images/837.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "M2",
        "collectionNumber": "060/080",
        "hp": 140
    },
    "838": {
        "cardId": 838,
        "name": "トゲデマル",
        "imageUrl": "/cabt-card-images/838.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M2",
        "collectionNumber": "061/080",
        "hp": 80
    },
    "839": {
        "cardId": 839,
        "name": "ジュラルドン",
        "imageUrl": "/cabt-card-images/839.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M2",
        "collectionNumber": "062/080",
        "hp": 130
    },
    "840": {
        "cardId": 840,
        "name": "ブリジュラス",
        "imageUrl": "/cabt-card-images/840.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "M2",
        "collectionNumber": "063/080",
        "hp": 180
    },
    "841": {
        "cardId": 841,
        "name": "プリン",
        "imageUrl": "/cabt-card-images/841.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M2",
        "collectionNumber": "064/080",
        "hp": 70
    },
    "842": {
        "cardId": 842,
        "name": "プクリン",
        "imageUrl": "/cabt-card-images/842.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "M2",
        "collectionNumber": "065/080",
        "hp": 120
    },
    "843": {
        "cardId": 843,
        "name": "エイパム",
        "imageUrl": "/cabt-card-images/843.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M2",
        "collectionNumber": "066/080",
        "hp": 70
    },
    "844": {
        "cardId": 844,
        "name": "エテボース",
        "imageUrl": "/cabt-card-images/844.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "M2",
        "collectionNumber": "067/080",
        "hp": 110
    },
    "845": {
        "cardId": 845,
        "name": "ドーブル",
        "imageUrl": "/cabt-card-images/845.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M2",
        "collectionNumber": "068/080",
        "hp": 80
    },
    "846": {
        "cardId": 846,
        "name": "ジグザグマ",
        "imageUrl": "/cabt-card-images/846.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M2",
        "collectionNumber": "069/080",
        "hp": 70
    },
    "847": {
        "cardId": 847,
        "name": "マッスグマ",
        "imageUrl": "/cabt-card-images/847.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "M2",
        "collectionNumber": "070/080",
        "hp": 100
    },
    "848": {
        "cardId": 848,
        "name": "ミミロル",
        "imageUrl": "/cabt-card-images/848.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M2",
        "collectionNumber": "071/080",
        "hp": 70
    },
    "849": {
        "cardId": 849,
        "name": "メガミミロップex",
        "imageUrl": "/cabt-card-images/849.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "M2",
        "collectionNumber": "072/080",
        "hp": 330
    },
    "850": {
        "cardId": 850,
        "name": "ケムッソ",
        "imageUrl": "/cabt-card-images/850.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M2a",
        "collectionNumber": "004/193",
        "hp": 60
    },
    "851": {
        "cardId": 851,
        "name": "カラサリス",
        "imageUrl": "/cabt-card-images/851.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "M2a",
        "collectionNumber": "005/193",
        "hp": 90
    },
    "852": {
        "cardId": 852,
        "name": "アゲハント",
        "imageUrl": "/cabt-card-images/852.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/2進化"
        ],
        "expansion": "M2a",
        "collectionNumber": "006/193",
        "hp": 130
    },
    "853": {
        "cardId": 853,
        "name": "マユルド",
        "imageUrl": "/cabt-card-images/853.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "M2a",
        "collectionNumber": "007/193",
        "hp": 90
    },
    "854": {
        "cardId": 854,
        "name": "ドクケイル",
        "imageUrl": "/cabt-card-images/854.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/2進化"
        ],
        "expansion": "M2a",
        "collectionNumber": "008/193",
        "hp": 140
    },
    "855": {
        "cardId": 855,
        "name": "エンテイ",
        "imageUrl": "/cabt-card-images/855.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M2a",
        "collectionNumber": "020/193",
        "hp": 140
    },
    "856": {
        "cardId": 856,
        "name": "ドンメル",
        "imageUrl": "/cabt-card-images/856.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M2a",
        "collectionNumber": "022/193",
        "hp": 80
    },
    "857": {
        "cardId": 857,
        "name": "バクーダ",
        "imageUrl": "/cabt-card-images/857.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "M2a",
        "collectionNumber": "023/193",
        "hp": 140
    },
    "858": {
        "cardId": 858,
        "name": "コダック",
        "imageUrl": "/cabt-card-images/858.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M2a",
        "collectionNumber": "032/193",
        "hp": 70
    },
    "859": {
        "cardId": 859,
        "name": "ゴルダック",
        "imageUrl": "/cabt-card-images/859.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "M2a",
        "collectionNumber": "033/193",
        "hp": 120
    },
    "860": {
        "cardId": 860,
        "name": "ユキワラシ",
        "imageUrl": "/cabt-card-images/860.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M2a",
        "collectionNumber": "035/193",
        "hp": 70
    },
    "861": {
        "cardId": 861,
        "name": "メガユキメノコex",
        "imageUrl": "/cabt-card-images/861.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "M2a",
        "collectionNumber": "036/193",
        "hp": 310
    },
    "862": {
        "cardId": 862,
        "name": "Nのバニプッチ",
        "imageUrl": "/cabt-card-images/862.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M2a",
        "collectionNumber": "037/193",
        "hp": 60
    },
    "863": {
        "cardId": 863,
        "name": "Nのバニリッチ",
        "imageUrl": "/cabt-card-images/863.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "M2a",
        "collectionNumber": "038/193",
        "hp": 100
    },
    "864": {
        "cardId": 864,
        "name": "Nのバイバニラ",
        "imageUrl": "/cabt-card-images/864.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/2進化"
        ],
        "expansion": "M2a",
        "collectionNumber": "039/193",
        "hp": 150
    },
    "865": {
        "cardId": 865,
        "name": "ユキハミ",
        "imageUrl": "/cabt-card-images/865.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M2a",
        "collectionNumber": "040/193",
        "hp": 50
    },
    "866": {
        "cardId": 866,
        "name": "モスノウ",
        "imageUrl": "/cabt-card-images/866.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "M2a",
        "collectionNumber": "041/193",
        "hp": 110
    },
    "867": {
        "cardId": 867,
        "name": "ブリザポス",
        "imageUrl": "/cabt-card-images/867.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M2a",
        "collectionNumber": "042/193",
        "hp": 130
    },
    "868": {
        "cardId": 868,
        "name": "メガシビルドンex",
        "imageUrl": "/cabt-card-images/868.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/2進化"
        ],
        "expansion": "M2a",
        "collectionNumber": "049/193",
        "hp": 350
    },
    "869": {
        "cardId": 869,
        "name": "マッギョ",
        "imageUrl": "/cabt-card-images/869.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M2a",
        "collectionNumber": "050/193",
        "hp": 110
    },
    "870": {
        "cardId": 870,
        "name": "エリキテル",
        "imageUrl": "/cabt-card-images/870.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M2a",
        "collectionNumber": "052/193",
        "hp": 70
    },
    "871": {
        "cardId": 871,
        "name": "エレザード",
        "imageUrl": "/cabt-card-images/871.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "M2a",
        "collectionNumber": "053/193",
        "hp": 120
    },
    "872": {
        "cardId": 872,
        "name": "カプ・コケコ",
        "imageUrl": "/cabt-card-images/872.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M2a",
        "collectionNumber": "054/193",
        "hp": 120
    },
    "873": {
        "cardId": 873,
        "name": "ロケット団のタマタマ",
        "imageUrl": "/cabt-card-images/873.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M2a",
        "collectionNumber": "061/193",
        "hp": 60
    },
    "874": {
        "cardId": 874,
        "name": "ロケット団のナッシー",
        "imageUrl": "/cabt-card-images/874.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "M2a",
        "collectionNumber": "062/193",
        "hp": 140
    },
    "875": {
        "cardId": 875,
        "name": "ムウマ",
        "imageUrl": "/cabt-card-images/875.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M2a",
        "collectionNumber": "067/193",
        "hp": 60
    },
    "876": {
        "cardId": 876,
        "name": "ムウマージ",
        "imageUrl": "/cabt-card-images/876.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "M2a",
        "collectionNumber": "068/193",
        "hp": 110
    },
    "877": {
        "cardId": 877,
        "name": "ロトム",
        "imageUrl": "/cabt-card-images/877.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M2a",
        "collectionNumber": "076/193",
        "hp": 60
    },
    "878": {
        "cardId": 878,
        "name": "ホップのボクレー",
        "imageUrl": "/cabt-card-images/878.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M2a",
        "collectionNumber": "077/193",
        "hp": 70
    },
    "879": {
        "cardId": 879,
        "name": "ホップのオーロット",
        "imageUrl": "/cabt-card-images/879.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "M2a",
        "collectionNumber": "078/193",
        "hp": 140
    },
    "880": {
        "cardId": 880,
        "name": "レイスポス",
        "imageUrl": "/cabt-card-images/880.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M2a",
        "collectionNumber": "080/193",
        "hp": 120
    },
    "881": {
        "cardId": 881,
        "name": "ロケット団のディグダ",
        "imageUrl": "/cabt-card-images/881.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M2a",
        "collectionNumber": "082/193",
        "hp": 60
    },
    "882": {
        "cardId": 882,
        "name": "ロケット団のダグトリオ",
        "imageUrl": "/cabt-card-images/882.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "M2a",
        "collectionNumber": "083/193",
        "hp": 100
    },
    "883": {
        "cardId": 883,
        "name": "アサナン",
        "imageUrl": "/cabt-card-images/883.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M2a",
        "collectionNumber": "084/193",
        "hp": 70
    },
    "884": {
        "cardId": 884,
        "name": "チャーレム",
        "imageUrl": "/cabt-card-images/884.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "M2a",
        "collectionNumber": "085/193",
        "hp": 120
    },
    "885": {
        "cardId": 885,
        "name": "ヤンチャム",
        "imageUrl": "/cabt-card-images/885.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M2a",
        "collectionNumber": "093/193",
        "hp": 70
    },
    "886": {
        "cardId": 886,
        "name": "メガルチャブルex",
        "imageUrl": "/cabt-card-images/886.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M2a",
        "collectionNumber": "094/193",
        "hp": 250
    },
    "887": {
        "cardId": 887,
        "name": "タンドン",
        "imageUrl": "/cabt-card-images/887.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M2a",
        "collectionNumber": "095/193",
        "hp": 80
    },
    "888": {
        "cardId": 888,
        "name": "トロッゴン",
        "imageUrl": "/cabt-card-images/888.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "M2a",
        "collectionNumber": "096/193",
        "hp": 110
    },
    "889": {
        "cardId": 889,
        "name": "セキタンザン",
        "imageUrl": "/cabt-card-images/889.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/2進化"
        ],
        "expansion": "M2a",
        "collectionNumber": "097/193",
        "hp": 180
    },
    "890": {
        "cardId": 890,
        "name": "イイネイヌ",
        "imageUrl": "/cabt-card-images/890.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M2a",
        "collectionNumber": "098/193",
        "hp": 140
    },
    "891": {
        "cardId": 891,
        "name": "ロケット団のドンカラス",
        "imageUrl": "/cabt-card-images/891.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "M2a",
        "collectionNumber": "103/193",
        "hp": 130
    },
    "892": {
        "cardId": 892,
        "name": "ガラル ジグザグマ",
        "imageUrl": "/cabt-card-images/892.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M2a",
        "collectionNumber": "105/193",
        "hp": 70
    },
    "893": {
        "cardId": 893,
        "name": "ガラル マッスグマ",
        "imageUrl": "/cabt-card-images/893.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "M2a",
        "collectionNumber": "106/193",
        "hp": 90
    },
    "894": {
        "cardId": 894,
        "name": "ガラル タチフサグマ",
        "imageUrl": "/cabt-card-images/894.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/2進化"
        ],
        "expansion": "M2a",
        "collectionNumber": "107/193",
        "hp": 170
    },
    "895": {
        "cardId": 895,
        "name": "ズルッグ",
        "imageUrl": "/cabt-card-images/895.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M2a",
        "collectionNumber": "109/193",
        "hp": 80
    },
    "896": {
        "cardId": 896,
        "name": "メガズルズキンex",
        "imageUrl": "/cabt-card-images/896.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "M2a",
        "collectionNumber": "110/193",
        "hp": 330
    },
    "897": {
        "cardId": 897,
        "name": "ゴロンダ",
        "imageUrl": "/cabt-card-images/897.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "M2a",
        "collectionNumber": "113/193",
        "hp": 140
    },
    "898": {
        "cardId": 898,
        "name": "モモワロウ",
        "imageUrl": "/cabt-card-images/898.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M2a",
        "collectionNumber": "115/193",
        "hp": 80
    },
    "899": {
        "cardId": 899,
        "name": "コマタナ",
        "imageUrl": "/cabt-card-images/899.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M2a",
        "collectionNumber": "116/193",
        "hp": 70
    },
    "900": {
        "cardId": 900,
        "name": "キリキザン",
        "imageUrl": "/cabt-card-images/900.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "M2a",
        "collectionNumber": "117/193",
        "hp": 120
    },
    "901": {
        "cardId": 901,
        "name": "ドドゲザン",
        "imageUrl": "/cabt-card-images/901.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/2進化"
        ],
        "expansion": "M2a",
        "collectionNumber": "118/193",
        "hp": 170
    },
    "902": {
        "cardId": 902,
        "name": "ミニリュウ",
        "imageUrl": "/cabt-card-images/902.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M2a",
        "collectionNumber": "124/193",
        "hp": 80
    },
    "903": {
        "cardId": 903,
        "name": "ハクリュー",
        "imageUrl": "/cabt-card-images/903.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "M2a",
        "collectionNumber": "125/193",
        "hp": 100
    },
    "904": {
        "cardId": 904,
        "name": "メガカイリューex",
        "imageUrl": "/cabt-card-images/904.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/2進化"
        ],
        "expansion": "M2a",
        "collectionNumber": "126/193",
        "hp": 370
    },
    "905": {
        "cardId": 905,
        "name": "レックウザ",
        "imageUrl": "/cabt-card-images/905.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M2a",
        "collectionNumber": "127/193",
        "hp": 120
    },
    "906": {
        "cardId": 906,
        "name": "Nのゼクロム",
        "imageUrl": "/cabt-card-images/906.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M2a",
        "collectionNumber": "129/193",
        "hp": 130
    },
    "907": {
        "cardId": 907,
        "name": "オンバット",
        "imageUrl": "/cabt-card-images/907.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M2a",
        "collectionNumber": "130/193",
        "hp": 70
    },
    "908": {
        "cardId": 908,
        "name": "オンバーン",
        "imageUrl": "/cabt-card-images/908.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "M2a",
        "collectionNumber": "131/193",
        "hp": 120
    },
    "909": {
        "cardId": 909,
        "name": "エリカのナゾノクサ",
        "imageUrl": "/cabt-card-images/909.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "001/742",
        "hp": 60
    },
    "910": {
        "cardId": 910,
        "name": "エリカのクサイハナ",
        "imageUrl": "/cabt-card-images/910.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "MC",
        "collectionNumber": "002/742",
        "hp": 90
    },
    "911": {
        "cardId": 911,
        "name": "エリカのラフレシアex",
        "imageUrl": "/cabt-card-images/911.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/2進化"
        ],
        "expansion": "MC",
        "collectionNumber": "003/742",
        "hp": 310
    },
    "912": {
        "cardId": 912,
        "name": "エリカのマダツボミ",
        "imageUrl": "/cabt-card-images/912.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "006/742",
        "hp": 60
    },
    "913": {
        "cardId": 913,
        "name": "エリカのウツドン",
        "imageUrl": "/cabt-card-images/913.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "MC",
        "collectionNumber": "007/742",
        "hp": 90
    },
    "914": {
        "cardId": 914,
        "name": "エリカのウツボット",
        "imageUrl": "/cabt-card-images/914.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/2進化"
        ],
        "expansion": "MC",
        "collectionNumber": "008/742",
        "hp": 150
    },
    "915": {
        "cardId": 915,
        "name": "エリカのモンジャラ",
        "imageUrl": "/cabt-card-images/915.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "014/742",
        "hp": 80
    },
    "916": {
        "cardId": 916,
        "name": "ストライク",
        "imageUrl": "/cabt-card-images/916.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "015/742",
        "hp": 90
    },
    "917": {
        "cardId": 917,
        "name": "チコリータ",
        "imageUrl": "/cabt-card-images/917.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "016/742",
        "hp": 70
    },
    "918": {
        "cardId": 918,
        "name": "ベイリーフ",
        "imageUrl": "/cabt-card-images/918.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "MC",
        "collectionNumber": "017/742",
        "hp": 100
    },
    "919": {
        "cardId": 919,
        "name": "メガメガニウムex",
        "imageUrl": "/cabt-card-images/919.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/2進化"
        ],
        "expansion": "MC",
        "collectionNumber": "018/742",
        "hp": 360
    },
    "920": {
        "cardId": 920,
        "name": "カプ・ブルル",
        "imageUrl": "/cabt-card-images/920.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "061/742",
        "hp": 140
    },
    "921": {
        "cardId": 921,
        "name": "カミッチュ",
        "imageUrl": "/cabt-card-images/921.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "MC",
        "collectionNumber": "063/742",
        "hp": 90
    },
    "922": {
        "cardId": 922,
        "name": "ニャオハ",
        "imageUrl": "/cabt-card-images/922.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "065/742",
        "hp": 60
    },
    "923": {
        "cardId": 923,
        "name": "ニャローテ",
        "imageUrl": "/cabt-card-images/923.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "MC",
        "collectionNumber": "066/742",
        "hp": 90
    },
    "924": {
        "cardId": 924,
        "name": "マスカーニャ",
        "imageUrl": "/cabt-card-images/924.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/2進化"
        ],
        "expansion": "MC",
        "collectionNumber": "067/742",
        "hp": 160
    },
    "925": {
        "cardId": 925,
        "name": "カプサイジ",
        "imageUrl": "/cabt-card-images/925.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "076/742",
        "hp": 70
    },
    "926": {
        "cardId": 926,
        "name": "ヒトカゲ",
        "imageUrl": "/cabt-card-images/926.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "083/742",
        "hp": 80
    },
    "927": {
        "cardId": 927,
        "name": "リザード",
        "imageUrl": "/cabt-card-images/927.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "MC",
        "collectionNumber": "084/742",
        "hp": 100
    },
    "928": {
        "cardId": 928,
        "name": "メガリザードンYex",
        "imageUrl": "/cabt-card-images/928.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/2進化"
        ],
        "expansion": "MC",
        "collectionNumber": "085/742",
        "hp": 360
    },
    "929": {
        "cardId": 929,
        "name": "ブーバー",
        "imageUrl": "/cabt-card-images/929.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "091/742",
        "hp": 80
    },
    "930": {
        "cardId": 930,
        "name": "ポカブ",
        "imageUrl": "/cabt-card-images/930.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "109/742",
        "hp": 80
    },
    "931": {
        "cardId": 931,
        "name": "チャオブー",
        "imageUrl": "/cabt-card-images/931.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "MC",
        "collectionNumber": "111/742",
        "hp": 110
    },
    "932": {
        "cardId": 932,
        "name": "メガエンブオーex",
        "imageUrl": "/cabt-card-images/932.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/2進化"
        ],
        "expansion": "MC",
        "collectionNumber": "113/742",
        "hp": 380
    },
    "933": {
        "cardId": 933,
        "name": "メラルバ",
        "imageUrl": "/cabt-card-images/933.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "121/742",
        "hp": 70
    },
    "934": {
        "cardId": 934,
        "name": "マルヤクデ",
        "imageUrl": "/cabt-card-images/934.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "MC",
        "collectionNumber": "141/742",
        "hp": 130
    },
    "935": {
        "cardId": 935,
        "name": "ホゲータ",
        "imageUrl": "/cabt-card-images/935.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "142/742",
        "hp": 80
    },
    "936": {
        "cardId": 936,
        "name": "アチゲータ",
        "imageUrl": "/cabt-card-images/936.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "MC",
        "collectionNumber": "143/742",
        "hp": 110
    },
    "937": {
        "cardId": 937,
        "name": "ワニノコ",
        "imageUrl": "/cabt-card-images/937.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "165/742",
        "hp": 80
    },
    "938": {
        "cardId": 938,
        "name": "アリゲイツ",
        "imageUrl": "/cabt-card-images/938.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "MC",
        "collectionNumber": "167/742",
        "hp": 100
    },
    "939": {
        "cardId": 939,
        "name": "メガオーダイルex",
        "imageUrl": "/cabt-card-images/939.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/2進化"
        ],
        "expansion": "MC",
        "collectionNumber": "169/742",
        "hp": 370
    },
    "940": {
        "cardId": 940,
        "name": "オニゴーリ",
        "imageUrl": "/cabt-card-images/940.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "MC",
        "collectionNumber": "187/742",
        "hp": 120
    },
    "941": {
        "cardId": 941,
        "name": "タマザラシ",
        "imageUrl": "/cabt-card-images/941.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "188/742",
        "hp": 70
    },
    "942": {
        "cardId": 942,
        "name": "トドグラー",
        "imageUrl": "/cabt-card-images/942.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "MC",
        "collectionNumber": "189/742",
        "hp": 100
    },
    "943": {
        "cardId": 943,
        "name": "トドゼルガ",
        "imageUrl": "/cabt-card-images/943.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/2進化"
        ],
        "expansion": "MC",
        "collectionNumber": "190/742",
        "hp": 170
    },
    "944": {
        "cardId": 944,
        "name": "レジアイスex",
        "imageUrl": "/cabt-card-images/944.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "192/742",
        "hp": 230
    },
    "945": {
        "cardId": 945,
        "name": "ケロマツ",
        "imageUrl": "/cabt-card-images/945.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "206/742",
        "hp": 60
    },
    "946": {
        "cardId": 946,
        "name": "ウッウ",
        "imageUrl": "/cabt-card-images/946.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "210/742",
        "hp": 110
    },
    "947": {
        "cardId": 947,
        "name": "クワッス",
        "imageUrl": "/cabt-card-images/947.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "211/742",
        "hp": 60
    },
    "948": {
        "cardId": 948,
        "name": "ピカチュウ",
        "imageUrl": "/cabt-card-images/948.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "225/742",
        "hp": 70
    },
    "949": {
        "cardId": 949,
        "name": "ライチュウ",
        "imageUrl": "/cabt-card-images/949.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "MC",
        "collectionNumber": "226/742",
        "hp": 130
    },
    "950": {
        "cardId": 950,
        "name": "コイル",
        "imageUrl": "/cabt-card-images/950.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "231/742",
        "hp": 60
    },
    "951": {
        "cardId": 951,
        "name": "ビリリダマex",
        "imageUrl": "/cabt-card-images/951.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "233/742",
        "hp": 170
    },
    "952": {
        "cardId": 952,
        "name": "サンダー",
        "imageUrl": "/cabt-card-images/952.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "239/742",
        "hp": 110
    },
    "953": {
        "cardId": 953,
        "name": "サンダー",
        "imageUrl": "/cabt-card-images/953.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "240/742",
        "hp": 120
    },
    "954": {
        "cardId": 954,
        "name": "レントラーex",
        "imageUrl": "/cabt-card-images/954.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/2進化"
        ],
        "expansion": "MC",
        "collectionNumber": "246/742",
        "hp": 310
    },
    "955": {
        "cardId": 955,
        "name": "エリキテル",
        "imageUrl": "/cabt-card-images/955.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "260/742",
        "hp": 60
    },
    "956": {
        "cardId": 956,
        "name": "ゼラオラ",
        "imageUrl": "/cabt-card-images/956.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "267/742",
        "hp": 120
    },
    "957": {
        "cardId": 957,
        "name": "ミライドンex",
        "imageUrl": "/cabt-card-images/957.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "284/742",
        "hp": 220
    },
    "958": {
        "cardId": 958,
        "name": "ピクシー",
        "imageUrl": "/cabt-card-images/958.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "MC",
        "collectionNumber": "286/742",
        "hp": 120
    },
    "959": {
        "cardId": 959,
        "name": "トゲピー",
        "imageUrl": "/cabt-card-images/959.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "291/742",
        "hp": 50
    },
    "960": {
        "cardId": 960,
        "name": "トゲチック",
        "imageUrl": "/cabt-card-images/960.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "MC",
        "collectionNumber": "292/742",
        "hp": 90
    },
    "961": {
        "cardId": 961,
        "name": "マリル",
        "imageUrl": "/cabt-card-images/961.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "295/742",
        "hp": 70
    },
    "962": {
        "cardId": 962,
        "name": "マリルリex",
        "imageUrl": "/cabt-card-images/962.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "MC",
        "collectionNumber": "297/742",
        "hp": 270
    },
    "963": {
        "cardId": 963,
        "name": "カゲボウズ",
        "imageUrl": "/cabt-card-images/963.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "307/742",
        "hp": 60
    },
    "964": {
        "cardId": 964,
        "name": "オーベム",
        "imageUrl": "/cabt-card-images/964.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "MC",
        "collectionNumber": "327/742",
        "hp": 100
    },
    "965": {
        "cardId": 965,
        "name": "ペロッパフ",
        "imageUrl": "/cabt-card-images/965.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "333/742",
        "hp": 60
    },
    "966": {
        "cardId": 966,
        "name": "ペロリーム",
        "imageUrl": "/cabt-card-images/966.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "MC",
        "collectionNumber": "334/742",
        "hp": 120
    },
    "967": {
        "cardId": 967,
        "name": "パピモッチ",
        "imageUrl": "/cabt-card-images/967.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "347/742",
        "hp": 60
    },
    "968": {
        "cardId": 968,
        "name": "バウッツェルex",
        "imageUrl": "/cabt-card-images/968.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "MC",
        "collectionNumber": "348/742",
        "hp": 250
    },
    "969": {
        "cardId": 969,
        "name": "サケブシッポex",
        "imageUrl": "/cabt-card-images/969.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "353/742",
        "hp": 190
    },
    "970": {
        "cardId": 970,
        "name": "キチキギス",
        "imageUrl": "/cabt-card-images/970.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "359/742",
        "hp": 120
    },
    "971": {
        "cardId": 971,
        "name": "テツノイワオ",
        "imageUrl": "/cabt-card-images/971.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "360/742",
        "hp": 140
    },
    "972": {
        "cardId": 972,
        "name": "カポエラー",
        "imageUrl": "/cabt-card-images/972.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "367/742",
        "hp": 100
    },
    "973": {
        "cardId": 973,
        "name": "グラードン",
        "imageUrl": "/cabt-card-images/973.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "375/742",
        "hp": 140
    },
    "974": {
        "cardId": 974,
        "name": "リオル",
        "imageUrl": "/cabt-card-images/974.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "379/742",
        "hp": 70
    },
    "975": {
        "cardId": 975,
        "name": "マッギョex",
        "imageUrl": "/cabt-card-images/975.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "394/742",
        "hp": 210
    },
    "976": {
        "cardId": 976,
        "name": "メレシー",
        "imageUrl": "/cabt-card-images/976.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "400/742",
        "hp": 90
    },
    "977": {
        "cardId": 977,
        "name": "マケンカニ",
        "imageUrl": "/cabt-card-images/977.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "401/742",
        "hp": 90
    },
    "978": {
        "cardId": 978,
        "name": "ナゲツケサル",
        "imageUrl": "/cabt-card-images/978.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "407/742",
        "hp": 110
    },
    "979": {
        "cardId": 979,
        "name": "コライドンex",
        "imageUrl": "/cabt-card-images/979.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "425/742",
        "hp": 230
    },
    "980": {
        "cardId": 980,
        "name": "フシデ",
        "imageUrl": "/cabt-card-images/980.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "460/742",
        "hp": 80
    },
    "981": {
        "cardId": 981,
        "name": "ホイーガ",
        "imageUrl": "/cabt-card-images/981.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "MC",
        "collectionNumber": "461/742",
        "hp": 100
    },
    "982": {
        "cardId": 982,
        "name": "ペンドラー",
        "imageUrl": "/cabt-card-images/982.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/2進化"
        ],
        "expansion": "MC",
        "collectionNumber": "462/742",
        "hp": 170
    },
    "983": {
        "cardId": 983,
        "name": "バルチャイ",
        "imageUrl": "/cabt-card-images/983.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "474/742",
        "hp": 70
    },
    "984": {
        "cardId": 984,
        "name": "バルジーナex",
        "imageUrl": "/cabt-card-images/984.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "MC",
        "collectionNumber": "475/742",
        "hp": 260
    },
    "985": {
        "cardId": 985,
        "name": "フーパ",
        "imageUrl": "/cabt-card-images/985.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "482/742",
        "hp": 120
    },
    "986": {
        "cardId": 986,
        "name": "アラブルタケ",
        "imageUrl": "/cabt-card-images/986.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "487/742",
        "hp": 120
    },
    "987": {
        "cardId": 987,
        "name": "クチート",
        "imageUrl": "/cabt-card-images/987.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "495/742",
        "hp": 90
    },
    "988": {
        "cardId": 988,
        "name": "レジスチルex",
        "imageUrl": "/cabt-card-images/988.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "499/742",
        "hp": 230
    },
    "989": {
        "cardId": 989,
        "name": "ドーミラー",
        "imageUrl": "/cabt-card-images/989.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "500/742",
        "hp": 60
    },
    "990": {
        "cardId": 990,
        "name": "トゲデマルex",
        "imageUrl": "/cabt-card-images/990.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "514/742",
        "hp": 190
    },
    "991": {
        "cardId": 991,
        "name": "メルメタル",
        "imageUrl": "/cabt-card-images/991.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "MC",
        "collectionNumber": "518/742",
        "hp": 160
    },
    "992": {
        "cardId": 992,
        "name": "ジュラルドン",
        "imageUrl": "/cabt-card-images/992.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "523/742",
        "hp": 130
    },
    "993": {
        "cardId": 993,
        "name": "ミミズズex",
        "imageUrl": "/cabt-card-images/993.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "533/742",
        "hp": 220
    },
    "994": {
        "cardId": 994,
        "name": "オノンド",
        "imageUrl": "/cabt-card-images/994.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "MC",
        "collectionNumber": "542/742",
        "hp": 100
    },
    "995": {
        "cardId": 995,
        "name": "オノノクス",
        "imageUrl": "/cabt-card-images/995.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/2進化"
        ],
        "expansion": "MC",
        "collectionNumber": "543/742",
        "hp": 170
    },
    "996": {
        "cardId": 996,
        "name": "アオキのノコッチ",
        "imageUrl": "/cabt-card-images/996.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "576/742",
        "hp": 70
    },
    "997": {
        "cardId": 997,
        "name": "アオキのノココッチex",
        "imageUrl": "/cabt-card-images/997.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "MC",
        "collectionNumber": "577/742",
        "hp": 270
    },
    "998": {
        "cardId": 998,
        "name": "ナマケロ",
        "imageUrl": "/cabt-card-images/998.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "581/742",
        "hp": 60
    },
    "999": {
        "cardId": 999,
        "name": "ヤルキモノ",
        "imageUrl": "/cabt-card-images/999.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "MC",
        "collectionNumber": "582/742",
        "hp": 90
    },
    "1000": {
        "cardId": 1000,
        "name": "エネコ",
        "imageUrl": "/cabt-card-images/1000.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "585/742",
        "hp": 60
    },
    "1001": {
        "cardId": 1001,
        "name": "エネコロロ",
        "imageUrl": "/cabt-card-images/1001.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "MC",
        "collectionNumber": "586/742",
        "hp": 100
    },
    "1002": {
        "cardId": 1002,
        "name": "ザングースex",
        "imageUrl": "/cabt-card-images/1002.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "588/742",
        "hp": 200
    },
    "1003": {
        "cardId": 1003,
        "name": "アオキのムックル",
        "imageUrl": "/cabt-card-images/1003.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "590/742",
        "hp": 60
    },
    "1004": {
        "cardId": 1004,
        "name": "アオキのムクバード",
        "imageUrl": "/cabt-card-images/1004.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "MC",
        "collectionNumber": "591/742",
        "hp": 90
    },
    "1005": {
        "cardId": 1005,
        "name": "アオキのムクホーク",
        "imageUrl": "/cabt-card-images/1005.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/2進化"
        ],
        "expansion": "MC",
        "collectionNumber": "592/742",
        "hp": 150
    },
    "1006": {
        "cardId": 1006,
        "name": "メガタブンネex",
        "imageUrl": "/cabt-card-images/1006.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "602/742",
        "hp": 270
    },
    "1007": {
        "cardId": 1007,
        "name": "アオキのワシボン",
        "imageUrl": "/cabt-card-images/1007.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "608/742",
        "hp": 70
    },
    "1008": {
        "cardId": 1008,
        "name": "アオキのウォーグル",
        "imageUrl": "/cabt-card-images/1008.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "MC",
        "collectionNumber": "609/742",
        "hp": 130
    },
    "1009": {
        "cardId": 1009,
        "name": "アオキのネッコアラ",
        "imageUrl": "/cabt-card-images/1009.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "619/742",
        "hp": 90
    },
    "1010": {
        "cardId": 1010,
        "name": "ジジーロン",
        "imageUrl": "/cabt-card-images/1010.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "MC",
        "collectionNumber": "621/742",
        "hp": 130
    },
    "1011": {
        "cardId": 1011,
        "name": "イトマル",
        "imageUrl": "/cabt-card-images/1011.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M3",
        "collectionNumber": "001/080",
        "hp": 60
    },
    "1012": {
        "cardId": 1012,
        "name": "アリアドス",
        "imageUrl": "/cabt-card-images/1012.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "M3",
        "collectionNumber": "002/080",
        "hp": 110
    },
    "1013": {
        "cardId": 1013,
        "name": "シェイミ",
        "imageUrl": "/cabt-card-images/1013.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M3",
        "collectionNumber": "003/080",
        "hp": 70
    },
    "1014": {
        "cardId": 1014,
        "name": "ツタージャ",
        "imageUrl": "/cabt-card-images/1014.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M3",
        "collectionNumber": "004/080",
        "hp": 70
    },
    "1015": {
        "cardId": 1015,
        "name": "ジャノビー",
        "imageUrl": "/cabt-card-images/1015.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "M3",
        "collectionNumber": "005/080",
        "hp": 100
    },
    "1016": {
        "cardId": 1016,
        "name": "ジャローダ",
        "imageUrl": "/cabt-card-images/1016.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/2進化"
        ],
        "expansion": "M3",
        "collectionNumber": "006/080",
        "hp": 160
    },
    "1017": {
        "cardId": 1017,
        "name": "コフキムシ",
        "imageUrl": "/cabt-card-images/1017.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M3",
        "collectionNumber": "007/080",
        "hp": 40
    },
    "1018": {
        "cardId": 1018,
        "name": "コフーライ",
        "imageUrl": "/cabt-card-images/1018.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "M3",
        "collectionNumber": "008/080",
        "hp": 80
    },
    "1019": {
        "cardId": 1019,
        "name": "ビビヨン",
        "imageUrl": "/cabt-card-images/1019.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/2進化"
        ],
        "expansion": "M3",
        "collectionNumber": "009/080",
        "hp": 120
    },
    "1020": {
        "cardId": 1020,
        "name": "モクロー",
        "imageUrl": "/cabt-card-images/1020.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M3",
        "collectionNumber": "010/080",
        "hp": 80
    },
    "1021": {
        "cardId": 1021,
        "name": "フクスロー",
        "imageUrl": "/cabt-card-images/1021.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "M3",
        "collectionNumber": "011/080",
        "hp": 100
    },
    "1022": {
        "cardId": 1022,
        "name": "ジュナイパーex",
        "imageUrl": "/cabt-card-images/1022.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/2進化"
        ],
        "expansion": "M3",
        "collectionNumber": "012/080",
        "hp": 320
    },
    "1023": {
        "cardId": 1023,
        "name": "ヒノヤコマ",
        "imageUrl": "/cabt-card-images/1023.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "M3",
        "collectionNumber": "013/080",
        "hp": 90
    },
    "1024": {
        "cardId": 1024,
        "name": "ファイアロー",
        "imageUrl": "/cabt-card-images/1024.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/2進化"
        ],
        "expansion": "M3",
        "collectionNumber": "014/080",
        "hp": 150
    },
    "1025": {
        "cardId": 1025,
        "name": "ヤトウモリ",
        "imageUrl": "/cabt-card-images/1025.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M3",
        "collectionNumber": "015/080",
        "hp": 70
    },
    "1026": {
        "cardId": 1026,
        "name": "エンニュートex",
        "imageUrl": "/cabt-card-images/1026.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "M3",
        "collectionNumber": "016/080",
        "hp": 260
    },
    "1027": {
        "cardId": 1027,
        "name": "バクガメス",
        "imageUrl": "/cabt-card-images/1027.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M3",
        "collectionNumber": "017/080",
        "hp": 120
    },
    "1028": {
        "cardId": 1028,
        "name": "パウワウ",
        "imageUrl": "/cabt-card-images/1028.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M3",
        "collectionNumber": "018/080",
        "hp": 80
    },
    "1029": {
        "cardId": 1029,
        "name": "ジュゴン",
        "imageUrl": "/cabt-card-images/1029.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "M3",
        "collectionNumber": "019/080",
        "hp": 130
    },
    "1030": {
        "cardId": 1030,
        "name": "ヒトデマン",
        "imageUrl": "/cabt-card-images/1030.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M3",
        "collectionNumber": "020/080",
        "hp": 70
    },
    "1031": {
        "cardId": 1031,
        "name": "メガスターミーex",
        "imageUrl": "/cabt-card-images/1031.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "M3",
        "collectionNumber": "021/080",
        "hp": 330
    },
    "1032": {
        "cardId": 1032,
        "name": "アマルス",
        "imageUrl": "/cabt-card-images/1032.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "M3",
        "collectionNumber": "022/080",
        "hp": 100
    },
    "1033": {
        "cardId": 1033,
        "name": "アマルルガ",
        "imageUrl": "/cabt-card-images/1033.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/2進化"
        ],
        "expansion": "M3",
        "collectionNumber": "023/080",
        "hp": 170
    },
    "1034": {
        "cardId": 1034,
        "name": "ボルケニオン",
        "imageUrl": "/cabt-card-images/1034.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M3",
        "collectionNumber": "024/080",
        "hp": 130
    },
    "1035": {
        "cardId": 1035,
        "name": "コリンク",
        "imageUrl": "/cabt-card-images/1035.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M3",
        "collectionNumber": "025/080",
        "hp": 70
    },
    "1036": {
        "cardId": 1036,
        "name": "ルクシオ",
        "imageUrl": "/cabt-card-images/1036.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "M3",
        "collectionNumber": "026/080",
        "hp": 90
    },
    "1037": {
        "cardId": 1037,
        "name": "レントラー",
        "imageUrl": "/cabt-card-images/1037.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/2進化"
        ],
        "expansion": "M3",
        "collectionNumber": "027/080",
        "hp": 150
    },
    "1038": {
        "cardId": 1038,
        "name": "デデンネ",
        "imageUrl": "/cabt-card-images/1038.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M3",
        "collectionNumber": "028/080",
        "hp": 70
    },
    "1039": {
        "cardId": 1039,
        "name": "ピッピ",
        "imageUrl": "/cabt-card-images/1039.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M3",
        "collectionNumber": "029/080",
        "hp": 70
    },
    "1040": {
        "cardId": 1040,
        "name": "メガピクシーex",
        "imageUrl": "/cabt-card-images/1040.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "M3",
        "collectionNumber": "030/080",
        "hp": 320
    },
    "1041": {
        "cardId": 1041,
        "name": "クチート",
        "imageUrl": "/cabt-card-images/1041.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M3",
        "collectionNumber": "031/080",
        "hp": 110
    },
    "1042": {
        "cardId": 1042,
        "name": "ニャスパー",
        "imageUrl": "/cabt-card-images/1042.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M3",
        "collectionNumber": "032/080",
        "hp": 60
    },
    "1043": {
        "cardId": 1043,
        "name": "ニャオニクス",
        "imageUrl": "/cabt-card-images/1043.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "M3",
        "collectionNumber": "033/080",
        "hp": 100
    },
    "1044": {
        "cardId": 1044,
        "name": "シュシュプ",
        "imageUrl": "/cabt-card-images/1044.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M3",
        "collectionNumber": "034/080",
        "hp": 70
    },
    "1045": {
        "cardId": 1045,
        "name": "フレフワン",
        "imageUrl": "/cabt-card-images/1045.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "M3",
        "collectionNumber": "035/080",
        "hp": 120
    },
    "1046": {
        "cardId": 1046,
        "name": "ノズパス",
        "imageUrl": "/cabt-card-images/1046.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M3",
        "collectionNumber": "036/080",
        "hp": 90
    },
    "1047": {
        "cardId": 1047,
        "name": "ダイノーズ",
        "imageUrl": "/cabt-card-images/1047.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "M3",
        "collectionNumber": "037/080",
        "hp": 140
    },
    "1048": {
        "cardId": 1048,
        "name": "ヒポポタス",
        "imageUrl": "/cabt-card-images/1048.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M3",
        "collectionNumber": "038/080",
        "hp": 100
    },
    "1049": {
        "cardId": 1049,
        "name": "カバルドン",
        "imageUrl": "/cabt-card-images/1049.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "M3",
        "collectionNumber": "039/080",
        "hp": 150
    },
    "1050": {
        "cardId": 1050,
        "name": "ランドロス",
        "imageUrl": "/cabt-card-images/1050.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M3",
        "collectionNumber": "040/080",
        "hp": 120
    },
    "1051": {
        "cardId": 1051,
        "name": "カメテテ",
        "imageUrl": "/cabt-card-images/1051.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M3",
        "collectionNumber": "041/080",
        "hp": 80
    },
    "1052": {
        "cardId": 1052,
        "name": "ガメノデス",
        "imageUrl": "/cabt-card-images/1052.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "M3",
        "collectionNumber": "042/080",
        "hp": 130
    },
    "1053": {
        "cardId": 1053,
        "name": "チゴラス",
        "imageUrl": "/cabt-card-images/1053.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "M3",
        "collectionNumber": "043/080",
        "hp": 100
    },
    "1054": {
        "cardId": 1054,
        "name": "ガチゴラス",
        "imageUrl": "/cabt-card-images/1054.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/2進化"
        ],
        "expansion": "M3",
        "collectionNumber": "044/080",
        "hp": 180
    },
    "1055": {
        "cardId": 1055,
        "name": "ルチャブル",
        "imageUrl": "/cabt-card-images/1055.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M3",
        "collectionNumber": "045/080",
        "hp": 70
    },
    "1056": {
        "cardId": 1056,
        "name": "メガジガルデex",
        "imageUrl": "/cabt-card-images/1056.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M3",
        "collectionNumber": "046/080",
        "hp": 310
    },
    "1057": {
        "cardId": 1057,
        "name": "ゴース",
        "imageUrl": "/cabt-card-images/1057.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M3",
        "collectionNumber": "047/080",
        "hp": 70
    },
    "1058": {
        "cardId": 1058,
        "name": "ゴースト",
        "imageUrl": "/cabt-card-images/1058.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "M3",
        "collectionNumber": "048/080",
        "hp": 100
    },
    "1059": {
        "cardId": 1059,
        "name": "ゲンガー",
        "imageUrl": "/cabt-card-images/1059.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/2進化"
        ],
        "expansion": "M3",
        "collectionNumber": "049/080",
        "hp": 130
    },
    "1060": {
        "cardId": 1060,
        "name": "スコルピ",
        "imageUrl": "/cabt-card-images/1060.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M3",
        "collectionNumber": "050/080",
        "hp": 80
    },
    "1061": {
        "cardId": 1061,
        "name": "ドラピオン",
        "imageUrl": "/cabt-card-images/1061.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "M3",
        "collectionNumber": "051/080",
        "hp": 140
    },
    "1062": {
        "cardId": 1062,
        "name": "イベルタルex",
        "imageUrl": "/cabt-card-images/1062.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M3",
        "collectionNumber": "052/080",
        "hp": 210
    },
    "1063": {
        "cardId": 1063,
        "name": "パオジアン",
        "imageUrl": "/cabt-card-images/1063.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M3",
        "collectionNumber": "053/080",
        "hp": 120
    },
    "1064": {
        "cardId": 1064,
        "name": "メガエアームドex",
        "imageUrl": "/cabt-card-images/1064.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M3",
        "collectionNumber": "054/080",
        "hp": 260
    },
    "1065": {
        "cardId": 1065,
        "name": "ヒトツキ",
        "imageUrl": "/cabt-card-images/1065.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M3",
        "collectionNumber": "055/080",
        "hp": 70
    },
    "1066": {
        "cardId": 1066,
        "name": "ニダンギル",
        "imageUrl": "/cabt-card-images/1066.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "M3",
        "collectionNumber": "056/080",
        "hp": 100
    },
    "1067": {
        "cardId": 1067,
        "name": "ギルガルド",
        "imageUrl": "/cabt-card-images/1067.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/2進化"
        ],
        "expansion": "M3",
        "collectionNumber": "057/080",
        "hp": 150
    },
    "1068": {
        "cardId": 1068,
        "name": "クレッフィ",
        "imageUrl": "/cabt-card-images/1068.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M3",
        "collectionNumber": "058/080",
        "hp": 70
    },
    "1069": {
        "cardId": 1069,
        "name": "コラッタ",
        "imageUrl": "/cabt-card-images/1069.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M3",
        "collectionNumber": "059/080",
        "hp": 40
    },
    "1070": {
        "cardId": 1070,
        "name": "ラッタ",
        "imageUrl": "/cabt-card-images/1070.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "M3",
        "collectionNumber": "060/080",
        "hp": 90
    },
    "1071": {
        "cardId": 1071,
        "name": "ニャースex",
        "imageUrl": "/cabt-card-images/1071.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M3",
        "collectionNumber": "061/080",
        "hp": 170
    },
    "1072": {
        "cardId": 1072,
        "name": "カビゴン",
        "imageUrl": "/cabt-card-images/1072.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M3",
        "collectionNumber": "062/080",
        "hp": 160
    },
    "1073": {
        "cardId": 1073,
        "name": "ホルビー",
        "imageUrl": "/cabt-card-images/1073.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M3",
        "collectionNumber": "063/080",
        "hp": 70
    },
    "1074": {
        "cardId": 1074,
        "name": "ホルード",
        "imageUrl": "/cabt-card-images/1074.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/1進化"
        ],
        "expansion": "M3",
        "collectionNumber": "064/080",
        "hp": 150
    },
    "1075": {
        "cardId": 1075,
        "name": "ヤヤコマ",
        "imageUrl": "/cabt-card-images/1075.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M3",
        "collectionNumber": "065/080",
        "hp": 60
    },
    "1076": {
        "cardId": 1076,
        "name": "トリミアン",
        "imageUrl": "/cabt-card-images/1076.webp",
        "supertype": "Trainer",
        "subtypes": [
            "ポケモン/たね"
        ],
        "expansion": "M3",
        "collectionNumber": "066/080",
        "hp": 90
    },
    "1077": {
        "cardId": 1077,
        "name": "ロトりぼう",
        "imageUrl": "/cabt-card-images/1077.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Item"
        ],
        "expansion": "PROMO",
        "collectionNumber": "160/SV-P"
    },
    "1078": {
        "cardId": 1078,
        "name": "あなあけスコップ",
        "imageUrl": "/cabt-card-images/1078.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Item"
        ],
        "expansion": "PROMO",
        "collectionNumber": "005/M-P"
    },
    "1079": {
        "cardId": 1079,
        "name": "ふしぎなアメ",
        "imageUrl": "/cabt-card-images/1079.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Item"
        ],
        "expansion": "MC",
        "collectionNumber": "655/742"
    },
    "1080": {
        "cardId": 1080,
        "name": "アンフェアスタンプ",
        "imageUrl": "/cabt-card-images/1080.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Item"
        ],
        "expansion": "MC",
        "collectionNumber": "633/742"
    },
    "1081": {
        "cardId": 1081,
        "name": "改造ハンマー",
        "imageUrl": "/cabt-card-images/1081.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Item"
        ],
        "expansion": "M2a",
        "collectionNumber": "148/193"
    },
    "1082": {
        "cardId": 1082,
        "name": "ハイパーアロマ",
        "imageUrl": "/cabt-card-images/1082.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Item"
        ],
        "expansion": "MC",
        "collectionNumber": "650/742"
    },
    "1083": {
        "cardId": 1083,
        "name": "ラブラブボール",
        "imageUrl": "/cabt-card-images/1083.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Item"
        ],
        "expansion": "SV5a",
        "collectionNumber": "058/066"
    },
    "1084": {
        "cardId": 1084,
        "name": "おとりよせボックス",
        "imageUrl": "/cabt-card-images/1084.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Item"
        ],
        "expansion": "SV5K",
        "collectionNumber": "061/071"
    },
    "1085": {
        "cardId": 1085,
        "name": "覚醒のドラム",
        "imageUrl": "/cabt-card-images/1085.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Item"
        ],
        "expansion": "MC",
        "collectionNumber": "642/742"
    },
    "1086": {
        "cardId": 1086,
        "name": "なかよしポフィン",
        "imageUrl": "/cabt-card-images/1086.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Item"
        ],
        "expansion": "MC",
        "collectionNumber": "648/742"
    },
    "1087": {
        "cardId": 1087,
        "name": "ハンドトリマー",
        "imageUrl": "/cabt-card-images/1087.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Item"
        ],
        "expansion": "MC",
        "collectionNumber": "653/742"
    },
    "1088": {
        "cardId": 1088,
        "name": "プライムキャッチャー",
        "imageUrl": "/cabt-card-images/1088.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Item"
        ],
        "expansion": "MC",
        "collectionNumber": "656/742"
    },
    "1089": {
        "cardId": 1089,
        "name": "リブートポッド",
        "imageUrl": "/cabt-card-images/1089.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Item"
        ],
        "expansion": "MC",
        "collectionNumber": "671/742"
    },
    "1090": {
        "cardId": 1090,
        "name": "鬼の仮面",
        "imageUrl": "/cabt-card-images/1090.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Item"
        ],
        "expansion": "MC",
        "collectionNumber": "641/742"
    },
    "1091": {
        "cardId": 1091,
        "name": "おはやし笛",
        "imageUrl": "/cabt-card-images/1091.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Item"
        ],
        "expansion": "SV6",
        "collectionNumber": "091/101"
    },
    "1092": {
        "cardId": 1092,
        "name": "シークレットボックス",
        "imageUrl": "/cabt-card-images/1092.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Item"
        ],
        "expansion": "SV6",
        "collectionNumber": "092/101"
    },
    "1093": {
        "cardId": 1093,
        "name": "ポケモン回収サイクロン",
        "imageUrl": "/cabt-card-images/1093.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Item"
        ],
        "expansion": "MC",
        "collectionNumber": "664/742"
    },
    "1094": {
        "cardId": 1094,
        "name": "むしとりセット",
        "imageUrl": "/cabt-card-images/1094.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Item"
        ],
        "expansion": "MC",
        "collectionNumber": "667/742"
    },
    "1095": {
        "cardId": 1095,
        "name": "デンジャラス光線",
        "imageUrl": "/cabt-card-images/1095.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Item"
        ],
        "expansion": "MC",
        "collectionNumber": "647/742"
    },
    "1096": {
        "cardId": 1096,
        "name": "ポケバイタルA",
        "imageUrl": "/cabt-card-images/1096.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Item"
        ],
        "expansion": "MC",
        "collectionNumber": "661/742"
    },
    "1097": {
        "cardId": 1097,
        "name": "夜のタンカ",
        "imageUrl": "/cabt-card-images/1097.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Item"
        ],
        "expansion": "MC",
        "collectionNumber": "670/742"
    },
    "1098": {
        "cardId": 1098,
        "name": "ガラスのラッパ",
        "imageUrl": "/cabt-card-images/1098.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Item"
        ],
        "expansion": "M2a",
        "collectionNumber": "149/193"
    },
    "1099": {
        "cardId": 1099,
        "name": "古びたねっこの化石",
        "imageUrl": "/cabt-card-images/1099.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Item"
        ],
        "expansion": "SV7",
        "collectionNumber": "090/102",
        "hp": 60
    },
    "1100": {
        "cardId": 1100,
        "name": "エネルギー転送PRO",
        "imageUrl": "/cabt-card-images/1100.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Item"
        ],
        "expansion": "SV7a",
        "collectionNumber": "052/064"
    },
    "1101": {
        "cardId": 1101,
        "name": "おたすけベル",
        "imageUrl": "/cabt-card-images/1101.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Item"
        ],
        "expansion": "SV7a",
        "collectionNumber": "053/064"
    },
    "1102": {
        "cardId": 1102,
        "name": "ダークボール",
        "imageUrl": "/cabt-card-images/1102.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Item"
        ],
        "expansion": "SV7a",
        "collectionNumber": "054/064"
    },
    "1103": {
        "cardId": 1103,
        "name": "ぼうがいレター",
        "imageUrl": "/cabt-card-images/1103.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Item"
        ],
        "expansion": "SV7a",
        "collectionNumber": "055/064"
    },
    "1104": {
        "cardId": 1104,
        "name": "メガトンブロアー",
        "imageUrl": "/cabt-card-images/1104.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Item"
        ],
        "expansion": "SV7a",
        "collectionNumber": "056/064"
    },
    "1105": {
        "cardId": 1105,
        "name": "竜の秘薬",
        "imageUrl": "/cabt-card-images/1105.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Item"
        ],
        "expansion": "MC",
        "collectionNumber": "672/742"
    },
    "1106": {
        "cardId": 1106,
        "name": "推理セット",
        "imageUrl": "/cabt-card-images/1106.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Item"
        ],
        "expansion": "MC",
        "collectionNumber": "645/742"
    },
    "1107": {
        "cardId": 1107,
        "name": "スクランブルスイッチ",
        "imageUrl": "/cabt-card-images/1107.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Item"
        ],
        "expansion": "MC",
        "collectionNumber": "646/742"
    },
    "1108": {
        "cardId": 1108,
        "name": "のんびりじゃらし",
        "imageUrl": "/cabt-card-images/1108.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Item"
        ],
        "expansion": "MC",
        "collectionNumber": "649/742"
    },
    "1109": {
        "cardId": 1109,
        "name": "ミラクルインカム",
        "imageUrl": "/cabt-card-images/1109.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Item"
        ],
        "expansion": "SV8",
        "collectionNumber": "097/106"
    },
    "1110": {
        "cardId": 1110,
        "name": "つりざおMAX",
        "imageUrl": "/cabt-card-images/1110.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Item"
        ],
        "expansion": "SV8a",
        "collectionNumber": "142/187"
    },
    "1111": {
        "cardId": 1111,
        "name": "トレジャーガジェット",
        "imageUrl": "/cabt-card-images/1111.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Item"
        ],
        "expansion": "SV8a",
        "collectionNumber": "146/187"
    },
    "1112": {
        "cardId": 1112,
        "name": "いいきずぐすり",
        "imageUrl": "/cabt-card-images/1112.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Item"
        ],
        "expansion": "MC",
        "collectionNumber": "634/742"
    },
    "1113": {
        "cardId": 1113,
        "name": "Nのポイントアップ",
        "imageUrl": "/cabt-card-images/1113.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Item"
        ],
        "expansion": "MC",
        "collectionNumber": "635/742"
    },
    "1114": {
        "cardId": 1114,
        "name": "とりかえチケット",
        "imageUrl": "/cabt-card-images/1114.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Item"
        ],
        "expansion": "SV9",
        "collectionNumber": "090/100"
    },
    "1115": {
        "cardId": 1115,
        "name": "ホップのバッグ",
        "imageUrl": "/cabt-card-images/1115.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Item"
        ],
        "expansion": "MC",
        "collectionNumber": "666/742"
    },
    "1116": {
        "cardId": 1116,
        "name": "エネルギーつけかえ",
        "imageUrl": "/cabt-card-images/1116.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Item"
        ],
        "expansion": "MC",
        "collectionNumber": "638/742"
    },
    "1117": {
        "cardId": 1117,
        "name": "きずぐすり",
        "imageUrl": "/cabt-card-images/1117.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Item"
        ],
        "expansion": "MC",
        "collectionNumber": "643/742"
    },
    "1118": {
        "cardId": 1118,
        "name": "エネルギー回収",
        "imageUrl": "/cabt-card-images/1118.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Item"
        ],
        "expansion": "MC",
        "collectionNumber": "636/742"
    },
    "1119": {
        "cardId": 1119,
        "name": "エネルギー転送",
        "imageUrl": "/cabt-card-images/1119.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Item"
        ],
        "expansion": "MC",
        "collectionNumber": "639/742"
    },
    "1120": {
        "cardId": 1120,
        "name": "クラッシュハンマー",
        "imageUrl": "/cabt-card-images/1120.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Item"
        ],
        "expansion": "MC",
        "collectionNumber": "644/742"
    },
    "1121": {
        "cardId": 1121,
        "name": "ハイパーボール",
        "imageUrl": "/cabt-card-images/1121.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Item"
        ],
        "expansion": "MC",
        "collectionNumber": "651/742"
    },
    "1122": {
        "cardId": 1122,
        "name": "ポケギア3.0",
        "imageUrl": "/cabt-card-images/1122.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Item"
        ],
        "expansion": "MC",
        "collectionNumber": "660/742"
    },
    "1123": {
        "cardId": 1123,
        "name": "ポケモンいれかえ",
        "imageUrl": "/cabt-card-images/1123.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Item"
        ],
        "expansion": "MC",
        "collectionNumber": "663/742"
    },
    "1124": {
        "cardId": 1124,
        "name": "ポケモンキャッチャー",
        "imageUrl": "/cabt-card-images/1124.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Item"
        ],
        "expansion": "MC",
        "collectionNumber": "665/742"
    },
    "1125": {
        "cardId": 1125,
        "name": "マスターボール",
        "imageUrl": "/cabt-card-images/1125.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Item"
        ],
        "expansion": "SVHM",
        "collectionNumber": "032/053"
    },
    "1126": {
        "cardId": 1126,
        "name": "プレシャスキャリー",
        "imageUrl": "/cabt-card-images/1126.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Item"
        ],
        "expansion": "MC",
        "collectionNumber": "658/742"
    },
    "1127": {
        "cardId": 1127,
        "name": "テラスタルオーブ",
        "imageUrl": "/cabt-card-images/1127.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Item"
        ],
        "expansion": "M2a",
        "collectionNumber": "152/193"
    },
    "1128": {
        "cardId": 1128,
        "name": "パーフェクトミキサー",
        "imageUrl": "/cabt-card-images/1128.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Item"
        ],
        "expansion": "SVLS",
        "collectionNumber": "014/022"
    },
    "1129": {
        "cardId": 1129,
        "name": "せいなるはい",
        "imageUrl": "/cabt-card-images/1129.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Item"
        ],
        "expansion": "M2a",
        "collectionNumber": "150/193"
    },
    "1130": {
        "cardId": 1130,
        "name": "ペパーのサンドウィッチ",
        "imageUrl": "/cabt-card-images/1130.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Item"
        ],
        "expansion": "MC",
        "collectionNumber": "659/742"
    },
    "1131": {
        "cardId": 1131,
        "name": "ロケット団のおじゃまロボ",
        "imageUrl": "/cabt-card-images/1131.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Item"
        ],
        "expansion": "SV10",
        "collectionNumber": "087/098"
    },
    "1132": {
        "cardId": 1132,
        "name": "ロケット団のスーパーボール",
        "imageUrl": "/cabt-card-images/1132.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Item"
        ],
        "expansion": "MC",
        "collectionNumber": "673/742"
    },
    "1133": {
        "cardId": 1133,
        "name": "ロケット団のびっくりボム",
        "imageUrl": "/cabt-card-images/1133.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Item"
        ],
        "expansion": "MC",
        "collectionNumber": "674/742"
    },
    "1134": {
        "cardId": 1134,
        "name": "ロケット団のレシーバー",
        "imageUrl": "/cabt-card-images/1134.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Item"
        ],
        "expansion": "MC",
        "collectionNumber": "675/742"
    },
    "1135": {
        "cardId": 1135,
        "name": "エネルギーコイン",
        "imageUrl": "/cabt-card-images/1135.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Item"
        ],
        "expansion": "MC",
        "collectionNumber": "637/742"
    },
    "1136": {
        "cardId": 1136,
        "name": "古びたふたの化石",
        "imageUrl": "/cabt-card-images/1136.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Item"
        ],
        "expansion": "SV11B",
        "collectionNumber": "080/086",
        "hp": 60
    },
    "1137": {
        "cardId": 1137,
        "name": "ツールスクラッパー",
        "imageUrl": "/cabt-card-images/1137.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Item"
        ],
        "expansion": "MA",
        "collectionNumber": "017/043"
    },
    "1138": {
        "cardId": 1138,
        "name": "古びたはねの化石",
        "imageUrl": "/cabt-card-images/1138.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Item"
        ],
        "expansion": "MC",
        "collectionNumber": "657/742",
        "hp": 60
    },
    "1139": {
        "cardId": 1139,
        "name": "エネルギーリサイクル",
        "imageUrl": "/cabt-card-images/1139.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Item"
        ],
        "expansion": "MC",
        "collectionNumber": "640/742"
    },
    "1140": {
        "cardId": 1140,
        "name": "アイアンディフェンダー",
        "imageUrl": "/cabt-card-images/1140.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Item"
        ],
        "expansion": "MC",
        "collectionNumber": "631/742"
    },
    "1141": {
        "cardId": 1141,
        "name": "パワープロテイン",
        "imageUrl": "/cabt-card-images/1141.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Item"
        ],
        "expansion": "MC",
        "collectionNumber": "652/742"
    },
    "1142": {
        "cardId": 1142,
        "name": "ファイトゴング",
        "imageUrl": "/cabt-card-images/1142.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Item"
        ],
        "expansion": "MC",
        "collectionNumber": "654/742"
    },
    "1143": {
        "cardId": 1143,
        "name": "むしよけスプレー",
        "imageUrl": "/cabt-card-images/1143.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Item"
        ],
        "expansion": "MC",
        "collectionNumber": "668/742"
    },
    "1144": {
        "cardId": 1144,
        "name": "あやしい時計",
        "imageUrl": "/cabt-card-images/1144.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Item"
        ],
        "expansion": "MC",
        "collectionNumber": "632/742"
    },
    "1145": {
        "cardId": 1145,
        "name": "メガシグナル",
        "imageUrl": "/cabt-card-images/1145.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Item"
        ],
        "expansion": "MBG",
        "collectionNumber": "015/021"
    },
    "1146": {
        "cardId": 1146,
        "name": "ワンダーパッチ",
        "imageUrl": "/cabt-card-images/1146.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Item"
        ],
        "expansion": "MBD",
        "collectionNumber": "015/021"
    },
    "1147": {
        "cardId": 1147,
        "name": "ジャンボアイス",
        "imageUrl": "/cabt-card-images/1147.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Item"
        ],
        "expansion": "M2",
        "collectionNumber": "073/080"
    },
    "1148": {
        "cardId": 1148,
        "name": "ヒートバーナー",
        "imageUrl": "/cabt-card-images/1148.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Item"
        ],
        "expansion": "M2",
        "collectionNumber": "074/080"
    },
    "1149": {
        "cardId": 1149,
        "name": "エネはたき",
        "imageUrl": "/cabt-card-images/1149.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Item"
        ],
        "expansion": "M3",
        "collectionNumber": "067/080"
    },
    "1150": {
        "cardId": 1150,
        "name": "古びたアゴの化石",
        "imageUrl": "/cabt-card-images/1150.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Item"
        ],
        "expansion": "M3",
        "collectionNumber": "068/080",
        "hp": 60
    },
    "1151": {
        "cardId": 1151,
        "name": "古びたヒレの化石",
        "imageUrl": "/cabt-card-images/1151.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Item"
        ],
        "expansion": "M3",
        "collectionNumber": "069/080",
        "hp": 60
    },
    "1152": {
        "cardId": 1152,
        "name": "ポケパッド",
        "imageUrl": "/cabt-card-images/1152.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Item"
        ],
        "expansion": "M3",
        "collectionNumber": "070/080"
    },
    "1153": {
        "cardId": 1153,
        "name": "ミアレガレット",
        "imageUrl": "/cabt-card-images/1153.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Item"
        ],
        "expansion": "M3",
        "collectionNumber": "071/080"
    },
    "1154": {
        "cardId": 1154,
        "name": "ロケット団のさいみん装置",
        "imageUrl": "/cabt-card-images/1154.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Pokémon Tool"
        ],
        "expansion": "PROMO",
        "collectionNumber": "267/SV-P"
    },
    "1155": {
        "cardId": 1155,
        "name": "サバイブギプス",
        "imageUrl": "/cabt-card-images/1155.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Pokémon Tool"
        ],
        "expansion": "SV5a",
        "collectionNumber": "059/066"
    },
    "1156": {
        "cardId": 1156,
        "name": "ラッキーメット",
        "imageUrl": "/cabt-card-images/1156.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Pokémon Tool"
        ],
        "expansion": "SV5a",
        "collectionNumber": "060/066"
    },
    "1157": {
        "cardId": 1157,
        "name": "緊急ボード",
        "imageUrl": "/cabt-card-images/1157.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Pokémon Tool"
        ],
        "expansion": "SVN",
        "collectionNumber": "026/045"
    },
    "1158": {
        "cardId": 1158,
        "name": "マキシマムベルト",
        "imageUrl": "/cabt-card-images/1158.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Pokémon Tool"
        ],
        "expansion": "MC",
        "collectionNumber": "691/742"
    },
    "1159": {
        "cardId": 1159,
        "name": "ヒーローマント",
        "imageUrl": "/cabt-card-images/1159.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Pokémon Tool"
        ],
        "expansion": "MC",
        "collectionNumber": "687/742"
    },
    "1160": {
        "cardId": 1160,
        "name": "ヘビーバトン",
        "imageUrl": "/cabt-card-images/1160.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Pokémon Tool"
        ],
        "expansion": "SV5M",
        "collectionNumber": "066/071"
    },
    "1161": {
        "cardId": 1161,
        "name": "ハンディサーキュレーター",
        "imageUrl": "/cabt-card-images/1161.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Pokémon Tool"
        ],
        "expansion": "SV6",
        "collectionNumber": "095/101"
    },
    "1162": {
        "cardId": 1162,
        "name": "くさりもち",
        "imageUrl": "/cabt-card-images/1162.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Pokémon Tool"
        ],
        "expansion": "MC",
        "collectionNumber": "681/742"
    },
    "1163": {
        "cardId": 1163,
        "name": "力の砂時計",
        "imageUrl": "/cabt-card-images/1163.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Pokémon Tool"
        ],
        "expansion": "MC",
        "collectionNumber": "683/742"
    },
    "1164": {
        "cardId": 1164,
        "name": "ウタンのみ",
        "imageUrl": "/cabt-card-images/1164.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Pokémon Tool"
        ],
        "expansion": "MC",
        "collectionNumber": "677/742"
    },
    "1165": {
        "cardId": 1165,
        "name": "きらめく結晶",
        "imageUrl": "/cabt-card-images/1165.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Pokémon Tool"
        ],
        "expansion": "MC",
        "collectionNumber": "680/742"
    },
    "1166": {
        "cardId": 1166,
        "name": "重力玉",
        "imageUrl": "/cabt-card-images/1166.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Pokémon Tool"
        ],
        "expansion": "SV7",
        "collectionNumber": "095/102"
    },
    "1167": {
        "cardId": 1167,
        "name": "デラックスボム",
        "imageUrl": "/cabt-card-images/1167.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Pokémon Tool"
        ],
        "expansion": "MC",
        "collectionNumber": "684/742"
    },
    "1168": {
        "cardId": 1168,
        "name": "カウンターゲイン",
        "imageUrl": "/cabt-card-images/1168.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Pokémon Tool"
        ],
        "expansion": "MC",
        "collectionNumber": "679/742"
    },
    "1169": {
        "cardId": 1169,
        "name": "希望のアミュレット",
        "imageUrl": "/cabt-card-images/1169.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Pokémon Tool"
        ],
        "expansion": "SV8",
        "collectionNumber": "098/106"
    },
    "1170": {
        "cardId": 1170,
        "name": "ハバンのみ",
        "imageUrl": "/cabt-card-images/1170.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Pokémon Tool"
        ],
        "expansion": "MC",
        "collectionNumber": "686/742"
    },
    "1171": {
        "cardId": 1171,
        "name": "ホップのこだわりハチマキ",
        "imageUrl": "/cabt-card-images/1171.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Pokémon Tool"
        ],
        "expansion": "MC",
        "collectionNumber": "690/742"
    },
    "1172": {
        "cardId": 1172,
        "name": "リーリエのしんじゅ",
        "imageUrl": "/cabt-card-images/1172.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Pokémon Tool"
        ],
        "expansion": "MC",
        "collectionNumber": "692/742"
    },
    "1173": {
        "cardId": 1173,
        "name": "シロナのパワーウエイト",
        "imageUrl": "/cabt-card-images/1173.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Pokémon Tool"
        ],
        "expansion": "MC",
        "collectionNumber": "682/742"
    },
    "1174": {
        "cardId": 1174,
        "name": "ふうせん",
        "imageUrl": "/cabt-card-images/1174.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Pokémon Tool"
        ],
        "expansion": "MC",
        "collectionNumber": "688/742"
    },
    "1175": {
        "cardId": 1175,
        "name": "ブレイブバングル",
        "imageUrl": "/cabt-card-images/1175.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Pokémon Tool"
        ],
        "expansion": "MC",
        "collectionNumber": "689/742"
    },
    "1176": {
        "cardId": 1176,
        "name": "パンクメット",
        "imageUrl": "/cabt-card-images/1176.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Pokémon Tool"
        ],
        "expansion": "MBG",
        "collectionNumber": "017/021"
    },
    "1177": {
        "cardId": 1177,
        "name": "せいなるおまもり",
        "imageUrl": "/cabt-card-images/1177.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Pokémon Tool"
        ],
        "expansion": "M2",
        "collectionNumber": "075/080"
    },
    "1178": {
        "cardId": 1178,
        "name": "でんきだま",
        "imageUrl": "/cabt-card-images/1178.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Pokémon Tool"
        ],
        "expansion": "M2a",
        "collectionNumber": "163/193"
    },
    "1179": {
        "cardId": 1179,
        "name": "ぶあついうろこ",
        "imageUrl": "/cabt-card-images/1179.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Pokémon Tool"
        ],
        "expansion": "M2a",
        "collectionNumber": "164/193"
    },
    "1180": {
        "cardId": 1180,
        "name": "コアメモリ",
        "imageUrl": "/cabt-card-images/1180.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Pokémon Tool"
        ],
        "expansion": "M3",
        "collectionNumber": "072/080"
    },
    "1181": {
        "cardId": 1181,
        "name": "ビリオとネア",
        "imageUrl": "/cabt-card-images/1181.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Supporter"
        ],
        "expansion": "PROMO",
        "collectionNumber": "170/SV-P"
    },
    "1182": {
        "cardId": 1182,
        "name": "ボスの指令",
        "imageUrl": "/cabt-card-images/1182.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Supporter"
        ],
        "expansion": "MC",
        "collectionNumber": "724/742"
    },
    "1183": {
        "cardId": 1183,
        "name": "サザレ",
        "imageUrl": "/cabt-card-images/1183.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Supporter"
        ],
        "expansion": "MC",
        "collectionNumber": "709/742"
    },
    "1184": {
        "cardId": 1184,
        "name": "スイレンのお世話",
        "imageUrl": "/cabt-card-images/1184.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Supporter"
        ],
        "expansion": "MC",
        "collectionNumber": "712/742"
    },
    "1185": {
        "cardId": 1185,
        "name": "探検家の先導",
        "imageUrl": "/cabt-card-images/1185.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Supporter"
        ],
        "expansion": "MC",
        "collectionNumber": "717/742"
    },
    "1186": {
        "cardId": 1186,
        "name": "ビワ",
        "imageUrl": "/cabt-card-images/1186.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Supporter"
        ],
        "expansion": "SV5K",
        "collectionNumber": "068/071"
    },
    "1187": {
        "cardId": 1187,
        "name": "マツバの確信",
        "imageUrl": "/cabt-card-images/1187.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Supporter"
        ],
        "expansion": "MC",
        "collectionNumber": "727/742"
    },
    "1188": {
        "cardId": 1188,
        "name": "暗号マニアの解読",
        "imageUrl": "/cabt-card-images/1188.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Supporter"
        ],
        "expansion": "MC",
        "collectionNumber": "698/742"
    },
    "1189": {
        "cardId": 1189,
        "name": "セイジ",
        "imageUrl": "/cabt-card-images/1189.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Supporter"
        ],
        "expansion": "MC",
        "collectionNumber": "714/742"
    },
    "1190": {
        "cardId": 1190,
        "name": "ベルのまごころ",
        "imageUrl": "/cabt-card-images/1190.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Supporter"
        ],
        "expansion": "MC",
        "collectionNumber": "723/742"
    },
    "1191": {
        "cardId": 1191,
        "name": "スグリ",
        "imageUrl": "/cabt-card-images/1191.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Supporter"
        ],
        "expansion": "MC",
        "collectionNumber": "713/742"
    },
    "1192": {
        "cardId": 1192,
        "name": "ゼイユ",
        "imageUrl": "/cabt-card-images/1192.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Supporter"
        ],
        "expansion": "MC",
        "collectionNumber": "715/742"
    },
    "1193": {
        "cardId": 1193,
        "name": "ハッサク",
        "imageUrl": "/cabt-card-images/1193.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Supporter"
        ],
        "expansion": "MC",
        "collectionNumber": "721/742"
    },
    "1194": {
        "cardId": 1194,
        "name": "アクロマの執念",
        "imageUrl": "/cabt-card-images/1194.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Supporter"
        ],
        "expansion": "SV8a",
        "collectionNumber": "164/187"
    },
    "1195": {
        "cardId": 1195,
        "name": "アンズの秘技",
        "imageUrl": "/cabt-card-images/1195.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Supporter"
        ],
        "expansion": "MC",
        "collectionNumber": "699/742"
    },
    "1196": {
        "cardId": 1196,
        "name": "カシオペア",
        "imageUrl": "/cabt-card-images/1196.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Supporter"
        ],
        "expansion": "SV6a",
        "collectionNumber": "061/064"
    },
    "1197": {
        "cardId": 1197,
        "name": "クセロシキのたくらみ",
        "imageUrl": "/cabt-card-images/1197.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Supporter"
        ],
        "expansion": "MC",
        "collectionNumber": "705/742"
    },
    "1198": {
        "cardId": 1198,
        "name": "アカマツ",
        "imageUrl": "/cabt-card-images/1198.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Supporter"
        ],
        "expansion": "MC",
        "collectionNumber": "696/742"
    },
    "1199": {
        "cardId": 1199,
        "name": "タロ",
        "imageUrl": "/cabt-card-images/1199.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Supporter"
        ],
        "expansion": "MC",
        "collectionNumber": "716/742"
    },
    "1200": {
        "cardId": 1200,
        "name": "ハイダイ",
        "imageUrl": "/cabt-card-images/1200.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Supporter"
        ],
        "expansion": "MC",
        "collectionNumber": "720/742"
    },
    "1201": {
        "cardId": 1201,
        "name": "ブライア",
        "imageUrl": "/cabt-card-images/1201.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Supporter"
        ],
        "expansion": "MC",
        "collectionNumber": "722/742"
    },
    "1202": {
        "cardId": 1202,
        "name": "カキツバタ",
        "imageUrl": "/cabt-card-images/1202.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Supporter"
        ],
        "expansion": "MC",
        "collectionNumber": "703/742"
    },
    "1203": {
        "cardId": 1203,
        "name": "サーファー",
        "imageUrl": "/cabt-card-images/1203.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Supporter"
        ],
        "expansion": "MC",
        "collectionNumber": "708/742"
    },
    "1204": {
        "cardId": 1204,
        "name": "ルチアのアピール",
        "imageUrl": "/cabt-card-images/1204.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Supporter"
        ],
        "expansion": "MC",
        "collectionNumber": "730/742"
    },
    "1205": {
        "cardId": 1205,
        "name": "シアノ",
        "imageUrl": "/cabt-card-images/1205.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Supporter"
        ],
        "expansion": "SV8",
        "collectionNumber": "102/106"
    },
    "1206": {
        "cardId": 1206,
        "name": "アオキの手際",
        "imageUrl": "/cabt-card-images/1206.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Supporter"
        ],
        "expansion": "MC",
        "collectionNumber": "695/742"
    },
    "1207": {
        "cardId": 1207,
        "name": "ネリネ",
        "imageUrl": "/cabt-card-images/1207.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Supporter"
        ],
        "expansion": "SV8a",
        "collectionNumber": "173/187"
    },
    "1208": {
        "cardId": 1208,
        "name": "アイリスの闘志",
        "imageUrl": "/cabt-card-images/1208.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Supporter"
        ],
        "expansion": "MC",
        "collectionNumber": "694/742"
    },
    "1209": {
        "cardId": 1209,
        "name": "怖いお兄さん",
        "imageUrl": "/cabt-card-images/1209.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Supporter"
        ],
        "expansion": "SV9",
        "collectionNumber": "095/100"
    },
    "1210": {
        "cardId": 1210,
        "name": "タケシのスカウト",
        "imageUrl": "/cabt-card-images/1210.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Supporter"
        ],
        "expansion": "SV9",
        "collectionNumber": "096/100"
    },
    "1211": {
        "cardId": 1211,
        "name": "からておうの稽古",
        "imageUrl": "/cabt-card-images/1211.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Supporter"
        ],
        "expansion": "MC",
        "collectionNumber": "704/742"
    },
    "1212": {
        "cardId": 1212,
        "name": "コック",
        "imageUrl": "/cabt-card-images/1212.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Supporter"
        ],
        "expansion": "MC",
        "collectionNumber": "706/742"
    },
    "1213": {
        "cardId": 1213,
        "name": "ジャッジマン",
        "imageUrl": "/cabt-card-images/1213.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Supporter"
        ],
        "expansion": "MC",
        "collectionNumber": "711/742"
    },
    "1214": {
        "cardId": 1214,
        "name": "MCの盛り上げ",
        "imageUrl": "/cabt-card-images/1214.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Supporter"
        ],
        "expansion": "SV9a",
        "collectionNumber": "061/063"
    },
    "1215": {
        "cardId": 1215,
        "name": "ヒビキの冒険",
        "imageUrl": "/cabt-card-images/1215.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Supporter"
        ],
        "expansion": "M2a",
        "collectionNumber": "174/193"
    },
    "1216": {
        "cardId": 1216,
        "name": "ロケット団のアテナ",
        "imageUrl": "/cabt-card-images/1216.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Supporter"
        ],
        "expansion": "MC",
        "collectionNumber": "731/742"
    },
    "1217": {
        "cardId": 1217,
        "name": "ロケット団のアポロ",
        "imageUrl": "/cabt-card-images/1217.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Supporter"
        ],
        "expansion": "MC",
        "collectionNumber": "732/742"
    },
    "1218": {
        "cardId": 1218,
        "name": "ロケット団のサカキ",
        "imageUrl": "/cabt-card-images/1218.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Supporter"
        ],
        "expansion": "MC",
        "collectionNumber": "733/742"
    },
    "1219": {
        "cardId": 1219,
        "name": "ロケット団のラムダ",
        "imageUrl": "/cabt-card-images/1219.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Supporter"
        ],
        "expansion": "MC",
        "collectionNumber": "734/742"
    },
    "1220": {
        "cardId": 1220,
        "name": "ロケット団のランス",
        "imageUrl": "/cabt-card-images/1220.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Supporter"
        ],
        "expansion": "MC",
        "collectionNumber": "735/742"
    },
    "1221": {
        "cardId": 1221,
        "name": "Nの筋書き",
        "imageUrl": "/cabt-card-images/1221.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Supporter"
        ],
        "expansion": "MC",
        "collectionNumber": "701/742"
    },
    "1222": {
        "cardId": 1222,
        "name": "マコモ",
        "imageUrl": "/cabt-card-images/1222.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Supporter"
        ],
        "expansion": "MC",
        "collectionNumber": "725/742"
    },
    "1223": {
        "cardId": 1223,
        "name": "クラウン",
        "imageUrl": "/cabt-card-images/1223.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Supporter"
        ],
        "expansion": "SV11W",
        "collectionNumber": "083/086"
    },
    "1224": {
        "cardId": 1224,
        "name": "チェレン",
        "imageUrl": "/cabt-card-images/1224.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Supporter"
        ],
        "expansion": "SV11W",
        "collectionNumber": "084/086"
    },
    "1225": {
        "cardId": 1225,
        "name": "トウコ",
        "imageUrl": "/cabt-card-images/1225.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Supporter"
        ],
        "expansion": "MC",
        "collectionNumber": "718/742"
    },
    "1226": {
        "cardId": 1226,
        "name": "マチスの取引",
        "imageUrl": "/cabt-card-images/1226.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Supporter"
        ],
        "expansion": "MC",
        "collectionNumber": "726/742"
    },
    "1227": {
        "cardId": 1227,
        "name": "リーリエの決心",
        "imageUrl": "/cabt-card-images/1227.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Supporter"
        ],
        "expansion": "MC",
        "collectionNumber": "729/742"
    },
    "1228": {
        "cardId": 1228,
        "name": "アセロラのいたずら",
        "imageUrl": "/cabt-card-images/1228.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Supporter"
        ],
        "expansion": "MC",
        "collectionNumber": "697/742"
    },
    "1229": {
        "cardId": 1229,
        "name": "ミツルの思いやり",
        "imageUrl": "/cabt-card-images/1229.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Supporter"
        ],
        "expansion": "MA",
        "collectionNumber": "040/043"
    },
    "1230": {
        "cardId": 1230,
        "name": "ギーマの一手",
        "imageUrl": "/cabt-card-images/1230.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Supporter"
        ],
        "expansion": "M2",
        "collectionNumber": "076/080"
    },
    "1231": {
        "cardId": 1231,
        "name": "ヒカリ",
        "imageUrl": "/cabt-card-images/1231.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Supporter"
        ],
        "expansion": "M2",
        "collectionNumber": "077/080"
    },
    "1232": {
        "cardId": 1232,
        "name": "ひふきやろう",
        "imageUrl": "/cabt-card-images/1232.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Supporter"
        ],
        "expansion": "M2",
        "collectionNumber": "078/080"
    },
    "1233": {
        "cardId": 1233,
        "name": "カナリィ",
        "imageUrl": "/cabt-card-images/1233.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Supporter"
        ],
        "expansion": "M2a",
        "collectionNumber": "170/193"
    },
    "1234": {
        "cardId": 1234,
        "name": "バーベナとヘレナ",
        "imageUrl": "/cabt-card-images/1234.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Supporter"
        ],
        "expansion": "M2a",
        "collectionNumber": "173/193"
    },
    "1235": {
        "cardId": 1235,
        "name": "ウエートレス",
        "imageUrl": "/cabt-card-images/1235.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Supporter"
        ],
        "expansion": "MC",
        "collectionNumber": "700/742"
    },
    "1236": {
        "cardId": 1236,
        "name": "ガイ",
        "imageUrl": "/cabt-card-images/1236.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Supporter"
        ],
        "expansion": "MC",
        "collectionNumber": "702/742"
    },
    "1237": {
        "cardId": 1237,
        "name": "ゴヨウ",
        "imageUrl": "/cabt-card-images/1237.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Supporter"
        ],
        "expansion": "MC",
        "collectionNumber": "707/742"
    },
    "1238": {
        "cardId": 1238,
        "name": "タラゴン",
        "imageUrl": "/cabt-card-images/1238.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Supporter"
        ],
        "expansion": "M3",
        "collectionNumber": "073/080"
    },
    "1239": {
        "cardId": 1239,
        "name": "ピュール",
        "imageUrl": "/cabt-card-images/1239.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Supporter"
        ],
        "expansion": "M3",
        "collectionNumber": "074/080"
    },
    "1240": {
        "cardId": 1240,
        "name": "メイのはげまし",
        "imageUrl": "/cabt-card-images/1240.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Supporter"
        ],
        "expansion": "M3",
        "collectionNumber": "075/080"
    },
    "1241": {
        "cardId": 1241,
        "name": "ユカリ",
        "imageUrl": "/cabt-card-images/1241.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Supporter"
        ],
        "expansion": "M3",
        "collectionNumber": "076/080"
    },
    "1242": {
        "cardId": 1242,
        "name": "公民館",
        "imageUrl": "/cabt-card-images/1242.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Stadium"
        ],
        "expansion": "SV5a",
        "collectionNumber": "065/066"
    },
    "1243": {
        "cardId": 1243,
        "name": "危険な密林",
        "imageUrl": "/cabt-card-images/1243.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Stadium"
        ],
        "expansion": "SV5K",
        "collectionNumber": "070/071"
    },
    "1244": {
        "cardId": 1244,
        "name": "フルメタルラボ",
        "imageUrl": "/cabt-card-images/1244.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Stadium"
        ],
        "expansion": "SV5M",
        "collectionNumber": "070/071"
    },
    "1245": {
        "cardId": 1245,
        "name": "お祭り会場",
        "imageUrl": "/cabt-card-images/1245.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Stadium"
        ],
        "expansion": "SV8a",
        "collectionNumber": "180/187"
    },
    "1246": {
        "cardId": 1246,
        "name": "ジャミングタワー",
        "imageUrl": "/cabt-card-images/1246.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Stadium"
        ],
        "expansion": "SVN",
        "collectionNumber": "039/045"
    },
    "1247": {
        "cardId": 1247,
        "name": "ニュートラルセンター",
        "imageUrl": "/cabt-card-images/1247.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Stadium"
        ],
        "expansion": "SV8a",
        "collectionNumber": "184/187"
    },
    "1248": {
        "cardId": 1248,
        "name": "夜のアカデミー",
        "imageUrl": "/cabt-card-images/1248.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Stadium"
        ],
        "expansion": "SV6a",
        "collectionNumber": "064/064"
    },
    "1249": {
        "cardId": 1249,
        "name": "偉大な大樹",
        "imageUrl": "/cabt-card-images/1249.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Stadium"
        ],
        "expansion": "SV7",
        "collectionNumber": "101/102"
    },
    "1250": {
        "cardId": 1250,
        "name": "ゼロの大空洞",
        "imageUrl": "/cabt-card-images/1250.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Stadium"
        ],
        "expansion": "M2a",
        "collectionNumber": "184/193"
    },
    "1251": {
        "cardId": 1251,
        "name": "エキサイトスタジアム",
        "imageUrl": "/cabt-card-images/1251.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Stadium"
        ],
        "expansion": "PROMO",
        "collectionNumber": "251/SV-P"
    },
    "1252": {
        "cardId": 1252,
        "name": "グラビティーマウンテン",
        "imageUrl": "/cabt-card-images/1252.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Stadium"
        ],
        "expansion": "M2a",
        "collectionNumber": "183/193"
    },
    "1253": {
        "cardId": 1253,
        "name": "Nの城",
        "imageUrl": "/cabt-card-images/1253.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Stadium"
        ],
        "expansion": "M2a",
        "collectionNumber": "181/193"
    },
    "1254": {
        "cardId": 1254,
        "name": "ハッコウシティ",
        "imageUrl": "/cabt-card-images/1254.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Stadium"
        ],
        "expansion": "M2a",
        "collectionNumber": "185/193"
    },
    "1255": {
        "cardId": 1255,
        "name": "ハロンタウン",
        "imageUrl": "/cabt-card-images/1255.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Stadium"
        ],
        "expansion": "M2a",
        "collectionNumber": "186/193"
    },
    "1256": {
        "cardId": 1256,
        "name": "ロケット団の監視塔",
        "imageUrl": "/cabt-card-images/1256.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Stadium"
        ],
        "expansion": "M2a",
        "collectionNumber": "189/193"
    },
    "1257": {
        "cardId": 1257,
        "name": "ロケット団のファクトリー",
        "imageUrl": "/cabt-card-images/1257.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Stadium"
        ],
        "expansion": "M2a",
        "collectionNumber": "190/193"
    },
    "1258": {
        "cardId": 1258,
        "name": "いしのどうくつ",
        "imageUrl": "/cabt-card-images/1258.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Stadium"
        ],
        "expansion": "SVOD",
        "collectionNumber": "018/018"
    },
    "1259": {
        "cardId": 1259,
        "name": "スパイクタウンジム",
        "imageUrl": "/cabt-card-images/1259.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Stadium"
        ],
        "expansion": "SVOM",
        "collectionNumber": "019/019"
    },
    "1260": {
        "cardId": 1260,
        "name": "危ない廃墟",
        "imageUrl": "/cabt-card-images/1260.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Stadium"
        ],
        "expansion": "M1L",
        "collectionNumber": "063/063"
    },
    "1261": {
        "cardId": 1261,
        "name": "活力の森",
        "imageUrl": "/cabt-card-images/1261.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Stadium"
        ],
        "expansion": "M2a",
        "collectionNumber": "182/193"
    },
    "1262": {
        "cardId": 1262,
        "name": "なみのりビーチ",
        "imageUrl": "/cabt-card-images/1262.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Stadium"
        ],
        "expansion": "M1S",
        "collectionNumber": "062/063"
    },
    "1263": {
        "cardId": 1263,
        "name": "ミステリーガーデン",
        "imageUrl": "/cabt-card-images/1263.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Stadium"
        ],
        "expansion": "MBD",
        "collectionNumber": "021/021"
    },
    "1264": {
        "cardId": 1264,
        "name": "バトルコロシアム",
        "imageUrl": "/cabt-card-images/1264.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Stadium"
        ],
        "expansion": "M2",
        "collectionNumber": "079/080"
    },
    "1265": {
        "cardId": 1265,
        "name": "めまいの谷",
        "imageUrl": "/cabt-card-images/1265.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Stadium"
        ],
        "expansion": "M2",
        "collectionNumber": "080/080"
    },
    "1266": {
        "cardId": 1266,
        "name": "夜の鉱山",
        "imageUrl": "/cabt-card-images/1266.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Stadium"
        ],
        "expansion": "M2a",
        "collectionNumber": "188/193"
    },
    "1267": {
        "cardId": 1267,
        "name": "ミアレシティ",
        "imageUrl": "/cabt-card-images/1267.webp",
        "supertype": "Trainer",
        "subtypes": [
            "Stadium"
        ],
        "expansion": "M3",
        "collectionNumber": "077/080"
    }
}
