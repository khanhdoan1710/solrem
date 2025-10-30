import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Play, BookOpen } from "lucide-react"

export function FeaturedResource() {
  return (
    <Card className="mb-8 overflow-hidden bg-gradient-to-br from-primary/10 via-secondary/5 to-accent/10 border-primary/20">
      <CardContent className="p-0">
        <div className="grid md:grid-cols-2 gap-6 p-6">
          <div className="space-y-4">
            <Badge variant="secondary" className="bg-accent text-accent-foreground">
              Featured
            </Badge>
            <h2 className="text-3xl font-bold text-balance">The Science of Sleep Optimization</h2>
            <p className="text-muted-foreground leading-relaxed">
              Learn evidence-based strategies to improve your sleep quality from leading sleep researchers. This
              comprehensive guide covers everything from circadian rhythms to sleep environment optimization.
            </p>
            <div className="flex gap-3">
              <Button size="lg">
                <BookOpen className="h-4 w-4 mr-2" />
                Read Article
              </Button>
              <Button size="lg" variant="outline">
                <Play className="h-4 w-4 mr-2" />
                Watch Video
              </Button>
            </div>
          </div>
          <div className="relative h-64 md:h-auto rounded-lg overflow-hidden bg-muted">
            <img src="/peaceful-sleep.png" alt="Sleep optimization" className="object-cover w-full h-full" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
