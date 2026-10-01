import type { MetadataRoute } from "next"

export const SITE_URL = "https://medical-study-atlas.vercel.app"

// let search engines index the public pages, but keep paid study material (PDFs, summaries) out of search results
export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/lectures/", "/bilingual/", "/summary/", "/redeem"] },
    sitemap: `${SITE_URL}/sitemap.xml`,
  }
}
