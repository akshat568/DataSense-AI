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
  if (ratio <= 0.2) return "Very High";
  if (ratio <= 0.4) return "High";
  if (ratio <= 0.6) return "Moderate";
  if (ratio <= 0.8) return "Low";
  return "Minimal";
}

function getImpactColor(rank: number, max: number): string {
  const ratio = rank / max;
  if (ratio <= 0.2) return "#7C5CFC";
  if (ratio <= 0.4) return "#A78BFA";
  if (ratio <= 0.6) return "#9DA0A8";
  if (ratio <= 0.8) return "#6B6E76";
  return "#4A4C52";
}

/* ── Loading Skeleton ────────────────────────────────────────── */
function LoadingSkeleton() {
  return (
    <div className="flex flex-col gap-6 fade-in">
      <div className="h-16 rounded-xl skeleton w-1/3" />
      <div className="grid grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => <div key={i} className="h-20 rounded-xl skeleton" />)}
      </div>
      <div className="h-72 rounded-xl skeleton" />
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
          icon={<Server className="w-7 h-7 text-[#7C5CFC]" strokeWidth={1.5} />}
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
          icon={<BarChart3 className="w-7 h-7 text-[#7C5CFC]" strokeWidth={1.5} />}
          title="Model Required"
          description="Run baseline model training before generating explainability analysis."
          action={{ label: "Go to Baseline Models", onClick: () => navigate("/models") }}
        />
      </div>
    );
  }

  /* ── No explainability yet ── */
  if (!globalExplanations) {
    return (
      <div className="flex flex-col gap-6 fade-in">
        <PageHeader modelResults={modelResults} datasetInfo={datasetInfo} />
        <div
          className="py-14 px-8 flex flex-col items-center text-center rounded-xl"
          style={{ background: "#1E1F22", border: "1px solid #28292E" }}
        >
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: "rgba(124, 92, 252, 0.08)", border: "1px solid rgba(124, 92, 252, 0.20)" }}
          >
            <Sparkles className="w-6 h-6 text-[#7C5CFC]" strokeWidth={1.5} />
          </div>
          <h3 className="text-[18px] font-bold text-[#E8E9ED] mb-1">
            Explainability Not Generated
          </h3>
          <p className="text-[14px] text-[#9DA0A8] max-w-md leading-relaxed mb-6">
            Generate a SHAP explanation to understand which features drive your model's predictions.
          </p>

          {generateError && (
            <div
              className="flex items-start gap-2.5 px-4 py-3 rounded-lg text-[13px] mb-4 max-w-md text-left"
              style={{ background: "rgba(239, 68, 68, 0.06)", border: "1px solid rgba(239, 68, 68, 0.20)" }}
            >
              <span className="text-[#F87171] leading-relaxed">{generateError}</span>
            </div>
          )}

          <button
            onClick={handleGenerateGlobal}
            disabled={isExplainabilityLoading}
            className="btn btn-primary gap-2"
          >
            <Play className="w-4 h-4" />
            Generate Explainability
          </button>
        </div>
      </div>
    );
  }

  /* ══════════════════════════════════════════════════════════════
     FULL RESULTS VIEW
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
      {/* ─── HEADER ─────────────────────────────────────────────── */}
      <div
        className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5"
        style={{ borderBottom: "1px solid #28292E" }}
      >
        <div>
          <h1 className="text-[30px] font-extrabold text-[#E8E9ED] tracking-tight leading-tight">
            AI Explainability
          </h1>
          <p className="text-[15px] text-[#9DA0A8] mt-1">
            Understand which features drive your model's predictions.
          </p>
        </div>
        <div
          className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-[13px] flex-shrink-0"
          style={{ background: "#1E1F22", border: "1px solid #28292E" }}
        >
          <div className="w-2 h-2 rounded-full bg-[#3ECF71]" />
          <FileSpreadsheet className="w-4 h-4 text-[#7C5CFC]" />
          <span className="font-mono font-semibold text-[#E8E9ED]">{filename}</span>
          <span className="text-[#4A4C52]">·</span>
          <span className="text-[#9DA0A8] capitalize">{gx.task}</span>
          <span className="text-[#4A4C52]">·</span>
          <span className="text-[#9DA0A8]">{bestModelName}</span>
        </div>
      </div>

      {/* ─── KPI CARDS ──────────────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Model",
            value: bestModelName,
            mono: false,
            accent: "default" as const,
          },
          {
            label: "Features Explained",
            value: String(gx.feature_importance.length),
            mono: true,
            accent: "purple" as const,
          },
          {
            label: "Top Feature",
            value: topFeature ? cleanFeatureName(topFeature.feature) : "N/A",
            mono: false,
            accent: "default" as const,
          },
          {
            label: "Explanation Method",
            value: "SHAP",
            mono: false,
            accent: "default" as const,
          },
        ].map((k) => (
          <div
            key={k.label}
            className="rounded-xl p-5"
            style={{ background: "#1E1F22", border: "1px solid #28292E" }}
          >
            <p className="text-[11px] font-bold text-[#6B6E76] uppercase tracking-[0.1em] mb-2">
              {k.label}
            </p>
            <p
              className={`text-[20px] font-bold tracking-tight leading-snug ${
                k.mono ? "font-mono" : ""
              } ${
                k.accent === "purple"
                  ? "text-[#7C5CFC]"
                  : "text-[#E8E9ED]"
              }`}
            >
              {k.value}
            </p>
          </div>
        ))}
      </div>

      {/* ─── TABS ───────────────────────────────────────────────── */}
      <div className="flex gap-1 p-1 rounded-xl w-fit" style={{ background: "#191A1D", border: "1px solid #28292E" }}>
        {(["global", "local"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className="px-4 py-2 rounded-lg text-[13px] font-semibold transition-colors duration-100"
            style={
              activeTab === tab
                ? { background: "#7C5CFC", color: "#fff" }
                : { color: "#9DA0A8" }
            }
          >
            {tab === "global" ? "Global Explanation" : "Local Explanation"}
          </button>
        ))}
      </div>

      {/* ═══════════════════════════════════════════════════════════
          GLOBAL TAB
          ═══════════════════════════════════════════════════════════ */}
      {activeTab === "global" && (
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-6 items-start">
          {/* LEFT: Feature Importance Chart */}
          <div className="flex flex-col gap-4">
            {/* Chart Card */}
            <div
              className="rounded-xl overflow-hidden"
              style={{ background: "#1E1F22", border: "1px solid #28292E" }}
            >
              <div
                className="px-5 py-4 flex items-center justify-between"
                style={{ borderBottom: "1px solid #28292E", background: "#191A1D" }}
              >
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-[#7C5CFC]" />
                  <div>
                    <div className="flex items-center gap-2">
                      <h2 className="text-[15px] font-bold text-[#E8E9ED]">
                        Global Feature Importance (SHAP)
                      </h2>
                      <div className="group relative inline-block">
                        <Info className="w-3.5 h-3.5 text-[#6B6E76] hover:text-[#7C5CFC] cursor-help" />
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-52 p-2.5 bg-[#202024] border border-[#2C2C33] text-[11px] text-[#9DA0A8] rounded shadow-lg z-50 text-center leading-normal">
                          SHAP values measure how much each feature contributes to model predictions. Larger absolute values indicate greater influence.
                        </div>
                      </div>
                    </div>
                    <p className="text-[12px] text-[#6B6E76] mt-0.5">
                      Mean absolute SHAP values across all dataset records — higher = more influential.
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-[#6B6E76] border border-[#232328] px-2 py-0.5 rounded font-mono">
                    Scale: {gx.task?.includes("Regression") ? "Target space" : "Log-odds space"}
                  </span>
                  <button
                    onClick={handleGenerateGlobal}
                    title="Regenerate"
                    className="p-1.5 rounded-lg transition-colors duration-100"
                    style={{ color: "#6B6E76" }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#7C5CFC")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "#6B6E76")}
                  >
                    <RefreshCw className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="p-5 space-y-2.5">
                {displayFeatures.map((f, i) => {
                  const pct = maxImportance > 0 ? (f.importance / maxImportance) * 100 : 0;
                  const isTop = i === 0;
                  return (
                    <div key={f.feature} className="flex items-center gap-3">
                      <span className="text-[11px] font-mono text-[#4A4C52] w-5 text-right flex-shrink-0">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span
                        className={`text-[13px] font-medium w-[160px] sm:w-[200px] truncate flex-shrink-0 ${
                          isTop ? "text-[#E8E9ED] font-semibold" : "text-[#C0C2C8]"
                        }`}
                        title={cleanFeatureName(f.feature)}
                      >
                        {isTop && <Trophy className="w-3 h-3 text-[#F59E0B] inline mr-1.5 mb-0.5" />}
                        {cleanFeatureName(f.feature)}
                      </span>
                      <div className="flex-1 h-[7px] rounded-full overflow-hidden" style={{ background: "#25262A" }}>
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${Math.max(pct, 1)}%`,
                            background: isTop ? "#7C5CFC" : i < 3 ? "#9D7EFC" : "#3A3B42",
                          }}
                        />
                      </div>
                      <span className="text-[12px] font-mono font-bold text-[#9DA0A8] w-16 text-right flex-shrink-0">
                        {fmt(f.importance)}
                      </span>
                    </div>
                  );
                })}

                {sortedFeatures.length > 8 && (
                  <button
                    onClick={() => setExpandedFeatures(!expandedFeatures)}
                    className="flex items-center gap-1.5 text-[12px] text-[#7C5CFC] mt-1 hover:underline"
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

            {/* Model Interpretation Card */}
            {topFeature && (
              <div
                className="px-5 py-4 rounded-xl flex items-start gap-3"
                style={{ background: "rgba(124, 92, 252, 0.05)", border: "1px solid rgba(124, 92, 252, 0.15)" }}
              >
                <Sparkles className="w-4 h-4 text-[#7C5CFC] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-[11px] font-bold text-[#7C5CFC] uppercase tracking-[0.08em] mb-1">
                    What Does This Mean?
                  </p>
                  <p className="text-[14px] text-[#9DA0A8] leading-relaxed">
                    <span className="text-[#E8E9ED] font-semibold">{cleanFeatureName(topFeature.feature)}</span> is the strongest
                    contributor to <span className="text-[#E8E9ED] font-semibold">{bestModelName}</span>'s
                    predictions, with a mean absolute SHAP value of{" "}
                    <span className="font-mono text-[#A78BFA]">{fmt(topFeature.importance)}</span>.
                    {sortedFeatures.length > 1 && (
                      <> The top 2 features account for approximately{" "}
                      <span className="font-mono text-[#A78BFA]">
                        {fmt(
                          (sortedFeatures.slice(0, 2).reduce((s, f) => s + f.importance, 0) /
                          sortedFeatures.reduce((s, f) => s + f.importance, 0)) * 100,
                          1
                        )}%
                      </span>{" "}
                      of total SHAP importance.</>
                    )}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT: Feature Ranking */}
          <div
            className="rounded-xl overflow-hidden lg:sticky lg:top-4"
            style={{ background: "#1E1F22", border: "1px solid #28292E" }}
          >
            <div
              className="px-4 py-3 flex items-center gap-2"
              style={{ borderBottom: "1px solid #28292E", background: "#191A1D" }}
            >
              <h3 className="text-[14px] font-bold text-[#E8E9ED]">
                Feature Ranking
              </h3>
            </div>
            <div className="p-4 space-y-2">
              {sortedFeatures.slice(0, 10).map((f, i) => (
                <div
                  key={f.feature}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg"
                  style={{ background: i === 0 ? "rgba(124, 92, 252, 0.07)" : "#191A1D" }}
                >
                  <span
                    className="text-[11px] font-mono font-bold w-5 text-center flex-shrink-0"
                    style={{ color: getImpactColor(i, sortedFeatures.length - 1) }}
                  >
                    #{i + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-[#E8E9ED] truncate" title={cleanFeatureName(f.feature)}>
                      {cleanFeatureName(f.feature)}
                    </p>
                    <p className="text-[11px] text-[#6B6E76]">
                      {getImpactLabel(i, sortedFeatures.length - 1)} impact
                    </p>
                  </div>
                  <span className="text-[12px] font-mono font-bold text-[#9DA0A8] flex-shrink-0">
                    {fmt(f.importance)}
                  </span>
                </div>
              ))}
              {sortedFeatures.length > 10 && (
                <p className="text-[11px] text-[#6B6E76] text-center pt-1">
                  +{sortedFeatures.length - 10} more features
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
          {/* Row selector */}
          <div
            className="p-5 rounded-xl flex flex-col sm:flex-row sm:items-center gap-4"
            style={{ background: "#1E1F22", border: "1px solid #28292E" }}
          >
            <div className="flex-1">
              <p className="text-[13px] font-bold text-[#E8E9ED] mb-0.5">
                Prediction Explanation
              </p>
              <p className="text-[13px] text-[#9DA0A8]">
                Enter a row index to explain an individual prediction using SHAP values.
              </p>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-[13px] text-[#9DA0A8]">Row #</span>
                <input
                  type="number"
                  min="0"
                  value={rowInput}
                  onChange={(e) => setRowInput(e.target.value)}
                  className="w-20 text-center font-mono text-[13px] rounded-lg px-2 py-1.5"
                  style={{
                    background: "#191A1D",
                    border: "1px solid #323338",
                    color: "#E8E9ED",
                    outline: "none",
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleLocalExplain()}
                />
              </div>
              <button
                onClick={handleLocalExplain}
                disabled={isLocalLoading}
                className="btn btn-primary gap-2"
                style={{ height: "38px", padding: "0 18px", fontSize: "13px" }}
              >
                {isLocalLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <Play className="w-3.5 h-3.5" />
                )}
                Explain Row
              </button>
            </div>
          </div>

          {/* Local error */}
          {localError && (
            <div
              className="flex items-center gap-2.5 px-4 py-3 rounded-lg text-[13px]"
              style={{ background: "rgba(239, 68, 68, 0.06)", border: "1px solid rgba(239, 68, 68, 0.20)" }}
            >
              <span className="text-[#F87171] leading-relaxed">{localError}</span>
              <button onClick={handleLocalExplain} className="ml-auto text-[#F87171] hover:text-[#FAFAFA] flex items-center gap-1 flex-shrink-0">
                <RefreshCw className="w-3.5 h-3.5" /> Retry
              </button>
            </div>
          )}

          {/* Local loading */}
          {isLocalLoading && (
            <div className="flex items-center gap-3 py-4">
              <div className="w-5 h-5 border-2 border-[#28292E] border-t-[#7C5CFC] rounded-full animate-spin" />
              <p className="text-[13px] text-[#9DA0A8]">
                Computing SHAP waterfall for row #{selectedRow}…
              </p>
            </div>
          )}

          {/* Local result */}
          {localResult && !isLocalLoading && (
            <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-5 fade-in">
              {/* SHAP waterfall */}
              <div
                className="rounded-xl overflow-hidden"
                style={{ background: "#1E1F22", border: "1px solid #28292E" }}
              >
                <div
                  className="px-5 py-4"
                  style={{ borderBottom: "1px solid #28292E", background: "#191A1D" }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-[15px] font-bold text-[#E8E9ED]">
                          SHAP Waterfall — Row #{selectedRow}
                        </h2>
                        <div className="group relative inline-block">
                          <Info className="w-3.5 h-3.5 text-[#6B6E76] hover:text-[#7C5CFC] cursor-help" />
                          <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-52 p-2.5 bg-[#202024] border border-[#2C2C33] text-[11px] text-[#9DA0A8] rounded shadow-lg z-50 text-center leading-normal">
                            SHAP values explain why this specific prediction was made. Solid bars show positive/negative contributions of each feature.
                          </div>
                        </div>
                      </div>
                      <p className="text-[12px] text-[#6B6E76] mt-0.5">
                        Base value:{" "}
                        <span className="font-mono text-[#E8E9ED]">{fmt(localResult.expected_value, 3)}</span>
                        {" → "}Prediction:{" "}
                        <span className="font-mono font-bold text-[#7C5CFC]">
                          {typeof localResult.prediction === "number"
                            ? fmt(localResult.prediction, 3)
                            : String(localResult.prediction)}
                        </span>
                        {localResult.prediction_probability != null && (
                          <span className="text-[#6B6E76] ml-1.5">
                            ({Math.round(localResult.prediction_probability * 100)}% confidence)
                          </span>
                        )}
                      </p>
                    </div>
                    <span className="text-[11px] text-[#6B6E76] border border-[#232328] px-2 py-0.5 rounded font-mono flex-shrink-0">
                      Scale: {gx.task?.includes("Regression") ? "Target space" : "Log-odds space"}
                    </span>
                  </div>
                </div>

                <div className="px-5 pt-3.5">
                  {/* Compact Prediction Summary Section */}
                  <div
                    className="grid grid-cols-3 gap-4 p-3.5 rounded-lg mb-4"
                    style={{ background: "#191A1D", border: "1px solid #232328" }}
                  >
                    <div>
                      <p className="text-[10px] font-bold text-[#6B6E76] uppercase tracking-[0.08em]">
                        Predicted Class
                      </p>
                      <p className="text-[15px] font-bold text-[#E8E9ED] mt-0.5">
                        {String(localResult.prediction)}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-[#6B6E76] uppercase tracking-[0.08em]">
                        Confidence
                      </p>
                      <p className="text-[15px] font-bold text-[#3ECF71] font-mono mt-0.5">
                        {localResult.prediction_probability != null
                          ? `${(localResult.prediction_probability * 100).toFixed(1)}%`
                          : "N/A"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[10px] font-bold text-[#6B6E76] uppercase tracking-[0.08em]">
                        Row Index
                      </p>
                      <p className="text-[15px] font-bold text-[#E8E9ED] font-mono mt-0.5">
                        #{selectedRow}
                      </p>
                    </div>
                  </div>

                  {/* Waterfall Legend */}
                  <div className="flex items-center justify-between text-[11px] text-[#6B6E76] mb-3 px-1">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2.5 h-1.5 rounded-full" style={{ background: "#F59E0B" }} />
                      ← Decreases prediction
                    </span>
                    <span className="flex items-center gap-1.5">
                      Increases prediction →
                      <span className="w-2.5 h-1.5 rounded-full" style={{ background: "#3ECF71" }} />
                    </span>
                  </div>
                </div>

                <div className="p-5 pt-0 space-y-2.5">
                  {[...localResult.shap_values]
                    .sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution))
                    .slice(0, 12)
                    .map((s) => {
                      const isPos = s.contribution >= 0;
                      const maxCont = Math.max(
                        ...localResult.shap_values.map((x) => Math.abs(x.contribution))
                      );
                      const pct = maxCont > 0 ? (Math.abs(s.contribution) / maxCont) * 100 : 0;

                      return (
                        <div key={s.feature} className="flex items-center gap-3">
                          <span className="text-[12px] text-[#E8E9ED] font-medium w-[140px] sm:w-[180px] truncate flex-shrink-0" title={cleanFeatureName(s.feature)}>
                            {cleanFeatureName(s.feature)}
                          </span>
                          <span className="text-[11px] font-mono text-[#6B6E76] w-12 truncate flex-shrink-0">
                            {typeof s.value === "number" ? fmt(s.value, 2) : String(s.value)}
                          </span>
                          <div className="flex-1 flex h-[7px] rounded-full overflow-hidden" style={{ background: "#25262A" }}>
                            {/* Negative side (left) */}
                            <div className="w-1/2 flex justify-end">
                              {!isPos && (
                                <div
                                  className="h-full rounded-l-full"
                                  style={{ width: `${pct}%`, background: "#F59E0B" }}
                                />
                              )}
                            </div>
                            <div className="w-px" style={{ background: "#3A3B42" }} />
                            {/* Positive side (right) */}
                            <div className="w-1/2 flex justify-start">
                              {isPos && (
                                <div
                                  className="h-full rounded-r-full"
                                  style={{ width: `${pct}%`, background: "#3ECF71" }}
                                />
                              )}
                            </div>
                          </div>
                          <span
                            className="text-[12px] font-mono font-bold w-16 text-right flex-shrink-0"
                            style={{ color: isPos ? "#3ECF71" : "#F59E0B" }}
                          >
                            {isPos ? "+" : ""}{fmt(s.contribution, 3)}
                          </span>
                        </div>
                      );
                    })}
                </div>
              </div>

              {/* AI Explanation */}
              <div
                className="rounded-xl overflow-hidden lg:sticky lg:top-4"
                style={{ background: "#1E1F22", border: "1px solid #28292E" }}
              >
                <div
                  className="px-4 py-3 flex items-center gap-2"
                  style={{ borderBottom: "1px solid #28292E", background: "#191A1D" }}
                >
                  <Sparkles className="w-4 h-4 text-[#7C5CFC]" />
                  <h3 className="text-[14px] font-bold text-[#E8E9ED]">
                    AI Prediction Explanation
                  </h3>
                </div>
                <div className="p-4 space-y-4">
                  {(() => {
                    const sortedLocal = [...localResult.shap_values].sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution));
                    const top3 = sortedLocal.slice(0, 3).map(s => cleanFeatureName(s.feature));
                    const posContributors = sortedLocal.filter(s => s.contribution > 0).slice(0, 2).map(s => cleanFeatureName(s.feature));
                    const negContributors = sortedLocal.filter(s => s.contribution < 0).slice(0, 2).map(s => cleanFeatureName(s.feature));
                    
                    const predictionLabel = String(localResult.prediction);
                    const predictionProb = localResult.prediction_probability;

                    // 1. Prediction summary
                    let predSummary = "";
                    if (predictionProb != null) {
                      predSummary = `The model predicted class "${predictionLabel}" with ${(predictionProb * 100).toFixed(1)}% probability.`;
                    } else {
                      predSummary = `The model predicted class "${predictionLabel}".`;
                    }

                    // 2. Key Feature Drivers
                    const top3Str = top3.join(", ");
                    let driversText = `The prediction is primarily driven by ${top3Str}.`;
                    if (posContributors.length > 0) {
                      driversText += ` ${posContributors.join(" and ")} were the strongest positive contributors toward the predicted class.`;
                    }
                    if (negContributors.length > 0) {
                      driversText += ` Conversely, ${negContributors.join(" and ")} contributed negatively, opposing this prediction.`;
                    }

                    // 3. Confidence Assessment
                    let confidenceText = "";
                    if (predictionProb != null) {
                      if (predictionProb > 0.8) {
                        confidenceText = "The model is highly confident in this prediction.";
                      } else if (predictionProb > 0.6) {
                        confidenceText = "The model has moderate confidence in this prediction.";
                      } else {
                        confidenceText = "The model has low confidence in this prediction. Interpret with caution.";
                      }
                    } else {
                      confidenceText = "Probability scores are unavailable for this model type.";
                    }

                    return [
                      { label: "Prediction Summary", text: predSummary },
                      { label: "Key Feature Drivers", text: driversText },
                      { label: "Confidence Assessment", text: confidenceText },
                    ].map((sec) => (
                      <div key={sec.label}>
                        <p className="text-[10px] font-bold text-[#6B6E76] uppercase tracking-[0.08em] mb-1">
                          {sec.label}
                        </p>
                        <p className="text-[13px] text-[#9DA0A8] leading-relaxed">
                          {sec.text || "N/A"}
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
            <div
              className="py-10 flex flex-col items-center text-center rounded-xl"
              style={{ background: "#1E1F22", border: "1px dashed #28292E" }}
            >
              <p className="text-[14px] text-[#6B6E76]">
                Enter a row index above and click <strong className="text-[#9DA0A8]">Explain Row</strong> to inspect a prediction.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Sub-components ──────────────────────────────────────────── */

function PageHeader(_props: {
  modelResults?: any;
  datasetInfo?: any;
}) {
  return (
    <div className="flex flex-col gap-1 pb-5" style={{ borderBottom: "1px solid #28292E" }}>
      <h1 className="text-[30px] font-extrabold text-[#E8E9ED] tracking-tight">
        AI Explainability
      </h1>
      <p className="text-[15px] text-[#9DA0A8]">
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
    <div
      className="py-16 px-8 flex flex-col items-center text-center rounded-xl"
      style={{ background: "#1E1F22", border: "1px solid #28292E" }}
    >
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
        style={{ background: "rgba(124, 92, 252, 0.08)", border: "1px solid rgba(124, 92, 252, 0.20)" }}
      >
        {icon}
      </div>
      <h3 className="text-[18px] font-bold text-[#E8E9ED] mb-1">{title}</h3>
      <p className="text-[14px] text-[#9DA0A8] max-w-sm leading-relaxed mb-6">{description}</p>
      {action && (
        <button onClick={action.onClick} className="btn btn-primary gap-2" style={{ fontSize: "14px", height: "40px", padding: "0 20px" }}>
          {action.label}
        </button>
      )}
    </div>
  );
}
