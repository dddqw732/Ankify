"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

const SENSITIVITY = 0.85;

function useTypewriter({
  text,
  speed = 36,
  startDelay = 500,
}: {
  text: string;
  speed?: number;
  startDelay?: number;
}) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);
  const indexRef = useRef(0);

  useEffect(() => {
    setDisplayed("");
    setDone(false);
    indexRef.current = 0;

    const delayTimeout = setTimeout(() => {
      const interval = setInterval(() => {
        indexRef.current += 1;
        setDisplayed(text.slice(0, indexRef.current));
        if (indexRef.current >= text.length) {
          clearInterval(interval);
          setDone(true);
        }
      }, speed);

      return () => clearInterval(interval);
    }, startDelay);

    return () => clearTimeout(delayTimeout);
  }, [text, speed, startDelay]);

  return { displayed, done };
}

function CopyIcon() {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <rect
        x="4"
        y="4"
        width="7"
        height="7"
        rx="1"
        stroke="currentColor"
        strokeWidth="1.2"
      />
      <path
        d="M3 8H2C1.44772 8 1 7.55228 1 7V2C1 1.44772 1.44772 1 2 1H7C7.55228 1 8 1.44772 8 2V3"
        stroke="currentColor"
        strokeWidth="1.2"
      />
    </svg>
  );
}

