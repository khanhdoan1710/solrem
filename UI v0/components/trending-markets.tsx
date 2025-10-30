import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, ArrowRight } from "lucide-react"
import Link from "next/link"

const markets = [
  {
    user: "Sarah M.",
    prediction: "Will get 2+ hours REM",
    odds: "2.5x",
    pool: "45 SOL",
    trending: true,
  },
  {
    user: "Mike T.",
    prediction: "Sleep score above 90",
    odds: "1.8x",
    pool: "32 USDC",
    trending: false,
  },
  {
    user: "Alex K.",
    prediction: "Deep sleep over 2.5h",
    odds: "3.2x",
    pool: "28 SOL",
    trending: true,
  },
]

export function TrendingMarkets() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Trending Markets</CardTitle>
          <Link href="/markets" prefetch={false}>
            <Button variant="ghost" size="sm">
              View All
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {markets.map((market, i) => (
          <div
            key={i}
            className="p-4 rounded-lg border border-border hover:border-primary/50 transition-colors cursor-pointer"
          >
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium">{market.user}</span>
                  {market.trending && (
                    <Badge variant="secondary" className="bg-accent/20 text-accent text-xs">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      Hot
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{market.prediction}</p>
              </div>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Pool: {market.pool}</span>
              <span className="font-semibold text-primary">{market.odds}</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
