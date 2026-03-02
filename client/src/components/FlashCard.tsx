// FlashCard.tsx — ADHD-friendly
// Keyboard: Space = reveal, → = know, ← = don't know
// Touch:    double-tap = reveal, swipe-right = know, swipe-left = don't know

import { useState, useEffect, useRef } from "react";
import { VocabWord } from "@/lib/vocabulary";

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

// Swipe hint: shows briefly after a swipe to confirm direction
type SwipeHint = "right" | "left" | null;

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
  const [swipeHint, setSwipeHint] = useState<SwipeHint>(null);

  const flashTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const msgTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const swipeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastFlashColor = useRef<string>("#44FF88");

  // Touch tracking
  const touchStart = useRef<{ x: number; y: number; time: number } | null>(null);
  const lastTap = useRef<number>(0);

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
    const color = type === "correct" ? "#44FF88" : "#FF4444";
    lastFlashColor.current = color;
    if (flashTimer.current) clearTimeout(flashTimer.current);
    setFlash(type);
    flashTimer.current = setTimeout(() => setFlash(null), 350);
  }

  function showSwipeHint(dir: SwipeHint) {
    setSwipeHint(dir);
    if (swipeTimer.current) clearTimeout(swipeTimer.current);
    swipeTimer.current = setTimeout(() => setSwipeHint(null), 500);
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

  // ── Touch handlers ──
  function handleTouchStart(e: React.TouchEvent) {
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY, time: Date.now() };
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (!touchStart.current) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStart.current.x;
    const dy = t.clientY - touchStart.current.y;
    const dt = Date.now() - touchStart.current.time;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    // Double-tap: two taps within 300ms, minimal movement
    if (absDx < 15 && absDy < 15 && dt < 250) {
      const now = Date.now();
      if (now - lastTap.current < 300) {
        // Double-tap detected
        lastTap.current = 0;
        setRevealed(true);
        speakWord();
        return;
      }
      lastTap.current = now;
      return;
    }

    // Swipe: horizontal movement > 60px, faster than 400ms, more horizontal than vertical
    if (absDx > 60 && absDx > absDy * 1.5 && dt < 400) {
      if (!revealed) {
        // Reveal first on swipe if not yet revealed
        setRevealed(true);
        return;
      }
      if (dx > 0) {
        // Swipe right → Kender
        showSwipeHint("right");
        handleKnow();
      } else {
        // Swipe left → Kender ikke
        showSwipeHint("left");
        handleDontKnow();
      }
    }

    touchStart.current = null;
  }

  const shortEnglish = word.english.split(";")[0].split(",")[0].trim();

  return (
    <div
      className="flex flex-col items-center w-full select-none"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* ── Flash overlay ── */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          opacity: flash ? 0.07 : 0,
          background: lastFlashColor.current,
          transition: flash ? "opacity 0.05s ease-in" : "opacity 0.3s ease-out",
          zIndex: 50,
        }}
      />

      {/* ── Swipe direction hint ── */}
      {swipeHint && (
        <div
          className="fixed inset-0 flex items-center pointer-events-none"
          style={{
            justifyContent: swipeHint === "right" ? "flex-end" : "flex-start",
            padding: "0 2rem",
            zIndex: 51,
          }}
        >
          <span
            className="text-5xl font-bold"
            style={{
              color: swipeHint === "right" ? "#44FF88" : "#FF4444",
              opacity: 0.6,
            }}
          >
            {swipeHint === "right" ? "→" : "←"}
          </span>
        </div>
      )}

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

      {/* ── Fixed-height layout: word stays put regardless of answer ── */}
      <div
        className="flex flex-col items-center w-full"
        style={{ minHeight: "320px" }}
      >
        {/* The word — tap to speak */}
        <button
          onClick={() => { speakWord(); setRevealed(true); }}
          className="text-center active:opacity-50 transition-opacity"
          style={{ background: "none", border: "none", padding: 0 }}
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
          ) : null}
        </div>
      </div>
    </div>
  );
}
