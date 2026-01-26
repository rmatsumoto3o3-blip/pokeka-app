import PublicHeader from '@/components/PublicHeader'
import Footer from '@/components/Footer'

export const metadata = {
    title: 'プライバシーポリシー | PokéLix',
    description: 'PokéLix（ポケリックス）のプライバシーポリシーです。個人情報の取り扱い、Cookie、広告配信について説明しています。',
}

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-white text-gray-900 font-sans">
            <PublicHeader />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
                <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center text-gray-900">プライバシーポリシー</h1>

                <div className="prose prose-pink max-w-none text-gray-700">
                    <section className="mb-8">
                        <h2 className="text-xl md:text-2xl font-bold mb-4 text-gray-800 border-b pb-2">1. はじめに</h2>
                        <p className="mb-4">
                            PokéLix（以下「当サイト」）は、ユーザーの個人情報の保護を重要視し、以下の方針に従って適切に取り扱います。
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl md:text-2xl font-bold mb-4 text-gray-800 border-b pb-2">2. 個人情報の収集について</h2>
                        <p className="mb-4">
                            当サイトでは、お問い合わせやサービス利用登録の際に、名前（ハンドルネーム）、メールアドレス等の個人情報をご登録いただく場合があります。<br />
                            これらの個人情報は、質問に対する回答や必要な情報を電子メール等でご連絡する場合に利用させていただくものであり、個人情報をご提供いただく際の目的以外では利用いたしません。
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl md:text-2xl font-bold mb-4 text-gray-800 border-b pb-2">3. 広告について</h2>
                        <p className="mb-4">
                            当サイトでは、第三者配信の広告サービス（Google AdSense など）を利用しています。<br />
                            このような広告配信事業者は、ユーザーの興味に応じた商品やサービスの広告を表示するため、当サイトや他サイトへのアクセスに関する情報「Cookie」（氏名、住所、メールアドレス、電話番号は含まれません）を使用することがあります。
                        </p>
                        <p className="mb-4">
                            Google AdSense に関して、このプロセスの詳細やこのような情報が広告配信事業者に使用されないようにする方法については、<a href="https://policies.google.com/technologies/ads?hl=ja" target="_blank" rel="noopener noreferrer" className="text-pink-600 hover:underline">Googleのポリシーと規約</a>をご覧ください。
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl md:text-2xl font-bold mb-4 text-gray-800 border-b pb-2">4. アクセス解析ツールについて</h2>
                        <p className="mb-4">
                            当サイトでは、Googleによるアクセス解析ツール「Googleアナリティクス」を利用しています。<br />
                            このGoogleアナリティクスはトラフィックデータの収集のためにCookieを使用しています。このトラフィックデータは匿名で収集されており、個人を特定するものではありません。<br />
                            この機能はCookieを無効にすることで収集を拒否することが出来ますので、お使いのブラウザの設定をご確認ください。
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl md:text-2xl font-bold mb-4 text-gray-800 border-b pb-2">5. 免責事項</h2>
                        <p className="mb-4">
                            当サイトからリンクやバナーなどによって他のサイトに移動された場合、移動先サイトで提供される情報、サービス等について一切の責任を負いません。<br />
                            当サイトのコンテンツ・情報につきまして、可能な限り正確な情報を掲載するよう努めておりますが、誤情報が入り込んだり、情報が古くなっていることもございます。<br />
                            当サイトに掲載された内容によって生じた損害等の一切の責任を負いかねますのでご了承ください。
                        </p>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl md:text-2xl font-bold mb-4 text-gray-800 border-b pb-2">6. プライバシーポリシーの変更について</h2>
                        <p className="mb-4">
                            当サイトは、個人情報に関して適用される日本の法令を遵守するとともに、本ポリシーの内容を適宜見直しその改善に努めます。<br />
                            修正された最新のプライバシーポリシーは常に本ページにて開示されます。
                        </p>
                    </section>

                    <section className="mt-12 text-right text-gray-500 text-sm">
                        <p>2026年1月26日 制定</p>
                    </section>
                </div>
            </div>

            <Footer />
        </div>
    )
}
