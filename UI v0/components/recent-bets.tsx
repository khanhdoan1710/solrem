import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowRight } from "lucide-react"
import Link from "next/link"

const bets = [
  {
    prediction: "REM > 1.5 hours",
    amount: "5 SOL",
    status: "won",
    payout: "+8.5 SOL",
  },
  {
    prediction: "Score above 85",
    amount: "10 USDC",
    status: "pending",
    payout: null,
  },
  {
    prediction: "Deep sleep > 2h",
    amount: "3 SOL",
    status: "lost",
    payout: null,
  },
]

export function RecentBets() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Your Recent Bets</CardTitle>
          <Link href="/markets" prefetch={false}>
            <Button variant="ghost" size="sm">
              View All
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {bets.map((bet, i) => (
          <div key={i} className="p-4 rounded-lg border border-border">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <p className="font-medium mb-1">{bet.prediction}</p>
                <p className="text-sm text-muted-foreground">Bet: {bet.amount}</p>
              </div>
              <Badge
                variant={bet.status === "won" ? "default" : bet.status === "pending" ? "secondary" : "outline"}
                className={
                  bet.status === "won"
                    ? "bg-accent text-accent-foreground"
                    : bet.status === "pending"
                      ? "bg-secondary text-secondary-foreground"
                      : "text-muted-foreground"
                }
              >
                {bet.status}
              </Badge>
            </div>
            {bet.payout && <p className="text-sm font-semibold text-accent">{bet.payout}</p>}
          </div>
        ))}

        <Button className="w-full" size="lg">
          Create New Market
        </Button>
      </CardContent>
    </Card>
  )
}
