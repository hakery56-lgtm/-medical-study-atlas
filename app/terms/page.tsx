import type { Metadata } from "next"
import LegalPage from "@/components/LegalPage"

export const metadata: Metadata = { title: "Terms and Conditions — Medical Study Atlas" }

export default function TermsPage() {
  return <LegalPage file="terms.md" title="Terms and Conditions" />
}
