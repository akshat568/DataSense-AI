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

/* ── Severity styling with restrained palette ───────────────── */
const sevStyles: Record<Sev, { bg: string; border: string; color: string; dot: string }> = {
  critical: {
    bg: "#FEF2F2",
    border: "#FECACA",
    color: "#B91C1C",
    dot: "#DC2626",
  },
  high: {
    bg: "#FEF2F2",
    border: "#FECACA",
    color: "#DC2626",
    dot: "#EF4444",
  },
  medium: {
    bg: "#FEF8EC",
    border: "#FDE68A",
    color: "#B45309",
    dot: "#D97706",
  },
  low: {
    bg: "#F4F8EC",
    border: "#D9F99D",
    color: "#4D7C0F",
    dot: "#65A30D",
  },
  info: {
    bg: "#F1F5EF",
    border: "#E5E9E2",
    color: "#4B554F",
    dot: "#64736A",
  },
};

function getSevStyle(sev: string) {
  return sevStyles[(sev as Sev)] || sevStyles.info;
}

/* ── Loading Skeleton ────────────────────────────────────────── */
function LoadingSkeleton() {
  return (
    <div className="flex flex-col gap-6 fade-in">
      <div className="h-16 rounded-2xl skeleton w-1/3" />
      <div className="h-28 rounded-2xl skeleton" />
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 rounded-2xl skeleton" />
          ))}
        </div>
        <div className="h-64 rounded-2xl skeleton" />
      </div>
    </div>
  );
}

