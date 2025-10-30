"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Plus } from "lucide-react"

export function CreateMarketCard() {
  return (
    <Card className="sticky top-4">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Create Your Market
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="prediction">Your Prediction</Label>
          <Textarea id="prediction" placeholder="I will get 2+ hours of REM sleep tonight" rows={3} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="metric">Sleep Metric</Label>
          <Select>
            <SelectTrigger id="metric">
              <SelectValue placeholder="Select metric" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="rem">REM Sleep</SelectItem>
              <SelectItem value="deep">Deep Sleep</SelectItem>
              <SelectItem value="score">Sleep Score</SelectItem>
              <SelectItem value="duration">Total Duration</SelectItem>
              <SelectItem value="wakeups">Wake-ups</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="amount">Initial Pool</Label>
          <div className="flex gap-2">
            <Input id="amount" type="number" placeholder="10" />
            <Select defaultValue="sol">
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sol">SOL</SelectItem>
                <SelectItem value="usdc">USDC</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="odds">Target Odds</Label>
          <Input id="odds" type="number" placeholder="2.5" step="0.1" />
        </div>

        <Button className="w-full" size="lg">
          Create Market
        </Button>

        <p className="text-xs text-muted-foreground text-center">
          Market will be settled automatically based on your device data
        </p>
      </CardContent>
    </Card>
  )
}
