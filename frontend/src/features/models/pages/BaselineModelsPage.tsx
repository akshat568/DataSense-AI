import { useState, useEffect } from "react";
import { useDataset } from "../../core/context/DatasetContext";
import { trainBaselineModels } from "../../../services/api";
import {
  Play,
  CheckCircle2,
  Trophy,
  Server,
  BarChart3,
  FileSpreadsheet,
  Medal,
  Layers,
  Zap,
} from "lucide-react";

const PIPELINE_STEPS = [
  "Remove Identifier Columns",
  "Missing Value Imputation",
  "Encoding Categorical Features",
  "Scaling Numeric Features",
  "Train / Test Split",
  "5-Fold Cross Validation",
  "Model Training",
  "Model Evaluation",
];

/* ── Helpers ─────────────────────────────────────────────────── */

/** Safely format a number to fixed decimals, returns "N/A" for bad values */
function fmt(v: unknown, decimals = 4): string {
  if (v == null) return "N/A";
  const n = typeof v === "number" ? v : Number(v);
  if (!Number.isFinite(n)) return "N/A";
  return n.toFixed(decimals);
}

/** Extract numeric value from best_model.primary_metric which is a string like "F1 SCORE: 1.0000" */
function extractMetricValue(metricStr: string): number | null {
  if (!metricStr) return null;
  const parts = metricStr.split(":");
  if (parts.length >= 2) {
    const num = parseFloat(parts[parts.length - 1].trim());
    return Number.isFinite(num) ? num : null;
  }
  const num = parseFloat(metricStr);
  return Number.isFinite(num) ? num : null;
}

/** Find the actual model result object for the winner */
function findWinnerModel(models: any[], bestName: string): any | null {
  return models.find((m: any) => m.name === bestName) || null;
}

