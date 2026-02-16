export default function Loading() {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-2.5">
            <div className="relative w-24 h-24 mb-4">
                <div className="absolute inset-0 border-8 border-gray-200 rounded-full"></div>
                <div className="absolute inset-0 border-8 border-pink-500 rounded-full border-t-transparent animate-spin"></div>
            </div>
            <h2 className="text-xl font-bold text-gray-700 animate-pulse">
                Loading PokéLix...
            </h2>
            <p className="text-gray-500 text-sm mt-2">
                最新のデッキデータを取得中...
            </p>
        </div>
    )
}
