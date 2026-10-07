"use client";

import React from "react";
import { motion } from "framer-motion";

// Small 3D Floating Flashcard
export function Floating3DCard({
  className = "",
  delay = 0,
  label = "Recall Unit",
  code = "01",
}: {
  className?: string;
  delay?: number;
  label?: string;
  code?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, delay }}
      className={`pointer-events-none select-none ${className}`}
    >
      <motion.div
        animate={{
          y: [0, -7, 0],
          rotateZ: [-2, 2, -2],
          rotateX: [6, -4, 6],
        }}
        transition={{
          duration: 5.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay,
        }}
        style={{ transformStyle: "preserve-3d" }}
        className="w-24 h-16 sm:w-28 sm:h-20 rounded-xl bg-white/[0.05] border border-white/20 backdrop-blur-md shadow-[0_12px_24px_rgba(0,0,0,0.6)] p-2.5 flex flex-col justify-between"
      >
        <div className="flex items-center justify-between text-[8px] font-mono text-white/50">
          <span>{code}</span>
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/80" />
        </div>
        <div className="w-full space-y-1">
          <div className="h-1 w-3/4 bg-white/30 rounded-full" />
          <div className="h-1 w-1/2 bg-white/20 rounded-full" />
        </div>
        <div className="text-[7px] uppercase font-mono tracking-wider text-white/40 truncate">
          {label}
        </div>
      </motion.div>
    </motion.div>
  );
}

// Small 3D Floating Sparkle / Star
export function FloatingStar({
  className = "",
  size = 14,
  delay = 0,
}: {
  className?: string;
  size?: number;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      animate={{
        y: [0, -6, 0],
        rotate: [0, 90, 180, 270, 360],
        opacity: [0.4, 0.85, 0.4],
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        ease: "linear",
        delay,
      }}
      className={`pointer-events-none select-none text-white/70 ${className}`}
      style={{ fontSize: `${size}px` }}
    >
      ✦
    </motion.div>
  );
}

// Small 3D Floating Question Mark Pill
export function FloatingQuestionBadge({
  className = "",
  delay = 0,
}: {
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true }}
      animate={{
        y: [0, -5, 0],
        rotateZ: [3, -3, 3],
      }}
      transition={{
        duration: 4.5,
        repeat: Infinity,
        ease: "easeInOut",
        delay,
      }}
      className={`pointer-events-none select-none inline-flex items-center justify-center w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/[0.08] border border-white/25 backdrop-blur-md shadow-lg text-white/90 text-xs font-serif font-bold ${className}`}
    >
      ?
    </motion.div>
  );
}

// Small 3D Floating Notebook Motif
export function FloatingNotebook({
  className = "",
  delay = 0,
}: {
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      animate={{
        y: [0, -8, 0],
        rotateZ: [-4, 3, -4],
      }}
      transition={{
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut",
        delay,
      }}
      className={`pointer-events-none select-none ${className}`}
    >
      <div className="w-10 h-12 rounded-lg bg-black/60 border border-white/20 p-1.5 shadow-[0_10px_20px_rgba(0,0,0,0.5)] flex flex-col justify-between">
        <div className="flex gap-1">
          <div className="w-1 h-1 rounded-full bg-white/40" />
          <div className="w-1 h-1 rounded-full bg-white/40" />
          <div className="w-1 h-1 rounded-full bg-white/40" />
        </div>
        <div className="space-y-1">
          <div className="h-0.5 w-full bg-white/30 rounded" />
          <div className="h-0.5 w-4/5 bg-white/20 rounded" />
          <div className="h-0.5 w-2/3 bg-white/20 rounded" />
        </div>
        <div className="h-0.5 w-1/3 bg-emerald-400/60 rounded" />
      </div>
    </motion.div>
  );
}
