import React from 'react'

interface AdPlaceholderProps {
    slot?: string
    format?: 'rectangle' | 'horizontal' | 'vertical' | 'responsive'
    label?: string
    className?: string
}

export default function AdPlaceholder({
    slot = '0000000000',
    format = 'responsive',
    label = 'スポンサーリンク',
    className = ''
}: AdPlaceholderProps) {
    // In production, this would be replaced with actual AdSense code or similar.
    // For now, it renders a placeholder box.

    return (
        <div className={`flex flex-col items-center justify-center bg-gray-100 border border-gray-200 rounded-lg overflow-hidden ${className}`}>
            {/* Ad Content Placeholder */}
            <div className="w-full h-full min-h-[250px] flex flex-col items-center justify-center text-gray-400 p-4 text-center">
                <span className="text-xs uppercase tracking-wider mb-2 text-gray-400">{label}</span>
                <div className="w-full max-w-[300px] h-[200px] bg-gray-200 rounded border border-dashed border-gray-300 flex items-center justify-center">
                    <span className="text-xs text-gray-500">広告スペース</span>
                </div>
                <p className="text-[10px] mt-2 text-gray-400">
                    (Google AdSense / Affiliate)
                </p>
            </div>
        </div>
    )
}
