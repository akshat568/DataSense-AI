import { Menu, Database, Circle } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useDataset } from "../../core/context/DatasetContext";

interface TopbarProps {
  onMenuClick: () => void;
}

const pageTitles: Record<string, string> = {
  "/": "Dashboard",
  "/upload": "Dashboard",
  "/profile": "Dataset Profile",
  "/insights": "AI Insights",
  "/recommendations": "AI Insights",
  "/models": "Baseline Models",
  "/explainability": "AI Explainability",
  "/reports": "Reports",
};

export function Topbar({ onMenuClick }: TopbarProps) {
  const location = useLocation();
  const { datasetInfo } = useDataset();
  const pageTitle = pageTitles[location.pathname] ?? "Dashboard";

  return (
    <header
      className="sticky top-0 z-30 flex items-center justify-between h-[52px] px-6 flex-shrink-0"
      style={{
        background: "#141517",
        borderBottom: "1px solid #28292E",
      }}
    >
      {/* Left: Breadcrumb */}
      <div className="flex items-center gap-3">
        <button
          className="md:hidden p-1.5 rounded-lg"
          style={{ color: "#6B6E76" }}
          onClick={onMenuClick}
          aria-label="Open navigation"
        >
          <Menu className="w-4 h-4" />
        </button>

        <nav className="flex items-center gap-2 text-[14px] font-medium" aria-label="Breadcrumb">
          <span style={{ color: "#6B6E76" }}>Analysis</span>
          <span style={{ color: "#323338" }}>/</span>
          <span className="font-semibold" style={{ color: "#E8E9ED" }}>{pageTitle}</span>
        </nav>
      </div>

      {/* Right: Dataset Status */}
      <div className="flex items-center gap-2 text-[13px]">
        {datasetInfo ? (
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg"
            style={{
              background: "#1E1F22",
              border: "1px solid #323338",
            }}
          >
            <Circle className="w-2 h-2" style={{ color: "#3ECF71", fill: "#3ECF71" }} />
            <Database className="w-4 h-4" style={{ color: "#9DA0A8" }} />
            <span
              className="font-mono text-[13px] truncate max-w-[220px]"
              style={{ color: "#E8E9ED" }}
              title={datasetInfo.filename}
            >
              {datasetInfo.filename}
            </span>
          </div>
        ) : (
          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[13px]"
            style={{
              background: "#1E1F22",
              border: "1px solid #323338",
              color: "#6B6E76",
            }}
          >
            <Circle className="w-2 h-2" style={{ color: "#6B6E76", fill: "#6B6E76" }} />
            <span>No Dataset Uploaded</span>
          </div>
        )}
      </div>
    </header>
  );
}