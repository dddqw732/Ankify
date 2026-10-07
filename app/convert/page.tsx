"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface Flashcard {
  question: string;
  answer: string;
}

export default function ConvertPage() {
  const { user } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState<"text" | "youtube">("text");
  const [text, setText] = useState("");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [flashcards, setFlashcards] = useState<Flashcard[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [currentCard, setCurrentCard] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [saving, setSaving] = useState(false);

  function parseFlashcards(text: string): Flashcard[] {
    const lines = text.split('\n').filter(line => line.trim());
    const cards: Flashcard[] = [];

    for (const line of lines) {
      if (line.includes('|')) {
        const parts = line.split('|').map(p => p.trim());

        if (parts.length >= 3) {
          const firstPart = parts[0].toLowerCase();
          if (firstPart.match(/^(card\s*\d+|\d+[\.)]?)$/)) {
            cards.push({
              question: parts[1],
              answer: parts.slice(2).join('|').trim()
            });
            continue;
          }
        }

        if (parts.length >= 2) {
          let question = parts[0];
          const answer = parts.slice(1).join('|').trim();
          question = question.replace(/^(?:card\s*\d+[:.]?\s*|\d+[\.):]\s*)/i, '');

          if (question && answer) {
            cards.push({ question, answer });
          }
        }
      }
    }

    if (cards.length === 0) {
      // Fallback logic could go here if needed
      if (text.trim()) {
        cards.push({ question: "Generated Content", answer: text });
      }
    }

    return cards;
  }

  async function handleGenerate() {
    setLoading(true);
    setFlashcards([]);
    setError(null);
    setCurrentCard(0);
    setIsFlipped(false);

    try {
      const res = await fetch("/api/generate-flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: mode,
          value: mode === "text" ? text : youtubeUrl,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to generate flashcards");
      }

      const data = await res.json();
      const cards = parseFlashcards(data.result || "");
      if (cards.length === 0) throw new Error("No flashcards could be generated from the content.");
      setFlashcards(cards);
    } catch (e: any) {
      setError(e.message || "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  async function handleSave() {
    if (!user) {
      alert("You must be signed in to save flashcards. Redirecting to sign-in page…");
      router.push("/auth");
      return;
    }
    const title = prompt("Enter a title for this flashcard set:");
    if (!title) return;
    setSaving(true);
    try {
      const res = await fetch("/api/save-flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description: "Generated via Convert tool",
          flashcards,
          userId: user.id,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save flashcards");
      router.push("/dashboard");
    } catch (e: any) {
      alert(e.message || "Error saving flashcards");
    } finally {
      setSaving(false);
    }
  }

  function downloadAnkiFile() {
    if (flashcards.length === 0) return;
    const ankiContent = flashcards.map(card => `${card.question}|${card.answer}`).join('\n');
    const blob = new Blob([ankiContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'flashcards.txt';
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="relative min-h-screen bg-[#080808] text-[#f3f3f3] selection:bg-white selection:text-black bg-grain flex flex-col items-center justify-center overflow-hidden pt-28 pb-16 px-4">
      {/* Background Subtle Atmospheric Glows */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-white/[0.015] rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-white/[0.02] rounded-full blur-[160px] pointer-events-none" />

      {/* Top Navigation */}
      <header className="fixed top-0 left-0 w-full z-50 px-6 sm:px-12 py-6 flex items-center justify-between backdrop-blur-md bg-black/40 border-b border-white/[0.06]">
        <Link href="/" className="flex items-center gap-3.5 group">
          <div className="w-10 h-10 rounded-full overflow-hidden border border-white/30 bg-black/60 p-0.5 shadow-[0_0_15px_rgba(255,255,255,0.15)] group-hover:border-white transition-all group-hover:scale-105 flex items-center justify-center">
            <img
              src="/logo_character_strict_hair_edit_3.png"
              alt="Ankify Logo"
              className="w-full h-full object-cover rounded-full"
            />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold tracking-[0.25em] uppercase text-white font-cinzel">
              ANKIFY
            </span>
            <span className="text-[9px] tracking-[0.2em] text-neutral-400 font-jp">
              記憶 • シンセシス
            </span>
          </div>
        </Link>

        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-neutral-400 hover:text-white px-5 py-2.5 rounded-full border border-white/10 hover:border-white/30 transition-all backdrop-blur-md bg-white/[0.02]"
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          Dashboard
        </Link>
      </header>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-2xl z-10"
      >
        <div className="glass-editorial rounded-3xl p-8 sm:p-12 flex flex-col gap-6 relative border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-2xl">
          <div className="text-center">
            <span className="text-[10px] uppercase tracking-[0.3em] text-neutral-400 font-jp block mb-2">
              自然言語 • 高度抽出
            </span>
            <h1 className="text-2xl sm:text-4xl font-light text-white mb-2 tracking-tight">
              Synthesize <span className="font-serif-editorial italic font-normal text-white">Cards</span>
            </h1>
            <p className="text-xs uppercase tracking-[0.2em] text-neutral-400 font-light max-w-md mx-auto">
              Transform unstructured source knowledge into atomic recall units.
            </p>
          </div>

          {/* Tabs */}
          <div className="flex justify-center gap-2 bg-white/[0.03] border border-white/10 p-1 rounded-full w-fit mx-auto">
            <button
              className={`px-6 py-2 rounded-full font-medium transition-all text-xs uppercase tracking-[0.15em] focus:outline-none ${
                mode === "text"
                  ? "bg-white text-black shadow-lg font-semibold"
                  : "text-neutral-400 hover:text-white"
              }`}
              onClick={() => setMode("text")}
            >
              Text Stream
            </button>
            <button
              className={`px-6 py-2 rounded-full font-medium transition-all text-xs uppercase tracking-[0.15em] focus:outline-none ${
                mode === "youtube"
                  ? "bg-white text-black shadow-lg font-semibold"
                  : "text-neutral-400 hover:text-white"
              }`}
              onClick={() => setMode("youtube")}
            >
              YouTube URL
            </button>
          </div>

          {/* Input Area */}
          <AnimatePresence mode="wait" initial={false}>
            {mode === "text" ? (
              <motion.textarea
                key="text"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="w-full min-h-[180px] rounded-2xl border border-white/10 bg-white/[0.02] focus:border-white/40 focus:ring-1 focus:ring-white/20 p-5 text-neutral-100 text-sm font-light resize-none transition-all placeholder-neutral-500 leading-relaxed outline-none"
                placeholder="Paste comprehensive notes, dense research articles, or lecture summaries here..."
                value={text}
                onChange={e => setText(e.target.value)}
              />
            ) : (
              <motion.input
                key="youtube"
                type="url"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="w-full rounded-2xl border border-white/10 bg-white/[0.02] focus:border-white/40 focus:ring-1 focus:ring-white/20 p-5 text-neutral-100 text-sm font-light transition-all placeholder-neutral-500 outline-none"
                placeholder="https://www.youtube.com/watch?v=..."
                value={youtubeUrl}
                onChange={e => setYoutubeUrl(e.target.value)}
              />
            )}
          </AnimatePresence>

          <button
            className="w-full font-medium rounded-full py-4 text-xs uppercase tracking-[0.2em] shadow-[0_0_25px_rgba(255,255,255,0.15)] transition-all duration-300 bg-white hover:bg-neutral-200 text-black disabled:opacity-40 disabled:cursor-not-allowed"
            onClick={handleGenerate}
            disabled={loading || (mode === "text" ? !text.trim() : !youtubeUrl.trim())}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-3">
                <svg className="animate-spin h-4 w-4 text-black" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                </svg>
                {mode === "youtube" ? "Extracting Video Transcript..." : "Synthesizing Cards with AI..."}
              </span>
            ) : (
              "Generate Flashcards"
            )}
          </button>

          {/* Warnings/Errors */}
          <AnimatePresence>
            {mode === "youtube" && !loading && (
              <motion.div key="youtube-hint" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-gray-400 text-sm text-center bg-white/5 rounded-lg p-3 border border-white/5">
                ℹ️ Supports videos with captions/transcripts enabled.
              </motion.div>
            )}
            {error && (
              <motion.div
                key="error-msg"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-red-500/20 text-red-200 rounded-xl p-4 text-sm text-center border border-red-500/30"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Results Section */}
      <AnimatePresence>
        {flashcards.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="w-full max-w-4xl z-10 mt-12 px-4"
          >
            <div className="glass-card rounded-3xl p-8 md:p-12 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 to-purple-500"></div>

              <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-4">
                <div className="text-neutral-400 font-mono text-xs uppercase tracking-[0.2em] bg-white/[0.04] px-4 py-2 rounded-full border border-white/10">
                  Index {currentCard + 1} / {flashcards.length}
                </div>
                <div className="flex gap-3">
                  <button
                    className="flex items-center gap-2 bg-white/10 hover:bg-white text-white hover:text-black px-5 py-2 rounded-full border border-white/20 transition-all text-xs uppercase tracking-[0.15em] font-medium"
                    onClick={downloadAnkiFile}
                  >
                    Export Anki (.txt)
                  </button>
                  <button
                    className="flex items-center gap-2 bg-white hover:bg-neutral-200 text-black px-5 py-2 rounded-full shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all text-xs uppercase tracking-[0.15em] font-semibold"
                    onClick={handleSave}
                    disabled={saving}
                  >
                    {saving ? "Saving Vault..." : "Save to Vault"}
                  </button>
                </div>
              </div>

              <div className="perspective-1000">
                <motion.div
                  className="relative h-96 cursor-pointer transform-style-3d group"
                  onClick={() => setIsFlipped(!isFlipped)}
                  animate={{ rotateY: isFlipped ? 180 : 0 }}
                  transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
                  style={{ transformStyle: "preserve-3d" }}
                >
                  {/* Front */}
                  <div className="absolute inset-0 backface-hidden">
                    <div className="h-full w-full bg-[#121212] rounded-3xl p-10 flex flex-col items-center justify-center text-center border border-white/15 shadow-[0_20px_50px_rgba(0,0,0,0.8)] transition-all">
                      <span className="text-neutral-500 text-xs font-mono tracking-[0.2em] uppercase mb-6">Question • 問い</span>
                      <p className="text-white text-2xl md:text-3xl font-light leading-relaxed">
                        {flashcards[currentCard]?.question}
                      </p>
                      <span className="text-neutral-600 text-xs font-mono mt-auto uppercase tracking-widest">Click to reveal</span>
                    </div>
                  </div>

                  {/* Back */}
                  <div
                    className="absolute inset-0 backface-hidden"
                    style={{ transform: "rotateY(180deg)" }}
                  >
                    <div className="h-full w-full bg-[#0d0d0d] rounded-3xl p-10 flex flex-col items-center justify-center text-center border border-white/25 shadow-[0_20px_50px_rgba(0,0,0,0.9)]">
                      <span className="text-neutral-400 text-xs font-mono tracking-[0.2em] uppercase mb-6">Answer • 記憶</span>
                      <p className="text-neutral-100 text-xl md:text-2xl font-light leading-relaxed">
                        {flashcards[currentCard]?.answer}
                      </p>
                      <span className="text-neutral-600 text-xs font-mono mt-auto uppercase tracking-widest">Click to flip back</span>
                    </div>
                  </div>
                </motion.div>
              </div>

              <div className="flex justify-between items-center mt-10">
                <button
                  className="p-4 rounded-full bg-white/5 hover:bg-white/10 text-white disabled:opacity-30 transition-all"
                  onClick={() => {
                    setCurrentCard(Math.max(0, currentCard - 1));
                    setIsFlipped(false);
                  }}
                  disabled={currentCard === 0}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" /></svg>
                </button>

                <div className="flex gap-1">
                  {flashcards.map((_, i) => (
                    <div
                      key={i}
                      className={`h-1.5 rounded-full transition-all duration-300 ${i === currentCard ? "w-8 bg-blue-500" : "w-1.5 bg-gray-700"}`}
                    />
                  ))}
                </div>

                <button
                  className="p-4 rounded-full bg-white/5 hover:bg-white/10 text-white disabled:opacity-30 transition-all"
                  onClick={() => {
                    setCurrentCard(Math.min(flashcards.length - 1, currentCard + 1));
                    setIsFlipped(false);
                  }}
                  disabled={currentCard === flashcards.length - 1}
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" /></svg>
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}