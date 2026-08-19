import { useEffect, useState } from "react";
import { useDataset } from "../../core/context/DatasetContext";
import { getReportPreview, downloadReport } from "../../../services/api";
import { PageHeader } from "../../../components/ui/PageHeader";
import { EmptyState } from "../../../components/ui/EmptyState";
import { Badge } from "../../../components/ui/Badge";
import {
  FileText,
  Download,
  CheckCircle2,
  AlertCircle,
  TrendingUp,
  Layers,
  Activity,
  AlertTriangle,
  Award,
  Trophy,
  Sparkles,
  Info,
  Clock,
  Check,
  Percent,
  FileCode,
  ShieldCheck,
} from "lucide-react";

/* ── Helpers ─────────────────────────────────────────────────── */
function cleanFeatureName(name: string): string {
  if (!name) return "";
  // Removes "num__", "cat__", etc., while keeping underscores intact
  return name.replace(/^(num|cat|date|datetime)__/, "");
}

function fmt(v: unknown, decimals = 4): string {
  if (v == null) return "N/A";
  const n = typeof v === "number" ? v : Number(v);
  if (!Number.isFinite(n)) return "N/A";
  return n.toFixed(decimals);
}

function SectionHeading({ number, title }: { number: number; title: string }) {
  return (
    <div className="flex items-baseline gap-3 pb-3 mb-6 border-b border-[#2A2A2F]">
      <span className="text-[12px] font-mono font-bold text-[#7C5CFC]">
        0{number}
      </span>
      <h2 className="text-[16px] font-bold text-[#FAFAFA] tracking-tight">{title}</h2>
    </div>
  );
}

