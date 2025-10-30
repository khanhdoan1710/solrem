import { MobileHeader } from "@/components/mobile-header"
import { ResourcesGrid } from "@/components/resources-grid"
import { ResourceFilters } from "@/components/resource-filters"
import { FeaturedResource } from "@/components/featured-resource"

export default function ResourcesPage() {
  return (
    <div className="min-h-screen bg-background">
      <MobileHeader />

      <main className="px-4 py-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold mb-1 text-balance">Sleep Resources</h1>
          <p className="text-muted-foreground text-sm">Research, videos, and guides to improve your sleep</p>
        </div>

        <FeaturedResource />

        <ResourceFilters />

        <ResourcesGrid />
      </main>
    </div>
  )
}
