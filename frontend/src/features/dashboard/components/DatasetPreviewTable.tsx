import { useState } from "react";
import { Table2, ChevronLeft, ChevronRight } from "lucide-react";

interface DatasetPreviewTableProps {
  preview: any[] | null;
  dataTypes: Record<string, string> | null;
  totalRows?: number;
}

const typeBadgeStyles: Record<string, { color: string; bg: string; border: string }> = {
  numeric:     { color: "#26332D", bg: "#F1F5EF", border: "#E5E9E2" },
  categorical: { color: "#28440D", bg: "#F3FCD7", border: "#D2F775" },
  datetime:    { color: "#B45309", bg: "#FEF8EC", border: "#FDE68A" },
  text:        { color: "#64736A", bg: "#F1F5EF", border: "#E5E9E2" },
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

  const pageNumbers = Array.from({ length: Math.min(totalPages, 4) }, (_, i) => i + 1);

  return (
    <div className="flex flex-col rounded-2xl overflow-hidden bg-white border border-[#E5E9E2] shadow-[0_1px_3px_rgba(38,51,45,0.03)]">
      {/* Table header row */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5E9E2] bg-white">
        <div>
          <h3 className="text-[16px] font-bold text-[#26332D]">
            Dataset Preview
          </h3>
          <p className="text-[12.5px] text-[#64736A]">
            Sample records and detected feature data types
          </p>
        </div>
        {isLoaded && (
          <span className="text-[12.5px] font-mono text-[#78827A] bg-[#F7F8F4] px-2.5 py-1 rounded-lg border border-[#E5E9E2]">
            Showing {displayRows.length} of {totalCount.toLocaleString()} rows
          </span>
        )}
      </div>

      {/* Scrollable table container */}
      <div className="overflow-x-auto custom-scrollbar max-h-[380px]">
        <table className="min-w-full border-collapse text-[13px] text-left">
          <thead className="sticky top-0 z-10 bg-[#F9FAF7] border-b border-[#E5E9E2]">
            <tr>
              <th className="px-4 py-3 text-[11px] font-bold text-[#78827A] uppercase tracking-wider w-10">
                #
              </th>
              {columns.map((col, i) => {
                const typeKey = isLoaded ? dataTypes[col] : "";
                const badge = typeBadgeStyles[typeKey] ?? typeBadgeStyles.text;
                return (
                  <th key={i} className="px-4 py-3 whitespace-nowrap">
                    <div className="flex flex-col gap-1">
                      <span className="text-[13px] font-bold text-[#26332D] truncate max-w-[160px]">
                        {col}
                      </span>
                      {isLoaded && (
                        <span
                          className="text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded w-fit"
                          style={{
                            color: badge.color,
                            backgroundColor: badge.bg,
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
                    className="border-b border-[#EEF2EB] hover:bg-[#F6F8F4] transition-colors duration-100 last:border-b-0"
                  >
                    <td className="px-4 py-2.5 text-[11px] font-mono text-[#78827A]">
                      {globalIdx}
                    </td>
                    {columns.map((col) => (
                      <td
                        key={`${rowIdx}-${col}`}
                        className="px-4 py-2.5 whitespace-nowrap text-[#26332D]"
                      >
                        {row[col] !== null && row[col] !== undefined ? (
                          <span
                            className="truncate max-w-[190px] inline-block font-mono text-[12.5px]"
                            title={String(row[col])}
                          >
                            {String(row[col])}
                          </span>
                        ) : (
                          <span className="italic text-[12px] text-[#A2ABA5]">null</span>
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
                    <div className="w-12 h-12 rounded-2xl bg-[#F1F5EF] border border-[#E5E9E2] flex items-center justify-center text-[#64736A]">
                      <Table2 className="w-6 h-6" strokeWidth={1.75} />
                    </div>
                    <p className="text-[14px] font-bold text-[#26332D]">No Dataset Loaded</p>
                    <p className="text-[13px] text-[#64736A] max-w-xs">
                      Upload a CSV file to inspect feature columns and sample records.
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {isLoaded && (
        <div className="px-5 py-3.5 flex flex-wrap items-center justify-between gap-3 border-t border-[#E5E9E2] bg-[#FAFBF9]">
          <span className="text-[12.5px] text-[#64736A]">
            Showing {(page - 1) * rowsPerPage + 1}–{Math.min(page * rowsPerPage, allRows.length)} of {totalCount.toLocaleString()} rows
          </span>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-[12.5px] text-[#64736A]">
              <span>Rows per page</span>
              <select
                value={rowsPerPage}
                onChange={(e) => {
                  setRowsPerPage(Number(e.target.value));
                  setPage(1);
                }}
                className="text-[12.5px] font-medium rounded-lg px-2.5 py-1 bg-white border border-[#E5E9E2] text-[#26332D] outline-none cursor-pointer hover:border-[#D6DCD3]"
              >
                {ROWS_OPTIONS.map((n) => (
                  <option key={n} value={n}>{n}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="w-7 h-7 rounded-lg flex items-center justify-center border border-[#E5E9E2] bg-white text-[#64736A] hover:text-[#26332D] hover:bg-[#F1F5EF] transition-colors disabled:opacity-35 disabled:cursor-not-allowed"
                aria-label="Previous page"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>

              {pageNumbers.map((num) => (
                <button
                  key={num}
                  onClick={() => setPage(num)}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-[12.5px] font-semibold transition-colors ${
                    page === num
                      ? "bg-[#26332D] text-white border border-[#26332D]"
                      : "bg-white border border-[#E5E9E2] text-[#64736A] hover:bg-[#F1F5EF] hover:text-[#26332D]"
                  }`}
                >
                  {num}
                </button>
              ))}

              {totalPages > 4 && <span className="text-[12px] px-1 text-[#78827A]">…</span>}
              {totalPages > 4 && (
                <button
                  onClick={() => setPage(totalPages)}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-[12.5px] font-semibold transition-colors ${
                    page === totalPages
                      ? "bg-[#26332D] text-white border border-[#26332D]"
                      : "bg-white border border-[#E5E9E2] text-[#64736A] hover:bg-[#F1F5EF] hover:text-[#26332D]"
                  }`}
                >
                  {totalPages}
                </button>
              )}

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="w-7 h-7 rounded-lg flex items-center justify-center border border-[#E5E9E2] bg-white text-[#64736A] hover:text-[#26332D] hover:bg-[#F1F5EF] transition-colors disabled:opacity-35 disabled:cursor-not-allowed"
                aria-label="Next page"
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
