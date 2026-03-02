// StatsPanel.tsx — ADHD-friendly, monochrome

import { VOCABULARY, CATEGORIES, WordCategory, UserProgress } from "@/lib/vocabulary";

interface StatsPanelProps {
  progress: UserProgress;
}

function CategoryBar({ category, progress }: { category: WordCategory; progress: UserProgress }) {
  const cat = CATEGORIES[category];
  const total = VOCABULARY.filter((w) => w.category === category).length;
  const known = VOCABULARY.filter(
    (w) => w.category === category && progress.words[w.id]?.known
  ).length;
  const pct = total > 0 ? Math.round((known / total) * 100) : 0;

  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs truncate" style={{ color: "rgba(255,255,255,0.55)" }}>
            {cat.label}
          </span>
          <span className="text-xs shrink-0 ml-2 tabular-nums" style={{ color: "rgba(255,255,255,0.25)" }}>
            {known}/{total}
          </span>
        </div>
        <div className="h-1 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.07)" }}>
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${pct}%`, background: "rgba(255,255,255,0.5)" }}
          />
        </div>
      </div>
    </div>
  );
}

export default function StatsPanel({ progress }: StatsPanelProps) {
  const allWords = VOCABULARY.length;
  const knownWords = Object.values(progress.words).filter((w) => w.known).length;
  const reviewedWords = Object.values(progress.words).filter((w) => w.attempts > 0).length;
  const totalAttempts = Object.values(progress.words).reduce((s, w) => s + w.attempts, 0);
  const totalCorrect = Object.values(progress.words).reduce((s, w) => s + w.correct, 0);
  const accuracy = totalAttempts > 0 ? Math.round((totalCorrect / totalAttempts) * 100) : 0;
  const progressPct = allWords > 0 ? Math.round((knownWords / allWords) * 100) : 0;

  return (
    <div className="flex flex-col gap-8 py-4">

      {/* Big number */}
      <div className="text-center py-6">
        <p
          className="font-bold leading-none"
          style={{ fontFamily: "'Lora', serif", fontSize: "5rem", color: "#FFFFFF" }}
        >
          {progressPct}%
        </p>
        <p className="mt-2 text-sm" style={{ color: "rgba(255,255,255,0.3)" }}>
          Kender {knownWords} / {allWords} ord
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: "Gennemgået", value: reviewedWords },
          { label: "Nøjagtighed", value: `${accuracy}%` },
          { label: "Dage i træk", value: progress.studyStreak },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-lg p-4 text-center"
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)" }}
          >
            <p className="text-2xl font-bold" style={{ color: "#FFFFFF" }}>{s.value}</p>
            <p className="text-xs mt-1" style={{ color: "rgba(255,255,255,0.3)" }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Category breakdown */}
      <div className="flex flex-col gap-3">
        <p className="text-xs" style={{ color: "rgba(255,255,255,0.25)" }}>Kategori-fremskridt</p>
        {(Object.keys(CATEGORIES) as WordCategory[]).map((cat) => (
          <CategoryBar key={cat} category={cat} progress={progress} />
        ))}
      </div>

      {progress.lastStudyDate && (
        <p className="text-xs text-center" style={{ color: "rgba(255,255,255,0.18)" }}>
          Sidst studeret: {progress.lastStudyDate}
        </p>
      )}
    </div>
  );
}
