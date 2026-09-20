"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { Loader2, Mail, Lock, Key, UserPlus, ArrowRight } from "lucide-react"

export default function SignupPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [username, setUsername] = useState("")
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

    // Map username to internal email format for Supabase
    const internalEmail = `${username.toLowerCase().trim()}@atlas.internal`;

    try {
      const { data, error: authError } = await supabase.auth.signUp({
        email: internalEmail,
        password,
      })

      if (authError) {
        const msg = authError.message.toLowerCase();
        if (msg.includes("rate limit")) {
          setError("Too many sign-up attempts. Please wait a few minutes and try again.")
        } else if (msg.includes("already registered")) {
          setError("This account name is already taken. Please choose another or sign in.")
        } else {
          setError(authError.message)
        }
        setLoading(false)
        return
      }

      const session = data.session || (await supabase.auth.getSession()).data.session;
      
      if (!session?.access_token) {
        setError("Account created! Please check your email (if configured) or sign in to redeem your access code.")
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
      setError(err.message || "An unexpected error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className=\"min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 transition-colors duration-300\">
      <button 
        onClick={toggleTheme}
        className=\"absolute top-6 right-6 p-2 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm\"
      >
        {dark ? \"☀️\" : \"🌙\"}
      </button>

      <div className=\"w-full max-w-md space-y-8\">\n        <div className=\"text-center space-y-2\">\n          <div className=\"flex justify-center mb-4\">\n            <div className=\"p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-500/20\">\n              <UserPlus className=\"w-8 h-8 text-white\" />\n            </div>\n          </div>\n          <h1 className=\"text-3xl font-bold text-slate-900 dark:text-white tracking-tight\">\n            Join the Atlas\n          </h1>\n          <p className=\"text-slate-500 dark:text-slate-400\">\n            Create your account and enter your access code\n          </p>\n        </div>\n\n        <form onSubmit={handleSignup} className=\"bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 space-y-6\">\n          <div className=\"space-y-4\">\n            <div className=\"space-y-2\">\n              <label className=\"text-sm font-medium text-slate-700 dark:text-slate-300 ml-1\">Account Name</label>\n              <div className=\"relative\">\n                <UserPlus className=\"absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400\" />\n                <input \n                  type=\"text\"\n                  required\n                  value={username}\n                  onChange={(e) => setUsername(e.target.value)}\n                  className=\"w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all\"\n                  placeholder=\"Choose a unique account name\"\n                />\n              </div>\n            </div>\n\n            <div className=\"space-y-2\">\n              <label className=\"text-sm font-medium text-slate-700 dark:text-slate-300 ml-1\">Password</label>\n              <div className=\"relative\">\n                <Lock className=\"absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400\" />\n                <input \n                  type=\"password\" \n                  required\n                  value={password}\n                  onChange={(e) => setPassword(e.target.value)}\n                  className=\"w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all\"\n                  placeholder=\"••••••••\"\n                />\n              </div>\n            </div>\n\n            <div className=\"space-y-2\">\n              <label className=\"text-sm font-medium text-slate-700 dark:text-slate-300 ml-1\">Access Code</label>\n              <div className=\"relative\">\n                <Key className=\"absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400\" />\n                <input \n                  type=\"text\" \n                  required\n                  value={accessCode}\n                  onChange={(e) => setAccessCode(e.target.value)}\n                  className=\"w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all\"\n                  placeholder=\"Enter your 12-char code\"\n                />\n              </div>\n            </div>\n          </div>\n\n          {error && (\n            <div className=\"p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm text-center font-medium border border-red-100 dark:border-red-800\">\n              {error}\n            </div>\n          )}\n\n          <button \n            disabled={loading}\n            className=\"w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 group active:scale-[0.98]\"\n          >\n            {loading ? <Loader2 className=\"w-5 h-5 animate-spin\" /> : <>Create Account <ArrowRight className=\"w-5 h-5 group-hover:translate-x-1 transition-all\" /></>}\n          </button>\n\n          <div className=\"text-center text-sm text-slate-500 dark:text-slate-400\">\n            Already have an account?{\" \"}\n            <a href=\"/login\" className=\"text-blue-600 hover:underline font-medium\">Sign in</a>\n          </div>\n        </form>\n      </div>\n    </div>\n  )\n}\n