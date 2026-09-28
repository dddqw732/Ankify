import React, { useRef, useState } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { AnkifyDashboard } from './AnkifyDashboard'
import { FadeUp } from './FadeUp'
import { PrimaryButton } from './PrimaryButton'
import { MIcon } from './MIcon'

export const AnkifyFeatureSection: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null)
  const [copied, setCopied] = useState(false)

  // Subtle parallax effect on scroll
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start'],
  })

  const dashboardY = useTransform(scrollYProgress, [0, 1], ['100px', '-100px'])

  return (
    <section
      ref={sectionRef}
      id="ai-flashcards"
      className="relative w-full overflow-hidden bg-black"
      style={{
        background:
          'linear-gradient(to bottom, #000000 0%, #0d0d0d 40%, #141414 100%)',
      }}
    >
      {/* Abstract AI / Learning ambient background (never competing with UI) */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Soft radial ambient glow */}
        <div className="absolute top-1/4 right-[10%] w-[550px] h-[550px] bg-white/[0.025] rounded-full blur-[140px]" />
        <div className="absolute bottom-1/3 left-[5%] w-[450px] h-[450px] bg-white/[0.018] rounded-full blur-[120px]" />

        {/* Faint subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.7) 1px, transparent 0)',
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      <div className="relative mx-auto max-w-[1080px] px-4 sm:px-6 pt-24 sm:pt-32 md:pt-40 pb-20 md:pb-32">
        {/* Two-column desktop layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-start relative z-10">
          {/* Left Column: Headlines, copy, process sequence, and CTA */}
          <div className="flex flex-col justify-start max-w-xl">
            {/* Pill category badge */}
            <FadeUp delay={0.1}>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full liquid-glass-card text-[11px] font-mono tracking-wide text-white/80 mb-6 w-fit">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span>ANKIFY INTELLIGENCE</span>
                <span className="text-white/30">|</span>
                <span className="text-white/50">YOUTUBE & TEXT SYNTHESIS</span>
              </div>
            </FadeUp>

            {/* Headline */}
            <FadeUp delay={0.2}>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-normal tracking-[-0.02em] leading-[1.08] text-white mb-6">
                Turn any video into
                <span className="text-white/50"> flashcards with AI.</span>
              </h2>
            </FadeUp>

            {/* Supporting description */}
            <FadeUp delay={0.3}>
              <p className="text-base sm:text-lg text-white/70 font-light leading-relaxed mb-4">
                Stop pausing videos and writing notes manually. Ankify understands
                your content and transforms it into clear, self-contained
                flashcards in seconds.
              </p>
              <p className="text-sm sm:text-base text-white/50 font-light leading-relaxed mb-8">
                Learn from YouTube videos, long texts, and your own study material.
              </p>
            </FadeUp>

            {/* AI 3-Step Transformation Visual */}
            <FadeUp delay={0.4}>
              <div className="p-3.5 rounded-xl liquid-glass mb-8 max-w-md">
                <div className="text-[10px] font-mono uppercase tracking-wider text-white/40 mb-2.5">
                  How it works
                </div>
                <div className="flex items-center justify-between text-xs text-white/80">
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white">
                      <MIcon name="play_circle" size={16} />
                    </div>
                    <span className="text-[11px] text-white/70">1. Video / Text</span>
                  </div>

                  <span className="text-white/30 text-xs">→</span>

                  <div className="flex flex-col items-center gap-1">
                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white">
                      <MIcon name="auto_awesome" size={16} />
                    </div>
                    <span className="text-[11px] text-white/70">2. AI Analysis</span>
                  </div>

                  <span className="text-white/30 text-xs">→</span>

                  <div className="flex flex-col items-center gap-1">
                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-white">
                      <MIcon name="style" size={16} />
                    </div>
                    <span className="text-[11px] text-white/70">3. Flashcards</span>
                  </div>
                </div>
              </div>
            </FadeUp>

            {/* Primary CTA button */}
            <FadeUp delay={0.5}>
              <div className="flex flex-wrap items-center gap-4">
                <PrimaryButton
                  onClick={() => {
                    const el = document.getElementById('synthesize-cta')
                    el?.scrollIntoView({ behavior: 'smooth' })
                  }}
                >
                  Try Ankify for free
                </PrimaryButton>

                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText('hello@ankify.ai')
                    setCopied(true)
                    setTimeout(() => setCopied(false), 2000)
                  }}
                  className="inline-flex items-center gap-2 px-4 py-3 rounded-full text-xs font-mono text-white/60 hover:text-white transition-colors cursor-pointer border border-white/10 hover:border-white/20"
                >
                  <MIcon name="content_copy" size={13} />
                  <span>{copied ? 'Copied to clipboard' : 'hello@ankify.ai'}</span>
                </button>
              </div>
            </FadeUp>
          </div>

          {/* Right Column / Floating Mockup on desktop */}
          <div className="relative w-full lg:min-h-[560px] flex items-center justify-center">
            <motion.div
              style={{ y: dashboardY }}
              className="w-full relative z-10 transition-all duration-300"
            >
              <AnkifyDashboard />
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
