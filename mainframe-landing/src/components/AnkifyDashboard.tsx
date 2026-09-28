import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MIcon } from './MIcon'
import { cn } from '../lib/utils'

interface Flashcard {
  id: number
  question: string
  answer: string
}

const SAMPLE_CARDS: Flashcard[] = [
  {
    id: 1,
    question: 'What is photosynthesis?',
    answer:
      'Photosynthesis is the process by which plants and other autotrophs convert light energy into chemical energy, primarily synthesizing glucose and releasing oxygen as a byproduct.',
  },
  {
    id: 2,
    question: 'What role does chlorophyll play?',
    answer:
      'Chlorophyll pigments absorb specific wavelengths of blue and red light within thylakoid membranes, transferring excited electrons to catalyze the light-dependent reactions.',
  },
  {
    id: 3,
    question: 'How does light intensity affect the rate of photosynthesis?',
    answer:
      'As light intensity rises, the photosynthetic rate increases linearly until a photochemical saturation point is reached, after which temperature or CO2 becomes the limiting factor.',
  },
  {
    id: 4,
    question: 'What are the key products of the Calvin cycle?',
    answer:
      'The Calvin cycle consumes ATP and NADPH to fix carbon dioxide into glyceraldehyde-3-phosphate (G3P), the fundamental building block for glucose synthesis.',
  },
  {
    id: 5,
    question: 'Why is photosynthesis critical to terrestrial ecosystems?',
    answer:
      'It produces primary organic biomass and atmospheric oxygen that sustain almost all aerobic and heterotrophic trophic levels across planet Earth.',
  },
]

