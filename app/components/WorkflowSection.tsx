"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Floating3DCard, FloatingStar } from "./Decorative3DObjects";

const SAMPLE_STEPS = [
  {
    num: "01",
    label: "Input Ingestion",
    title: "YouTube Video or Long Text",
    desc: "Paste any lecture URL, scientific paper, or raw notes. Ankify extracts timestamped transcripts and core ideas without manual work.",
    previewType: "input",
  },
  {
    num: "02",
    label: "Neural Extraction",
    title: "Ankify AI Decomposition",
    desc: "Neural language models isolate cognitive primitives, eliminating fluff and structuring atomic recall units.",
    previewType: "ai",
  },
  {
    num: "03",
    label: "Active Recall",
    title: "Smart Self-Contained Cards",
    desc: "Every card includes targeted questions, clear answers, context tags, and MathJax/LaTeX notation.",
    previewType: "card",
  },
  {
    num: "04",
    label: "Spaced Repetition",
    title: "Seamless Retention Sync",
    desc: "Export one-click to Anki (.apkg / .tsv) or review inside Ankify to lock knowledge into long-term memory.",
    previewType: "sync",
  },
];

export function WorkflowSection() {
  const [activeStep, setActiveStep] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  return (
    <section
      id="workflow"
      className="py-24 sm:py-32 px-6 sm:px-12 max-w-7xl mx-auto border-t border-white/[0.06] relative z-10"
    >
      {/* Decorative 3D Elements */}
      <Floating3DCard
        className="hidden lg:block absolute -top-8 right-16 z-0"
        delay={0.2}
        label="Synapse Unit"
        code="AI-04"
      />
      <FloatingStar className="absolute top-12 left-10" delay={0.5} size={16} />

      {/* Section Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="flex flex-col items-start mb-16"
      >
        <div className="flex items-center gap-3 text-xs tracking-[0.3em] uppercase text-neutral-400 mb-4">
          <span className="font-jp">学習工学</span>
          <span>/</span>
          <span className="font-kr">02 • 인공지능 워크플로우</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-end justify-between w-full gap-6">
          <div>
            <h2 className="text-3xl sm:text-5xl font-light text-white tracking-tight leading-[1.12]">
              Turn any video or text <br />
              <span className="font-serif-editorial italic font-normal text-neutral-300">
                into flashcards with AI.
              </span>
            </h2>
          </div>
          <p className="text-sm text-neutral-400 font-light max-w-md leading-relaxed">
            Stop pausing lectures and typing summaries manually. Ankify reconstructs dense information into active recall units in seconds.
          </p>
        </div>
      </motion.div>

      {/* 4-Step Interactive Visual Demonstration */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        {/* Left Steps Selector (5 cols) */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-3">
          {SAMPLE_STEPS.map((s, idx) => (
            <motion.div
              key={s.num}
              initial={{ opacity: 0, x: -16 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              onClick={() => {
                setActiveStep(idx);
                setIsFlipped(false);
              }}
              className={`p-5 rounded-2xl border transition-all duration-300 cursor-pointer ${
                activeStep === idx
                  ? "bg-white/[0.07] border-white/30 shadow-[0_4px_30px_rgba(255,255,255,0.06)]"
                  : "bg-white/[0.02] border-white/[0.06] hover:border-white/15 text-neutral-400"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-mono tracking-widest uppercase text-white/50">
                  {s.num} • {s.label}
                </span>
                {activeStep === idx && (
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                )}
              </div>
              <h3
                className={`text-base font-medium mb-1.5 transition-colors ${
                  activeStep === idx ? "text-white" : "text-neutral-300"
                }`}
              >
                {s.title}
              </h3>
              <p className="text-xs text-neutral-400 font-light leading-relaxed">
                {s.desc}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Right Live UI Interactive Display (7 cols) */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="lg:col-span-7 glass-editorial rounded-2xl border border-white/15 p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden min-h-[440px]"
        >
          {/* Subtle Ambient Beam */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/[0.03] rounded-full blur-3xl pointer-events-none" />

          {/* Top Panel Bar */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-white/20" />
              <span className="w-2.5 h-2.5 rounded-full bg-white/20" />
              <span className="w-2.5 h-2.5 rounded-full bg-white/20" />
              <span className="text-[11px] font-mono text-white/40 ml-2">
                Ankify Engine • Step {SAMPLE_STEPS[activeStep].num}
              </span>
            </div>
            <span className="text-[10px] font-mono tracking-wider px-2 py-0.5 rounded-full bg-white/10 text-white/70 border border-white/15">
              LIVE PREVIEW
            </span>
          </div>

          {/* Dynamic Content based on Active Step */}
          <div className="my-auto py-2">
            <AnimatePresence mode="wait">
              {activeStep === 0 && (
                <motion.div
                  key="step-0"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <div className="p-4 rounded-xl bg-black/50 border border-white/10">
                    <div className="flex items-center justify-between text-[11px] text-white/50 mb-2 font-mono">
                      <span>Source: YouTube Video</span>
                      <span className="text-emerald-400">Connected 4K</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs font-mono text-white bg-white/5 px-3 py-2.5 rounded-lg border border-white/10">
                      <span className="text-white/40">https://</span>
                      <span className="truncate">youtube.com/watch?v=HubermanLab_Neuroplasticity</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-white/[0.03] border border-white/5 text-xs text-neutral-300 font-light leading-relaxed">
                    <div className="text-[10px] font-mono uppercase text-white/40 mb-1">
                      Transcript Extracted (34,180 words)
                    </div>
                    "Long-term potentiation requires intense focus followed by deep rest. Acetylcholine marks the synaptic connections, while dopamine provides the signal for persistence..."
                  </div>
                </motion.div>
              )}

              {activeStep === 1 && (
                <motion.div
                  key="step-1"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <div className="p-4 rounded-xl bg-black/60 border border-white/10 space-y-3">
                    <div className="flex items-center justify-between text-xs text-white">
                      <span className="font-mono text-[11px] text-white/60">
                        Decomposing Cognitive Primitives...
                      </span>
                      <span className="text-xs text-emerald-400 font-mono">92%</span>
                    </div>
                    <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-white rounded-full"
                        initial={{ width: "20%" }}
                        animate={{ width: "92%" }}
                        transition={{ duration: 1 }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                    <div className="p-3 rounded-lg bg-white/[0.03] border border-white/10">
                      <div className="text-[9px] text-white/40 uppercase">Concepts Identified</div>
                      <div className="text-sm font-semibold text-white mt-1">28 Atoms</div>
                    </div>
                    <div className="p-3 rounded-lg bg-white/[0.03] border border-white/10">
                      <div className="text-[9px] text-white/40 uppercase">Synthesis Time</div>
                      <div className="text-sm font-semibold text-emerald-400 mt-1">1.4s</div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeStep === 2 && (
                <motion.div
                  key="step-2"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-3"
                >
                  <div
                    onClick={() => setIsFlipped(!isFlipped)}
                    className="p-6 rounded-2xl bg-white/[0.06] border border-white/20 shadow-2xl cursor-pointer hover:border-white/40 transition-all select-none group"
                  >
                    <div className="flex items-center justify-between text-[10px] font-mono text-white/50 mb-3">
                      <span>CARD 01 OF 28 • ANKI COMPATIBLE</span>
                      <span className="text-white/60 group-hover:text-white transition-colors">
                        Click to {isFlipped ? "see Question" : "reveal Answer"} ↺
                      </span>
                    </div>

                    {!isFlipped ? (
                      <div>
                        <div className="text-xs text-neutral-400 uppercase tracking-widest mb-1.5 font-mono">
                          Question
                        </div>
                        <h4 className="text-base sm:text-lg text-white font-medium leading-snug">
                          What neuromodulator marks synapses for plasticity during deliberate learning?
                        </h4>
                      </div>
                    ) : (
                      <div>
                        <div className="text-xs text-emerald-400 uppercase tracking-widest mb-1.5 font-mono">
                          Answer
                        </div>
                        <p className="text-sm sm:text-base text-neutral-200 leading-relaxed font-light">
                          <strong className="text-white font-medium">Acetylcholine</strong> released from the basal forebrain highlights specific active circuits, while epinephrine raises alertness.
                        </p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {activeStep === 3 && (
                <motion.div
                  key="step-3"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.3 }}
                  className="space-y-4"
                >
                  <div className="p-5 rounded-xl bg-black/60 border border-white/15 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-white">Anki Deck Synchronized</div>
                      <div className="text-[11px] text-neutral-400 font-mono mt-0.5">
                        Neuroplasticity_Mastery.apkg (28 cards)
                      </div>
                    </div>
                    <span className="px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-mono">
                      Ready
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 text-[11px] font-mono text-neutral-300">
                    <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10">
                      ✓ FSRS Algorithm
                    </span>
                    <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10">
                      ✓ LaTeX Formulas
                    </span>
                    <span className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10">
                      ✓ MathJax Clean
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Bottom Action Footer */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs">
            <span className="text-neutral-400 font-light">
              Experience the full workflow now.
            </span>
            <Link
              href="/convert"
              className="text-white hover:text-neutral-300 flex items-center gap-1 font-medium tracking-wide uppercase text-[11px]"
            >
              <span>Test with your own link</span>
              <span>→</span>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
