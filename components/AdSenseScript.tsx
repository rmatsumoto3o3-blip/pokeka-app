'use client';

import { useEffect, useState } from 'react';
import Script from 'next/script';

declare global {
    interface Window {
        adsbygoogle: any[];
        __pokelixPageLevelAdsEnabled?: boolean;
    }
}

export default function AdSenseScript() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        // AdSense preview and Auto Ads can conflict with Next.js hydration.
        // Delaying the script load until after the component has mounted on the client
        // helps avoid "Application error: a client-side exception has occurred".
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <Script
            async
            src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2951381820280282"
            crossOrigin="anonymous"
            strategy="lazyOnload"
            onReady={() => {
                // enable_page_level_ads はページにつき1回のみ呼び出し可能
                if (window.__pokelixPageLevelAdsEnabled) return;
                window.__pokelixPageLevelAdsEnabled = true;
                try {
                    // 画面下部固定のアンカー広告のみ有効化（全画面のvignette広告は出さない）
                    (window.adsbygoogle = window.adsbygoogle || []).push({
                        google_ad_client: 'ca-pub-2951381820280282',
                        enable_page_level_ads: true,
                        overlays: { bottom: true },
                    });
                } catch (e) {
                    console.error('AdSense anchor ad error:', e);
                }
            }}
        />
    );
}
