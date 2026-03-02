// FlashCard.tsx — ADHD-friendly
// - Correct: green flash only
// - Wrong: red flash only
// - Fixed layout: word position never shifts when answer appears

import { useState, useEffect, useRef } from "react";
import { VocabWord } from "@/lib/vocabulary";
import { cn } from "@/lib/utils";

interface FlashCardProps {
  word: VocabWord;
  onKnow: () => void;
  onDontKnow: () => void;
  cardIndex: number;
  totalCards: number;
}

const STREAK_MESSAGES: Record<number, string> = {
  3:  "Godt!",
  5:  "Fortsæt!",
  10: "Fantastisk!",
  15: "Uovervindelig!",
  20: "Perfekt!",
  30: "Legende!",
};

export default function FlashCard({
  word,
  onKnow,
  onDontKnow,
  cardIndex,
  totalCards,
}: FlashCardProps) {
  const [revealed, setRevealed] = useState(false);
  const [streak, setStreak] = useState(0);
  // flash: null | "correct" | "wrong" — only one at a time
  const [flash, setFlash] = useState<"correct" | "wrong" | null>(null);
  const [streakMsg, setStreakMsg] = useState<string | null>(null);
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const msgTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Reset card when word changes
  useEffect(() => {
    setRevealed(false);
  }, [word.id]);

  // Keyboard shortcuts
  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "A") return;
      if (e.code === "Space") { e.preventDefault(); setRevealed(true); }
      else if (e.code === "ArrowRight" && revealed) { e.preventDefault(); handleKnow(); }
      else if (e.code === "ArrowLeft"  && revealed) { e.preventDefault(); handleDontKnow(); }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [revealed, streak]);

  function triggerFlash(type: "correct" | "wrong") {
    // Clear any existing flash first so they never overlap
    setFlash(null);
    if (flashTimer.current) clearTimeout(flashTimer.current);
    // Small delay to allow state reset before new flash
    requestAnimationFrame(() => {
      setFlash(type);
      flashTimer.current = setTimeout(() => setFlash(null), 350);
    });
  }

  function handleKnow() {
    const newStreak = streak + 1;
    setStreak(newStreak);
    triggerFlash("correct");
    const msg = STREAK_MESSAGES[newStreak];
    if (msg) {
      setStreakMsg(msg);
      if (msgTimer.current) clearTimeout(msgTimer.current);
      msgTimer.current = setTimeout(() => setStreakMsg(null), 1200);
    }
    onKnow();
  }

  function handleDontKnow() {
    setStreak(0);
    triggerFlash("wrong");
    onDontKnow();
  }

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
    <div className="flex flex-col items-center w-full">

      {/* ── Streak + counter row ── */}
      <div className="flex items-center justify-between w-full mb-8">
        <div className="flex items-center gap-2 h-7">
          {streak >= 3 && (
            <div
              className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold"
              style={{
                background: "rgba(255,255,255,0.08)",
                color: "rgba(255,255,255,0.7)",
                border: "1px solid rgba(255,255,255,0.12)",
              }}
            >
              <span style={{ fontSize: "0.7rem" }}>🔥</span>
              {streak}
            </div>
          )}
          {streakMsg && (
            <span className="text-sm font-semibold animate-bounce" style={{ color: "rgba(255,255,255,0.9)" }}>
              {streakMsg}
            </span>
          )}
        </div>
        <p className="text-xs tabular-nums" style={{ color: "rgba(255,255,255,0.18)" }}>
          {cardIndex + 1} / {totalCards}
        </p>
      </div>

      {/* ── Flash overlay ── */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          opacity: flash ? 0.07 : 0,
          background: flash === "correct" ? "#44FF88" : "#FF4444",
          transition: flash ? "opacity 0.05s ease-in" : "opacity 0.3s ease-out",
          zIndex: 50,
        }}
      />

      {/* ── Fixed-height layout: word stays put regardless of answer ── */}
      <div
        className="flex flex-col items-center w-full"
        style={{ minHeight: "320px" }}
      >
        {/* The word */}
        <button
          onClick={() => { speakWord(); setRevealed(true); }}
          className="text-center hover:opacity-75 active:opacity-50 transition-opacity"
          style={{ background: "none", border: "none", padding: 0 }}
          title="Klik for at lytte"
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
            <p className="mt-2 text-sm" style={{ color: "rgba(255,255,255,0.22)", fontStyle: "italic" }}>
              {word.pos}
            </p>
          )}
        </button>

        {/* Answer area — fixed height so word never shifts */}
        <div
          className="flex flex-col items-center gap-2 mt-8 w-full"
          style={{ minHeight: "130px" }}
        >
          {revealed ? (
            <>
              <p
                className="text-4xl font-bold text-center"
                style={{ fontFamily: "'Noto Sans TC', sans-serif", color: "#FFFFFF" }}
              >
                {word.chinese || shortEnglish}
              </p>
              {word.chinese && (
                <p className="text-sm italic text-center" style={{ color: "rgba(255,255,255,0.3)" }}>
                  {shortEnglish}
                </p>
              )}
              <div className="flex items-center gap-5 mt-1">
                <a
                  href={`https://en.wiktionary.org/wiki/${encodeURIComponent(word.danish)}`}
                  target="_blank" rel="noopener noreferrer"
                  className="text-xs hover:underline"
                  style={{ color: "rgba(255,255,255,0.18)" }}
                >Wiktionary</a>
                <a
                  href={`https://ordnet.dk/ddo/ordbog?query=${encodeURIComponent(word.danish)}`}
                  target="_blank" rel="noopener noreferrer"
                  className="text-xs hover:underline"
                  style={{ color: "rgba(255,255,255,0.18)" }}
                >ordnet.dk</a>
              </div>
            </>
          ) : (
            <p className="text-sm select-none" style={{ color: "rgba(255,255,255,0.18)" }}>
              Mellemrum
            </p>
          )}
        </div>
      </div>

      {/* ── Judge buttons ── */}
      <div
        className={cn(
          "flex gap-3 w-full max-w-xs mt-4 transition-opacity duration-150",
          revealed ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      >
        <button
          onClick={handleDontKnow}
          className="flex-1 py-3 rounded-lg text-sm font-medium"
          style={{
            background: "rgba(255,255,255,0.03)",
            border: "1px solid rgba(255,255,255,0.08)",
            color: "rgba(255,255,255,0.35)",
          }}
        >
          ← Kender ikke
        </button>
        <button
          onClick={handleKnow}
          className="flex-1 py-3 rounded-lg text-sm font-medium"
          style={{
            background: "rgba(255,255,255,0.08)",
            border: "1px solid rgba(255,255,255,0.18)",
            color: "rgba(255,255,255,0.85)",
          }}
        >
          Kender →
        </button>
      </div>
    </div>
  );
}
