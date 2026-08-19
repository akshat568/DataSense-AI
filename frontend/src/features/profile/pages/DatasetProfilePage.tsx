import { useState } from "react";
import { useDataset } from "../../core/context/DatasetContext";
import { useNavigate } from "react-router-dom";
import {
  Database,
  AlertTriangle,
  CheckCircle2,
  Info,
  Layers,
  ArrowRight,
  TrendingUp,
  FileSpreadsheet,
  Activity,
  ShieldCheck,
  Hash,
  Tag,
  Calendar,
  AlignLeft,
} from "lucide-react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
} from "recharts";

/* ── Helpers ─────────────────────────────────────────────────── */
function formatBytes(bytes: number): string {
  if (!bytes || !+bytes) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

function formatNum(val: number | null | undefined, dec = 4): string {
  if (val === null || val === undefined || isNaN(val)) return "—";
  return Number(val).toLocaleString(undefined, {
    minimumFractionDigits: Number.isInteger(val) ? 0 : 2,
    maximumFractionDigits: dec,
  });
}

/* ── Loading Skeleton ────────────────────────────────────────── */
function LoadingSkeleton() {
  return (
    <div className="flex flex-col gap-6 fade-in">
      {/* Header Skeleton */}
      <div className="h-16 rounded-xl skeleton w-1/3" />

      {/* KPI Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 rounded-xl skeleton" />
        ))}
      </div>

      {/* Type Distribution Skeleton */}
      <div className="h-24 rounded-xl skeleton" />

      {/* Main Explorer Skeleton */}
      <div className="h-[600px] rounded-xl skeleton" />
    </div>
  );
}

/* ── Custom Recharts Tooltip for Categorical Bar Chart ────────── */
function CustomCategoryTooltip({ active, payload }: any) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div
        className="px-3 py-2 rounded-lg text-[12px] shadow-xl"
        style={{
          background: "#191A1D",
          border: "1px solid #323338",
          color: "#E8E9ED",
        }}
      >
        <p className="font-bold text-[#7C5CFC] mb-0.5">{data.name}</p>
        <p className="text-[#9DA0A8]">
          Frequency: <span className="font-mono font-semibold text-[#E8E9ED]">{data.count.toLocaleString()}</span>
        </p>
        {data.percentage !== null && (
          <p className="text-[#9DA0A8]">
            Share: <span className="font-mono font-semibold text-[#3ECF71]">{data.percentage}%</span>
          </p>
        )}
      </div>
    );
  }
  return null;
}

