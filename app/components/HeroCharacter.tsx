"use client";

import { useState, useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import Image from "next/image";

export function HeroCharacter() {
  const [mounted, setMounted] = useState(false);

  // Raw mouse coordinates relative to window center
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth springs for 3D physics tilt and translation
  const springConfig = { damping: 25, stiffness: 120 };
  const smoothX = useSpring(mouseX, springConfig);
  const smoothY = useSpring(mouseY, springConfig);

  // 3D rotation transforms
  const rotateX = useTransform(smoothY, [-0.5, 0.5], [12, -12]);
  const rotateY = useTransform(smoothX, [-0.5, 0.5], [-14, 14]);
  const translateX = useTransform(smoothX, [-0.5, 0.5], [-16, 16]);
  const translateY = useTransform(smoothY, [-0.5, 0.5], [-14, 14]);

  // Glow position parallax
  const glowX = useTransform(smoothX, [-0.5, 0.5], [20, -20]);
  const glowY = useTransform(smoothY, [-0.5, 0.5], [16, -16]);

  useEffect(() => {
    setMounted(true);
    const handleMouseMove = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      mouseX.set(e.clientX / innerWidth - 0.5);
      mouseY.set(e.clientY / innerHeight - 0.5);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  if (!mounted) return null;

  return (
    <div className="relative w-full max-w-[280px] sm:max-w-[320px] aspect-square flex items-center justify-center select-none perspective-[1000px]">
      {/* 1. Behind Glow: Soft White Radiant Halo */}
      <motion.div
        style={{
          x: glowX,
          y: glowY,
        }}
        className="absolute w-[220px] h-[220px] sm:w-[260px] sm:h-[260px] rounded-full character-beam-glow pointer-events-none opacity-80"
      />

      {/* 2. Soft Core Radiance */}
      <motion.div
        animate={{
          scale: [1, 1.05, 1],
          opacity: [0.5, 0.7, 0.5],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute w-[160px] h-[160px] sm:w-[190px] sm:h-[190px] rounded-full character-ambient-glow pointer-events-none"
      />

      {/* 3. Outer Ring with Japanese/Korean Micro-Labels */}
      <div className="absolute inset-2 sm:inset-1 rounded-full border border-white/10 pointer-events-none flex items-center justify-center animate-[spin_60s_linear_infinite]">
        <span className="absolute -top-2.5 text-[8px] tracking-[0.25em] text-white/40 font-jp">
          記憶 • 思考
        </span>
        <span className="absolute -bottom-2.5 text-[8px] tracking-[0.25em] text-white/40 font-kr">
          지능 • 연결
        </span>
      </div>

      {/* 4. 3D Floating Interactive Character */}
      <motion.div
        style={{
          rotateX,
          rotateY,
          x: translateX,
          y: translateY,
          transformStyle: "preserve-3d",
        }}
        animate={{
          y: [0, -8, 0],
        }}
        transition={{
          duration: 4.5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="relative z-10 w-[200px] h-[200px] sm:w-[240px] sm:h-[240px] flex items-center justify-center filter drop-shadow-[0_15px_35px_rgba(255,255,255,0.18)]"
      >
        <Image
          src="/hero_character.png"
          alt="Ankify Cyber Chibi Character"
          width={280}
          height={280}
          priority
          className="w-full h-full object-contain filter contrast-110 brightness-105 pointer-events-none"
        />

        {/* Small Futuristic Hologram Tag */}
        <motion.div
          style={{ transform: "translateZ(30px)" }}
          className="absolute -bottom-2 right-2 glass-pill px-3 py-1 rounded-full flex items-center gap-1.5 border border-white/20 shadow-xl backdrop-blur-md"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[9px] uppercase tracking-[0.2em] text-white/90 font-medium font-jp">
            記憶核 • MK-IV
          </span>
        </motion.div>
      </motion.div>
    </div>
  );
}
