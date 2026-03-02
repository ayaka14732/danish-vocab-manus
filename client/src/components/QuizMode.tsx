// QuizMode.tsx — ADHD-friendly, monochrome
// Clean multiple choice. No decorative elements.

import { useState, useEffect, useCallback } from "react";
import { VocabWord, VOCABULARY, WordCategory } from "@/lib/vocabulary";
import { cn } from "@/lib/utils";

interface QuizModeProps {
  category: WordCategory | "all";
  onComplete: (correct: number, total: number) => void;
}

interface QuizQuestion {
  word: VocabWord;
  options: string[];
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

function buildQuestions(category: WordCategory | "all", count = 10): QuizQuestion[] {
  const pool = category === "all" ? VOCABULARY : VOCABULARY.filter((w) => w.category === category);
  const selected = shuffle(pool).slice(0, Math.min(count, pool.length));
  return selected.map((word) => {
    const correct = word.chinese || word.english.split(";")[0].trim();
    const wrong = shuffle(VOCABULARY.filter((w) => w.id !== word.id))
      .slice(0, 3)
      .map((w) => w.chinese || w.english.split(";")[0].trim());
    const options = shuffle([correct, ...wrong]);
    return { word, options, correctIndex: options.indexOf(correct) };
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
    }, 900);
  }

  if (questions.length === 0) return null;

  if (finished) {
    const pct = Math.round((correct / questions.length) * 100);
    return (
      <div className="flex flex-col items-center gap-6 py-16 text-center">
        <p
          className="font-bold"
          style={{ fontFamily: "'Lora', serif", fontSize: "5rem", lineHeight: 1, color: "#FFFFFF" }}
        >
          {pct}%
        </p>
        <p className="mt-2 text-sm" style={{ color: "rgba(255,255,255,0.35)", fontSize: "0.875rem" }}>
          {correct} / {questions.length} rigtige
        </p>
        <button
          onClick={init}
          className="px-6 py-2.5 rounded-lg text-sm font-medium mt-2"
          style={{
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.15)",
            color: "#FFFFFF",
          }}
        >
          Prøv igen
        </button>
      </div>
    );
  }

  const q = questions[current];

  return (
    <div className="flex flex-col gap-8 w-full py-4">

      {/* Counter */}
      <p className="text-right text-xs tabular-nums" style={{ color: "rgba(255,255,255,0.18)" }}>
          {current + 1} / {questions.length}
        </p>

      {/* Question — the word, large */}
      <div className="text-center py-6">
        <p
          className="font-bold leading-none"
          style={{
            fontFamily: "'Lora', serif",
            fontSize: "clamp(2.5rem, 8vw, 4.5rem)",
            color: "#FFFFFF",
            letterSpacing: "-0.02em",
          }}
        >
          {q.word.danish}
        </p>
        {q.word.pos && (
          <p className="mt-2 text-sm italic" style={{ color: "rgba(255,255,255,0.22)" }}>
            {q.word.pos}
          </p>
        )}
      </div>

      {/* External links — after answering */}
      {selected !== null && (
        <div className="flex justify-center gap-6">
          <a href={`https://en.wiktionary.org/wiki/${encodeURIComponent(q.word.danish)}`}
            target="_blank" rel="noopener noreferrer"
            className="text-xs hover:underline" style={{ color: "rgba(255,255,255,0.2)" }}>
            Wiktionary
          </a>
          <a href={`https://ordnet.dk/ddo/ordbog?query=${encodeURIComponent(q.word.danish)}`}
            target="_blank" rel="noopener noreferrer"
            className="text-xs hover:underline" style={{ color: "rgba(255,255,255,0.2)" }}>
            ordnet.dk
          </a>
        </div>
      )}

      {/* Options */}
      <div className="grid grid-cols-2 gap-2">
        {q.options.map((opt, idx) => {
          let bg = "rgba(255,255,255,0.04)";
          let border = "rgba(255,255,255,0.08)";
          let color = "rgba(255,255,255,0.7)";

          if (selected !== null) {
            if (idx === q.correctIndex) {
              bg = "rgba(255,255,255,0.1)";
              border = "rgba(255,255,255,0.5)";
              color = "#FFFFFF";
            } else if (idx === selected) {
              bg = "rgba(255,255,255,0.02)";
              border = "rgba(255,255,255,0.06)";
              color = "rgba(255,255,255,0.25)";
            }
          }

          return (
            <button
              key={idx}
              onClick={() => handleSelect(idx)}
              disabled={selected !== null}
              className={cn(
                "py-4 px-4 rounded-xl text-sm font-medium transition-colors text-left",
                selected === null && "hover:bg-white/8"
              )}
              style={{ background: bg, border: `1px solid ${border}`, color }}
            >
              <span className="text-xs mr-2" style={{ opacity: 0.3 }}>{["A","B","C","D"][idx]}.</span>
              {opt}
            </button>
          );
        })}
      </div>
    </div>
  );
}
