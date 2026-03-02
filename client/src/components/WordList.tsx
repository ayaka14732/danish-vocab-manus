// WordList.tsx — ADHD-friendly, monochrome

import { useState } from "react";
import { VocabWord, WordProgress } from "@/lib/vocabulary";
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

  function speakWord(e: React.MouseEvent, danish: string) {
    e.stopPropagation();
    if ("speechSynthesis" in window) {
      const utt = new SpeechSynthesisUtterance(danish);
      utt.lang = "da-DK";
      utt.rate = 0.85;
      window.speechSynthesis.speak(utt);
    }
  }

  const shortChinese = (w: VocabWord) =>
    w.chinese || w.english.split(";")[0].split(",")[0].trim();

  return (
    <div className="flex flex-col gap-3">
      {/* Search */}
      <input
        type="text"
        placeholder="Søg..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full px-4 py-2.5 rounded-lg text-sm outline-none"
        style={{
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.08)",
          color: "#FFFFFF",
        }}
      />

      <p className="text-xs" style={{ color: "rgba(255,255,255,0.2)" }}>
        {filtered.length} ord
      </p>

      {/* Rows */}
      <div className="flex flex-col gap-px">
        {filtered.map((word) => {
          const wp = progress[word.id];
          const isKnown = wp?.known;
          const isExpanded = expanded === word.id;

          return (
            <div
              key={word.id}
              className="overflow-hidden"
              style={{
                background: isExpanded ? "rgba(255,255,255,0.05)" : "transparent",
                borderBottom: "1px solid rgba(255,255,255,0.05)",
              }}
            >
              {/* Row */}
              <div
                className="flex items-center gap-3 px-2 py-2.5 cursor-pointer hover:bg-white/3 transition-colors"
                onClick={() => setExpanded(isExpanded ? null : word.id)}
              >
                {/* Known dot */}
                <div
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ background: isKnown ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.1)" }}
                />

                {/* Danish */}
                <p className="flex-1 min-w-0 truncate text-sm font-medium" style={{ color: "#FFFFFF" }}>
                  {word.danish}
                </p>

                {/* Chinese */}
                <p className="text-sm shrink-0 max-w-[140px] truncate" style={{ color: "rgba(255,255,255,0.45)" }}>
                  {shortChinese(word)}
                </p>
              </div>

              {/* Expanded */}
              {isExpanded && (
                <div className="px-6 pb-3 pt-1">
                  {word.pos && (
                    <span className="text-xs italic mr-3" style={{ color: "rgba(255,255,255,0.25)" }}>
                      {word.pos}
                    </span>
                  )}
                  <p className="text-sm mt-1" style={{ color: "rgba(255,255,255,0.4)" }}>
                    {word.english}
                  </p>
                  <div className="flex items-center gap-5 mt-2">
                    <button
                      onClick={(e) => speakWord(e, word.danish)}
                      className="text-xs hover:underline"
                      style={{ color: "rgba(255,255,255,0.2)", background: "none", border: "none" }}
                    >
                      Lyt
                    </button>
                    <a
                      href={`https://en.wiktionary.org/wiki/${encodeURIComponent(word.danish)}`}
                      target="_blank" rel="noopener noreferrer"
                      className="text-xs hover:underline"
                      style={{ color: "rgba(255,255,255,0.2)" }}
                    >
                      Wiktionary
                    </a>
                    <a
                      href={`https://ordnet.dk/ddo/ordbog?query=${encodeURIComponent(word.danish)}`}
                      target="_blank" rel="noopener noreferrer"
                      className="text-xs hover:underline"
                      style={{ color: "rgba(255,255,255,0.2)" }}
                    >
                      ordnet.dk
                    </a>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <p className="text-center py-12 text-sm" style={{ color: "rgba(255,255,255,0.2)" }}>
          Ingen ord fundet
        </p>
      )}
    </div>
  );
}
