'use client'

import { useAuth } from '@/contexts/AuthContext'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { PLANS } from "@/lib/plans";

interface Flashcard {
  id: string
  question: string
  answer: string
}

interface FlashcardSet {
  id: string
  title: string
  description: string
  created_at: string
  card_count: number
  flashcards?: Flashcard[]
}

function SubscriptionManagement({ user }: { user: any }) {
  const [loading, setLoading] = useState<string | null>(null);
  // Placeholder: In a real app, fetch user's current subscription from backend
  const currentPlanId = null; // e.g., 'mid', 'big', etc.

  const handleSubscribe = async (variantId: string) => {
    setLoading(variantId);
    try {
      const email = user?.email;
      if (!email) throw new Error("You must be signed in to subscribe.");
      const returnUrl = window.location.origin + "/dashboard";
      const res = await fetch('/api/lemonsqueezy/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ variantId, email, returnUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Checkout failed');
      window.location.href = data.url;
    } catch (err) {
      alert("Failed to start checkout: " + (err as any).message);
    } finally {
      setLoading(null);
    }
  };

  return (
    <section className="max-w-3xl mx-auto w-full py-10 px-6 md:px-0 text-center relative z-10" id="manage-subscription">
      <h2 className="text-2xl font-bold text-white mb-4">Manage Subscription</h2>
      <div className="mb-6 text-gray-300">
        <span className="font-semibold">Current Plan:</span> {currentPlanId ? PLANS.find(p => p.id === currentPlanId)?.name : 'None'}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {PLANS.map((plan) => (
          <div key={plan.id} className="bg-gray-800/80 rounded-2xl p-6 border border-gray-700/50 shadow-xl flex flex-col items-center">
            <h3 className="text-lg font-bold text-blue-400 mb-2">{plan.name}</h3>
            <div className="text-xl font-bold text-white mb-2">{plan.price}</div>
            <div className="text-gray-300 mb-4">{plan.description}</div>
            <ul className="text-gray-400 text-sm mb-6 text-left list-disc list-inside">
              {plan.features.map((f, i) => <li key={i}>{f}</li>)}
            </ul>
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-full font-medium transition-colors disabled:opacity-60"
              onClick={() => handleSubscribe(plan.variantId)}
              disabled={loading === plan.variantId}
            >
              {loading === plan.variantId ? "Redirecting..." : (currentPlanId === plan.id ? "Current Plan" : "Switch/Subscribe")}
            </button>
          </div>
        ))}
      </div>
    </section>
  );
}

