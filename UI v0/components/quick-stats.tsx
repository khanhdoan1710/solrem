import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Moon, Zap, Target } from "lucide-react"

export function QuickStats() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">This Week</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/5">
          <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
            <Moon className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">Avg Score</p>
            <p className="text-2xl font-bold">83</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/5">
          <div className="h-10 w-10 rounded-full bg-secondary/10 flex items-center justify-center">
            <Zap className="h-5 w-5 text-secondary" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">Streak</p>
            <p className="text-2xl font-bold">12 days</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/5">
          <div className="h-10 w-10 rounded-full bg-accent/10 flex items-center justify-center">
            <Target className="h-5 w-5 text-accent" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-muted-foreground">Goal Progress</p>
            <p className="text-2xl font-bold">6/7</p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
