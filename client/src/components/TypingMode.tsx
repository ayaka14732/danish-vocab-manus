// TypingMode.tsx
// Design: Academic Elegance — typing practice with parchment input
// Shows Danish word, user types Chinese meaning

import { useState, useRef, useEffect } from "react";
import { VocabWord, VOCABULARY, WordCategory } from "@/lib/vocabulary";
import { CheckCircle2, XCircle, RotateCcw, Trophy, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface TypingModeProps {
  category: WordCategory | "all";
  onComplete: (correct: number, total: number) => void;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Check if user answer matches Chinese or English translation
function checkAnswer(answer: string, word: VocabWord): boolean {
  const ans = answer.trim().toLowerCase();
  if (!ans) return false;

  // Check Chinese
  if (word.chinese) {
    const zhParts = word.chinese.split(/[；;，,、]/).map((s) => s.trim());
    if (zhParts.some((p) => p === answer.trim())) return true;
  }

  // Also accept English as fallback
  const enParts = word.english.split(/[;,]/).map((s) => s.trim().toLowerCase());
  if (enParts.some((p) => p === ans || p.startsWith(ans) || ans.startsWith(p))) return true;

  return false;
}

export default function TypingMode({ category, onComplete }: TypingModeProps) {
  const [words, setWords] = useState<VocabWord[]>([]);
  const [current, setCurrent] = useState(0);
  const [input, setInput] = useState("");
  const [status, setStatus] = useState<"idle" | "correct" | "incorrect">("idle");
  const [correct, setCorrect] = useState(0);
  const [finished, setFinished] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  function init() {
    const pool = category === "all" ? VOCABULARY : VOCABULARY.filter((w) => w.category === category);
    setWords(shuffle(pool).slice(0, 10));
    setCurrent(0);
    setInput("");
    setStatus("idle");
    setCorrect(0);
    setFinished(false);
  }

  useEffect(() => { init(); }, [category]);
  useEffect(() => { if (!finished) inputRef.current?.focus(); }, [current, finished]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (status !== "idle" || !words[current]) return;

    const word = words[current];
    const isCorrect = checkAnswer(input, word);

    setStatus(isCorrect ? "correct" : "incorrect");
    if (isCorrect) setCorrect((c) => c + 1);

    setTimeout(() => {
      if (current + 1 >= words.length) {
        setFinished(true);
        onComplete(correct + (isCorrect ? 1 : 0), words.length);
      } else {
        setCurrent((c) => c + 1);
        setInput("");
        setStatus("idle");
      }
    }, 1400);
  }

  function speakWord(danish: string) {
    if ("speechSynthesis" in window) {
      const utt = new SpeechSynthesisUtterance(danish);
      utt.lang = "da-DK";
      utt.rate = 0.85;
      window.speechSynthesis.speak(utt);
    }
  }

  if (words.length === 0) return null;

  if (finished) {
    const pct = Math.round((correct / words.length) * 100);
    return (
      <div className="flex flex-col items-center gap-6 py-8 max-w-md mx-auto text-center">
        <div className="w-20 h-20 rounded-full flex items-center justify-center" style={{ background: "rgba(201,168,76,0.15)", border: "2px solid #C9A84C" }}>
          <Trophy size={36} style={{ color: "#C9A84C" }} />
        </div>
        <div>
          <h2 className="text-3xl font-bold mb-1" style={{ fontFamily: "'Lora', serif", color: "#F5F0E8" }}>打字練習完成！</h2>
          <p className="text-5xl font-bold mt-4" style={{ fontFamily: "'Lora', serif", color: "#C9A84C" }}>{pct}%</p>
          <p className="mt-2" style={{ color: "rgba(245,240,232,0.6)" }}>{correct} / {words.length} 題正確</p>
        </div>
        <button onClick={init} className="flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all hover:scale-105" style={{ background: "#C9A84C", color: "#1A1A0E" }}>
          <RotateCcw size={16} /> 再練一次
        </button>
      </div>
    );
  }

  const word = words[current];

  return (
    <div className="flex flex-col gap-6 max-w-lg mx-auto w-full">
      <div className="flex items-center gap-3">
        <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${(current / words.length) * 100}%`, background: "linear-gradient(90deg, #C9A84C, #E0C06A)" }} />
        </div>
        <span className="text-xs tabular-nums" style={{ color: "rgba(255,255,255,0.5)" }}>{current + 1}/{words.length}</span>
      </div>

      <div className="parchment-card rounded-2xl gold-border p-8 text-center shadow-2xl">
        <p className="text-xs mb-3" style={{ color: "#9B8B6E" }}>請輸入以下丹麥語的中文意思</p>
        <div className="flex items-center justify-center gap-3 mb-2">
          <p className="text-5xl font-bold" style={{ fontFamily: "'Lora', serif", color: "#1A1A0E" }}>{word.danish}</p>
          <button onClick={() => speakWord(word.danish)} className="p-1.5 rounded-full hover:bg-black/10 transition-colors">
            <Volume2 size={18} style={{ color: "#8B7355" }} />
          </button>
        </div>
        {word.pos && (
          <p className="text-sm italic" style={{ color: "#6B5A3E" }}>{word.pos}</p>
        )}
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-3">
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={status !== "idle"}
          placeholder="輸入中文意思..."
          className={cn(
            "w-full px-5 py-4 rounded-xl text-base outline-none transition-all duration-200",
            status === "correct" && "flash-correct",
            status === "incorrect" && "flash-incorrect"
          )}
          style={{
            background: status === "correct" ? "rgba(80,160,100,0.15)" : status === "incorrect" ? "rgba(180,60,40,0.15)" : "rgba(245,240,232,0.07)",
            border: status === "correct" ? "1px solid rgba(80,160,100,0.6)" : status === "incorrect" ? "1px solid rgba(180,60,40,0.6)" : "1px solid rgba(245,240,232,0.2)",
            color: "#F5F0E8",
          }}
        />
        {status === "incorrect" && (
          <p className="text-sm text-center" style={{ color: "#E08070" }}>
            正確答案：<strong style={{ color: "#F5F0E8" }}>{word.chinese}</strong>
            {word.chinese && <span style={{ color: "rgba(245,240,232,0.5)" }}> ({word.english.split(";")[0].trim()})</span>}
          </p>
        )}
        {status === "idle" && (
          <button type="submit" className="w-full py-3 rounded-xl font-medium text-sm transition-all hover:scale-105 active:scale-95" style={{ background: "#C9A84C", color: "#1A1A0E" }}>
            確認
          </button>
        )}
        {status === "correct" && (
          <div className="flex items-center justify-center gap-2" style={{ color: "#70C090" }}>
            <CheckCircle2 size={18} /> 正確！
          </div>
        )}
        {status === "incorrect" && (
          <div className="flex items-center justify-center gap-2 mt-1" style={{ color: "#E07060" }}>
            <XCircle size={18} /> 繼續加油！
          </div>
        )}
      </form>
    </div>
  );
}
