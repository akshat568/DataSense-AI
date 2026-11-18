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
    <div className="flex items-baseline gap-3 pb-3 mb-6 border-b border-[#E5E9E2]">
      <span className="text-[12px] font-mono font-bold text-[#26332D] bg-[#F1F5EF] px-2 py-0.5 rounded border border-[#E5E9E2]">
        0{number}
      </span>
      <h2 className="text-[17px] font-bold text-[#26332D] tracking-tight">{title}</h2>
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
            "Failed to generate report. Ensure dataset profiling is complete."
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
      <div className="flex flex-col gap-6 fade-in">
        <PageHeader
          title="Executive Intelligence Report"
          breadcrumb={["Analysis", "Reports"]}
        />
        <EmptyState
          icon={FileText}
          title="No Active Dataset Session"
          description="Upload a CSV dataset and complete the analysis workflow to generate an executive intelligence report."
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-6 fade-in">
        <PageHeader
          title="Executive Intelligence Report"
          breadcrumb={["Analysis", "Reports"]}
        />
        <div className="flex flex-col items-center justify-center min-h-[50vh] gap-3">
          <div className="w-8 h-8 border-2 border-[#E5E9E2] border-t-[#26332D] rounded-full animate-spin" />
          <p className="text-[13.5px] text-[#64736A]">
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
          title="Executive Intelligence Report"
          breadcrumb={["Analysis", "Reports"]}
        />
        <div className="flex items-start gap-3 p-5 bg-[#FEF2F2] border border-[#FECACA] rounded-2xl">
          <AlertCircle className="w-5 h-5 text-[#DC2626] mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-[14px] font-bold text-[#DC2626]">
              Report Generation Failed
            </p>
            <p className="text-[13px] text-[#DC2626] mt-1">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!report) return null;

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
        title="Executive Intelligence Report"
        breadcrumb={["Analysis", "Reports"]}
        description={`${report.cover_page?.subtitle || "Dataset intelligence analysis"} · ${rowsCount.toLocaleString()} rows × ${colsCount} features · Generated: ${report.cover_page?.date || ""}`}
        actions={
          <div className="flex items-center gap-3">
            <button
              onClick={handleExportJson}
              disabled={dlJson}
              className="btn btn-secondary gap-2"
            >
              <FileCode className="w-4 h-4 text-[#64736A]" />
              Export JSON
            </button>

            <button
              onClick={() => handleExport("pdf")}
              disabled={dlPdf}
              className="btn btn-primary gap-2"
              style={{
                boxShadow: "0 1px 3px rgba(38, 51, 45, 0.08)",
              }}
            >
              {dlPdf ? (
                <div className="w-3.5 h-3.5 border-2 border-[#26332D]/30 border-t-[#26332D] rounded-full animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              Export PDF
            </button>
          </div>
        }
      />

      {/* ── Section Quick Navigation Bar ── */}
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[12.5px] text-[#64736A] pb-3 border-b border-[#E5E9E2]">
        {[
          { label: "Overview", targetId: "overview" },
          { label: "Data Quality", targetId: "data-quality" },
          { label: "AI Action Plan", targetId: "ai-insights" },
          { label: "Model Leaderboard", targetId: "models" },
          { label: "Explainability", targetId: "explainability" },
          { label: "Recommended Model", targetId: "recommendation" },
          { label: "Limitations & Next Steps", targetId: "limitations" },
        ].map((item, index) => (
          <span key={item.targetId} className="flex items-center">
            {index > 0 && <span className="text-[#C4CCC2] mr-2">·</span>}
            <button
              onClick={() => {
                const el = document.getElementById(item.targetId);
                if (el) {
                  el.scrollIntoView({ behavior: "smooth", block: "start" });
                }
              }}
              className="hover:text-[#26332D] font-medium transition-colors cursor-pointer py-0.5"
            >
              {item.label}
            </button>
          </span>
        ))}
      </div>

      {/* ── Executive Summary Metrics ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Card 1: Data Readiness */}
        <div className="p-4.5 bg-white border border-[#E5E9E2] rounded-2xl shadow-[0_1px_3px_rgba(38,51,45,0.03)] flex flex-col justify-between min-h-[110px]">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10.5px] text-[#78827A] uppercase font-bold tracking-wider">Readiness</span>
              <ShieldCheck className="w-4 h-4 text-[#26332D]" />
            </div>
            <div className="text-[15.5px] font-bold text-[#26332D] truncate mt-1">
              {report.cover_page?.dataset_readiness || "N/A"}
            </div>
          </div>
          <div className="mt-2">
            <Badge severity={getSeverityBadge(report.cover_page?.dataset_readiness)}>
              {report.recommendations?.risk_assessment?.overall_risk || "Low Risk"}
            </Badge>
          </div>
        </div>

        {/* Card 2: Missing Values */}
        <div className="p-4.5 bg-white border border-[#E5E9E2] rounded-2xl shadow-[0_1px_3px_rgba(38,51,45,0.03)] flex flex-col justify-between min-h-[110px]">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10.5px] text-[#78827A] uppercase font-bold tracking-wider">Missing Cells</span>
              <AlertTriangle className="w-4 h-4 text-[#B45309]" />
            </div>
            <div className="text-[22px] font-bold text-[#26332D] font-mono leading-none mt-1">
              {missingCellsCount.toLocaleString()}
            </div>
          </div>
          <div className="mt-2 text-[12px] text-[#64736A]">
            {missingPct.toFixed(2)}% of total observations
          </div>
        </div>

        {/* Card 3: Duplicate Rows */}
        <div className="p-4.5 bg-white border border-[#E5E9E2] rounded-2xl shadow-[0_1px_3px_rgba(38,51,45,0.03)] flex flex-col justify-between min-h-[110px]">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10.5px] text-[#78827A] uppercase font-bold tracking-wider">Duplicate Rows</span>
              <Layers className="w-4 h-4 text-[#26332D]" />
            </div>
            <div className="text-[22px] font-bold text-[#26332D] font-mono leading-none mt-1">
              {duplicatesCount.toLocaleString()}
            </div>
          </div>
          <div className="mt-2 text-[12px] text-[#64736A]">
            {duplicatesPct.toFixed(2)}% rate
          </div>
        </div>

        {/* Card 4: Detected Task */}
        <div className="p-4.5 bg-white border border-[#E5E9E2] rounded-2xl shadow-[0_1px_3px_rgba(38,51,45,0.03)] flex flex-col justify-between min-h-[110px]">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10.5px] text-[#78827A] uppercase font-bold tracking-wider">Detected Task</span>
              <Activity className="w-4 h-4 text-[#2A7E4F]" />
            </div>
            <div className="text-[15.5px] font-bold text-[#26332D] truncate mt-1">
              {report.appendix?.ml_task || "N/A"}
            </div>
          </div>
          <div className="mt-2 text-[12px] text-[#64736A] truncate">
            Target: <span className="font-mono text-[#26332D] font-semibold">{report.appendix?.target_column || "N/A"}</span>
          </div>
        </div>

        {/* Card 5: Best Model */}
        <div className="p-4.5 bg-white border border-[#E5E9E2] rounded-2xl shadow-[0_1px_3px_rgba(38,51,45,0.03)] flex flex-col justify-between min-h-[110px]">
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-[10.5px] text-[#78827A] uppercase font-bold tracking-wider">Winning Model</span>
              <Award className="w-4 h-4 text-[#B45309]" />
            </div>
            <div className="text-[15.5px] font-bold text-[#26332D] truncate mt-1">
              {hasModels ? report.models.best_model.name : "N/A"}
            </div>
          </div>
          <div className="mt-2 text-[12px] text-[#64736A] flex items-center gap-1">
            {hasModels ? (
              <>
                <span className="text-[#166534] font-bold font-mono">
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
        {/* Left Column: Executive Narrative & Data Overview (7 cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          {/* Executive Narrative */}
          <div className="bg-white border border-[#E5E9E2] rounded-2xl p-6 shadow-[0_1px_3px_rgba(38,51,45,0.03)]">
            <SectionHeading number={1} title="Executive Summary &amp; Assessment" />
            <p className="text-[13.5px] text-[#26332D] leading-relaxed">
              {report.executive_summary}
            </p>
            <div className="mt-4 p-4 bg-[#F1F6EC] rounded-xl border border-[#DCE8DC] flex items-start gap-3">
              <Sparkles className="w-4 h-4 text-[#26332D] flex-shrink-0 mt-0.5" />
              <p className="text-[13px] text-[#26332D] leading-relaxed">
                <span className="font-bold">AI Conclusion: </span>
                {report.ai_conclusion}
              </p>
            </div>
          </div>

          {/* Dataset Dimensions Overview */}
          <div className="bg-white border border-[#E5E9E2] rounded-2xl p-6 shadow-[0_1px_3px_rgba(38,51,45,0.03)]">
            <SectionHeading number={2} title="Dataset Dimensions &amp; Types" />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
              <div className="p-3.5 bg-[#FAFBF9] border border-[#E5E9E2] rounded-xl">
                <p className="text-[10px] text-[#78827A] uppercase font-bold tracking-wider mb-1">Total Rows</p>
                <p className="text-[17px] font-bold text-[#26332D] font-mono leading-none">{rowsCount.toLocaleString()}</p>
              </div>
              <div className="p-3.5 bg-[#FAFBF9] border border-[#E5E9E2] rounded-xl">
                <p className="text-[10px] text-[#78827A] uppercase font-bold tracking-wider mb-1">Total Columns</p>
                <p className="text-[17px] font-bold text-[#26332D] font-mono leading-none">{colsCount}</p>
              </div>
              <div className="p-3.5 bg-[#FAFBF9] border border-[#E5E9E2] rounded-xl">
                <p className="text-[10px] text-[#78827A] uppercase font-bold tracking-wider mb-1">Target Feature</p>
                <p className="text-[13px] font-bold text-[#26332D] font-mono truncate leading-none pt-0.5">
                  {report.appendix?.target_column || "None detected"}
                </p>
              </div>
              <div className="p-3.5 bg-[#FAFBF9] border border-[#E5E9E2] rounded-xl">
                <p className="text-[10px] text-[#78827A] uppercase font-bold tracking-wider mb-1">Numeric Features</p>
                <p className="text-[17px] font-bold text-[#26332D] font-mono leading-none">{numericCount}</p>
              </div>
              <div className="p-3.5 bg-[#FAFBF9] border border-[#E5E9E2] rounded-xl">
                <p className="text-[10px] text-[#78827A] uppercase font-bold tracking-wider mb-1">Categorical Features</p>
                <p className="text-[17px] font-bold text-[#26332D] font-mono leading-none">{categoricalCount}</p>
              </div>
              <div className="p-3.5 bg-[#FAFBF9] border border-[#E5E9E2] rounded-xl">
                <p className="text-[10px] text-[#78827A] uppercase font-bold tracking-wider mb-1">Duplicate Rows</p>
                <p className="text-[17px] font-bold text-[#26332D] font-mono leading-none">{duplicatesCount}</p>
              </div>
            </div>
          </div>

          {/* Data Quality Visuals */}
          <div id="data-quality" className="bg-white border border-[#E5E9E2] rounded-2xl p-6 shadow-[0_1px_3px_rgba(38,51,45,0.03)] scroll-mt-20">
            <SectionHeading number={3} title="Data Quality &amp; Completeness Analysis" />
            <div className="space-y-4">
              {/* Completeness Bar */}
              <div>
                <div className="flex justify-between items-center text-[12.5px] mb-1.5">
                  <span className="text-[#26332D] font-semibold">Data Completeness</span>
                  <span className="font-mono text-[#166534] font-bold">{completenessPct.toFixed(2)}%</span>
                </div>
                <div className="h-2 w-full rounded-full bg-[#EEF2EB] overflow-hidden">
                  <div className="bg-[#2A7E4F] h-full" style={{ width: `${completenessPct}%` }} />
                </div>
              </div>

              {/* Missing Values Bar */}
              <div>
                <div className="flex justify-between items-center text-[12.5px] mb-1.5">
                  <span className="text-[#26332D] font-semibold">Missing Value Observations</span>
                  <span className="font-mono text-[#64736A]">{missingCellsCount} cells ({missingPct.toFixed(2)}%)</span>
                </div>
                <div className="h-2 w-full rounded-full bg-[#EEF2EB] overflow-hidden">
                  <div
                    className={`${missingCellsCount > 0 ? "bg-[#D97706]" : "bg-[#2A7E4F]"} h-full`}
                    style={{ width: `${Math.max(missingPct, missingCellsCount > 0 ? 2 : 0)}%` }}
                  />
                </div>
              </div>

              {/* Duplicate Rows Bar */}
              <div>
                <div className="flex justify-between items-center text-[12.5px] mb-1.5">
                  <span className="text-[#26332D] font-semibold">Duplicate Row Rate</span>
                  <span className="font-mono text-[#64736A]">{duplicatesCount} rows ({duplicatesPct.toFixed(2)}%)</span>
                </div>
                <div className="h-2 w-full rounded-full bg-[#EEF2EB] overflow-hidden">
                  <div
                    className={`${duplicatesCount > 0 ? "bg-[#DC2626]" : "bg-[#2A7E4F]"} h-full`}
                    style={{ width: `${Math.max(duplicatesPct, duplicatesCount > 0 ? 2 : 0)}%` }}
                  />
                </div>
              </div>

              {/* Feature Type distribution */}
              <div className="pt-2">
                <div className="flex justify-between items-center text-[12.5px] mb-1.5">
                  <span className="text-[#26332D] font-semibold">Feature Types</span>
                  <span className="font-mono text-[#64736A]">{totalFeatures} input columns</span>
                </div>
                <div className="h-3 w-full rounded-full bg-[#EEF2EB] overflow-hidden flex">
                  <div className="bg-[#26332D]" style={{ width: `${numPct}%` }} />
                  <div className="bg-[#88CC33]" style={{ width: `${catPct}%` }} />
                </div>
                <div className="flex gap-4 text-[12px] text-[#64736A] mt-2">
                  <span className="flex items-center gap-1.5 font-medium">
                    <span className="w-2.5 h-2.5 rounded-sm bg-[#26332D]" />
                    Numeric ({numericCount})
                  </span>
                  <span className="flex items-center gap-1.5 font-medium">
                    <span className="w-2.5 h-2.5 rounded-sm bg-[#88CC33]" />
                    Categorical ({categoricalCount})
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Preprocessing Action Plan (5 cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <div id="ai-insights" className="bg-white border border-[#E5E9E2] rounded-2xl p-6 shadow-[0_1px_3px_rgba(38,51,45,0.03)] scroll-mt-20">
            <SectionHeading number={4} title="AI Preprocessing Action Plan" />
            <div className="flex flex-col gap-4">
              <h3 className="text-[11.5px] font-bold text-[#78827A] uppercase tracking-wider">
                Immediate Recommended Actions
              </h3>
              {report.recommendations?.immediate_actions?.length > 0 ? (
                <div className="space-y-3">
                  {report.recommendations.immediate_actions.map((rec: any, i: number) => (
                    <div key={i} className="p-3.5 bg-[#FEF2F2] border border-[#FECACA] rounded-xl flex flex-col gap-1.5">
                      <div className="flex justify-between items-center">
                        <span className="text-[12.5px] font-bold text-[#26332D] font-mono">
                          {cleanFeatureName(rec.column)}
                        </span>
                        <Badge severity={rec.severity}>{rec.severity}</Badge>
                      </div>
                      <p className="text-[12px] text-[#DC2626] font-semibold">{rec.issue}</p>
                      <p className="text-[12.5px] text-[#26332D]">
                        <span className="font-bold">Action: </span>
                        {rec.action}
                      </p>
                      {rec.reason && (
                        <p className="text-[11.5px] text-[#64736A] italic">
                          {rec.reason}
                        </p>
                      )}
                      {rec.confidence != null && (
                        <div className="flex items-center gap-1 text-[11px] text-[#26332D] font-mono mt-0.5">
                          <Percent className="w-3.5 h-3.5" />
                          <span>Confidence: {(rec.confidence * 100).toFixed(0)}%</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-[#EDF7F1] border border-[#BCE2CC] rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#2A7E4F]" />
                  <p className="text-[12.5px] text-[#166534] font-medium">No immediate critical actions required.</p>
                </div>
              )}

              <h3 className="text-[11.5px] font-bold text-[#78827A] uppercase tracking-wider mt-2">
                Secondary Quality Improvements
              </h3>
              {report.recommendations?.future_improvements?.length > 0 ? (
                <div className="space-y-3">
                  {report.recommendations.future_improvements.map((rec: any, i: number) => (
                    <div key={i} className="p-3.5 bg-[#FAFBF9] border border-[#E5E9E2] rounded-xl flex flex-col gap-1.5">
                      <div className="flex justify-between items-center">
                        <span className="text-[12.5px] font-bold text-[#26332D] font-mono">
                          {cleanFeatureName(rec.column)}
                        </span>
                        <Badge severity={rec.severity}>{rec.severity}</Badge>
                      </div>
                      <p className="text-[12px] text-[#B45309] font-medium">{rec.issue}</p>
                      <p className="text-[12.5px] text-[#26332D]">
                        <span className="font-bold">Action: </span>
                        {rec.action}
                      </p>
                      {rec.reason && (
                        <p className="text-[11.5px] text-[#64736A] italic">
                          {rec.reason}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[12px] text-[#78827A] italic">No secondary optimizations recommended.</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Section 5: Baseline Model Performance Leaderboard ── */}
      <div id="models" className="bg-white border border-[#E5E9E2] rounded-2xl p-6 shadow-[0_1px_3px_rgba(38,51,45,0.03)] scroll-mt-20">
        <SectionHeading number={5} title="Baseline Model Performance Leaderboard" />
        {hasModels ? (
          <div className="flex flex-col gap-6">
            <div className="overflow-x-auto border border-[#E5E9E2] rounded-xl bg-white">
              <table className="w-full border-collapse text-[13px] text-[#26332D]">
                <thead>
                  <tr className="border-b border-[#E5E9E2] bg-[#F9FAF7] text-[#78827A]">
                    <th className="py-3 px-4 text-left font-bold text-[11px] uppercase tracking-wider">Model Architecture</th>
                    <th className="py-3 px-4 text-center font-bold text-[11px] uppercase tracking-wider">
                      {report.models.best_model.primary_metric}
                    </th>
                    <th className="py-3 px-4 text-center font-bold text-[11px] uppercase tracking-wider">CV Mean</th>
                    <th className="py-3 px-4 text-center font-bold text-[11px] uppercase tracking-wider">CV Std</th>
                    <th className="py-3 px-4 text-center font-bold text-[11px] uppercase tracking-wider">Training Time</th>
                    <th className="py-3 px-4 text-center font-bold text-[11px] uppercase tracking-wider">Status</th>
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
                        className={`border-b border-[#EEF2EB] last:border-0 hover:bg-[#F6F8F4] transition-colors ${
                          isWinner ? "bg-[#F4FBD6]/50" : ""
                        }`}
                      >
                        <td className="py-3 px-4 font-semibold flex items-center gap-2">
                          {isWinner && <Trophy className="w-4 h-4 text-[#B45309]" />}
                          {model.name}
                        </td>
                        <td className="py-3 px-4 text-center font-mono font-bold text-[#166534]">
                          {fmt(model.metrics?.[pKey])}
                        </td>
                        <td className="py-3 px-4 text-center font-mono">
                          {fmt(model.cv_mean)}
                        </td>
                        <td className="py-3 px-4 text-center font-mono text-[#78827A]">
                          ±{fmt(model.cv_std)}
                        </td>
                        <td className="py-3 px-4 text-center font-mono text-[#64736A]">
                          {model.training_time != null ? `${model.training_time.toFixed(3)}s` : "N/A"}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {isWinner ? (
                            <span className="text-[10.5px] font-bold uppercase px-2.5 py-0.5 rounded-md bg-[#F3FCD7] text-[#28440D] border border-[#D2F775]">
                              Winner
                            </span>
                          ) : (
                            <span className="text-[10.5px] font-bold uppercase px-2.5 py-0.5 rounded-md bg-[#F1F5EF] text-[#64736A] border border-[#E5E9E2]">
                              Evaluated
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Cross-Validation Progress Visualization */}
            <div className="p-5 bg-[#FAFBF9] border border-[#E5E9E2] rounded-xl">
              <h4 className="text-[12px] font-bold text-[#26332D] uppercase tracking-wider mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#26332D]" />
                Cross Validation Score (CV Mean) Distribution
              </h4>
              <div className="flex flex-col gap-3">
                {(() => {
                  const sortedModels = [...report.models.all_metrics].sort((a: any, b: any) => b.cv_mean - a.cv_mean);
                  const maxCV = Math.max(...sortedModels.map((m: any) => Math.abs(m.cv_mean)), 0.01);
                  
                  return sortedModels.map((model: any, idx: number) => {
                    const pct = maxCV > 0 ? (model.cv_mean / maxCV) * 100 : 0;
                    return (
                      <div key={idx} className="flex flex-col sm:flex-row sm:items-center gap-2 text-[12.5px]">
                        <span className="sm:w-1/4 font-semibold text-[#26332D] truncate">{model.name}</span>
                        <div className="flex-1 flex items-center gap-3">
                          <div className="h-2.5 w-full rounded-full bg-[#EEF2EB] overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all duration-500 ${
                                model.is_best ? "bg-[#26332D]" : "bg-[#9EB0A6]"
                              }`}
                              style={{ width: `${Math.max(pct, 0)}%` }}
                            />
                          </div>
                          <span className="w-16 text-right font-mono font-semibold text-[#26332D]">
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
          <div className="flex items-center gap-3 p-5 bg-[#FAFBF9] border border-[#E5E9E2] rounded-xl">
            <Info className="w-5 h-5 text-[#78827A] flex-shrink-0" />
            <p className="text-[13px] text-[#64736A]">
              Baseline models not evaluated for this session.
            </p>
          </div>
        )}
      </div>

      {/* ── Section 6: Key Influential Features (SHAP) ── */}
      <div id="explainability" className="bg-white border border-[#E5E9E2] rounded-2xl p-6 shadow-[0_1px_3px_rgba(38,51,45,0.03)] scroll-mt-20">
        <SectionHeading number={6} title="Key Influential Features (SHAP Importance)" />
        {hasShap ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
            <div className="flex flex-col gap-4">
              <div className="p-4 bg-[#FAFBF9] border border-[#E5E9E2] rounded-xl flex flex-col gap-2">
                <div className="flex justify-between items-center text-[12.5px]">
                  <span className="text-[#64736A]">Model Architecture</span>
                  <span className="font-semibold text-[#26332D]">{report.models.best_model.name}</span>
                </div>
                <div className="flex justify-between items-center text-[12.5px]">
                  <span className="text-[#64736A]">Explainability Method</span>
                  <span className="font-mono font-semibold text-[#26332D]">SHAP (SHapley Additive exPlanations)</span>
                </div>
                <div className="flex justify-between items-center text-[12.5px]">
                  <span className="text-[#64736A]">Top Feature Impact</span>
                  <span className="font-semibold text-[#166534]">
                    {cleanFeatureName(report.key_business_drivers[0]?.feature)}
                  </span>
                </div>
              </div>

              {/* Table */}
              <div className="overflow-hidden border border-[#E5E9E2] rounded-xl bg-white">
                <table className="w-full border-collapse text-[12.5px] text-[#26332D]">
                  <thead>
                    <tr className="border-b border-[#E5E9E2] bg-[#F9FAF7] text-[#78827A]">
                      <th className="py-2.5 px-3.5 text-left font-bold w-12 text-[10.5px] uppercase tracking-wider">Rank</th>
                      <th className="py-2.5 px-3.5 text-left font-bold text-[10.5px] uppercase tracking-wider">Feature</th>
                      <th className="py-2.5 px-3.5 text-right font-bold text-[10.5px] uppercase tracking-wider">Mean |SHAP|</th>
                    </tr>
                  </thead>
                  <tbody>
                    {report.key_business_drivers.slice(0, 5).map((drv: any, idx: number) => (
                      <tr key={idx} className="border-b border-[#EEF2EB] last:border-0 hover:bg-[#F6F8F4]">
                        <td className="py-2.5 px-3.5 font-mono font-bold text-[#78827A]">#{idx + 1}</td>
                        <td className="py-2.5 px-3.5 font-semibold text-[#26332D]">
                          {cleanFeatureName(drv.feature)}
                        </td>
                        <td className="py-2.5 px-3.5 text-right font-mono font-bold text-[#26332D]">
                          {fmt(drv.importance)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Importance Bar Chart */}
            <div className="p-5 bg-[#FAFBF9] border border-[#E5E9E2] rounded-xl flex flex-col justify-center">
              <h4 className="text-[12px] font-bold text-[#26332D] uppercase tracking-wider mb-4 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#26332D]" />
                Feature Importance (SHAP values)
              </h4>
              <div className="flex flex-col gap-3">
                {(() => {
                  const maxImportance = Math.max(...report.key_business_drivers.map((d: any) => d.importance), 0.0001);
                  return report.key_business_drivers.slice(0, 7).map((drv: any, idx: number) => {
                    const pct = (drv.importance / maxImportance) * 100;
                    return (
                      <div key={idx} className="flex flex-col gap-1 text-[11.5px]">
                        <div className="flex justify-between items-center text-[12px]">
                          <span className="font-semibold text-[#26332D]">{cleanFeatureName(drv.feature)}</span>
                          <span className="font-mono text-[#64736A]">{fmt(drv.importance)}</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-[#EEF2EB] overflow-hidden">
                          <div className="bg-[#26332D] h-full rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-3 p-5 bg-[#FAFBF9] border border-[#E5E9E2] rounded-xl">
            <Info className="w-5 h-5 text-[#78827A] flex-shrink-0" />
            <p className="text-[13px] text-[#64736A]">
              SHAP explainability not generated for this session.
            </p>
          </div>
        )}
      </div>

      {/* ── Section 7: Recommended Baseline Model Card ── */}
      <div id="recommendation" className="bg-white border-2 border-[#26332D] rounded-2xl p-6 shadow-[0_2px_8px_rgba(38,51,45,0.06)] scroll-mt-20">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-[#F1F5EF] rounded-xl border border-[#E5E9E2] text-[#26332D] flex-shrink-0">
            <Award className="w-6 h-6" />
          </div>
          <div className="flex-1 flex flex-col gap-2">
            <h3 className="text-[17px] font-bold text-[#26332D]">Recommended Baseline Model</h3>
            {hasModels ? (
              <>
                <p className="text-[13.5px] text-[#64736A] leading-relaxed">
                  {report.models.best_model.description}
                </p>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mt-3 pt-3 border-t border-[#E5E9E2]">
                  <div>
                    <span className="text-[11px] text-[#78827A] uppercase font-bold tracking-wider">Validation Metrics</span>
                    <ul className="text-[12.5px] text-[#26332D] mt-2 space-y-1">
                      <li>• Primary Metric Value: <span className="font-mono font-bold text-[#166534]">{fmt(report.models.best_model.primary_metric_value)}</span> ({report.models.best_model.primary_metric})</li>
                      <li>• CV Score Mean: <span className="font-mono font-bold">{fmt(report.models.best_model.cv_mean)}</span></li>
                      <li>• CV Standard Deviation: <span className="font-mono font-bold text-[#78827A]">{fmt(report.models.best_model.cv_std)}</span></li>
                    </ul>
                  </div>
                  <div>
                    <span className="text-[11px] text-[#78827A] uppercase font-bold tracking-wider">Inference &amp; Deployment Notes</span>
                    <ul className="text-[12.5px] text-[#64736A] mt-2 space-y-1">
                      <li>• Preprocessing pipeline scaling must be maintained in production.</li>
                      <li>• Top features must be present and non-null for reliable scoring.</li>
                      <li>• Periodic evaluation recommended if real-world data shifts.</li>
                    </ul>
                  </div>
                </div>
              </>
            ) : (
              <p className="text-[13px] text-[#64736A]">
                Baseline models not trained for this session.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── Section 8: Limitations & Next Steps ── */}
      <div id="limitations" className="bg-white border border-[#E5E9E2] rounded-2xl p-6 shadow-[0_1px_3px_rgba(38,51,45,0.03)] scroll-mt-20">
        <SectionHeading number={8} title="Limitations &amp; Recommended Next Steps" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-[13px] text-[#64736A]">
          <div>
            <h4 className="text-[11.5px] font-bold text-[#26332D] uppercase tracking-wider mb-2">Key Limitations</h4>
            <ul className="space-y-2.5">
              {duplicatesCount > 0 && (
                <li className="flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 text-[#DC2626] flex-shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-[#26332D]">Duplicates Detected:</strong> {duplicatesCount} duplicate rows were identified in the dataset.
                  </span>
                </li>
              )}
              <li className="flex items-start gap-2">
                <Info className="w-4 h-4 text-[#26332D] flex-shrink-0 mt-0.5" />
                <span>
                  <strong className="text-[#26332D]">Baseline Constraints:</strong> Evaluated baseline models with default hyperparameters. Hyperparameter tuning was not executed.
                </span>
              </li>
              {hasShap && (
                <li className="flex items-start gap-2">
                  <Info className="w-4 h-4 text-[#26332D] flex-shrink-0 mt-0.5" />
                  <span>
                    <strong className="text-[#26332D]">Correlation vs Causation:</strong> SHAP feature importance measures model prediction reliance, not causal domain relationships.
                  </span>
                </li>
              )}
            </ul>
          </div>
          <div>
            <h4 className="text-[11.5px] font-bold text-[#26332D] uppercase tracking-wider mb-2">Recommended Next Steps</h4>
            <ul className="space-y-2.5">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#2A7E4F] flex-shrink-0 mt-0.5" />
                <span>
                  Perform hyperparameter tuning (GridSearch, Bayesian Optimization) on the selected architecture.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#2A7E4F] flex-shrink-0 mt-0.5" />
                <span>
                  Test the winning baseline model on an out-of-sample holdout test partition.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#2A7E4F] flex-shrink-0 mt-0.5" />
                <span>
                  Serialize and export the preprocessing pipeline for consistent inference transformations.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* ── Section 9: Status & Appendix ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-2">
        {/* Compilation Status */}
        <div className="lg:col-span-6 bg-white border border-[#E5E9E2] rounded-2xl p-6 shadow-[0_1px_3px_rgba(38,51,45,0.03)] flex flex-col gap-4">
          <h3 className="text-[12px] font-bold text-[#78827A] uppercase tracking-wider">Report Generation Status</h3>
          <div className="flex flex-col gap-2.5">
            {Object.entries(sectionStatus).map(([key, item]) => (
              <div key={key} className="flex justify-between items-center text-[12.5px] py-1.5 border-b border-[#EEF2EB] last:border-0">
                <span className="font-medium text-[#26332D]">{item.label}</span>
                {item.available ? (
                  <span className="flex items-center gap-1 text-[#166534] font-semibold text-[11.5px]">
                    <Check className="w-4 h-4" /> READY
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-[#78827A] font-semibold text-[11.5px]">
                    <Clock className="w-4 h-4" /> UNAVAILABLE
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Technical Appendix */}
        <div className="lg:col-span-6 bg-white border border-[#E5E9E2] rounded-2xl p-6 shadow-[0_1px_3px_rgba(38,51,45,0.03)]">
          <h3 className="text-[12px] font-bold text-[#78827A] uppercase tracking-wider mb-4">Technical Appendix</h3>
          <div className="grid grid-cols-2 gap-3 text-[12.5px]">
            <div>
              <span className="text-[#78827A] block mb-0.5 text-[11px] font-bold uppercase">Session ID</span>
              <span className="font-mono text-[#26332D] block truncate font-medium" title={report.session_id}>
                {report.session_id}
              </span>
            </div>
            <div>
              <span className="text-[#78827A] block mb-0.5 text-[11px] font-bold uppercase">Timestamp</span>
              <span className="text-[#26332D] block font-medium">{report.cover_page?.date}</span>
            </div>
            <div>
              <span className="text-[#78827A] block mb-0.5 text-[11px] font-bold uppercase">ML Task</span>
              <span className="text-[#26332D] block font-mono font-medium">{report.appendix?.ml_task ?? "N/A"}</span>
            </div>
            <div>
              <span className="text-[#78827A] block mb-0.5 text-[11px] font-bold uppercase">Target Feature</span>
              <span className="text-[#26332D] block font-mono font-medium">{report.appendix?.target_column ?? "N/A"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
