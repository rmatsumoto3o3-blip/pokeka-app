import PublicHeader from '@/components/PublicHeader'
import Footer from '@/components/Footer'

export const metadata = {
    title: 'PokéLix（ポケリス）について | ポケモンカード情報局',
    description: 'ポケカ戦績管理アプリ「PokéLix（ポケリス）」の開発背景、ビジョン、運営情報について。データに基づいたポケカライフをサポートします。',
}

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-white text-gray-900 font-sans">
            <PublicHeader />

            <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
                <div className="text-center mb-16">
                    <h1 className="text-4xl md:text-5xl font-extrabold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-pink-500 to-purple-600">
                        About PokéLix
                    </h1>
                    <p className="text-xl text-gray-600 font-medium">「データ」で、ポケカはもっと楽しくなる。</p>
                </div>

                <div className="prose prose-pink max-w-none text-gray-700 leading-loose">
                    <section className="mb-12">
                        <h2 className="text-2xl font-bold mb-6 text-gray-900 border-l-4 border-pink-500 pl-4">PokéLix（ポケリス）とは？</h2>
                        <p className="mb-6">
                            PokéLix（ポケリス）は、ポケモンカード（ポケカ）プレイヤーのために開発された、次世代の戦績管理・分析プラットフォームです。
                            単に勝敗を記録するだけでなく、膨大な対戦データから「どのデッキが今、本当に強いのか」「自分のデッキにはどのカードが必要なのか」を可視化し、プレイヤーの直感を「確信」へと変えることを目的としています。
                        </p>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-2xl font-bold mb-6 text-gray-900 border-l-4 border-purple-500 pl-4">開発に至った背景</h2>
                        <p className="mb-6">
                            現代のポケモンカードシーンは、凄まじいスピードで環境（メタクイック）が変化します。
                            SNSやYouTubeには毎日多くの「優勝レシピ」が流れてきますが、それらを目にするだけでは「なぜそのカードが入っているのか」「自分の地域やジムバトルで本当に勝てるのか」を判断するのは容易ではありません。
                        </p>
                        <p className="mb-6">
                            開発者自身も一人のプレイヤーとして、「一人回しをもっと効率化したい」「自分の対戦データを資産として残したい」という強い想いがありました。
                            既存のツールでは難しかった「特定カードの採用率分析」や「メガルカリオexのような特殊な効果のシミュレーション」を誰でも簡単に行える場所を作りたい。
                            そんな純粋な情熱からPokéLixは誕生しました。
                        </p>
                    </section>

                    <section className="mb-12 bg-pink-50 p-8 rounded-2xl border border-pink-100">
                        <h2 className="text-2xl font-bold mb-6 text-gray-900">PokéLixが提供する価値</h2>
                        <ul className="space-y-4 list-none pl-0">
                            <li className="flex items-start gap-3">
                                <span className="text-pink-500 text-xl">✔</span>
                                <div>
                                    <strong className="block text-gray-900">圧倒的な分析スピード</strong>
                                    デッキコードを入力するだけで、採用カードの傾向を瞬時にデータ化。
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="text-pink-500 text-xl">✔</span>
                                <div>
                                    <strong className="block text-gray-900">「一人回し」をデジタルで拡張</strong>
                                    物理的なカードを広げる必要はありません。ブラウザ一つで、いつでもどこでも理想の動きをシミュレーションできます。
                                </div>
                            </li>
                            <li className="flex items-start gap-3">
                                <span className="text-pink-500 text-xl">✔</span>
                                <div>
                                    <strong className="block text-gray-900">プレイヤー同士の知見共有</strong>
                                    ベータテスターの皆様と共に、常に最新のカードロジックや統計手法を取り入れ、進化し続けています。
                                </div>
                            </li>
                        </ul>
                    </section>

                    <section className="mb-12">
                        <h2 className="text-2xl font-bold mb-6 text-gray-900 border-l-4 border-blue-500 pl-4">運営者情報</h2>
                        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
                            <table className="w-full text-sm">
                                <tbody>
                                    <tr className="border-b border-gray-200">
                                        <th className="text-left py-3 text-gray-500 font-medium w-32">運営元</th>
                                        <td className="py-3 font-bold">株式会社3O3 / Rii</td>
                                    </tr>
                                    <tr className="border-b border-gray-200">
                                        <th className="text-left py-3 text-gray-500 font-medium w-32">所在地</th>
                                        <td className="py-3 text-gray-700">日本（詳細はお問い合わせ時に開示）</td>
                                    </tr>
                                    <tr className="border-b border-gray-200">
                                        <th className="text-left py-3 text-gray-500 font-medium w-32">事業内容</th>
                                        <td className="py-3 text-gray-700">Webアプリケーション開発・ポケモンカード情報メディアの運営</td>
                                    </tr>
                                    <tr>
                                        <th className="text-left py-3 text-gray-500 font-medium w-32">連絡先</th>
                                        <td className="py-3 text-gray-700">
                                            <a href="/contact" className="text-pink-600 hover:underline">お問い合わせフォーム</a> 参照
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>

                <div className="mt-20 text-center">
                    <p className="text-gray-500 italic mb-8">
                        PokéLixは、ファン有志による非公式サイトであり、株式会社ポケモン様、任天堂株式会社様とは一切関係ありません。
                    </p>
                    <a href="/" className="inline-flex items-center justify-center px-8 py-3 bg-gray-900 text-white font-bold rounded-lg hover:bg-gray-800 transition shadow-lg">
                        トップへ戻る
                    </a>
                </div>
            </main>

            <Footer />
        </div>
    )
}
