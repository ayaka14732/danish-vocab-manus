// Home.tsx — ADHD-friendly
// Top bar: auto-hides in flashcard mode, shows only on hover/touch-top
// Top bar contains: [title] [spacer] [Auto ⏸ speed] [?] [⚙]
// ⚙ opens a settings panel: mode tabs + category + difficulty
// No bottom bar.

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
type FilterDifficulty = "all" | "beginner" | "intermediate" | "advanced";

const DIFFICULTY_LABELS: Record<FilterDifficulty, string> = {
  all: "Alle niveauer",
  beginner: "Begynder",
  intermediate: "Mellemniveau",
  advanced: "Avanceret",
};

const SPEED_PRESETS = [
  { label: "1×",   wordMs: 2000, answerMs: 2000 },
  { label: "1.5×", wordMs: 1400, answerMs: 1400 },
  { label: "2×",   wordMs: 1000, answerMs: 1000 },
  { label: "3×",   wordMs: 700,  answerMs: 700  },
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
  const [difficulty, setDifficulty] = useState<FilterDifficulty>("all");
  const [progress, setProgress] = useState<UserProgress>(loadProgress);
  const [cardIndex, setCardIndex] = useState(0);
  const [deck, setDeck] = useState(() => shuffle(VOCABULARY));
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [headerVisible, setHeaderVisible] = useState(false);

  // Auto mode
  const [autoMode, setAutoMode] = useState(false);
  const [autoPaused, setAutoPaused] = useState(false);
  const [autoSpeedIdx, setAutoSpeedIdx] = useState(0);
  const [autoPhase, setAutoPhase] = useState<"word" | "answer">("word");
  const [autoProgress, setAutoProgress] = useState(0);

  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const autoRafRef = useRef<number | null>(null);
  const autoStartRef = useRef<number>(0);
  const autoDurationRef = useRef<number>(0);

  useEffect(() => { saveProgress(progress); }, [progress]);

  useEffect(() => {
    let pool = category === "all" ? VOCABULARY : VOCABULARY.filter((w) => w.category === category);
    if (difficulty !== "all") pool = pool.filter((w) => w.difficulty === difficulty);
    setDeck(shuffle(pool));
    setCardIndex(0);
  }, [category, difficulty]);

  // Auto-hide header
  useEffect(() => {
    function onMouseMove(e: MouseEvent) {
      if (e.clientY < 56) {
        setHeaderVisible(true);
        if (hideTimer.current) clearTimeout(hideTimer.current);
        hideTimer.current = setTimeout(() => setHeaderVisible(false), 2000);
      }
    }
    window.addEventListener("mousemove", onMouseMove);
    return () => window.removeEventListener("mousemove", onMouseMove);
  }, []);

  useEffect(() => {
    function onTouch(e: TouchEvent) {
      if (e.touches[0]?.clientY < 72) {
        setHeaderVisible(true);
        if (hideTimer.current) clearTimeout(hideTimer.current);
        hideTimer.current = setTimeout(() => setHeaderVisible(false), 3000);
      }
    }
    window.addEventListener("touchstart", onTouch);
    return () => window.removeEventListener("touchstart", onTouch);
  }, []);

  const currentWord = deck[cardIndex % Math.max(deck.length, 1)];

  const filteredWords = useMemo(() => {
    let pool = category === "all" ? VOCABULARY : VOCABULARY.filter((w) => w.category === category);
    if (difficulty !== "all") pool = pool.filter((w) => w.difficulty === difficulty);
    return pool;
  }, [category, difficulty]);

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
      if (p < 1) autoRafRef.current = requestAnimationFrame(tick);
    }
    autoRafRef.current = requestAnimationFrame(tick);
    autoTimer.current = setTimeout(() => {
      if (phase === "word") {
        startAutoPhase("answer", speed.answerMs);
      } else {
        setCardIndex((i) => (i + 1) % deck.length);
        startAutoPhase("word", speed.wordMs);
      }
    }, duration);
  }, [speed, deck.length]);

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

  const autoRevealed = autoMode && autoPhase === "answer";
  const knownCount = Object.values(progress.words).filter((w) => w.known).length;
  const showHeader = headerVisible || tab !== "flashcard" || settingsOpen || helpOpen;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#191919", color: "#FFFFFF" }}>

      {/* ── Top bar ── */}
      <header
        className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 h-11 transition-all duration-300"
        style={{
          background: "rgba(25,25,25,0.97)",
          backdropFilter: "blur(10px)",
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          transform: showHeader ? "translateY(0)" : "translateY(-100%)",
          opacity: showHeader ? 1 : 0,
        }}
        onMouseEnter={() => { setHeaderVisible(true); if (hideTimer.current) clearTimeout(hideTimer.current); }}
        onMouseLeave={() => { hideTimer.current = setTimeout(() => setHeaderVisible(false), 1500); }}
      >
        {/* Left: title */}
        <span className="text-sm select-none" style={{ color: "rgba(255,255,255,0.18)", fontFamily: "'Lora', serif", letterSpacing: "0.02em" }}>
          Dansk Ordbog
        </span>

        {/* Right: auto controls + help + settings */}
        <div className="flex items-center gap-1.5">
          {/* Auto speed & pause — only in flashcard mode */}
          {tab === "flashcard" && autoMode && (
            <>
              <div className="flex items-center gap-0.5">
                {SPEED_PRESETS.map((s, i) => (
                  <button key={s.label} onClick={() => setAutoSpeedIdx(i)}
                    className="px-2 py-1 rounded text-xs transition-colors"
                    style={autoSpeedIdx === i
                      ? { background: "rgba(255,255,255,0.12)", color: "#FFF" }
                      : { color: "rgba(255,255,255,0.22)" }}>
                    {s.label}
                  </button>
                ))}
              </div>
              <button onClick={() => setAutoPaused((p) => !p)}
                className="w-7 h-7 rounded-full flex items-center justify-center text-xs transition-colors hover:bg-white/10"
                style={{ color: "rgba(255,255,255,0.45)", border: "1px solid rgba(255,255,255,0.1)" }}>
                {autoPaused ? "▶" : "⏸"}
              </button>
            </>
          )}

          {/* Help */}
          <button onClick={() => setHelpOpen(true)}
            className="w-7 h-7 rounded-full flex items-center justify-center text-xs transition-colors hover:bg-white/10"
            style={{ color: "rgba(255,255,255,0.22)", border: "1px solid rgba(255,255,255,0.08)" }}>
            ?
          </button>

          {/* Settings */}
          <button onClick={() => setSettingsOpen(true)}
            className="w-7 h-7 rounded-full flex items-center justify-center transition-colors hover:bg-white/10"
            style={{ color: "rgba(255,255,255,0.35)", border: "1px solid rgba(255,255,255,0.1)" }}
            aria-label="Indstillinger">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"/>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/>
            </svg>
          </button>
        </div>
      </header>

      {/* ── Main content ── */}
      <main
        className="flex-1 flex"
        style={
          tab === "flashcard"
            ? { alignItems: "center", justifyContent: "center", minHeight: "100vh" }
            : { paddingTop: "3.5rem", paddingBottom: "2rem" }
        }
      >
        <div className="w-full px-4 md:px-6"
          style={{ maxWidth: tab === "wordlist" || tab === "stats" ? "720px" : "680px", margin: "0 auto" }}>
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
          {tab === "quiz" && <QuizMode category={category} onComplete={handleQuizComplete} />}
          {tab === "wordlist" && <WordList words={filteredWords} progress={progress.words} />}
          {tab === "stats" && <StatsPanel progress={progress} />}
        </div>
      </main>

      {/* ── Bottom progress strip ── */}
      <div className="fixed bottom-0 left-0 right-0 z-40" style={{ height: autoMode ? "3px" : "1px" }}>
        <div className="absolute inset-0" style={{ background: "rgba(255,255,255,0.05)" }} />
        <div className="absolute inset-y-0 left-0 transition-all duration-700"
          style={{ width: `${Math.round((knownCount / VOCABULARY.length) * 100)}%`, background: "rgba(255,255,255,0.18)" }} />
        {autoMode && !autoPaused && (
          <div className="absolute inset-y-0 left-0"
            style={{ width: `${autoProgress * 100}%`, background: autoPhase === "word" ? "rgba(255,255,255,0.5)" : "rgba(68,255,136,0.7)", transition: "none" }} />
        )}
      </div>

      {/* ════════════════════════════════════════
          SETTINGS PANEL
          ════════════════════════════════════════ */}
      {settingsOpen && (
        <div className="fixed inset-0 z-50 flex items-start justify-end"
          style={{ background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)" }}
          onClick={() => setSettingsOpen(false)}>
          <div
            className="h-full overflow-y-auto"
            style={{
              width: "min(320px, 92vw)",
              background: "#1e1e1e",
              borderLeft: "1px solid rgba(255,255,255,0.08)",
              boxShadow: "-16px 0 48px rgba(0,0,0,0.6)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Panel header */}
            <div className="flex items-center justify-between px-5 py-4"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
              <span className="text-sm font-semibold" style={{ color: "rgba(255,255,255,0.7)", fontFamily: "'Lora', serif" }}>
                Indstillinger
              </span>
              <button onClick={() => setSettingsOpen(false)}
                className="w-7 h-7 rounded-full flex items-center justify-center text-sm hover:bg-white/10 transition-colors"
                style={{ color: "rgba(255,255,255,0.3)" }}>
                ✕
              </button>
            </div>

            <div className="px-5 py-4 space-y-6">

              {/* ── Mode ── */}
              <section>
                <div className="text-xs mb-3" style={{ color: "rgba(255,255,255,0.2)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                  Tilstand
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {TABS.map((t) => (
                    <button key={t.id} onClick={() => { setTab(t.id); setSettingsOpen(false); }}
                      className="py-2.5 rounded-lg text-sm transition-colors"
                      style={tab === t.id
                        ? { background: "rgba(255,255,255,0.12)", color: "#FFFFFF", fontWeight: 600 }
                        : { background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.35)" }}>
                      {t.label}
                    </button>
                  ))}
                </div>
              </section>

              {/* ── Auto mode (only in flashcard) ── */}
              {tab === "flashcard" && (
                <section>
                  <div className="text-xs mb-3" style={{ color: "rgba(255,255,255,0.2)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                    Automatisk
                  </div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm" style={{ color: "rgba(255,255,255,0.5)" }}>Auto-afspilning</span>
                    <button
                      onClick={() => { setAutoMode((m) => !m); setAutoPaused(false); setAutoPhase("word"); }}
                      className="relative w-10 h-5 rounded-full transition-colors"
                      style={{ background: autoMode ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.08)" }}>
                      <span className="absolute top-0.5 transition-all duration-200 w-4 h-4 rounded-full"
                        style={{ left: autoMode ? "calc(100% - 1.125rem)" : "2px", background: autoMode ? "#fff" : "rgba(255,255,255,0.3)" }} />
                    </button>
                  </div>
                  {autoMode && (
                    <div className="grid grid-cols-4 gap-1">
                      {SPEED_PRESETS.map((s, i) => (
                        <button key={s.label} onClick={() => setAutoSpeedIdx(i)}
                          className="py-2 rounded-lg text-xs transition-colors"
                          style={autoSpeedIdx === i
                            ? { background: "rgba(255,255,255,0.15)", color: "#FFF" }
                            : { background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.3)" }}>
                          {s.label}
                        </button>
                      ))}
                    </div>
                  )}
                </section>
              )}

              {/* ── Difficulty ── */}
              <section>
                <div className="text-xs mb-3" style={{ color: "rgba(255,255,255,0.2)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                  Niveau
                </div>
                <div className="space-y-0.5">
                  {(["all", "beginner", "intermediate", "advanced"] as FilterDifficulty[]).map((d) => {
                    const base = category === "all" ? VOCABULARY : VOCABULARY.filter((w) => w.category === category);
                    const count = d === "all" ? base.length : base.filter((w) => w.difficulty === d).length;
                    return (
                      <button key={d} onClick={() => setDifficulty(d)}
                        className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors"
                        style={difficulty === d
                          ? { background: "rgba(255,255,255,0.1)", color: "#FFF" }
                          : { color: "rgba(255,255,255,0.35)", background: "transparent" }}>
                        <span>{DIFFICULTY_LABELS[d]}</span>
                        <span style={{ color: "rgba(255,255,255,0.18)", fontSize: "0.75rem" }}>{count}</span>
                      </button>
                    );
                  })}
                </div>
              </section>

              {/* ── Category ── */}
              <section>
                <div className="text-xs mb-3" style={{ color: "rgba(255,255,255,0.2)", letterSpacing: "0.1em", textTransform: "uppercase" }}>
                  Kategori
                </div>
                <div className="space-y-0.5">
                  <button onClick={() => setCategory("all")}
                    className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors"
                    style={category === "all"
                      ? { background: "rgba(255,255,255,0.1)", color: "#FFF" }
                      : { color: "rgba(255,255,255,0.35)", background: "transparent" }}>
                    <span>Alle kategorier</span>
                    <span style={{ color: "rgba(255,255,255,0.18)", fontSize: "0.75rem" }}>{VOCABULARY.length}</span>
                  </button>
                  {(Object.entries(CATEGORIES) as [WordCategory, typeof CATEGORIES[WordCategory]][]).map(([key, cat]) => {
                    const count = VOCABULARY.filter((w) => w.category === key).length;
                    return (
                      <button key={key} onClick={() => setCategory(key)}
                        className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm transition-colors"
                        style={category === key
                          ? { background: "rgba(255,255,255,0.1)", color: "#FFF" }
                          : { color: "rgba(255,255,255,0.35)", background: "transparent" }}>
                        <span>{cat.label}</span>
                        <span style={{ color: "rgba(255,255,255,0.18)", fontSize: "0.75rem" }}>{count}</span>
                      </button>
                    );
                  })}
                </div>
              </section>

            </div>
          </div>
        </div>
      )}

      {/* ── Help dialog ── */}
      {helpOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.75)" }}
          onClick={() => setHelpOpen(false)}>
          <div className="rounded-2xl p-8 w-full mx-4"
            style={{ maxWidth: "360px", background: "#242424", border: "1px solid rgba(255,255,255,0.08)", boxShadow: "0 24px 64px rgba(0,0,0,0.8)" }}
            onClick={(e) => e.stopPropagation()}>
            <h2 className="text-base font-semibold mb-6" style={{ color: "rgba(255,255,255,0.9)", fontFamily: "'Lora', serif" }}>
              Tastaturgenveje
            </h2>
            <table className="w-full" style={{ borderCollapse: "separate", borderSpacing: "0 10px" }}>
              <tbody>
                {[
                  ["Mellemrum", "Vis svar"],
                  ["→", "Kender"],
                  ["←", "Kender ikke"],
                  ["Klik på ordet", "Udtale"],
                  ["—", ""],
                  ["Dobbelttryk", "Vis svar"],
                  ["Stryg højre", "Kender"],
                  ["Stryg venstre", "Kender ikke"],
                ].map(([key, desc], i) => (
                  key === "—"
                    ? <tr key={i}><td colSpan={2}><div style={{ height: "1px", background: "rgba(255,255,255,0.06)", margin: "4px 0" }} /></td></tr>
                    : (
                      <tr key={i}>
                        <td style={{ width: "48%", paddingRight: "12px" }}>
                          <kbd className="px-2.5 py-1 rounded text-xs font-mono"
                            style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)", color: "rgba(255,255,255,0.7)" }}>
                            {key}
                          </kbd>
                        </td>
                        <td className="text-sm" style={{ color: "rgba(255,255,255,0.4)" }}>{desc}</td>
                      </tr>
                    )
                ))}
              </tbody>
            </table>
            <button onClick={() => setHelpOpen(false)}
              className="mt-8 w-full py-2.5 rounded-lg text-sm transition-colors hover:bg-white/10"
              style={{ color: "rgba(255,255,255,0.3)", border: "1px solid rgba(255,255,255,0.08)" }}>
              Luk
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
