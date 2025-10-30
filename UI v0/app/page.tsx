import { MobileHeader } from "@/components/mobile-header"
import { SleepScoreCard } from "@/components/sleep-score-card"
import { SleepChart } from "@/components/sleep-chart"
import { DeviceStatus } from "@/components/device-status"
import { QuickStats } from "@/components/quick-stats"
import { RecentBets } from "@/components/recent-bets"
import { TrendingMarkets } from "@/components/trending-markets"

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background pb-24">
      <MobileHeader />

      <main className="px-4 py-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold mb-1 text-balance">Good morning, Thomas</h1>
          <p className="text-muted-foreground text-sm">Here's how you slept last night</p>
        </div>

        <SleepScoreCard />

        <DeviceStatus />

        <SleepChart />

        <QuickStats />

        <TrendingMarkets />

        <RecentBets />
      </main>
    </div>
  )
}
