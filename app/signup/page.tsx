"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { Loader2, Mail, Lock, Key, UserPlus, ArrowRight } from "lucide-react"

export default function SignupPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [accessCode, setAccessCode] = useState("")
  const [error, setError] = useState<string | null>(null)
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

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (authError) {
        setError(authError.message)
        setLoading(false)
        return
      }

      // IMPORTANT: For some Supabase configs, user is not immediately available in session
      // We need a valid token to call /api/redeem
      const session = data.session || (await supabase.auth.getSession()).data.session;
      
      if (!session?.access_token) {
        setError("Account created! Please check your email to confirm your account before redeeming the code.")
        setLoading(false)
        return
      }

      const response = await fetch("/api/redeem", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${session.access_token}`
        },
        body: JSON.stringify({ code: accessCode }),
      })

      const result = await response.json()
      if (!response.ok) {
        setError(`Account created, but code invalid: ${result.error}`)
      } else {
        router.push("/")
      }
    } catch (err: any) {
      setError(err.message || "Account created, but failed to verify code.")
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
              <UserPlus className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Join the Atlas
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Create your account and enter your access code
          </p>
        </div>

        <form onSubmit={handleSignup} className="bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="email" 
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="name@university.edu"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300 ml-1">Access Code</label>
              <div className="relative">
                <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input 
                  type="text" 
                  required
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  placeholder="Enter your 12-char code"
                />
              </div>
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm text-center font-medium border border-red-100 dark:border-red-800">
              {error}
            </div>
          )}

          <button 
            disabled={loading}
            className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 group active:scale-[0.98]"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Create Account <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-all" /></>}
          </button>

          <div className="text-center text-sm text-slate-500 dark:text-slate-400">
            Already have an account?{" "}
            <a href="/login" className="text-blue-600 hover:underline font-medium">Sign in</a>
          </div>
        </form>
      </div>
    </div>
  )
}
