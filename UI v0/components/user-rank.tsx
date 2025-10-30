"use client"

import { Card } from "@/components/ui/card"
import { Trophy, TrendingUp } from "lucide-react"

export function UserRank() {
  return (
    <Card className="p-4 bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="h-12 w-12 rounded-full bg-primary/20 flex items-center justify-center">
            <Trophy className="h-6 w-6 text-primary" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Your Rank</p>
            <p className="text-2xl font-bold">#47</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-muted-foreground">Total Points</p>
          <div className="flex items-center gap-1">
            <p className="text-2xl font-bold">2,847</p>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </div>
        </div>
      </div>
    </Card>
  )
}