export const AnkifyDashboard: React.FC = () => {
  const [sourceType, setSourceType] = useState<'youtube' | 'text'>('youtube')
  const [currentCardIndex, setCurrentCardIndex] = useState(0)
  const [inputVal, setInputVal] = useState(
    'https://youtube.com/watch?v=sQK3Yr4Sc_k'
  )
  const [generationStep, setGenerationStep] = useState<
    'idle' | 'analyzing' | 'creating' | 'done'
  >('done')

  // Auto cyclic simulation every 14 seconds to feel alive and dynamic
  useEffect(() => {
    const cycleTimer = setInterval(() => {
      setGenerationStep('analyzing')
      setTimeout(() => {
        setGenerationStep('creating')
        setTimeout(() => {
          setGenerationStep('done')
        }, 1800)
      }, 1600)
    }, 14000)

    return () => clearInterval(cycleTimer)
  }, [])

  const handleGenerate = () => {
    setGenerationStep('analyzing')
    setTimeout(() => {
      setGenerationStep('creating')
      setTimeout(() => {
        setGenerationStep('done')
      }, 1600)
    }, 1400)
  }

  const activeCard = SAMPLE_CARDS[currentCardIndex]

  const nextCard = () => {
    setCurrentCardIndex((prev) => (prev + 1) % SAMPLE_CARDS.length)
  }

  const prevCard = () => {
    setCurrentCardIndex(
      (prev) => (prev - 1 + SAMPLE_CARDS.length) % SAMPLE_CARDS.length
    )
  }

  return (
    <div className="liquid-glass w-full max-w-[1100px] aspect-[3/4] sm:aspect-[16/10] lg:aspect-[16/9] rounded-2xl mx-auto overflow-hidden p-2 sm:p-3 select-none flex flex-col justify-between">
      <div className="grid h-full grid-cols-1 sm:grid-cols-[minmax(220px,320px)_1fr] gap-2 sm:gap-3">
        {/* LEFT PANEL: AI Generation */}
        <div className="liquid-glass-card rounded-xl p-3 sm:p-4 flex flex-col justify-between relative overflow-hidden">
          {/* Top subtle glow */}
          <div className="absolute -top-12 -left-12 w-28 h-28 bg-white/5 rounded-full blur-2xl pointer-events-none" />

          <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-xs font-semibold uppercase tracking-wider text-white/90">
                  Ankify AI
                </span>
              </div>
              <span className="text-[10px] text-white/40 tracking-tight font-mono">
                v2.4 Neural
              </span>
            </div>

            <p className="text-[11px] text-white/60 mb-3 font-normal">
              Turn content into flashcards
            </p>

            {/* Source Selector Tab */}
            <div className="grid grid-cols-2 p-0.5 rounded-lg bg-black/50 border border-white/10 mb-3.5">
              <button
                type="button"
                onClick={() => {
                  setSourceType('youtube')
                  setInputVal('https://youtube.com/watch?v=sQK3Yr4Sc_k')
                }}
                className={cn(
                  'flex items-center justify-center gap-1.5 py-1.5 rounded-md text-[11px] font-medium transition-all duration-200 cursor-pointer',
                  sourceType === 'youtube'
                    ? 'bg-white text-black shadow-sm'
                    : 'text-white/60 hover:text-white'
                )}
              >
                <MIcon
                  name="play_circle"
                  size={14}
                  className={sourceType === 'youtube' ? 'text-black' : 'text-white/60'}
                />
                YouTube
              </button>
              <button
                type="button"
                onClick={() => {
                  setSourceType('text')
                  setInputVal(
                    'Photosynthesis occurs in plants and algae. In the light reactions...'
                  )
                }}
                className={cn(
                  'flex items-center justify-center gap-1.5 py-1.5 rounded-md text-[11px] font-medium transition-all duration-200 cursor-pointer',
                  sourceType === 'text'
                    ? 'bg-white text-black shadow-sm'
                    : 'text-white/60 hover:text-white'
                )}
              >
                <MIcon
                  name="description"
                  size={14}
                  className={sourceType === 'text' ? 'text-black' : 'text-white/60'}
                />
                Text
              </button>
            </div>

            {/* Input Field */}
            <div className="mb-3">
              <label className="text-[10px] uppercase font-mono tracking-wider text-white/50 block mb-1.5 flex items-center justify-between">
                <span>{sourceType === 'youtube' ? 'Video URL' : 'Source Document'}</span>
                <span className="text-[9px] text-emerald-400/80">Ready</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={inputVal}
                  onChange={(e) => setInputVal(e.target.value)}
                  placeholder={
                    sourceType === 'youtube'
                      ? 'https://youtube.com/watch?v=...'
                      : 'Paste notes or text...'
                  }
                  className="w-full liquid-glass-input text-[11px] font-mono text-white/90 px-2.5 py-2 rounded-lg focus:outline-none focus:border-white/30 transition-all pr-7"
                />
                <span className="absolute right-2 top-2.5 text-white/40">
                  <MIcon
                    name={sourceType === 'youtube' ? 'link' : 'edit_note'}
                    size={14}
                  />
                </span>
              </div>
            </div>

            {/* Generate Flashcards Button */}
            <button
              type="button"
              onClick={handleGenerate}
              disabled={generationStep !== 'done'}
              className="w-full flex items-center justify-center gap-2 py-2 px-3 rounded-lg bg-white/10 hover:bg-white/20 active:bg-white/25 border border-white/15 text-[11px] font-medium text-white transition-all duration-200 shadow-sm cursor-pointer disabled:opacity-60"
            >
              <MIcon name="auto_awesome" size={13} className="text-white" />
              <span>Generate Flashcards</span>
            </button>
          </div>

          {/* Dynamic AI Status Block */}
          <div className="mt-3 pt-3 border-t border-white/10">
            <div className="text-[10px] text-white/50 mb-1 flex items-center gap-1.5">
              <MIcon name="smart_toy" size={12} className="text-white/60" />
              <span>AI Pipeline</span>
            </div>

            <div className="bg-black/40 rounded-lg p-2 border border-white/5">
              {generationStep === 'analyzing' && (
                <div className="flex items-center gap-2 text-[11px] text-white/80">
                  <span className="w-2 h-2 rounded-full border border-white/40 border-t-white animate-spin" />
                  <span>Analyzing video...</span>
                </div>
              )}
              {generationStep === 'creating' && (
                <div className="flex items-center gap-2 text-[11px] text-white/80">
                  <span className="w-2 h-2 rounded-full border border-white/40 border-t-white animate-spin" />
                  <span>Creating flashcards...</span>
                </div>
              )}
              {generationStep === 'done' && (
                <div className="flex items-center justify-between text-[11px]">
                  <span className="flex items-center gap-1.5 text-white/90 font-medium">
                    <span className="text-emerald-400">✓</span> 24 flashcards generated
                  </span>
                  <span className="text-[9px] font-mono text-white/40">0.9s</span>
                </div>
              )}

              {/* Progress bar */}
              <div className="w-full bg-white/10 h-1 rounded-full overflow-hidden mt-1.5">
                <motion.div
                  className="bg-white h-full rounded-full"
                  animate={{
                    width:
                      generationStep === 'analyzing'
                        ? '45%'
                        : generationStep === 'creating'
                        ? '85%'
                        : '100%',
                  }}
                  transition={{ duration: 0.4 }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: Flashcard Preview & List */}
        <div className="liquid-glass-card rounded-xl p-3 sm:p-5 flex flex-col justify-between overflow-hidden relative">
          {/* Header & Meta */}
          <div className="flex items-center justify-between mb-3 border-b border-white/10 pb-2.5">
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-xs sm:text-sm font-semibold tracking-tight text-white">
                  Generated Flashcards
                </h4>
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-white/10 border border-white/15 text-[9px] text-white/80 font-mono">
                  <MIcon name="auto_awesome" size={9} />
                  AI Generated
                </span>
              </div>
              <p className="text-[11px] text-white/50 mt-0.5">
                24 cards · AI generated
              </p>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-white/60">
                Card {String(activeCard.id).padStart(2, '0')} / 24
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={prevCard}
                  className="p-1 rounded-md bg-white/5 hover:bg-white/15 active:bg-white/20 border border-white/10 text-white/70 hover:text-white transition-all cursor-pointer"
                  title="Previous card"
                >
                  <MIcon name="arrow_back" size={14} />
                </button>
                <button
                  type="button"
                  onClick={nextCard}
                  className="p-1 rounded-md bg-white/5 hover:bg-white/15 active:bg-white/20 border border-white/10 text-white/70 hover:text-white transition-all cursor-pointer"
                  title="Next card"
                >
                  <MIcon name="arrow_forward" size={14} />
                </button>
              </div>
            </div>
          </div>

          {/* Active Flashcard Featured Card */}
          <div className="my-auto py-2">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeCard.id}
                initial={{ opacity: 0, y: 10, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.98 }}
                transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                className="liquid-glass rounded-xl p-4 sm:p-6 border border-white/15 shadow-[0_12px_36px_rgba(0,0,0,0.45)] relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 p-3 opacity-10 pointer-events-none">
                  <MIcon name="psychology" size={64} />
                </div>

                <div className="text-[10px] font-mono uppercase tracking-wider text-white/40 mb-2">
                  Question
                </div>
                <h5 className="text-sm sm:text-base md:text-lg font-medium tracking-tight text-white mb-3">
                  {activeCard.question}
                </h5>

                <div className="w-8 h-[1px] bg-white/20 mb-3" />

                <div className="text-[10px] font-mono uppercase tracking-wider text-white/40 mb-1.5">
                  Answer
                </div>
                <p className="text-xs sm:text-[13px] md:text-sm text-white/80 leading-relaxed font-light">
                  {activeCard.answer}
                </p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Subtle Flashcard List Behind / Underneath */}
          <div className="pt-2 border-t border-white/10">
            <div className="text-[10px] uppercase font-mono tracking-wider text-white/40 mb-1.5 flex items-center justify-between">
              <span>Deck Sequence Preview</span>
              <span className="text-[9px] text-white/30">Click to switch</span>
            </div>
            <div className="space-y-1 overflow-hidden max-h-[76px]">
              {SAMPLE_CARDS.map((card, i) => (
                <motion.div
                  key={card.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: i * 0.06 }}
                  onClick={() => setCurrentCardIndex(i)}
                  className={cn(
                    'flex items-center gap-2 px-2 py-1 rounded text-[11px] cursor-pointer transition-colors duration-150',
                    currentCardIndex === i
                      ? 'bg-white/15 text-white font-medium'
                      : 'text-white/50 hover:bg-white/5 hover:text-white/80'
                  )}
                >
                  <span className="font-mono text-[10px] opacity-60">
                    {String(card.id).padStart(2, '0')}
                  </span>
                  <span className="truncate">{card.question}</span>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
