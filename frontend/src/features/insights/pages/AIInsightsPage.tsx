import { useState } from "react";
import { useDataset } from "../../core/context/DatasetContext";
import { useNavigate } from "react-router-dom";
import {
  Lightbulb,
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Sparkles,
  FileSpreadsheet,
  ArrowRight,
  Brain,
  Target,
  Layers,
  Zap,
  ShieldAlert,
} from "lucide-react";

/* ── Types ───────────────────────────────────────────────────── */
type Sev = "critical" | "high" | "medium" | "low" | "info";

/* ── Severity styling ────────────────────────────────────────── */
const sevStyles: Record<Sev, { bg: string; border: string; color: string; dot: string }> = {
  critical: {
    bg: "rgba(239, 68, 68, 0.10)",
    border: "rgba(239, 68, 68, 0.30)",
    color: "#EF4444",
    dot: "#EF4444",
  },
  high: {
    bg: "rgba(239, 68, 68, 0.08)",
    border: "rgba(239, 68, 68, 0.25)",
    color: "#F87171",
    dot: "#F87171",
  },
  medium: {
    bg: "rgba(245, 158, 11, 0.08)",
    border: "rgba(245, 158, 11, 0.25)",
    color: "#F59E0B",
    dot: "#F59E0B",
  },
  low: {
    bg: "rgba(124, 92, 252, 0.08)",
    border: "rgba(124, 92, 252, 0.25)",
    color: "#A78BFA",
    dot: "#7C5CFC",
  },
  info: {
    bg: "rgba(100, 136, 200, 0.08)",
    border: "rgba(100, 136, 200, 0.25)",
    color: "#6488C8",
    dot: "#6488C8",
  },
};

function getSevStyle(sev: string) {
  return sevStyles[(sev as Sev)] || sevStyles.info;
}

/* ── Loading Skeleton ────────────────────────────────────────── */
function LoadingSkeleton() {
  return (
    <div className="flex flex-col gap-6 fade-in">
      <div className="h-16 rounded-xl skeleton w-1/3" />
      <div className="h-28 rounded-xl skeleton" />
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 rounded-xl skeleton" />
          ))}
        </div>
        <div className="h-64 rounded-xl skeleton" />
      </div>
    </div>
  );
}

