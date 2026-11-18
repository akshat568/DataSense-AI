import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDataset } from "../../core/context/DatasetContext";
import {
  getGlobalExplanations,
  getLocalExplanation,
} from "../../../services/api";
import {
  Play,
  BarChart3,
  Server,
  Sparkles,
  FileSpreadsheet,
  Brain,
  Trophy,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  Info,
} from "lucide-react";

/* ── Types ───────────────────────────────────────────────────── */
interface FeatureImportance {
  feature: string;
  importance: number;
}

interface GlobalExplanation {
  status: string;
  task: string;
  expected_value: number;
  feature_importance: FeatureImportance[];
}

interface ShapValue {
  feature: string;
  value: number | string;
  contribution: number;
}

interface LocalExplanation {
  status: string;
  prediction: string | number;
  prediction_probability: number | null;
  expected_value: number;
  shap_values: ShapValue[];
  ai_explanation: {
    prediction: string;
    drivers: string;
    confidence: string;
  };
}

/* ── Helpers ─────────────────────────────────────────────────── */
function cleanFeatureName(name: string): string {
  if (!name) return "";
  return name.replace(/^(num|cat|date|datetime)__/, "");
}

function fmt(v: unknown, decimals = 4): string {
  if (v == null) return "N/A";
  const n = typeof v === "number" ? v : Number(v);
  if (!Number.isFinite(n)) return "N/A";
  return n.toFixed(decimals);
}

function getImpactLabel(rank: number, max: number): string {
  const ratio = rank / max;
  if (ratio <= 0.2) return "Primary";
  if (ratio <= 0.4) return "High";
  if (ratio <= 0.6) return "Moderate";
  if (ratio <= 0.8) return "Low";
  return "Minimal";
}

function getImpactBadgeStyle(rank: number, max: number): { bg: string; text: string; border: string } {
  const ratio = rank / max;
  if (ratio <= 0.2) return { bg: "#F3FCD7", text: "#28440D", border: "#D2F775" };
  if (ratio <= 0.4) return { bg: "#EDF7F1", text: "#166534", border: "#BCE2CC" };
  if (ratio <= 0.6) return { bg: "#F1F5EF", text: "#26332D", border: "#E5E9E2" };
  return { bg: "#FAFBF9", text: "#78827A", border: "#E5E9E2" };
}

/* ── Loading Skeleton ────────────────────────────────────────── */
function LoadingSkeleton() {
  return (
    <div className="flex flex-col gap-6 fade-in">
      <div className="h-16 rounded-2xl skeleton w-1/3" />
      <div className="grid grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="h-20 rounded-2xl skeleton" />)}
      </div>
      <div className="h-72 rounded-2xl skeleton" />
    </div>
  );
}

