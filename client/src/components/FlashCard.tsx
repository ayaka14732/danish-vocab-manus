// FlashCard.tsx — ADHD-friendly
// Instant reward: streak counter, encouraging messages, subtle flash on correct

import { useState, useEffect, useRef } from "react";
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
  const [flash, setFlash] = useState<"correct" | "wrong" | null>(null);
  const [streakMsg, setStreakMsg] = useState<string | null>(null);
  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const msgTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setRevealed(false);
  }, [word.id]);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA" || tag === "BUTTON" || tag === "A") return;
      if (e.code === "Space") { e.preventDefault(); setRevealed(true); }
      else if (e.code === "ArrowRight" && revealed) { e.preventDefault(); handleKnow(); }
      else if (e.code === "ArrowLeft" && revealed) { e.preventDefault(); handleDontKnow(); }
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [revealed, streak]);

  function triggerFlash(type: "correct" | "wrong") {
    setFlash(type);
    if (flashTimer.current) clearTimeout(flashTimer.current);
    flashTimer.current = setTimeout(() => setFlash(null), 400);
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
    <div className="flex flex-col items-center gap-8 w-full">

      {/* ── Streak + counter row ── */}
      <div className="flex items-center justify-between w-full">
        {/* Streak badge */}
        <div className="flex items-center gap-2 h-7">
          {streak >= 3 && (
            <div
              className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold transition-all"
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
            <span
              className="text-sm font-semibold animate-bounce"
              style={{ color: "rgba(255,255,255,0.9)" }}
            >
              {streakMsg}
            </span>
          )}
        </div>

        {/* Counter */}
        <p className="text-xs tabular-nums" style={{ color: "rgba(255,255,255,0.18)" }}>
          {cardIndex + 1} / {totalCards}
        </p>
      </div>

      {/* ── Flash overlay ── */}
      <div
        className="fixed inset-0 pointer-events-none transition-opacity duration-300"
        style={{
          opacity: flash ? 0.06 : 0,
          background: flash === "correct" ? "#44FF88" : "#FF4444",
          zIndex: 50,
        }}
      />

      {/* ── The word ── */}
      <button
        onClick={() => { speakWord(); setRevealed(true); }}
        className="text-center transition-opacity hover:opacity-75 active:opacity-50"
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

      {/* ── Answer area ── */}
      <div className="flex flex-col items-center gap-2 min-h-[90px] justify-center">
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

      {/* ── Judge buttons ── */}
      <div
        className={cn(
          "flex gap-3 w-full max-w-xs transition-opacity duration-150",
          revealed ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
      >
        <button
          onClick={handleDontKnow}
          className="flex-1 py-3 rounded-lg text-sm font-medium transition-colors"
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
          className="flex-1 py-3 rounded-lg text-sm font-medium transition-colors"
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
