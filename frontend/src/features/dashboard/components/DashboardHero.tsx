import { useNavigate } from "react-router-dom";
import { UploadCloud, Database, ArrowRight, RefreshCw, Circle, CheckCircle2 } from "lucide-react";
import { useDataset } from "../../core/context/DatasetContext";

interface DashboardHeroProps {
  onUpload: () => void;
  uploadCard: React.ReactNode;
}

export function DashboardHero({ onUpload, uploadCard }: DashboardHeroProps) {
  const navigate = useNavigate();
  const { datasetInfo } = useDataset();

  return (
    <section
      className="relative overflow-hidden rounded-2xl border border-[#E5E9E2] bg-white shadow-[0_1px_3px_rgba(38,51,45,0.04)]"
      style={{
        background: "linear-gradient(135deg, #FFFFFF 0%, #F8FAF6 100%)",
      }}
    >
      {/* ── Content ── */}
      <div className="relative z-10 px-6 sm:px-8 py-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">
          {/* LEFT: Branding & Refined Header */}
          <div className="max-w-2xl">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider bg-[#F1F5EF] text-[#26332D] border border-[#E5E9E2]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2A7E4F]" />
                Dataset Intelligence Platform
              </span>

              {/* Compact Dataset Status Pill */}
              {datasetInfo ? (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-[#EDF7F1] text-[#166534] border border-[#BCE2CC]">
                  <CheckCircle2 className="w-3 h-3 text-[#2A7E4F]" />
                  <span className="font-mono font-semibold truncate max-w-[150px]">{datasetInfo.filename}</span>
                  <span>· {datasetInfo.rows?.toLocaleString()} rows</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-medium bg-[#F7F8F4] text-[#78827A] border border-[#E5E9E2]">
                  <Circle className="w-2 h-2 text-[#A2ABA5] fill-[#A2ABA5]" />
                  Awaiting Dataset
                </span>
              )}
            </div>

            <h1 className="text-[26px] sm:text-[30px] font-extrabold text-[#26332D] tracking-tight leading-tight">
              Dataset Intelligence Workspace
            </h1>

            <p className="text-[13.5px] sm:text-[14px] text-[#64736A] mt-1.5 leading-relaxed">
              Automated data profiling, data quality issue detection, ML recommendations, baseline model evaluation, and SHAP explainability in one unified workspace.
            </p>
          </div>

          {/* RIGHT: Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 flex-shrink-0">
            <button
              id="trigger-upload-btn"
              onClick={onUpload}
              className="btn btn-primary gap-2"
              style={{
                height: "42px",
                paddingInline: "18px",
                fontSize: "13.5px",
                boxShadow: "0 1px 3px rgba(38, 51, 45, 0.08)",
              }}
            >
              {datasetInfo ? (
                <>
                  <RefreshCw className="w-4 h-4 text-[#26332D]" />
                  Replace Dataset
                </>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4 text-[#26332D]" />
                  Upload Dataset
                </>
              )}
            </button>

            <button
              onClick={() => navigate("/profile")}
              className="btn btn-secondary gap-2"
              style={{
                height: "42px",
                paddingInline: "16px",
                fontSize: "13.5px",
              }}
            >
              <Database className="w-4 h-4 text-[#64736A]" />
              Dataset Profile
              <ArrowRight className="w-3.5 h-3.5 text-[#78827A]" />
            </button>
          </div>
        </div>

        {/* Upload Card Expandable Container */}
        {uploadCard && (
          <div className="mt-5 pt-5 border-t border-[#E5E9E2] fade-in">
            {uploadCard}
          </div>
        )}
      </div>
    </section>
  );
}
