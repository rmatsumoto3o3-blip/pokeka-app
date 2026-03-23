import { getGlobalDeckAnalyticsAction, getDeckAnalyticsAction } from './app/actions'

async function run() {
    console.log('Testing getGlobalDeckAnalyticsAction:')
    try {
        const res1 = await getGlobalDeckAnalyticsAction()
        console.log(res1.success)
        if (res1.success) {
            console.log('Global Analytics count:', res1.globalAnalytics?.length)
            console.log('Archetype count in analyticsByArchetype:', Object.keys(res1.analyticsByArchetype || {}).length)
        } else {
            console.log('Error:', res1.error)
        }
    } catch (e) {
        console.log('Exception:', e)
    }

    console.log('Testing getDeckAnalyticsAction:')
    try {
        const res2 = await getDeckAnalyticsAction('48539d62-6b9e-4d8a-b772-505e966a1bcb')
        console.log(res2.success)
        if (res2.success) {
            console.log('Analytics count:', res2.analytics?.length)
            console.log('Sample analytics:', res2.analytics?.slice(0, 1))
        } else {
            console.log('Error:', res2.error)
        }
    } catch (e) {
        console.log('Exception:', e)
    }
}

run()
