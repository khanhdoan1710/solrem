import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Watch, Plus } from "lucide-react"

export function DeviceStatus() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Connected Devices</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <Watch className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">WHOOP 4.0</p>
              <p className="text-sm text-muted-foreground">Last sync: 2m ago</p>
            </div>
          </div>
          <Badge variant="secondary" className="bg-accent/20 text-accent">
            Active
          </Badge>
        </div>

        <Button variant="outline" className="w-full bg-transparent" size="lg">
          <Plus className="h-4 w-4 mr-2" />
          Connect Device
        </Button>

        <div className="pt-4 border-t border-border">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-muted-foreground">Total Points</span>
            <span className="text-2xl font-bold text-primary">12,450</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Rank</span>
            <span className="text-lg font-semibold">#127</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