/* ── Component ───────────────────────────────────────────────── */
export function BaselineModelsPage() {
  const {
    sessionId,
    datasetInfo,
    modelResults,
    setModelResults,
    isTrainingModels,
    setIsTrainingModels,
  } = useDataset();
  const [stepIdx, setStepIdx] = useState(0);
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [trainError, setTrainError] = useState<string | null>(null);

  useEffect(() => {
    let iv: ReturnType<typeof setInterval>;
    if (isTrainingModels) {
      setStepIdx(0);
      iv = setInterval(
        () => setStepIdx((p) => Math.min(p + 1, PIPELINE_STEPS.length - 1)),
        700
      );
    }
    return () => clearInterval(iv);
  }, [isTrainingModels]);

  const handleTrain = async () => {
    if (!sessionId) return;
    setIsTrainingModels(true);
    setTrainError(null);
    try {
      const res = await trainBaselineModels(sessionId);
      setModelResults(res);
    } catch (e: any) {
      console.error(e);
      setTrainError(e?.message || "Training failed. Please try again.");
    } finally {
      setIsTrainingModels(false);
    }
  };

  /* ── No Session ── */
  if (!sessionId) {
    return (
      <div className="flex flex-col gap-6 fade-in">
        <div className="flex flex-col gap-1 pb-5" style={{ borderBottom: "1px solid #28292E" }}>
          <h1 className="text-[30px] font-extrabold text-[#E8E9ED] tracking-tight">
            Baseline Models
          </h1>
          <p className="text-[15px] text-[#9DA0A8]">
            Automated baseline model training and evaluation.
          </p>
        </div>
        <div
          className="py-16 px-8 flex flex-col items-center text-center rounded-xl"
          style={{ background: "#1E1F22", border: "1px solid #28292E" }}
        >
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4"
            style={{ background: "rgba(124, 92, 252, 0.08)", border: "1px solid rgba(124, 92, 252, 0.20)" }}
          >
            <Server className="w-7 h-7 text-[#7C5CFC]" strokeWidth={1.5} />
          </div>
          <h3 className="text-[18px] font-bold text-[#E8E9ED] mb-1">No Active Session</h3>
          <p className="text-[14px] text-[#9DA0A8] max-w-sm leading-relaxed">
            Upload a dataset on the Dashboard to begin automated model training.
          </p>
        </div>
      </div>
    );
  }

  /* ── Training Progress ── */
  if (isTrainingModels) {
    return (
      <div className="flex flex-col gap-6 fade-in">
        <div className="flex flex-col gap-1 pb-5" style={{ borderBottom: "1px solid #28292E" }}>
          <h1 className="text-[30px] font-extrabold text-[#E8E9ED] tracking-tight">
            Baseline Models
          </h1>
          <p className="text-[15px] text-[#9DA0A8]">
            Evaluating baseline models…
          </p>
        </div>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div
            className="rounded-xl p-8 w-full max-w-md"
            style={{ background: "#1E1F22", border: "1px solid #28292E" }}
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-5 h-5 border-2 border-[#28292E] border-t-[#7C5CFC] rounded-full animate-spin flex-shrink-0" />
              <h2 className="text-[16px] font-bold text-[#E8E9ED]">
                Training Baseline Models
              </h2>
            </div>
            <ul className="space-y-3">
              {PIPELINE_STEPS.map((step, i) => (
                <li key={i} className="flex items-center gap-3">
                  {i < stepIdx ? (
                    <CheckCircle2 className="w-4 h-4 text-[#3ECF71] flex-shrink-0" />
                  ) : i === stepIdx ? (
                    <div className="w-4 h-4 border-2 border-[#28292E] border-t-[#7C5CFC] rounded-full animate-spin flex-shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-[#323338] flex-shrink-0" />
                  )}
                  <span
                    className={`text-[13px] ${
                      i < stepIdx
                        ? "text-[#9DA0A8]"
                        : i === stepIdx
                        ? "text-[#E8E9ED] font-medium"
                        : "text-[#6B6E76]"
                    }`}
                  >
                    {step}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    );
  }

  /* ── Pre-train CTA ── */
  if (!modelResults) {
    return (
      <div className="flex flex-col gap-6 fade-in">
        <div className="flex flex-col gap-1 pb-5" style={{ borderBottom: "1px solid #28292E" }}>
          <h1 className="text-[30px] font-extrabold text-[#E8E9ED] tracking-tight">
            Baseline Models
          </h1>
          <p className="text-[15px] text-[#9DA0A8]">
            Automated 5-fold cross-validation baseline model training.
          </p>
        </div>

        {trainError && (
          <div
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-lg text-[13px]"
            style={{ background: "rgba(239, 68, 68, 0.06)", border: "1px solid rgba(239, 68, 68, 0.20)" }}
          >
            <span className="text-[#F87171]">{trainError}</span>
          </div>
        )}

        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 text-center">
          <div
            className="w-14 h-14 rounded-2xl flex items-center justify-center"
            style={{ background: "rgba(124, 92, 252, 0.08)", border: "1px solid rgba(124, 92, 252, 0.20)" }}
          >
            <BarChart3 className="w-6 h-6 text-[#7C5CFC]" strokeWidth={1.75} />
          </div>
          <div>
            <h3 className="text-[18px] font-bold text-[#E8E9ED]">
              Ready for Model Training
            </h3>
            <p className="text-[14px] text-[#9DA0A8] mt-1 max-w-sm leading-relaxed">
              The engine will fit baseline models using 5-Fold Cross Validation and evaluate metrics on holdout test sets.
            </p>
          </div>
          <button onClick={handleTrain} className="btn btn-primary gap-2">
            <Play className="w-4 h-4" />
            Run Baseline Models
          </button>
        </div>
      </div>
    );
  }

  /* ══════════════════════════════════════════════════════════════
     MODEL EVALUATION RESULTS
     ══════════════════════════════════════════════════════════════ */
  const { task, best_model, runner_up, models, preprocessing_summary } = modelResults;
  const isRegression = task.includes("Regression");
  const primaryLabel = isRegression ? "R² Score" : "F1 Score";
  const primaryKey = isRegression ? "r2_score" : "f1_score";

  // Find the winner's actual model result object
  const winnerModel = findWinnerModel(models, best_model.name);

  // Extract the primary metric from the winner's actual metrics (fixes NaN bug)
  const winnerPrimaryValue = winnerModel
    ? winnerModel.metrics[primaryKey]
    : extractMetricValue(best_model.primary_metric);

  // Find fastest training time
  const fastestTime = Math.min(...models.map((m: any) => m.training_time));

  // Sort models for leaderboard (by primary metric descending)
  const sortedModels = [...models].sort((a: any, b: any) => {
    const aVal = a.metrics[primaryKey] ?? -Infinity;
    const bVal = b.metrics[primaryKey] ?? -Infinity;
    return bVal - aVal;
  });

  // Check if there's a tie at the top
  const topScore = sortedModels[0]?.metrics[primaryKey];
  const tiedModels = sortedModels.filter(
    (m: any) => m.metrics[primaryKey] != null && Math.abs(m.metrics[primaryKey] - topScore) < 0.0001
  );
  const hasTie = tiedModels.length > 1;

  // Generate why-winner explanation
  let whyWinnerText = "";
  if (hasTie && winnerModel) {
    const winnerCV = winnerModel.cross_validation.mean_score;
    const othersHaveHigherCV = tiedModels.some(
      (m: any) => m.name !== best_model.name && m.cross_validation.mean_score > winnerCV + 0.0001
    );
    if (othersHaveHigherCV) {
      whyWinnerText = `${primaryLabel} was tied across ${tiedModels.length} models. ${best_model.name} was selected first by the evaluation pipeline.`;
    } else {
      whyWinnerText = `${primaryLabel} was tied across ${tiedModels.length} models. ${best_model.name} achieved the highest cross-validation mean (${fmt(winnerCV, 4)}).`;
    }
  }

  // CV Mean comparison data (for horizontal bar chart)
  const cvData = sortedModels.map((m: any) => ({
    name: m.name,
    cv: m.cross_validation.mean_score,
    isBest: m.name === best_model.name,
  }));
  const maxCV = Math.max(...cvData.map((d) => d.cv), 0.01);

  // Dataset info
  const filename = datasetInfo?.filename || "Dataset";

  return (
    <div className="flex flex-col gap-6 fade-in pb-10">
      {/* ═══════════════════════════════════════════════════════════
          PAGE HEADER
          ═══════════════════════════════════════════════════════════ */}
      <div
        className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5"
        style={{ borderBottom: "1px solid #28292E" }}
      >
        <div className="flex flex-col">
          <h1 className="text-[30px] font-extrabold text-[#E8E9ED] tracking-tight leading-tight">
            Baseline Models
          </h1>
          <p className="text-[15px] text-[#9DA0A8] mt-1">
            Task detected: {task} · Evaluated {models.length} machine learning algorithms.
          </p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <div
            className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-[13px]"
            style={{ background: "#1E1F22", border: "1px solid #28292E" }}
          >
            <div className="w-2 h-2 rounded-full bg-[#3ECF71]" />
            <FileSpreadsheet className="w-4 h-4 text-[#7C5CFC]" />
            <span className="font-mono font-semibold text-[#E8E9ED]">{filename}</span>
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          KPI CARDS
          ═══════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Best Model",
            value: best_model.name,
            accent: "default" as const,
            mono: false,
          },
          {
            label: `Best ${primaryLabel}`,
            value: fmt(winnerPrimaryValue),
            accent: "success" as const,
            mono: true,
          },
          {
            label: "Fastest Training",
            value: `${fmt(fastestTime, 2)}s`,
            accent: "default" as const,
            mono: true,
          },
          {
            label: "Models Evaluated",
            value: String(models.length),
            accent: "accent" as const,
            mono: true,
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
              className={`text-[24px] font-bold tracking-tight leading-snug ${
                k.mono ? "font-mono" : ""
              } ${
                k.accent === "success"
                  ? "text-[#3ECF71]"
                  : k.accent === "accent"
                  ? "text-[#7C5CFC]"
                  : "text-[#E8E9ED]"
              }`}
            >
              {k.value}
            </p>
          </div>
        ))}
      </div>

      {/* ═══════════════════════════════════════════════════════════
          WINNER + PREPROCESSING
          ═══════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Winner Card */}
        <div
          className="lg:col-span-2 rounded-xl p-5"
          style={{ background: "#1E1F22", border: "1px solid #28292E" }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Trophy className="w-4 h-4 text-[#F59E0B]" />
            <span className="text-[11px] font-bold text-[#F59E0B] uppercase tracking-[0.1em]">
              Selected Model Winner
            </span>
          </div>
          <h2 className="text-[20px] font-bold text-[#E8E9ED] mb-2">
            {best_model.name}
          </h2>
          <p className="text-[13px] text-[#9DA0A8] leading-relaxed max-w-xl mb-4">
            {best_model.reason}
          </p>

          {/* Winner Metrics Row */}
          {winnerModel && (
            <div
              className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-lg"
              style={{ background: "#191A1D", border: "1px solid #232328" }}
            >
              <div>
                <p className="text-[10px] font-bold text-[#6B6E76] uppercase tracking-[0.08em]">
                  {primaryLabel}
                </p>
                <p className="text-[16px] font-mono font-bold text-[#3ECF71] mt-0.5">
                  {fmt(winnerModel.metrics[primaryKey])}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-[#6B6E76] uppercase tracking-[0.08em]">
                  CV Mean
                </p>
                <p className="text-[16px] font-mono font-bold text-[#E8E9ED] mt-0.5">
                  {fmt(winnerModel.cross_validation.mean_score)}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-[#6B6E76] uppercase tracking-[0.08em]">
                  CV Std
                </p>
                <p className="text-[16px] font-mono font-bold text-[#9DA0A8] mt-0.5">
                  ±{fmt(winnerModel.cross_validation.std_score)}
                </p>
              </div>
              <div>
                <p className="text-[10px] font-bold text-[#6B6E76] uppercase tracking-[0.08em]">
                  Training
                </p>
                <p className="text-[16px] font-mono font-bold text-[#E8E9ED] mt-0.5">
                  {fmt(winnerModel.training_time, 2)}s
                </p>
              </div>
            </div>
          )}

          {/* Why this model won (tie-breaker explanation) */}
          {whyWinnerText && (
            <div
              className="flex items-start gap-2.5 mt-3 px-3.5 py-2.5 rounded-lg text-[13px]"
              style={{ background: "rgba(124, 92, 252, 0.05)", border: "1px solid rgba(124, 92, 252, 0.15)" }}
            >
              <Zap className="w-3.5 h-3.5 text-[#7C5CFC] mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-[11px] font-bold text-[#7C5CFC] uppercase tracking-[0.08em] mb-0.5">
                  Why This Model Won
                </p>
                <p className="text-[#9DA0A8] leading-relaxed">{whyWinnerText}</p>
              </div>
            </div>
          )}
        </div>

        {/* Preprocessing Pipeline */}
        <div
          className="rounded-xl p-5"
          style={{ background: "#1E1F22", border: "1px solid #28292E" }}
        >
          <div className="flex items-center gap-2 mb-3">
            <Layers className="w-4 h-4 text-[#7C5CFC]" />
            <p className="text-[11px] font-bold text-[#6B6E76] uppercase tracking-[0.1em]">
              Preprocessing Pipeline
            </p>
          </div>
          <ul className="space-y-2">
            {preprocessing_summary.map((s: string, i: number) => (
              <li key={i} className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#3ECF71] mt-0.5 flex-shrink-0" />
                <span className="text-[13px] text-[#9DA0A8] leading-relaxed">{s}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════════
          CV MEAN COMPARISON
          ═══════════════════════════════════════════════════════════ */}
      {cvData.length > 1 && (
        <div
          className="rounded-xl p-5"
          style={{ background: "#1E1F22", border: "1px solid #28292E" }}
        >
          <h2 className="text-[15px] font-bold text-[#E8E9ED] mb-4">
            Cross-Validation Mean Comparison
          </h2>
          <div className="space-y-2.5">
            {cvData.map((d) => {
              const pct = maxCV > 0 ? (d.cv / maxCV) * 100 : 0;
              return (
                <div key={d.name} className="flex items-center gap-3">
                  <span className="text-[13px] text-[#9DA0A8] w-[200px] truncate flex-shrink-0 sm:w-[240px]">
                    {d.isBest && <Trophy className="w-3.5 h-3.5 text-[#F59E0B] inline mr-1.5 mb-0.5" />}
                    {d.name}
                  </span>
                  <div className="flex-1 h-[7px] rounded-full overflow-hidden" style={{ background: "#25262A" }}>
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.max(pct, 2)}%`,
                        background: d.isBest ? "#7C5CFC" : "#3A3B42",
                      }}
                    />
                  </div>
                  <span className={`text-[13px] font-mono font-bold w-16 text-right flex-shrink-0 ${d.isBest ? "text-[#A78BFA]" : "text-[#9DA0A8]"}`}>
                    {fmt(d.cv)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ═══════════════════════════════════════════════════════════
          MODEL LEADERBOARD  — CSS Grid (shared column template)
          ═══════════════════════════════════════════════════════════ */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ background: "#1E1F22", border: "1px solid #28292E" }}
      >
        <div
          className="px-5 py-3.5 flex items-center justify-between"
          style={{ borderBottom: "1px solid #28292E", background: "#191A1D" }}
        >
          <div className="flex items-center gap-2">
            <Medal className="w-4 h-4 text-[#7C5CFC]" />
            <h2 className="text-[15px] font-bold text-[#E8E9ED]">
              Model Leaderboard
            </h2>
          </div>
          <span className="text-[12px] text-[#6B6E76]">
            {models.length} models evaluated
          </span>
        </div>

        {/* overflow-x-auto enables horizontal scroll on small screens */}
        <div className="overflow-x-auto">
          {/*
            --lb-cols is the single source of truth for column widths.
            Both the header row and every data row reference var(--lb-cols).
            This makes header/body misalignment structurally impossible.
          */}
          <div style={{
            minWidth: "640px",
          } as React.CSSProperties}>

            {/* ── Header row ── */}
            <div
              className="grid"
              style={{
                gridTemplateColumns: "minmax(180px, 2fr) repeat(5, minmax(100px, 1fr))",
                background: "#191A1D",
                borderBottom: "1px solid #28292E",
              }}
            >
              {["Model", primaryLabel, "CV Mean", "CV ±Std", "Time", "Status"].map(
                (col) => (
                  <div
                    key={col}
                    className="px-5 py-2.5 text-[11px] font-bold text-[#6B6E76] uppercase tracking-[0.08em]"
                  >
                    {col}
                  </div>
                )
              )}
            </div>

            {/* ── Data rows ── */}
            {sortedModels.map((m: any) => {
              const isBest = m.name === best_model.name;
              const isRunnerUp = runner_up && m.name === runner_up.name;
              const val = m.metrics[primaryKey];
              const isExpanded = expandedRow === m.name;

              return (
                <div key={m.name}>
                  {/* Main row — same gridTemplateColumns as header */}
                  <div
                    className="grid cursor-pointer transition-colors duration-100"
                    style={{
                      gridTemplateColumns: "minmax(180px, 2fr) repeat(5, minmax(100px, 1fr))",
                      background: isBest ? "rgba(124, 92, 252, 0.07)" : undefined,
                      borderBottom: "1px solid #232328",
                    }}
                    onClick={() => setExpandedRow(isExpanded ? null : m.name)}
                    onMouseEnter={(e) => {
                      if (!isBest)
                        (e.currentTarget as HTMLElement).style.background = "#1F2023";
                    }}
                    onMouseLeave={(e) => {
                      if (!isBest)
                        (e.currentTarget as HTMLElement).style.background = "";
                    }}
                  >
                    {/* Model name */}
                    <div className="px-5 py-3.5 flex items-center gap-2 min-w-0">
                      {isBest && (
                        <Trophy className="w-4 h-4 text-[#F59E0B] flex-shrink-0" />
                      )}
                      <span
                        className={`font-semibold truncate ${
                          isBest ? "text-[15px] text-[#E8E9ED]" : "text-[14px] text-[#E8E9ED]"
                        }`}
                      >
                        {m.name}
                      </span>
                    </div>

                    {/* Primary metric */}
                    <div className="px-5 py-3.5 flex items-center">
                      <span
                        className={`font-mono font-bold text-[14px] ${
                          isBest ? "text-[#3ECF71]" : "text-[#E8E9ED]"
                        }`}
                      >
                        {fmt(val)}
                      </span>
                    </div>

                    {/* CV Mean */}
                    <div className="px-5 py-3.5 flex items-center">
                      <span className="font-mono text-[14px] text-[#E8E9ED]">
                        {fmt(m.cross_validation.mean_score)}
                      </span>
                    </div>

                    {/* CV Std */}
                    <div className="px-5 py-3.5 flex items-center">
                      <span className="font-mono text-[14px] text-[#6B6E76]">
                        ±{fmt(m.cross_validation.std_score)}
                      </span>
                    </div>

                    {/* Time */}
                    <div className="px-5 py-3.5 flex items-center">
                      <span className="font-mono text-[14px] text-[#9DA0A8]">
                        {fmt(m.training_time, 2)}s
                      </span>
                    </div>

                    {/* Status badge */}
                    <div className="px-5 py-3.5 flex items-center">
                      {isBest ? (
                        <span
                          className="text-[11px] font-bold uppercase px-2.5 py-1 rounded-md whitespace-nowrap"
                          style={{
                            background: "rgba(62, 207, 113, 0.10)",
                            color: "#3ECF71",
                            border: "1px solid rgba(62, 207, 113, 0.25)",
                          }}
                        >
                          Winner
                        </span>
                      ) : isRunnerUp ? (
                        <span
                          className="text-[11px] font-bold uppercase px-2.5 py-1 rounded-md whitespace-nowrap"
                          style={{
                            background: "rgba(124, 92, 252, 0.10)",
                            color: "#A78BFA",
                            border: "1px solid rgba(124, 92, 252, 0.25)",
                          }}
                        >
                          Runner Up
                        </span>
                      ) : (
                        <span
                          className="text-[11px] font-bold uppercase px-2.5 py-1 rounded-md whitespace-nowrap"
                          style={{
                            background: "#25262A",
                            color: "#6B6E76",
                            border: "1px solid #323338",
                          }}
                        >
                          Evaluated
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Expanded detail panel */}
                  {isExpanded && (
                    <div
                      className="px-5 py-4"
                      style={{
                        background: "#191A1D",
                        borderBottom: "1px solid #232328",
                      }}
                    >
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {Object.entries(m.metrics).map(([k, v]: any) => (
                          <div key={k}>
                            <p className="text-[10px] text-[#6B6E76] uppercase tracking-[0.08em] font-bold">
                              {k.replace(/_/g, " ")}
                            </p>
                            <p className="font-mono text-[14px] text-[#E8E9ED] mt-0.5">
                              {fmt(v)}
                            </p>
                          </div>
                        ))}
                        <div>
                          <p className="text-[10px] text-[#6B6E76] uppercase tracking-[0.08em] font-bold">
                            CV Mean
                          </p>
                          <p className="font-mono text-[14px] text-[#E8E9ED] mt-0.5">
                            {fmt(m.cross_validation.mean_score)}
                          </p>
                        </div>
                        <div>
                          <p className="text-[10px] text-[#6B6E76] uppercase tracking-[0.08em] font-bold">
                            CV Std
                          </p>
                          <p className="font-mono text-[14px] text-[#9DA0A8] mt-0.5">
                            ±{fmt(m.cross_validation.std_score)}
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
