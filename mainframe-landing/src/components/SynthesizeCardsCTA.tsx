import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { MIcon } from './MIcon'
import { cn } from '../lib/utils'

export const SynthesizeCardsCTA: React.FC = () => {
  const [tab, setTab] = useState<'text' | 'youtube'>('text')
  const [textInput, setTextInput] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [generationFeedback, setGenerationFeedback] = useState<string | null>(null)

  const handleGenerate = () => {
    setIsGenerating(true)
    setGenerationFeedback('Analyzing context and extracting atomic principles...')
    setTimeout(() => {
      setGenerationFeedback('Synthesized 18 high-yield flashcards!')
      setIsGenerating(false)
    }, 1800)
  }

  return (
    <section
      id="synthesize-cta"
      className="relative w-full py-28 sm:py-36 px-4 bg-black flex items-center justify-center overflow-hidden border-t border-white/5"
    >
      {/* Background subtle radial spotlight */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[450px] bg-white/[0.02] rounded-full blur-[140px] pointer-events-none" />

      {/* Main Container Card matching the reference image */}
      <div className="relative z-10 w-full max-w-[620px] rounded-3xl bg-[#101010] border border-white/10 p-6 sm:p-10 shadow-[0_20px_60px_rgba(0,0,0,0.85)] flex flex-col items-center">
        {/* Japanese subtitle / kanji kicker from the reference */}
        <div className="text-[11px] sm:text-xs text-white/50 tracking-[0.25em] font-light mb-2 text-center">
          自然言語 ・ 高度抽出
        </div>

        {/* Title: Synthesize Cards (with italic Cards) */}
        <h3 className="text-3xl sm:text-4xl text-white font-normal tracking-tight text-center mb-3">
          Synthesize <span className="italic font-serif font-light text-white/95">Cards</span>
        </h3>

        {/* Subtitle in uppercase monospace / tracking */}
        <p className="text-[10px] sm:text-[11px] uppercase tracking-[0.16em] text-white/50 text-center max-w-[420px] mb-8 leading-relaxed font-mono">
          Transform unstructured source knowledge into atomic recall units.
        </p>

        {/* Pill Selector: TEXT STREAM / YOUTUBE URL */}
        <div className="inline-flex p-1 rounded-full bg-[#181818] border border-white/10 mb-6">
          <button
            type="button"
            onClick={() => setTab('text')}
            className={cn(
              'px-6 py-2 rounded-full text-xs font-semibold tracking-wider uppercase transition-all duration-200 cursor-pointer',
              tab === 'text'
                ? 'bg-white text-black shadow-sm'
                : 'text-white/60 hover:text-white'
            )}
          >
            TEXT STREAM
          </button>
          <button
            type="button"
            onClick={() => setTab('youtube')}
            className={cn(
              'px-6 py-2 rounded-full text-xs font-semibold tracking-wider uppercase transition-all duration-200 cursor-pointer',
              tab === 'youtube'
                ? 'bg-white text-black shadow-sm'
                : 'text-white/60 hover:text-white'
            )}
          >
            YOUTUBE URL
          </button>
        </div>

        {/* Big Input Area matching the mockup */}
        <div className="w-full mb-6">
          {tab === 'text' ? (
            <textarea
              rows={5}
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="Paste comprehensive notes, dense research articles, or lecture summaries here..."
              className="w-full bg-[#161616] text-white/90 placeholder-white/30 text-xs sm:text-sm p-4 rounded-xl border border-white/10 focus:outline-none focus:border-white/30 transition-all resize-none leading-relaxed font-light"
            />
          ) : (
            <div className="relative">
              <input
                type="text"
                placeholder="https://youtube.com/watch?v=..."
                className="w-full bg-[#161616] text-white/90 placeholder-white/30 text-xs sm:text-sm p-4 rounded-xl border border-white/10 focus:outline-none focus:border-white/30 transition-all font-mono"
              />
              <span className="absolute right-4 top-4 text-white/30">
                <MIcon name="link" size={18} />
              </span>
            </div>
          )}
        </div>

        {/* GENERATE FLASHCARDS Button from reference pic */}
        <button
          type="button"
          onClick={handleGenerate}
          disabled={isGenerating}
          className="w-full py-4 rounded-xl bg-[#525252] hover:bg-[#686868] active:bg-[#454545] text-white/90 font-medium text-xs sm:text-[13px] tracking-[0.14em] uppercase transition-all duration-200 shadow-md cursor-pointer disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {isGenerating ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              <span>SYNTHESIZING...</span>
            </>
          ) : (
            <span>GENERATE FLASHCARDS</span>
          )}
        </button>

        {/* Live feedback status */}
        {generationFeedback && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 text-xs font-mono text-emerald-400 text-center"
          >
            {generationFeedback}
          </motion.div>
        )}
      </div>
    </section>
  )
}
