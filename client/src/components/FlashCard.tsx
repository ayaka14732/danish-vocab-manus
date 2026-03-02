// FlashCard.tsx
// Design: Academic Elegance — parchment card, no flip animation
// Interaction: Space/Click to reveal answer, ← = don't know, → = know
// Front: Danish word | Revealed: Chinese (primary) + English (secondary)

import { useState, useEffect } from "react";
import { VocabWord, CATEGORIES } from "@/lib/vocabulary";
import { Volume2, ExternalLink } from "lucide-react";
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
  const [revealed, setRevealed] = useState(false);

  // Reset whenever word changes
  useEffect(() => {
    setRevealed(false);
  }, [word.id]);

  // Keyboard shortcuts
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      // Ignore if focus is on an input/button/link
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "BUTTON" || tag === "A") return;

      if (e.code === "Space") {
        e.preventDefault();
        setRevealed(true);
      } else if (e.code === "ArrowRight" && revealed) {
        e.preventDefault();
        onKnow();
      } else if (e.code === "ArrowLeft" && revealed) {
        e.preventDefault();
        onDontKnow();
      }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [revealed, onKnow, onDontKnow]);

  function speakWord() {
    if ("speechSynthesis" in window) {
      const utt = new SpeechSynthesisUtterance(word.danish);
      utt.lang = "da-DK";
      utt.rate = 0.85;
      window.speechSynthesis.speak(utt);
    }
  }

  const shortEnglish = word.english.split(";")[0].split(",")[0].trim();

  return (
    <div className="flex flex-col items-center gap-6 w-full max-w-lg mx-auto">
      {/* Progress bar */}
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
        className="parchment-card rounded-2xl gold-border w-full shadow-2xl cursor-pointer select-none"
        style={{ minHeight: "300px" }}
        onClick={() => !revealed && setRevealed(true)}
      >
        {/* Header row */}
        <div className="flex justify-between items-center px-6 pt-5 pb-3">
          <span
            className="text-xs font-medium px-2 py-0.5 rounded-full"
            style={{ background: "rgba(201,168,76,0.2)", color: "#C9A84C" }}
          >
            {CATEGORIES[word.category]?.label ?? word.category}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => { e.stopPropagation(); speakWord(); }}
              className="p-1.5 rounded-full hover:bg-black/10 transition-colors"
              title="朗讀發音"
            >
              <Volume2 size={15} style={{ color: "#8B7355" }} />
            </button>
          </div>
        </div>

        {/* Danish word — always visible */}
        <div className="flex flex-col items-center justify-center px-8 pb-4">
          <p
            className="text-5xl font-bold text-center mb-1"
            style={{ fontFamily: "'Lora', serif", color: "#1A1A0E" }}
          >
            {word.danish}
          </p>
          {word.pos && (
            <p className="text-sm italic" style={{ color: "#6B5A3E" }}>
              {word.pos}
            </p>
          )}
        </div>

        {/* Divider */}
        <div style={{ height: "1px", background: "rgba(139,115,85,0.25)", margin: "0 2rem" }} />

        {/* Answer area */}
        <div
          className="flex flex-col items-center justify-center px-8 py-6"
          style={{ minHeight: "120px" }}
        >
          {revealed ? (
            <div className="flex flex-col items-center gap-2 w-full">
              {/* Chinese — primary */}
              <p
                className="text-3xl font-bold text-center"
                style={{ fontFamily: "'Noto Sans TC', sans-serif", color: "#1A1A0E" }}
              >
                {word.chinese || shortEnglish}
              </p>
              {/* English — secondary */}
              <p className="text-sm text-center italic" style={{ color: "#5A4A2E" }}>
                {shortEnglish}
              </p>
              {/* External links */}
              <div className="flex items-center gap-4 mt-2">
                <a
                  href={`https://en.wiktionary.org/wiki/${encodeURIComponent(word.danish)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-1 text-xs hover:underline"
                  style={{ color: "rgba(139,115,85,0.7)" }}
                >
                  <ExternalLink size={11} />
                  Wiktionary
                </a>
                <a
                  href={`https://ordnet.dk/ddo/ordbog?query=${encodeURIComponent(word.danish)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="inline-flex items-center gap-1 text-xs hover:underline"
                  style={{ color: "rgba(139,115,85,0.7)" }}
                >
                  <ExternalLink size={11} />
                  ordnet.dk
                </a>
              </div>
            </div>
          ) : (
            <p className="text-sm" style={{ color: "#9B8B6E" }}>
              按 <kbd className="px-1.5 py-0.5 rounded text-xs font-mono" style={{ background: "rgba(139,115,85,0.2)", color: "#6B5A3E" }}>Space</kbd> 或點擊顯示答案
            </p>
          )}
        </div>
      </div>

      {/* Action buttons — only show when revealed */}
      <div
        className={cn(
          "flex gap-4 w-full transition-all duration-200",
          revealed ? "opacity-100 translate-y-0" : "opacity-0 translate-y-3 pointer-events-none"
        )}
      >
        <button
          onClick={onDontKnow}
          className="flex-1 py-3 rounded-xl font-medium text-sm transition-all duration-150 hover:scale-105 active:scale-95"
          style={{
            background: "rgba(180,60,40,0.12)",
            border: "1px solid rgba(180,60,40,0.3)",
            color: "#E07060",
          }}
        >
          ← 不認識
        </button>
        <button
          onClick={onKnow}
          className="flex-1 py-3 rounded-xl font-medium text-sm transition-all duration-150 hover:scale-105 active:scale-95"
          style={{
            background: "rgba(80,160,100,0.12)",
            border: "1px solid rgba(80,160,100,0.3)",
            color: "#70C090",
          }}
        >
          認識了 →
        </button>
      </div>

      {/* Keyboard hint */}
      {revealed && (
        <p className="text-xs text-center" style={{ color: "rgba(255,255,255,0.25)" }}>
          <kbd className="font-mono">←</kbd> 不認識 &nbsp;·&nbsp; <kbd className="font-mono">→</kbd> 認識了
        </p>
      )}
    </div>
  );
}
