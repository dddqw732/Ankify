"use client";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";

export function DemoAnimation() {
    const [step, setStep] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setStep((prev) => (prev + 1) % 4);
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="w-full max-w-4xl mx-auto py-20 relative">
            <div className="absolute inset-0 bg-blue-500/10 blur-[100px] rounded-full" />

            <div className="relative grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
                {/* Source Content Side */}
                <div className="relative">
                    <motion.div
                        initial={{ opacity: 0.5, scale: 0.9 }}
                        animate={{
                            opacity: step === 0 || step === 1 ? 1 : 0.4,
                            scale: step === 0 || step === 1 ? 1.05 : 0.95,
                            borderColor: step === 1 ? "rgba(59, 130, 246, 0.5)" : "rgba(255, 255, 255, 0.1)"
                        }}
                        className="glass-card rounded-2xl p-6 h-80 overflow-hidden border transition-colors duration-500"
                    >
                        <div className="space-y-3">
                            <div className="h-4 w-3/4 bg-gray-700/50 rounded animate-pulse" />
                            <div className="h-4 w-full bg-gray-700/50 rounded animate-pulse delay-75" />
                            <div className="h-4 w-5/6 bg-gray-700/50 rounded animate-pulse delay-150" />
                            <div className="h-4 w-full bg-gray-700/50 rounded animate-pulse delay-200" />
                            <div className="h-20 w-full bg-gray-800/50 rounded mt-4" />
                        </div>

                        {/* Scanning beam */}
                        {step === 1 && (
                            <motion.div
                                initial={{ top: 0 }}
                                animate={{ top: "100%" }}
                                transition={{ duration: 1.5, ease: "linear" }}
                                className="absolute left-0 right-0 h-1 bg-blue-400 shadow-[0_0_20px_rgba(96,165,250,0.8)] z-10"
                            />
                        )}

                        <div className="absolute top-4 right-4 text-xs font-mono text-gray-500">SOURCE_TEXT</div>
                    </motion.div>
                </div>

                {/* Processing Arrow */}
                <div className="hidden md:flex justify-center">
                    <motion.div
                        animate={{
                            x: step === 1 ? [0, 10, 0] : 0,
                            color: step === 1 ? "#60A5FA" : "#4B5563"
                        }}
                        className="text-4xl"
                    >
                        →
                    </motion.div>
                </div>

                {/* Generated Card Side */}
                <div className="relative perspective-1000">
                    <AnimatePresence mode="wait">
                        {step >= 2 ? (
                            <motion.div
                                key="card"
                                initial={{ rotateY: 90, opacity: 0 }}
                                animate={{ rotateY: 0, opacity: 1 }}
                                exit={{ rotateY: -90, opacity: 0 }}
                                transition={{ type: "spring", stiffness: 100 }}
                                className="glass-card rounded-2xl p-8 h-80 flex flex-col items-center justify-center text-center border-t border-white/10 shadow-2xl shadow-blue-900/20"
                            >
                                <div className="text-blue-400 text-xs font-bold tracking-widest uppercase mb-4">Flashcard Generated</div>
                                <div className="text-white text-xl font-medium mb-2">Mitochondria</div>
                                <div className="w-12 h-1 bg-gray-700 rounded-full my-4" />
                                <div className="text-gray-400 text-sm">
                                    The powerhouse of the cell, responsible for generating most of the cell's supply of adenosine triphosphate (ATP).
                                </div>

                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.2 }}
                                    className="mt-6 bg-green-500/20 text-green-300 text-xs px-3 py-1 rounded-full border border-green-500/30"
                                >
                                    Ready for Anki
                                </motion.div>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="placeholder"
                                initial={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="h-80 rounded-2xl border-2 border-dashed border-gray-800 flex items-center justify-center text-gray-700"
                            >
                                Waiting for input...
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            <div className="text-center mt-12 text-sm text-gray-500 font-mono">
                {step === 0 && "1. Upload Content..."}
                {step === 1 && "2. AI Analysis..."}
                {step === 2 && "3. Generating Cards..."}
                {step === 3 && "4. Export Ready!"}
            </div>
        </div>
    );
}
