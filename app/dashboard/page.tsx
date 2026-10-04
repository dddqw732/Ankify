'use client'

import { useAuth } from '@/contexts/AuthContext'
import { motion, AnimatePresence } from 'framer-motion'
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
  const currentPlanId = null;

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
    <section className="max-w-5xl mx-auto w-full py-16 px-0 relative z-10" id="manage-subscription">
      <div className="border-t border-white/[0.06] pt-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 text-xs tracking-[0.3em] uppercase text-white/50 mb-3">
            <span className="font-jp">会員プラン</span>
            <span>•</span>
            <span className="font-kr">멤버십 플랜</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-light text-white tracking-tight mb-2">
            Upgrade Your <span className="font-serif-editorial italic">Access</span>
          </h2>
          <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
            Current Plan: <span className="text-white">{currentPlanId ? PLANS.find((p: any) => p.id === currentPlanId)?.name : 'Free Tier'}</span>
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`glass-editorial rounded-2xl p-7 flex flex-col justify-between border transition-all duration-300 relative group ${
                i === 1
                  ? 'border-white/25 shadow-[0_0_40px_rgba(255,255,255,0.06)]'
                  : 'border-white/10 hover:border-white/20'
              }`}
            >
              {i === 1 && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white text-black text-[9px] uppercase font-bold tracking-[0.2em] px-3 py-1 rounded-full shadow-lg">
                  Popular • 標準
                </div>
              )}
              <div>
                <div className="flex justify-between items-baseline mb-4">
                  <h3 className="text-lg font-medium text-white tracking-wide">{plan.name}</h3>
                  <span className="text-2xl font-light text-white">{plan.price}</span>
                </div>
                <p className="text-sm text-neutral-400 mb-5 font-light leading-relaxed">{plan.description}</p>
                <div className="h-px w-full bg-white/8 mb-5" />
                <ul className="space-y-2.5 mb-7 text-sm text-neutral-300">
                  {plan.features.map((feat: string, idx: number) => (
                    <li key={idx} className="flex items-center gap-3">
                      <span className="w-1 h-1 rounded-full bg-white/50 flex-shrink-0" />
                      <span className="font-light">{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <button
                onClick={() => handleSubscribe(plan.variantId)}
                disabled={loading === plan.variantId}
                className="w-full py-3 px-5 rounded-full text-xs uppercase tracking-[0.2em] font-medium transition-all duration-300 bg-white/8 hover:bg-white text-white hover:text-black border border-white/15 hover:border-white cursor-pointer disabled:opacity-50"
              >
                {loading === plan.variantId ? "Redirecting…" : (currentPlanId as any) === plan.id ? "Current Plan" : "Select Plan"}
              </button>
            </motion.div>
          ))}
        </div>
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
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
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

      const setsWithCards = await Promise.all(
        (sets || []).map(async (set) => {
          const { data: cards } = await supabase
            .from('flashcards')
            .select('*')
            .eq('set_id', set.id)
            .order('created_at', { ascending: true })

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

  const handleDelete = async (setId: string) => {
    try {
      await supabase.from('flashcard_sets').delete().eq('id', setId)
      setFlashcardSets(prev => prev.filter(s => s.id !== setId))
    } catch (e) {
      console.error('Delete error:', e)
    } finally {
      setDeleteConfirm(null)
    }
  }

  const handleSignOut = async () => {
    await signOut()
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

  const exportAnki = (set: FlashcardSet) => {
    if (!set.flashcards || set.flashcards.length === 0) return
    const content = set.flashcards.map(c => `${c.question}\t${c.answer}`).join('\n')
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${set.title.replace(/[^a-z0-9]/gi, '_')}_anki.txt`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#080808] flex items-center justify-center">
        <div className="text-neutral-400 text-xs uppercase tracking-[0.3em] animate-pulse">Initializing…</div>
      </div>
    )
  }

  if (!user) return null

  // ── FLASHCARD VIEWER ──
  if (selectedSet) {
    const cards = selectedSet.flashcards!
    const card = cards[currentCard]

    return (
      <div className="min-h-screen bg-[#080808] text-[#f3f3f3] relative overflow-hidden bg-grain">
        <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-white/[0.015] rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-white/[0.02] rounded-full blur-[120px] pointer-events-none" />

        <header className="relative z-10 px-6 sm:px-12 py-5 flex justify-between items-center border-b border-white/[0.06] backdrop-blur-md bg-black/40">
          <button
            onClick={closeFlashcardSet}
            className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors text-xs uppercase tracking-[0.15em]"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            Back
          </button>

          <div className="text-center">
            <h1 className="text-sm font-medium text-white tracking-wide">{selectedSet.title}</h1>
            <p className="text-[10px] uppercase tracking-[0.2em] text-neutral-500 font-mono mt-0.5">
              Card {currentCard + 1} / {cards.length}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => exportAnki(selectedSet)}
              className="flex items-center gap-2 text-xs uppercase tracking-[0.15em] text-neutral-400 hover:text-white px-4 py-2 rounded-full border border-white/10 hover:border-white/30 transition-all"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export Anki
            </button>
            <button
              onClick={handleSignOut}
              className="text-xs uppercase tracking-[0.15em] text-neutral-500 hover:text-red-400 px-3 py-2 transition-colors hidden sm:block"
            >
              Sign Out
            </button>
          </div>
        </header>

        <main className="relative z-10 flex items-center justify-center min-h-[calc(100vh-80px)] px-6 py-12">
          <div className="w-full max-w-2xl">
            {/* Progress bar */}
            <div className="h-0.5 bg-white/5 rounded-full mb-10 overflow-hidden">
              <div
                className="h-full bg-white/40 rounded-full transition-all duration-500"
                style={{ width: `${((currentCard + 1) / cards.length) * 100}%` }}
              />
            </div>

            {/* Flip Card */}
            <div
              className="relative h-80 sm:h-96 cursor-pointer mb-10"
              style={{ perspective: '1200px' }}
              onClick={() => setIsFlipped(!isFlipped)}
            >
              <motion.div
                className="absolute inset-0 w-full h-full"
                animate={{ rotateY: isFlipped ? 180 : 0 }}
                transition={{ duration: 0.55, type: "spring", stiffness: 220, damping: 22 }}
                style={{ transformStyle: "preserve-3d" }}
              >
                {/* Front */}
                <div
                  className="absolute inset-0 glass-editorial rounded-3xl p-10 flex flex-col items-center justify-center text-center border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.7)]"
                  style={{ backfaceVisibility: "hidden" }}
                >
                  <span className="text-neutral-500 text-[10px] font-mono tracking-[0.3em] uppercase mb-6">Question • 問い</span>
                  <p className="text-white text-xl sm:text-2xl font-light leading-relaxed">{card?.question}</p>
                  <span className="text-neutral-600 text-[10px] font-mono mt-auto uppercase tracking-widest">Click to reveal answer</span>
                </div>

                {/* Back */}
                <div
                  className="absolute inset-0 rounded-3xl p-10 flex flex-col items-center justify-center text-center border border-white/20 shadow-[0_20px_50px_rgba(0,0,0,0.8)]"
                  style={{
                    backfaceVisibility: "hidden",
                    transform: "rotateY(180deg)",
                    background: "linear-gradient(135deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.02) 100%)",
                  }}
                >
                  <span className="text-neutral-400 text-[10px] font-mono tracking-[0.3em] uppercase mb-6">Answer • 記憶</span>
                  <p className="text-neutral-100 text-lg sm:text-xl font-light leading-relaxed">{card?.answer}</p>
                  <span className="text-neutral-600 text-[10px] font-mono mt-auto uppercase tracking-widest">Click to flip back</span>
                </div>
              </motion.div>
            </div>

            {/* Nav */}
            <div className="flex justify-between items-center">
              <button
                onClick={prevCard}
                disabled={currentCard === 0}
                className="flex items-center gap-2 text-xs uppercase tracking-[0.15em] text-neutral-400 hover:text-white px-5 py-2.5 rounded-full border border-white/10 hover:border-white/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
                Previous
              </button>

              <div className="flex gap-1.5 flex-wrap justify-center max-w-xs">
                {cards.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => { setCurrentCard(i); setIsFlipped(false); }}
                    className={`rounded-full transition-all duration-300 ${
                      i === currentCard ? 'w-6 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/20 hover:bg-white/40'
                    }`}
                  />
                ))}
              </div>

              <button
                onClick={nextCard}
                disabled={currentCard === cards.length - 1}
                className="flex items-center gap-2 text-xs uppercase tracking-[0.15em] text-neutral-400 hover:text-white px-5 py-2.5 rounded-full border border-white/10 hover:border-white/30 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              >
                Next
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  // ── MAIN DASHBOARD ──
  return (
    <div className="min-h-screen bg-[#080808] text-[#f3f3f3] relative selection:bg-white selection:text-black bg-grain">
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-white/[0.015] rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-[40vh] right-1/4 w-[500px] h-[500px] bg-white/[0.02] rounded-full blur-[160px] pointer-events-none" />

      <header className="relative z-10 px-6 sm:px-12 py-5 flex justify-between items-center border-b border-white/[0.06] backdrop-blur-md bg-black/40">
        <Link href="/" className="flex items-center gap-3.5 group">
          <div className="w-10 h-10 rounded-full overflow-hidden border border-white/20 bg-black/60 p-0.5 group-hover:border-white/50 transition-all group-hover:scale-105">
            <img src="/logo_character_strict_hair_edit_3.png" alt="Ankify Logo" className="w-full h-full object-cover rounded-full" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold tracking-[0.25em] uppercase text-white font-cinzel">ANKIFY</span>
            <span className="text-[9px] tracking-[0.2em] text-neutral-400 font-jp">記憶 • ダッシュボード</span>
          </div>
        </Link>

        <div className="flex items-center gap-4">
          <span className="text-xs uppercase tracking-[0.15em] text-neutral-500 hidden sm:inline">{user.email?.split('@')[0]}</span>
          <Link href="/convert">
            <button className="bg-white hover:bg-neutral-200 text-black px-5 py-2.5 rounded-full transition-colors text-xs uppercase tracking-[0.15em] font-semibold shadow-[0_0_20px_rgba(255,255,255,0.15)]">
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

      <main className="relative z-10 max-w-6xl mx-auto px-6 py-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          {/* Hero */}
          <div className="text-center mb-16">
            <span className="text-[10px] uppercase tracking-[0.3em] text-neutral-400 font-jp block mb-3">知能化 • デック一覧</span>
            <h1 className="text-3xl sm:text-5xl font-light text-white mb-4 tracking-tight">
              Cognitive <span className="font-serif-editorial italic font-normal">Repository</span>
            </h1>
            <p className="text-sm uppercase tracking-[0.2em] text-neutral-400 max-w-lg mx-auto font-light">
              Synthesized memory vaults, calibrated for long-term neural retention.
            </p>
          </div>

          {/* Stats */}
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
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Active Synchronized
              </p>
            </div>
          </div>

          {/* Decks */}
          <div>
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-xl font-medium tracking-wide text-white">Your Flashcard Decks</h2>
              <span className="text-xs uppercase tracking-[0.2em] text-neutral-500 font-mono">Vault Storage</span>
            </div>

            {loadingSets ? (
              <div className="text-center py-16">
                <div className="text-neutral-400 text-xs uppercase tracking-[0.2em] animate-pulse">Accessing neural index…</div>
              </div>
            ) : flashcardSets.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {flashcardSets.map((set, index) => (
                  <motion.div
                    key={set.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.08 }}
                    className="glass-editorial rounded-2xl p-6 border border-white/10 hover:border-white/25 transition-all group flex flex-col justify-between"
                  >
                    <div>
                      <h3 className="text-base font-medium text-white mb-2 tracking-wide line-clamp-1">{set.title}</h3>
                      <p className="text-neutral-500 text-xs font-light mb-5 line-clamp-2 leading-relaxed">{set.description || "Synthesized via Ankify AI"}</p>
                    </div>

                    <div className="pt-4 border-t border-white/5">
                      <div className="flex justify-between items-center text-xs text-neutral-500 mb-4 font-mono">
                        <span>{set.card_count || 0} Cards</span>
                        <span>{new Date(set.created_at).toLocaleDateString()}</span>
                      </div>

                      <div className="flex gap-2">
                        <button
                          onClick={() => openFlashcardSet(set)}
                          className="flex-1 bg-white hover:bg-neutral-200 text-black py-2.5 px-4 rounded-full transition-colors text-xs uppercase tracking-[0.15em] font-semibold"
                        >
                          Study
                        </button>
                        <button
                          onClick={() => exportAnki(set)}
                          title="Export to Anki"
                          className="px-3 py-2.5 rounded-full border border-white/15 hover:border-white/40 text-neutral-400 hover:text-white transition-all"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(set.id)}
                          title="Delete deck"
                          className="px-3 py-2.5 rounded-full border border-white/10 hover:border-red-500/40 text-neutral-500 hover:text-red-400 transition-all"
                        >
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
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

      {/* Delete Confirm Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-editorial rounded-2xl p-8 max-w-sm w-full border border-white/10 text-center"
            >
              <h3 className="text-lg font-medium text-white mb-2">Delete this deck?</h3>
              <p className="text-sm text-neutral-400 mb-6 font-light">This action cannot be undone. All cards in this deck will be permanently removed.</p>
              <div className="flex gap-3">
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 py-2.5 rounded-full border border-white/15 text-neutral-300 hover:text-white text-xs uppercase tracking-[0.15em] transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDelete(deleteConfirm)}
                  className="flex-1 py-2.5 rounded-full bg-red-500/20 border border-red-500/30 text-red-300 hover:bg-red-500/30 text-xs uppercase tracking-[0.15em] transition-all"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}