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
  const [setTitle, setSetTitle] = useState("");

  function parseFlashcards(text: string): Flashcard[] {
    const lines = text.split('\n').map(line => line.trim()).filter(line => line);
    const cards: Flashcard[] = [];

    for (const line of lines) {
      // 1. Try Pipe Separator (Standard format)
      if (line.includes('|')) {
        const parts = line.split('|').map(p => p.trim());
        let question = parts[0];
        const answer = parts.slice(1).join('|').trim();

        // Remove common prefixes: "Card 1:", "1. ", "Q:", "Question:"
        question = question.replace(/^(card\s*\d+[:.]?\s*|\d+[\.):]\s*|q:|question:)/i, '').trim();

        if (question && answer) {
          cards.push({ question, answer });
          continue;
        }
      }

      // 2. Try Colon Separator (Question: Answer)
      if (line.includes(':') && !line.match(/^https?:\/\//)) {
        const parts = line.split(':').map(p => p.trim());
        // Basic check for Question: Answer
        if (parts.length >= 2) {
          const qPrefix = parts[0].toLowerCase();
          if (qPrefix === "question" || qPrefix === "q") {
            const question = parts[1];
            // find corresponding answer in next line or next part?
            // simpler version:
          }

          let question = parts[0].replace(/^(card\s*\d+[:.]?\s*|\d+[\.):]\s*|q:|question:)/i, '').trim();
          const answer = parts.slice(1).join(':').trim();

          if (question && answer && question.length < 500 && !question.includes('http')) {
            cards.push({ question, answer });
            continue;
          }
        }
      }
    }

    // fallback if no structured cards found
    if (cards.length === 0 && text.trim()) {
      const sentences = text.match(/[^.!?]+[.!?]+/g) || [text];
      if (sentences.length >= 2) {
        for (let i = 0; i < sentences.length - 1; i += 2) {
          cards.push({ question: sentences[i].trim(), answer: sentences[i + 1].trim() });
        }
      } else {
        cards.push({ question: "Key Points", answer: text.trim() });
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
    setSetTitle("");

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
      alert("You must be signed in to save flashcards. Redirecting to sign-in page...");
      router.push("/auth");
      return;
    }

    if (!setTitle.trim()) {
      alert("Please enter a title for your flashcard set.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/save-flashcards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: setTitle,
          description: mode === "youtube" ? `Generated from YouTube: ${youtubeUrl}` : "Generated from text input",
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
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden pt-20 pb-10">
      {/* Background Blobs */}
      <motion.div
        className="absolute top-[-10%] left-[-10%] w-[400px] h-[400px] bg-blue-500 opacity-20 rounded-full blur-3xl z-0"
        animate={{ y: [0, 40, 0], x: [0, 30, 0] }}
        transition={{ repeat: Infinity, duration: 8, ease: "easeInOut" }}
      />
      <motion.div
        className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-500 opacity-15 rounded-full blur-3xl z-0"
        animate={{ y: [0, -40, 0], x: [0, -30, 0] }}
        transition={{ repeat: Infinity, duration: 10, ease: "easeInOut" }}
      />

      {/* Top Navigation */}
      <header className="absolute top-4 left-4 z-20 w-full pr-8">
        <Link href="/dashboard" className="glass flex items-center gap-2 text-gray-300 hover:text-white px-3 py-2 rounded-full transition-all hover:bg-white/10 w-fit text-sm md:text-base">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
          </svg>
          <span className="hidden sm:inline">Back to Dashboard</span>
          <span className="sm:hidden">Dashboard</span>
        </Link>
      </header>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="w-full max-w-xl z-10"
      >
        <div className="glass-card rounded-3xl p-8 md:p-12 flex flex-col gap-8 relative">
          <h1 className="text-2xl md:text-3xl font-bold text-white text-center mb-2 drop-shadow-xl">
            Convert Content to <span className="text-blue-400">Flashcards</span>
          </h1>

          {/* Tabs */}
          <div className="flex justify-center gap-2 mb-4 bg-black/20 p-1 rounded-full w-fit mx-auto">
            <button
              className={`px-6 py-2 rounded-full font-semibold transition-all text-sm md:text-base focus:outline-none ${mode === "text" ? "bg-blue-600 text-white shadow-lg" : "text-gray-400 hover:text-white"}`}
              onClick={() => setMode("text")}
            >
              Text Input
            </button>
            <button
              className={`px-6 py-2 rounded-full font-semibold transition-all text-sm md:text-base focus:outline-none ${mode === "youtube" ? "bg-red-600 text-white shadow-lg" : "text-gray-400 hover:text-white"}`}
              onClick={() => setMode("youtube")}
            >
              YouTube
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
                className="w-full min-h-[160px] rounded-2xl border border-white/10 bg-slate-900/50 focus:ring-2 focus:ring-blue-500 focus:border-transparent p-5 text-gray-100 text-base resize-none transition-all shadow-inner placeholder-gray-500"
                placeholder="Paste your lecture notes, article, or summary here..."
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
                className="w-full rounded-2xl border border-white/10 bg-slate-900/50 focus:ring-2 focus:ring-red-500 focus:border-transparent p-5 text-gray-100 text-base transition-all shadow-inner placeholder-gray-500"
                placeholder="Paste a YouTube video URL..."
                value={youtubeUrl}
                onChange={e => setYoutubeUrl(e.target.value)}
              />
            )}
          </AnimatePresence>

          <motion.button
            whileHover={{ scale: 1.02, boxShadow: "0 0 30px rgba(59, 130, 246, 0.5)" }}
            whileTap={{ scale: 0.98 }}
            className={`w-full font-bold rounded-2xl py-4 text-lg shadow-xl transition-all duration-300 ring-1 ring-white/20 disabled:opacity-50 disabled:cursor-not-allowed ${mode === 'youtube' ? 'bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500' : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500'} text-white`}
            onClick={handleGenerate}
            disabled={loading || (mode === "text" ? !text.trim() : !youtubeUrl.trim())}
          >
            {loading ? (
              <span className="flex items-center justify-center gap-3">
                <svg className="animate-spin h-5 w-5 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" /></svg>
                {mode === "youtube" ? "Transcribing Video... (this may take a moment)" : "Generating Flashcards..."}
              </span>
            ) : (
              "Generate Flashcards"
            )}
          </motion.button>

          {/* Warnings/Errors */}
          <AnimatePresence>
            {mode === "youtube" && !loading && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-gray-400 text-sm text-center bg-white/5 rounded-lg p-3 border border-white/5">
                ℹ️ Supports videos with captions/transcripts enabled.
              </motion.div>
            )}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
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

              <div className="flex flex-col md:flex-row justify-between items-center mb-10 gap-6">
                <div className="flex-1 w-full max-w-md">
                  <label htmlFor="set-title" className="block text-blue-400 text-xs font-bold tracking-widest uppercase mb-2 ml-1">
                    Set Title
                  </label>
                  <input
                    id="set-title"
                    type="text"
                    className="w-full bg-slate-900/60 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:ring-2 focus:ring-blue-500 transition-all"
                    placeholder="Enter a title to save..."
                    value={setTitle}
                    onChange={(e) => setSetTitle(e.target.value)}
                  />
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
                  <div className="text-gray-400 font-medium text-xs whitespace-nowrap px-3 py-1 bg-white/5 rounded-full border border-white/5">
                    {flashcards.length} Cards
                  </div>
                  <div className="flex gap-2 flex-1 md:flex-none">
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 px-4 py-2 rounded-full border border-emerald-500/30 transition-colors text-xs md:text-sm"
                      onClick={downloadAnkiFile}
                    >
                      Export
                    </motion.button>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="flex-1 md:flex-none flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-full shadow-lg shadow-blue-900/30 text-xs md:text-sm"
                      onClick={handleSave}
                      disabled={saving}
                    >
                      {saving ? "..." : "Save"}
                    </motion.button>
                  </div>
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
                    <div className="h-full w-full bg-slate-800 rounded-3xl p-6 md:p-10 flex flex-col items-center justify-center text-center border border-white/10 shadow-2xl group-hover:border-blue-500/30 transition-colors">
                      <span className="text-blue-400 text-[10px] md:text-xs font-bold tracking-widest uppercase mb-4 md:mb-6">Question</span>
                      <p className="text-white text-xl md:text-3xl font-medium leading-relaxed break-words line-clamp-6">
                        {flashcards[currentCard]?.question}
                      </p>
                      <span className="text-gray-500 text-sm mt-auto">Click to reveal</span>
                    </div>
                  </div>

                  {/* Back */}
                  <div
                    className="absolute inset-0 backface-hidden"
                    style={{ transform: "rotateY(180deg)" }}
                  >
                    <div className="h-full w-full bg-slate-900 rounded-3xl p-10 flex flex-col items-center justify-center text-center border border-blue-500/30 shadow-2xl shadow-blue-900/20">
                      <span className="text-emerald-400 text-xs font-bold tracking-widest uppercase mb-6">Answer</span>
                      <p className="text-gray-100 text-xl md:text-2xl leading-relaxed">
                        {flashcards[currentCard]?.answer}
                      </p>
                      <span className="text-gray-500 text-sm mt-auto">Click to flip back</span>
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