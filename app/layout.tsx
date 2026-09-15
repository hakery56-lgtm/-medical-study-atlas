import "./globals.css"
import type { Metadata, Viewport } from "next"
import { Inter, Playfair_Display } from "next/font/google"
import { Analytics } from "@vercel/analytics/next"

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })
const playfair = Playfair_Display({ subsets: ["latin"], weight: ["600", "700"], variable: "--font-serif" })

export const metadata: Metadata = {
  title: "Medical Study Atlas — Academic Repository",
  description:
    "A curated repository of medical lectures, labs, notes, and interactive quizzes across Musculoskeletal, Cardiovascular, Respiratory, Hematology, Pharmacology, and Pathology.",
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f3ee" },
    { media: "(prefers-color-scheme: dark)", color: "#131619" },
  ],
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${playfair.variable} font-sans`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
