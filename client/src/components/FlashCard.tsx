// FlashCard.tsx
// Design: Academic Elegance — parchment card with 3D flip animation
// Gold border, dark ink text, subtle paper texture background

import { useState, useEffect } from "react";
import { VocabWord } from "@/lib/vocabulary";
import { Volume2, RotateCcw } from "lucide-react";
import { CATEGORIES } from "@/lib/vocabulary";
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
  const [noTransition, setNoTransition] = useState(false);

  // Reset flip state whenever the word changes
  // Disable transition first so the card snaps to front instantly (no animation from back to front)
  useEffect(() => {
    setNoTransition(true);
    setFlipped(false);
    setAnimClass("");
    // Re-enable transition after the DOM has painted the reset state
    const id = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        setNoTransition(false);
      });
    });
    return () => cancelAnimationFrame(id);
  }, [word.id]);

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
        <div
          className={cn("card-flip", flipped && "flipped")}
          style={noTransition ? { transition: "none" } : undefined}
        >
          {/* Front — Danish word */}
          <div className="card-face parchment-card rounded-2xl gold-border flex flex-col items-center justify-center p-8 cursor-pointer select-none shadow-2xl">
            <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
              <span
                className="text-xs font-medium px-2 py-0.5 rounded-full"
                style={{ background: "rgba(201,168,76,0.2)", color: "#C9A84C" }}
              >
                {CATEGORIES[word.category]?.label ?? word.category}
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
            {word.pos && (
              <p className="text-sm text-center" style={{ color: "#6B5A3E", fontStyle: "italic" }}>
                {word.pos}
              </p>
            )}

            <div className="absolute bottom-4 left-0 right-0 text-center">
              <span className="text-xs" style={{ color: "#9B8B6E" }}>點擊翻轉查看答案</span>
            </div>
          </div>

          {/* Back — English translation */}
          <div className="card-face card-face-back parchment-card rounded-2xl gold-border flex flex-col items-center justify-center p-8 cursor-pointer select-none shadow-2xl">
            <div className="absolute top-4 right-4">
              <RotateCcw size={14} style={{ color: "#9B8B6E" }} />
            </div>

            <p className="text-3xl font-bold mb-3 text-center leading-snug" style={{ fontFamily: "'Lora', serif", color: "#1A1A0E" }}>
              {word.english}
            </p>
            {word.pos && (
              <span
                className="text-xs px-2 py-0.5 rounded-full"
                style={{ background: "rgba(201,168,76,0.2)", color: "#8B6A2E" }}
              >
                {word.pos}
              </span>
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
          點擊卡片翻轉，查看英文翻譯
        </p>
      )}
    </div>
  );
}
