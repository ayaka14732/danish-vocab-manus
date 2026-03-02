// FlashCard.tsx — ADHD-friendly
// One word at a time. No decorative chrome.
// Space/click → reveal. ← → to judge.

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
    <div className="flex flex-col gap-5 w-full">

      {/* Counter — minimal, top right */}
      <p className="text-right text-xs tabular-nums" style={{ color: "rgba(232,228,220,0.25)" }}>
        {cardIndex + 1} / {totalCards}
      </p>

      {/* Card */}
      <div
        className="parchment-card rounded-2xl gold-border w-full cursor-pointer select-none"
        style={{ minHeight: "280px" }}
        onClick={() => !revealed && setRevealed(true)}
      >
        {/* Danish word */}
        <div className="flex flex-col items-center justify-center px-8 pt-10 pb-4">
          <button
            onClick={(e) => { e.stopPropagation(); speakWord(); }}
            className="text-5xl font-bold text-center mb-1 hover:opacity-80 transition-opacity"
            style={{ fontFamily: "'Lora', serif", color: "#1A1A0E", background: "none", border: "none", cursor: "pointer" }}
            title="點擊朗讀"
          >
            {word.danish}
          </button>
          {word.pos && (
            <p className="text-sm italic" style={{ color: "#8B7355" }}>
              {word.pos}
            </p>
          )}
        </div>

        {/* Divider */}
        <div style={{ height: "1px", background: "rgba(139,115,85,0.2)", margin: "0 2.5rem" }} />

        {/* Answer */}
        <div className="flex flex-col items-center justify-center px-8 py-8" style={{ minHeight: "110px" }}>
          {revealed ? (
            <div className="flex flex-col items-center gap-1.5 w-full">
              <p
                className="text-3xl font-bold text-center"
                style={{ fontFamily: "'Noto Sans TC', sans-serif", color: "#1A1A0E" }}
              >
                {word.chinese || shortEnglish}
              </p>
              <p className="text-sm italic text-center" style={{ color: "#7A6A50" }}>
                {shortEnglish}
              </p>
              <div className="flex items-center gap-5 mt-3">
                <a
                  href={`https://en.wiktionary.org/wiki/${encodeURIComponent(word.danish)}`}
                  target="_blank" rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-xs hover:underline"
                  style={{ color: "rgba(139,115,85,0.55)" }}
                >Wiktionary</a>
                <a
                  href={`https://ordnet.dk/ddo/ordbog?query=${encodeURIComponent(word.danish)}`}
                  target="_blank" rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="text-xs hover:underline"
                  style={{ color: "rgba(139,115,85,0.55)" }}
                >ordnet.dk</a>
              </div>
            </div>
          ) : (
            <p className="text-sm" style={{ color: "rgba(139,115,85,0.6)" }}>
              按 <kbd className="px-1.5 py-0.5 rounded font-mono text-xs" style={{ background: "rgba(139,115,85,0.15)" }}>Space</kbd> 顯示答案
            </p>
          )}
        </div>
      </div>

      {/* Judge buttons */}
      <div
        className={cn(
          "flex gap-3 transition-opacity duration-150",
          revealed ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      >
        <button
          onClick={onDontKnow}
          className="flex-1 py-3 rounded-xl text-sm font-medium transition-colors"
          style={{ background: "rgba(200,70,50,0.1)", border: "1px solid rgba(200,70,50,0.25)", color: "#D06858" }}
        >
          不認識
        </button>
        <button
          onClick={onKnow}
          className="flex-1 py-3 rounded-xl text-sm font-medium transition-colors"
          style={{ background: "rgba(70,150,90,0.1)", border: "1px solid rgba(70,150,90,0.25)", color: "#60A878" }}
        >
          認識了
        </button>
      </div>

      {/* Keyboard hint — very quiet */}
      {revealed && (
        <p className="text-center text-xs" style={{ color: "rgba(232,228,220,0.18)" }}>
          ← 不認識 · → 認識了
        </p>
      )}
    </div>
  );
}
