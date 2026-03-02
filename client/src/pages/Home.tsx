// Home.tsx — ADHD-friendly
// Auto-hiding top bar. Vertically centered content. Pure black/white.

import { useState, useMemo, useEffect, useRef } from "react";
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

const TABS: { id: Tab; label: string }[] = [
  { id: "flashcard", label: "字卡" },
  { id: "quiz",      label: "測驗" },
  { id: "wordlist",  label: "詞表" },
  { id: "stats",     label: "統計" },
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
  const [headerVisible, setHeaderVisible] = useState(false);
  const hideTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => { saveProgress(progress); }, [progress]);

  useEffect(() => {
    const pool = category === "all" ? VOCABULARY : VOCABULARY.filter((w) => w.category === category);
    setDeck(shuffle(pool));
    setCardIndex(0);
  }, [category]);

  // Auto-hide header: show on mouse near top (within 48px), hide after 2s idle
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

  // Also show header on touch (mobile tap near top)
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
    toast.success(`答對 ${correct}/${total} 題`);
  }

  const knownCount = Object.values(progress.words).filter((w) => w.known).length;
  const catLabel = category === "all" ? "全部" : CATEGORIES[category as WordCategory]?.label;
  const poolSize = filteredWords.length;

  // For non-flashcard tabs, show header always
  const showHeader = headerVisible || tab !== "flashcard";

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#191919", color: "#FFFFFF" }}>

      {/* ── Auto-hiding top bar ── */}
      {/* Invisible trigger zone at the very top */}
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
                  全部 <span className="float-right" style={{ color: "rgba(255,255,255,0.18)" }}>{VOCABULARY.length}</span>
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
      </header>

      {/* ── Content — vertically centered for flashcard ── */}
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
          style={{ maxWidth: tab === "wordlist" || tab === "stats" ? "640px" : "480px", margin: "0 auto" }}
        >
          {tab === "flashcard" && currentWord && (
            <FlashCard
              word={currentWord}
              onKnow={handleKnow}
              onDontKnow={handleDontKnow}
              cardIndex={cardIndex}
              totalCards={deck.length}
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

      {/* ── Bottom progress strip ── */}
      <div className="fixed bottom-0 left-0 right-0 h-px z-40" style={{ background: "rgba(255,255,255,0.05)" }}>
        <div
          className="h-full transition-all duration-700"
          style={{
            width: `${Math.round((knownCount / VOCABULARY.length) * 100)}%`,
            background: "rgba(255,255,255,0.35)",
          }}
        />
      </div>
    </div>
  );
}