export function MouseScrubHero() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const prevXRef = useRef<number | null>(null);
  const targetTimeRef = useRef(0);
  const seekingRef = useRef(false);

  const { displayed, done } = useTypewriter({
    text: "Glad you stopped in. Good taste tends to find us. Now, what are we building?",
  });

  const [pillsVisible, setPillsVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setPillsVisible(true), 400);
    return () => clearTimeout(t);
  }, []);

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText("hello@ankify.ai");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const applySeek = () => {
      if (!video.duration) return;
      const clamped = Math.max(0, Math.min(targetTimeRef.current, video.duration));
      video.currentTime = clamped;
      seekingRef.current = true;
    };

    const onSeeked = () => {
      seekingRef.current = false;
      const clamped = Math.max(0, Math.min(targetTimeRef.current, video.duration));
      if (Math.abs(clamped - video.currentTime) > 0.02) {
        applySeek();
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      if (prevXRef.current === null) {
        prevXRef.current = e.clientX;
        return;
      }
      const delta = e.clientX - prevXRef.current;
      prevXRef.current = e.clientX;

      if (!video.duration) return;
      const offset = (delta / window.innerWidth) * SENSITIVITY * video.duration;
      targetTimeRef.current = Math.max(
        0,
        Math.min(targetTimeRef.current + offset, video.duration)
      );

      if (!seekingRef.current) {
        applySeek();
      }
    };

    video.addEventListener("seeked", onSeeked);
    window.addEventListener("mousemove", onMouseMove);

    return () => {
      video.removeEventListener("seeked", onSeeked);
      window.removeEventListener("mousemove", onMouseMove);
    };
  }, []);

  return (
    <section className="relative w-full h-screen min-h-[640px] flex flex-col justify-end md:justify-center pb-14 md:pb-0 px-6 sm:px-12 md:px-16 overflow-hidden select-none">
      {/* 1. Background Video with mouse scrub tracking - positioned gracefully to the right side */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden" style={{ zIndex: 0 }}>
        <video
          ref={videoRef}
          muted
          playsInline
          preload="auto"
          className="absolute right-0 top-1/2 -translate-y-1/2 h-[75%] sm:h-[80%] md:h-[85%] lg:h-[90%] max-w-[55%] object-contain pointer-events-none drop-shadow-[0_20px_60px_rgba(255,255,255,0.08)]"
          style={{
            transform: "translateY(-50%)",
            filter: "contrast(105%) brightness(102%)",
          }}
        >
          <source src="/video/kling_animate.mp4" type="video/mp4" />
        </video>
      </div>

      {/* 2. Soft Ambient Beam Glow behind the character on the right */}
      <div
        className="absolute top-1/2 right-[8%] -translate-y-1/2 w-[380px] h-[380px] sm:w-[460px] sm:h-[460px] rounded-full pointer-events-none"
        style={{
          zIndex: 1,
          background: "radial-gradient(circle, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 40%, transparent 70%)",
          filter: "blur(60px)",
        }}
      />

      {/* 3. Subtle edge gradient ensuring text legibility on the left */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          zIndex: 1,
          background:
            "linear-gradient(to right, rgba(8,8,8,0.98) 0%, rgba(8,8,8,0.85) 40%, rgba(8,8,8,0.2) 70%, transparent 100%)",
        }}
      />

      {/* 4. Bottom subtle fade into the next section */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32 pointer-events-none"
        style={{
          zIndex: 2,
          background: "linear-gradient(to bottom, transparent, #080808)",
        }}
      />

      {/* 5. Left Hero Content */}
      <div className="max-w-xl sm:max-w-2xl relative z-10">
        {/* Blurred intro label */}
        <p
          className="pointer-events-none select-none mb-5 sm:mb-6 text-white transition-all duration-300"
          style={{
            fontSize: "clamp(18px, 4vw, 26px)",
            lineHeight: 1.3,
            fontWeight: 400,
            filter: "blur(4px)",
          }}
        >
          Hey there, meet A.R.I.A,
          <br />
          Ankify's Adaptive Neural Recall Agent
        </p>

        {/* Typewriter text with blinking cursor */}
        <p
          className="text-white mb-6 sm:mb-7 font-light"
          style={{
            fontSize: "clamp(18px, 4vw, 26px)",
            lineHeight: 1.35,
            minHeight: "56px",
          }}
        >
          {displayed}
          {!done && (
            <span
              className="cursor-blink inline-block bg-white align-middle"
              style={{
                width: "2px",
                height: "1.1em",
                marginLeft: "2px",
              }}
            />
          )}
        </p>

        {/* Action Pill Buttons */}
        <div
          className="flex flex-wrap items-center gap-y-2 gap-x-1.5"
          style={{
            opacity: pillsVisible ? 1 : 0,
            transform: pillsVisible ? "translateY(0)" : "translateY(8px)",
            transition: "opacity 0.4s ease, transform 0.4s ease",
          }}
        >
          <Link
            href="/convert"
            className="
              inline-flex items-center justify-center
              bg-white text-black
              border border-black/10
              rounded-full
              text-[13px] sm:text-[15px]
              px-5 py-2
              whitespace-nowrap
              cursor-pointer font-medium
              hover:bg-neutral-200 transition-all duration-200 shadow-lg
            "
          >
            Get Started Free ↗
          </Link>

          <a
            href="#synthesize"
            className="
              inline-flex items-center justify-center
              bg-white text-black
              border border-black/10
              rounded-full
              text-[13px] sm:text-[15px]
              px-4 sm:px-5 py-2
              whitespace-nowrap
              cursor-pointer font-medium
              hover:bg-black hover:text-white
              transition-colors duration-200
            "
          >
            Pitch us an idea
          </a>

          <a
            href="#workflow"
            className="
              inline-flex items-center justify-center
              bg-white text-black
              border border-black/10
              rounded-full
              text-[13px] sm:text-[15px]
              px-4 sm:px-5 py-2
              whitespace-nowrap
              cursor-pointer font-medium
              hover:bg-black hover:text-white
              transition-colors duration-200
            "
          >
            See how we operate
          </a>

          {/* Outline email pill */}
          <button
            type="button"
            onClick={handleCopyEmail}
            className="
              inline-flex items-center justify-center
              text-white bg-transparent
              border border-white/80
              rounded-full
              text-[13px] sm:text-[15px]
              px-4 sm:px-5 py-2
              gap-2 sm:gap-2.5
              whitespace-nowrap
              cursor-pointer font-medium
              hover:bg-white hover:text-black
              transition-colors duration-200
            "
            title="Copy email address"
          >
            <span>
              Reach us:{" "}
              <span className="underline underline-offset-2">
                {copied ? "Copied!" : "hello@ankify.ai"}
              </span>
            </span>
            <CopyIcon />
          </button>
        </div>
      </div>
    </section>
  );
}
