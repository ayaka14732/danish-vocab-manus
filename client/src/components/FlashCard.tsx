// FlashCard.tsx
// Design: Academic Elegance — parchment card with 3D flip animation
// Gold border, dark ink text, subtle paper texture background

import { useState } from "react";
import { VocabWord } from "@/lib/vocabulary";
import { Volume2, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface FlashCardProps {
  word: VocabWord;
  onKnow: () => void;
  onDontKnow: () => void;
  cardIndex: number;
  totalCards: number;
}

export default function FlashCard({
  word,
  onKnow,
  onDontKnow,
  cardIndex,
  totalCards,
}: FlashCardProps) {
  const [flipped, setFlipped] = useState(false);
  const [animClass, setAnimClass] = useState("");

  function handleFlip() {
    setFlipped((f) => !f);
  }

  function handleKnow() {
    setAnimClass("flash-correct");
    setTimeout(() => {
      setAnimClass("");
      setFlipped(false);
      onKnow();
    }, 600);
  }

  function handleDontKnow() {
    setAnimClass("flash-incorrect");
    setTimeout(() => {
      setAnimClass("");
      setFlipped(false);
      onDontKnow();
    }, 600);
  }

  function speakWord() {
    if ("speechSynthesis" in window) {
      const utt = new SpeechSynthesisUtterance(word.danish);
      utt.lang = "da-DK";
      utt.rate = 0.85;
      window.speechSynthesis.speak(utt);
    }
  }

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-lg mx-auto">
      {/* Progress indicator */}
      <div className="w-full flex items-center gap-3">
        <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${((cardIndex + 1) / totalCards) * 100}%`,
              background: "linear-gradient(90deg, #C9A84C, #E0C06A)",
            }}
          />
        </div>
        <span className="text-xs font-medium text-white/50 shrink-0 tabular-nums">
          {cardIndex + 1} / {totalCards}
        </span>
      </div>

      {/* Card */}
      <div
        className={cn("card-scene w-full", animClass)}
        style={{ height: "320px" }}
        onClick={handleFlip}
      >
        <div className={cn("card-flip", flipped && "flipped")}>
          {/* Front — Danish word */}
          <div className="card-face parchment-card rounded-2xl gold-border flex flex-col items-center justify-center p-8 cursor-pointer select-none shadow-2xl">
            <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
              <span
                className="text-xs font-medium px-2 py-0.5 rounded-full"
                style={{ background: "rgba(201,168,76,0.2)", color: "#C9A84C" }}
              >
                {word.category === "basics" ? "基礎" :
                 word.category === "numbers" ? "數字" :
                 word.category === "colors" ? "顏色" :
                 word.category === "food" ? "食物" :
                 word.category === "family" ? "家庭" :
                 word.category === "nature" ? "自然" :
                 word.category === "travel" ? "旅行" :
                 word.category === "time" ? "時間" :
                 word.category === "phrases" ? "常用語" : word.category}
              </span>
              <button
                onClick={(e) => { e.stopPropagation(); speakWord(); }}
                className="p-1.5 rounded-full hover:bg-black/10 transition-colors"
                title="朗讀發音"
              >
                <Volume2 size={16} style={{ color: "#8B7355" }} />
              </button>
            </div>

            <p className="text-5xl font-bold mb-3 text-center" style={{ fontFamily: "'Lora', serif", color: "#1A1A0E" }}>
              {word.danish}
            </p>
            <p className="text-sm text-center" style={{ color: "#6B5A3E", fontStyle: "italic" }}>
              /{word.pronunciation}/
            </p>

            <div className="absolute bottom-4 left-0 right-0 text-center">
              <span className="text-xs" style={{ color: "#9B8B6E" }}>點擊翻轉查看答案</span>
            </div>
          </div>

          {/* Back — Chinese + English */}
          <div className="card-face card-face-back parchment-card rounded-2xl gold-border flex flex-col items-center justify-center p-8 cursor-pointer select-none shadow-2xl">
            <div className="absolute top-4 right-4">
              <RotateCcw size={14} style={{ color: "#9B8B6E" }} />
            </div>

            <p className="text-4xl font-bold mb-2 text-center" style={{ fontFamily: "'Lora', serif", color: "#1A1A0E" }}>
              {word.chinese}
            </p>
            <p className="text-lg mb-4 text-center" style={{ color: "#5A4A2E" }}>
              {word.english}
            </p>

            {word.example && (
              <div
                className="w-full mt-2 p-3 rounded-lg text-center"
                style={{ background: "rgba(139,115,85,0.12)", borderLeft: "3px solid #C9A84C" }}
              >
                <p className="text-sm italic mb-1" style={{ color: "#3D3020" }}>
                  {word.example}
                </p>
                {word.exampleChinese && (
                  <p className="text-xs" style={{ color: "#6B5A3E" }}>
                    {word.exampleChinese}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Action buttons — only show when flipped */}
      <div
        className={cn(
          "flex gap-4 w-full transition-all duration-300",
          flipped ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4 pointer-events-none"
        )}
      >
        <button
          onClick={handleDontKnow}
          className="flex-1 py-3 rounded-xl font-medium text-sm transition-all duration-200 hover:scale-105 active:scale-95"
          style={{
            background: "rgba(180,60,40,0.15)",
            border: "1px solid rgba(180,60,40,0.35)",
            color: "#E07060",
          }}
        >
          不認識
        </button>
        <button
          onClick={handleKnow}
          className="flex-1 py-3 rounded-xl font-medium text-sm transition-all duration-200 hover:scale-105 active:scale-95"
          style={{
            background: "rgba(80,160,100,0.15)",
            border: "1px solid rgba(80,160,100,0.35)",
            color: "#70C090",
          }}
        >
          認識了！
        </button>
      </div>

      {/* Hint when not flipped */}
      {!flipped && (
        <p className="text-xs text-center" style={{ color: "rgba(255,255,255,0.3)" }}>
          點擊卡片翻轉，查看中文與例句
        </p>
      )}
    </div>
  );
}