export default function DashboardPage() {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()
  const [flashcardSets, setFlashcardSets] = useState<FlashcardSet[]>([])
  const [loadingSets, setLoadingSets] = useState(true)
  const [selectedSet, setSelectedSet] = useState<FlashcardSet | null>(null)
  const [currentCard, setCurrentCard] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth')
    }
  }, [user, loading, router])

  useEffect(() => {
    if (user) {
      fetchFlashcardSets()
    }
  }, [user])

  const fetchFlashcardSets = async () => {
    try {
      // Fetch flashcard sets from Supabase
      const { data: sets, error: setsError } = await supabase
        .from('flashcard_sets')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false })
      
      if (setsError) {
        console.error('Error fetching flashcard sets:', setsError)
        setFlashcardSets([])
        return
      }

      // Fetch flashcards for each set
      const setsWithCards = await Promise.all(
        (sets || []).map(async (set) => {
          const { data: cards, error: cardsError } = await supabase
            .from('flashcards')
            .select('*')
            .eq('set_id', set.id)
            .order('created_at', { ascending: true })
          
          if (cardsError) {
            console.error('Error fetching flashcards for set:', set.id, cardsError)
            return {
              ...set,
              card_count: 0,
              flashcards: []
            }
          }

          return {
            ...set,
            card_count: cards?.length || 0,
            flashcards: cards?.map(card => ({
              id: card.id,
              question: card.question,
              answer: card.answer
            })) || []
          }
        })
      )

      setFlashcardSets(setsWithCards)
    } catch (error) {
      console.error('Error fetching flashcard sets:', error)
      setFlashcardSets([])
    } finally {
      setLoadingSets(false)
    }
  }

  const handleSignOut = async () => {
    await signOut()
    // No need for router.push('/') - signOut handles the redirect
  }

  const openFlashcardSet = (set: FlashcardSet) => {
    setSelectedSet(set)
    setCurrentCard(0)
    setIsFlipped(false)
  }

  const closeFlashcardSet = () => {
    setSelectedSet(null)
    setCurrentCard(0)
    setIsFlipped(false)
  }

  const nextCard = () => {
    if (selectedSet && currentCard < selectedSet.flashcards!.length - 1) {
      setCurrentCard(currentCard + 1)
      setIsFlipped(false)
    }
  }

  const prevCard = () => {
    if (currentCard > 0) {
      setCurrentCard(currentCard - 1)
      setIsFlipped(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading...</div>
      </div>
    )
  }

  if (!user) return null

  // If a flashcard set is selected, show the flashcard viewer
  if (selectedSet) {
    const currentFlashcard = selectedSet.flashcards![currentCard]
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900">
        {/* Header */}
        <header className="relative z-10 px-6 py-6 flex justify-between items-center border-b border-gray-700/30 backdrop-blur-sm bg-gray-900/50">
          <button
            onClick={closeFlashcardSet}
            className="flex items-center gap-2 text-gray-300 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </button>
          
          <div className="text-center">
            <h1 className="text-xl font-bold text-white">{selectedSet.title}</h1>
            <p className="text-gray-400 text-sm">Card {currentCard + 1} of {selectedSet.flashcards!.length}</p>
          </div>

          <button
            onClick={handleSignOut}
            className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
          >
            Sign Out
          </button>
        </header>

        {/* Flashcard Viewer */}
        <main className="relative z-10 flex items-center justify-center min-h-[calc(100vh-100px)] px-4">
          <div className="w-full max-w-2xl">
            {/* Flashcard */}
            <div 
              className="relative h-96 cursor-pointer mb-8"
              onClick={() => setIsFlipped(!isFlipped)}
            >
              <motion.div
                className="absolute inset-0 w-full h-full"
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
                style={{ transformStyle: "preserve-3d" }}
              >
                {/* Front (Question) */}
                <div 
                  className="absolute inset-0 bg-white rounded-3xl shadow-2xl flex items-center justify-center p-8 text-center"
                  style={{ backfaceVisibility: "hidden" }}
                >
                  <div className="max-w-full">
                    <div className="text-gray-500 text-sm mb-4 font-medium uppercase tracking-wider">Question</div>
                    <p className="text-gray-800 text-2xl font-medium leading-relaxed break-words">
                      {currentFlashcard.question}
                    </p>
                    <div className="text-gray-400 text-sm mt-6">Click to reveal answer</div>
                  </div>
                </div>
                
                {/* Back (Answer) */}
                <div 
                  className="absolute inset-0 bg-blue-50 rounded-3xl shadow-2xl flex items-center justify-center p-8 text-center"
                  style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                >
                  <div className="max-w-full">
                    <div className="text-blue-600 text-sm mb-4 font-medium uppercase tracking-wider">Answer</div>
                    <p className="text-gray-800 text-2xl leading-relaxed break-words">
                      {currentFlashcard.answer}
                    </p>
                    <div className="text-blue-500 text-sm mt-6">Click to see question</div>
                  </div>
                </div>
              </motion.div>
            </div>
            
            {/* Navigation */}
            <div className="flex justify-between items-center">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 bg-gray-800/80 hover:bg-gray-700/80 text-white px-6 py-3 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium backdrop-blur-xl"
                onClick={prevCard}
                disabled={currentCard === 0}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
                Previous
              </motion.button>
              
              <div className="flex gap-2">
                {selectedSet.flashcards!.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => { setCurrentCard(index); setIsFlipped(false); }}
                    className={`w-3 h-3 rounded-full transition-all ${
                      index === currentCard ? 'bg-blue-400' : 'bg-gray-600 hover:bg-gray-500'
                    }`}
                  />
                ))}
              </div>
              
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2 bg-gray-800/80 hover:bg-gray-700/80 text-white px-6 py-3 rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium backdrop-blur-xl"
                onClick={nextCard}
                disabled={currentCard === selectedSet.flashcards!.length - 1}
              >
                Next
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </motion.button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#080808] text-[#f3f3f3] relative selection:bg-white selection:text-black bg-grain">
      {/* Background Subtle Atmospheric Glows */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-white/[0.015] rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-[40vh] right-1/4 w-[500px] h-[500px] bg-white/[0.02] rounded-full blur-[160px] pointer-events-none" />

      {/* Header */}
      <header className="relative z-10 px-6 sm:px-12 py-6 flex justify-between items-center border-b border-white/[0.06] backdrop-blur-md bg-black/40">
        <Link href="/" className="flex items-center gap-3.5 group">
          <div className="w-10 h-10 rounded-full overflow-hidden border border-white/30 bg-black/60 p-0.5 shadow-[0_0_15px_rgba(255,255,255,0.15)] group-hover:border-white transition-all group-hover:scale-105 flex items-center justify-center">
            <img
              src="/logo_character_strict_hair_edit_3.png"
              alt="Ankify Logo"
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold tracking-[0.25em] uppercase text-white font-cinzel">
              ANKIFY
            </span>
            <span className="text-[9px] tracking-[0.2em] text-neutral-400 font-jp">
              記憶 • ダッシュボード
            </span>
          </div>
        </Link>
        
        <div className="flex items-center gap-4">
          <span className="text-xs uppercase tracking-[0.15em] text-neutral-400 hidden sm:inline">
            {user.email?.split('@')[0]}
          </span>
          <Link href="/convert">
            <button className="bg-white hover:bg-neutral-200 text-black px-5 py-2.5 rounded-full transition-colors text-xs uppercase tracking-[0.15em] font-semibold shadow-[0_0_20px_rgba(255,255,255,0.2)]">
              + Synthesize Deck
            </button>
          </Link>
          <button
            onClick={handleSignOut}
            className="text-xs uppercase tracking-[0.15em] text-neutral-400 hover:text-red-400 px-4 py-2.5 rounded-full border border-white/10 hover:border-red-500/30 transition-all font-medium"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-6xl mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Hero Section */}
          <div className="text-center mb-16">
            <span className="text-[10px] uppercase tracking-[0.3em] text-neutral-400 font-jp block mb-3">
              知能化 • デック一覧
            </span>
            <h1 className="text-3xl sm:text-5xl font-light text-white mb-4 tracking-tight">
              Cognitive <span className="font-serif-editorial italic font-normal text-white">Repository</span>
            </h1>
            <p className="text-sm uppercase tracking-[0.2em] text-neutral-400 max-w-lg mx-auto font-light">
              Synthesized memory vaults, calibrated for long-term neural retention.
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            <div className="glass-editorial rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all">
              <h3 className="text-neutral-500 text-xs font-mono uppercase tracking-[0.2em] mb-2">Total Decks • 目録</h3>
              <p className="text-3xl font-light text-white font-cinzel">{flashcardSets.length}</p>
            </div>
            
            <div className="glass-editorial rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all">
              <h3 className="text-neutral-500 text-xs font-mono uppercase tracking-[0.2em] mb-2">Total Cards • 単語数</h3>
              <p className="text-3xl font-light text-white font-cinzel">
                {flashcardSets.reduce((sum, set) => sum + (set.card_count || 0), 0)}
              </p>
            </div>
            
            <div className="glass-editorial rounded-2xl p-6 border border-white/10 hover:border-white/20 transition-all">
              <h3 className="text-neutral-500 text-xs font-mono uppercase tracking-[0.2em] mb-2">System Status • 状態</h3>
              <p className="text-xl font-light text-white font-mono flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Active Synchronized
              </p>
            </div>
          </div>

          {/* Flashcard Sets */}
          <div>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-medium tracking-wide text-white">Your Flashcard Decks</h2>
              <span className="text-xs uppercase tracking-[0.2em] text-neutral-500 font-mono">Vault Storage</span>
            </div>
            
            {loadingSets ? (
              <div className="text-center py-16">
                <div className="text-neutral-400 text-xs uppercase tracking-[0.2em]">Accessing neural index...</div>
              </div>
            ) : flashcardSets.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {flashcardSets.map((set, index) => (
                  <motion.div
                    key={set.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="glass-editorial rounded-2xl p-6 border border-white/10 hover:border-white/30 transition-all group flex flex-col justify-between"
                  >
                    <div>
                      <h3 className="text-lg font-medium text-white mb-2 tracking-wide group-hover:text-neutral-200 transition-colors">{set.title}</h3>
                      <p className="text-neutral-400 text-xs font-light mb-6 line-clamp-2">{set.description || "Synthesized via Ankify AI"}</p>
                    </div>
                    <div className="pt-4 border-t border-white/5">
                      <div className="flex justify-between items-center text-xs text-neutral-500 mb-4 font-mono">
                        <span>{set.card_count || (set.flashcards ? set.flashcards.length : 0)} Cards</span>
                        <span>{new Date(set.created_at).toLocaleDateString()}</span>
                      </div>
                    
                    {/* Action Buttons */}
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => openFlashcardSet(set)}
                        className="flex-1 bg-white hover:bg-neutral-200 text-black py-2.5 px-4 rounded-full transition-colors text-xs uppercase tracking-[0.15em] font-semibold"
                      >
                        Study Deck
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
                ))}
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-20 border border-white/5 rounded-3xl bg-white/[0.01]"
              >
                <div className="text-neutral-500 mb-4 text-xs uppercase tracking-[0.2em]">No synthesized decks in memory vault</div>
                <Link href="/convert">
                  <button className="bg-white hover:bg-neutral-200 text-black px-8 py-3.5 rounded-full transition-all text-xs uppercase tracking-[0.2em] font-medium shadow-[0_0_25px_rgba(255,255,255,0.15)]">
                    Create Your First Deck
                  </button>
                </Link>
              </motion.div>
            )}
          </div>

          <SubscriptionManagement user={user} />
        </motion.div>
      </main>
    </div>
  )
} 