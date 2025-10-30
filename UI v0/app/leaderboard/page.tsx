import { MobileHeader } from "@/components/mobile-header"
import { LeaderboardList } from "@/components/leaderboard-list"
import { LeaderboardFilters } from "@/components/leaderboard-filters"
import { UserRank } from "@/components/user-rank"

export default function LeaderboardPage() {
  return (
    <div className="min-h-screen bg-background">
      <MobileHeader />

      <main className="px-4 py-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold mb-1 text-balance">Leaderboard</h1>
          <p className="text-muted-foreground text-sm">See how you rank against other sleepers</p>
        </div>

        <UserRank />

        <LeaderboardFilters />

        <LeaderboardList />
      </main>
    </div>
  )
}
