// WordList.tsx
// Design: Academic Elegance — table-style word list with gold accents
// Expandable rows show English translation and POS

import { useState } from "react";
import { VocabWord, WordProgress } from "@/lib/vocabulary";
import { ChevronDown, Volume2, CheckCircle2, ExternalLink } from "lucide-react";
import { cn } from "@/lib/utils";

interface WordListProps {
  words: VocabWord[];
  progress: Record<string, WordProgress>;
}

export default function WordList({ words, progress }: WordListProps) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const filtered = words.filter(
    (w) =>
      w.danish.toLowerCase().includes(search.toLowerCase()) ||
      w.english.toLowerCase().includes(search.toLowerCase()) ||
      (w.chinese && w.chinese.includes(search))
  );

  function speakWord(danish: string) {
    if ("speechSynthesis" in window) {
      const utt = new SpeechSynthesisUtterance(danish);
      utt.lang = "da-DK";
      utt.rate = 0.85;
      window.speechSynthesis.speak(utt);
    }
  }

  // Shorten long English for inline display
  function shortEnglish(en: string): string {
    const first = en.split(";")[0].trim();
    return first.length > 30 ? first.slice(0, 28) + "…" : first;
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Search */}
      <div className="relative">
        <input
          type="text"
          placeholder="搜尋丹麥語、中文或英文..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2.5 rounded-xl text-sm outline-none transition-all"
          style={{
            background: "rgba(245,240,232,0.06)",
            border: "1px solid rgba(245,240,232,0.15)",
            color: "#F5F0E8",
          }}
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs"
            style={{ color: "rgba(245,240,232,0.4)" }}
          >
            ✕
          </button>
        )}
      </div>

      <p className="text-xs" style={{ color: "rgba(245,240,232,0.4)" }}>
        共 {filtered.length} 個單詞
      </p>

      {/* Word rows */}
      <div className="flex flex-col gap-2">
        {filtered.map((word) => {
          const wp = progress[word.id];
          const isKnown = wp?.known;
          const isExpanded = expanded === word.id;

          return (
            <div
              key={word.id}
              className="rounded-xl overflow-hidden transition-all duration-200"
              style={{
                background: isExpanded
                  ? "rgba(245,240,232,0.09)"
                  : "rgba(245,240,232,0.04)",
                border: isExpanded
                  ? "1px solid rgba(201,168,76,0.35)"
                  : "1px solid rgba(245,240,232,0.1)",
              }}
            >
              <div
                className="flex items-center gap-3 px-4 py-3 cursor-pointer"
                onClick={() => setExpanded(isExpanded ? null : word.id)}
              >
                {/* Known indicator */}
                <div className="shrink-0">
                  {isKnown ? (
                    <CheckCircle2 size={16} style={{ color: "#70C090" }} />
                  ) : (
                    <div
                      className="w-4 h-4 rounded-full border"
                      style={{ borderColor: "rgba(245,240,232,0.2)" }}
                    />
                  )}
                </div>

                {/* Danish word */}
                <p
                  className="font-semibold text-base flex-1 min-w-0 truncate"
                  style={{ fontFamily: "'Lora', serif", color: "#F5F0E8" }}
                >
                  {word.danish}
                </p>

                {/* Chinese (primary) */}
                <p className="text-sm shrink-0 max-w-[140px] truncate font-medium" style={{ color: "#C9A84C" }}>
                  {word.chinese || shortEnglish(word.english)}
                </p>

                {/* Speak */}
                <button
                  onClick={(e) => { e.stopPropagation(); speakWord(word.danish); }}
                  className="shrink-0 p-1 rounded hover:bg-white/10 transition-colors"
                >
                  <Volume2 size={14} style={{ color: "rgba(201,168,76,0.7)" }} />
                </button>

                <ChevronDown
                  size={14}
                  className={cn("shrink-0 transition-transform duration-200", isExpanded && "rotate-180")}
                  style={{ color: "rgba(245,240,232,0.4)" }}
                />
              </div>

              {/* Expanded detail */}
              {isExpanded && (
                <div
                  className="px-4 pb-4 pt-1 border-t"
                  style={{ borderColor: "rgba(201,168,76,0.2)" }}
                >
                  <div className="flex flex-wrap gap-2 mb-2">
                    {word.pos && (
                      <span className="text-xs px-2 py-0.5 rounded" style={{ background: "rgba(201,168,76,0.15)", color: "#C9A84C" }}>
                        {word.pos}
                      </span>
                    )}
                    <span
                      className="text-xs px-2 py-0.5 rounded capitalize"
                      style={{ background: "rgba(245,240,232,0.05)", color: "rgba(245,240,232,0.4)" }}
                    >
                      {word.difficulty === "beginner" ? "初級" : word.difficulty === "intermediate" ? "中級" : "高級"}
                    </span>
                  </div>
                  {word.chinese && (
                    <p className="text-base font-medium mb-1" style={{ color: "#C9A84C" }}>
                      {word.chinese}
                    </p>
                  )}
                  <p className="text-sm" style={{ color: "rgba(245,240,232,0.6)" }}>
                    {word.english}
                  </p>
                  <div className="flex items-center gap-3 mt-2">
                    <a
                      href={`https://en.wiktionary.org/wiki/${encodeURIComponent(word.danish)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs hover:underline"
                      style={{ color: "rgba(201,168,76,0.7)" }}
                    >
                      <ExternalLink size={11} />
                      Wiktionary
                    </a>
                    <a
                      href={`https://ordnet.dk/ddo/ordbog?query=${encodeURIComponent(word.danish)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs hover:underline"
                      style={{ color: "rgba(201,168,76,0.7)" }}
                    >
                      <ExternalLink size={11} />
                      ordnet.dk
                    </a>
                  </div>
                  {wp && (
                    <p className="text-xs mt-1" style={{ color: "rgba(245,240,232,0.35)" }}>
                      已複習 {wp.attempts} 次 · 正確 {wp.correct} 次
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-12" style={{ color: "rgba(245,240,232,0.4)" }}>
          <p className="text-4xl mb-3">🔍</p>
          <p>找不到符合的單詞</p>
        </div>
      )}
    </div>
  );
}
