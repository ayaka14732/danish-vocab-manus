// QuizMode.tsx
// Design: Academic Elegance — multiple choice quiz with parchment options
// Correct = green glow, Incorrect = red glow, gold progress bar

import { useState, useEffect, useCallback } from "react";
import { VocabWord, VOCABULARY, WordCategory } from "@/lib/vocabulary";
import { cn } from "@/lib/utils";
import { CheckCircle2, XCircle, Trophy, RotateCcw } from "lucide-react";

interface QuizModeProps {
  category: WordCategory | "all";
  onComplete: (correct: number, total: number) => void;
}

interface QuizQuestion {
  word: VocabWord;
  options: string[]; // English options
  correctIndex: number;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Shorten long English translations for display
function shortEnglish(en: string): string {
  // Take only the first translation if multiple are separated by ;
  return en.split(";")[0].split(",")[0].trim();
}

function buildQuestions(category: WordCategory | "all", count = 10): QuizQuestion[] {
  const pool =
    category === "all"
      ? VOCABULARY
      : VOCABULARY.filter((w) => w.category === category);

  const selected = shuffle(pool).slice(0, Math.min(count, pool.length));

  return selected.map((word) => {
    const correct = shortEnglish(word.english);
    // Build 4 options: 1 correct + 3 random wrong
    const others = VOCABULARY.filter((w) => w.id !== word.id);
    const wrong = shuffle(others)
      .slice(0, 3)
      .map((w) => shortEnglish(w.english));
    const options = shuffle([correct, ...wrong]);
    const correctIndex = options.indexOf(correct);
    return { word, options, correctIndex };
  });
}

export default function QuizMode({ category, onComplete }: QuizModeProps) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [current, setCurrent] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [correct, setCorrect] = useState(0);
  const [finished, setFinished] = useState(false);

  const init = useCallback(() => {
    setQuestions(buildQuestions(category, 10));
    setCurrent(0);
    setSelected(null);
    setCorrect(0);
    setFinished(false);
  }, [category]);

  useEffect(() => { init(); }, [init]);

  function handleSelect(idx: number) {
    if (selected !== null) return;
    setSelected(idx);
    const isCorrect = idx === questions[current].correctIndex;
    if (isCorrect) setCorrect((c) => c + 1);

    setTimeout(() => {
      if (current + 1 >= questions.length) {
        setFinished(true);
        onComplete(correct + (isCorrect ? 1 : 0), questions.length);
      } else {
        setCurrent((c) => c + 1);
        setSelected(null);
      }
    }, 1200);
  }

  if (questions.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p style={{ color: "rgba(255,255,255,0.5)" }}>載入中...</p>
      </div>
    );
  }

  if (finished) {
    const pct = Math.round((correct / questions.length) * 100);
    return (
      <div className="flex flex-col items-center gap-6 py-8 max-w-md mx-auto text-center">
        <div
          className="w-24 h-24 rounded-full flex items-center justify-center"
          style={{ background: "rgba(201,168,76,0.15)", border: "2px solid #C9A84C" }}
        >
          <Trophy size={40} style={{ color: "#C9A84C" }} />
        </div>
        <div>
          <h2 className="text-3xl font-bold mb-1" style={{ fontFamily: "'Lora', serif", color: "#F5F0E8" }}>
            測驗完成！
          </h2>
          <p style={{ color: "rgba(245,240,232,0.6)" }}>你的成績</p>
        </div>
        <div
          className="w-full p-6 rounded-2xl"
          style={{ background: "rgba(245,240,232,0.06)", border: "1px solid rgba(201,168,76,0.3)" }}
        >
          <p className="text-6xl font-bold mb-2" style={{ fontFamily: "'Lora', serif", color: "#C9A84C" }}>
            {pct}%
          </p>
          <p style={{ color: "rgba(245,240,232,0.7)" }}>
            {correct} / {questions.length} 題答對
          </p>
        </div>
        <p className="text-sm" style={{ color: "rgba(245,240,232,0.5)" }}>
          {pct >= 80 ? "🎉 優秀！繼續保持！" : pct >= 60 ? "👍 不錯，再接再厲！" : "💪 多練習幾次，你會進步的！"}
        </p>
        <button
          onClick={init}
          className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all hover:scale-105 active:scale-95"
          style={{ background: "#C9A84C", color: "#1A1A0E" }}
        >
          <RotateCcw size={16} />
          再測一次
        </button>
      </div>
    );
  }

  const q = questions[current];

  return (
    <div className="flex flex-col gap-6 max-w-lg mx-auto w-full">
      {/* Progress */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${(current / questions.length) * 100}%`,
              background: "linear-gradient(90deg, #C9A84C, #E0C06A)",
            }}
          />
        </div>
        <span className="text-xs font-medium tabular-nums" style={{ color: "rgba(255,255,255,0.5)" }}>
          {current + 1} / {questions.length}
        </span>
        <span className="text-xs font-medium" style={{ color: "#70C090" }}>
          ✓ {correct}
        </span>
      </div>

      {/* Question */}
      <div
        className="parchment-card rounded-2xl gold-border p-8 text-center shadow-2xl"
        style={{ minHeight: "160px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}
      >
        <p className="text-xs mb-3 font-medium" style={{ color: "#9B8B6E" }}>
          以下丹麥語的英文意思是？
        </p>
        <p className="text-5xl font-bold mb-2" style={{ fontFamily: "'Lora', serif", color: "#1A1A0E" }}>
          {q.word.danish}
        </p>
        {q.word.pos && (
          <p className="text-sm italic" style={{ color: "#6B5A3E" }}>
            {q.word.pos}
          </p>
        )}
      </div>

      {/* Options */}
      <div className="grid grid-cols-2 gap-3">
        {q.options.map((opt, idx) => {
          let style: React.CSSProperties = {
            background: "rgba(245,240,232,0.06)",
            border: "1px solid rgba(245,240,232,0.15)",
            color: "#F5F0E8",
          };
          if (selected !== null) {
            if (idx === q.correctIndex) {
              style = {
                background: "rgba(80,160,100,0.2)",
                border: "1px solid rgba(80,160,100,0.6)",
                color: "#90E0A0",
              };
            } else if (idx === selected && selected !== q.correctIndex) {
              style = {
                background: "rgba(180,60,40,0.2)",
                border: "1px solid rgba(180,60,40,0.6)",
                color: "#E08070",
              };
            }
          }

          return (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              disabled={selected !== null}
              className={cn(
                "py-4 px-4 rounded-xl text-sm font-medium transition-all duration-200",
                selected === null && "hover:scale-105 hover:bg-white/10 active:scale-95"
              )}
              style={style}
            >
              <span className="text-xs mr-2 opacity-60">
                {["A", "B", "C", "D"][idx]}.
              </span>
              {opt}
              {selected !== null && idx === q.correctIndex && (
                <CheckCircle2 size={14} className="inline ml-2" style={{ color: "#70C090" }} />
              )}
              {selected !== null && idx === selected && selected !== q.correctIndex && (
                <XCircle size={14} className="inline ml-2" style={{ color: "#E07060" }} />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