/* ── Main Component ──────────────────────────────────────────── */
export function AIInsightsPage() {
  const { datasetRecommendations, isRecommendationsLoading, datasetInfo, datasetProfile } = useDataset();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const navigate = useNavigate();

  if (isRecommendationsLoading) return <LoadingSkeleton />;

  if (!datasetRecommendations) {
    return (
      <div className="flex flex-col gap-6 fade-in">
        {/* Header */}
        <div className="flex flex-col gap-1 pb-5 border-b border-[#E5E9E2]">
          <h1 className="text-[28px] font-extrabold text-[#26332D] tracking-tight">
            AI Insights
          </h1>
          <p className="text-[14px] text-[#64736A]">
            Smart preprocessing recommendations and machine learning guidance.
          </p>
        </div>

        {/* Empty State */}
        <div className="py-16 px-8 flex flex-col items-center text-center rounded-2xl bg-white border border-[#E5E9E2] shadow-[0_1px_3px_rgba(38,51,45,0.03)]">
          <div className="w-16 h-16 rounded-2xl bg-[#F1F5EF] border border-[#E5E9E2] flex items-center justify-center mb-4 text-[#26332D]">
            <Lightbulb className="w-8 h-8 text-[#26332D]" strokeWidth={1.75} />
          </div>
          <h3 className="text-[20px] font-bold text-[#26332D] mb-2">
            No Recommendations Available
          </h3>
          <p className="text-[14px] text-[#64736A] max-w-md leading-relaxed mb-6">
            Upload a CSV dataset from the Dashboard to generate automated preprocessing recommendations, problem formulation, and model architecture suggestions.
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

  /* Derive severity counts */
  const sevCounts = { critical: 0, high: 0, medium: 0, low: 0, info: 0 };
  column_recommendations.forEach((rec: any) => {
    const s = rec.severity as Sev;
    if (s in sevCounts) sevCounts[s]++;
  });

  const filename = datasetRecommendations.filename || datasetInfo?.filename || "Dataset";
  const rows = datasetProfile?.health?.rows || datasetInfo?.rows;
  const cols = datasetProfile?.health?.columns || datasetInfo?.columns;

  return (
    <div className="flex flex-col gap-6 fade-in pb-10">
      {/* ═════════════════════════════════════════════════════════════
          1. PAGE HEADER
          ═════════════════════════════════════════════════════════════ */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-[#E5E9E2]">
        <div className="flex flex-col">
          <h1 className="text-[28px] sm:text-[32px] font-extrabold text-[#26332D] tracking-tight leading-tight">
            AI Insights
          </h1>
          <p className="text-[14px] text-[#64736A] mt-1">
            Data quality observations, preprocessing guidance, and ML task formulation.
          </p>
        </div>

        {/* Dataset Context Pill */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-[13px] bg-white border border-[#E5E9E2] shadow-xs">
            <div className="w-2 h-2 rounded-full bg-[#2A7E4F]" />
            <FileSpreadsheet className="w-4 h-4 text-[#26332D]" />
            <span className="font-mono font-semibold text-[#26332D]">{filename}</span>
            {rows != null && (
              <>
                <span className="text-[#C4CCC2]">·</span>
                <span className="text-[#64736A] font-mono">{Number(rows).toLocaleString()} rows</span>
              </>
            )}
            {cols != null && (
              <>
                <span className="text-[#C4CCC2]">·</span>
                <span className="text-[#64736A] font-mono">{cols} cols</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ═════════════════════════════════════════════════════════════
          2. ANALYSIS SUMMARY STRIP
          ═════════════════════════════════════════════════════════════ */}
      <div className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-5 rounded-2xl bg-white border border-[#E5E9E2] shadow-[0_1px_3px_rgba(38,51,45,0.03)]">
        {/* Left: Task + Models */}
        <div className="flex flex-wrap items-center gap-7">
          {/* Detected Task */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-[#F1F5EF] border border-[#E5E9E2] text-[#26332D] flex-shrink-0">
              <Target className="w-5 h-5 text-[#26332D]" />
            </div>
            <div>
              <p className="text-[11px] font-bold text-[#78827A] uppercase tracking-[0.14em]">
                Detected ML Task
              </p>
              <p className="text-[15px] font-bold text-[#26332D] capitalize mt-0.5">
                {suggested_ml_task}
              </p>
            </div>
          </div>

          <div className="w-px h-8 bg-[#E5E9E2] hidden sm:block" />

          {/* Suggested Models */}
          <div>
            <p className="text-[11px] font-bold text-[#78827A] uppercase tracking-[0.14em] mb-1.5">
              Suggested Baseline Architectures
            </p>
            <div className="flex flex-wrap gap-1.5">
              {suggested_models.map((m: string) => (
                <span
                  key={m}
                  className="text-[12px] font-semibold px-2.5 py-1 rounded-lg bg-[#F1F5EF] text-[#26332D] border border-[#E5E9E2]"
                >
                  {m}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Right: Recommendation Count */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-[13px] bg-[#FAFBF9] border border-[#E5E9E2]">
            <Sparkles className="w-4 h-4 text-[#26332D]" />
            <span className="font-bold text-[#26332D] font-mono">
              {column_recommendations.length}
            </span>
            <span className="text-[#64736A]">
              {column_recommendations.length === 1 ? "recommendation" : "recommendations"}
            </span>
          </div>
        </div>
      </div>

      {/* ═════════════════════════════════════════════════════════════
          3. OVERALL WARNINGS (Restrained warm amber)
          ═════════════════════════════════════════════════════════════ */}
      {overall_warnings.length > 0 && (
        <div className="space-y-2">
          {overall_warnings.map((w: string, i: number) => (
            <div
              key={i}
              className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-[13px] bg-[#FEF8EC] border border-[#FDE68A]"
            >
              <AlertTriangle className="w-4 h-4 text-[#D97706] flex-shrink-0" />
              <span className="text-[#92400E] font-medium leading-relaxed">{w}</span>
            </div>
          ))}
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════
          4. RECOMMENDATIONS TIMELINE + ANALYSIS SNAPSHOT
          ═════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">
        {/* ── LEFT: Recommendations Timeline ── */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
            <div className="flex items-center gap-2">
              <Brain className="w-5 h-5 text-[#26332D]" />
              <h2 className="text-[17px] font-bold text-[#26332D]">
                Feature-Level Recommendations
              </h2>
            </div>

            {/* Severity Filter Tabs */}
            <div className="flex flex-wrap gap-1 p-1 rounded-xl bg-[#F1F5EF] border border-[#E5E9E2] text-[12px]">
              {[
                { id: "all", label: `All (${column_recommendations.length})` },
                { id: "critical", label: `Critical (${sevCounts.critical})`, hide: sevCounts.critical === 0 },
                { id: "high", label: `High (${sevCounts.high})`, hide: sevCounts.high === 0 },
                { id: "medium", label: `Medium (${sevCounts.medium})`, hide: sevCounts.medium === 0 },
                { id: "low_info", label: `Low / Info (${sevCounts.low + sevCounts.info})`, hide: (sevCounts.low + sevCounts.info) === 0 },
              ]
                .filter((t) => !t.hide)
                .map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveFilter(tab.id)}
                    className={`px-2.5 py-1 rounded-lg font-medium transition-colors cursor-pointer ${
                      activeFilter === tab.id
                        ? "bg-white text-[#26332D] font-bold shadow-xs border border-[#E5E9E2]"
                        : "text-[#64736A] hover:text-[#26332D]"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
            </div>
          </div>

          {column_recommendations.length === 0 ? (
            <div className="flex items-center gap-3 px-5 py-4 rounded-xl bg-[#EDF7F1] border border-[#BCE2CC]">
              <CheckCircle2 className="w-5 h-5 text-[#2A7E4F] flex-shrink-0" />
              <div>
                <p className="text-[14px] font-semibold text-[#166534]">
                  Clean Dataset — No Preprocessing Issues Detected
                </p>
                <p className="text-[12.5px] text-[#2D6A4F] mt-0.5">
                  No column-level data quality defects or missing transformations required.
                </p>
              </div>
            </div>
          ) : (
            <div className="relative pl-5 space-y-3">
              {/* Timeline rail */}
              <div
                className="absolute left-[7px] top-5 bottom-5 w-px pointer-events-none bg-[#E5E9E2]"
              />

              {column_recommendations
                .filter((rec: any) => {
                  if (activeFilter === "all") return true;
                  if (activeFilter === "critical") return rec.severity === "critical";
                  if (activeFilter === "high") return rec.severity === "high";
                  if (activeFilter === "medium") return rec.severity === "medium";
                  if (activeFilter === "low_info") return rec.severity === "low" || rec.severity === "info";
                  return true;
                })
                .map((rec: any, idx: number) => {
                const isExpanded = expandedIndex === idx;
                const confidencePct = Math.round(rec.confidence_score * 100);
                const sev = getSevStyle(rec.severity);

                return (
                  <div key={idx} className="relative">
                    {/* Timeline dot */}
                    <div
                      className="absolute -left-5 top-[22px] w-[15px] h-[15px] rounded-full flex items-center justify-center z-10 bg-white"
                      style={{ border: `2px solid ${sev.dot}` }}
                    >
                      <div
                        className="w-[5px] h-[5px] rounded-full"
                        style={{ background: sev.dot }}
                      />
                    </div>

                    {/* Recommendation Card */}
                    <div className="rounded-2xl overflow-hidden bg-white border border-[#E5E9E2] shadow-[0_1px_3px_rgba(38,51,45,0.03)] hover:border-[#D6DCD3] transition-all duration-150">
                      {/* Card Header Button */}
                      <button
                        onClick={() => toggleExpand(idx)}
                        className="w-full text-left px-5 py-4 flex items-center justify-between gap-4 cursor-pointer hover:bg-[#FAFBF9] transition-colors"
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
                            <p className="text-[15.5px] font-bold text-[#26332D] truncate leading-snug">
                              {rec.column_name}
                            </p>
                            <p className="text-[13px] text-[#64736A] truncate mt-0.5">
                              {rec.issue}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-5 flex-shrink-0">
                          {/* Confidence Indicator */}
                          <div className="hidden sm:flex items-center gap-2.5">
                            <span className="text-[11.5px] text-[#78827A] font-medium">
                              Confidence
                            </span>
                            <span className="text-[13px] font-mono font-bold text-[#26332D]">
                              {confidencePct}%
                            </span>
                            <div className="w-16 h-[5px] rounded-full overflow-hidden bg-[#EEF2EB]">
                              <div
                                className="h-full rounded-full transition-all duration-300"
                                style={{
                                  width: `${confidencePct}%`,
                                  background: confidencePct >= 80 ? "#2A7E4F" : confidencePct >= 50 ? "#D97706" : "#78827A",
                                }}
                              />
                            </div>
                          </div>

                          {isExpanded ? (
                            <ChevronUp className="w-4 h-4 text-[#78827A]" />
                          ) : (
                            <ChevronDown className="w-4 h-4 text-[#78827A]" />
                          )}
                        </div>
                      </button>

                      {/* Expandable Details Container */}
                      {isExpanded && (
                        <div className="px-5 pb-4 pt-3 space-y-3.5 border-t border-[#E5E9E2] bg-[#FAFBF9] fade-in">
                          {/* Suggested Action Callout */}
                          <div className="p-4 rounded-xl bg-[#F1F6EC] border border-[#DCE8DC]">
                            <div className="flex items-center gap-2 mb-1.5">
                              <Zap className="w-3.5 h-3.5 text-[#26332D]" />
                              <p className="text-[11px] font-bold text-[#26332D] uppercase tracking-[0.12em]">
                                Recommended Preprocessing Action
                              </p>
                            </div>
                            <p className="text-[14px] font-semibold text-[#26332D] leading-relaxed">
                              {rec.recommendation}
                            </p>
                          </div>

                          {/* Reasoning & Impact */}
                          <div>
                            <p className="text-[11px] font-bold text-[#78827A] uppercase tracking-[0.12em] mb-1">
                              Impact &amp; Rationale
                            </p>
                            <p className="text-[13.5px] text-[#64736A] leading-relaxed">
                              {rec.reason}
                            </p>
                          </div>

                          {/* Mobile Confidence Bar */}
                          <div className="sm:hidden flex items-center gap-2.5 pt-2 border-t border-[#E5E9E2]">
                            <span className="text-[11px] text-[#78827A]">Confidence</span>
                            <span className="text-[12.5px] font-mono font-bold text-[#26332D]">
                              {confidencePct}%
                            </span>
                            <div className="flex-1 h-[5px] rounded-full overflow-hidden bg-[#EEF2EB]">
                              <div
                                className="h-full rounded-full"
                                style={{
                                  width: `${confidencePct}%`,
                                  background: confidencePct >= 80 ? "#2A7E4F" : confidencePct >= 50 ? "#D97706" : "#78827A",
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

        {/* ── RIGHT: Analysis Snapshot Sidebar ── */}
        <div className="flex flex-col rounded-2xl bg-white border border-[#E5E9E2] shadow-[0_1px_3px_rgba(38,51,45,0.03)] lg:sticky lg:top-4 overflow-hidden">
          <div className="px-4 py-3.5 flex items-center gap-2 border-b border-[#E5E9E2] bg-[#FAFBF9]">
            <Layers className="w-4 h-4 text-[#26332D]" />
            <h3 className="text-[14px] font-bold text-[#26332D]">
              Analysis Snapshot
            </h3>
          </div>

          <div className="p-4 space-y-4">
            {/* Task */}
            <div>
              <p className="text-[11px] font-bold text-[#78827A] uppercase tracking-[0.12em] mb-1.5">
                Detected Task
              </p>
              <span className="text-[13px] font-bold px-2.5 py-1 rounded-lg inline-block capitalize bg-[#F1F5EF] text-[#26332D] border border-[#E5E9E2]">
                {suggested_ml_task}
              </span>
            </div>

            <div className="h-px bg-[#EEF2EB]" />

            {/* Recommended Models */}
            <div>
              <p className="text-[11px] font-bold text-[#78827A] uppercase tracking-[0.12em] mb-2">
                Recommended Models
              </p>
              <div className="space-y-1.5">
                {suggested_models.map((m: string) => (
                  <div
                    key={m}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-[12.5px] bg-[#FAFBF9] border border-[#E5E9E2]"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-[#26332D]" />
                    <span className="font-semibold text-[#26332D]">{m}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="h-px bg-[#EEF2EB]" />

            {/* Severity Distribution */}
            <div>
              <p className="text-[11px] font-bold text-[#78827A] uppercase tracking-[0.12em] mb-2">
                Recommendations by Severity
              </p>
              <div className="space-y-2">
                {sevCounts.critical > 0 && (
                  <div className="flex items-center justify-between text-[13px]">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#DC2626]" />
                      <span className="text-[#26332D] font-medium">Critical</span>
                    </div>
                    <span className="font-mono font-bold text-[#DC2626]">{sevCounts.critical}</span>
                  </div>
                )}
                {sevCounts.high > 0 && (
                  <div className="flex items-center justify-between text-[13px]">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#EF4444]" />
                      <span className="text-[#26332D] font-medium">High</span>
                    </div>
                    <span className="font-mono font-bold text-[#EF4444]">{sevCounts.high}</span>
                  </div>
                )}
                {sevCounts.medium > 0 && (
                  <div className="flex items-center justify-between text-[13px]">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#D97706]" />
                      <span className="text-[#26332D] font-medium">Medium</span>
                    </div>
                    <span className="font-mono font-bold text-[#D97706]">{sevCounts.medium}</span>
                  </div>
                )}
                {sevCounts.low > 0 && (
                  <div className="flex items-center justify-between text-[13px]">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#65A30D]" />
                      <span className="text-[#26332D] font-medium">Low</span>
                    </div>
                    <span className="font-mono font-bold text-[#4D7C0F]">{sevCounts.low}</span>
                  </div>
                )}
                {sevCounts.info > 0 && (
                  <div className="flex items-center justify-between text-[13px]">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#64736A]" />
                      <span className="text-[#26332D] font-medium">Info</span>
                    </div>
                    <span className="font-mono font-bold text-[#64736A]">{sevCounts.info}</span>
                  </div>
                )}
                {column_recommendations.length === 0 && (
                  <div className="flex items-center gap-2 text-[12.5px] text-[#2A7E4F]">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span className="font-medium">No issues detected</span>
                  </div>
                )}
              </div>
            </div>

            <div className="h-px bg-[#EEF2EB]" />

            {/* Overall Warnings count */}
            <div className="flex items-center justify-between text-[12.5px]">
              <div className="flex items-center gap-2 text-[#64736A]">
                <ShieldAlert className="w-3.5 h-3.5 text-[#D97706]" />
                <span>Overall Warnings</span>
              </div>
              <span className="font-mono font-bold text-[#26332D]">{overall_warnings.length}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
