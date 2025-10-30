import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Video, FileText, Headphones, ExternalLink } from "lucide-react"

const resources = [
  {
    type: "article",
    title: "Understanding REM Sleep Cycles",
    source: "Sleep Foundation",
    duration: "8 min read",
    category: "Science",
  },
  {
    type: "video",
    title: "How to Optimize Your Sleep Environment",
    source: "Dr. Matthew Walker",
    duration: "15 min",
    category: "Tips",
  },
  {
    type: "research",
    title: "Impact of Blue Light on Circadian Rhythm",
    source: "Nature Journal",
    duration: "12 min read",
    category: "Research",
  },
  {
    type: "video",
    title: "Sleep Hygiene Best Practices",
    source: "Huberman Lab",
    duration: "22 min",
    category: "Education",
  },
  {
    type: "article",
    title: "The Role of Deep Sleep in Recovery",
    source: "WHOOP",
    duration: "6 min read",
    category: "Performance",
  },
  {
    type: "podcast",
    title: "Sleep Optimization for Athletes",
    source: "The Drive Podcast",
    duration: "45 min",
    category: "Performance",
  },
]

const iconMap = {
  article: BookOpen,
  video: Video,
  research: FileText,
  podcast: Headphones,
}

export function ResourcesGrid() {
  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {resources.map((resource, i) => {
        const Icon = iconMap[resource.type as keyof typeof iconMap]
        return (
          <Card key={i} className="hover:border-primary/50 transition-colors cursor-pointer group">
            <CardContent className="p-6">
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <ExternalLink className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
                </div>

                <div>
                  <Badge variant="secondary" className="mb-2 text-xs">
                    {resource.category}
                  </Badge>
                  <h3 className="font-semibold mb-1 text-balance leading-snug">{resource.title}</h3>
                  <p className="text-sm text-muted-foreground">{resource.source}</p>
                </div>

                <div className="flex items-center justify-between text-sm text-muted-foreground pt-2 border-t border-border">
                  <span className="capitalize">{resource.type}</span>
                  <span>{resource.duration}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
