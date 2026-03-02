// WordList.tsx — ADHD-friendly
// Clean searchable list. Click row to expand.

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
        placeholder="搜尋..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full px-4 py-2.5 rounded-lg text-sm outline-none"
        style={{
          background: "rgba(232,228,220,0.05)",
          border: "1px solid rgba(232,228,220,0.1)",
          color: "#E8E4DC",
        }}
      />

      <p className="text-xs" style={{ color: "rgba(232,228,220,0.25)" }}>
        {filtered.length} 個單詞
      </p>

      {/* Rows */}
      <div className="flex flex-col gap-1">
        {filtered.map((word) => {
          const wp = progress[word.id];
          const isKnown = wp?.known;
          const isExpanded = expanded === word.id;

          return (
            <div
              key={word.id}
              className="rounded-lg overflow-hidden"
              style={{
                background: isExpanded ? "rgba(232,228,220,0.06)" : "rgba(232,228,220,0.03)",
                border: `1px solid ${isExpanded ? "rgba(201,168,76,0.2)" : "rgba(232,228,220,0.07)"}`,
              }}
            >
              {/* Row header */}
              <div
                className="flex items-center gap-3 px-4 py-2.5 cursor-pointer"
                onClick={() => setExpanded(isExpanded ? null : word.id)}
              >
                {/* Known dot */}
                <div
                  className="w-1.5 h-1.5 rounded-full shrink-0"
                  style={{ background: isKnown ? "#60A878" : "rgba(232,228,220,0.15)" }}
                />

                {/* Danish */}
                <p
                  className="font-medium text-sm flex-1 min-w-0 truncate"
                  style={{ fontFamily: "'Lora', serif", color: "#E8E4DC" }}
                >
                  {word.danish}
                </p>

                {/* Chinese */}
                <p className="text-sm shrink-0 max-w-[130px] truncate" style={{ color: "#C9A84C" }}>
                  {shortChinese(word)}
                </p>
              </div>

              {/* Expanded */}
              {isExpanded && (
                <div
                  className="px-4 pb-3 pt-1 border-t"
                  style={{ borderColor: "rgba(201,168,76,0.1)" }}
                >
                  {word.pos && (
                    <span className="text-xs italic mr-3" style={{ color: "rgba(232,228,220,0.35)" }}>
                      {word.pos}
                    </span>
                  )}
                  <p className="text-sm mt-1" style={{ color: "rgba(232,228,220,0.55)" }}>
                    {word.english}
                  </p>
                  <div className="flex items-center gap-4 mt-2">
                    <button
                      onClick={(e) => speakWord(e, word.danish)}
                      className="text-xs hover:underline"
                      style={{ color: "rgba(232,228,220,0.3)", background: "none", border: "none" }}
                    >
                      朗讀
                    </button>
                    <a
                      href={`https://en.wiktionary.org/wiki/${encodeURIComponent(word.danish)}`}
                      target="_blank" rel="noopener noreferrer"
                      className="text-xs hover:underline"
                      style={{ color: "rgba(201,168,76,0.45)" }}
                    >
                      Wiktionary
                    </a>
                    <a
                      href={`https://ordnet.dk/ddo/ordbog?query=${encodeURIComponent(word.danish)}`}
                      target="_blank" rel="noopener noreferrer"
                      className="text-xs hover:underline"
                      style={{ color: "rgba(201,168,76,0.45)" }}
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
        <p className="text-center py-12 text-sm" style={{ color: "rgba(232,228,220,0.25)" }}>
          找不到符合的單詞
        </p>
      )}
    </div>
  );
}
