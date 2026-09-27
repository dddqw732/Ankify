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
  const rotateX = useTransform(smoothY, [-0.5, 0.5], [14, -14]);
  const rotateY = useTransform(smoothX, [-0.5, 0.5], [-18, 18]);
  const translateX = useTransform(smoothX, [-0.5, 0.5], [-25, 25]);
  const translateY = useTransform(smoothY, [-0.5, 0.5], [-20, 20]);

  // Glow position parallax
  const glowX = useTransform(smoothX, [-0.5, 0.5], [40, -40]);
  const glowY = useTransform(smoothY, [-0.5, 0.5], [30, -30]);

  useEffect(() => {
    setMounted(true);
    const handleMouseMove = (e: MouseEvent) => {
      // Normalize between -0.5 and 0.5
      const { innerWidth, innerHeight } = window;
      mouseX.set(e.clientX / innerWidth - 0.5);
      mouseY.set(e.clientY / innerHeight - 0.5);
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  if (!mounted) return null;

  return (
    <div className="relative w-full max-w-[480px] lg:max-w-[560px] aspect-square flex items-center justify-center select-none perspective-[1200px]">
      {/* 1. Behind Glow: Massive Pure White & Radiant Beam */}
      <motion.div
        style={{
          x: glowX,
          y: glowY,
        }}
        className="absolute w-[360px] h-[360px] sm:w-[460px] sm:h-[460px] rounded-full character-beam-glow pointer-events-none"
      />

      {/* 2. Intense Core Radiance */}
      <motion.div
        animate={{
          scale: [1, 1.06, 1],
          opacity: [0.65, 0.85, 0.65],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute w-[240px] h-[240px] sm:w-[320px] sm:h-[320px] rounded-full character-ambient-glow pointer-events-none"
      />

      {/* 3. Outer Subtle Ring with Micro Japanese/Korean Coordinates */}
      <div className="absolute inset-4 sm:inset-2 rounded-full border border-white/5 pointer-events-none flex items-center justify-center animate-[spin_60s_linear_infinite]">
        <span className="absolute -top-3 text-[9px] tracking-[0.3em] text-white/30 font-jp">
          記憶 • 思考
        </span>
        <span className="absolute -bottom-3 text-[9px] tracking-[0.3em] text-white/30 font-kr">
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
          y: [0, -10, 0],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="relative z-10 w-[300px] h-[300px] sm:w-[400px] sm:h-[400px] flex items-center justify-center filter drop-shadow-[0_20px_50px_rgba(255,255,255,0.22)]"
      >
        <Image
          src="/hero_character.png"
          alt="Ankify Cyber Chibi Character"
          width={450}
          height={450}
          priority
          className="w-full h-full object-contain filter contrast-110 brightness-105 pointer-events-none transition-transform duration-200"
        />

        {/* Floating Futuristic Badge on character layer */}
        <motion.div
          style={{ transform: "translateZ(40px)" }}
          className="absolute -bottom-4 right-4 glass-pill px-4 py-1.5 rounded-full flex items-center gap-2 border border-white/20 shadow-2xl"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
          <span className="text-[10px] uppercase tracking-[0.25em] text-white/90 font-medium font-jp">
            記憶核 • MK-IV
          </span>
        </motion.div>
      </motion.div>
    </div>
  );
}
