import type { Metadata } from 'next'
import Link from 'next/link'
import PublicHeader from '@/components/PublicHeader'
import Footer from '@/components/Footer'
import ChampionsTool from '@/components/ChampionsTool'

export const metadata: Metadata = {
    title: 'ポケチャン ダメージ計算・構築ツール',
    description: 'ポケモンチャンピオンズのダメージ計算・パーティ構築・選出補助が無料。個体値31固定・能力ポイント(1ヶ所32/合計66)・性格補正・持ち物・特性・天候/壁/急所まで反映。相手のHP％から振りを逆算、相手パーティに有利な選出も提案します。',
    keywords: ['ポケモンチャンピオンズ ダメージ計算', 'ポケチャン ダメージ計算', 'ポケチャン ダメ計', 'ポケチャン 計算機', 'ポケモンチャンピオンズ 計算機', 'ポケモンチャンピオンズ パーティ構築', 'ポケチャン 構築', 'ポケチャン 選出', 'ポケチャン 能力ポイント', 'ポケチャン 努力値', 'ポケチャン 個体値', 'ポケチャン 性格補正', 'ポケチャン 持ち物', 'ポケチャン タイプ相性', 'ポケチャン 弱点', 'ポケモンチャンピオンズ 攻略'],
    openGraph: {
        title: 'ポケチャン ダメージ計算・構築ツール | PokéLix（ポケリス）',
        description: 'ポケモンチャンピオンズのダメージ計算・パーティ構築・選出補助・振り逆算が無料。能力ポイント・性格・持ち物・特性・天候まで反映。',
        url: 'https://www.pokelix.jp/champions',
        siteName: 'PokéLix（ポケリス）',
        locale: 'ja_JP',
        type: 'website',
        images: [{ url: '/api/og?title=ポケチャン ダメージ計算・構築ツール&desc=ダメージ計算・パーティ構築・選出補助・振り逆算が無料', width: 1200, height: 630 }],
    },
    twitter: {
        card: 'summary_large_image',
        title: 'ポケチャン ダメージ計算・構築ツール | PokéLix',
        description: 'ポケモンチャンピオンズのダメージ計算・パーティ構築・選出・逆算が無料。',
        images: ['/api/og?title=ポケチャン ダメージ計算・構築ツール&desc=ダメージ計算・パーティ構築・選出補助・振り逆算が無料'],
    },
    alternates: { canonical: 'https://www.pokelix.jp/champions' },
}

// よくある質問（可視のFAQセクションと同一内容＝FAQPage構造化データ）
const faqs = [
    {
        q: 'ポケモンチャンピオンズのダメージ計算はどうやりますか？',
        a: '攻撃側・防御側のポケモンを選び、技・性格補正・能力ポイント・持ち物・特性を登録すると、ダメージ乱数（最小〜最大）とHP割合、確定◯発／乱数◯発を自動で計算します。天候・フィールド・壁・やけど・急所・能力ランクの状況にも対応しています。',
    },
    {
        q: '能力ポイント（努力値）の振り分けの上限はいくつですか？',
        a: 'ポケモンチャンピオンズでは1つのステータスに最大32、6つの合計で最大66まで振れます。本ツールも同じ上限で計算し、個体値は31固定・レベル50で実数値（HP・こうげき・ぼうぎょ・とくこう・とくぼう・すばやさ）を算出します。',
    },
    {
        q: '相手の能力ポイントの振り（努力値）は分かりますか？',
        a: '「逆算」タブで、相手のHPが減った割合（％）を入力すると、その結果と整合する相手のHP・ぼうぎょの能力ポイント配分を絞り込めます。複数回の観測を重ねるほど候補が絞れます。',
    },
    {
        q: '使えるポケモンや技は本家と同じですか？',
        a: 'ポケモンチャンピオンズで使用可能なポケモンと技（攻撃技・変化技あわせて約500種）に絞って収録しています。技はポケモンごとの習得技のみを、タイプ別に選べます。',
    },
    {
        q: '料金やアカウント登録は必要ですか？',
        a: '完全無料・ログイン不要です。作成したパーティは3つまでお使いのブラウザ内（ローカル）に保存され、サーバーには送信されません。1体ずつの入れ替えや、パーティ単位のリセットもできます。',
    },
    {
        q: '対戦相手への有利・不利（選出）は分かりますか？',
        a: '「選出」タブに相手のパーティ6体を入れると、自分のパーティのどのポケモンがタイプ相性で有利かをスコア順に提案します。構築画面では、攻めで足りないタイプ（サブウェポン候補）も表示します。',
    },
]

