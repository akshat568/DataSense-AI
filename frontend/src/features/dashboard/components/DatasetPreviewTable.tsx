import { useState } from "react";
import { Table2, ChevronLeft, ChevronRight } from "lucide-react";

interface DatasetPreviewTableProps {
  preview: any[] | null;
  dataTypes: Record<string, string> | null;
  totalRows?: number;
}

const typeBadgeStyles: Record<string, { color: string; bg: string; border: string }> = {
  numeric:     { color: "#7BA3D9", bg: "rgba(123,163,217,0.10)", border: "rgba(123,163,217,0.20)" },
  categorical: { color: "#5BDF8E", bg: "rgba(91,223,142,0.10)", border: "rgba(91,223,142,0.20)" },
  datetime:    { color: "#E5A940", bg: "rgba(229,169,64,0.10)", border: "rgba(229,169,64,0.20)" },
  text:        { color: "#9DA0A8", bg: "#25262A", border: "#323338" },
};

const ROWS_OPTIONS = [5, 10, 25];

export function DatasetPreviewTable({ preview, dataTypes, totalRows }: DatasetPreviewTableProps) {
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [page, setPage] = useState(1);

  const isLoaded = preview && preview.length > 0 && dataTypes;
  const columns = isLoaded ? Object.keys(dataTypes) : ["col_1", "col_2", "col_3", "col_4", "col_5"];
  const allRows = preview ?? [];
  const totalCount = totalRows ?? allRows.length;
  const totalPages = Math.max(1, Math.ceil(allRows.length / rowsPerPage));
  const displayRows = allRows.slice((page - 1) * rowsPerPage, page * rowsPerPage);

  /* Page number buttons: show at most 4 */
  const pageNumbers = Array.from({ length: Math.min(totalPages, 4) }, (_, i) => i + 1);

  return (
    <div
      className="flex flex-col gap-0 overflow-hidden"
      style={{
        background: "#1E1F22",
        border: "1px solid #28292E",
        borderRadius: "12px",
      }}
    >
      {/* Table header row */}
      <div
        className="flex items-center justify-between px-5 py-3.5"
        style={{ borderBottom: "1px solid #28292E" }}
      >
        <h2
          className="text-[18px] font-bold"
          style={{ color: "#E8E9ED" }}
        >
          Dataset Preview
        </h2>
        {isLoaded && (
          <span className="text-[13px]" style={{ color: "#6B6E76" }}>
            Showing {displayRows.length} of {totalCount.toLocaleString()} rows
          </span>
        )}
      </div>

      {/* Scrollable table area */}
      <div className="overflow-x-auto custom-scrollbar max-h-[380px]">
        <table className="min-w-full border-collapse text-[13px] text-left">
          <thead className="sticky top-0 z-10" style={{ background: "#25262A" }}>
            <tr style={{ borderBottom: "1px solid #28292E" }}>
              {/* Row index column */}
              <th
                className="px-4 py-3 text-[11px] font-semibold w-8"
                style={{ color: "#4A4C52" }}
              >
                #
              </th>
              {columns.map((col, i) => {
                const typeKey = isLoaded ? dataTypes[col] : "";
                const badge = typeBadgeStyles[typeKey] ?? typeBadgeStyles.text;
                return (
                  <th key={i} className="px-3.5 py-3 whitespace-nowrap">
                    <div className="flex flex-col gap-1">
                      <span
                        className="text-[13px] font-semibold truncate max-w-[150px]"
                        style={{ color: isLoaded ? "#E8E9ED" : "#6B6E76" }}
                      >
                        {col}
                      </span>
                      {isLoaded && (
                        <span
                          className="text-[11px] font-semibold uppercase tracking-wide px-2 py-[2px] rounded w-fit"
                          style={{
                            color: badge.color,
                            background: badge.bg,
                            border: `1px solid ${badge.border}`,
                          }}
                        >
                          {dataTypes[col]}
                        </span>
                      )}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody>
            {isLoaded ? (
              displayRows.map((row, rowIdx) => {
                const globalIdx = (page - 1) * rowsPerPage + rowIdx + 1;
                return (
                  <tr
                    key={rowIdx}
                    className="transition-colors duration-150 last:border-b-0"
                    style={{ borderBottom: "1px solid #232428" }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#25262A";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "transparent";
                    }}
                  >
                    <td
                      className="px-3.5 py-2.5 text-[11px]"
                      style={{ color: "#4A4C52" }}
                    >
                      {globalIdx}
                    </td>
                    {columns.map((col) => (
                      <td
                        key={`${rowIdx}-${col}`}
                        className="px-3.5 py-2.5 whitespace-nowrap"
                        style={{ color: "#9DA0A8" }}
                      >
                        {row[col] !== null && row[col] !== undefined ? (
                          <span
                            className="truncate max-w-[180px] inline-block text-[13px]"
                            title={String(row[col])}
                          >
                            {String(row[col])}
                          </span>
                        ) : (
                          <span className="italic text-[12px]" style={{ color: "#4A4C52" }}>null</span>
                        )}
                      </td>
                    ))}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={columns.length + 1} className="py-14 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center"
                      style={{
                        background: "#25262A",
                        border: "1px solid #323338",
                      }}
                    >
                      <Table2 className="w-5 h-5" style={{ color: "#6B6E76" }} strokeWidth={1.75} />
                    </div>
                    <p className="text-[14px] font-medium" style={{ color: "#6B6E76" }}>No dataset loaded</p>
                    <p className="text-[13px] max-w-xs" style={{ color: "#4A4C52" }}>
                      Upload a CSV file to inspect feature columns and sample records.
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Footer with pagination */}
      {isLoaded && (
        <div
          className="px-5 py-3.5 flex flex-wrap items-center justify-between gap-3"
          style={{
            borderTop: "1px solid #28292E",
            background: "#232428",
          }}
        >
          {/* Row count info */}
          <span className="text-[13px]" style={{ color: "#6B6E76" }}>
            Showing {(page - 1) * rowsPerPage + 1}–{Math.min(page * rowsPerPage, allRows.length)} of {totalCount.toLocaleString()} rows
          </span>

          <div className="flex items-center gap-4">
            {/* Rows per page */}
            <div className="flex items-center gap-2">
              <span className="text-[13px] whitespace-nowrap" style={{ color: "#6B6E76" }}>Rows per page</span>
              <select
                value={rowsPerPage}
                onChange={(e) => { setRowsPerPage(Number(e.target.value)); setPage(1); }}
                className="text-[13px] rounded-lg px-2.5 py-1 cursor-pointer outline-none transition-colors"
                style={{
                  background: "#1E1F22",
                  border: "1px solid #323338",
                  color: "#E8E9ED",
                }}
              >
                {ROWS_OPTIONS.map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>

            {/* Page navigation */}
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors disabled:opacity-30"
                style={{
                  border: "1px solid #323338",
                  background: "#1E1F22",
                  color: "#9DA0A8",
                }}
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              {pageNumbers.map((num) => (
                <button
                  key={num}
                  onClick={() => setPage(num)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-[13px] font-semibold transition-colors"
                  style={{
                    background: page === num ? "#7C5CFC" : "#1E1F22",
                    border: page === num ? "1px solid #7C5CFC" : "1px solid #323338",
                    color: page === num ? "#FFFFFF" : "#9DA0A8",
                  }}
                >
                  {num}
                </button>
              ))}

              {totalPages > 4 && (
                <span className="text-[13px] px-1" style={{ color: "#4A4C52" }}>…</span>
              )}
              {totalPages > 4 && (
                <button
                  onClick={() => setPage(totalPages)}
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-[13px] font-semibold transition-colors"
                  style={{
                    background: page === totalPages ? "#7C5CFC" : "#1E1F22",
                    border: page === totalPages ? "1px solid #7C5CFC" : "1px solid #323338",
                    color: page === totalPages ? "#FFFFFF" : "#9DA0A8",
                  }}
                >
                  {totalPages}
                </button>
              )}

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="w-7 h-7 rounded-lg flex items-center justify-center transition-colors disabled:opacity-30"
                style={{
                  border: "1px solid #323338",
                  background: "#1E1F22",
                  color: "#9DA0A8",
                }}
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}