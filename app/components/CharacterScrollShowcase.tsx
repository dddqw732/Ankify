"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";

const VIDEO_URL = "/video/chibi_star_orbit_video_left_silent_final.mp4";
const POSTER_URL = "/video/chibi_dark_star_pose_1.png";

export function CharacterScrollShowcase() {
  const trackRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const meterRef = useRef<HTMLDivElement>(null);

  const panel0Ref = useRef<HTMLDivElement>(null);
  const panel1Ref = useRef<HTMLDivElement>(null);
  const panel2Ref = useRef<HTMLDivElement>(null);

  const [activePhase, setActivePhase] = useState<0 | 1 | 2>(0);
  const [videoReady, setVideoReady] = useState(false);

  const progressRef = useRef(0);
  const targetTimeRef = useRef(0);
  const currentTimeRef = useRef(0);
  const animFrameRef = useRef<number | null>(null);

  // Jump to specific cue percentage along the track
  const scrollToCue = (targetProgress: number) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const trackTop = rect.top + scrollTop;
    const maxScroll = rect.height - window.innerHeight;
    const dest = trackTop + maxScroll * targetProgress;
    window.scrollTo({ top: dest, behavior: "smooth" });
  };

  const updateVisuals = useCallback(() => {
    const p = progressRef.current;

    // Progress bar
    if (meterRef.current) {
      meterRef.current.style.transform = `scaleX(${p})`;
    }

    // Phase 0: 0.00 -> 0.32 (Active from start)
    // Phase 1: 0.32 -> 0.68
    // Phase 2: 0.68 -> 1.00
    let o0 = 0, y0 = 0;
    let o1 = 0, y1 = 0;
    let o2 = 0, y2 = 0;

    if (p <= 0.28) {
      o0 = 1;
      y0 = 0;
    } else if (p < 0.36) {
      const t = (p - 0.28) / 0.08;
      o0 = 1 - t;
      y0 = -t * 26;
      o1 = t;
      y1 = (1 - t) * 26;
    } else if (p <= 0.62) {
      o1 = 1;
      y1 = 0;
    } else if (p < 0.70) {
      const t = (p - 0.62) / 0.08;
      o1 = 1 - t;
      y1 = -t * 26;
      o2 = t;
      y2 = (1 - t) * 26;
    } else {
      o2 = 1;
      y2 = 0;
    }

    if (panel0Ref.current) {
      panel0Ref.current.style.opacity = o0.toFixed(3);
      panel0Ref.current.style.transform = `translate3d(0, ${y0.toFixed(1)}px, 0)`;
      panel0Ref.current.style.pointerEvents = o0 > 0.5 ? "auto" : "none";
    }
    if (panel1Ref.current) {
      panel1Ref.current.style.opacity = o1.toFixed(3);
      panel1Ref.current.style.transform = `translate3d(0, ${y1.toFixed(1)}px, 0)`;
      panel1Ref.current.style.pointerEvents = o1 > 0.5 ? "auto" : "none";
    }
    if (panel2Ref.current) {
      panel2Ref.current.style.opacity = o2.toFixed(3);
      panel2Ref.current.style.transform = `translate3d(0, ${y2.toFixed(1)}px, 0)`;
      panel2Ref.current.style.pointerEvents = o2 > 0.5 ? "auto" : "none";
    }

    if (p < 0.32) setActivePhase(0);
    else if (p < 0.66) setActivePhase(1);
    else setActivePhase(2);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    const track = trackRef.current;
    if (!video || !track) return;

    // Direct video setup with fast byte-range streaming
    video.src = VIDEO_URL;
    video.load();

    const onLoadedMetadata = () => {
      setVideoReady(true);
      video.pause();
      readScroll();
      if (video.duration) {
        currentTimeRef.current = progressRef.current * video.duration;
        try {
          video.currentTime = currentTimeRef.current;
        } catch (_) {}
      }
    };

    video.addEventListener("loadedmetadata", onLoadedMetadata);
    video.addEventListener("canplay", () => setVideoReady(true));

    const readScroll = () => {
      if (!trackRef.current) return;
      const rect = trackRef.current.getBoundingClientRect();
      const scrollRange = rect.height - window.innerHeight;
      const p = scrollRange > 0 ? Math.max(0, Math.min(1, -rect.top / scrollRange)) : 0;
      progressRef.current = p;

      if (video.duration) {
        targetTimeRef.current = p * video.duration;
      }
    };

    const renderLoop = () => {
      if (video && video.duration) {
        const gap = targetTimeRef.current - currentTimeRef.current;
        if (Math.abs(gap) > 0.001) {
          currentTimeRef.current += gap * 0.16;
          if (video.readyState >= 2 && !video.seeking) {
            try {
              video.currentTime = currentTimeRef.current;
            } catch (_) {}
          }
        }
      }

      updateVisuals();
      animFrameRef.current = requestAnimationFrame(renderLoop);
    };

    // User gesture unlock for mobile/safari
    const unlock = () => {
      const p = video.play();
      if (p && p.then) {
        p.then(() => video.pause()).catch(() => {});
      } else {
        video.pause();
      }
    };

    ["touchstart", "pointerdown", "wheel", "keydown"].forEach((ev) =>
      window.addEventListener(ev, unlock, { once: true, passive: true })
    );

    window.addEventListener("scroll", readScroll, { passive: true });
    window.addEventListener("resize", readScroll);

    readScroll();
    updateVisuals();
    animFrameRef.current = requestAnimationFrame(renderLoop);

    return () => {
      if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
      video.removeEventListener("loadedmetadata", onLoadedMetadata);
      window.removeEventListener("scroll", readScroll);
      window.removeEventListener("resize", readScroll);
    };
  }, [updateVisuals]);

  return (
    <section
      ref={trackRef}
      id="showcase"
      className="relative w-full h-[450vh] min-h-[3600px] bg-[#050505] z-20"
      style={{ contain: "paint" }}
    >
      {/* Sticky Viewport Stage: Locks the user in place during scroll */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center justify-center bg-[#050505] select-none">
        
        {/* Scrub Progress Meter (top hairline) */}
        <div
          ref={meterRef}
          className="absolute top-0 left-0 w-full h-[3px] bg-gradient-to-r from-white/40 via-white to-white/90 origin-left scale-x-0 z-40"
        />

        {/* Fixed Video Layer with Poster fallback */}
        <div className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none">
          {/* Poster image shown instantly to prevent black frame flash */}
          <img
            src={POSTER_URL}
            alt="Ankify AI Anime Character"
            className={`absolute top-1/2 left-1/2 w-full h-full -translate-x-1/2 -translate-y-1/2 scale-[1.02] object-cover transition-opacity duration-700 ${
              videoReady ? "opacity-0" : "opacity-90"
            }`}
          />

          <video
            ref={videoRef}
            muted
            playsInline
            preload="auto"
            poster={POSTER_URL}
            disablePictureInPicture
            className="absolute top-1/2 left-1/2 w-full h-full -translate-x-1/2 -translate-y-1/2 scale-[1.02] object-cover contrast-[1.12] brightness-[0.95] will-change-transform"
          />

          {/* Dark Cinematic Vignette Veil */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `
                linear-gradient(to bottom, rgba(5,5,5,0.85) 0%, rgba(5,5,5,0.22) 22%, rgba(5,5,5,0.22) 78%, rgba(5,5,5,0.92) 100%),
                radial-gradient(100% 80% at 50% 50%, rgba(5,5,5,0) 0%, rgba(5,5,5,0.60) 100%),
                rgba(5,5,5,0.18)
              `,
            }}
          />

          {/* Fine SVG Grain Overlay */}
          <div
            className="absolute -inset-1/2 opacity-[0.18] mix-blend-overlay pointer-events-none"
            style={{
              backgroundImage: `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='140' height='140'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='3'/></filter><rect width='140' height='140' filter='url(%23n)' opacity='.5'/></svg>")`,
            }}
          />
        </div>

        {/* Top Section Nav / State Badge */}
        <div className="absolute top-6 left-6 right-6 md:left-12 md:right-12 z-30 flex items-center justify-between pointer-events-auto">
          <div className="flex items-center gap-2.5 text-xs tracking-[0.25em] uppercase text-white font-medium bg-black/40 px-3.5 py-1.5 rounded-full border border-white/10 backdrop-blur-md">
            <span className="text-white text-sm animate-pulse">✦</span>
            <span>ANKIFY AI // KNOWLEDGE MOTION</span>
          </div>

          {/* Phase Switcher Tabs */}
          <div className="flex items-center gap-1.5 sm:gap-3 text-[11px] tracking-widest uppercase bg-black/50 px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-md">
            <button
              onClick={() => scrollToCue(0.05)}
              className={`transition-all px-2.5 py-1 rounded-full cursor-pointer ${
                activePhase === 0 ? "bg-white text-black font-semibold shadow-sm" : "text-white/50 hover:text-white"
              }`}
            >
              01 • Ingest
            </button>
            <button
              onClick={() => scrollToCue(0.48)}
              className={`transition-all px-2.5 py-1 rounded-full cursor-pointer ${
                activePhase === 1 ? "bg-white text-black font-semibold shadow-sm" : "text-white/50 hover:text-white"
              }`}
            >
              02 • Extract
            </button>
            <button
              onClick={() => scrollToCue(0.85)}
              className={`transition-all px-2.5 py-1 rounded-full cursor-pointer ${
                activePhase === 2 ? "bg-white text-black font-semibold shadow-sm" : "text-white/50 hover:text-white"
              }`}
            >
              03 • Retain
            </button>
          </div>
        </div>

        {/* =========================================================================
            EDITORIAL PANELS - DIRECTLY TAILORED FOR ANKIFY AI ECOSYSTEM
           ========================================================================= */}
        <div className="absolute inset-0 z-20 pointer-events-none flex items-center justify-center px-6">
          
          {/* PANEL 1: INGESTION */}
          <div
            ref={panel0Ref}
            className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 py-20 will-change-transform"
          >
            <div className="inline-flex items-center gap-2.5 text-xs md:text-sm tracking-[0.28em] uppercase text-white/70 mb-4 bg-white/5 border border-white/10 px-4 py-1 rounded-full backdrop-blur-sm">
              <span className="text-white">PHASE 01</span>
              <span>·</span>
              <span className="font-jp">入力 • MULTIMODAL INGESTION</span>
            </div>
            <h2 className="text-4xl sm:text-6xl md:text-7xl font-serif-editorial text-white tracking-tight max-w-[18ch] leading-[1.05] drop-shadow-[0_4px_28px_rgba(0,0,0,0.9)]">
              Transform Dense Chaos into Atomic Truth.
            </h2>
            <p className="mt-5 text-sm sm:text-base md:text-lg text-white/80 max-w-[48ch] leading-relaxed font-light drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]">
              Feed hour-long YouTube lecture streams, clinical research papers, or raw theoretical notes. Our neural ingestion layer filters cognitive noise in milliseconds.
            </p>
            <div className="mt-8 pointer-events-auto flex items-center gap-4">
              <button
                onClick={() => scrollToCue(0.48)}
                className="px-6 py-3 rounded-full bg-white text-black text-xs uppercase tracking-[0.2em] font-medium hover:bg-neutral-200 transition-all duration-300 shadow-xl cursor-pointer"
              >
                Synthesize Next &darr;
              </button>
              <Link
                href="/convert"
                className="hidden sm:inline-flex px-5 py-3 rounded-full bg-white/10 text-white text-xs uppercase tracking-[0.18em] font-medium border border-white/20 hover:bg-white/20 transition-all duration-300"
              >
                Try With Video
              </Link>
            </div>
          </div>

          {/* PANEL 2: SYNTHESIS & ATOMIC EXTRACTION */}
          <div
            ref={panel1Ref}
            className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 py-20 opacity-0 pointer-events-none will-change-transform"
          >
            <div className="inline-flex items-center gap-2.5 text-xs md:text-sm tracking-[0.28em] uppercase text-white/70 mb-4 bg-white/5 border border-white/10 px-4 py-1 rounded-full backdrop-blur-sm">
              <span className="text-white">PHASE 02</span>
              <span>·</span>
              <span className="font-jp">抽出 • ATOMIC EXTRACTION</span>
            </div>
            <h2 className="text-4xl sm:text-6xl md:text-7xl font-serif-editorial text-white tracking-tight max-w-[18ch] leading-[1.05] drop-shadow-[0_4px_28px_rgba(0,0,0,0.9)]">
              Orbital Synthesis &amp; Precise Flashcards.
            </h2>
            <p className="mt-5 text-sm sm:text-base md:text-lg text-white/80 max-w-[48ch] leading-relaxed font-light drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]">
              Deep language models dissect complex paragraphs into atomic, testable cards formatted with native LaTeX, MathJax formulas, and chemistry notations.
            </p>
            <div className="mt-8 pointer-events-auto flex items-center gap-4">
              <button
                onClick={() => scrollToCue(0.85)}
                className="px-6 py-3 rounded-full bg-white text-black text-xs uppercase tracking-[0.2em] font-medium hover:bg-neutral-200 transition-all duration-300 shadow-xl cursor-pointer"
              >
                See Memory Retention &darr;
              </button>
              <Link
                href="#features"
                className="hidden sm:inline-flex px-5 py-3 rounded-full bg-white/10 text-white text-xs uppercase tracking-[0.18em] font-medium border border-white/20 hover:bg-white/20 transition-all duration-300"
              >
                View Architecture
              </Link>
            </div>
          </div>

          {/* PANEL 3: RETENTION & DIRECT ANKI SYNC */}
          <div
            ref={panel2Ref}
            className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 py-20 opacity-0 pointer-events-none will-change-transform"
          >
            <div className="inline-flex items-center gap-2.5 text-xs md:text-sm tracking-[0.28em] uppercase text-white/70 mb-4 bg-white/5 border border-white/10 px-4 py-1 rounded-full backdrop-blur-sm">
              <span className="text-white">PHASE 03</span>
              <span>·</span>
              <span className="font-jp">定着 • LIFELONG RECALL</span>
            </div>
            <h2 className="text-4xl sm:text-6xl md:text-7xl font-serif-editorial text-white tracking-tight max-w-[18ch] leading-[1.05] drop-shadow-[0_4px_28px_rgba(0,0,0,0.9)]">
              Native Anki Export &amp; Infinite Memory.
            </h2>
            <p className="mt-5 text-sm sm:text-base md:text-lg text-white/80 max-w-[48ch] leading-relaxed font-light drop-shadow-[0_2px_12px_rgba(0,0,0,0.8)]">
              Download clean APKG decks engineered directly for the SM-2 spaced repetition algorithm. Stop passive re-reading and achieve permanent recall.
            </p>
            <div className="mt-8 pointer-events-auto flex items-center gap-4">
              <Link
                href="/convert"
                className="px-7 py-3.5 rounded-full bg-white text-black text-xs uppercase tracking-[0.2em] font-medium hover:bg-neutral-200 transition-all duration-300 shadow-xl"
              >
                Start Generating Flashcards ✦
              </Link>
              <button
                onClick={() => scrollToCue(0.02)}
                className="px-5 py-3.5 rounded-full bg-white/10 text-white text-xs uppercase tracking-[0.18em] font-medium border border-white/20 hover:bg-white/20 transition-all duration-300 cursor-pointer"
              >
                Replay Animation ↺
              </button>
            </div>
          </div>
        </div>

        {/* Scroll Indicator Prompt */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 pointer-events-none">
          <span className="text-[10px] uppercase tracking-[0.3em] text-white/50 font-mono">
            SCROLL TO SCRUB TIMELINE
          </span>
          <div className="w-1.5 h-4 rounded-full border border-white/30 flex items-start justify-center p-0.5">
            <div className="w-1 h-1.5 rounded-full bg-white animate-bounce" />
          </div>
        </div>
      </div>
    </section>
  );
}
