// Home.tsx — Main page for Danish Vocabulary Learning App
// Design: Academic Elegance
// - Dark forest green background
// - Parchment flashcards with 3D flip
// - Gold (#C9A84C) accents
// - Lora serif headings, Noto Sans body
// - Left sidebar navigation, right main content

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
import {
  BookOpen, Brain, List, BarChart2, Menu,
  ChevronRight, Flame, Shuffle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

type Tab = "flashcard" | "quiz" | "wordlist" | "stats";
type FilterCategory = WordCategory | "all";

const TABS: { id: Tab; label: string; icon: React.ReactNode; desc: string }[] = [
  { id: "flashcard", label: "字卡學習", icon: <BookOpen size={17} />, desc: "翻轉字卡，認識單詞" },
  { id: "quiz",      label: "選擇測驗", icon: <Brain size={17} />,    desc: "四選一，測試記憶" },
  { id: "wordlist",  label: "單詞列表", icon: <List size={17} />,     desc: "瀏覽所有單詞" },
  { id: "stats",     label: "學習統計", icon: <BarChart2 size={17} />, desc: "查看學習進度" },
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
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
    toast.success("太棒了！繼續加油！", { duration: 1500 });
    setCardIndex((i) => (i + 1) % deck.length);
  }

  function handleDontKnow() {
    setProgress((p) => markWord(p, currentWord.id, false));
    setCardIndex((i) => (i + 1) % deck.length);
  }

  function handleQuizComplete(correct: number, total: number) {
    toast.success(`測驗完成！答對 ${correct}/${total} 題`, { duration: 3000 });
  }

  function handleShuffle() {
    const pool = category === "all" ? VOCABULARY : VOCABULARY.filter((w) => w.category === category);
    setDeck(shuffle(pool));
    setCardIndex(0);
    toast("已重新洗牌！", { duration: 1500 });
  }

  const knownCount = Object.values(progress.words).filter((w) => w.known).length;
  const streak = progress.studyStreak;

  return (
    <div
      className="min-h-screen flex relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #0F2318 0%, #1B3A2D 40%, #162E23 100%)" }}
    >
      {/* Decorative background elements */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full opacity-5"
          style={{ background: "radial-gradient(circle, #C9A84C 0%, transparent 70%)", transform: "translate(30%, -30%)" }} />
        <div className="absolute bottom-0 left-0 w-80 h-80 rounded-full opacity-5"
          style={{ background: "radial-gradient(circle, #C9A84C 0%, transparent 70%)", transform: "translate(-30%, 30%)" }} />
      </div>

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/60 z-20 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* ── Sidebar ── */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full z-30 flex flex-col transition-transform duration-300 lg:relative lg:translate-x-0 lg:z-auto"
          , sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
        style={{
          width: "264px",
          background: "rgba(8,22,14,0.97)",
          borderRight: "1px solid rgba(201,168,76,0.18)",
          backdropFilter: "blur(16px)",
        }}
      >
        {/* Logo */}
        <div className="px-5 py-5 border-b" style={{ borderColor: "rgba(201,168,76,0.15)" }}>
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center text-xl font-bold shrink-0"
              style={{
                background: "linear-gradient(135deg, rgba(201,168,76,0.25), rgba(201,168,76,0.1))",
                border: "1px solid rgba(201,168,76,0.4)",
                color: "#C9A84C",
                fontFamily: "'Lora', serif",
              }}
            >
              D
            </div>
            <div>
              <p className="font-bold text-sm" style={{ fontFamily: "'Lora', serif", color: "#F5F0E8" }}>
                Dansk Ordbog
              </p>
              <p className="text-xs" style={{ color: "rgba(245,240,232,0.4)" }}>丹麥語單詞學習</p>
            </div>
          </div>

          {/* Streak */}
          {streak > 0 && (
            <div className="mt-4 px-3 py-2 rounded-lg flex items-center gap-2"
              style={{ background: "rgba(224,112,96,0.1)", border: "1px solid rgba(224,112,96,0.2)" }}>
              <Flame size={14} style={{ color: "#E07060" }} />
              <span className="text-xs" style={{ color: "rgba(245,240,232,0.75)" }}>
                連續學習 <strong style={{ color: "#E07060" }}>{streak}</strong> 天
              </span>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="px-3 py-4 flex flex-col gap-0.5">
          <p className="text-xs font-medium px-3 mb-2 uppercase tracking-widest" style={{ color: "rgba(245,240,232,0.25)" }}>
            學習模式
          </p>
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => { setTab(t.id); setSidebarOpen(false); }}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 text-left group",
                tab === t.id ? "sidebar-item-active" : "hover:bg-white/5"
              )}
              style={{ color: tab === t.id ? "#C9A84C" : "rgba(245,240,232,0.6)" }}
            >
              <span className={cn("transition-transform duration-150", tab !== t.id && "group-hover:scale-110")}>
                {t.icon}
              </span>
              <span className="flex-1">{t.label}</span>
              {tab === t.id && <ChevronRight size={13} />}
            </button>
          ))}
        </nav>

        {/* Category filter */}
        <div className="px-3 py-3 border-t flex flex-col gap-0.5 overflow-y-auto flex-1"
          style={{ borderColor: "rgba(201,168,76,0.1)" }}>
          <p className="text-xs font-medium px-3 mb-2 uppercase tracking-widest" style={{ color: "rgba(245,240,232,0.25)" }}>
            詞彙分類
          </p>
          <button
            onClick={() => setCategory("all")}
            className={cn("flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all", category === "all" ? "sidebar-item-active" : "hover:bg-white/5")}
            style={{ color: category === "all" ? "#C9A84C" : "rgba(245,240,232,0.55)" }}
          >
            <span>📚</span>
            <span className="flex-1">全部單詞</span>
            <span className="text-xs" style={{ color: "rgba(245,240,232,0.3)" }}>{VOCABULARY.length}</span>
          </button>
          {(Object.entries(CATEGORIES) as [WordCategory, typeof CATEGORIES[WordCategory]][]).map(([key, cat]) => {
            const count = VOCABULARY.filter((w) => w.category === key).length;
            const knownInCat = VOCABULARY.filter((w) => w.category === key && progress.words[w.id]?.known).length;
            return (
              <button
                key={key}
                onClick={() => setCategory(key)}
                className={cn("flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-all", category === key ? "sidebar-item-active" : "hover:bg-white/5")}
                style={{ color: category === key ? "#C9A84C" : "rgba(245,240,232,0.55)" }}
              >
                <span>{cat.icon}</span>
                <span className="flex-1">{cat.label}</span>
                <span className="text-xs" style={{ color: knownInCat === count ? "#70C090" : "rgba(245,240,232,0.3)" }}>
                  {knownInCat}/{count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Bottom progress */}
        <div className="p-4 border-t shrink-0" style={{ borderColor: "rgba(201,168,76,0.1)" }}>
          <div className="flex justify-between text-xs mb-1.5" style={{ color: "rgba(245,240,232,0.4)" }}>
            <span>整體進度</span>
            <span style={{ color: "#C9A84C" }}>{knownCount}/{VOCABULARY.length}</span>
          </div>
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(245,240,232,0.08)" }}>
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{ width: `${Math.round((knownCount / VOCABULARY.length) * 100)}%`, background: "linear-gradient(90deg, #C9A84C, #E0C06A)" }}
            />
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Header */}
        <header
          className="flex items-center gap-4 px-5 py-3.5 border-b shrink-0"
          style={{ borderColor: "rgba(201,168,76,0.12)", background: "rgba(8,22,14,0.7)", backdropFilter: "blur(12px)" }}
        >
          <button className="lg:hidden p-2 rounded-lg hover:bg-white/10 transition-colors" onClick={() => setSidebarOpen(true)}>
            <Menu size={20} style={{ color: "rgba(245,240,232,0.7)" }} />
          </button>

          <div className="flex-1 min-w-0">
            <h1 className="text-base font-bold leading-tight truncate" style={{ fontFamily: "'Lora', serif", color: "#F5F0E8" }}>
              {TABS.find((t) => t.id === tab)?.label}
            </h1>
            <p className="text-xs truncate" style={{ color: "rgba(245,240,232,0.4)" }}>
              {category === "all" ? "全部分類" : CATEGORIES[category as WordCategory]?.label}
              {" · "}{filteredWords.length} 個單詞
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {tab === "flashcard" && (
              <button
                onClick={handleShuffle}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all hover:scale-105 active:scale-95"
                style={{ background: "rgba(201,168,76,0.12)", border: "1px solid rgba(201,168,76,0.25)", color: "#C9A84C" }}
                title="重新洗牌"
              >
                <Shuffle size={13} /> 洗牌
              </button>
            )}
            {streak > 0 && (
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full"
                style={{ background: "rgba(224,112,96,0.1)", border: "1px solid rgba(224,112,96,0.2)" }}>
                <Flame size={13} style={{ color: "#E07060" }} />
                <span className="text-xs font-medium" style={{ color: "#E07060" }}>{streak}天</span>
              </div>
            )}
          </div>
        </header>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          {/* Hero — flashcard only, first card */}
          {tab === "flashcard" && cardIndex === 0 && (
            <div className="relative overflow-hidden" style={{ height: "200px" }}>
              <img
                src="https://d2xsxph8kpxj0f.cloudfront.net/310519663323892428/C7do4KZzXqnj5RNtPJ7G9H/danish-hero-bg-9uwW9SSUvrZpK3F8dubbdM.webp"
                alt="丹麥學習氛圍"
                className="w-full h-full object-cover"
                style={{ objectPosition: "center 35%" }}
              />
              <div
                className="absolute inset-0 flex flex-col justify-end p-6"
                style={{ background: "linear-gradient(to top, rgba(8,22,14,0.97) 0%, rgba(8,22,14,0.5) 55%, transparent 100%)" }}
              >
                <p className="text-2xl font-bold" style={{ fontFamily: "'Lora', serif", color: "#F5F0E8" }}>
                  Lær dansk i dag
                </p>
                <p className="text-sm mt-0.5" style={{ color: "rgba(245,240,232,0.55)" }}>
                  點擊字卡翻轉，開始今天的學習
                </p>
              </div>
            </div>
          )}

          <div className="p-5 sm:p-7">
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
        </div>
      </main>
    </div>
  );
}
