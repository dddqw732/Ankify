"use client";

import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { PLANS } from "@/lib/plans";
import { MouseScrubHero } from "./components/MouseScrubHero";
import { WorkflowSection } from "./components/WorkflowSection";
import { SynthesizeSection } from "./components/SynthesizeSection";
import {
  Floating3DCard,
  FloatingStar,
  FloatingNotebook,
} from "./components/Decorative3DObjects";

const features = [
  {
    jp: "知能化",
    kr: "지능化",
    title: "AI-Powered Flashcards",
    description:
      "Synthesize dense literature, scientific documentation, or lecture streams into precise atomic Anki cards.",
    icon: (
      <svg
        className="w-5 h-5 text-white"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M12 4.5v15m7.5-7.5h-15"
        />
      </svg>
    ),
  },
  {
    jp: "同調性",
    kr: "동기화",
    title: "Direct Anki Ecosystem",
    description:
      "Export clean TSV / APKG formats calibrated with MathJax, LaTeX formulas, and chemistry notations.",
    icon: (
      <svg
        className="w-5 h-5 text-white"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 7.5V6a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 6v1.5M3 7.5v10.125A2.375 2.375 0 005.375 20h13.25A2.375 2.375 0 0021 17.625V7.5M3 7.5h18"
        />
      </svg>
    ),
  },
  {
    jp: "多面的",
    kr: "다차원",
    title: "Multimodal Video & Text",
    description:
      "Process live YouTube URLs, timestamped lecture transcripts, and complex research PDFs in seconds.",
    icon: (
      <svg
        className="w-5 h-5 text-white"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-3A2.25 2.25 0 008.25 5.25V9m7.5 0v10.5A2.25 2.25 0 0113.5 21h-3A2.25 2.25 0 018.25 19.5V9m7.5 0h-9"
        />
      </svg>
    ),
  },
];

const steps = [
  {
    step: "01",
    tag: "インプット / 입력",
    title: "Ingest Your Material",
    description: "Paste a lecture script, YouTube link, or raw theoretical notes.",
  },
  {
    step: "02",
    tag: "抽出 / 추론",
    title: "Atomic Fact Extraction",
    description:
      "Neural models identify cognitive primitives and construct testable queries.",
  },
  {
    step: "03",
    tag: "定着 / 완성",
    title: "Sync with Spaced Repetition",
    description:
      "Export instantly into Anki and achieve flawless recall without study fatigue.",
  },
];

const quotes = [
  {
    quote:
      "Turned 40-page neurology research papers into master-level Anki decks in 30 seconds.",
    author: "K. Takahashi",
    affiliation: "Kyoto University",
    cjk: "高橋 研",
  },
  {
    quote:
      "The cleanest study workflow ever built. No distractions, just pure retention architecture.",
    author: "Min-Jun Park",
    affiliation: "KAIST AI Lab",
    cjk: "박민준",
  },
];

