import type React from "react"
import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"
import { MobileNav } from "@/components/mobile-nav"

export const metadata: Metadata = {
  title: "SolREM - Track & Bet on Sleep",
  description: "Track your sleep quality and compete in prediction markets",
  generator: "v0.app",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`font-sans ${GeistSans.variable} ${GeistMono.variable}`}>
        <div className="pb-20">{children}</div>
        <MobileNav />
      </body>
    </html>
  )
}
