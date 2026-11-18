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
  ChevronDown,
  ChevronUp,
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
function fmt(v: unknown, decimals = 4): string {
  if (v == null) return "N/A";
  const n = typeof v === "number" ? v : Number(v);
  if (!Number.isFinite(n)) return "N/A";
  return n.toFixed(decimals);
}

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
        650
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
      setTrainError(e?.message || "Training failed. Please check backend status.");
    } finally {
      setIsTrainingModels(false);
    }
  };

  /* ── No Session ── */
  if (!sessionId) {
    return (
      <div className="flex flex-col gap-6 fade-in">
        <div className="flex flex-col gap-1 pb-5 border-b border-[#E5E9E2]">
          <h1 className="text-[28px] font-extrabold text-[#26332D] tracking-tight">
            Baseline Models
          </h1>
          <p className="text-[14px] text-[#64736A]">
            Automated baseline model training, cross-validation, and evaluation.
          </p>
        </div>
        <div className="py-16 px-8 flex flex-col items-center text-center rounded-2xl bg-white border border-[#E5E9E2] shadow-[0_1px_3px_rgba(38,51,45,0.03)]">
          <div className="w-16 h-16 rounded-2xl bg-[#F1F5EF] border border-[#E5E9E2] flex items-center justify-center mb-4 text-[#26332D]">
            <Server className="w-8 h-8 text-[#26332D]" strokeWidth={1.75} />
          </div>
          <h3 className="text-[18px] font-bold text-[#26332D] mb-1">No Active Session</h3>
          <p className="text-[14px] text-[#64736A] max-w-sm leading-relaxed">
            Upload a CSV dataset on the Dashboard to begin automated model training.
          </p>
        </div>
      </div>
    );
  }

  /* ── Training Progress State ── */
  if (isTrainingModels) {
    return (
      <div className="flex flex-col gap-6 fade-in">
        <div className="flex flex-col gap-1 pb-5 border-b border-[#E5E9E2]">
          <h1 className="text-[28px] font-extrabold text-[#26332D] tracking-tight">
            Baseline Models
          </h1>
          <p className="text-[14px] text-[#64736A]">
            Evaluating baseline algorithms via 5-fold cross-validation…
          </p>
        </div>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="rounded-2xl p-8 w-full max-w-md bg-white border border-[#E5E9E2] shadow-md">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-5 h-5 border-2 border-[#E5E9E2] border-t-[#26332D] rounded-full animate-spin flex-shrink-0" />
              <h2 className="text-[16px] font-bold text-[#26332D]">
                Training Baseline Models
              </h2>
            </div>
            <ul className="space-y-3">
              {PIPELINE_STEPS.map((step, i) => (
                <li key={i} className="flex items-center gap-3">
                  {i < stepIdx ? (
                    <CheckCircle2 className="w-4 h-4 text-[#2A7E4F] flex-shrink-0" />
                  ) : i === stepIdx ? (
                    <div className="w-4 h-4 border-2 border-[#E5E9E2] border-t-[#26332D] rounded-full animate-spin flex-shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-[#D6DCD3] flex-shrink-0" />
                  )}
                  <span
                    className={`text-[13px] ${
                      i < stepIdx
                        ? "text-[#64736A]"
                        : i === stepIdx
                        ? "text-[#26332D] font-bold"
                        : "text-[#78827A]"
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

  /* ── Pre-train Call to Action ── */
  if (!modelResults) {
    return (
      <div className="flex flex-col gap-6 fade-in">
        <div className="flex flex-col gap-1 pb-5 border-b border-[#E5E9E2]">
          <h1 className="text-[28px] font-extrabold text-[#26332D] tracking-tight">
            Baseline Models
          </h1>
          <p className="text-[14px] text-[#64736A]">
            Automated 5-fold cross-validation baseline model training and comparison.
          </p>
        </div>

        {trainError && (
          <div className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-[13px] bg-[#FEF2F2] border border-[#FECACA] text-[#DC2626]">
            <span>{trainError}</span>
          </div>
        )}

        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 text-center py-16 px-8 rounded-2xl bg-white border border-[#E5E9E2] shadow-[0_1px_3px_rgba(38,51,45,0.03)]">
          <div className="w-16 h-16 rounded-2xl bg-[#F1F5EF] border border-[#E5E9E2] flex items-center justify-center text-[#26332D]">
            <BarChart3 className="w-8 h-8 text-[#26332D]" strokeWidth={1.75} />
          </div>
          <div>
            <h3 className="text-[19px] font-bold text-[#26332D]">
              Ready for Model Training
            </h3>
            <p className="text-[14px] text-[#64736A] mt-1 max-w-md leading-relaxed">
              The engine will fit baseline models using 5-Fold Cross Validation, generate metrics on holdout test sets, and select the winning architecture.
            </p>
          </div>
          <button
            onClick={handleTrain}
            className="btn btn-primary gap-2 mt-2"
            style={{
              height: "44px",
              paddingInline: "22px",
              fontSize: "14px",
              boxShadow: "0 2px 8px rgba(184, 243, 74, 0.4)",
            }}
          >
            <Play className="w-4 h-4 fill-current" />
            Run Baseline Models
          </button>
        </div>
      </div>
    );
  }

  /* ══════════════════════════════════════════════════════════════
     MODEL EVALUATION RESULTS (Real Data Only)
     ══════════════════════════════════════════════════════════════ */
  const { task, best_model, runner_up, models, preprocessing_summary } = modelResults;
  const isRegression = task.includes("Regression");
  const primaryLabel = isRegression ? "R² Score" : "F1 Score";
  const primaryKey = isRegression ? "r2_score" : "f1_score";

  const winnerModel = findWinnerModel(models, best_model.name);
  const winnerPrimaryValue = winnerModel
    ? winnerModel.metrics[primaryKey]
    : extractMetricValue(best_model.primary_metric);

  const fastestTime = Math.min(...models.map((m: any) => m.training_time));

  const sortedModels = [...models].sort((a: any, b: any) => {
    const aVal = a.metrics[primaryKey] ?? -Infinity;
    const bVal = b.metrics[primaryKey] ?? -Infinity;
    return bVal - aVal;
  });

  const topScore = sortedModels[0]?.metrics[primaryKey];
  const tiedModels = sortedModels.filter(
    (m: any) => m.metrics[primaryKey] != null && Math.abs(m.metrics[primaryKey] - topScore) < 0.0001
  );
  const hasTie = tiedModels.length > 1;

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

  const cvData = sortedModels.map((m: any) => ({
    name: m.name,
    cv: m.cross_validation.mean_score,
    isBest: m.name === best_model.name,
  }));
  const maxCV = Math.max(...cvData.map((d) => d.cv), 0.01);

  const filename = datasetInfo?.filename || "Dataset";

  return (
    <div className="flex flex-col gap-6 fade-in pb-10">
      {/* ── Page Header ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-[#E5E9E2]">
        <div className="flex flex-col">
          <h1 className="text-[28px] sm:text-[32px] font-extrabold text-[#26332D] tracking-tight leading-tight">
            Baseline Models
          </h1>
          <p className="text-[14px] text-[#64736A] mt-1">
            Task detected: <span className="font-semibold text-[#26332D]">{task}</span> · Evaluated {models.length} candidate machine learning algorithms.
          </p>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-[13px] bg-white border border-[#E5E9E2] shadow-xs">
            <div className="w-2 h-2 rounded-full bg-[#2A7E4F]" />
            <FileSpreadsheet className="w-4 h-4 text-[#26332D]" />
            <span className="font-mono font-semibold text-[#26332D]">{filename}</span>
          </div>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          {
            label: "Best Model",
            value: best_model.name,
            accent: "forest" as const,
            mono: false,
          },
          {
            label: `Best ${primaryLabel}`,
            value: fmt(winnerPrimaryValue),
            accent: "mint" as const,
            mono: true,
          },
          {
            label: "Fastest Training",
            value: `${fmt(fastestTime, 2)}s`,
            accent: "forest" as const,
            mono: true,
          },
          {
            label: "Models Evaluated",
            value: String(models.length),
            accent: "forest" as const,
            mono: true,
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
              className={`text-[22px] sm:text-[24px] font-bold tracking-tight leading-snug ${
                k.mono ? "font-mono" : ""
              } ${k.accent === "mint" ? "text-[#2A7E4F]" : "text-[#26332D]"}`}
            >
              {k.value}
            </p>
          </div>
        ))}
      </div>

      {/* ── Winner Card + Preprocessing Pipeline ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Winner Card */}
        <div className="lg:col-span-2 rounded-2xl p-6 bg-white border border-[#E5E9E2] shadow-[0_1px_3px_rgba(38,51,45,0.03)]">
          <div className="flex items-center gap-2 mb-2.5">
            <Trophy className="w-4 h-4 text-[#B45309]" />
            <span className="text-[11px] font-bold text-[#B45309] uppercase tracking-[0.14em]">
              Selected Model Winner
            </span>
          </div>
          <h2 className="text-[22px] font-bold text-[#26332D] mb-2">
            {best_model.name}
          </h2>
          <p className="text-[13.5px] text-[#64736A] leading-relaxed max-w-xl mb-5">
            {best_model.reason}
          </p>

          {/* Winner Metrics Row */}
          {winnerModel && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-[#F9FAF7] border border-[#E5E9E2]">
              <div>
                <p className="text-[10.5px] font-bold text-[#78827A] uppercase tracking-[0.1em]">
                  {primaryLabel}
                </p>
                <p className="text-[17px] font-mono font-bold text-[#2A7E4F] mt-0.5">
                  {fmt(winnerModel.metrics[primaryKey])}
                </p>
              </div>
              <div>
                <p className="text-[10.5px] font-bold text-[#78827A] uppercase tracking-[0.1em]">
                  CV Mean
                </p>
                <p className="text-[17px] font-mono font-bold text-[#26332D] mt-0.5">
                  {fmt(winnerModel.cross_validation.mean_score)}
                </p>
              </div>
              <div>
                <p className="text-[10.5px] font-bold text-[#78827A] uppercase tracking-[0.1em]">
                  CV Std
                </p>
                <p className="text-[17px] font-mono font-bold text-[#64736A] mt-0.5">
                  ±{fmt(winnerModel.cross_validation.std_score)}
                </p>
              </div>
              <div>
                <p className="text-[10.5px] font-bold text-[#78827A] uppercase tracking-[0.1em]">
                  Training
                </p>
                <p className="text-[17px] font-mono font-bold text-[#26332D] mt-0.5">
                  {fmt(winnerModel.training_time, 2)}s
                </p>
              </div>
            </div>
          )}

          {/* Why this model won */}
          {whyWinnerText && (
            <div className="flex items-start gap-2.5 mt-3.5 px-4 py-3 rounded-xl text-[13px] bg-[#F1F6EC] border border-[#DCE8DC]">
              <Zap className="w-4 h-4 text-[#26332D] mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-[11px] font-bold text-[#26332D] uppercase tracking-[0.1em] mb-0.5">
                  Why This Model Won
                </p>
                <p className="text-[#64736A] leading-relaxed">{whyWinnerText}</p>
              </div>
            </div>
          )}
        </div>

        {/* Preprocessing Pipeline */}
        <div className="rounded-2xl p-6 bg-white border border-[#E5E9E2] shadow-[0_1px_3px_rgba(38,51,45,0.03)]">
          <div className="flex items-center gap-2 mb-4">
            <Layers className="w-4 h-4 text-[#26332D]" />
            <p className="text-[11px] font-bold text-[#78827A] uppercase tracking-[0.14em]">
              Preprocessing Pipeline
            </p>
          </div>
          <ul className="space-y-2.5">
            {preprocessing_summary.map((s: string, i: number) => (
              <li key={i} className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-[#2A7E4F] mt-0.5 flex-shrink-0" />
                <span className="text-[13px] text-[#64736A] leading-relaxed">{s}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ── Cross-Validation Mean Comparison ── */}
      {cvData.length > 1 && (
        <div className="rounded-2xl p-6 bg-white border border-[#E5E9E2] shadow-[0_1px_3px_rgba(38,51,45,0.03)]">
          <h2 className="text-[15px] font-bold text-[#26332D] mb-4">
            Cross-Validation Mean Score Comparison
          </h2>
          <div className="space-y-3">
            {cvData.map((d) => {
              const pct = maxCV > 0 ? (d.cv / maxCV) * 100 : 0;
              return (
                <div key={d.name} className="flex items-center gap-3">
                  <span className="text-[13px] font-semibold text-[#26332D] w-[180px] sm:w-[220px] truncate flex-shrink-0">
                    {d.isBest && <Trophy className="w-3.5 h-3.5 text-[#B45309] inline mr-1.5 mb-0.5" />}
                    {d.name}
                  </span>
                  <div className="flex-1 h-[8px] rounded-full overflow-hidden bg-[#EEF2EB]">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.max(pct, 2)}%`,
                        background: d.isBest ? "#26332D" : "#9EB0A6",
                      }}
                    />
                  </div>
                  <span className={`text-[13px] font-mono font-bold w-16 text-right flex-shrink-0 ${d.isBest ? "text-[#2A7E4F]" : "text-[#64736A]"}`}>
                    {fmt(d.cv)}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Model Leaderboard ── */}
      <div className="rounded-2xl overflow-hidden bg-white border border-[#E5E9E2] shadow-[0_1px_3px_rgba(38,51,45,0.03)]">
        <div className="px-5 py-4 flex items-center justify-between border-b border-[#E5E9E2] bg-white">
          <div className="flex items-center gap-2">
            <Medal className="w-4 h-4 text-[#26332D]" />
            <h2 className="text-[15px] font-bold text-[#26332D]">
              Model Evaluation Leaderboard
            </h2>
          </div>
          <span className="text-[12px] text-[#78827A] font-mono">
            {models.length} models ranked
          </span>
        </div>

        <div className="overflow-x-auto">
          <div style={{ minWidth: "660px" }}>
            {/* Header row */}
            <div
              className="grid bg-[#F9FAF7] border-b border-[#E5E9E2]"
              style={{
                gridTemplateColumns: "minmax(200px, 2fr) repeat(5, minmax(100px, 1fr))",
              }}
            >
              {["Model Architecture", primaryLabel, "CV Mean", "CV ±Std", "Train Time", "Status"].map(
                (col) => (
                  <div
                    key={col}
                    className="px-5 py-3 text-[11px] font-bold text-[#78827A] uppercase tracking-[0.1em]"
                  >
                    {col}
                  </div>
                )
              )}
            </div>

            {/* Data rows */}
            {sortedModels.map((m: any) => {
              const isBest = m.name === best_model.name;
              const isRunnerUp = runner_up && m.name === runner_up.name;
              const val = m.metrics[primaryKey];
              const isExpanded = expandedRow === m.name;

              return (
                <div key={m.name}>
                  <div
                    className={`grid cursor-pointer transition-colors duration-100 border-b border-[#EEF2EB] ${
                      isBest ? "bg-[#F4FBD6]/60 hover:bg-[#F4FBD6]/80" : "hover:bg-[#F6F8F4]"
                    }`}
                    style={{
                      gridTemplateColumns: "minmax(200px, 2fr) repeat(5, minmax(100px, 1fr))",
                    }}
                    onClick={() => setExpandedRow(isExpanded ? null : m.name)}
                  >
                    {/* Model Name */}
                    <div className="px-5 py-3.5 flex items-center gap-2 min-w-0">
                      {isBest && (
                        <Trophy className="w-4 h-4 text-[#B45309] flex-shrink-0" />
                      )}
                      <span className={`font-semibold truncate text-[14px] text-[#26332D]`}>
                        {m.name}
                      </span>
                      {isExpanded ? (
                        <ChevronUp className="w-3.5 h-3.5 text-[#78827A] ml-1" />
                      ) : (
                        <ChevronDown className="w-3.5 h-3.5 text-[#78827A] ml-1" />
                      )}
                    </div>

                    {/* Primary Metric */}
                    <div className="px-5 py-3.5 flex items-center">
                      <span className={`font-mono font-bold text-[14px] ${isBest ? "text-[#166534]" : "text-[#26332D]"}`}>
                        {fmt(val)}
                      </span>
                    </div>

                    {/* CV Mean */}
                    <div className="px-5 py-3.5 flex items-center">
                      <span className="font-mono text-[13.5px] text-[#26332D]">
                        {fmt(m.cross_validation.mean_score)}
                      </span>
                    </div>

                    {/* CV Std */}
                    <div className="px-5 py-3.5 flex items-center">
                      <span className="font-mono text-[13px] text-[#78827A]">
                        ±{fmt(m.cross_validation.std_score)}
                      </span>
                    </div>

                    {/* Time */}
                    <div className="px-5 py-3.5 flex items-center">
                      <span className="font-mono text-[13px] text-[#64736A]">
                        {fmt(m.training_time, 2)}s
                      </span>
                    </div>

                    {/* Status Badge */}
                    <div className="px-5 py-3.5 flex items-center">
                      {isBest ? (
                        <span className="text-[10.5px] font-bold uppercase px-2.5 py-1 rounded-md bg-[#F3FCD7] text-[#28440D] border border-[#D2F775]">
                          Winner
                        </span>
                      ) : isRunnerUp ? (
                        <span className="text-[10.5px] font-bold uppercase px-2.5 py-1 rounded-md bg-[#F1F5EF] text-[#26332D] border border-[#E5E9E2]">
                          Runner Up
                        </span>
                      ) : (
                        <span className="text-[10.5px] font-bold uppercase px-2.5 py-1 rounded-md bg-[#FAFBF9] text-[#78827A] border border-[#E5E9E2]">
                          Evaluated
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Expanded Metric Breakdown */}
                  {isExpanded && (
                    <div className="px-6 py-4 bg-[#F9FAF7] border-b border-[#EEF2EB] fade-in">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {Object.entries(m.metrics).map(([k, v]: any) => (
                          <div key={k} className="p-2.5 rounded-lg bg-white border border-[#E5E9E2]">
                            <p className="text-[10px] text-[#78827A] uppercase tracking-[0.1em] font-bold">
                              {k.replace(/_/g, " ")}
                            </p>
                            <p className="font-mono text-[14px] text-[#26332D] font-bold mt-0.5">
                              {fmt(v)}
                            </p>
                          </div>
                        ))}
                        <div className="p-2.5 rounded-lg bg-white border border-[#E5E9E2]">
                          <p className="text-[10px] text-[#78827A] uppercase tracking-[0.1em] font-bold">
                            CV Mean
                          </p>
                          <p className="font-mono text-[14px] text-[#26332D] font-bold mt-0.5">
                            {fmt(m.cross_validation.mean_score)}
                          </p>
                        </div>
                        <div className="p-2.5 rounded-lg bg-white border border-[#E5E9E2]">
                          <p className="text-[10px] text-[#78827A] uppercase tracking-[0.1em] font-bold">
                            CV Std
                          </p>
                          <p className="font-mono text-[14px] text-[#78827A] font-bold mt-0.5">
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
