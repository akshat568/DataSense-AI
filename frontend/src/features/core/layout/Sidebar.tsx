import { NavLink, useLocation } from "react-router-dom";
import {
  BrainCircuit,
  LayoutDashboard,
  Database,
  Lightbulb,
  BarChart3,
  FlaskConical,
  FileText,
  X,
  Sparkles,
  Layers,
  Activity,
} from "lucide-react";
import { useDataset } from "../../core/context/DatasetContext";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
}

const navItems = [
  { name: "Dashboard", icon: LayoutDashboard, path: "/" },
  { name: "Dataset Profile", icon: Database, path: "/profile" },
  { name: "AI Insights", icon: Lightbulb, path: "/insights" },
  { name: "Baseline Models", icon: BarChart3, path: "/models" },
  { name: "AI Explainability", icon: FlaskConical, path: "/explainability" },
  { name: "Reports", icon: FileText, path: "/reports" },
];

export function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const location = useLocation();
  const { datasetInfo } = useDataset();

  const isActive = (path: string) =>
    path === "/"
      ? location.pathname === "/" || location.pathname === "/upload"
      : location.pathname.startsWith(path);

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-[#26332D]/70 backdrop-blur-xs md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col transition-transform duration-200 ease-out
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0 md:static md:flex-shrink-0`}
        style={{
          width: "250px",
          backgroundColor: "#26332D",
          borderRight: "1px solid #33433B",
        }}
      >
        {/* ---------- Logo & Brand Header ---------- */}
        <div
          className="h-[58px] px-5 flex items-center justify-between flex-shrink-0"
          style={{ borderBottom: "1px solid #33433B" }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: "#B8F34A" }}
            >
              <BrainCircuit className="w-4.5 h-4.5 text-[#26332D]" strokeWidth={2.2} />
            </div>
            <div className="flex flex-col">
              <span className="text-[15px] font-bold tracking-tight text-white leading-tight">
                DataSense <span style={{ color: "#B8F34A" }}>AI</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-[0.14em] text-[#86988E]">
                Dataset Intelligence
              </span>
            </div>
          </div>

          <button
            onClick={() => setIsOpen(false)}
            className="md:hidden p-1.5 rounded-lg text-[#86988E] hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Close navigation"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ---------- Navigation Menu ---------- */}
        <nav className="flex-1 overflow-y-auto px-3 py-5 custom-scrollbar">
          <div className="mb-2 px-3 select-none flex items-center justify-between">
            <span className="text-[10.5px] font-bold uppercase tracking-[0.14em] text-[#7E9287]">
              Platform Modules
            </span>
            <Layers className="w-3 h-3 text-[#53655B]" />
          </div>

          <div className="space-y-1">
            {navItems.map((item) => {
              const active = isActive(item.path);

              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className="group relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13.5px] font-medium transition-all duration-150"
                  style={{
                    backgroundColor: active ? "rgba(184, 243, 74, 0.10)" : "transparent",
                    color: active ? "#FFFFFF" : "#9EAEA4",
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.05)";
                      e.currentTarget.style.color = "#FFFFFF";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      e.currentTarget.style.backgroundColor = "transparent";
                      e.currentTarget.style.color = "#9EAEA4";
                    }
                  }}
                >
                  {/* Restrained Acid Mint Active Indicator Pill */}
                  {active && (
                    <span
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full"
                      style={{ background: "#B8F34A" }}
                    />
                  )}

                  <item.icon
                    className="w-[18px] h-[18px] flex-shrink-0 transition-colors"
                    style={{
                      color: active ? "#B8F34A" : "#72857A",
                    }}
                    strokeWidth={active ? 2.2 : 1.75}
                  />

                  <span className={`truncate ${active ? "font-semibold text-white" : ""}`}>
                    {item.name}
                  </span>
                </NavLink>
              );
            })}
          </div>
        </nav>

        {/* ---------- Dataset Status Card / Context ---------- */}
        <div className="px-3 pb-3 flex-shrink-0">
          <div
            className="rounded-xl p-3"
            style={{
              background: "#1E2823",
              border: "1px solid #304037",
            }}
          >
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <div
                  className="w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0"
                  style={{
                    background: "rgba(184, 243, 74, 0.14)",
                  }}
                >
                  <Sparkles className="w-3 h-3 text-[#B8F34A]" />
                </div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#B8F34A]">
                  AI Engine
                </span>
              </div>
              <span className="w-1.5 h-1.5 rounded-full bg-[#B8F34A] animate-pulse" />
            </div>
            <p className="text-[11.5px] leading-relaxed text-[#93A59B]">
              {datasetInfo ? (
                <>
                  <span className="text-white font-medium truncate block" title={datasetInfo.filename}>
                    {datasetInfo.filename}
                  </span>
                  <span>{datasetInfo.rows?.toLocaleString()} rows loaded · SHAP ready</span>
                </>
              ) : (
                "Upload a CSV dataset to unlock automated profiling, SHAP explainability, and ML baselines."
              )}
            </p>
          </div>
        </div>

        {/* ---------- Footer ---------- */}
        <div
          className="px-4 py-3 flex-shrink-0"
          style={{ borderTop: "1px solid #33433B" }}
        >
          <div className="flex items-center justify-between text-[11.5px] text-[#86988E]">
            <span className="flex items-center gap-1.5 font-medium">
              <Activity className="w-3.5 h-3.5 text-[#B8F34A]" />
              Status: Operational
            </span>
            <span className="font-mono text-[10.5px] text-[#718479]">v2.4</span>
          </div>
        </div>
      </aside>
    </>
  );
}