/* ── Main Component ──────────────────────────────────────────── */
export function DatasetProfilePage() {
  const { datasetProfile, isProfileLoading, datasetInfo } = useDataset();
  const [selectedColName, setSelectedColName] = useState<string | null>(null);
  const navigate = useNavigate();

  if (isProfileLoading) return <LoadingSkeleton />;

  if (!datasetProfile) {
    return (
      <div className="flex flex-col gap-6 fade-in">
        {/* Header */}
        <div className="flex flex-col gap-1 pb-5 border-b border-[#28292E]">
          <h1 className="text-[28px] font-extrabold text-[#E8E9ED] tracking-tight">
            Dataset Profile
          </h1>
          <p className="text-[15px] text-[#9DA0A8]">
            Understand the structure, quality, and statistical characteristics of your dataset.
          </p>
        </div>

        {/* Empty State */}
        <div
          className="py-16 px-8 flex flex-col items-center text-center rounded-2xl"
          style={{
            background: "#1E1F22",
            border: "1px solid #28292E",
          }}
        >
          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
            style={{
              background: "rgba(124, 92, 252, 0.08)",
              border: "1px solid rgba(124, 92, 252, 0.20)",
            }}
          >
            <Database className="w-8 h-8 text-[#7C5CFC]" strokeWidth={1.5} />
          </div>
          <h3 className="text-[20px] font-bold text-[#E8E9ED] mb-2">
            No Dataset Profile Available
          </h3>
          <p className="text-[14px] text-[#9DA0A8] max-w-md leading-relaxed mb-6">
            Upload a CSV dataset from the Dashboard to generate comprehensive analytical dataset profiling, health metrics, and statistical distributions.
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

  const { health, columns } = datasetProfile;
  const activeCol = columns.find((c: any) => c.name === selectedColName) || columns[0];

  const totalCols = columns.length || 1;
  const numericPct = Math.round((health.numeric_columns / totalCols) * 100);
  const categoricalPct = Math.round((health.categorical_columns / totalCols) * 100);
  const datetimePct = Math.round((health.datetime_columns / totalCols) * 100);
  const textPct = Math.max(0, 100 - numericPct - categoricalPct - datetimePct);

  /* Quality metrics for selected feature */
  const activeMissingPct = activeCol?.missing_percentage ?? 0;
  const activeDupPct = activeCol?.duplicate_percentage ?? 0;
  const activeUnique = activeCol?.unique_values ?? 0;
  const activeNulls = activeCol?.null_count ?? 0;

  /* Categorical frequency chart data */
  const categoryFreq = activeCol?.categorical_stats?.frequency_distribution;
  const catChartData = categoryFreq
    ? Object.entries(categoryFreq).map(([name, count]) => ({
        name: String(name),
        count: Number(count),
        percentage: health.rows ? ((Number(count) / health.rows) * 100).toFixed(1) : null,
      }))
    : [];

  /* Numeric range calculations */
  const numStats = activeCol?.numeric_stats;
  const minVal = numStats?.min;
  const maxVal = numStats?.max;
  const meanVal = numStats?.mean;
  const medianVal = numStats?.median;
  const stdVal = numStats?.std_dev;

  let meanPosPct = 50;
  let medianPosPct = 50;
  if (minVal !== null && minVal !== undefined && maxVal !== null && maxVal !== undefined && maxVal > minVal) {
    if (meanVal !== null && meanVal !== undefined) {
      meanPosPct = Math.min(100, Math.max(0, ((meanVal - minVal) / (maxVal - minVal)) * 100));
    }
    if (medianVal !== null && medianVal !== undefined) {
      medianPosPct = Math.min(100, Math.max(0, ((medianVal - minVal) / (maxVal - minVal)) * 100));
    }
  }

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
          <h1 className="text-[28px] sm:text-[32px] font-extrabold text-[#E8E9ED] tracking-tight leading-tight">
            Dataset Profile
          </h1>
          <p className="text-[15px] text-[#9DA0A8] mt-1">
            Understand the structure, quality, and statistical characteristics of your dataset.
          </p>
        </div>

        {/* Dataset Context Pill */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div
            className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-[13px]"
            style={{
              background: "#1E1F22",
              border: "1px solid #28292E",
            }}
          >
            <div className="w-2 h-2 rounded-full bg-[#3ECF71]" />
            <FileSpreadsheet className="w-4 h-4 text-[#7C5CFC]" />
            <span className="font-mono font-semibold text-[#E8E9ED]">
              {datasetProfile.filename || datasetInfo?.filename || "Dataset"}
            </span>
            <span className="text-[#4A4C52]">·</span>
            <span className="text-[#9DA0A8] font-mono">
              {health.rows.toLocaleString()} rows
            </span>
            <span className="text-[#4A4C52]">·</span>
            <span className="text-[#9DA0A8] font-mono">
              {health.columns} columns
            </span>
          </div>
        </div>
      </div>

      {/* ═════════════════════════════════════════════════════════════
          2. DATASET SUMMARY CARDS (4 KPIs)
          ═════════════════════════════════════════════════════════════ */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Activity className="w-4 h-4 text-[#7C5CFC]" />
          <h2 className="text-[18px] font-bold text-[#E8E9ED]">
            Dataset Health &amp; Summary
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Missing Cells */}
          <div
            className="p-5 flex flex-col justify-between transition-all duration-150"
            style={{
              background: "#1E1F22",
              border: "1px solid #28292E",
              borderRadius: "12px",
            }}
          >
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-[12px] font-bold text-[#6B6E76] uppercase tracking-[0.1em]">
                Missing Cells
              </span>
              {health.total_missing_cells === 0 ? (
                <span
                  className="text-[11px] font-bold px-2 py-0.5 rounded-md"
                  style={{
                    background: "rgba(62, 207, 113, 0.12)",
                    color: "#3ECF71",
                    border: "1px solid rgba(62, 207, 113, 0.25)",
                  }}
                >
                  ✓ Healthy
                </span>
              ) : (
                <span
                  className="text-[11px] font-bold px-2 py-0.5 rounded-md"
                  style={{
                    background: "rgba(245, 158, 11, 0.12)",
                    color: "#F59E0B",
                    border: "1px solid rgba(245, 158, 11, 0.25)",
                  }}
                >
                  ⚠ Review
                </span>
              )}
            </div>
            <p
              className="text-[28px] font-bold leading-none font-mono tracking-tight"
              style={{
                color: health.total_missing_cells === 0 ? "#E8E9ED" : "#F59E0B",
              }}
            >
              {health.total_missing_cells.toLocaleString()}
            </p>
            <p className="text-[13px] text-[#9DA0A8] mt-2">
              {health.missing_percentage.toFixed(2)}% of total cells
            </p>
          </div>

          {/* Card 2: Duplicate Rows */}
          <div
            className="p-5 flex flex-col justify-between transition-all duration-150"
            style={{
              background: "#1E1F22",
              border: "1px solid #28292E",
              borderRadius: "12px",
            }}
          >
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-[12px] font-bold text-[#6B6E76] uppercase tracking-[0.1em]">
                Duplicate Rows
              </span>
              {health.duplicate_rows === 0 ? (
                <span
                  className="text-[11px] font-bold px-2 py-0.5 rounded-md"
                  style={{
                    background: "rgba(62, 207, 113, 0.12)",
                    color: "#3ECF71",
                    border: "1px solid rgba(62, 207, 113, 0.25)",
                  }}
                >
                  ✓ Unique
                </span>
              ) : (
                <span
                  className="text-[11px] font-bold px-2 py-0.5 rounded-md"
                  style={{
                    background: "rgba(245, 158, 11, 0.12)",
                    color: "#F59E0B",
                    border: "1px solid rgba(245, 158, 11, 0.25)",
                  }}
                >
                  ⚠ Review
                </span>
              )}
            </div>
            <p
              className="text-[28px] font-bold leading-none font-mono tracking-tight"
              style={{
                color: health.duplicate_rows === 0 ? "#E8E9ED" : "#F59E0B",
              }}
            >
              {health.duplicate_rows.toLocaleString()}
            </p>
            <p className="text-[13px] text-[#9DA0A8] mt-2">
              {health.duplicate_percentage.toFixed(2)}% overall
            </p>
          </div>

          {/* Card 3: Memory Footprint */}
          <div
            className="p-5 flex flex-col justify-between transition-all duration-150"
            style={{
              background: "#1E1F22",
              border: "1px solid #28292E",
              borderRadius: "12px",
            }}
          >
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-[12px] font-bold text-[#6B6E76] uppercase tracking-[0.1em]">
                Memory Usage
              </span>
              <span
                className="text-[11px] font-bold px-2 py-0.5 rounded-md"
                style={{
                  background: "rgba(124, 92, 252, 0.12)",
                  color: "#A78BFA",
                  border: "1px solid rgba(124, 92, 252, 0.25)",
                }}
              >
                In-Memory
              </span>
            </div>
            <p className="text-[28px] font-bold text-[#E8E9ED] leading-none font-mono tracking-tight">
              {formatBytes(health.memory_usage_bytes)}
            </p>
            <p className="text-[13px] text-[#9DA0A8] mt-2">
              Total memory footprint
            </p>
          </div>

          {/* Card 4: Total Features */}
          <div
            className="p-5 flex flex-col justify-between transition-all duration-150"
            style={{
              background: "#1E1F22",
              border: "1px solid #28292E",
              borderRadius: "12px",
            }}
          >
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-[12px] font-bold text-[#6B6E76] uppercase tracking-[0.1em]">
                Total Features
              </span>
              <span
                className="text-[11px] font-bold px-2 py-0.5 rounded-md"
                style={{
                  background: "rgba(124, 92, 252, 0.12)",
                  color: "#A78BFA",
                  border: "1px solid rgba(124, 92, 252, 0.25)",
                }}
              >
                {columns.length} Total
              </span>
            </div>
            <p className="text-[28px] font-bold text-[#E8E9ED] leading-none font-mono tracking-tight">
              {columns.length}
            </p>
            <p className="text-[13px] text-[#9DA0A8] mt-2">
              {health.numeric_columns} Numeric · {health.categorical_columns} Categorical
            </p>
          </div>
        </div>
      </div>

      {/* ═════════════════════════════════════════════════════════════
          3. COLUMN TYPES DISTRIBUTION & DATA HEALTH CHECKLIST
          ═════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-4">
        {/* Column Types Distribution */}
        <div
          className="p-5 flex flex-col justify-between"
          style={{
            background: "#1E1F22",
            border: "1px solid #28292E",
            borderRadius: "12px",
          }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#7C5CFC]" />
              <h3 className="text-[16px] font-bold text-[#E8E9ED]">
                Feature Types Distribution
              </h3>
            </div>
            <span className="text-[12px] font-mono text-[#9DA0A8]">
              {columns.length} Total Columns
            </span>
          </div>

          {/* Segmented Horizontal Progress Bar */}
          <div className="w-full h-3 rounded-full overflow-hidden flex bg-[#25262A] my-2">
            {health.numeric_columns > 0 && (
              <div
                style={{ width: `${(health.numeric_columns / totalCols) * 100}%` }}
                className="bg-[#7C5CFC] h-full transition-all duration-300"
                title={`Numeric: ${health.numeric_columns} (${numericPct}%)`}
              />
            )}
            {health.categorical_columns > 0 && (
              <div
                style={{ width: `${(health.categorical_columns / totalCols) * 100}%` }}
                className="bg-[#3ECF71] h-full transition-all duration-300"
                title={`Categorical: ${health.categorical_columns} (${categoricalPct}%)`}
              />
            )}
            {health.datetime_columns > 0 && (
              <div
                style={{ width: `${(health.datetime_columns / totalCols) * 100}%` }}
                className="bg-[#E5A940] h-full transition-all duration-300"
                title={`Datetime: ${health.datetime_columns} (${datetimePct}%)`}
              />
            )}
            {health.text_columns > 0 && (
              <div
                style={{ width: `${(health.text_columns / totalCols) * 100}%` }}
                className="bg-[#6488C8] h-full transition-all duration-300"
                title={`Text: ${health.text_columns} (${textPct}%)`}
              />
            )}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-4 mt-2 text-[13px]">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#7C5CFC]" />
              <span className="font-semibold text-[#E8E9ED]">Numeric</span>
              <span className="text-[#9DA0A8] font-mono">
                {health.numeric_columns} ({numericPct}%)
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#3ECF71]" />
              <span className="font-semibold text-[#E8E9ED]">Categorical</span>
              <span className="text-[#9DA0A8] font-mono">
                {health.categorical_columns} ({categoricalPct}%)
              </span>
            </div>
            {health.datetime_columns > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#E5A940]" />
                <span className="font-semibold text-[#E8E9ED]">Datetime</span>
                <span className="text-[#9DA0A8] font-mono">
                  {health.datetime_columns} ({datetimePct}%)
                </span>
              </div>
            )}
            {health.text_columns > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#6488C8]" />
                <span className="font-semibold text-[#E8E9ED]">Text</span>
                <span className="text-[#9DA0A8] font-mono">
                  {health.text_columns} ({textPct}%)
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Factual Data Health Checklist */}
        <div
          className="p-5 flex flex-col justify-between"
          style={{
            background: "#1E1F22",
            border: "1px solid #28292E",
            borderRadius: "12px",
          }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#3ECF71]" />
              <h3 className="text-[16px] font-bold text-[#E8E9ED]">
                Data Quality Overview
              </h3>
            </div>
            <span
              className="text-[11px] font-bold px-2 py-0.5 rounded-md"
              style={{
                background:
                  health.total_missing_cells === 0 && health.duplicate_rows === 0
                    ? "rgba(62, 207, 113, 0.12)"
                    : "rgba(245, 158, 11, 0.12)",
                color:
                  health.total_missing_cells === 0 && health.duplicate_rows === 0
                    ? "#3ECF71"
                    : "#F59E0B",
                border:
                  health.total_missing_cells === 0 && health.duplicate_rows === 0
                    ? "1px solid rgba(62, 207, 113, 0.25)"
                    : "1px solid rgba(245, 158, 11, 0.25)",
              }}
            >
              {health.total_missing_cells === 0 && health.duplicate_rows === 0
                ? "Optimal Quality"
                : "Standard Quality"}
            </span>
          </div>

          <div className="space-y-2 mt-1">
            <div className="flex items-center gap-2 text-[13px]">
              {health.total_missing_cells === 0 ? (
                <CheckCircle2 className="w-4 h-4 text-[#3ECF71] flex-shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-[#F59E0B] flex-shrink-0" />
              )}
              <span className="text-[#E8E9ED]">
                {health.total_missing_cells === 0
                  ? "0 missing cells (100% data completeness)"
                  : `${health.total_missing_cells} missing cells (${health.missing_percentage.toFixed(2)}% null rate)`}
              </span>
            </div>

            <div className="flex items-center gap-2 text-[13px]">
              {health.duplicate_rows === 0 ? (
                <CheckCircle2 className="w-4 h-4 text-[#3ECF71] flex-shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-[#F59E0B] flex-shrink-0" />
              )}
              <span className="text-[#E8E9ED]">
                {health.duplicate_rows === 0
                  ? "0 duplicate rows (100% unique sample records)"
                  : `${health.duplicate_rows} duplicate rows detected (${health.duplicate_percentage.toFixed(2)}%)`}
              </span>
            </div>

            <div className="flex items-center gap-2 text-[13px]">
              <CheckCircle2 className="w-4 h-4 text-[#3ECF71] flex-shrink-0" />
              <span className="text-[#E8E9ED]">
                All {columns.length} features successfully analyzed and profiled
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ═════════════════════════════════════════════════════════════
          4. FEATURE STATISTICS & MISSING VALUES EXPLORER
          ═════════════════════════════════════════════════════════════ */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#7C5CFC]" />
            <h2 className="text-[18px] font-bold text-[#E8E9ED]">
              Feature Statistics &amp; Missing Values Explorer
            </h2>
          </div>
          <span className="text-[13px] text-[#9DA0A8]">
            Select a feature to inspect distributions, ranges, and cardinality
          </span>
        </div>

        <div
          className="flex flex-col lg:flex-row items-stretch rounded-2xl overflow-hidden min-h-[640px]"
          style={{
            background: "#1E1F22",
            border: "1px solid #28292E",
          }}
        >
          {/* ── LEFT PANE: Feature Selector (20%) ── */}
          <div
            className="w-full lg:w-[260px] flex-shrink-0 flex flex-col"
            style={{
              borderRight: "1px solid #28292E",
              background: "#191A1D",
            }}
          >
            <div
              className="px-4 py-3.5 flex items-center justify-between flex-shrink-0"
              style={{
                borderBottom: "1px solid #28292E",
                background: "#1E1F22",
              }}
            >
              <span className="text-[12px] font-bold text-[#6B6E76] uppercase tracking-[0.1em]">
                Features ({columns.length})
              </span>
              <span className="text-[11px] text-[#7C5CFC] font-semibold">
                EDA Active
              </span>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
              {columns.map((col: any) => {
                const isSelected = activeCol?.name === col.name;
                const isNumeric = col.detected_type === "numeric";
                const isCat = col.detected_type === "categorical";
                const isDate = col.detected_type === "datetime";

                return (
                  <button
                    key={col.name}
                    type="button"
                    onClick={() => setSelectedColName(col.name)}
                    className="w-full text-left px-3.5 py-3 rounded-xl flex items-center justify-between gap-2 transition-all duration-150 relative cursor-pointer group"
                    style={{
                      background: isSelected
                        ? "rgba(124, 92, 252, 0.12)"
                        : "transparent",
                      border: isSelected
                        ? "1px solid rgba(124, 92, 252, 0.35)"
                        : "1px solid transparent",
                    }}
                    onMouseEnter={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.background = "#222327";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isSelected) {
                        e.currentTarget.style.background = "transparent";
                      }
                    }}
                  >
                    {/* Active left indicator */}
                    {isSelected && (
                      <span
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full"
                        style={{ background: "#7C5CFC" }}
                      />
                    )}

                    <div className="flex items-center gap-2.5 min-w-0">
                      {isNumeric ? (
                        <Hash className={`w-3.5 h-3.5 flex-shrink-0 ${isSelected ? "text-[#7C5CFC]" : "text-[#6B6E76]"}`} />
                      ) : isCat ? (
                        <Tag className={`w-3.5 h-3.5 flex-shrink-0 ${isSelected ? "text-[#3ECF71]" : "text-[#6B6E76]"}`} />
                      ) : isDate ? (
                        <Calendar className={`w-3.5 h-3.5 flex-shrink-0 ${isSelected ? "text-[#E5A940]" : "text-[#6B6E76]"}`} />
                      ) : (
                        <AlignLeft className={`w-3.5 h-3.5 flex-shrink-0 ${isSelected ? "text-[#6488C8]" : "text-[#6B6E76]"}`} />
                      )}

                      <span
                        className="text-[14px] font-semibold truncate leading-tight"
                        style={{ color: isSelected ? "#E8E9ED" : "#9DA0A8" }}
                      >
                        {col.name}
                      </span>
                    </div>

                    {/* Type badge */}
                    <span
                      className="text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 rounded flex-shrink-0"
                      style={{
                        background: isNumeric
                          ? "rgba(124, 92, 252, 0.15)"
                          : isCat
                          ? "rgba(62, 207, 113, 0.15)"
                          : isDate
                          ? "rgba(229, 169, 64, 0.15)"
                          : "rgba(100, 136, 200, 0.15)",
                        color: isNumeric
                          ? "#A78BFA"
                          : isCat
                          ? "#3ECF71"
                          : isDate
                          ? "#E5A940"
                          : "#6488C8",
                        border: isNumeric
                          ? "1px solid rgba(124, 92, 252, 0.25)"
                          : isCat
                          ? "1px solid rgba(62, 207, 113, 0.25)"
                          : isDate
                          ? "1px solid rgba(229, 169, 64, 0.25)"
                          : "1px solid rgba(100, 136, 200, 0.25)",
                      }}
                    >
                      {col.detected_type?.slice(0, 3)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── RIGHT PANE: Selected Feature Details (80%) ── */}
          <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar p-6 space-y-6">
            {activeCol ? (
              <>
                {/* ── Feature Header Row ── */}
                <div
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5"
                  style={{ borderBottom: "1px solid #28292E" }}
                >
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center gap-3">
                      <h3 className="text-[24px] font-bold text-[#E8E9ED] font-mono">
                        {activeCol.name}
                      </h3>
                      <span
                        className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full"
                        style={{
                          background:
                            activeCol.detected_type === "numeric"
                              ? "rgba(124, 92, 252, 0.15)"
                              : "rgba(62, 207, 113, 0.15)",
                          color:
                            activeCol.detected_type === "numeric"
                              ? "#A78BFA"
                              : "#3ECF71",
                          border:
                            activeCol.detected_type === "numeric"
                              ? "1px solid rgba(124, 92, 252, 0.30)"
                              : "1px solid rgba(62, 207, 113, 0.30)",
                        }}
                      >
                        {activeCol.detected_type}
                      </span>
                    </div>

                    <p className="text-[13px] text-[#9DA0A8]">
                      Memory allocation:{" "}
                      <span className="font-mono text-[#E8E9ED]">
                        {formatBytes(activeCol.memory_usage_bytes)}
                      </span>
                    </p>
                  </div>

                  {/* Missing Rate Pill */}
                  <div className="flex items-center gap-2 self-start sm:self-center">
                    <div
                      className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
                      style={{
                        background:
                          activeMissingPct === 0
                            ? "rgba(62, 207, 113, 0.08)"
                            : "rgba(245, 158, 11, 0.08)",
                        border:
                          activeMissingPct === 0
                            ? "1px solid rgba(62, 207, 113, 0.25)"
                            : "1px solid rgba(245, 158, 11, 0.25)",
                      }}
                    >
                      {activeMissingPct === 0 ? (
                        <CheckCircle2 className="w-4 h-4 text-[#3ECF71]" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-[#F59E0B]" />
                      )}
                      <span className="text-[12px] text-[#9DA0A8]">Missing Rate:</span>
                      <span
                        className="text-[13px] font-bold font-mono"
                        style={{
                          color: activeMissingPct === 0 ? "#3ECF71" : "#F59E0B",
                        }}
                      >
                        {activeMissingPct.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* ── Quality Metrics Row (4 Cards) ── */}
                <div>
                  <span className="text-[11px] font-bold text-[#6B6E76] uppercase tracking-[0.1em] block mb-2.5">
                    Feature Quality Metrics
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div
                      className="p-3.5 rounded-xl"
                      style={{
                        background: "#25262A",
                        border: "1px solid #323338",
                      }}
                    >
                      <p className="text-[11px] font-bold text-[#6B6E76] uppercase tracking-wider mb-1">
                        Unique Values
                      </p>
                      <p className="text-[20px] font-bold text-[#E8E9ED] font-mono leading-tight">
                        {activeUnique.toLocaleString()}
                      </p>
                    </div>

                    <div
                      className="p-3.5 rounded-xl"
                      style={{
                        background: "#25262A",
                        border: "1px solid #323338",
                      }}
                    >
                      <p className="text-[11px] font-bold text-[#6B6E76] uppercase tracking-wider mb-1">
                        Null Count
                      </p>
                      <p className="text-[20px] font-bold text-[#E8E9ED] font-mono leading-tight">
                        {activeNulls.toLocaleString()}
                      </p>
                    </div>

                    <div
                      className="p-3.5 rounded-xl"
                      style={{
                        background: "#25262A",
                        border: "1px solid #323338",
                      }}
                    >
                      <p className="text-[11px] font-bold text-[#6B6E76] uppercase tracking-wider mb-1">
                        Duplicate %
                      </p>
                      <p className="text-[20px] font-bold text-[#E8E9ED] font-mono leading-tight">
                        {activeDupPct.toFixed(2)}%
                      </p>
                    </div>

                    <div
                      className="p-3.5 rounded-xl"
                      style={{
                        background: "#25262A",
                        border: "1px solid #323338",
                      }}
                    >
                      <p className="text-[11px] font-bold text-[#6B6E76] uppercase tracking-wider mb-1">
                        Missing %
                      </p>
                      <p className="text-[20px] font-bold text-[#E8E9ED] font-mono leading-tight">
                        {activeMissingPct.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                </div>

                {/* ── Feature Distribution Visualization (Real Data Only) ── */}
                {activeCol.detected_type === "numeric" && numStats && (
                  <div
                    className="p-5 rounded-xl flex flex-col gap-4"
                    style={{
                      background: "#25262A",
                      border: "1px solid #323338",
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-[#7C5CFC]" />
                        <h4 className="text-[15px] font-bold text-[#E8E9ED]">
                          Statistical Range &amp; Distribution Overview
                        </h4>
                      </div>
                      <span className="text-[12px] font-mono text-[#9DA0A8]">
                        Range: {formatNum(minVal, 2)} → {formatNum(maxVal, 2)}
                      </span>
                    </div>

                    {/* Visual Range Scale */}
                    <div className="py-2 px-1">
                      <div className="relative w-full h-3 rounded-full bg-[#1E1F22] border border-[#3A3B42] mb-6">
                        {/* Mean marker */}
                        <div
                          className="absolute -top-1.5 w-1 h-6 bg-[#7C5CFC] rounded-full z-10 -translate-x-1/2"
                          style={{ left: `${meanPosPct}%` }}
                          title={`Mean: ${formatNum(meanVal)}`}
                        />
                        {/* Median marker */}
                        <div
                          className="absolute -top-1.5 w-1 h-6 bg-[#3ECF71] rounded-full z-10 -translate-x-1/2"
                          style={{ left: `${medianPosPct}%` }}
                          title={`Median: ${formatNum(medianVal)}`}
                        />
                      </div>

                      {/* Scale labels */}
                      <div className="flex items-center justify-between text-[12px] font-mono text-[#9DA0A8]">
                        <div>
                          <span className="text-[#6B6E76] block text-[10px] font-sans uppercase font-bold">MIN</span>
                          <span className="text-[#E8E9ED] font-bold">{formatNum(minVal, 2)}</span>
                        </div>

                        <div className="flex items-center gap-6">
                          <div className="text-center">
                            <span className="text-[#7C5CFC] block text-[10px] font-sans uppercase font-bold">● MEAN</span>
                            <span className="text-[#E8E9ED] font-bold">{formatNum(meanVal, 3)}</span>
                          </div>
                          <div className="text-center">
                            <span className="text-[#3ECF71] block text-[10px] font-sans uppercase font-bold">● MEDIAN</span>
                            <span className="text-[#E8E9ED] font-bold">{formatNum(medianVal, 3)}</span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-[#6B6E76] block text-[10px] font-sans uppercase font-bold">MAX</span>
                          <span className="text-[#E8E9ED] font-bold">{formatNum(maxVal, 2)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Moments summary grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2 border-t border-[#323338]">
                      <div>
                        <p className="text-[10px] uppercase font-bold text-[#6B6E76]">Std Deviation (σ)</p>
                        <p className="text-[14px] font-mono font-bold text-[#E8E9ED]">{formatNum(stdVal, 4)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-[#6B6E76]">Variance (σ²)</p>
                        <p className="text-[14px] font-mono font-bold text-[#E8E9ED]">{formatNum(numStats.variance, 4)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-[#6B6E76]">Skewness</p>
                        <p className="text-[14px] font-mono font-bold text-[#E8E9ED]">{formatNum(numStats.skewness, 4)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-[#6B6E76]">Kurtosis</p>
                        <p className="text-[14px] font-mono font-bold text-[#E8E9ED]">{formatNum(numStats.kurtosis, 4)}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── Categorical Frequency Chart (Recharts with real frequency distribution) ── */}
                {(activeCol.detected_type === "categorical" || activeCol.detected_type === "boolean") &&
                  catChartData.length > 0 && (
                    <div
                      className="p-5 rounded-xl flex flex-col gap-4"
                      style={{
                        background: "#25262A",
                        border: "1px solid #323338",
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Layers className="w-4 h-4 text-[#3ECF71]" />
                          <h4 className="text-[15px] font-bold text-[#E8E9ED]">
                            Category Frequency Distribution
                          </h4>
                        </div>
                        <span className="text-[12px] font-mono text-[#9DA0A8]">
                          {catChartData.length} Unique Categories
                        </span>
                      </div>

                      {/* Recharts Bar Chart */}
                      <div className="w-full h-52">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={catChartData}
                            layout="vertical"
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                          >
                            <XAxis type="number" stroke="#6B6E76" fontSize={12} tickLine={false} />
                            <YAxis
                              type="category"
                              dataKey="name"
                              stroke="#9DA0A8"
                              fontSize={12}
                              tickLine={false}
                              width={100}
                            />
                            <Tooltip content={<CustomCategoryTooltip />} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
                            <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                              {catChartData.map((_, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={index === 0 ? "#7C5CFC" : index === 1 ? "#3ECF71" : "#5A9D7C"}
                                />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}

                {/* ── Datetime details ── */}
                {activeCol.detected_type === "datetime" && activeCol.datetime_stats && (
                  <div
                    className="p-5 rounded-xl grid grid-cols-1 sm:grid-cols-3 gap-4"
                    style={{
                      background: "#25262A",
                      border: "1px solid #323338",
                    }}
                  >
                    <div>
                      <p className="text-[11px] font-bold text-[#6B6E76] uppercase">Earliest Date</p>
                      <p className="text-[15px] font-bold text-[#E8E9ED] font-mono mt-1">
                        {activeCol.datetime_stats.min_date || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-[#6B6E76] uppercase">Latest Date</p>
                      <p className="text-[15px] font-bold text-[#E8E9ED] font-mono mt-1">
                        {activeCol.datetime_stats.max_date || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-[#6B6E76] uppercase">Total Date Range</p>
                      <p className="text-[15px] font-bold text-[#E8E9ED] font-mono mt-1">
                        {activeCol.datetime_stats.date_range_days !== null
                          ? `${activeCol.datetime_stats.date_range_days} days`
                          : "—"}
                      </p>
                    </div>
                  </div>
                )}

                {/* ── Distribution Statistics Table ── */}
                {activeCol.detected_type === "numeric" && numStats && (
                  <div>
                    <span className="text-[11px] font-bold text-[#6B6E76] uppercase tracking-[0.1em] block mb-2.5">
                      Detailed Statistical Measures
                    </span>
                    <div
                      className="rounded-xl overflow-hidden"
                      style={{
                        background: "#25262A",
                        border: "1px solid #323338",
                      }}
                    >
                      <table className="w-full text-left text-[13px] border-collapse">
                        <thead>
                          <tr
                            style={{
                              background: "#1E1F22",
                              borderBottom: "1px solid #323338",
                            }}
                          >
                            <th className="px-4 py-3 font-semibold text-[#6B6E76] uppercase text-[11px] tracking-wider">
                              Metric
                            </th>
                            <th className="px-4 py-3 font-semibold text-[#6B6E76] uppercase text-[11px] tracking-wider">
                              Calculated Value
                            </th>
                            <th className="px-4 py-3 font-semibold text-[#6B6E76] uppercase text-[11px] tracking-wider hidden sm:table-cell">
                              Description
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            { key: "Mean (μ)", val: numStats.mean, desc: "Arithmetic average of all observed values" },
                            { key: "Median (Q2)", val: numStats.median, desc: "50th percentile (middle observed value)" },
                            { key: "Mode", val: numStats.mode, desc: "Most frequently occurring value" },
                            { key: "Minimum", val: numStats.min, desc: "Smallest observed value" },
                            { key: "Maximum", val: numStats.max, desc: "Largest observed value" },
                            { key: "Standard Deviation (σ)", val: numStats.std_dev, desc: "Measure of data dispersion" },
                            { key: "Variance (σ²)", val: numStats.variance, desc: "Squared standard deviation" },
                            { key: "Skewness", val: numStats.skewness, desc: "Asymmetry of the probability distribution" },
                            { key: "Kurtosis", val: numStats.kurtosis, desc: "Tailedness of the probability distribution" },
                          ].map((row) => (
                            <tr
                              key={row.key}
                              className="transition-colors last:border-b-0"
                              style={{
                                borderBottom: "1px solid #2D2E33",
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = "#2D2E33";
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = "transparent";
                              }}
                            >
                              <td className="px-4 py-2.5 font-medium text-[#E8E9ED]">
                                {row.key}
                              </td>
                              <td className="px-4 py-2.5 font-mono font-semibold text-[#7C5CFC]">
                                {formatNum(row.val, 4)}
                              </td>
                              <td className="px-4 py-2.5 text-[#9DA0A8] hidden sm:table-cell text-[12px]">
                                {row.desc}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* ── Categorical Breakdown Table ── */}
                {(activeCol.detected_type === "categorical" || activeCol.detected_type === "boolean") &&
                  activeCol.categorical_stats && (
                    <div>
                      <span className="text-[11px] font-bold text-[#6B6E76] uppercase tracking-[0.1em] block mb-2.5">
                        Category Frequency Breakdown
                      </span>
                      <div
                        className="rounded-xl overflow-hidden"
                        style={{
                          background: "#25262A",
                          border: "1px solid #323338",
                        }}
                      >
                        <table className="w-full text-left text-[13px] border-collapse">
                          <thead>
                            <tr
                              style={{
                                background: "#1E1F22",
                                borderBottom: "1px solid #323338",
                              }}
                            >
                              <th className="px-4 py-3 font-semibold text-[#6B6E76] uppercase text-[11px] tracking-wider">
                                Category Value
                              </th>
                              <th className="px-4 py-3 font-semibold text-[#6B6E76] uppercase text-[11px] tracking-wider">
                                Observations
                              </th>
                              <th className="px-4 py-3 font-semibold text-[#6B6E76] uppercase text-[11px] tracking-wider">
                                Percentage Share
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {catChartData.map((row) => (
                              <tr
                                key={row.name}
                                className="transition-colors last:border-b-0"
                                style={{ borderBottom: "1px solid #2D2E33" }}
                                onMouseEnter={(e) => {
                                  e.currentTarget.style.background = "#2D2E33";
                                }}
                                onMouseLeave={(e) => {
                                  e.currentTarget.style.background = "transparent";
                                }}
                              >
                                <td className="px-4 py-2.5 font-medium text-[#E8E9ED] truncate max-w-[200px]">
                                  {row.name}
                                </td>
                                <td className="px-4 py-2.5 font-mono font-semibold text-[#3ECF71]">
                                  {row.count.toLocaleString()}
                                </td>
                                <td className="px-4 py-2.5 font-mono text-[#9DA0A8]">
                                  {row.percentage}%
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                {/* ── Sample Observations ── */}
                {activeCol.sample_values && activeCol.sample_values.length > 0 && (
                  <div>
                    <span className="text-[11px] font-bold text-[#6B6E76] uppercase tracking-[0.1em] block mb-2">
                      Sample Observations (First 5 Rows)
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                      {activeCol.sample_values.map((val: any, idx: number) => (
                        <span
                          key={idx}
                          className="px-3 py-1.5 rounded-lg text-[13px] font-mono"
                          style={{
                            background: "#25262A",
                            border: "1px solid #323338",
                            color: "#E8E9ED",
                          }}
                        >
                          {String(val)}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full py-20 text-center gap-2">
                <Info className="w-6 h-6 text-[#6B6E76]" />
                <p className="text-[14px] text-[#9DA0A8]">
                  Select a feature column from the left panel to inspect its exploratory data profile.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
