import PublicHeader from '@/components/PublicHeader'
import Footer from '@/components/Footer'

export const metadata = {
    title: '利用規約 | PokéLix',
    description: 'PokéLix（ポケリックス）の利用規約です。',
}

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-white text-gray-900 font-sans">
            <PublicHeader />

            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
                <h1 className="text-3xl md:text-4xl font-bold mb-8 text-center text-gray-900">利用規約</h1>

                <div className="prose prose-pink max-w-none text-gray-700">
                    <p className="mb-6">
                        この利用規約（以下，「本規約」といいます。）は，PokéLix（以下，「当サイト」といいます。）がこのウェブサイト上で提供するサービス（以下，「本サービス」といいます。）の利用条件を定めるものです。登録ユーザーの皆さま（以下，「ユーザー」といいます。）には，本規約に従って，本サービスをご利用いただきます。
                    </p>

                    <section className="mb-8">
                        <h2 className="text-xl md:text-2xl font-bold mb-4 text-gray-800 border-b pb-2">第1条（適用）</h2>
                        <ol className="list-decimal pl-5 space-y-2">
                            <li>本規約は，ユーザーと当サイトとの間の本サービスの利用に関わる一切の関係に適用されるものとします。</li>
                            <li>当サイトは本サービスに関し，本規約のほか，ご利用にあたってのルール等，各種の定め（以下，「個別規定」といいます。）をすることがあります。これら個別規定はその名称のいかんに関わらず，本規約の一部を構成するものとします。</li>
                            <li>本規約の規定が前項の個別規定の規定と矛盾する場合には，個別規定において特段の定めなき限り，個別規定の規定が優先されるものとします。</li>
                        </ol>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl md:text-2xl font-bold mb-4 text-gray-800 border-b pb-2">第2条（利用登録）</h2>
                        <ol className="list-decimal pl-5 space-y-2">
                            <li>本サービスにおいては，登録希望者が本規約に同意の上，当サイトの定める方法によって利用登録を申請し，当サイトがこれを承認することによって，利用登録が完了するものとします。</li>
                            <li>当サイトは，利用登録の申請者に以下の事由があると判断した場合，利用登録の申請を承認しないことがあり，その理由については一切の開示義務を負わないものとします。
                                <ul className="list-disc pl-5 mt-2 space-y-1">
                                    <li>利用登録の申請に際して虚偽の事項を届け出た場合</li>
                                    <li>本規約に違反したことがある者からの申請である場合</li>
                                    <li>その他，当サイトが利用登録を相当でないと判断した場合</li>
                                </ul>
                            </li>
                        </ol>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl md:text-2xl font-bold mb-4 text-gray-800 border-b pb-2">第3条（禁止事項）</h2>
                        <p className="mb-2">ユーザーは，本サービスの利用にあたり，以下の行為をしてはなりません。</p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>法令または公序良俗に違反する行為</li>
                            <li>犯罪行為に関連する行為</li>
                            <li>本サービスの内容等，本サービスに含まれる著作権，商標権ほか知的財産権を侵害する行為</li>
                            <li>当サイト，ほかのユーザー，またはその他第三者のサーバーまたはネットワークの機能を破壊したり，妨害したりする行為</li>
                            <li>本サービスによって得られた情報を商業的に利用する行為</li>
                            <li>当サイトのサービスの運営を妨害するおそれのある行為</li>
                            <li>不正アクセスをし，またはこれを試みる行為</li>
                            <li>他のユーザーに関する個人情報等を収集または蓄積する行為</li>
                            <li>不正な目的を持って本サービスを利用する行為</li>
                            <li>他のユーザーに成りすます行為</li>
                            <li>他人に不利益，損害，不快感を与える行為</li>
                            <li>当サイトが許諾しない本サービス上での宣伝，広告，勧誘，または営業行為</li>
                            <li>その他，当サイトが不適切と判断する行為</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl md:text-2xl font-bold mb-4 text-gray-800 border-b pb-2">第4条（本サービスの提供の停止等）</h2>
                        <p className="mb-2">当サイトは，以下のいずれかの事由があると判断した場合，ユーザーに事前に通知することなく本サービスの全部または一部の提供を停止または中断することができるものとします。</p>
                        <ul className="list-disc pl-5 space-y-2">
                            <li>本サービスにかかるコンピュータシステムの保守点検または更新を行う場合</li>
                            <li>地震，落雷，火災，停電または天災などの不可抗力により，本サービスの提供が困難となった場合</li>
                            <li>コンピュータまたは通信回線等が事故により停止した場合</li>
                            <li>その他，当サイトが本サービスの提供が困難と判断した場合</li>
                        </ul>
                    </section>

                    <section className="mb-8">
                        <h2 className="text-xl md:text-2xl font-bold mb-4 text-gray-800 border-b pb-2">第5条（免責事項）</h2>
                        <ol className="list-decimal pl-5 space-y-2">
                            <li>当サイトは，本サービスに事実上または法律上の瑕疵（安全性，信頼性，正確性，完全性，有効性，特定の目的への適合性，セキュリティなどに関する欠陥，エラーやバグ，権利侵害などを含みます。）がないことを明示的にも黙示的にも保証しておりません。</li>
                            <li>当サイトは，本サービスに起因してユーザーに生じたあらゆる損害について、当サイトの故意又は重過失による場合を除き、一切の責任を負いません。</li>
                        </ol>
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
