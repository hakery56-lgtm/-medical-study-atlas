import type { MetadataRoute } from "next"

// makes the site installable ("Add to home screen") so students can open it like an app
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Medical Study Atlas",
    short_name: "Study Atlas",
    description: "Medical lectures, Arabic versions, summaries, flash cards and exams.",
    start_url: "/",
    display: "standalone",
    background_color: "#f5f3ee",
    theme_color: "#0f766e",
    icons: [
      { src: "/icons/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icons/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  }
}