function SubscriptionPlans({ user }: { user: any }) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleSubscribe = async (variantId: string) => {
    setLoading(variantId);
    try {
      const email = user?.email;
      if (!email) {
        alert("You must be signed in to subscribe. Redirecting to sign in...");
        window.location.href = "/auth";
        return;
      }
      const returnUrl = window.location.origin + "/dashboard";
      const res = await fetch("/api/lemonsqueezy/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variantId, email, returnUrl }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Checkout currently unavailable");
      window.location.href = data.url;
    } catch (err: any) {
      alert("Payment Gateway Notice: " + err.message);
    } finally {
      setLoading(null);
    }
  };

  return (
    <section className="max-w-6xl mx-auto w-full py-24 px-6 relative z-10" id="plans">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-16"
      >
        <div className="flex items-center justify-center gap-3 text-xs tracking-[0.3em] uppercase text-white/50 mb-3">
          <span className="font-jp">会員プラン</span>
          <span>•</span>
          <span className="font-kr">멤버십 플랜</span>
        </div>
        <h2 className="text-4xl md:text-5xl font-serif-editorial text-white tracking-tight">
          Curated Membership
        </h2>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {PLANS.map((plan, i) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.5, delay: i * 0.12 }}
            className="glass-editorial rounded-2xl p-8 flex flex-col justify-between border border-white/10 hover:border-white/25 transition-all duration-300 relative group"
          >
            {i === 1 && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white text-black text-[10px] uppercase font-bold tracking-[0.2em] px-3 py-1 rounded-full shadow-lg">
                Popular • 標準
              </div>
            )}
            <div>
              <div className="flex justify-between items-baseline mb-4">
                <h3 className="text-xl font-medium text-white tracking-wide">
                  {plan.name}
                </h3>
                <span className="text-2xl font-serif-editorial text-white">
                  {plan.price}
                </span>
              </div>
              <p className="text-sm text-neutral-400 mb-6 font-light">
                {plan.description}
              </p>
              <div className="h-px w-full bg-white/10 mb-6" />
              <ul className="space-y-3 mb-8 text-sm text-neutral-300">
                {plan.features.map((feat, idx) => (
                  <li key={idx} className="flex items-center gap-3">
                    <span className="w-1 h-1 rounded-full bg-white/60" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              onClick={() => handleSubscribe(plan.variantId)}
              disabled={loading === plan.variantId}
              className="w-full py-3.5 px-6 rounded-full text-xs uppercase tracking-[0.2em] font-medium transition-all duration-300 bg-white/10 hover:bg-white text-white hover:text-black border border-white/20 hover:border-white cursor-pointer"
            >
              {loading === plan.variantId ? "Processing..." : "Select Plan"}
            </button>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { user, signOut } = useAuth();

  return (
    <div className="min-h-screen bg-[#080808] text-[#f3f3f3] relative selection:bg-white selection:text-black bg-grain overflow-x-hidden">
      {/* Top Navigation Bar */}
      <header className="fixed top-0 left-0 w-full z-50 px-6 sm:px-12 py-5 flex items-center justify-between backdrop-blur-md bg-black/60 border-b border-white/[0.06]">
        {/* Brand Logo & Character Head (Direct, without circle, slightly larger) */}
        <Link href="/" className="flex items-center gap-3.5 group select-none">
          <img
            src="/logo_character.png"
            alt="Ankify Character Logo"
            className="w-10 h-10 sm:w-11 sm:h-11 object-contain drop-shadow-[0_2px_8px_rgba(255,255,255,0.2)] group-hover:scale-105 transition-transform"
          />
          <div className="flex items-center gap-2">
            <span
              className="text-xl sm:text-2xl tracking-tight text-white font-medium"
              style={{ fontFamily: "var(--font-heading)" }}
            >
              Ankify®
            </span>
            <span
              className="text-white text-xl sm:text-2xl select-none leading-none opacity-90"
              style={{ letterSpacing: "-0.02em" }}
            >
              ✳︎
            </span>
          </div>
        </Link>

        {/* Desktop Links */}
        <nav className="hidden md:flex items-center gap-8 text-xs tracking-[0.2em] uppercase text-neutral-400">
          <a href="#workflow" className="hover:text-white transition-colors">
            Workflow
          </a>
          <a href="#features" className="hover:text-white transition-colors">
            Architecture
          </a>
          <a href="#how-it-works" className="hover:text-white transition-colors">
            System
          </a>
          <a href="#synthesize" className="hover:text-white transition-colors">
            Synthesize
          </a>
          <a href="#plans" className="hover:text-white transition-colors">
            Access
          </a>
        </nav>

        {/* User / CTA */}
        <div className="hidden md:flex items-center gap-4">
          {user ? (
            <>
              <Link
                href="/dashboard"
                className="text-xs tracking-[0.15em] uppercase text-neutral-300 hover:text-white px-4 py-2 transition-colors"
              >
                Dashboard
              </Link>
              <button
                onClick={() => signOut()}
                className="text-xs tracking-[0.15em] uppercase text-neutral-400 hover:text-red-400 px-3 py-2 transition-colors cursor-pointer"
              >
                Sign Out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/auth"
                className="text-xs tracking-[0.15em] uppercase text-neutral-300 hover:text-white px-4 py-2 transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/convert"
                className="glass-pill text-xs tracking-[0.2em] uppercase text-white font-medium px-5 py-2.5 rounded-full hover:bg-white hover:text-black transition-all duration-300"
              >
                Start for Free
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden text-white/80 hover:text-white p-2 cursor-pointer"
          aria-label="Toggle menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {isMenuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
            )}
          </svg>
        </button>
      </header>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed inset-0 z-40 bg-[#080808]/98 backdrop-blur-2xl pt-28 px-8 flex flex-col gap-6 md:hidden"
          >
            <nav className="flex flex-col gap-6 text-lg tracking-[0.15em] uppercase text-neutral-300">
              <a href="#workflow" onClick={() => setIsMenuOpen(false)} className="hover:text-white">Workflow</a>
              <a href="#features" onClick={() => setIsMenuOpen(false)} className="hover:text-white">Architecture</a>
              <a href="#how-it-works" onClick={() => setIsMenuOpen(false)} className="hover:text-white">System</a>
              <a href="#synthesize" onClick={() => setIsMenuOpen(false)} className="hover:text-white">Synthesize</a>
              <a href="#plans" onClick={() => setIsMenuOpen(false)} className="hover:text-white">Access</a>
            </nav>
            <div className="pt-6 border-t border-white/10 flex flex-col gap-4">
              <Link
                href="/convert"
                onClick={() => setIsMenuOpen(false)}
                className="w-full text-center py-3.5 rounded-full bg-white text-black font-semibold text-xs tracking-widest uppercase"
              >
                Get Started Free
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =========================================================================
          HERO SECTION WITH MOUSE-SCRUBBING VIDEO BACKGROUND & MOVING 3D CHARACTER:
          - Character's head scrubs & turns based on horizontal mouse movement
          - Blurred intro label
          - Typewriter text with blinking cursor
          - Action pill buttons
         ========================================================================= */}
      <MouseScrubHero />

      {/* =========================================================================
          WORKFLOW SECTION:
          - Visual UI demonstration of:
            YouTube Video / Long Text -> Ankify AI -> Smart Flashcards -> Retention & Sync
         ========================================================================= */}
      <WorkflowSection />

      {/* =========================================================================
          FEATURES / ARCHITECTURE
         ========================================================================= */}
      <section id="features" className="py-24 px-6 sm:px-12 max-w-7xl mx-auto border-t border-white/[0.06] relative z-10">
        <FloatingNotebook className="hidden md:block absolute top-12 right-12" delay={0.4} />

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-3 text-xs tracking-[0.3em] uppercase text-neutral-400 mb-12"
        >
          <span className="font-jp">基盤構造</span>
          <span>/</span>
          <span className="font-kr">03 • 시스템 설계</span>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: i * 0.12 }}
              className="glass-editorial rounded-2xl p-8 border border-white/[0.08] hover:border-white/20 transition-all duration-300 flex flex-col justify-between group"
            >
              <div>
                <div className="flex justify-between items-center mb-8">
                  <div className="w-10 h-10 rounded-full border border-white/20 flex items-center justify-center text-white/80 group-hover:border-white transition-colors">
                    {feat.icon}
                  </div>
                  <span className="text-[10px] tracking-[0.25em] text-neutral-400 font-jp">
                    {feat.jp} • {feat.kr}
                  </span>
                </div>
                <h3 className="text-xl font-medium text-white mb-3 tracking-wide">{feat.title}</h3>
                <p className="text-sm text-neutral-400 font-light leading-relaxed">{feat.description}</p>
              </div>

              <div className="mt-8 pt-4 border-t border-white/[0.05] flex items-center justify-between text-[10px] uppercase tracking-widest text-neutral-400">
                <span>Core Module</span>
                <span>0{i + 1}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          HOW IT WORKS (SYSTEM)
         ========================================================================= */}
      <section id="how-it-works" className="py-24 px-6 sm:px-12 max-w-7xl mx-auto border-t border-white/[0.06] relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          className="flex items-center gap-3 text-xs tracking-[0.3em] uppercase text-neutral-400 mb-12"
        >
          <span className="font-jp">実行フロー</span>
          <span>/</span>
          <span className="font-kr">04 • 프로세스</span>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((s, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: idx * 0.12 }}
              className="border-t border-white/20 pt-6 flex flex-col justify-between min-h-[220px]"
            >
              <div>
                <div className="flex justify-between items-center text-xs tracking-widest text-neutral-400 mb-4">
                  <span className="text-white font-cinzel text-lg">{s.step}</span>
                  <span className="font-jp text-[11px] text-white/40">{s.tag}</span>
                </div>
                <h4 className="text-lg font-medium text-white mb-3">{s.title}</h4>
                <p className="text-sm text-neutral-400 font-light leading-relaxed">{s.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          SYNTHESIZE CARDS CTA SECTION (Image 5 Reference with Functional Action):
          - Clicking "GENERATE FLASHCARDS" redirects to /auth (or /convert if logged in)
         ========================================================================= */}
      <SynthesizeSection />

      {/* =========================================================================
          PRICING / ACCESS
         ========================================================================= */}
      <SubscriptionPlans user={user} />

      {/* =========================================================================
          TESTIMONIALS / QUOTES
         ========================================================================= */}
      <section className="py-24 px-6 sm:px-12 max-w-5xl mx-auto border-t border-white/[0.06] text-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          className="flex items-center justify-center gap-3 text-xs tracking-[0.3em] uppercase text-neutral-400 mb-12"
        >
          <span className="font-jp">証言</span>
          <span>•</span>
          <span className="font-kr">추천사</span>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
          {quotes.map((q, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="glass-editorial p-8 rounded-2xl border border-white/[0.08] text-left"
            >
              <p className="text-base text-neutral-300 font-light italic mb-6 leading-relaxed">
                "{q.quote}"
              </p>
              <div className="flex items-center justify-between text-xs">
                <div>
                  <div className="font-medium text-white">{q.author}</div>
                  <div className="text-neutral-400 text-[11px]">{q.affiliation}</div>
                </div>
                <span className="text-sm text-neutral-400 font-jp">{q.cjk}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          FOOTER: Editorial Clean
         ========================================================================= */}
      <footer className="w-full py-12 px-6 sm:px-12 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-6 text-xs text-neutral-400 relative z-10">
        <div className="flex items-center gap-4">
          <span className="font-cinzel text-white text-sm">ANKIFY</span>
          <span>•</span>
          <span className="font-jp text-[10px]">認知革命 • 2026</span>
        </div>
        <p className="text-neutral-400 font-light">
          Sculpted for scholars, researchers, and creators.
        </p>
        <div className="flex gap-6 text-[11px] uppercase tracking-wider">
          <a href="#" className="hover:text-white transition-colors">Twitter</a>
          <a href="#" className="hover:text-white transition-colors">Discord</a>
          <a href="#" className="hover:text-white transition-colors">GitHub</a>
        </div>
      </footer>
    </div>
  );
}
