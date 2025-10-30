import { MobileHeader } from "@/components/mobile-header"
import { MarketsList } from "@/components/markets-list"
import { CreateMarketCard } from "@/components/create-market-card"
import { MarketFilters } from "@/components/market-filters"

export default function MarketsPage() {
  return (
    <div className="min-h-screen bg-background">
      <MobileHeader />

      <main className="px-4 py-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold mb-1 text-balance">Prediction Markets</h1>
          <p className="text-muted-foreground text-sm">Bet on sleep metrics and compete</p>
        </div>

        <CreateMarketCard />

        <MarketFilters />

        <MarketsList />
      </main>
    </div>
  )
}
