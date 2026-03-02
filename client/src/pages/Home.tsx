// Home.tsx — ADHD-friendly
// Auto-hiding top bar. Vertically centered content. Pure black/white.
// Auto mode: auto-reveal → auto-advance, adjustable speed, pausable.

import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import {
  VOCABULARY,
  CATEGORIES,
  WordCategory,
  loadProgress,
  saveProgress,
  markWord,
  UserProgress,
} from "@/lib/vocabulary";
import FlashCard from "@/components/FlashCard";
import QuizMode from "@/components/QuizMode";
import WordList from "@/components/WordList";
import StatsPanel from "@/components/StatsPanel";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Tab = "flashcard" | "quiz" | "wordlist" | "stats";
type FilterCategory = WordCategory | "all";

// Auto-mode speed presets (ms to show word before revealing, ms to show answer before advancing)
const SPEED_PRESETS = [
  { label: "1×", wordMs: 2000, answerMs: 2000 },
  { label: "1.5×", wordMs: 1400, answerMs: 1400 },
  { label: "2×", wordMs: 1000, answerMs: 1000 },
  { label: "3×", wordMs: 700,  answerMs: 700  },
];

const TABS: { id: Tab; label: string }[] = [
  { id: "flashcard", label: "Kort" },
  { id: "quiz",      label: "Quiz" },
  { id: "wordlist",  label: "Ordliste" },
  { id: "stats",     label: "Statistik" },
];

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function Home() {
  const [tab, setTab] = useState<Tab>("flashcard");
  const [category, setCategory] = useState<FilterCategory>("all");
  const [progress, setProgress] = useState<UserProgress>(loadProgress);
  const [cardIndex, setCardIndex] = useState(0);
  const [deck, setDeck] = useState(() => shuffle(VOCABULARY));
  const [catOpen, setCatOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [headerVisible, setHeaderVisible] = useState(false);

  // Auto mode
  const [autoMode, setAutoMode] = useState(false);
  const [autoPaused, setAutoPaused] = useState(false);
  const [autoSpeedIdx, setAutoSpeedIdx] = useState(0);
  // autoPhase: "word" = showing word, "answer" = showing answer
  const [autoPhase, setAutoPhase] = useState<"word" | "answer">("word");
  // Progress bar 0..1 for current phase
  const [autoProgress, setAutoProgress] = useState(0);

  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoRafRef = useRef<number | null>(null);
  const autoStartRef = useRef<number>(0);
  const autoDurationRef = useRef<number>(0);

  useEffect(() => { saveProgress(progress); }, [progress]);

  useEffect(() => {
    const pool = category === "all" ? VOCABULARY : VOCABULARY.filter((w) => w.category === category);
    setDeck(shuffle(pool));
    setCardIndex(0);
  }, [category]);

  // Auto-hide header
  useEffect(() => {
    function handleMouseMove(e: MouseEvent) {
      if (e.clientY < 48) {
        setHeaderVisible(true);
        if (hideTimer.current) clearTimeout(hideTimer.current);
        hideTimer.current = setTimeout(() => setHeaderVisible(false), 2000);
      }
    }
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  useEffect(() => {
    function handleTouch(e: TouchEvent) {
      if (e.touches[0]?.clientY < 60) {
        setHeaderVisible(true);
        if (hideTimer.current) clearTimeout(hideTimer.current);
        hideTimer.current = setTimeout(() => setHeaderVisible(false), 3000);
      }
    }
    window.addEventListener("touchstart", handleTouch);
    return () => window.removeEventListener("touchstart", handleTouch);
  }, []);

  const currentWord = deck[cardIndex % Math.max(deck.length, 1)];

  const filteredWords = useMemo(
    () => category === "all" ? VOCABULARY : VOCABULARY.filter((w) => w.category === category),
    [category]
  );

  function handleKnow() {
    setProgress((p) => markWord(p, currentWord.id, true));
    setCardIndex((i) => (i + 1) % deck.length);
  }

  function handleDontKnow() {
    setProgress((p) => markWord(p, currentWord.id, false));
    setCardIndex((i) => (i + 1) % deck.length);
  }

  function handleQuizComplete(correct: number, total: number) {
    toast.success(`${correct}/${total} rigtige`);
  }

  // ── Auto mode engine ──
  const speed = SPEED_PRESETS[autoSpeedIdx];

  const startAutoPhase = useCallback((phase: "word" | "answer", duration: number) => {
    setAutoPhase(phase);
    setAutoProgress(0);
    autoStartRef.current = performance.now();
    autoDurationRef.current = duration;

    if (autoRafRef.current) cancelAnimationFrame(autoRafRef.current);
    if (autoTimer.current) clearTimeout(autoTimer.current);

    function tick() {
      const elapsed = performance.now() - autoStartRef.current;
      const p = Math.min(elapsed / autoDurationRef.current, 1);
      setAutoProgress(p);
      if (p < 1) {
        autoRafRef.current = requestAnimationFrame(tick);
      }
    }
    autoRafRef.current = requestAnimationFrame(tick);

    autoTimer.current = setTimeout(() => {
      if (phase === "word") {
        // Reveal answer
        startAutoPhase("answer", autoDurationRef.current === duration ? speed.answerMs : speed.answerMs);
      } else {
        // Advance to next card
        setCardIndex((i) => (i + 1) % deck.length);
        startAutoPhase("word", speed.wordMs);
      }
    }, duration);
  }, [speed, deck.length]);

  // Start/stop auto mode
  useEffect(() => {
    if (!autoMode || autoPaused) {
      if (autoTimer.current) clearTimeout(autoTimer.current);
      if (autoRafRef.current) cancelAnimationFrame(autoRafRef.current);
      setAutoProgress(0);
      return;
    }
    startAutoPhase("word", speed.wordMs);
    return () => {
      if (autoTimer.current) clearTimeout(autoTimer.current);
      if (autoRafRef.current) cancelAnimationFrame(autoRafRef.current);
    };
  }, [autoMode, autoPaused, autoSpeedIdx, deck]);

  // When auto mode is on, FlashCard should show revealed based on autoPhase
  const autoRevealed = autoMode && autoPhase === "answer";

  const knownCount = Object.values(progress.words).filter((w) => w.known).length;
  const catLabel = category === "all" ? "Alle" : CATEGORIES[category as WordCategory]?.label;
  const poolSize = filteredWords.length;

  const showHeader = headerVisible || tab !== "flashcard";

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#191919", color: "#FFFFFF" }}>

      {/* ── Auto-hiding top bar ── */}
      <div className="fixed top-0 left-0 right-0 h-12 z-40" style={{ pointerEvents: "none" }} />

      <header
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 py-3 transition-all duration-300"
        style={{
          background: "rgba(25,25,25,0.95)",
          backdropFilter: "blur(8px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          transform: showHeader ? "translateY(0)" : "translateY(-100%)",
          opacity: showHeader ? 1 : 0,
        }}
        onMouseEnter={() => {
          setHeaderVisible(true);
          if (hideTimer.current) clearTimeout(hideTimer.current);
        }}
        onMouseLeave={() => {
          hideTimer.current = setTimeout(() => setHeaderVisible(false), 1500);
        }}
      >
        {/* App name */}
        <span className="text-sm font-medium" style={{ color: "rgba(255,255,255,0.25)", fontFamily: "'Lora', serif" }}>
          Dansk Ordbog
        </span>

        {/* Mode tabs */}
        <nav className="flex items-center gap-0.5">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn("px-3.5 py-1.5 rounded-md text-sm transition-colors")}
              style={
                tab === t.id
                  ? { background: "rgba(255,255,255,0.1)", color: "#FFFFFF", fontWeight: 600 }
                  : { color: "rgba(255,255,255,0.3)" }
              }
            >
              {t.label}
            </button>
          ))}
        </nav>

        {/* Right controls */}
        <div className="flex items-center gap-2">
          {/* Auto mode toggle */}
          {tab === "flashcard" && (
            <div className="flex items-center gap-1.5">
              {/* Speed selector — only visible in auto mode */}
              {autoMode && (
                <div className="flex items-center gap-0.5">
                  {SPEED_PRESETS.map((s, i) => (
                    <button
                      key={s.label}
                      onClick={() => setAutoSpeedIdx(i)}
                      className="px-2 py-1 rounded text-xs transition-colors"
                      style={
                        autoSpeedIdx === i
                          ? { background: "rgba(255,255,255,0.15)", color: "#FFFFFF" }
                          : { color: "rgba(255,255,255,0.25)" }
                      }
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Pause/resume — only in auto mode */}
              {autoMode && (
                <button
                  onClick={() => setAutoPaused((p) => !p)}
                  className="w-7 h-7 rounded-full flex items-center justify-center text-xs transition-colors hover:bg-white/10"
                  style={{ color: "rgba(255,255,255,0.5)", border: "1px solid rgba(255,255,255,0.1)" }}
                  title={autoPaused ? "Fortsæt" : "Pause"}
                >
                  {autoPaused ? "▶" : "⏸"}
                </button>
              )}

              {/* Auto toggle button */}
              <button
                onClick={() => {
                  setAutoMode((m) => !m);
                  setAutoPaused(false);
                  setAutoPhase("word");
                }}
                className="px-3 py-1.5 rounded-md text-xs font-medium transition-colors"
                style={
                  autoMode
                    ? { background: "rgba(255,255,255,0.15)", color: "#FFFFFF", border: "1px solid rgba(255,255,255,0.2)" }
                    : { color: "rgba(255,255,255,0.3)", border: "1px solid rgba(255,255,255,0.08)" }
                }
                title="Auto-afspilning"
              >
                Auto
              </button>
            </div>
          )}

          {/* Help button */}
          <button
            onClick={() => setHelpOpen(true)}
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs transition-colors hover:bg-white/10"
            style={{ color: "rgba(255,255,255,0.25)", border: "1px solid rgba(255,255,255,0.1)" }}
            title="Tastaturgenveje"
          >
            ?
          </button>

          {/* Category picker */}
          <div className="relative">
            <button
              onClick={() => setCatOpen((o) => !o)}
              className="text-sm px-3 py-1.5 rounded-md transition-colors hover:bg-white/5"
              style={{ color: "rgba(255,255,255,0.3)" }}
            >
              {catLabel} <span style={{ color: "rgba(255,255,255,0.15)" }}>{poolSize}</span>
            </button>

            {catOpen && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setCatOpen(false)} />
                <div
                  className="absolute right-0 top-full mt-1 z-20 rounded-xl overflow-hidden py-1"
                  style={{
                    background: "#242424",
                    border: "1px solid rgba(255,255,255,0.08)",
                    minWidth: "160px",
                    boxShadow: "0 8px 32px rgba(0,0,0,0.7)",
                  }}
                >
                  <button
                    onClick={() => { setCategory("all"); setCatOpen(false); }}
                    className="w-full text-left px-4 py-2 text-sm transition-colors hover:bg-white/5"
                    style={{ color: category === "all" ? "#FFFFFF" : "rgba(255,255,255,0.4)" }}
                  >
                    Alle <span className="float-right" style={{ color: "rgba(255,255,255,0.18)" }}>{VOCABULARY.length}</span>
                  </button>
                  {(Object.entries(CATEGORIES) as [WordCategory, typeof CATEGORIES[WordCategory]][]).map(([key, cat]) => {
                    const count = VOCABULARY.filter((w) => w.category === key).length;
                    return (
                      <button
                        key={key}
                        onClick={() => { setCategory(key); setCatOpen(false); }}
                        className="w-full text-left px-4 py-2 text-sm transition-colors hover:bg-white/5"
                        style={{ color: category === key ? "#FFFFFF" : "rgba(255,255,255,0.4)" }}
                      >
                        {cat.label} <span className="float-right" style={{ color: "rgba(255,255,255,0.18)" }}>{count}</span>
                      </button>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* ── Content ── */}
      <main
        className="flex-1 flex"
        style={
          tab === "flashcard"
            ? { alignItems: "center", justifyContent: "center", minHeight: "100vh" }
            : { paddingTop: "4rem" }
        }
      >
        <div
          className="w-full px-6"
          style={{ maxWidth: tab === "wordlist" || tab === "stats" ? "720px" : "680px", margin: "0 auto" }}
        >
          {tab === "flashcard" && currentWord && (
            <FlashCard
              word={currentWord}
              onKnow={handleKnow}
              onDontKnow={handleDontKnow}
              cardIndex={cardIndex}
              totalCards={deck.length}
              autoMode={autoMode}
              autoRevealed={autoRevealed}
            />
          )}
          {tab === "quiz" && (
            <QuizMode category={category} onComplete={handleQuizComplete} />
          )}
          {tab === "wordlist" && (
            <WordList words={filteredWords} progress={progress.words} />
          )}
          {tab === "stats" && (
            <StatsPanel progress={progress} />
          )}
        </div>
      </main>

      {/* ── Help dialog ── */}
      {helpOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.75)" }}
          onClick={() => setHelpOpen(false)}
        >
          <div
            className="rounded-2xl p-8 w-full"
            style={{
              maxWidth: "360px",
              background: "#242424",
              border: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "0 24px 64px rgba(0,0,0,0.8)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="text-base font-semibold mb-6" style={{ color: "rgba(255,255,255,0.9)", fontFamily: "'Lora', serif" }}>
              Tastaturgenveje
            </h2>
            <table className="w-full" style={{ borderCollapse: "separate", borderSpacing: "0 12px" }}>
              <tbody>
                {[
                  ["Mellemrum", "Vis svar"],
                  ["→", "Kender"],
                  ["←", "Kender ikke"],
                  ["Klik på ordet", "Udtale"],
                  ["―――", ""],
                  ["Dobbelttryk", "Vis svar"],
                  ["Stryg højre", "Kender"],
                  ["Stryg venstre", "Kender ikke"],
                  ["Tryk på ordet", "Udtale"],
                  ["―――", ""],
                  ["Auto", "Automatisk afspilning"],
                  ["⏸ / ▶", "Pause / Fortsæt"],
                  ["1× / 2× / 3×", "Hastighed"],
                ].map(([key, desc]) => (
                  <tr key={key}>
                    <td style={{ width: "40%" }}>
                      <kbd
                        className="px-2.5 py-1 rounded text-xs font-mono"
                        style={{
                          background: "rgba(255,255,255,0.07)",
                          border: "1px solid rgba(255,255,255,0.12)",
                          color: "rgba(255,255,255,0.7)",
                        }}
                      >{key}</kbd>
                    </td>
                    <td className="text-sm" style={{ color: "rgba(255,255,255,0.45)" }}>{desc}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button
              onClick={() => setHelpOpen(false)}
              className="mt-8 w-full py-2.5 rounded-lg text-sm transition-colors hover:bg-white/10"
              style={{ color: "rgba(255,255,255,0.35)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              Luk
            </button>
          </div>
        </div>
      )}

      {/* ── Bottom progress strip ── */}
      <div className="fixed bottom-0 left-0 right-0 z-40" style={{ height: autoMode ? "3px" : "1px" }}>
        {/* Overall known progress */}
        <div className="absolute inset-0" style={{ background: "rgba(255,255,255,0.05)" }}>
          <div
            className="h-full transition-all duration-700"
            style={{
              width: `${Math.round((knownCount / VOCABULARY.length) * 100)}%`,
              background: "rgba(255,255,255,0.2)",
            }}
          />
        </div>
        {/* Auto mode phase progress overlay */}
        {autoMode && !autoPaused && (
          <div
            className="absolute inset-0 origin-left"
            style={{
              width: `${autoProgress * 100}%`,
              background: autoPhase === "word" ? "rgba(255,255,255,0.5)" : "rgba(68,255,136,0.7)",
              transition: "none",
            }}
          />
        )}
      </div>
    </div>
  );
}
