"use client"

import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

export function LeaderboardFilters() {
  return (
    <Tabs defaultValue="weekly" className="w-full">
      <TabsList className="w-full grid grid-cols-3">
        <TabsTrigger value="daily">Daily</TabsTrigger>
        <TabsTrigger value="weekly">Weekly</TabsTrigger>
        <TabsTrigger value="all-time">All Time</TabsTrigger>
      </TabsList>
    </Tabs>
  )
}
