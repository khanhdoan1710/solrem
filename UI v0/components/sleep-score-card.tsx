import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Award } from "lucide-react"

export function SleepScoreCard() {
  return (
    <Card className="bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 border-primary/20">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Last Night's Sleep</CardTitle>
          <Badge variant="secondary" className="bg-accent text-accent-foreground">
            <Award className="h-3 w-3 mr-1" />
            +250 pts
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          <div>
            <div className="flex items-baseline gap-3 mb-2">
              <span className="text-6xl font-bold text-primary">92</span>
              <span className="text-2xl text-muted-foreground">/100</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <TrendingUp className="h-4 w-4 text-accent" />
              <span className="text-accent font-medium">+8 from yesterday</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border/50">
            <div>
              <p className="text-sm text-muted-foreground mb-1">Duration</p>
              <p className="text-2xl font-semibold">7h 42m</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">REM Sleep</p>
              <p className="text-2xl font-semibold">1h 54m</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-1">Deep Sleep</p>
              <p className="text-2xl font-semibold">2h 18m</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full" style={{ width: "92%" }} />
            </div>
            <span className="text-sm font-medium text-primary">Excellent</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
