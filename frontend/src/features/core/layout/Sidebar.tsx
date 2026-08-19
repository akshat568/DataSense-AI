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
} from "lucide-react";

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

  const isActive = (path: string) =>
    path === "/"
      ? location.pathname === "/" || location.pathname === "/upload"
      : location.pathname.startsWith(path);

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <div
        className={`fixed inset-y-0 left-0 z-50 flex flex-col transition-transform duration-200
        ${isOpen ? "translate-x-0" : "-translate-x-full"}
        md:translate-x-0 md:static md:flex-shrink-0`}
        style={{
          width: "240px",
          background: "#191A1D",
          borderRight: "1px solid #28292E",
        }}
      >
        {/* ---------- Logo ---------- */}
        <div
          className="h-[56px] px-5 flex items-center justify-between flex-shrink-0"
          style={{ borderBottom: "1px solid #28292E" }}
        >
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0"
              style={{ background: "#7C5CFC" }}
            >
              <BrainCircuit className="w-4 h-4 text-white" strokeWidth={2} />
            </div>
            <span
              className="text-[15px] font-bold tracking-tight"
              style={{ color: "#E8E9ED" }}
            >
              DataSense AI
            </span>
          </div>

          <button
            onClick={() => setIsOpen(false)}
            className="md:hidden p-1.5 rounded-lg"
            style={{ color: "#6B6E76" }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* ---------- Navigation ---------- */}
        <nav className="flex-1 overflow-y-auto px-3 py-5 custom-scrollbar">
          <div className="mb-2.5 px-2 select-none">
            <span
              className="text-[11px] font-bold uppercase tracking-[0.12em]"
              style={{ color: "#6B6E76" }}
            >
              Analysis
            </span>
          </div>

          <div className="space-y-1">
            {navItems.map((item) => {
              const active = isActive(item.path);

              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  onClick={() => setIsOpen(false)}
                  className="group relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] font-medium transition-all duration-150"
                  style={{
                    background: active
                      ? "rgba(124, 92, 252, 0.08)"
                      : "transparent",
                    color: active ? "#E8E9ED" : "#9DA0A8",
                  }}
                  onMouseEnter={(e) => {
                    if (!active) {
                      e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                      e.currentTarget.style.color = "#E8E9ED";
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      e.currentTarget.style.background = "transparent";
                      e.currentTarget.style.color = "#9DA0A8";
                    }
                  }}
                >
                  {/* Active indicator */}
                  {active && (
                    <span
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4 rounded-r-full"
                      style={{ background: "#7C5CFC" }}
                    />
                  )}

                  <item.icon
                    className="w-[18px] h-[18px] flex-shrink-0 transition-colors"
                    style={{
                      color: active ? "#7C5CFC" : "#6B6E76",
                    }}
                    strokeWidth={1.75}
                  />

                  <span className="truncate">{item.name}</span>
                </NavLink>
              );
            })}
          </div>
        </nav>

        {/* ---------- Pro Tip ---------- */}
        <div className="px-3 pb-3 flex-shrink-0">
          <div
            className="rounded-lg p-3"
            style={{
              background: "#1C1D20",
              border: "1px solid #28292E",
            }}
          >
            <div className="flex items-center gap-2 mb-2">
              <div
                className="w-[22px] h-[22px] rounded-full flex items-center justify-center flex-shrink-0"
                style={{
                  background: "rgba(229, 169, 64, 0.10)",
                  border: "1px solid rgba(229, 169, 64, 0.20)",
                }}
              >
                <Lightbulb className="w-3 h-3" style={{ color: "#E5A940" }} />
              </div>
              <span
                className="text-[12px] font-bold uppercase tracking-wider"
                style={{ color: "#E5A940" }}
              >
                Pro Tip
              </span>
            </div>
            <p
              className="text-[12px] leading-relaxed"
              style={{ color: "#6B6E76" }}
            >
              Upload a dataset to unlock AI-powered insights and smart recommendations.
            </p>
          </div>
        </div>

        {/* ---------- Footer ---------- */}
        <div
          className="px-4 py-3 flex-shrink-0"
          style={{ borderTop: "1px solid #28292E" }}
        >
          <div
            className="flex items-center gap-2 px-2 py-1.5 text-[12px] font-medium"
            style={{ color: "#6B6E76" }}
          >
            <Sparkles className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#7C5CFC" }} />
            <span className="truncate">Powered by DataSense AI</span>
          </div>
        </div>
      </div>
    </>
  );
}