export function ReportPreviewPage() {
  const { sessionId } = useDataset();
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dlPdf, setDlPdf] = useState(false);
  const [dlJson, setDlJson] = useState(false);

  useEffect(() => {
    if (!sessionId) return;
    setLoading(true);
    setError(null);
    getReportPreview(sessionId)
      .then((r) => setReport(r.data))
      .catch((e) =>
        setError(
          e.response?.data?.detail ||
            "Failed to generate report. Ensure basic profiling is complete."
        )
      )
      .finally(() => setLoading(false));
  }, [sessionId]);

  const handleExport = async (fmtType: "pdf" | "html") => {
    if (!sessionId) return;
    setDlPdf(true);
    try {
      await downloadReport(sessionId, fmtType);
    } catch (e) {
      console.error(e);
    } finally {
      setDlPdf(false);
    }
  };

  const handleExportJson = () => {
    if (!report) return;
    setDlJson(true);
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(report, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `DataSense_Report_${sessionId?.substring(0, 8) || "export"}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (e) {
      console.error(e);
    } finally {
      setDlJson(false);
    }
  };

  const getSeverityBadge = (risk: string): any => {
    if (!risk) return "info";
    if (risk.includes("High") || risk.includes("Immediate")) return "danger";
    if (risk.includes("Moderate") || risk.includes("Caution")) return "warning";
    return "success";
  };

  if (!sessionId) {
    return (
      <>
        <PageHeader
          title="Reports"
          breadcrumb={["Analysis", "Reports"]}
        />
        <EmptyState
          icon={FileText}
          title="No Active Session"
          description="Upload a CSV dataset and complete the analysis workflow to generate a professional intelligence report."
        />
      </>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-6 fade-in">
        <PageHeader
          title="Reports"
          breadcrumb={["Analysis", "Reports"]}
        />
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
          <div className="w-8 h-8 border-2 border-[#2A2A2F] border-t-[#7C5CFC] rounded-full animate-spin" />
          <p className="text-[13px] text-[#A1A1AA]">
            Compiling dataset intelligence report…
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-6 fade-in">
        <PageHeader
          title="Reports"
          breadcrumb={["Analysis", "Reports"]}
        />
        <div className="flex items-start gap-3 p-5 bg-[rgba(239,68,68,0.08)] border border-[rgba(239,68,68,0.25)] rounded-2xl">
          <AlertCircle className="w-5 h-5 text-[#EF4444] mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-[14px] font-semibold text-[#EF4444]">
              Report Generation Failed
            </p>
            <p className="text-[13px] text-[#EF4444] mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!report) return null;

  // Compute key variables safely
  const rowsCount = report.dataset_profiling?.rows ?? 0;
  const colsCount = report.dataset_profiling?.columns ?? 0;
  const missingCellsCount = report.dataset_profiling?.missing_cells ?? 0;
  const duplicatesCount = report.dataset_profiling?.duplicate_rows ?? 0;
  const numericCount = report.dataset_profiling?.numeric_features ?? 0;
  const categoricalCount = report.dataset_profiling?.categorical_features ?? 0;
  
  const totalCells = rowsCount * colsCount;
  const missingPct = totalCells > 0 ? (missingCellsCount / totalCells) * 100 : 0;
  const completenessPct = 100 - missingPct;
  const duplicatesPct = rowsCount > 0 ? (duplicatesCount / rowsCount) * 100 : 0;
  
  const totalFeatures = numericCount + categoricalCount;
  const numPct = totalFeatures > 0 ? (numericCount / totalFeatures) * 100 : 0;
  const catPct = totalFeatures > 0 ? (categoricalCount / totalFeatures) * 100 : 0;

  const hasModels = report.models?.best_model?.name && report.models.best_model.name !== "Not Available";
  const hasShap = report.key_business_drivers && report.key_business_drivers.length > 0;

  // Collect status values for each section
  const sectionStatus = {
    profile: { label: "Dataset Profile", available: true },
    insights: { label: "AI Insights", available: true },
    models: { label: "Baseline Models", available: hasModels },
    explainability: { label: "AI Explainability", available: hasShap }
  };

  return (
    <div className="flex flex-col gap-6 fade-in pb-12">
      {/* ── Page Header ── */}
      <PageHeader
        title="Analysis Report"
        breadcrumb={["Analysis", "Reports"]}
        description={`${report.cover_page?.subtitle || "Dataset intelligence analysis"} • ${rowsCount} rows × ${colsCount} columns • Generated: ${report.cover_page?.date || ""}`}
        actions={
          <div className="flex items-center gap-3">
            <button
              onClick={handleExportJson}
              disabled={dlJson}
              className="btn btn-secondary gap-2"
            >
              <FileCode className="w-4 h-4" />
              Export JSON
            </button>

            <button
              onClick={() => handleExport("pdf")}
              disabled={dlPdf}
              className="btn btn-primary gap-2"
            >
              {dlPdf ? (
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              Export PDF
            </button>
          </div>
        }
      />

      {/* ── Subtle Section Navigation ── */}
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px] text-[#A1A1AA] pb-3 border-b border-[#2A2A2F]/60">
        {[
          { label: "Overview", targetId: "overview" },
          { label: "Data Quality", targetId: "data-quality" },
          { label: "AI Insights", targetId: "ai-insights" },
          { label: "Models", targetId: "models" },
          { label: "Explainability", targetId: "explainability" },
          { label: "Recommendation", targetId: "recommendation" },
          { label: "Limitations & Next Steps", targetId: "limitations" },
        ].map((item, index) => (
          <span key={item.targetId} className="flex items-center">
            {index > 0 && <span className="text-[#3F3F46] mr-2">|</span>}
            <button
              onClick={() => {
                const el = document.getElementById(item.targetId);
                if (el) {
                  el.scrollIntoView({ behavior: "smooth", block: "start" });
                }
              }}
              className="hover:text-[#7C5CFC] font-medium transition-colors cursor-pointer py-0.5"
            >
              {item.label}
            </button>
          </span>
        ))}
      </div>

      {/* ── Executive Summary Cards ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Data Quality */}
        <div className="p-4 bg-[#18181B] border border-[#2A2A2F] rounded-xl flex flex-col justify-between min-h-[110px]">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-[11px] text-[#A1A1AA] uppercase font-semibold tracking-wider">Data Quality</span>
              <ShieldCheck className="w-4 h-4 text-[#7C5CFC]" />
            </div>
            <div className="text-[16px] font-bold text-[#FAFAFA] truncate mt-1">
              {report.cover_page?.dataset_readiness || "N/A"}
            </div>
          </div>
          <div className="mt-2">
            <Badge severity={getSeverityBadge(report.cover_page?.dataset_readiness)}>
              {report.recommendations?.risk_assessment?.overall_risk || "N/A"}
            </Badge>
          </div>
        </div>

        {/* Card 2: Missing Values */}
        <div className="p-4 bg-[#18181B] border border-[#2A2A2F] rounded-xl flex flex-col justify-between min-h-[110px]">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-[11px] text-[#A1A1AA] uppercase font-semibold tracking-wider">Missing Values</span>
              <AlertTriangle className="w-4 h-4 text-[#F59E0B]" />
            </div>
            <div className="text-[24px] font-bold text-[#FAFAFA] font-mono leading-none mt-1">
              {missingCellsCount}
            </div>
          </div>
          <div className="mt-2 text-[11px] text-[#A1A1AA]">
            {missingPct.toFixed(2)}% of total cells
          </div>
        </div>

        {/* Card 3: Duplicate Rows */}
        <div className="p-4 bg-[#18181B] border border-[#2A2A2F] rounded-xl flex flex-col justify-between min-h-[110px]">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-[11px] text-[#A1A1AA] uppercase font-semibold tracking-wider">Duplicate Rows</span>
              <Layers className="w-4 h-4 text-[#EF4444]" />
            </div>
            <div className="text-[24px] font-bold text-[#FAFAFA] font-mono leading-none mt-1">
              {duplicatesCount}
            </div>
          </div>
          <div className="mt-2 text-[11px] text-[#A1A1AA]">
            {duplicatesPct.toFixed(2)}% rate
          </div>
        </div>

        {/* Card 4: Detected Task */}
        <div className="p-4 bg-[#18181B] border border-[#2A2A2F] rounded-xl flex flex-col justify-between min-h-[110px]">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-[11px] text-[#A1A1AA] uppercase font-semibold tracking-wider">Detected Task</span>
              <Activity className="w-4 h-4 text-[#7C5CFC]" />
            </div>
            <div className="text-[16px] font-bold text-[#FAFAFA] truncate mt-1">
              {report.appendix?.ml_task || "N/A"}
            </div>
          </div>
          <div className="mt-2 text-[11px] text-[#A1A1AA] truncate">
            Target: <span className="font-mono text-[#FAFAFA]">{report.appendix?.target_column || "N/A"}</span>
          </div>
        </div>

        {/* Card 5: Best Model */}
        <div className="p-4 bg-[#18181B] border border-[#2A2A2F] rounded-xl flex flex-col justify-between min-h-[110px]">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-[11px] text-[#A1A1AA] uppercase font-semibold tracking-wider">Best Model</span>
              <Award className="w-4 h-4 text-[#22C55E]" />
            </div>
            <div className="text-[16px] font-bold text-[#FAFAFA] truncate mt-1">
              {hasModels ? report.models.best_model.name : "N/A"}
            </div>
          </div>
          <div className="mt-2 text-[11px] text-[#A1A1AA] flex items-center gap-1">
            {hasModels ? (
              <>
                <span className="text-[#22C55E] font-bold font-mono">
                  {fmt(report.models.best_model.primary_metric_value)}
                </span>{" "}
                {report.models.best_model.primary_metric}
              </>
            ) : (
              "N/A"
            )}
          </div>
        </div>
      </div>

      {/* ── Main Report Contents Grid ── */}
      <div id="overview" className="grid grid-cols-1 lg:grid-cols-12 gap-6 scroll-mt-20">
        {/* Left Column: Overview & Data Quality (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* Executive Narrative */}
          <div className="bg-[#18181B] border border-[#2A2A2F] rounded-2xl p-6">
            <SectionHeading number={1} title="Executive Summary" />
            <p className="text-[13px] text-[#A1A1AA] leading-relaxed">
              {report.executive_summary}
            </p>
            <div className="mt-4 p-3 bg-[#202024] rounded-xl border border-[#2A2A2F] flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-[#7C5CFC] flex-shrink-0 mt-0.5" />
              <p className="text-[12px] text-[#A1A1AA] leading-relaxed">
                <span className="text-[#FAFAFA] font-semibold">AI Conclusion: </span>
                {report.ai_conclusion}
              </p>
            </div>
          </div>

          {/* Dataset Overview */}
          <div className="bg-[#18181B] border border-[#2A2A2F] rounded-2xl p-6">
            <SectionHeading number={2} title="Dataset Overview" />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="p-3 bg-[#202024] border border-[#2A2A2F] rounded-xl">
                <p className="text-[10px] text-[#71717A] uppercase font-bold tracking-wider mb-1">Rows Count</p>
                <p className="text-[16px] font-bold text-[#FAFAFA] font-mono leading-none">{rowsCount}</p>
              </div>
              <div className="p-3 bg-[#202024] border border-[#2A2A2F] rounded-xl">
                <p className="text-[10px] text-[#71717A] uppercase font-bold tracking-wider mb-1">Columns Count</p>
                <p className="text-[16px] font-bold text-[#FAFAFA] font-mono leading-none">{colsCount}</p>
              </div>
              <div className="p-3 bg-[#202024] border border-[#2A2A2F] rounded-xl">
                <p className="text-[10px] text-[#71717A] uppercase font-bold tracking-wider mb-1">Target Column</p>
                <p className="text-[13px] font-semibold text-[#FAFAFA] font-mono truncate leading-none pt-0.5">
                  {report.appendix?.target_column || "None"}
                </p>
              </div>
              <div className="p-3 bg-[#202024] border border-[#2A2A2F] rounded-xl">
                <p className="text-[10px] text-[#71717A] uppercase font-bold tracking-wider mb-1">Numeric Features</p>
                <p className="text-[16px] font-bold text-[#FAFAFA] font-mono leading-none">{numericCount}</p>
              </div>
              <div className="p-3 bg-[#202024] border border-[#2A2A2F] rounded-xl">
                <p className="text-[10px] text-[#71717A] uppercase font-bold tracking-wider mb-1">Categorical Features</p>
                <p className="text-[16px] font-bold text-[#FAFAFA] font-mono leading-none">{categoricalCount}</p>
              </div>
              <div className="p-3 bg-[#202024] border border-[#2A2A2F] rounded-xl">
                <p className="text-[10px] text-[#71717A] uppercase font-bold tracking-wider mb-1">Duplicate Rows</p>
                <p className="text-[16px] font-bold text-[#FAFAFA] font-mono leading-none">{duplicatesCount}</p>
              </div>
            </div>
          </div>

          {/* Data Quality Visuals */}
          <div id="data-quality" className="bg-[#18181B] border border-[#2A2A2F] rounded-2xl p-6 scroll-mt-20">
            <SectionHeading number={3} title="Data Quality Analysis" />
            <div className="space-y-4">
              {/* Completeness Bar */}
              <div>
                <div className="flex justify-between items-center text-[12px] mb-1.5">
                  <span className="text-[#A1A1AA] font-semibold">Completeness</span>
                  <span className="font-mono text-[#FAFAFA]">{completenessPct.toFixed(2)}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-[#202024] overflow-hidden">
                  <div className="bg-[#22C55E] h-full" style={{ width: `${completenessPct}%` }} />
                </div>
              </div>

              {/* Missing Values Rate Bar */}
              <div>
                <div className="flex justify-between items-center text-[12px] mb-1.5">
                  <span className="text-[#A1A1AA] font-semibold">Missing Value Frequency</span>
                  <span className="font-mono text-[#FAFAFA]">{missingCellsCount} cells ({missingPct.toFixed(2)}%)</span>
                </div>
                <div className="h-2 w-full rounded-full bg-[#202024] overflow-hidden">
                  <div
                    className={`${missingCellsCount > 0 ? "bg-[#F59E0B]" : "bg-[#2A2A2F]"} h-full`}
                    style={{ width: `${Math.max(missingPct, missingCellsCount > 0 ? 2 : 0)}%` }}
                  />
                </div>
              </div>

              {/* Duplicates Rate Bar */}
              <div>
                <div className="flex justify-between items-center text-[12px] mb-1.5">
                  <span className="text-[#A1A1AA] font-semibold">Duplicate Rows Frequency</span>
                  <span className="font-mono text-[#FAFAFA]">{duplicatesCount} rows ({duplicatesPct.toFixed(2)}%)</span>
                </div>
                <div className="h-2 w-full rounded-full bg-[#202024] overflow-hidden">
                  <div
                    className={`${duplicatesCount > 0 ? "bg-[#EF4444]" : "bg-[#2A2A2F]"} h-full`}
                    style={{ width: `${Math.max(duplicatesPct, duplicatesCount > 0 ? 2 : 0)}%` }}
                  />
                </div>
              </div>

              {/* Feature Type stacked chart */}
              <div>
                <div className="flex justify-between items-center text-[12px] mb-1.5">
                  <span className="text-[#A1A1AA] font-semibold">Feature Types Distribution</span>
                  <span className="font-mono text-[#FAFAFA]">{totalFeatures} input columns</span>
                </div>
                <div className="h-3 w-full rounded-full bg-[#202024] overflow-hidden flex">
                  <div className="bg-[#7C5CFC]" style={{ width: `${numPct}%` }} />
                  <div className="bg-[#A78BFA]" style={{ width: `${catPct}%` }} />
                </div>
                <div className="flex gap-4 text-[11px] text-[#A1A1AA] mt-2">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-[#7C5CFC]" />
                    Numeric ({numericCount})
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-sm bg-[#A78BFA]" />
                    Categorical ({categoricalCount})
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Insights & Recommendations (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          {/* AI Insights & Preprocessing Action Plan */}
          <div id="ai-insights" className="bg-[#18181B] border border-[#2A2A2F] rounded-2xl p-6 scroll-mt-20">
            <SectionHeading number={4} title="AI Preprocessing Action Plan" />
            <div className="flex flex-col gap-4">
              <h3 className="text-[12px] font-bold text-[#FAFAFA] uppercase tracking-wider">
                Immediate Actions (Critical &amp; High)
              </h3>
              {report.recommendations?.immediate_actions?.length > 0 ? (
                <div className="space-y-3">
                  {report.recommendations.immediate_actions.map((rec: any, i: number) => (
                    <div key={i} className="p-3 bg-[#202024] border border-[rgba(239,68,68,0.2)] rounded-xl flex flex-col gap-1.5">
                      <div className="flex justify-between items-center">
                        <span className="text-[12px] font-semibold text-[#FAFAFA] font-mono">
                          {cleanFeatureName(rec.column)}
                        </span>
                        <Badge severity={rec.severity}>{rec.severity}</Badge>
                      </div>
                      <p className="text-[12px] text-[#EF4444] font-medium leading-normal">{rec.issue}</p>
                      <p className="text-[12px] text-[#A1A1AA] leading-normal">
                        <span className="text-[#FAFAFA] font-semibold">Action: </span>
                        {rec.action}
                      </p>
                      {rec.reason && (
                        <p className="text-[11px] text-[#71717A] leading-normal italic">
                          {rec.reason}
                        </p>
                      )}
                      {rec.confidence != null && (
                        <div className="flex items-center gap-1 text-[11px] text-[#7C5CFC] font-mono mt-1">
                          <Percent className="w-3.5 h-3.5" />
                          <span>Confidence: {(rec.confidence * 100).toFixed(0)}%</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-[rgba(34,197,94,0.06)] border border-[rgba(34,197,94,0.15)] rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#22C55E]" />
                  <p className="text-[12px] text-[#22C55E]">No immediate corrective actions required.</p>
                </div>
              )}

              <h3 className="text-[12px] font-bold text-[#FAFAFA] uppercase tracking-wider mt-2">
                Secondary Improvements (Medium &amp; Low)
              </h3>
              {report.recommendations?.future_improvements?.length > 0 ? (
                <div className="space-y-3">
                  {report.recommendations.future_improvements.map((rec: any, i: number) => (
                    <div key={i} className="p-3 bg-[#202024] border border-[#2A2A2F] rounded-xl flex flex-col gap-1.5">
                      <div className="flex justify-between items-center">
                        <span className="text-[12px] font-semibold text-[#FAFAFA] font-mono">
                          {cleanFeatureName(rec.column)}
                        </span>
                        <Badge severity={rec.severity}>{rec.severity}</Badge>
                      </div>
                      <p className="text-[12px] text-[#F59E0B] font-medium leading-normal">{rec.issue}</p>
                      <p className="text-[12px] text-[#A1A1AA] leading-normal">
                        <span className="text-[#FAFAFA] font-semibold">Action: </span>
                        {rec.action}
                      </p>
                      {rec.reason && (
                        <p className="text-[11px] text-[#71717A] leading-normal italic">
                          {rec.reason}
                        </p>
                      )}
                      {rec.confidence != null && (
                        <div className="flex items-center gap-1 text-[11px] text-[#7C5CFC] font-mono mt-1">
                          <Percent className="w-3.5 h-3.5" />
                          <span>Confidence: {(rec.confidence * 100).toFixed(0)}%</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[12px] text-[#71717A] italic">No future improvements identified.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Section 5: Baseline Model Comparison ── */}
      <div id="models" className="bg-[#18181B] border border-[#2A2A2F] rounded-2xl p-6 scroll-mt-20">
        <SectionHeading number={5} title="Baseline Model Performance Leaderboard" />
        {hasModels ? (
          <div className="flex flex-col gap-6">
            {/* Table */}
            <div className="overflow-x-auto border border-[#2A2A2F] rounded-xl bg-[#1A1A1E]">
              <table className="w-full border-collapse text-[13px] text-[#A1A1AA]">
                <thead>
                  <tr className="border-b border-[#2A2A2F] bg-[#202024] text-[#FAFAFA]">
                    <th className="py-3 px-4 text-left font-bold font-mono">Model</th>
                    <th className="py-3 px-4 text-center font-bold">
                      {report.models.best_model.primary_metric}
                    </th>
                    <th className="py-3 px-4 text-center font-bold">CV Mean</th>
                    <th className="py-3 px-4 text-center font-bold">CV Std</th>
                    <th className="py-3 px-4 text-center font-bold">Training Time</th>
                    <th className="py-3 px-4 text-center font-bold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {report.models.all_metrics.map((model: any, i: number) => {
                    const isRegression = (report.appendix?.ml_task || "").includes("Regression");
                    const pKey = isRegression ? "r2_score" : "f1_score";
                    const isWinner = model.is_best;
                    
                    return (
                      <tr
                        key={i}
                        className={`border-b border-[#2A2A2F]/50 last:border-0 hover:bg-[#202024]/40 transition-colors ${
                          isWinner ? "bg-[rgba(124,92,252,0.04)] text-[#FAFAFA]" : ""
                        }`}
                      >
                        <td className="py-3 px-4 font-semibold flex items-center gap-2">
                          {isWinner && <Trophy className="w-4 h-4 text-[#F59E0B]" />}
                          {model.name}
                        </td>
                        <td className="py-3 px-4 text-center font-mono font-bold">
                          {fmt(model.metrics?.[pKey])}
                        </td>
                        <td className="py-3 px-4 text-center font-mono">
                          {fmt(model.cv_mean)}
                        </td>
                        <td className="py-3 px-4 text-center font-mono text-[#71717A]">
                          {fmt(model.cv_std)}
                        </td>
                        <td className="py-3 px-4 text-center font-mono">
                          {model.training_time != null ? `${model.training_time.toFixed(3)}s` : "N/A"}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {isWinner ? (
                            <Badge severity="accent">WINNER</Badge>
                          ) : (
                            <Badge severity="info">EVALUATED</Badge>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* CV Mean Chart */}
            <div className="p-5 bg-[#202024] border border-[#2A2A2F] rounded-xl">
              <h4 className="text-[12px] font-bold text-[#FAFAFA] uppercase tracking-wider mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#7C5CFC]" />
                Cross Validation Score (CV Mean) Distribution
              </h4>
              <div className="flex flex-col gap-3">
                {(() => {
                  const sortedModels = [...report.models.all_metrics].sort((a: any, b: any) => b.cv_mean - a.cv_mean);
                  const maxCV = Math.max(...sortedModels.map((m: any) => Math.abs(m.cv_mean)), 0.01);
                  
                  return sortedModels.map((model: any, idx: number) => {
                    const pct = maxCV > 0 ? (model.cv_mean / maxCV) * 100 : 0;
                    return (
                      <div key={idx} className="flex flex-col sm:flex-row sm:items-center gap-2 text-[12px]">
                        <span className="sm:w-1/4 font-semibold text-[#FAFAFA] truncate">{model.name}</span>
                        <div className="flex-1 flex items-center gap-3">
                          <div className="h-3 w-full rounded-full bg-[#18181B] overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                model.is_best ? "bg-[#7C5CFC]" : "bg-[#5A5C66]"
                              }`}
                              style={{ width: `${Math.max(pct, 0)}%` }}
                            />
                          </div>
                          <span className="w-16 text-right font-mono font-semibold text-[#FAFAFA]">
                            {fmt(model.cv_mean)}
                          </span>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 p-5 bg-[rgba(113,113,122,0.08)] border border-[rgba(113,113,122,0.2)] rounded-xl">
            <Info className="w-5 h-5 text-[#71717A] flex-shrink-0" />
            <p className="text-[13px] text-[#A1A1AA]">
              Not generated for this analysis session.
            </p>
          </div>
        )}
      </div>

      {/* ── Section 6: Key Influential Features ── */}
      <div id="explainability" className="bg-[#18181B] border border-[#2A2A2F] rounded-2xl p-6 scroll-mt-20">
        <SectionHeading number={6} title="Key Influential Features" />
        {hasShap ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Metadata and top features list */}
            <div className="flex flex-col gap-4">
              <div className="p-4 bg-[#202024] border border-[#2A2A2F] rounded-xl flex flex-col gap-2">
                <div className="flex justify-between items-center text-[12px] text-[#A1A1AA]">
                  <span>Model Explained</span>
                  <span className="font-semibold text-[#FAFAFA]">{report.models.best_model.name}</span>
                </div>
                <div className="flex justify-between items-center text-[12px] text-[#A1A1AA]">
                  <span>Explanation Methodology</span>
                  <span className="font-mono font-semibold text-[#7C5CFC]">SHAP (SHapley Additive exPlanations)</span>
                </div>
                <div className="flex justify-between items-center text-[12px] text-[#A1A1AA]">
                  <span>Primary Influential Feature</span>
                  <span className="font-semibold text-[#22C55E]">
                    {cleanFeatureName(report.key_business_drivers[0]?.feature)}
                  </span>
                </div>
              </div>

              {/* Drivers rankings table */}
              <div className="overflow-hidden border border-[#2A2A2F] rounded-xl bg-[#1A1A1E]">
                <table className="w-full border-collapse text-[12px] text-[#A1A1AA]">
                  <thead>
                    <tr className="border-b border-[#2A2A2F] bg-[#202024] text-[#FAFAFA]">
                      <th className="py-2 px-3 text-left font-bold w-12">Rank</th>
                      <th className="py-2 px-3 text-left font-bold">Feature Name</th>
                      <th className="py-2 px-3 text-right font-bold">Absolute Importance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.key_business_drivers.slice(0, 5).map((drv: any, idx: number) => (
                      <tr key={idx} className="border-b border-[#2A2A2F]/50 last:border-0">
                        <td className="py-2.5 px-3 font-mono font-bold text-[#71717A]">{idx + 1}</td>
                        <td className="py-2.5 px-3 font-semibold text-[#FAFAFA]">
                          {cleanFeatureName(drv.feature)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-mono font-bold text-[#7C5CFC]">
                          {fmt(drv.importance)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Importance Bar Chart */}
            <div className="p-5 bg-[#202024] border border-[#2A2A2F] rounded-xl flex flex-col justify-center">
              <h4 className="text-[12px] font-bold text-[#FAFAFA] uppercase tracking-wider mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#7C5CFC]" />
                Feature Importance (SHAP values)
              </h4>
              <div className="flex flex-col gap-3">
                {(() => {
                  const maxImportance = Math.max(...report.key_business_drivers.map((d: any) => d.importance), 0.0001);
                  return report.key_business_drivers.slice(0, 7).map((drv: any, idx: number) => {
                    const pct = (drv.importance / maxImportance) * 100;
                    return (
                      <div key={idx} className="flex flex-col gap-1 text-[11px]">
                        <div className="flex justify-between items-center text-[12px]">
                          <span className="font-semibold text-[#FAFAFA]">{cleanFeatureName(drv.feature)}</span>
                          <span className="font-mono text-[#A1A1AA]">{fmt(drv.importance)}</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-[#18181B] overflow-hidden">
                          <div className="bg-[#7C5CFC] h-full rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 p-5 bg-[rgba(113,113,122,0.08)] border border-[rgba(113,113,122,0.2)] rounded-xl">
            <Info className="w-5 h-5 text-[#71717A] flex-shrink-0" />
            <p className="text-[13px] text-[#A1A1AA]">
              Not generated for this analysis session.
            </p>
          </div>
        )}
      </div>

      {/* ── Section 7: Recommended Baseline Model Card ── */}
      <div id="recommendation" className="bg-[#18181B] border border-l-4 border-l-[#7C5CFC] border-[#2A2A2F] rounded-r-2xl p-6 scroll-mt-20">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-[rgba(124,92,252,0.1)] rounded-xl border border-[rgba(124,92,252,0.2)] text-[#7C5CFC] flex-shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div className="flex-1 flex flex-col gap-2">
            <h3 className="text-[16px] font-bold text-[#FAFAFA]">Recommended Baseline Model</h3>
            {hasModels ? (
              <>
                <p className="text-[13px] text-[#A1A1AA] leading-relaxed">
                  {report.models.best_model.description}
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 pt-3 border-t border-[#2A2A2F]">
                  <div>
                    <span className="text-[11px] text-[#71717A] uppercase font-bold tracking-wider">Validation Metrics</span>
                    <ul className="text-[12px] text-[#A1A1AA] mt-1.5 space-y-1">
                      <li>• Primary Metric Value: <span className="font-mono text-[#FAFAFA]">{fmt(report.models.best_model.primary_metric_value)}</span> ({report.models.best_model.primary_metric})</li>
                      <li>• CV Score Mean: <span className="font-mono text-[#FAFAFA]">{fmt(report.models.best_model.cv_mean)}</span></li>
                      <li>• CV Standard Deviation: <span className="font-mono text-[#FAFAFA]">{fmt(report.models.best_model.cv_std)}</span></li>
                    </ul>
                  </div>
                  <div>
                    <span className="text-[11px] text-[#71717A] uppercase font-bold tracking-wider">Deployment Caveats</span>
                    <ul className="text-[12px] text-[#A1A1AA] mt-1.5 space-y-1">
                      <li>• Preprocessing pipeline standard scaling must be identical in inference.</li>
                      <li>• Ensure features like <span className="font-mono text-[#FAFAFA]">{hasShap ? cleanFeatureName(report.key_business_drivers[0]?.feature) : "top inputs"}</span> are populated for robust predictions.</li>
                      <li>• Re-train baseline models if the data distribution shifts significantly.</li>
                    </ul>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-[13px] text-[#A1A1AA] leading-relaxed">
                Not generated for this analysis session.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Section 8: Limitations & Next Steps ── */}
      <div id="limitations" className="bg-[#18181B] border border-[#2A2A2F] rounded-2xl p-6 scroll-mt-20">
        <SectionHeading number={8} title="Limitations &amp; Next Steps" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-[13px] text-[#A1A1AA]">
          <div>
            <h4 className="text-[12px] font-bold text-[#FAFAFA] uppercase tracking-wider mb-2">Key Limitations</h4>
            <ul className="space-y-2.5">
              {duplicatesCount > 0 && (
                <li className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-[#EF4444] flex-shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-[#FAFAFA]">Duplicates Detected:</strong> {duplicatesCount} duplicate rows were identified, which can cause overfitting or data leakage if not handled.
                  </span>
                </li>
              )}
              <li className="flex items-start gap-2">
                <Info className="w-4 h-4 text-[#7C5CFC] flex-shrink-0 mt-0.5" />
                <span>
                  <strong className="text-[#FAFAFA]">Baseline Constraints:</strong> Evaluated a limited set of 3 baseline models with default hyperparameters. No hyperparameter optimization was performed.
                </span>
              </li>
              {hasShap && (
                <li className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-[#7C5CFC] flex-shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-[#FAFAFA]">Correlation != Causation:</strong> SHAP feature importance reflects model contribution to predictions, not physical or causal relationships.
                  </span>
                </li>
              )}
            </ul>
          </div>
          <div>
            <h4 className="text-[12px] font-bold text-[#FAFAFA] uppercase tracking-wider mb-2">Recommended Next Steps</h4>
            <ul className="space-y-2.5">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#22C55E] flex-shrink-0 mt-0.5" />
                <span>
                  Perform hyperparameter tuning (e.g. Grid Search, Optuna) on the selected model to maximize predictive accuracy.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#22C55E] flex-shrink-0 mt-0.5" />
                <span>
                  Validate the recommended baseline model on an independent, unseen test dataset to ensure generalization performance.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#22C55E] flex-shrink-0 mt-0.5" />
                <span>
                  Export the preprocessing pipeline to guarantee identical scaling/encoding during inference.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* ── Section 9: Report Status & Appendix ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-2">
        {/* Report Compilation Status */}
        <div className="lg:col-span-6 bg-[#18181B] border border-[#2A2A2F] rounded-2xl p-6 flex flex-col gap-4">
          <h3 className="text-[13px] font-bold text-[#FAFAFA] uppercase tracking-wider">Report Generation Status</h3>
          <div className="flex flex-col gap-2.5">
            {Object.entries(sectionStatus).map(([key, item]) => (
              <div key={key} className="flex justify-between items-center text-[12px] py-1.5 border-b border-[#202024] last:border-0">
                <span className="font-medium text-[#A1A1AA]">{item.label}</span>
                {item.available ? (
                  <span className="flex items-center gap-1 text-[#22C55E] font-semibold">
                    <Check className="w-4 h-4" /> SUCCESS
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[#71717A] font-semibold">
                    <Clock className="w-4 h-4" /> UNAVAILABLE
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Technical Appendix */}
        <div className="lg:col-span-6 bg-[#18181B] border border-[#2A2A2F] rounded-2xl p-6">
          <h3 className="text-[13px] font-bold text-[#FAFAFA] uppercase tracking-wider mb-4">Technical Appendix</h3>
          <div className="grid grid-cols-2 gap-3 text-[12px]">
            <div>
              <span className="text-[#71717A] block mb-0.5">Session ID</span>
              <span className="font-mono text-[#FAFAFA] block truncate" title={report.session_id}>
                {report.session_id}
              </span>
            </div>
            <div>
              <span className="text-[#71717A] block mb-0.5">Generated Timestamp</span>
              <span className="text-[#FAFAFA] block">{report.cover_page?.date}</span>
            </div>
            <div>
              <span className="text-[#71717A] block mb-0.5">Automated ML Task</span>
              <span className="text-[#FAFAFA] block font-mono">{report.appendix?.ml_task ?? "N/A"}</span>
            </div>
            <div>
              <span className="text-[#71717A] block mb-0.5">Target Feature Column</span>
              <span className="text-[#FAFAFA] block font-mono">{report.appendix?.target_column ?? "N/A"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
