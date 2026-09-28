"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Floating3DCard, FloatingQuestionBadge } from "./Decorative3DObjects";

export function SynthesizeSection() {
  const router = useRouter();
  const { user } = useAuth();
  const [tab, setTab] = useState<"text" | "youtube">("text");
  const [inputVal, setInputVal] = useState("");
  const [loading, setLoading] = useState(false);

  const handleGenerate = () => {
    setLoading(true);
    // Smooth transition into auth or convert
    setTimeout(() => {
      if (user) {
        router.push("/convert");
      } else {
        router.push("/auth");
      }
    }, 450);
  };

  return (
    <section
      id="synthesize"
      className="relative w-full py-28 sm:py-36 px-4 bg-[#080808] flex items-center justify-center overflow-hidden border-t border-white/[0.06]"
    >
      {/* Subtle Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[720px] h-[480px] bg-white/[0.018] rounded-full blur-[160px] pointer-events-none" />

      {/* Decorative Floating 3D Elements */}
      <Floating3DCard
        className="hidden md:block absolute top-20 left-12"
        delay={0.3}
        label="Query Synthesizer"
        code="MK-IX"
      />
      <FloatingQuestionBadge
        className="hidden sm:inline-flex absolute bottom-24 right-16"
        delay={0.6}
      />

      {/* Main Container Card matching the 5th image reference */}
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-[620px] rounded-3xl bg-[#101010] border border-white/10 p-6 sm:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.85)] flex flex-col items-center select-none"
      >
        {/* Japanese subtitle / kanji kicker from reference */}
        <div className="text-[11px] sm:text-xs text-white/50 tracking-[0.25em] font-light mb-2 text-center font-jp">
          自然言語 ・ 高度抽出
        </div>

        {/* Title: Synthesize Cards with italic Cards */}
        <h3 className="text-3xl sm:text-4xl text-white font-normal tracking-tight text-center mb-3">
          Synthesize <span className="font-serif-editorial italic font-normal text-white/95">Cards</span>
        </h3>

        {/* Subtitle in uppercase monospace */}
        <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.16em] text-white/50 text-center max-w-[420px] mb-8 leading-relaxed font-mono">
          Transform unstructured source knowledge into atomic recall units.
        </p>

        {/* Pill Selector: TEXT STREAM / YOUTUBE URL */}
        <div className="inline-flex p-1 rounded-full bg-[#181818] border border-white/10 mb-6">
          <button
            type="button"
            onClick={() => setTab("text")}
            className={`px-6 py-2 rounded-full text-xs font-semibold tracking-wider uppercase transition-all duration-200 cursor-pointer ${
              tab === "text"
                ? "bg-white text-black shadow-sm"
                : "text-white/60 hover:text-white"
            }`}
          >
            TEXT STREAM
          </button>
          <button
            type="button"
            onClick={() => setTab("youtube")}
            className={`px-6 py-2 rounded-full text-xs font-semibold tracking-wider uppercase transition-all duration-200 cursor-pointer ${
              tab === "youtube"
                ? "bg-white text-black shadow-sm"
                : "text-white/60 hover:text-white"
            }`}
          >
            YOUTUBE URL
          </button>
        </div>

        {/* Input Area */}
        <div className="w-full mb-6">
          {tab === "text" ? (
            <textarea
              rows={5}
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="Paste comprehensive notes, dense research articles, or lecture summaries here..."
              className="w-full bg-[#161616] text-white/90 placeholder-white/30 text-xs sm:text-sm p-4 rounded-xl border border-white/10 focus:outline-none focus:border-white/30 transition-all resize-none leading-relaxed font-light"
            />
          ) : (
            <div className="relative">
              <input
                type="text"
                value={inputVal}
                onChange={(e) => setInputVal(e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
                className="w-full bg-[#161616] text-white/90 placeholder-white/30 text-xs sm:text-sm p-4 rounded-xl border border-white/10 focus:outline-none focus:border-white/30 transition-all font-mono"
              />
              <span className="absolute right-4 top-3.5 text-white/30 text-xs font-mono">
                URL
              </span>
            </div>
          )}
        </div>

        {/* GENERATE FLASHCARDS Button from reference pic */}
        <motion.button
          type="button"
          onClick={handleGenerate}
          disabled={loading}
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.99 }}
          className="w-full py-4 rounded-xl bg-[#525252] hover:bg-[#686868] active:bg-[#404040] text-white/90 hover:text-white font-medium text-xs sm:text-[13px] tracking-[0.14em] uppercase transition-all duration-200 shadow-md cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2 group"
        >
          {loading ? (
            <span className="flex items-center gap-2 text-white">
              <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              <span>LAUNCHING ENGINE...</span>
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <span>GENERATE FLASHCARDS</span>
              <span className="group-hover:translate-x-1 transition-transform">→</span>
            </span>
          )}
        </motion.button>

        {/* Small subtitle indicator */}
        <div className="mt-4 text-[10px] text-white/40 font-mono text-center">
          {user ? "Redirecting to your generator workspace" : "One-click access • Free sign in required to save cards"}
        </div>
      </motion.div>
    </section>
  );
}
