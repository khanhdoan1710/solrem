"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"

export function ResourceFilters() {
  return (
    <div className="mb-6 space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search resources..." className="pl-10" />
      </div>

      <div className="flex gap-2 flex-wrap">
        <Button variant="default" size="sm">
          All
        </Button>
        <Button variant="outline" size="sm">
          Articles
        </Button>
        <Button variant="outline" size="sm">
          Videos
        </Button>
        <Button variant="outline" size="sm">
          Research
        </Button>
        <Button variant="outline" size="sm">
          Guides
        </Button>
        <Button variant="outline" size="sm">
          Podcasts
        </Button>
      </div>
    </div>
  )
}