/* ── Main Component ──────────────────────────────────────────── */
export function ExplainabilityPage() {
  const {
    sessionId,
    modelResults,
    datasetInfo,
    globalExplanations,
    setGlobalExplanations,
    isExplainabilityLoading,
    setIsExplainabilityLoading,
  } = useDataset();
  const navigate = useNavigate();

  const [generateError, setGenerateError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"global" | "local">("global");
  const [localResult, setLocalResult] = useState<LocalExplanation | null>(null);
  const [selectedRow, setSelectedRow] = useState<number | null>(null);
  const [isLocalLoading, setIsLocalLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);
  const [rowInput, setRowInput] = useState<string>("0");
  const [expandedFeatures, setExpandedFeatures] = useState(false);

  const handleGenerateGlobal = async () => {
    if (!sessionId) return;
    setIsExplainabilityLoading(true);
    setGenerateError(null);
    try {
      const r = await getGlobalExplanations(sessionId);
      setGlobalExplanations(r);
    } catch (e: any) {
      const msg = e?.response?.data?.detail || e?.message || "Failed to generate explainability.";
      setGenerateError(msg);
    } finally {
      setIsExplainabilityLoading(false);
    }
  };

  const handleLocalExplain = async () => {
    if (!sessionId) return;
    const idx = parseInt(rowInput, 10);
    if (!Number.isFinite(idx) || idx < 0) {
      setLocalError("Enter a valid non-negative row index.");
      return;
    }
    setSelectedRow(idx);
    setLocalResult(null);
    setLocalError(null);
    setIsLocalLoading(true);
    try {
      const res = await getLocalExplanation(sessionId, idx);
      setLocalResult(res);
    } catch (e: any) {
      const msg = e?.response?.data?.detail || e?.message || "Failed to load local explanation.";
      setLocalError(msg);
    } finally {
      setIsLocalLoading(false);
    }
  };

  /* ── Loading state ── */
  if (isExplainabilityLoading) return <LoadingSkeleton />;

  /* ── No session ── */
  if (!sessionId) {
    return (
      <div className="flex flex-col gap-6 fade-in">
        <PageHeader />
        <EmptyCard
          icon={<Server className="w-8 h-8 text-[#26332D]" strokeWidth={1.75} />}
          title="No Active Session"
          description="Upload a dataset on the Dashboard to begin your analysis."
          action={{ label: "Go to Dashboard", onClick: () => navigate("/") }}
        />
      </div>
    );
  }

  /* ── No trained model ── */
  if (!modelResults) {
    return (
      <div className="flex flex-col gap-6 fade-in">
        <PageHeader />
        <EmptyCard
          icon={<BarChart3 className="w-8 h-8 text-[#26332D]" strokeWidth={1.75} />}
          title="Baseline Model Required"
          description="Run baseline model training before generating SHAP explainability analysis."
          action={{ label: "Go to Baseline Models", onClick: () => navigate("/models") }}
        />
      </div>
    );
  }

  /* ── No explainability yet ── */
  if (!globalExplanations) {
    return (
      <div className="flex flex-col gap-6 fade-in">
        <PageHeader />
        <div className="py-16 px-8 flex flex-col items-center text-center rounded-2xl bg-white border border-[#E5E9E2] shadow-[0_1px_3px_rgba(38,51,45,0.03)]">
          <div className="w-16 h-16 rounded-2xl bg-[#F1F5EF] border border-[#E5E9E2] flex items-center justify-center mb-4 text-[#26332D]">
            <Sparkles className="w-8 h-8 text-[#26332D]" strokeWidth={1.75} />
          </div>
          <h3 className="text-[20px] font-bold text-[#26332D] mb-1">
            Explainability Not Yet Computed
          </h3>
          <p className="text-[14px] text-[#64736A] max-w-md leading-relaxed mb-6">
            Generate SHAP (SHapley Additive exPlanations) values to discover which features exert the greatest influence over your baseline model's predictions.
          </p>

          {generateError && (
            <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl text-[13px] mb-5 max-w-md text-left bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626]">
              <span className="leading-relaxed">{generateError}</span>
            </div>
          )}

          <button
            onClick={handleGenerateGlobal}
            disabled={isExplainabilityLoading}
            className="btn btn-primary gap-2"
            style={{
              height: "44px",
              paddingInline: "22px",
              fontSize: "14px",
              boxShadow: "0 2px 8px rgba(184, 243, 74, 0.4)",
            }}
          >
            <Play className="w-4 h-4 fill-current" />
            Generate Explainability
          </button>
        </div>
      </div>
    );
  }

  /* ══════════════════════════════════════════════════════════════
     FULL EXPLAINABILITY VIEW
     ══════════════════════════════════════════════════════════════ */
  const gx: GlobalExplanation = globalExplanations;
  const sortedFeatures = [...gx.feature_importance].sort(
    (a, b) => b.importance - a.importance
  );
  const maxImportance = sortedFeatures[0]?.importance ?? 1;
  const topFeature = sortedFeatures[0];
  const displayFeatures = expandedFeatures ? sortedFeatures : sortedFeatures.slice(0, 8);

  const bestModelName = modelResults?.best_model?.name ?? "N/A";
  const filename = datasetInfo?.filename ?? gx.task ?? "Dataset";

  return (
    <div className="flex flex-col gap-6 fade-in pb-10">
      {/* ── Page Header ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-[#E5E9E2]">
        <div>
          <h1 className="text-[28px] sm:text-[32px] font-extrabold text-[#26332D] tracking-tight leading-tight">
            AI Explainability
          </h1>
          <p className="text-[14px] text-[#64736A] mt-1">
            Understand global feature importance and individual prediction drivers using SHAP.
          </p>
        </div>
        <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-[13px] bg-white border border-[#E5E9E2] shadow-xs flex-shrink-0">
          <div className="w-2 h-2 rounded-full bg-[#2A7E4F]" />
          <FileSpreadsheet className="w-4 h-4 text-[#26332D]" />
          <span className="font-mono font-semibold text-[#26332D]">{filename}</span>
          <span className="text-[#C4CCC2]">·</span>
          <span className="text-[#64736A] capitalize">{gx.task}</span>
          <span className="text-[#C4CCC2]">·</span>
          <span className="text-[#26332D] font-medium">{bestModelName}</span>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Model Architecture",
            value: bestModelName,
            mono: false,
          },
          {
            label: "Features Explained",
            value: String(gx.feature_importance.length),
            mono: true,
          },
          {
            label: "Top Influential Feature",
            value: topFeature ? cleanFeatureName(topFeature.feature) : "N/A",
            mono: false,
          },
          {
            label: "Explainability Method",
            value: "TreeSHAP / KernelSHAP",
            mono: false,
          },
        ].map((k) => (
          <div
            key={k.label}
            className="rounded-2xl p-5 bg-white border border-[#E5E9E2] shadow-[0_1px_3px_rgba(38,51,45,0.03)]"
          >
            <p className="text-[11px] font-bold text-[#78827A] uppercase tracking-[0.14em] mb-2">
              {k.label}
            </p>
            <p
              className={`text-[19px] sm:text-[21px] font-bold tracking-tight text-[#26332D] leading-snug truncate ${
                k.mono ? "font-mono" : ""
              }`}
              title={k.value}
            >
              {k.value}
            </p>
          </div>
        ))}
      </div>

      {/* ── Tabs Toggle ── */}
      <div className="flex gap-1.5 p-1 rounded-xl w-fit bg-[#EEF2EB] border border-[#E5E9E2]">
        {(["global", "local"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-[13px] font-semibold transition-all duration-150 cursor-pointer ${
              activeTab === tab
                ? "bg-[#26332D] text-white shadow-xs"
                : "text-[#64736A] hover:text-[#26332D]"
            }`}
          >
            {tab === "global" ? "Global Feature Importance" : "Local Prediction Explorer"}
          </button>
        ))}
      </div>

      {/* ═══════════════════════════════════════════════════════════
          GLOBAL TAB
          ═══════════════════════════════════════════════════════════ */}
      {activeTab === "global" && (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 items-start">
          {/* LEFT: Feature Importance Chart */}
          <div className="flex flex-col gap-4">
            <div className="rounded-2xl overflow-hidden bg-white border border-[#E5E9E2] shadow-[0_1px_3px_rgba(38,51,45,0.03)]">
              {/* Card Header */}
              <div className="px-6 py-4 flex items-center justify-between border-b border-[#E5E9E2] bg-white">
                <div className="flex items-center gap-2.5">
                  <Brain className="w-5 h-5 text-[#26332D]" />
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-[15.5px] font-bold text-[#26332D]">
                        Global Feature Importance (Mean |SHAP|)
                      </h2>
                      <div className="group relative inline-block">
                        <Info className="w-3.5 h-3.5 text-[#78827A] hover:text-[#26332D] cursor-help" />
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-56 p-2.5 bg-[#26332D] text-white text-[11px] rounded-lg shadow-lg z-50 text-center leading-normal">
                          Mean absolute SHAP value across all records. Higher values signify features with greater overall impact on predictions.
                        </div>
                      </div>
                    </div>
                    <p className="text-[12px] text-[#64736A] mt-0.5">
                      Average magnitude of impact across the complete dataset.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-[#64736A] bg-[#F1F5EF] border border-[#E5E9E2] px-2.5 py-0.5 rounded-md font-mono">
                    Scale: {gx.task?.includes("Regression") ? "Target space" : "Log-odds"}
                  </span>
                  <button
                    onClick={handleGenerateGlobal}
                    title="Regenerate explainability"
                    className="p-1.5 rounded-lg text-[#78827A] hover:text-[#26332D] hover:bg-[#F1F5EF] transition-colors"
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Chart List */}
              <div className="p-6 space-y-3">
                {displayFeatures.map((f, i) => {
                  const pct = maxImportance > 0 ? (f.importance / maxImportance) * 100 : 0;
                  const isTop = i === 0;

                  return (
                    <div key={f.feature} className="flex items-center gap-3">
                      <span className="text-[11.5px] font-mono text-[#78827A] w-5 text-right flex-shrink-0">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span
                        className={`text-[13px] w-[160px] sm:w-[210px] truncate flex-shrink-0 ${
                          isTop ? "text-[#26332D] font-bold" : "text-[#26332D] font-medium"
                        }`}
                        title={cleanFeatureName(f.feature)}
                      >
                        {isTop && <Trophy className="w-3.5 h-3.5 text-[#B45309] inline mr-1.5 mb-0.5" />}
                        {cleanFeatureName(f.feature)}
                      </span>

                      <div className="flex-1 h-[8px] rounded-full overflow-hidden bg-[#EEF2EB]">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.max(pct, 1.5)}%`,
                            backgroundColor: isTop ? "#26332D" : i < 3 ? "#4E6157" : "#8EA196",
                          }}
                        />
                      </div>

                      <span className="text-[12.5px] font-mono font-bold text-[#26332D] w-16 text-right flex-shrink-0">
                        {fmt(f.importance)}
                      </span>
                    </div>
                  );
                })}

                {sortedFeatures.length > 8 && (
                  <button
                    onClick={() => setExpandedFeatures(!expandedFeatures)}
                    className="flex items-center gap-1.5 text-[12.5px] text-[#26332D] font-bold mt-2 hover:underline cursor-pointer pt-2"
                  >
                    {expandedFeatures ? (
                      <><ChevronUp className="w-3.5 h-3.5" />Show less</>
                    ) : (
                      <><ChevronDown className="w-3.5 h-3.5" />Show all {sortedFeatures.length} features</>
                    )}
                  </button>
                )}
              </div>
            </div>

            {/* Model Interpretation Callout */}
            {topFeature && (
              <div className="p-5 rounded-2xl bg-[#F1F6EC] border border-[#DCE8DC] flex items-start gap-3.5">
                <Sparkles className="w-5 h-5 text-[#26332D] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-[11px] font-bold text-[#26332D] uppercase tracking-[0.14em] mb-1">
                    Explainability Insights
                  </p>
                  <p className="text-[13.5px] text-[#26332D] leading-relaxed">
                    <span className="font-bold underline decoration-[#B8F34A] decoration-2">{cleanFeatureName(topFeature.feature)}</span> is the strongest single predictor for <span className="font-semibold">{bestModelName}</span>, with an average SHAP importance value of <span className="font-mono font-bold">{fmt(topFeature.importance)}</span>.
                    {sortedFeatures.length > 1 && (
                      <> The top 2 features explain approximately{" "}
                      <span className="font-mono font-bold">
                        {fmt(
                          (sortedFeatures.slice(0, 2).reduce((s, f) => s + f.importance, 0) /
                          sortedFeatures.reduce((s, f) => s + f.importance, 0)) * 100,
                          1
                        )}%
                      </span>{" "}
                      of total predictive weight across the dataset.</>
                    )}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: Feature Ranking Sidebar */}
          <div className="rounded-2xl overflow-hidden bg-white border border-[#E5E9E2] shadow-[0_1px_3px_rgba(38,51,45,0.03)] lg:sticky lg:top-4">
            <div className="px-5 py-4 border-b border-[#E5E9E2] bg-white">
              <h3 className="text-[14.5px] font-bold text-[#26332D]">
                Feature Impact Ranking
              </h3>
            </div>
            <div className="p-4 space-y-2">
              {sortedFeatures.slice(0, 10).map((f, i) => {
                const badge = getImpactBadgeStyle(i, sortedFeatures.length - 1);
                return (
                  <div
                    key={f.feature}
                    className="flex items-center gap-2.5 p-2.5 rounded-xl bg-[#FAFBF9] border border-[#EEF2EB]"
                  >
                    <span className="text-[11px] font-mono font-bold w-5 text-center text-[#78827A] flex-shrink-0">
                      #{i + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-semibold text-[#26332D] truncate" title={cleanFeatureName(f.feature)}>
                        {cleanFeatureName(f.feature)}
                      </p>
                      <span
                        className="inline-block text-[9.5px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded mt-0.5"
                        style={{ background: badge.bg, color: badge.text, border: `1px solid ${badge.border}` }}
                      >
                        {getImpactLabel(i, sortedFeatures.length - 1)}
                      </span>
                    </div>
                    <span className="text-[12px] font-mono font-bold text-[#26332D] flex-shrink-0">
                      {fmt(f.importance)}
                    </span>
                  </div>
                );
              })}
              {sortedFeatures.length > 10 && (
                <p className="text-[11.5px] text-[#78827A] text-center pt-1 font-medium">
                  +{sortedFeatures.length - 10} additional features
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          LOCAL TAB
          ═══════════════════════════════════════════════════════════ */}
      {activeTab === "local" && (
        <div className="flex flex-col gap-5">
          {/* Row Index Selector Box */}
          <div className="p-5 rounded-2xl bg-white border border-[#E5E9E2] shadow-[0_1px_3px_rgba(38,51,45,0.03)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <p className="text-[14.5px] font-bold text-[#26332D]">
                Individual Prediction Explanation
              </p>
              <p className="text-[13px] text-[#64736A] mt-0.5">
                Specify any dataset row index to calculate its exact SHAP feature contribution waterfall.
              </p>
            </div>

            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-medium text-[#64736A]">Row #</span>
                <input
                  type="number"
                  min="0"
                  value={rowInput}
                  onChange={(e) => setRowInput(e.target.value)}
                  className="w-20 text-center font-mono text-[13px] rounded-xl px-2 py-1.5 bg-[#FAFBF9] border border-[#E5E9E2] text-[#26332D] outline-none focus:border-[#26332D]"
                  onKeyDown={(e) => e.key === "Enter" && handleLocalExplain()}
                />
              </div>
              <button
                onClick={handleLocalExplain}
                disabled={isLocalLoading}
                className="btn btn-primary gap-2"
                style={{ height: "38px", paddingInline: "18px", fontSize: "13px" }}
              >
                {isLocalLoading ? (
                  <div className="w-4 h-4 border-2 border-[#26332D]/30 border-t-[#26332D] rounded-full animate-spin" />
                ) : (
                  <Play className="w-3.5 h-3.5 fill-current" />
                )}
                Explain Prediction
              </button>
            </div>
          </div>

          {/* Local Error */}
          {localError && (
            <div className="flex items-center gap-2.5 px-4 py-3 rounded-xl text-[13px] bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626]">
              <span className="leading-relaxed">{localError}</span>
              <button onClick={handleLocalExplain} className="ml-auto font-semibold hover:underline flex items-center gap-1 flex-shrink-0">
                <RefreshCw className="w-3.5 h-3.5" /> Retry
              </button>
            </div>
          )}

          {/* Local Loading indicator */}
          {isLocalLoading && (
            <div className="flex items-center gap-3 py-6 px-4 bg-white rounded-2xl border border-[#E5E9E2]">
              <div className="w-5 h-5 border-2 border-[#E5E9E2] border-t-[#26332D] rounded-full animate-spin" />
              <p className="text-[13px] text-[#64736A]">
                Evaluating SHAP waterfall vectors for row index #{selectedRow}…
              </p>
            </div>
          )}

          {/* Local Result Breakdown */}
          {localResult && !isLocalLoading && (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-6 fade-in items-start">
              {/* SHAP Waterfall Plot */}
              <div className="rounded-2xl overflow-hidden bg-white border border-[#E5E9E2] shadow-[0_1px_3px_rgba(38,51,45,0.03)]">
                <div className="px-6 py-4 border-b border-[#E5E9E2] bg-white flex items-center justify-between">
                  <div>
                    <h2 className="text-[15.5px] font-bold text-[#26332D]">
                      SHAP Contribution Waterfall — Row #{selectedRow}
                    </h2>
                    <p className="text-[12px] text-[#64736A] mt-0.5">
                      Base Value: <span className="font-mono text-[#26332D] font-bold">{fmt(localResult.expected_value, 3)}</span>
                      {" → "}Prediction:{" "}
                      <span className="font-mono font-bold text-[#26332D]">
                        {typeof localResult.prediction === "number"
                          ? fmt(localResult.prediction, 3)
                          : String(localResult.prediction)}
                      </span>
                    </p>
                  </div>
                  <span className="text-[11px] text-[#64736A] bg-[#F1F5EF] border border-[#E5E9E2] px-2 py-0.5 rounded font-mono">
                    Row #{selectedRow}
                  </span>
                </div>

                <div className="p-6">
                  {/* Summary Metric Strip */}
                  <div className="grid grid-cols-3 gap-3 p-3.5 rounded-xl bg-[#FAFBF9] border border-[#E5E9E2] mb-5">
                    <div>
                      <p className="text-[10.5px] font-bold text-[#78827A] uppercase tracking-[0.1em]">
                        Predicted Class
                      </p>
                      <p className="text-[15px] font-bold text-[#26332D] mt-0.5 font-mono">
                        {String(localResult.prediction)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10.5px] font-bold text-[#78827A] uppercase tracking-[0.1em]">
                        Confidence
                      </p>
                      <p className="text-[15px] font-bold text-[#2A7E4F] font-mono mt-0.5">
                        {localResult.prediction_probability != null
                          ? `${(localResult.prediction_probability * 100).toFixed(1)}%`
                          : "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10.5px] font-bold text-[#78827A] uppercase tracking-[0.1em]">
                        Row Record
                      </p>
                      <p className="text-[15px] font-bold text-[#26332D] font-mono mt-0.5">
                        #{selectedRow}
                      </p>
                    </div>
                  </div>

                  {/* Direction Legend */}
                  <div className="flex items-center justify-between text-[11.5px] text-[#64736A] mb-3 px-1">
                    <span className="flex items-center gap-1.5 font-medium text-[#B45309]">
                      <span className="w-2.5 h-1.5 rounded-full bg-[#D97706]" />
                      ← Decreases prediction
                    </span>
                    <span className="flex items-center gap-1.5 font-medium text-[#166534]">
                      Increases prediction →
                      <span className="w-2.5 h-1.5 rounded-full bg-[#2A7E4F]" />
                    </span>
                  </div>

                  {/* Waterfall Bars */}
                  <div className="space-y-3">
                    {[...localResult.shap_values]
                      .sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution))
                      .slice(0, 12)
                      .map((s) => {
                        const isPos = s.contribution >= 0;
                        const maxCont = Math.max(
                          ...localResult.shap_values.map((x) => Math.abs(x.contribution)),
                          0.0001
                        );
                        const pct = (Math.abs(s.contribution) / maxCont) * 100;

                        return (
                          <div key={s.feature} className="flex items-center gap-3">
                            <span
                              className="text-[12.5px] text-[#26332D] font-semibold w-[140px] sm:w-[190px] truncate flex-shrink-0"
                              title={cleanFeatureName(s.feature)}
                            >
                              {cleanFeatureName(s.feature)}
                            </span>

                            <span className="text-[11px] font-mono text-[#78827A] w-14 truncate flex-shrink-0">
                              {typeof s.value === "number" ? fmt(s.value, 2) : String(s.value)}
                            </span>

                            {/* Centered zero-axis dual progress bar */}
                            <div className="flex-1 flex h-[8px] rounded-full overflow-hidden bg-[#EEF2EB]">
                              {/* Negative side (left) */}
                              <div className="w-1/2 flex justify-end">
                                {!isPos && (
                                  <div
                                    className="h-full rounded-l-full"
                                    style={{ width: `${pct}%`, backgroundColor: "#D97706" }}
                                  />
                                )}
                              </div>
                              <div className="w-[2px] bg-[#C4CCC2]" />
                              {/* Positive side (right) */}
                              <div className="w-1/2 flex justify-start">
                                {isPos && (
                                  <div
                                    className="h-full rounded-r-full"
                                    style={{ width: `${pct}%`, backgroundColor: "#2A7E4F" }}
                                  />
                                )}
                              </div>
                            </div>

                            <span
                              className="text-[12px] font-mono font-bold w-16 text-right flex-shrink-0"
                              style={{ color: isPos ? "#166534" : "#B45309" }}
                            >
                              {isPos ? "+" : ""}{fmt(s.contribution, 3)}
                            </span>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>

              {/* AI Prediction Explanation */}
              <div className="rounded-2xl overflow-hidden bg-white border border-[#E5E9E2] shadow-[0_1px_3px_rgba(38,51,45,0.03)] lg:sticky lg:top-4">
                <div className="px-5 py-4 border-b border-[#E5E9E2] bg-[#FAFBF9] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#26332D]" />
                  <h3 className="text-[14px] font-bold text-[#26332D]">
                    AI Prediction Explanation
                  </h3>
                </div>

                <div className="p-5 space-y-4">
                  {(() => {
                    const sortedLocal = [...localResult.shap_values].sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution));
                    const top3 = sortedLocal.slice(0, 3).map(s => cleanFeatureName(s.feature));
                    const posContributors = sortedLocal.filter(s => s.contribution > 0).slice(0, 2).map(s => cleanFeatureName(s.feature));
                    const negContributors = sortedLocal.filter(s => s.contribution < 0).slice(0, 2).map(s => cleanFeatureName(s.feature));
                    
                    const predictionLabel = String(localResult.prediction);
                    const predictionProb = localResult.prediction_probability;

                    let predSummary = "";
                    if (predictionProb != null) {
                      predSummary = `The model predicted class "${predictionLabel}" with ${(predictionProb * 100).toFixed(1)}% probability.`;
                    } else {
                      predSummary = `The model predicted output "${predictionLabel}".`;
                    }

                    const top3Str = top3.join(", ");
                    let driversText = `The prediction is driven primarily by ${top3Str}.`;
                    if (posContributors.length > 0) {
                      driversText += ` ${posContributors.join(" and ")} contributed positively toward the predicted output.`;
                    }
                    if (negContributors.length > 0) {
                      driversText += ` Conversely, ${negContributors.join(" and ")} pulled the prediction in the opposite direction.`;
                    }

                    let confidenceText = "";
                    if (predictionProb != null) {
                      if (predictionProb > 0.8) {
                        confidenceText = "High confidence prediction backed by strong concordant feature contributions.";
                      } else if (predictionProb > 0.6) {
                        confidenceText = "Moderate confidence prediction with balanced feature competition.";
                      } else {
                        confidenceText = "Low confidence prediction. Contradictory drivers detected.";
                      }
                    } else {
                      confidenceText = "Continuous output from regression baseline architecture.";
                    }

                    return [
                      { label: "Prediction Summary", text: predSummary },
                      { label: "Key Feature Drivers", text: driversText },
                      { label: "Confidence Assessment", text: confidenceText },
                    ].map((sec) => (
                      <div key={sec.label} className="p-3.5 rounded-xl bg-[#FAFBF9] border border-[#EEF2EB]">
                        <p className="text-[10.5px] font-bold text-[#78827A] uppercase tracking-[0.1em] mb-1">
                          {sec.label}
                        </p>
                        <p className="text-[13px] text-[#26332D] leading-relaxed">
                          {sec.text}
                        </p>
                      </div>
                    ));
                  })()}
                </div>
              </div>
            </div>
          )}

          {/* Empty local state */}
          {!localResult && !isLocalLoading && !localError && (
            <div className="py-12 flex flex-col items-center text-center rounded-2xl bg-white border border-dashed border-[#D6DCD3]">
              <p className="text-[13.5px] text-[#64736A]">
                Input a valid row index above and click <strong className="text-[#26332D]">Explain Prediction</strong> to view individual feature forces.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Sub-components ──────────────────────────────────────────── */
function PageHeader() {
  return (
    <div className="flex flex-col gap-1 pb-5 border-b border-[#E5E9E2]">
      <h1 className="text-[28px] sm:text-[32px] font-extrabold text-[#26332D] tracking-tight">
        AI Explainability
      </h1>
      <p className="text-[14px] text-[#64736A]">
        Understand which features drive your model's predictions.
      </p>
    </div>
  );
}

function EmptyCard({
  icon,
  title,
  description,
  action,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
}) {
  return (
    <div className="py-16 px-8 flex flex-col items-center text-center rounded-2xl bg-white border border-[#E5E9E2] shadow-[0_1px_3px_rgba(38,51,45,0.03)]">
      <div className="w-16 h-16 rounded-2xl bg-[#F1F5EF] border border-[#E5E9E2] flex items-center justify-center mb-4 text-[#26332D]">
        {icon}
      </div>
      <h3 className="text-[18px] font-bold text-[#26332D] mb-1">{title}</h3>
      <p className="text-[14px] text-[#64736A] max-w-sm leading-relaxed mb-6">{description}</p>
      {action && (
        <button onClick={action.onClick} className="btn btn-primary gap-2" style={{ fontSize: "14px", height: "42px", padding: "0 20px" }}>
          {action.label}
        </button>
      )}
    </div>
  );
}
