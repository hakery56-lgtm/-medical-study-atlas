"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { Loader2, Key, CheckCircle2, AlertCircle } from "lucide-react"

export default function RedeemPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [code, setCode] = useState("")
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle")
  const [message, setMessage] = useState("")
  const [dark, setDark] = useState(false)

  useEffect(() => {
    if (localStorage.getItem("atlas-theme") === "dark") {
      setDark(true)
      document.documentElement.classList.add("dark")
    }
  }, [])

  const toggleTheme = () => {
    setDark(!dark)
    if (!dark) {
      document.documentElement.classList.add("dark")
      localStorage.setItem("atlas-theme", "dark")
    } else {
      document.documentElement.classList.remove("dark")
      localStorage.setItem("atlas-theme", "light")
    }
  }

  const handleRedeem = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setStatus("idle")

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setMessage("You must be logged in to redeem a code.")
        setStatus("error")
        setLoading(false)
        return
      }

      const response = await fetch("/api/redeem", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ code }),
      })

      const result = await response.json()
      if (!response.ok) {
        setMessage(result.error || "Something went wrong")
        setStatus("error")
      } else {
        setMessage("Access granted! You now have 30 days of access.")
        setStatus("success")
        setTimeout(() => router.push("/"), 3000)
      }
    } catch (err) {
      setMessage("A network error occurred. Please try again.")
      setStatus("error")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 transition-colors duration-300">
      <button 
        onClick={toggleTheme}
        className="absolute top-6 right-6 p-2 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm"
      >
        {dark ? "☀️" : "🌙"}
      </button>

      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-500/20">
              <Key className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Unlock Full Access
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Enter your unique access code to extend your subscription
          </p>
        </div>

        <form onSubmit={handleRedeem} className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Access Code</label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="text" 
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="XXXX-XXXX-XXXX"
                />
              </div>
            </div>
          </div>

          {status === "error" && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm text-center font-medium border border-red-100 dark:border-red-800 flex items-center justify-center gap-2">
              <AlertCircle className="w-4 h-4" /> {message}
            </div>
          )}

          {status === "success" && (
            <div className="p-3 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 text-sm text-center font-medium border border-green-100 dark:border-green-800 flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> {message}
            </div>
          )}

          <button 
            disabled={loading}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 group active:scale-[0.98]"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Redeem Code <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-all" /></>}
          </button>

          <div className="text-center text-sm text-slate-500 dark:text-slate-400">
            Don't have a code?{" "}
            <a href="/contact" className="text-blue-600 hover:underline font-medium">Contact support</a>
          </div>
        </form>
      </div>
    </div>
  )
}