// ダメージ計算の手順（可視の使い方セクションと同一＝HowTo構造化データ）
const howToSteps = [
    { name: 'パーティにポケモンを登録', text: '「パーティ構築」でポケモンを追加し、性格・能力ポイント・持ち物・特性・技を設定します（名前だけの登録でもOK）。' },
    { name: '攻撃側・防御側と技を選ぶ', text: '「ダメージ計算」タブで、攻撃するポケモンと技、受ける側のポケモンを選びます。' },
    { name: '場・状況を設定', text: '天候・フィールド・壁・やけど・急所・能力ランクなど、対戦の状況を反映します。' },
    { name: '結果を確認', text: 'ダメージ乱数（最小〜最大）・HP割合・確定◯発／乱数◯発が表示されます。' },
]

const structuredData = [
    {
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: 'ポケチャン ダメージ計算・構築ツール | PokéLix',
        url: 'https://www.pokelix.jp/champions',
        description: 'ポケモンチャンピオンズのダメージ計算・パーティ構築・選出補助・振り逆算ができる無料ツール。',
        applicationCategory: 'GameApplication',
        operatingSystem: 'Web',
        inLanguage: 'ja',
        isAccessibleForFree: true,
        offers: { '@type': 'Offer', price: '0', priceCurrency: 'JPY' },
        publisher: { '@type': 'Organization', name: 'PokéLix', logo: { '@type': 'ImageObject', url: 'https://www.pokelix.jp/icon.png' } },
    },
    {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            { '@type': 'ListItem', position: 1, name: 'ホーム', item: 'https://www.pokelix.jp/' },
            { '@type': 'ListItem', position: 2, name: 'ポケモンチャンピオンズ ツール', item: 'https://www.pokelix.jp/champions' },
        ],
    },
    {
        '@context': 'https://schema.org',
        '@type': 'HowTo',
        name: 'ポケモンチャンピオンズでダメージ計算をする方法',
        description: '登録したポケモンの構成でダメージ乱数・HP割合・確定/乱数◯発を計算する手順。',
        step: howToSteps.map((s, i) => ({ '@type': 'HowToStep', position: i + 1, name: s.name, text: s.text })),
    },
    {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map(f => ({
            '@type': 'Question',
            name: f.q,
            acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
    },
]

export default function ChampionsPage() {
    return (
        <div className="min-h-screen bg-slate-50">
            <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
            <PublicHeader game="champions" />
            <main className="mx-auto max-w-6xl px-4 py-6">
                <nav className="mb-4 text-xs text-gray-400" aria-label="パンくずリスト">
                    <Link href="/" className="text-sky-600">ホーム</Link> › ポケモンチャンピオンズ ツール
                </nav>
                <h1 className="text-2xl font-bold text-gray-900 md:text-3xl">ポケモンチャンピオンズ ダメージ計算・構築ツール</h1>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-gray-600">
                    <b>ポケモンチャンピオンズ（ポケチャン）</b>用の無料ツールです。パーティ構築（3つ保存）・<b>ダメージ計算</b>・<b>選出補助</b>・相手の<b>振り逆算</b>をまとめて行えます。
                    個体値31固定・<b>能力ポイント（1ヶ所32／合計66）</b>・<b>性格補正</b>・持ち物・特性に対応し、天候・フィールド・壁・急所・ランクまで反映します。
                    データはお使いのブラウザにのみ保存され、ログイン不要・完全無料です。
                </p>
                <ul className="mt-3 flex flex-wrap gap-2 text-xs">
                    {['パーティ構築（3保存）', 'ダメージ計算', '弱点と補完', '攻めのタイプ候補', '相手の振り逆算', '有利な選出提案'].map(t => (
                        <li key={t} className="rounded-full border border-sky-200 bg-sky-50 px-3 py-1 font-medium text-sky-700">{t}</li>
                    ))}
                </ul>

                <div className="mt-5 overflow-hidden rounded-2xl border border-slate-200 bg-[#0f1218] shadow-sm">
                    <ChampionsTool />
                </div>

                <section className="mt-8 max-w-3xl text-sm leading-7 text-gray-600">
                    <h2 className="text-lg font-bold text-gray-900">このツールでできること</h2>
                    <p className="mt-2"><b>ダメージ計算</b>：登録したポケモンの構成（性格補正・能力ポイント・持ち物・特性）でダメージ乱数・HP割合・確定/乱数◯発を算出。天候・壁・やけど・急所・能力ランクにも対応しています。</p>
                    <p className="mt-2"><b>パーティ構築と弱点補完</b>：使いたいポケモンを選ぶと、パーティの弱点タイプと、それを半減・無効で受けられる味方がいるかを表示。<b>攻めで足りない攻撃タイプ（サブウェポン候補）</b>も提案します。</p>
                    <p className="mt-2"><b>選出補助</b>：相手のパーティ6体を入れると、自分のどのポケモンで選出すると<b>タイプ相性で有利か</b>をスコア順に提案します。</p>
                    <p className="mt-2"><b>振り逆算</b>：相手のHPが減った割合（％）から、相手の<b>HP・ぼうぎょの能力ポイント配分</b>を絞り込みます。</p>
                </section>

                <section className="mt-8 max-w-3xl text-sm leading-7 text-gray-600">
                    <h2 className="text-lg font-bold text-gray-900">ダメージ計算のやり方（かんたん4ステップ）</h2>
                    <ol className="mt-3 space-y-2">
                        {howToSteps.map((s, i) => (
                            <li key={s.name} className="flex gap-3">
                                <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-emerald-600 text-xs font-bold text-white">{i + 1}</span>
                                <span><b className="text-gray-800">{s.name}</b>：{s.text}</span>
                            </li>
                        ))}
                    </ol>
                </section>

                <section className="mt-8 max-w-3xl text-sm leading-7 text-gray-600">
                    <h2 className="text-lg font-bold text-gray-900">能力ポイント・個体値・性格補正について</h2>
                    <p className="mt-2">
                        ポケモンチャンピオンズはレベル50・シングル前提の対戦です。実数値は<b>個体値31固定</b>を前提に、<b>能力ポイント（1ヶ所最大32・合計最大66）</b>と<b>性格補正</b>を反映して決まります。
                        本ツールは同じルールで各ステータスの実数値を自動計算するので、能力ポイントの振り分けを変えながら「この技で相手を確定◯発にできるか」をその場で確認できます。
                    </p>
                </section>

                <section className="mt-8 max-w-3xl">
                    <h2 className="text-lg font-bold text-gray-900">よくある質問（ポケチャン ダメージ計算・構築）</h2>
                    <div className="mt-3 space-y-3">
                        {faqs.map(f => (
                            <details key={f.q} className="rounded-lg border border-slate-200 bg-white p-3">
                                <summary className="cursor-pointer text-sm font-bold text-gray-800">{f.q}</summary>
                                <p className="mt-2 text-sm leading-7 text-gray-600">{f.a}</p>
                            </details>
                        ))}
                    </div>
                </section>

                <p className="mt-8 max-w-3xl text-xs leading-6 text-gray-400">
                    ※ ポケモン・種族値・タイプ・技・特性は公開データ（PokéAPI等）を基に集計しています。使用率は暫定値、天候連動特性など一部の効果は順次対応予定です。ゲーム内の最新の調整とは差が出る場合があります。
                </p>
            </main>
            <Footer game="pokemon" />
        </div>
    )
}
