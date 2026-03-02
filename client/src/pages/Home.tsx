// Home.tsx — ADHD-friendly design
// Principles: one thing at a time, no decorative noise, clear hierarchy, minimal chrome

import { useState, useMemo, useEffect } from "react";
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

  useEffect(() => { saveProgress(progress); }, [progress]);

  useEffect(() => {
    const pool = category === "all" ? VOCABULARY : VOCABULARY.filter((w) => w.category === category);
    setDeck(shuffle(pool));
    setCardIndex(0);
  }, [category]);

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

  function handleShuffle() {
    const pool = category === "all" ? VOCABULARY : VOCABULARY.filter((w) => w.category === category);
    setDeck(shuffle(pool));
    setCardIndex(0);
  }

  const knownCount = Object.values(progress.words).filter((w) => w.known).length;
  const catLabel = category === "all" ? "全部" : CATEGORIES[category as WordCategory]?.label;
  const poolSize = filteredWords.length;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: "#111612", color: "#E8E4DC" }}>

      {/* ── Top bar ── */}
      <header
        className="flex items-center justify-between px-5 py-3 border-b shrink-0"
        style={{ borderColor: "rgba(255,255,255,0.07)" }}
      >
        {/* Left: app name */}
        <span className="text-sm font-semibold tracking-wide" style={{ fontFamily: "'Lora', serif", color: "#C9A84C" }}>
          Dansk Ordbog
        </span>

        {/* Center: mode tabs */}
        <nav className="flex items-center gap-1">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={cn(
                "px-3 py-1.5 rounded-md text-sm transition-colors",
                tab === t.id
                  ? "font-semibold"
                  : "font-normal opacity-40 hover:opacity-70"
              )}
              style={tab === t.id ? { background: "rgba(201,168,76,0.15)", color: "#C9A84C" } : { color: "#E8E4DC" }}
            >
              {t.label}
            </button>
          ))}
        </nav>

        {/* Right: category picker */}
        <div className="relative">
          <button
            onClick={() => setCatOpen((o) => !o)}
            className="text-sm px-3 py-1.5 rounded-md transition-colors hover:bg-white/5"
            style={{ color: "rgba(232,228,220,0.5)", fontVariantNumeric: "tabular-nums" }}
          >
            {catLabel} <span style={{ color: "rgba(232,228,220,0.25)" }}>{poolSize}</span>
          </button>

          {catOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setCatOpen(false)} />
              <div
                className="absolute right-0 top-full mt-1 z-20 rounded-xl overflow-hidden py-1"
                style={{
                  background: "#1A2018",
                  border: "1px solid rgba(255,255,255,0.1)",
                  minWidth: "160px",
                  boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
                }}
              >
                <button
                  onClick={() => { setCategory("all"); setCatOpen(false); }}
                  className={cn("w-full text-left px-4 py-2 text-sm transition-colors hover:bg-white/5", category === "all" && "font-semibold")}
                  style={{ color: category === "all" ? "#C9A84C" : "rgba(232,228,220,0.7)" }}
                >
                  全部 <span className="float-right opacity-40">{VOCABULARY.length}</span>
                </button>
                {(Object.entries(CATEGORIES) as [WordCategory, typeof CATEGORIES[WordCategory]][]).map(([key, cat]) => {
                  const count = VOCABULARY.filter((w) => w.category === key).length;
                  return (
                    <button
                      key={key}
                      onClick={() => { setCategory(key); setCatOpen(false); }}
                      className={cn("w-full text-left px-4 py-2 text-sm transition-colors hover:bg-white/5", category === key && "font-semibold")}
                      style={{ color: category === key ? "#C9A84C" : "rgba(232,228,220,0.7)" }}
                    >
                      {cat.label} <span className="float-right opacity-40">{count}</span>
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </header>

      {/* ── Content ── */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-2xl mx-auto px-4 py-8">
          {tab === "flashcard" && currentWord && (
            <FlashCard
              word={currentWord}
              onKnow={handleKnow}
              onDontKnow={handleDontKnow}
              onShuffle={handleShuffle}
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
      <div
        className="h-0.5 shrink-0"
        style={{ background: "rgba(255,255,255,0.06)" }}
      >
        <div
          className="h-full transition-all duration-700"
          style={{
            width: `${Math.round((knownCount / VOCABULARY.length) * 100)}%`,
            background: "#C9A84C",
          }}
        />
      </div>
    </div>
  );
}
