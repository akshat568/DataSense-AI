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
  Search,
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
      <div className="h-16 rounded-2xl skeleton w-1/3" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-28 rounded-2xl skeleton" />
        ))}
      </div>
      <div className="h-24 rounded-2xl skeleton" />
      <div className="h-[600px] rounded-2xl skeleton" />
    </div>
  );
}

/* ── Custom Recharts Tooltip ─────────────────────────────────── */
function CustomCategoryTooltip({ active, payload }: any) {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="px-3.5 py-2.5 rounded-xl text-[12.5px] bg-white border border-[#E5E9E2] shadow-md text-[#26332D]">
        <p className="font-bold text-[#26332D] mb-1">{data.name}</p>
        <p className="text-[#64736A]">
          Observations: <span className="font-mono font-bold text-[#26332D]">{data.count.toLocaleString()}</span>
        </p>
        {data.percentage !== null && (
          <p className="text-[#64736A]">
            Share: <span className="font-mono font-bold text-[#2A7E4F]">{data.percentage}%</span>
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
  const [featureSearch, setFeatureSearch] = useState("");
  const navigate = useNavigate();

  if (isProfileLoading) return <LoadingSkeleton />;

  if (!datasetProfile) {
    return (
      <div className="flex flex-col gap-6 fade-in">
        {/* Header */}
        <div className="flex flex-col gap-1 pb-5 border-b border-[#E5E9E2]">
          <h1 className="text-[28px] font-extrabold text-[#26332D] tracking-tight">
            Dataset Profile
          </h1>
          <p className="text-[14px] text-[#64736A]">
            Understand the structure, quality, and statistical characteristics of your dataset.
          </p>
        </div>

        {/* Empty State */}
        <div className="py-16 px-8 flex flex-col items-center text-center rounded-2xl bg-white border border-[#E5E9E2] shadow-[0_1px_3px_rgba(38,51,45,0.03)]">
          <div className="w-16 h-16 rounded-2xl bg-[#F1F5EF] border border-[#E5E9E2] flex items-center justify-center mb-4 text-[#26332D]">
            <Database className="w-8 h-8 text-[#26332D]" strokeWidth={1.75} />
          </div>
          <h3 className="text-[20px] font-bold text-[#26332D] mb-2">
            No Dataset Profile Available
          </h3>
          <p className="text-[14px] text-[#64736A] max-w-md leading-relaxed mb-6">
            Upload a CSV dataset from the Dashboard to generate comprehensive statistical profiling, quality indicators, and feature distributions.
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
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-[#E5E9E2]">
        <div className="flex flex-col">
          <h1 className="text-[28px] sm:text-[32px] font-extrabold text-[#26332D] tracking-tight leading-tight">
            Dataset Profile
          </h1>
          <p className="text-[14px] text-[#64736A] mt-1">
            Examine feature distributions, statistical moments, missing records, and dataset health.
          </p>
        </div>

        {/* Dataset Context Pill */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl text-[13px] bg-white border border-[#E5E9E2] shadow-xs">
            <div className="w-2 h-2 rounded-full bg-[#2A7E4F]" />
            <FileSpreadsheet className="w-4 h-4 text-[#26332D]" />
            <span className="font-mono font-semibold text-[#26332D]">
              {datasetProfile.filename || datasetInfo?.filename || "Dataset"}
            </span>
            <span className="text-[#C4CCC2]">·</span>
            <span className="text-[#64736A] font-mono">
              {health.rows.toLocaleString()} rows
            </span>
            <span className="text-[#C4CCC2]">·</span>
            <span className="text-[#64736A] font-mono">
              {health.columns} columns
            </span>
          </div>
        </div>
      </div>

      {/* ═════════════════════════════════════════════════════════════
          2. DATASET SUMMARY METRIC CARDS (4 KPIs)
          ═════════════════════════════════════════════════════════════ */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Activity className="w-4 h-4 text-[#26332D]" />
          <h2 className="text-[17px] font-bold text-[#26332D]">
            Dataset Health &amp; Overview
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Missing Cells */}
          <div className="p-5 flex flex-col justify-between rounded-2xl bg-white border border-[#E5E9E2] shadow-[0_1px_3px_rgba(38,51,45,0.03)] hover:border-[#D6DCD3] transition-all duration-150">
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-[11px] font-bold text-[#78827A] uppercase tracking-[0.14em]">
                Missing Cells
              </span>
              {health.total_missing_cells === 0 ? (
                <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-md bg-[#EDF7F1] text-[#166534] border border-[#BCE2CC]">
                  ✓ Complete
                </span>
              ) : (
                <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-md bg-[#FEF8EC] text-[#B45309] border border-[#FDE68A]">
                  ⚠ Review
                </span>
              )}
            </div>
            <p
              className="text-[28px] font-bold leading-none font-mono tracking-tight"
              style={{
                color: health.total_missing_cells === 0 ? "#26332D" : "#B45309",
              }}
            >
              {health.total_missing_cells.toLocaleString()}
            </p>
            <p className="text-[13px] text-[#64736A] mt-2">
              {health.missing_percentage.toFixed(2)}% of total cell observations
            </p>
          </div>

          {/* Card 2: Duplicate Rows */}
          <div className="p-5 flex flex-col justify-between rounded-2xl bg-white border border-[#E5E9E2] shadow-[0_1px_3px_rgba(38,51,45,0.03)] hover:border-[#D6DCD3] transition-all duration-150">
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-[11px] font-bold text-[#78827A] uppercase tracking-[0.14em]">
                Duplicate Rows
              </span>
              {health.duplicate_rows === 0 ? (
                <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-md bg-[#EDF7F1] text-[#166534] border border-[#BCE2CC]">
                  ✓ Unique
                </span>
              ) : (
                <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-md bg-[#FEF8EC] text-[#B45309] border border-[#FDE68A]">
                  ⚠ Duplicates
                </span>
              )}
            </div>
            <p
              className="text-[28px] font-bold leading-none font-mono tracking-tight"
              style={{
                color: health.duplicate_rows === 0 ? "#26332D" : "#B45309",
              }}
            >
              {health.duplicate_rows.toLocaleString()}
            </p>
            <p className="text-[13px] text-[#64736A] mt-2">
              {health.duplicate_percentage.toFixed(2)}% duplicate row rate
            </p>
          </div>

          {/* Card 3: Memory Footprint */}
          <div className="p-5 flex flex-col justify-between rounded-2xl bg-white border border-[#E5E9E2] shadow-[0_1px_3px_rgba(38,51,45,0.03)] hover:border-[#D6DCD3] transition-all duration-150">
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-[11px] font-bold text-[#78827A] uppercase tracking-[0.14em]">
                Memory Usage
              </span>
              <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-md bg-[#F1F5EF] text-[#26332D] border border-[#E5E9E2]">
                In-Memory
              </span>
            </div>
            <p className="text-[28px] font-bold text-[#26332D] leading-none font-mono tracking-tight">
              {formatBytes(health.memory_usage_bytes)}
            </p>
            <p className="text-[13px] text-[#64736A] mt-2">
              Memory consumption footprint
            </p>
          </div>

          {/* Card 4: Total Features */}
          <div className="p-5 flex flex-col justify-between rounded-2xl bg-white border border-[#E5E9E2] shadow-[0_1px_3px_rgba(38,51,45,0.03)] hover:border-[#D6DCD3] transition-all duration-150">
            <div className="flex items-center justify-between gap-2 mb-3">
              <span className="text-[11px] font-bold text-[#78827A] uppercase tracking-[0.14em]">
                Total Features
              </span>
              <span className="text-[10.5px] font-bold px-2 py-0.5 rounded-md bg-[#F1F5EF] text-[#26332D] border border-[#E5E9E2]">
                {columns.length} Total
              </span>
            </div>
            <p className="text-[28px] font-bold text-[#26332D] leading-none font-mono tracking-tight">
              {columns.length}
            </p>
            <p className="text-[13px] text-[#64736A] mt-2">
              {health.numeric_columns} Numeric · {health.categorical_columns} Categorical
            </p>
          </div>
        </div>
      </div>

      {/* ═════════════════════════════════════════════════════════════
          3. FEATURE TYPES DISTRIBUTION & QUALITY CHECKLIST
          ═════════════════════════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-5">
        {/* Feature Types Distribution Card */}
        <div className="p-5 flex flex-col justify-between rounded-2xl bg-white border border-[#E5E9E2] shadow-[0_1px_3px_rgba(38,51,45,0.03)]">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#26332D]" />
              <h3 className="text-[15px] font-bold text-[#26332D]">
                Feature Type Distribution
              </h3>
            </div>
            <span className="text-[12px] font-mono text-[#78827A]">
              {columns.length} Columns
            </span>
          </div>

          {/* Segmented Horizontal Progress Bar with coordinated palette */}
          <div className="w-full h-3 rounded-full overflow-hidden flex bg-[#EEF2EB] my-2">
            {health.numeric_columns > 0 && (
              <div
                style={{ width: `${(health.numeric_columns / totalCols) * 100}%`, backgroundColor: '#26332D' }}
                className="h-full transition-all duration-300"
                title={`Numeric: ${health.numeric_columns} (${numericPct}%)`}
              />
            )}
            {health.categorical_columns > 0 && (
              <div
                style={{ width: `${(health.categorical_columns / totalCols) * 100}%`, backgroundColor: '#88CC33' }}
                className="h-full transition-all duration-300"
                title={`Categorical: ${health.categorical_columns} (${categoricalPct}%)`}
              />
            )}
            {health.datetime_columns > 0 && (
              <div
                style={{ width: `${(health.datetime_columns / totalCols) * 100}%`, backgroundColor: '#D97706' }}
                className="h-full transition-all duration-300"
                title={`Datetime: ${health.datetime_columns} (${datetimePct}%)`}
              />
            )}
            {health.text_columns > 0 && (
              <div
                style={{ width: `${(health.text_columns / totalCols) * 100}%`, backgroundColor: '#64736A' }}
                className="h-full transition-all duration-300"
                title={`Text: ${health.text_columns} (${textPct}%)`}
              />
            )}
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-4 mt-2 text-[12.5px]">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#26332D]" />
              <span className="font-semibold text-[#26332D]">Numeric</span>
              <span className="text-[#64736A] font-mono">
                {health.numeric_columns} ({numericPct}%)
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#88CC33]" />
              <span className="font-semibold text-[#26332D]">Categorical</span>
              <span className="text-[#64736A] font-mono">
                {health.categorical_columns} ({categoricalPct}%)
              </span>
            </div>
            {health.datetime_columns > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#D97706]" />
                <span className="font-semibold text-[#26332D]">Datetime</span>
                <span className="text-[#64736A] font-mono">
                  {health.datetime_columns} ({datetimePct}%)
                </span>
              </div>
            )}
            {health.text_columns > 0 && (
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#64736A]" />
                <span className="font-semibold text-[#26332D]">Text</span>
                <span className="text-[#64736A] font-mono">
                  {health.text_columns} ({textPct}%)
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Data Quality Overview Checklist */}
        <div className="p-5 flex flex-col justify-between rounded-2xl bg-white border border-[#E5E9E2] shadow-[0_1px_3px_rgba(38,51,45,0.03)]">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#2A7E4F]" />
              <h3 className="text-[15px] font-bold text-[#26332D]">
                Data Quality Overview
              </h3>
            </div>
            <span
              className={`text-[10.5px] font-bold px-2 py-0.5 rounded-md ${
                health.total_missing_cells === 0 && health.duplicate_rows === 0
                  ? "bg-[#EDF7F1] text-[#166534] border border-[#BCE2CC]"
                  : "bg-[#FEF8EC] text-[#B45309] border border-[#FDE68A]"
              }`}
            >
              {health.total_missing_cells === 0 && health.duplicate_rows === 0
                ? "Optimal Quality"
                : "Action Recommended"}
            </span>
          </div>

          <div className="space-y-2.5 mt-2">
            <div className="flex items-center gap-2.5 text-[13px]">
              {health.total_missing_cells === 0 ? (
                <CheckCircle2 className="w-4 h-4 text-[#2A7E4F] flex-shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-[#B45309] flex-shrink-0" />
              )}
              <span className="text-[#26332D]">
                {health.total_missing_cells === 0
                  ? "0 missing values (100% complete records)"
                  : `${health.total_missing_cells.toLocaleString()} missing cells (${health.missing_percentage.toFixed(2)}% null rate)`}
              </span>
            </div>

            <div className="flex items-center gap-2.5 text-[13px]">
              {health.duplicate_rows === 0 ? (
                <CheckCircle2 className="w-4 h-4 text-[#2A7E4F] flex-shrink-0" />
              ) : (
                <AlertTriangle className="w-4 h-4 text-[#B45309] flex-shrink-0" />
              )}
              <span className="text-[#26332D]">
                {health.duplicate_rows === 0
                  ? "0 duplicate rows detected in dataset"
                  : `${health.duplicate_rows.toLocaleString()} duplicate records (${health.duplicate_percentage.toFixed(2)}%)`}
              </span>
            </div>

            <div className="flex items-center gap-2.5 text-[13px]">
              <CheckCircle2 className="w-4 h-4 text-[#2A7E4F] flex-shrink-0" />
              <span className="text-[#26332D]">
                All {columns.length} feature dimensions verified and profiled
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
            <TrendingUp className="w-4 h-4 text-[#26332D]" />
            <h2 className="text-[17px] font-bold text-[#26332D]">
              Feature Statistics &amp; Missing Values Explorer
            </h2>
          </div>
          <span className="text-[13px] text-[#64736A]">
            Select a feature to view distributions, statistical moments, and sample values
          </span>
        </div>

        <div className="flex flex-col lg:flex-row items-stretch rounded-2xl overflow-hidden min-h-[640px] bg-white border border-[#E5E9E2] shadow-[0_1px_3px_rgba(38,51,45,0.03)]">
          {/* ── LEFT PANE: Feature Selector List ── */}
          <div className="w-full lg:w-[270px] flex-shrink-0 flex flex-col border-b lg:border-b-0 lg:border-r border-[#E5E9E2] bg-[#FAFBF9]">
            <div className="px-4 py-3.5 flex items-center justify-between border-b border-[#E5E9E2] bg-white flex-shrink-0">
              <span className="text-[11px] font-bold text-[#78827A] uppercase tracking-[0.14em]">
                Features ({columns.length})
              </span>
              <span className="text-[11px] text-[#2A7E4F] font-bold">
                Profile Active
              </span>
            </div>

            {/* Quick search input */}
            <div className="p-2 border-b border-[#E5E9E2] bg-white">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#78827A]" />
                <input
                  type="text"
                  placeholder="Filter columns…"
                  value={featureSearch}
                  onChange={(e) => setFeatureSearch(e.target.value)}
                  className="w-full pl-8 pr-2.5 py-1.5 text-[12px] rounded-lg bg-[#F7F8F4] border border-[#E5E9E2] text-[#26332D] placeholder-[#A2ABA5] outline-none focus:border-[#26332D]"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
              {columns
                .filter((col: any) =>
                  col.name.toLowerCase().includes(featureSearch.toLowerCase())
                )
                .map((col: any) => {
                const isSelected = activeCol?.name === col.name;
                const isNumeric = col.detected_type === "numeric";
                const isCat = col.detected_type === "categorical";
                const isDate = col.detected_type === "datetime";

                return (
                  <button
                    key={col.name}
                    type="button"
                    onClick={() => setSelectedColName(col.name)}
                    className={`w-full text-left px-3.5 py-3 rounded-xl flex items-center justify-between gap-2 transition-all duration-150 relative cursor-pointer ${
                      isSelected
                        ? "bg-[#F1F6EC] border border-[#DCE8DC] text-[#26332D] shadow-xs"
                        : "hover:bg-[#F2F5F0] border border-transparent text-[#64736A]"
                    }`}
                  >
                    {/* Active left indicator pill */}
                    {isSelected && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full bg-[#B8F34A]" />
                    )}

                    <div className="flex items-center gap-2.5 min-w-0">
                      {isNumeric ? (
                        <Hash className={`w-3.5 h-3.5 flex-shrink-0 ${isSelected ? "text-[#26332D]" : "text-[#78827A]"}`} />
                      ) : isCat ? (
                        <Tag className={`w-3.5 h-3.5 flex-shrink-0 ${isSelected ? "text-[#2A7E4F]" : "text-[#78827A]"}`} />
                      ) : isDate ? (
                        <Calendar className={`w-3.5 h-3.5 flex-shrink-0 ${isSelected ? "text-[#B45309]" : "text-[#78827A]"}`} />
                      ) : (
                        <AlignLeft className={`w-3.5 h-3.5 flex-shrink-0 ${isSelected ? "text-[#26332D]" : "text-[#78827A]"}`} />
                      )}

                      <span className={`text-[13.5px] truncate leading-tight ${isSelected ? "font-bold text-[#26332D]" : "font-medium"}`}>
                        {col.name}
                      </span>
                    </div>

                    <span
                      className={`text-[10px] font-mono font-bold uppercase px-1.5 py-0.5 rounded flex-shrink-0 ${
                        isNumeric
                          ? "bg-[#F1F5EF] text-[#26332D] border border-[#E5E9E2]"
                          : isCat
                          ? "bg-[#F3FCD7] text-[#28440D] border border-[#D2F775]"
                          : isDate
                          ? "bg-[#FEF8EC] text-[#B45309] border border-[#FDE68A]"
                          : "bg-[#F1F5EF] text-[#64736A] border border-[#E5E9E2]"
                      }`}
                    >
                      {col.detected_type?.slice(0, 3)}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── RIGHT PANE: Selected Feature Details ── */}
          <div className="flex-1 flex flex-col overflow-y-auto custom-scrollbar p-6 space-y-6 bg-white">
            {activeCol ? (
              <>
                {/* Feature Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#E5E9E2]">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-[22px] font-bold text-[#26332D] font-mono">
                        {activeCol.name}
                      </h3>
                      <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-[#F1F5EF] text-[#26332D] border border-[#E5E9E2]">
                        {activeCol.detected_type}
                      </span>
                    </div>
                    <p className="text-[13px] text-[#64736A]">
                      Memory footprint:{" "}
                      <span className="font-mono text-[#26332D] font-semibold">
                        {formatBytes(activeCol.memory_usage_bytes)}
                      </span>
                    </p>
                  </div>

                  {/* Missing Rate Badge */}
                  <div className="flex items-center gap-2 self-start sm:self-center">
                    <div
                      className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border ${
                        activeMissingPct === 0
                          ? "bg-[#EDF7F1] border-[#BCE2CC] text-[#166534]"
                          : "bg-[#FEF8EC] border-[#FDE68A] text-[#B45309]"
                      }`}
                    >
                      {activeMissingPct === 0 ? (
                        <CheckCircle2 className="w-4 h-4 text-[#2A7E4F]" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-[#B45309]" />
                      )}
                      <span className="text-[12px] font-medium">Missing Rate:</span>
                      <span className="text-[12.5px] font-bold font-mono">
                        {activeMissingPct.toFixed(2)}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quality Metrics Grid */}
                <div>
                  <span className="text-[11px] font-bold text-[#78827A] uppercase tracking-[0.14em] block mb-2.5">
                    Feature Quality Metrics
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3.5 rounded-xl bg-[#F9FAF7] border border-[#E5E9E2]">
                      <p className="text-[10.5px] font-bold text-[#78827A] uppercase tracking-wider mb-1">
                        Unique Values
                      </p>
                      <p className="text-[19px] font-bold text-[#26332D] font-mono leading-tight">
                        {activeUnique.toLocaleString()}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#F9FAF7] border border-[#E5E9E2]">
                      <p className="text-[10.5px] font-bold text-[#78827A] uppercase tracking-wider mb-1">
                        Null Count
                      </p>
                      <p className="text-[19px] font-bold text-[#26332D] font-mono leading-tight">
                        {activeNulls.toLocaleString()}
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#F9FAF7] border border-[#E5E9E2]">
                      <p className="text-[10.5px] font-bold text-[#78827A] uppercase tracking-wider mb-1">
                        Duplicate %
                      </p>
                      <p className="text-[19px] font-bold text-[#26332D] font-mono leading-tight">
                        {activeDupPct.toFixed(2)}%
                      </p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#F9FAF7] border border-[#E5E9E2]">
                      <p className="text-[10.5px] font-bold text-[#78827A] uppercase tracking-wider mb-1">
                        Missing %
                      </p>
                      <p className="text-[19px] font-bold text-[#26332D] font-mono leading-tight">
                        {activeMissingPct.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                </div>

                {/* Numeric Range Scale Overview */}
                {activeCol.detected_type === "numeric" && numStats && (
                  <div className="p-5 rounded-2xl bg-[#F9FAF7] border border-[#E5E9E2] flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-[#26332D]" />
                        <h4 className="text-[14.5px] font-bold text-[#26332D]">
                          Statistical Range &amp; Distribution Overview
                        </h4>
                      </div>
                      <span className="text-[12px] font-mono text-[#64736A]">
                        Range: {formatNum(minVal, 2)} → {formatNum(maxVal, 2)}
                      </span>
                    </div>

                    {/* Visual Range Scale */}
                    <div className="py-2 px-1">
                      <div className="relative w-full h-3 rounded-full bg-[#E5E9E2] border border-[#D6DCD3] mb-6">
                        {/* Mean marker */}
                        <div
                          className="absolute -top-1.5 w-1.5 h-6 bg-[#26332D] rounded-full z-10 -translate-x-1/2 shadow-xs"
                          style={{ left: `${meanPosPct}%` }}
                          title={`Mean: ${formatNum(meanVal)}`}
                        />
                        {/* Median marker */}
                        <div
                          className="absolute -top-1.5 w-1.5 h-6 bg-[#2A7E4F] rounded-full z-10 -translate-x-1/2 shadow-xs"
                          style={{ left: `${medianPosPct}%` }}
                          title={`Median: ${formatNum(medianVal)}`}
                        />
                      </div>

                      {/* Scale labels */}
                      <div className="flex items-center justify-between text-[12px] font-mono text-[#64736A]">
                        <div>
                          <span className="text-[#78827A] block text-[10px] font-sans uppercase font-bold">MIN</span>
                          <span className="text-[#26332D] font-bold">{formatNum(minVal, 2)}</span>
                        </div>

                        <div className="flex items-center gap-6">
                          <div className="text-center">
                            <span className="text-[#26332D] block text-[10px] font-sans uppercase font-bold">● MEAN</span>
                            <span className="text-[#26332D] font-bold">{formatNum(meanVal, 3)}</span>
                          </div>
                          <div className="text-center">
                            <span className="text-[#2A7E4F] block text-[10px] font-sans uppercase font-bold">● MEDIAN</span>
                            <span className="text-[#2A7E4F] font-bold">{formatNum(medianVal, 3)}</span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-[#78827A] block text-[10px] font-sans uppercase font-bold">MAX</span>
                          <span className="text-[#26332D] font-bold">{formatNum(maxVal, 2)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Moments summary */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3 border-t border-[#E5E9E2]">
                      <div>
                        <p className="text-[10px] uppercase font-bold text-[#78827A]">Std Deviation (σ)</p>
                        <p className="text-[13.5px] font-mono font-bold text-[#26332D]">{formatNum(stdVal, 4)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-[#78827A]">Variance (σ²)</p>
                        <p className="text-[13.5px] font-mono font-bold text-[#26332D]">{formatNum(numStats.variance, 4)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-[#78827A]">Skewness</p>
                        <p className="text-[13.5px] font-mono font-bold text-[#26332D]">{formatNum(numStats.skewness, 4)}</p>
                      </div>
                      <div>
                        <p className="text-[10px] uppercase font-bold text-[#78827A]">Kurtosis</p>
                        <p className="text-[13.5px] font-mono font-bold text-[#26332D]">{formatNum(numStats.kurtosis, 4)}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Categorical Frequency Distribution (Recharts) */}
                {(activeCol.detected_type === "categorical" || activeCol.detected_type === "boolean") &&
                  catChartData.length > 0 && (
                    <div className="p-5 rounded-2xl bg-[#F9FAF7] border border-[#E5E9E2] flex flex-col gap-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Layers className="w-4 h-4 text-[#2A7E4F]" />
                          <h4 className="text-[14.5px] font-bold text-[#26332D]">
                            Category Frequency Distribution
                          </h4>
                        </div>
                        <span className="text-[12px] font-mono text-[#64736A]">
                          {catChartData.length} Unique Categories
                        </span>
                      </div>

                      <div className="w-full h-52">
                        <ResponsiveContainer width="100%" height="100%">
                          <BarChart
                            data={catChartData}
                            layout="vertical"
                            margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                          >
                            <XAxis type="number" stroke="#78827A" fontSize={11} tickLine={false} />
                            <YAxis
                              type="category"
                              dataKey="name"
                              stroke="#26332D"
                              fontSize={11}
                              tickLine={false}
                              width={100}
                            />
                            <Tooltip content={<CustomCategoryTooltip />} cursor={{ fill: "rgba(38,51,45,0.03)" }} />
                            <Bar dataKey="count" radius={[0, 6, 6, 0]}>
                              {catChartData.map((_, index) => (
                                <Cell
                                  key={`cell-${index}`}
                                  fill={index === 0 ? "#26332D" : index === 1 ? "#88CC33" : "#A3BA9E"}
                                />
                              ))}
                            </Bar>
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}

                {/* Datetime stats */}
                {activeCol.detected_type === "datetime" && activeCol.datetime_stats && (
                  <div className="p-5 rounded-2xl bg-[#F9FAF7] border border-[#E5E9E2] grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div>
                      <p className="text-[11px] font-bold text-[#78827A] uppercase">Earliest Date</p>
                      <p className="text-[15px] font-bold text-[#26332D] font-mono mt-1">
                        {activeCol.datetime_stats.min_date || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-[#78827A] uppercase">Latest Date</p>
                      <p className="text-[15px] font-bold text-[#26332D] font-mono mt-1">
                        {activeCol.datetime_stats.max_date || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-[#78827A] uppercase">Date Range</p>
                      <p className="text-[15px] font-bold text-[#26332D] font-mono mt-1">
                        {activeCol.datetime_stats.date_range_days !== null
                          ? `${activeCol.datetime_stats.date_range_days} days`
                          : "—"}
                      </p>
                    </div>
                  </div>
                )}

                {/* Detailed Statistical Measures Table */}
                {activeCol.detected_type === "numeric" && numStats && (
                  <div>
                    <span className="text-[11px] font-bold text-[#78827A] uppercase tracking-[0.14em] block mb-2.5">
                      Detailed Statistical Measures
                    </span>
                    <div className="rounded-xl overflow-hidden border border-[#E5E9E2] bg-white">
                      <table className="w-full text-left text-[13px] border-collapse">
                        <thead>
                          <tr className="bg-[#F9FAF7] border-b border-[#E5E9E2]">
                            <th className="px-4 py-3 font-bold text-[#78827A] uppercase text-[11px] tracking-wider">
                              Metric
                            </th>
                            <th className="px-4 py-3 font-bold text-[#78827A] uppercase text-[11px] tracking-wider">
                              Calculated Value
                            </th>
                            <th className="px-4 py-3 font-bold text-[#78827A] uppercase text-[11px] tracking-wider hidden sm:table-cell">
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
                              className="border-b border-[#EEF2EB] hover:bg-[#F6F8F4] transition-colors last:border-b-0"
                            >
                              <td className="px-4 py-2.5 font-semibold text-[#26332D]">
                                {row.key}
                              </td>
                              <td className="px-4 py-2.5 font-mono font-bold text-[#26332D]">
                                {formatNum(row.val, 4)}
                              </td>
                              <td className="px-4 py-2.5 text-[#64736A] hidden sm:table-cell text-[12px]">
                                {row.desc}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Categorical Breakdown Table */}
                {(activeCol.detected_type === "categorical" || activeCol.detected_type === "boolean") &&
                  activeCol.categorical_stats && (
                    <div>
                      <span className="text-[11px] font-bold text-[#78827A] uppercase tracking-[0.14em] block mb-2.5">
                        Category Frequency Breakdown
                      </span>
                      <div className="rounded-xl overflow-hidden border border-[#E5E9E2] bg-white">
                        <table className="w-full text-left text-[13px] border-collapse">
                          <thead>
                            <tr className="bg-[#F9FAF7] border-b border-[#E5E9E2]">
                              <th className="px-4 py-3 font-bold text-[#78827A] uppercase text-[11px] tracking-wider">
                                Category Value
                              </th>
                              <th className="px-4 py-3 font-bold text-[#78827A] uppercase text-[11px] tracking-wider">
                                Observations
                              </th>
                              <th className="px-4 py-3 font-bold text-[#78827A] uppercase text-[11px] tracking-wider">
                                Share %
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {catChartData.map((row) => (
                              <tr
                                key={row.name}
                                className="border-b border-[#EEF2EB] hover:bg-[#F6F8F4] transition-colors last:border-b-0"
                              >
                                <td className="px-4 py-2.5 font-semibold text-[#26332D] truncate max-w-[200px]">
                                  {row.name}
                                </td>
                                <td className="px-4 py-2.5 font-mono font-bold text-[#2A7E4F]">
                                  {row.count.toLocaleString()}
                                </td>
                                <td className="px-4 py-2.5 font-mono text-[#64736A]">
                                  {row.percentage}%
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                {/* Sample Observations */}
                {activeCol.sample_values && activeCol.sample_values.length > 0 && (
                  <div>
                    <span className="text-[11px] font-bold text-[#78827A] uppercase tracking-[0.14em] block mb-2">
                      Sample Values (First 5 Rows)
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                      {activeCol.sample_values.map((val: any, idx: number) => (
                        <span
                          key={idx}
                          className="px-3 py-1.5 rounded-lg text-[12.5px] font-mono bg-[#F9FAF7] border border-[#E5E9E2] text-[#26332D]"
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
                <Info className="w-6 h-6 text-[#78827A]" />
                <p className="text-[14px] text-[#64736A]">
                  Select a feature column from the left panel to inspect its exploratory profile.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
