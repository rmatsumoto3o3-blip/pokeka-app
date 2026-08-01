import { redirect } from 'next/navigation'

// 環境デッキ一覧（個別デッキリスト）は公開を終了。TOPへ恒久リダイレクト。
export default function DecksPage() {
    redirect('/')
}
