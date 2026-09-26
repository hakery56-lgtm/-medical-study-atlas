"use client"

import { useEffect } from "react"

// pages outside the home page still follow the dark/light choice saved by the sidebar toggle
export default function ApplyStoredTheme() {
  useEffect(() => {
    if (localStorage.getItem("atlas-theme") === "dark") {
      document.documentElement.setAttribute("data-theme", "dark")
      document.documentElement.classList.add("dark")
    }
  }, [])
  return null
}