/* ── Main Component ──────────────────────────────────────────── */
export function AIInsightsPage() {
  const { datasetRecommendations, isRecommendationsLoading, datasetInfo, datasetProfile } = useDataset();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);
  const navigate = useNavigate();

  if (isRecommendationsLoading) return <LoadingSkeleton />;

  if (!datasetRecommendations) {
    return (
      <div className="flex flex-col gap-6 fade-in">
        {/* Header */}
        <div className="flex flex-col gap-1 pb-5 border-b border-[#28292E]">
          <h1 className="text-[30px] font-extrabold text-[#E8E9ED] tracking-tight">
            AI Insights
          </h1>
          <p className="text-[15px] text-[#9DA0A8]">
            Smart preprocessing recommendations and intelligent model guidance.
          </p>
        </div>

        {/* Empty State */}
        <div
          className="py-16 px-8 flex flex-col items-center text-center rounded-2xl"
          style={{ background: "#1E1F22", border: "1px solid #28292E" }}
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
            style={{
              background: "rgba(124, 92, 252, 0.08)",
              border: "1px solid rgba(124, 92, 252, 0.20)",
            }}
          >
            <Lightbulb className="w-8 h-8 text-[#7C5CFC]" strokeWidth={1.5} />
          </div>
          <h3 className="text-[20px] font-bold text-[#E8E9ED] mb-2">
            No Recommendations Yet
          </h3>
          <p className="text-[14px] text-[#9DA0A8] max-w-md leading-relaxed mb-6">
            Upload a CSV dataset from the Dashboard to generate AI-powered preprocessing recommendations, task detection, and model suggestions.
          </p>
          <button
            onClick={() => navigate("/")}
            className="btn btn-primary gap-2"
            style={{ fontSize: "14px", height: "42px", padding: "0 22px" }}
          >
            Go to Dashboard &amp; Upload
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  const {
    overall_warnings,
    suggested_ml_task,
    suggested_models,
    column_recommendations,
  } = datasetRecommendations;

  const toggleExpand = (idx: number) => {
    setExpandedIndex(expandedIndex === idx ? null : idx);
  };

  /* Derive severity counts from actual data */
  const sevCounts = { critical: 0, high: 0, medium: 0, low: 0, info: 0 };
  column_recommendations.forEach((rec: any) => {
    const s = rec.severity as Sev;
    if (s in sevCounts) sevCounts[s]++;
  });

  /* Dataset context info */
  const filename = datasetRecommendations.filename || datasetInfo?.filename || "Dataset";
  const rows = datasetProfile?.health?.rows || datasetInfo?.rows;
  const cols = datasetProfile?.health?.columns || datasetInfo?.columns;

  return (
    <div className="flex flex-col gap-6 fade-in pb-10">
      {/* ═════════════════════════════════════════════════════════════
          1. PAGE HEADER
          ═════════════════════════════════════════════════════════════ */}
      <div
        className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5"
        style={{ borderBottom: "1px solid #28292E" }}
      >
        <div className="flex flex-col">
          <h1 className="text-[30px] font-extrabold text-[#E8E9ED] tracking-tight leading-tight">
            AI Insights
          </h1>
          <p className="text-[15px] text-[#9DA0A8] mt-1">
            Smart preprocessing recommendations timeline sorted by severity and impact.
          </p>
        </div>

        {/* Dataset Context Pill */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div
            className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-[13px]"
            style={{ background: "#1E1F22", border: "1px solid #28292E" }}
          >
            <div className="w-2 h-2 rounded-full bg-[#3ECF71]" />
            <FileSpreadsheet className="w-4 h-4 text-[#7C5CFC]" />
            <span className="font-mono font-semibold text-[#E8E9ED]">{filename}</span>
            {rows != null && (
              <>
                <span className="text-[#4A4C52]">·</span>
                <span className="text-[#9DA0A8] font-mono">{Number(rows).toLocaleString()} rows</span>
              </>
            )}
            {cols != null && (
              <>
                <span className="text-[#4A4C52]">·</span>
                <span className="text-[#9DA0A8] font-mono">{cols} columns</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ═════════════════════════════════════════════════════════════
          2. ANALYSIS SUMMARY STRIP
          ═════════════════════════════════════════════════════════════ */}
      <div
        className="px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-5"
        style={{ background: "#1A1A1E", border: "1px solid #2C2C33", borderRadius: "12px" }}
      >
        {/* Left: Task + Models */}
        <div className="flex flex-wrap items-center gap-7">
          {/* Detected Task */}
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: "rgba(124, 92, 252, 0.12)", border: "1px solid rgba(124, 92, 252, 0.25)" }}
            >
              <Target className="w-4 h-4 text-[#7C5CFC]" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-[#6B6E76] uppercase tracking-[0.1em]">
                Detected Task
              </p>
              <p className="text-[15px] font-bold text-[#E8E9ED] capitalize mt-0.5">
                {suggested_ml_task}
              </p>
            </div>
          </div>

          <div className="w-px h-8 bg-[#2C2C33] hidden sm:block" />

          {/* Suggested Models */}
          <div>
            <p className="text-[11px] font-bold text-[#6B6E76] uppercase tracking-[0.1em] mb-1.5">
              Suggested Models
            </p>
            <div className="flex flex-wrap gap-1.5">
              {suggested_models.map((m: string) => (
                <span
                  key={m}
                  className="text-[12px] font-semibold px-2.5 py-1 rounded-lg"
                  style={{
                    background: "rgba(124, 92, 252, 0.10)",
                    color: "#A78BFA",
                    border: "1px solid rgba(124, 92, 252, 0.25)",
                  }}
                >
                  {m}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Recommendation Count */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-[13px]"
            style={{ background: "#25262A", border: "1px solid #323338" }}
          >
            <Sparkles className="w-4 h-4 text-[#7C5CFC]" />
            <span className="font-bold text-[#E8E9ED] font-mono">
              {column_recommendations.length}
            </span>
            <span className="text-[#9DA0A8]">
              {column_recommendations.length === 1 ? "recommendation" : "recommendations"}
            </span>
          </div>
        </div>
      </div>

      {/* ═════════════════════════════════════════════════════════════
          3. OVERALL WARNINGS
          ═════════════════════════════════════════════════════════════ */}
      {overall_warnings.length > 0 && (
        <div className="space-y-1">
          {overall_warnings.map((w: string, i: number) => (
            <div
              key={i}
              className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-lg text-[13px]"
              style={{
                background: "rgba(245, 158, 11, 0.04)",
                border: "1px solid rgba(245, 158, 11, 0.14)",
              }}
            >
              <AlertTriangle className="w-3.5 h-3.5 text-[#D4960A] flex-shrink-0" />
              <span className="text-[#C9A84E] leading-relaxed">{w}</span>
            </div>
          ))}
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════
          4. TWO-COLUMN: RECOMMENDATIONS + ANALYSIS SNAPSHOT
          ═════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">
        {/* ── LEFT: AI Recommendations ── */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Brain className="w-5 h-5 text-[#7C5CFC]" />
            <h2 className="text-[20px] font-bold text-[#E8E9ED]">
              AI Recommendations
            </h2>
          </div>

          {column_recommendations.length === 0 ? (
            /* Clean dataset state */
            <div
              className="flex items-center gap-3 px-5 py-4 rounded-xl"
              style={{
                background: "rgba(62, 207, 113, 0.06)",
                border: "1px solid rgba(62, 207, 113, 0.20)",
              }}
            >
              <CheckCircle2 className="w-5 h-5 text-[#3ECF71] flex-shrink-0" />
              <div>
                <p className="text-[14px] font-semibold text-[#3ECF71]">
                  Clean Dataset — No Issues Detected
                </p>
                <p className="text-[13px] text-[#5BAF7B] mt-0.5">
                  No column-level data quality issues or preprocessing actions required.
                </p>
              </div>
            </div>
          ) : (
            /* Recommendation Timeline */
            <div className="relative pl-5 space-y-3">
              {/* Timeline rail */}
              <div
                className="absolute left-[7px] top-5 bottom-5 w-px pointer-events-none"
                style={{ background: "#323338" }}
              />

              {column_recommendations.map((rec: any, idx: number) => {
                const isExpanded = expandedIndex === idx;
                const confidencePct = Math.round(rec.confidence_score * 100);
                const sev = getSevStyle(rec.severity);

                return (
                  <div key={idx} className="relative">
                    {/* Timeline dot */}
                    <div
                      className="absolute -left-5 top-[22px] w-[15px] h-[15px] rounded-full flex items-center justify-center z-10"
                      style={{ background: "#141517", border: `2px solid ${sev.dot}` }}
                    >
                      <div
                        className="w-[5px] h-[5px] rounded-full"
                        style={{ background: sev.dot }}
                      />
                    </div>

                    {/* Recommendation Card */}
                    <div
                      className="rounded-xl overflow-hidden transition-all duration-150"
                      style={{
                        background: "#1E1F22",
                        border: "1px solid #28292E",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.borderColor = "#3A3B42";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.borderColor = "#28292E";
                      }}
                    >
                      {/* Card Header */}
                      <button
                        onClick={() => toggleExpand(idx)}
                        className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 cursor-pointer"
                      >
                        <div className="flex items-center gap-3.5 flex-1 min-w-0">
                          {/* Severity Badge */}
                          <span
                            className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md flex-shrink-0"
                            style={{
                              background: sev.bg,
                              color: sev.color,
                              border: `1px solid ${sev.border}`,
                            }}
                          >
                            {rec.severity}
                          </span>

                          <div className="min-w-0 flex-1">
                            <p className="text-[18px] font-bold text-[#E8E9ED] truncate leading-snug">
                              {rec.column_name}
                            </p>
                            <p className="text-[13px] text-[#9DA0A8] truncate mt-0.5">
                              {rec.issue}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-5 flex-shrink-0">
                          {/* Confidence Indicator */}
                          <div className="hidden sm:flex items-center gap-2.5">
                            <span className="text-[11px] text-[#6B6E76] font-medium">
                              Confidence
                            </span>
                            <span className="text-[13px] font-mono font-bold text-[#E8E9ED]">
                              {confidencePct}%
                            </span>
                            <div
                              className="w-16 h-[5px] rounded-full overflow-hidden"
                              style={{ background: "#25262A" }}
                            >
                              <div
                                className="h-full rounded-full transition-all duration-300"
                                style={{
                                  width: `${confidencePct}%`,
                                  background: confidencePct >= 80 ? "#3ECF71" : confidencePct >= 50 ? "#F59E0B" : "#6B6E76",
                                }}
                              />
                            </div>
                          </div>

                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-[#6B6E76]" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-[#6B6E76]" />
                          )}
                        </div>
                      </button>

                      {/* Expandable Details */}
                      {isExpanded && (
                        <div
                          className="px-5 pb-3 pt-3 space-y-3 fade-in"
                          style={{
                            borderTop: "1px solid #28292E",
                            background: "#191A1D",
                          }}
                        >
                          {/* Suggested Action Callout */}
                          <div
                            className="p-4 rounded-xl"
                            style={{
                              background: "rgba(124, 92, 252, 0.06)",
                              border: "1px solid rgba(124, 92, 252, 0.20)",
                            }}
                          >
                            <div className="flex items-center gap-2 mb-1.5">
                              <Zap className="w-3.5 h-3.5 text-[#7C5CFC]" />
                              <p className="text-[11px] font-bold text-[#7C5CFC] uppercase tracking-[0.1em]">
                                Suggested Action
                              </p>
                            </div>
                            <p className="text-[14px] font-semibold text-[#E8E9ED] leading-relaxed">
                              {rec.recommendation}
                            </p>
                          </div>

                          {/* Reasoning & Impact */}
                          <div>
                            <p className="text-[11px] font-bold text-[#6B6E76] uppercase tracking-[0.1em] mb-1.5">
                              Reasoning &amp; Impact
                            </p>
                            <p className="text-[14px] text-[#9DA0A8] leading-relaxed">
                              {rec.reason}
                            </p>
                          </div>

                          {/* Mobile confidence (visible on sm only) */}
                          <div className="sm:hidden flex items-center gap-2.5 pt-2 border-t border-[#28292E]">
                            <span className="text-[11px] text-[#6B6E76]">Confidence</span>
                            <span className="text-[13px] font-mono font-bold text-[#E8E9ED]">
                              {confidencePct}%
                            </span>
                            <div className="flex-1 h-[5px] rounded-full overflow-hidden bg-[#25262A]">
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${confidencePct}%`,
                                  background: confidencePct >= 80 ? "#3ECF71" : confidencePct >= 50 ? "#F59E0B" : "#6B6E76",
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* ── RIGHT: Analysis Snapshot ── */}
        <div
          className="flex flex-col rounded-xl lg:sticky lg:top-4"
          style={{ background: "#1E1F22", border: "1px solid #28292E" }}
        >
          {/* Snapshot Header */}
          <div
            className="px-4 py-3 flex items-center gap-2"
            style={{ borderBottom: "1px solid #28292E" }}
          >
            <Layers className="w-4 h-4 text-[#7C5CFC]" />
            <h3 className="text-[15px] font-bold text-[#E8E9ED]">
              Analysis Snapshot
            </h3>
          </div>

          <div className="p-4 space-y-4">
            {/* Detected Task */}
            <div>
              <p className="text-[11px] font-bold text-[#6B6E76] uppercase tracking-[0.1em] mb-1.5">
                Detected Task
              </p>
              <span
                className="text-[13px] font-bold px-2.5 py-1 rounded-lg inline-block capitalize"
                style={{
                  background: "rgba(124, 92, 252, 0.12)",
                  color: "#A78BFA",
                  border: "1px solid rgba(124, 92, 252, 0.25)",
                }}
              >
                {suggested_ml_task}
              </span>
            </div>

            <div style={{ height: "1px", background: "#232328" }} />

            {/* Recommended Models */}
            <div>
              <p className="text-[11px] font-bold text-[#6B6E76] uppercase tracking-[0.1em] mb-2">
                Recommended Models
              </p>
              <div className="space-y-1.5">
                {suggested_models.map((m: string) => (
                  <div
                    key={m}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-[13px]"
                    style={{ background: "#25262A", border: "1px solid #323338" }}
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-[#7C5CFC]" />
                    <span className="font-semibold text-[#E8E9ED]">{m}</span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ height: "1px", background: "#232328" }} />

            {/* Recommendation Summary */}
            <div>
              <p className="text-[11px] font-bold text-[#6B6E76] uppercase tracking-[0.1em] mb-2">
                Recommendations by Severity
              </p>
              <div className="space-y-1.5">
                {sevCounts.critical > 0 && (
                  <div className="flex items-center justify-between text-[13px]">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: "#EF4444" }} />
                      <span className="text-[#E8E9ED]">Critical</span>
                    </div>
                    <span className="font-mono font-bold text-[#EF4444]">{sevCounts.critical}</span>
                  </div>
                )}
                {sevCounts.high > 0 && (
                  <div className="flex items-center justify-between text-[13px]">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: "#F87171" }} />
                      <span className="text-[#E8E9ED]">High</span>
                    </div>
                    <span className="font-mono font-bold text-[#F87171]">{sevCounts.high}</span>
                  </div>
                )}
                {sevCounts.medium > 0 && (
                  <div className="flex items-center justify-between text-[13px]">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: "#F59E0B" }} />
                      <span className="text-[#E8E9ED]">Medium</span>
                    </div>
                    <span className="font-mono font-bold text-[#F59E0B]">{sevCounts.medium}</span>
                  </div>
                )}
                {sevCounts.low > 0 && (
                  <div className="flex items-center justify-between text-[13px]">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: "#7C5CFC" }} />
                      <span className="text-[#E8E9ED]">Low</span>
                    </div>
                    <span className="font-mono font-bold text-[#A78BFA]">{sevCounts.low}</span>
                  </div>
                )}
                {sevCounts.info > 0 && (
                  <div className="flex items-center justify-between text-[13px]">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: "#6488C8" }} />
                      <span className="text-[#E8E9ED]">Info</span>
                    </div>
                    <span className="font-mono font-bold text-[#6488C8]">{sevCounts.info}</span>
                  </div>
                )}
                {column_recommendations.length === 0 && (
                  <div className="flex items-center gap-2 text-[13px]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#3ECF71]" />
                    <span className="text-[#3ECF71] font-medium">No issues detected</span>
                  </div>
                )}
              </div>
            </div>

            <div style={{ height: "1px", background: "#232328" }} />

            {/* Overall Warnings count */}
            <div className="flex items-center justify-between text-[13px]">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-3.5 h-3.5 text-[#F59E0B]" />
                <span className="text-[#9DA0A8]">Overall Warnings</span>
              </div>
              <span className="font-mono font-bold text-[#E8E9ED]">{overall_warnings.length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
