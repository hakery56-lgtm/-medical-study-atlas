import type { Metadata } from "next"
import LegalPage from "@/components/LegalPage"

export const metadata: Metadata = { title: "Cookies Policy — Medical Study Atlas" }

export default function CookiesPage() {
  return <LegalPage file="cookies.md" title="Cookies Policy" />
}
