import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { TrendingUp, Clock } from "lucide-react"

const markets = [
  {
    id: 1,
    user: "Sarah Mitchell",
    avatar: "SM",
    prediction: "Will achieve 2+ hours of REM sleep tonight",
    description: "Based on my average of 1.5h REM over the past week",
    odds: "2.5x",
    pool: "45 SOL",
    participants: 12,
    timeLeft: "8h 23m",
    trending: true,
  },
  {
    id: 2,
    user: "Mike Thompson",
    avatar: "MT",
    prediction: "Sleep score will be above 90",
    description: "Trying a new sleep routine tonight",
    odds: "1.8x",
    pool: "32 USDC",
    participants: 8,
    timeLeft: "6h 45m",
    trending: false,
  },
  {
    id: 3,
    user: "Alex Kim",
    avatar: "AK",
    prediction: "Deep sleep will exceed 2.5 hours",
    description: "New mattress arrived today, feeling confident",
    odds: "3.2x",
    pool: "28 SOL",
    participants: 15,
    timeLeft: "9h 12m",
    trending: true,
  },
  {
    id: 4,
    user: "Emma Davis",
    avatar: "ED",
    prediction: "Will wake up less than 2 times",
    description: "Implementing new bedtime routine",
    odds: "2.1x",
    pool: "18 USDC",
    participants: 6,
    timeLeft: "7h 30m",
    trending: false,
  },
]

export function MarketsList() {
  return (
    <div className="space-y-4">
      {markets.map((market) => (
        <Card key={market.id} className="hover:border-primary/50 transition-colors">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <Avatar className="h-12 w-12">
                <AvatarFallback className="bg-primary/10 text-primary font-semibold">{market.avatar}</AvatarFallback>
              </Avatar>

              <div className="flex-1 space-y-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold">{market.user}</span>
                    {market.trending && (
                      <Badge variant="secondary" className="bg-accent/20 text-accent text-xs">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        Trending
                      </Badge>
                    )}
                  </div>
                  <h3 className="text-lg font-semibold mb-1 text-balance">{market.prediction}</h3>
                  <p className="text-sm text-muted-foreground">{market.description}</p>
                </div>

                <div className="flex items-center gap-6 text-sm">
                  <div>
                    <span className="text-muted-foreground">Pool: </span>
                    <span className="font-semibold">{market.pool}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Odds: </span>
                    <span className="font-semibold text-primary">{market.odds}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">{market.participants} participants</span>
                  </div>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{market.timeLeft}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button size="sm" className="flex-1">
                    Place Bet
                  </Button>
                  <Button size="sm" variant="outline">
                    View Details
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
