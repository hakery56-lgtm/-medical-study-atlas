"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import { useRouter } from "next/navigation"
import { Loader2, Lock, User, ArrowRight } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
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

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    // Map username to internal email format for Supabase
    const internalEmail = `${username.toLowerCase().trim()}@atlas.internal`;

    const { error: authError } = await supabase.auth.signInWithPassword({ 
      email: internalEmail, 
      password 
    })
    
    if (authError) {
      setError(authError.message)
    } else {
      router.push("/")
    }
    setLoading(false)
  }

  return (
    <div className=\"min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 p-4 transition-colors duration-300\">
      <button 
        onClick={toggleTheme}
        className=\"absolute top-6 right-6 p-2 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm\"
      >
        {dark ? \"☀️\" : \"🌙\"}
      </button>

      <div className=\"w-full max-w-md space-y-8\">\n        <div className=\"text-center space-y-2\">\n          <div className=\"flex justify-center mb-4\">\n            <div className=\"p-3 bg-blue-600 rounded-2xl shadow-lg shadow-blue-500/20\">\n              <Lock className=\"w-8 h-8 text-white\" />\n            </div>\n          </div>\n          <h1 className=\"text-3xl font-bold text-slate-900 dark:text-white tracking-tight\">\n            Welcome Back\n          </h1>\n          <p className=\"text-slate-500 dark:text-slate-400\">\n            Sign in to access your medical study atlas\n          </p>\n        </div>\n\n        <form onSubmit={handleLogin} className=\"bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 space-y-6\">\n          <div className=\"space-y-4\">\n            <div className=\"space-y-2\">\n              <label className=\"text-sm font-medium text-slate-700 dark:text-slate-300 ml-1\">Account Name</label>\n              <div className=\"relative\">\n                <User className=\"absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400\" />\n                <input \n                  type=\"text\"\n                  required\n                  value={username}\n                  onChange={(e) => setUsername(e.target.value)}\n                  className=\"w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all\"\n                  placeholder=\"Enter your account name\"\n                />\n              </div>\n            </div>\n\n            <div className=\"space-y-2\">\n              <label className=\"text-sm font-medium text-slate-700 dark:text-slate-300 ml-1\">Password</label>\n              <div className=\"relative\">\n                <Lock className=\"absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400\" />\n                <input \n                  type=\"password\" \n                  required\n                  value={password}\n                  onChange={(e) => setPassword(e.target.value)}\n                  className=\"w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-transparent text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all\"\n                  placeholder=\"••••••••\"\n                />\n              </div>\n            </div>\n          </div>\n\n          {error && (\n            <div className=\"p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm text-center font-medium border border-red-100 dark:border-red-800\">\n              {error}\n            </div>\n          )}\n\n          <button \n            disabled={loading}\n            className=\"w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl transition-all flex items-center justify-center gap-2 group active:scale-[0.98]\"\n          >\n            {loading ? <Loader2 className=\"w-5 h-5 animate-spin\" /> : <>Sign In <ArrowRight className=\"w-5 h-5 group-hover:translate-x-1 transition-transform\" /></>}\n          </button>\n\n          <div className=\"text-center text-sm text-slate-500 dark:text-slate-400\">\n            Don't have an account?{\" \"}\n            <a href=\"/signup\" className=\"text-blue-600 hover:underline font-medium\">Create one</a>\n          </div>\n        </form>\n      </div>\n    </div>\n  )\n}\n