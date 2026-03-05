import React, { useEffect } from 'react'

interface AdPlaceholderProps {
    slot?: string
    format?: 'rectangle' | 'horizontal' | 'vertical' | 'responsive' | 'auto'
    label?: string
    className?: string
}

declare global {
    interface Window {
        adsbygoogle: any[]
    }
}

export default function AdPlaceholder({
    slot = '1093986865',
    format = 'auto',
    label = 'スポンサーリンク',
    className = ''
}: AdPlaceholderProps) {
    useEffect(() => {
        try {
            if (typeof window !== 'undefined') {
                (window.adsbygoogle = window.adsbygoogle || []).push({});
            }
        } catch (e) {
            console.error('AdSense error:', e);
        }
    }, [slot]); // Re-run if slot changes (though usually slots don't change for a component instance)

    return (
        <div className={`flex flex-col items-center justify-center ${className}`}>
            <span className="text-[10px] uppercase tracking-[0.2em] mb-2 text-gray-400 font-bold">{label}</span>
            <div className="w-full flex items-center justify-center overflow-hidden min-h-[100px]">
                <ins className="adsbygoogle"
                    style={{ display: 'block', width: '100%', minWidth: '250px' }}
                    data-ad-client="ca-pub-2951381820280282"
                    data-ad-slot={slot}
                    data-ad-format={format}
                    data-full-width-responsive="true"></ins>
            </div>
        </div>
    );
}
