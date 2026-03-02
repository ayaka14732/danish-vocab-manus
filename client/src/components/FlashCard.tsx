// FlashCard.tsx — ADHD-friendly, no card chrome
// One word, full focus. Space to reveal. ← → to judge.

import { useState, useEffect } from "react";
import { VocabWord } from "@/lib/vocabulary";
import { cn } from "@/lib/utils";

interface FlashCardProps {
  word: VocabWord;
  onKnow: () => void;
  onDontKnow: () => void;
  onShuffle?: () => void;
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

  useEffect(() => {
    setRevealed(false);
  }, [word.id]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "BUTTON" || tag === "A") return;
      if (e.code === "Space") { e.preventDefault(); setRevealed(true); }
      else if (e.code === "ArrowRight" && revealed) { e.preventDefault(); onKnow(); }
      else if (e.code === "ArrowLeft" && revealed) { e.preventDefault(); onDontKnow(); }
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
    <div className="flex flex-col items-center gap-10 w-full py-8">

      {/* Counter — very quiet */}
      <p className="text-xs tabular-nums self-end" style={{ color: "rgba(255,255,255,0.18)" }}>
        {cardIndex + 1} / {totalCards}
      </p>

      {/* ── The word — maximum visual weight ── */}
      <button
        onClick={() => { speakWord(); setRevealed(true); }}
        className="text-center transition-opacity hover:opacity-80"
        style={{ background: "none", border: "none" }}
        title="點擊朗讀"
      >
        <p
          className="font-bold leading-none tracking-tight"
          style={{
            fontFamily: "'Lora', serif",
            fontSize: "clamp(3rem, 10vw, 6rem)",
            color: "#FFFFFF",
            letterSpacing: "-0.02em",
          }}
        >
          {word.danish}
        </p>
        {word.pos && (
          <p className="mt-2 text-sm" style={{ color: "rgba(255,255,255,0.25)", fontStyle: "italic" }}>
            {word.pos}
          </p>
        )}
      </button>

      {/* ── Answer area ── */}
      <div className="flex flex-col items-center gap-3 min-h-[80px] justify-center">
        {revealed ? (
          <>
            {/* Chinese — large, high contrast */}
            <p
              className="text-4xl font-bold text-center"
              style={{ fontFamily: "'Noto Sans TC', sans-serif", color: "#FFFFFF" }}
            >
              {word.chinese || shortEnglish}
            </p>
            {/* English — muted secondary */}
            {word.chinese && (
              <p className="text-sm italic text-center" style={{ color: "rgba(255,255,255,0.35)" }}>
                {shortEnglish}
              </p>
            )}
            {/* Links — very quiet */}
            <div className="flex items-center gap-5 mt-1">
              <a
                href={`https://en.wiktionary.org/wiki/${encodeURIComponent(word.danish)}`}
                target="_blank" rel="noopener noreferrer"
                className="text-xs hover:underline"
                style={{ color: "rgba(255,255,255,0.2)" }}
              >Wiktionary</a>
              <a
                href={`https://ordnet.dk/ddo/ordbog?query=${encodeURIComponent(word.danish)}`}
                target="_blank" rel="noopener noreferrer"
                className="text-xs hover:underline"
                style={{ color: "rgba(255,255,255,0.2)" }}
              >ordnet.dk</a>
            </div>
          </>
        ) : (
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.2)" }}>
            Space
          </p>
        )}
      </div>

      {/* ── Judge buttons — only when revealed ── */}
      <div
        className={cn(
          "flex gap-3 w-full max-w-xs transition-opacity duration-150",
          revealed ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      >
        <button
          onClick={onDontKnow}
          className="flex-1 py-3 rounded-lg text-sm font-medium transition-colors"
          style={{
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.1)",
            color: "rgba(255,255,255,0.45)",
          }}
        >
          ← 不認識
        </button>
        <button
          onClick={onKnow}
          className="flex-1 py-3 rounded-lg text-sm font-medium transition-colors"
          style={{
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.18)",
            color: "rgba(255,255,255,0.85)",
          }}
        >
          認識了 →
        </button>
      </div>
    </div>
  );
}
