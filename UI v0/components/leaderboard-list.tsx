"use client"

import { Card } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Trophy, Medal } from "lucide-react"

const leaderboardData = [
  { rank: 1, name: "Sarah Chen", points: 4892, streak: 28, avatar: "SC" },
  { rank: 2, name: "Mike Johnson", points: 4651, streak: 21, avatar: "MJ" },
  { rank: 3, name: "Emma Davis", points: 4423, streak: 19, avatar: "ED" },
  { rank: 4, name: "Alex Rivera", points: 4201, streak: 15, avatar: "AR" },
  { rank: 5, name: "Chris Lee", points: 3987, streak: 12, avatar: "CL" },
  { rank: 6, name: "Jordan Kim", points: 3756, streak: 18, avatar: "JK" },
  { rank: 7, name: "Taylor Swift", points: 3542, streak: 9, avatar: "TS" },
  { rank: 8, name: "Morgan Blake", points: 3401, streak: 14, avatar: "MB" },
]

export function LeaderboardList() {
  return (
    <div className="space-y-3">
      {leaderboardData.map((user) => (
        <Card key={user.rank} className="p-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8">
              {user.rank === 1 && <Trophy className="h-5 w-5 text-yellow-500" />}
              {user.rank === 2 && <Medal className="h-5 w-5 text-gray-400" />}
              {user.rank === 3 && <Medal className="h-5 w-5 text-amber-600" />}
              {user.rank > 3 && <span className="text-sm font-semibold text-muted-foreground">#{user.rank}</span>}
            </div>

            <Avatar className="h-10 w-10">
              <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                {user.avatar}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1 min-w-0">
              <p className="font-semibold text-sm truncate">{user.name}</p>
              <p className="text-xs text-muted-foreground">{user.streak} day streak</p>
            </div>

            <div className="text-right">
              <p className="font-bold text-sm">{user.points.toLocaleString()}</p>
              <p className="text-xs text-muted-foreground">points</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  )
}
