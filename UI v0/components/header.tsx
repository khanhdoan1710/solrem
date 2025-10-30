"use client"

import Link from "next/link"
import { Moon, Bell, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export function Header() {
  return (
    <header className="border-b border-border bg-card">
      <div className="container mx-auto px-4 py-4 max-w-7xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2" prefetch={false}>
              <Moon className="h-8 w-8 text-primary" />
              <span className="text-2xl font-bold">SleepScore</span>
            </Link>

            <nav className="hidden md:flex items-center gap-6">
              <Link href="/" className="text-sm font-medium hover:text-primary transition-colors" prefetch={false}>
                Dashboard
              </Link>
              <Link
                href="/markets"
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                prefetch={false}
              >
                Markets
              </Link>
              <Link
                href="/resources"
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                prefetch={false}
              >
                Resources
              </Link>
              <Link
                href="/leaderboard"
                className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                prefetch={false}
              >
                Leaderboard
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
                <DropdownMenuItem>Connect Device</DropdownMenuItem>
                <DropdownMenuItem>Sign Out</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  )
}
