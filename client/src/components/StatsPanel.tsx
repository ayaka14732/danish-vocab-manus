// StatsPanel.tsx
// Design: Academic Elegance — stats with gold accents and progress rings
// Shows overall progress, streak, accuracy, category breakdown

import { VOCABULARY, CATEGORIES, WordCategory, UserProgress, getStats } from "@/lib/vocabulary";

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
      <span className="text-lg shrink-0">{cat.icon}</span>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs font-medium truncate" style={{ color: "rgba(245,240,232,0.8)" }}>
            {cat.label}
          </span>
          <span className="text-xs shrink-0 ml-2 tabular-nums" style={{ color: "rgba(245,240,232,0.5)" }}>
            {known}/{total}
          </span>
        </div>
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "rgba(245,240,232,0.1)" }}>
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${pct}%`, background: cat.color }}
          />
        </div>
      </div>
    </div>
  );
}

export default function StatsPanel({ progress }: StatsPanelProps) {
  const stats = getStats(progress);
  const progressPct = Math.round((stats.known / stats.all) * 100);

  return (
    <div className="flex flex-col gap-6">
      {/* Big stats row */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "總單詞", value: stats.all, unit: "個", color: "#C9A84C" },
          { label: "已掌握", value: stats.known, unit: "個", color: "#70C090" },
          { label: "正確率", value: stats.accuracy, unit: "%", color: "#7BA8C9" },
          { label: "連續學習", value: stats.streak, unit: "天", color: "#E07060" },
        ].map((s) => (
          <div
            key={s.label}
            className="rounded-xl p-4 text-center"
            style={{ background: "rgba(245,240,232,0.05)", border: "1px solid rgba(245,240,232,0.1)" }}
          >
            <p className="text-3xl font-bold mb-1" style={{ fontFamily: "'Lora', serif", color: s.color }}>
              {s.value}
              <span className="text-sm font-normal ml-0.5">{s.unit}</span>
            </p>
            <p className="text-xs" style={{ color: "rgba(245,240,232,0.5)" }}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Overall progress */}
      <div
        className="rounded-xl p-5"
        style={{ background: "rgba(245,240,232,0.05)", border: "1px solid rgba(201,168,76,0.2)" }}
      >
        <div className="flex justify-between items-center mb-3">
          <p className="text-sm font-medium" style={{ color: "rgba(245,240,232,0.8)" }}>
            整體學習進度
          </p>
          <p className="text-sm font-bold" style={{ color: "#C9A84C" }}>
            {progressPct}%
          </p>
        </div>
        <div className="h-3 rounded-full overflow-hidden" style={{ background: "rgba(245,240,232,0.1)" }}>
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{
              width: `${progressPct}%`,
              background: "linear-gradient(90deg, #C9A84C, #E0C06A)",
            }}
          />
        </div>
        <p className="text-xs mt-2" style={{ color: "rgba(245,240,232,0.4)" }}>
          已複習 {stats.reviewed} 個，掌握 {stats.known} 個，共 {stats.all} 個
        </p>
      </div>

      {/* Category breakdown */}
      <div
        className="rounded-xl p-5"
        style={{ background: "rgba(245,240,232,0.05)", border: "1px solid rgba(245,240,232,0.1)" }}
      >
        <p className="text-sm font-medium mb-4" style={{ color: "rgba(245,240,232,0.8)" }}>
          分類進度
        </p>
        <div className="flex flex-col gap-3">
          {(Object.keys(CATEGORIES) as WordCategory[]).map((cat) => (
            <CategoryBar key={cat} category={cat} progress={progress} />
          ))}
        </div>
      </div>

      {progress.lastStudyDate && (
        <p className="text-xs text-center" style={{ color: "rgba(245,240,232,0.3)" }}>
          上次學習：{progress.lastStudyDate}
        </p>
      )}
    </div>
  );
}
