'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { createClient } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import Link from 'next/link'

export default function AuthPage() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  
  const supabase = createClient()
  const router = useRouter()
  const { user } = useAuth()

  // Redirect if already authenticated
  if (user) {
    router.push('/dashboard')
    return null
  }

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setMessage('')

    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback`,
          },
        })
        
        if (error) throw error
        setMessage('Check your email for the confirmation link!')
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        
        if (error) throw error
        router.push('/dashboard')
      }
    } catch (error: any) {
      const msg = error?.message || String(error)
      if (msg.toLowerCase().includes('fetch') || msg.toLowerCase().includes('network') || msg.toLowerCase().includes('enotfound')) {
        setError('Connection failed. The authentication service may be temporarily unavailable. Please try again in a few minutes.')
      } else {
        setError(msg)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleAuth = async () => {
    setLoading(true)
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) throw error
    } catch (error: any) {
      const msg = error?.message || String(error)
      if (msg.toLowerCase().includes('fetch') || msg.toLowerCase().includes('network')) {
        setError('Connection failed. The authentication service may be temporarily unavailable. Please try again in a few minutes.')
      } else {
        setError(msg)
      }
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#080808] text-[#f3f3f3] relative selection:bg-white selection:text-black bg-grain flex items-center justify-center p-6 overflow-hidden">
      {/* Background Subtle Atmospheric Glows */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-white/[0.02] rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-white/[0.02] rounded-full blur-[140px] pointer-events-none" />

      {/* Floating subtle CJK symbols */}
      <div className="absolute top-12 left-12 text-white/[0.03] text-8xl font-jp pointer-events-none select-none">
        記憶
      </div>
      <div className="absolute bottom-12 right-12 text-white/[0.03] text-8xl font-kr pointer-events-none select-none">
        지능
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-md z-10 flex flex-col gap-4"
      >
        {/* ⚠️ Service Status Banner */}
        <div className="p-3 rounded-2xl bg-amber-950/50 border border-amber-500/30 text-amber-300 text-xs text-center leading-relaxed backdrop-blur-md">
          <strong className="block mb-0.5 text-amber-200 uppercase tracking-wider text-[10px]">⚠ Auth Service Offline</strong>
          Your Supabase project is paused or inactive. 
          Go to <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="underline hover:text-amber-100">supabase.com/dashboard</a> and resume the project to enable sign-in.
        </div>

        <div className="glass-editorial rounded-3xl p-8 sm:p-10 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-2xl relative">
          {/* Header & Logo */}
          <div className="text-center mb-8 flex flex-col items-center">
            <Link href="/" className="inline-flex flex-col items-center group mb-4">
              <div className="w-16 h-16 rounded-full overflow-hidden border border-white/30 bg-black/60 p-1 shadow-[0_0_25px_rgba(255,255,255,0.15)] group-hover:border-white transition-all group-hover:scale-105 mb-3">
                <img
                  src="/logo_character_strict_hair_edit_3.png"
                  alt="Ankify Logo"
                  className="w-full h-full object-cover rounded-full"
                />
              </div>
              <h1 className="text-2xl font-bold tracking-[0.25em] uppercase text-white font-cinzel">
                ANKIFY
              </h1>
              <span className="text-[10px] tracking-[0.25em] text-neutral-400 font-jp uppercase mt-0.5">
                知的カード • システム
              </span>
            </Link>
            <p className="text-xs uppercase tracking-[0.2em] text-neutral-400 font-light mt-1">
              {isSignUp ? 'Create your neural index' : 'Access your study vault'}
            </p>
          </div>

          {/* Auth Toggle */}
          <div className="flex mb-6 bg-white/[0.04] border border-white/10 rounded-full p-1">
            <button
              type="button"
              onClick={() => { setIsSignUp(false); setError(''); setMessage(''); }}
              className={`flex-1 py-2.5 px-4 rounded-full text-xs uppercase tracking-[0.15em] font-medium transition-all duration-300 ${
                !isSignUp
                  ? 'bg-white text-black shadow-lg font-semibold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => { setIsSignUp(true); setError(''); setMessage(''); }}
              className={`flex-1 py-2.5 px-4 rounded-full text-xs uppercase tracking-[0.15em] font-medium transition-all duration-300 ${
                isSignUp
                  ? 'bg-white text-black shadow-lg font-semibold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              Sign Up
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="block text-[10px] uppercase tracking-[0.2em] text-neutral-400 mb-1.5 ml-1">Email Address</label>
              <input
                type="email"
                placeholder="scholar@university.edu"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:border-white/40 focus:ring-1 focus:ring-white/20 transition-all text-sm font-light"
              />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-[0.2em] text-neutral-400 mb-1.5 ml-1">Password</label>
              <input
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 rounded-xl bg-white/[0.03] border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:border-white/40 focus:ring-1 focus:ring-white/20 transition-all text-sm font-light"
              />
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-xl bg-red-950/40 border border-red-500/30 text-red-300 text-xs text-center"
              >
                {error}
              </motion.div>
            )}

            {message && (
              <motion.div
                initial={{ opacity: 0, y: -5 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-xs text-center"
              >
                {message}
              </motion.div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-6 rounded-full text-xs uppercase tracking-[0.2em] font-medium transition-all duration-300 bg-white text-black hover:bg-neutral-200 disabled:opacity-60 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(255,255,255,0.2)] mt-2"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                  </svg>
                  Processing...
                </span>
              ) : (
                isSignUp ? 'Create Neural Vault' : 'Enter Workspace'
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="flex items-center my-6">
            <div className="flex-1 border-t border-white/10"></div>
            <span className="px-3 text-neutral-500 text-[10px] uppercase tracking-[0.2em]">or</span>
            <div className="flex-1 border-t border-white/10"></div>
          </div>

          {/* Google Auth */}
          <button
            type="button"
            onClick={handleGoogleAuth}
            disabled={loading}
            className="w-full bg-white/[0.04] hover:bg-white/[0.08] text-white border border-white/15 font-medium py-3 rounded-full transition-all text-xs uppercase tracking-[0.15em] disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2.5"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          {/* Back to Home */}
          <div className="text-center mt-6">
            <Link href="/" className="text-neutral-400 hover:text-white text-xs tracking-wider transition-colors">
              ← Return to Manifesto
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  )
} 