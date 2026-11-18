import { Menu, Database, Circle, RefreshCw, UploadCloud } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
  const { datasetInfo } = useDataset();
  const pageTitle = pageTitles[location.pathname] ?? "Dashboard";

  const handleTriggerUpload = () => {
    if (location.pathname === "/") {
      const uploadTrigger = document.getElementById("trigger-upload-btn");
      if (uploadTrigger) {
        uploadTrigger.click();
      } else {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    } else {
      navigate("/?upload=true");
    }
  };

  return (
    <header
      className="sticky top-0 z-30 flex items-center justify-between h-[58px] px-5 sm:px-8 flex-shrink-0 bg-white"
      style={{
        borderBottom: "1px solid #E5E9E2",
      }}
    >
      {/* Left: Breadcrumbs & Mobile Menu */}
      <div className="flex items-center gap-3">
        <button
          className="md:hidden p-2 rounded-lg text-[#64736A] hover:text-[#26332D] hover:bg-[#F1F5EF] transition-colors"
          onClick={onMenuClick}
          aria-label="Open navigation"
        >
          <Menu className="w-4.5 h-4.5" />
        </button>

        <nav className="flex items-center gap-2 text-[13.5px] font-medium" aria-label="Breadcrumb">
          <span className="text-[#78827A]">Workspace</span>
          <span className="text-[#C4CCC2]">/</span>
          <span className="font-semibold text-[#26332D]">{pageTitle}</span>
        </nav>
      </div>

      {/* Right: Dataset Context Status & Actions */}
      <div className="flex items-center gap-3">
        {datasetInfo ? (
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#F7F8F4] border border-[#E5E9E2] text-[#26332D]">
              <Circle className="w-2 h-2 text-[#2A7E4F] fill-[#2A7E4F]" />
              <Database className="w-3.5 h-3.5 text-[#64736A]" />
              <span
                className="font-mono text-[12.5px] font-semibold truncate max-w-[160px] sm:max-w-[220px]"
                title={datasetInfo.filename}
              >
                {datasetInfo.filename}
              </span>
              <span className="text-[#C4CCC2]">·</span>
              <span className="text-[12px] text-[#78827A] font-mono hidden sm:inline">
                {datasetInfo.rows?.toLocaleString()} rows
              </span>
            </div>

            <button
              onClick={handleTriggerUpload}
              className="btn btn-secondary btn-sm gap-1.5 text-[12.5px]"
              title="Replace current dataset"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#64736A]" />
              <span className="hidden sm:inline">Replace Dataset</span>
              <span className="sm:hidden">Replace</span>
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-2.5">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#F7F8F4] border border-[#E5E9E2] text-[#78827A] text-[12.5px]">
              <Circle className="w-2 h-2 text-[#A2ABA5] fill-[#A2ABA5]" />
              <span className="hidden sm:inline">No Active Dataset</span>
              <span className="sm:hidden">No Dataset</span>
            </div>

            <button
              onClick={handleTriggerUpload}
              className="btn btn-primary btn-sm gap-1.5 text-[12.5px]"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Upload CSV</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
