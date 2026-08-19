import { useNavigate } from "react-router-dom";
import {
  Upload,
  Database,
  Lightbulb,
  BarChart3,
  FlaskConical,
  FileText,
  Check,
} from "lucide-react";

interface WorkflowTimelineProps {
  datasetInfo?: any;
  datasetProfile?: any;
  datasetRecommendations?: any;
  modelResults?: any;
  globalExplanations?: any;
}

type StepStatus = "completed" | "active" | "pending";

export function WorkflowTimeline({
  datasetInfo,
  datasetProfile,
  datasetRecommendations,
  modelResults,
  globalExplanations,
}: WorkflowTimelineProps) {
  const navigate = useNavigate();

  const steps: {
    id: string; num: number; title: string; subtitle: string;
    icon: any; path: string; status: StepStatus;
  }[] = [
    {
      id: "upload", num: 1, title: "Upload", subtitle: "Dataset ingestion",
      icon: Upload, path: "/",
      status: datasetInfo ? "completed" : "active",
    },
    {
      id: "eda", num: 2, title: "EDA", subtitle: "Data profiling",
      icon: Database, path: "/profile",
      status: datasetProfile ? "completed" : datasetInfo ? "active" : "pending",
    },
    {
      id: "ai", num: 3, title: "AI Insights", subtitle: "Recommendations",
      icon: Lightbulb, path: "/insights",
      status: datasetRecommendations ? "completed" : datasetProfile ? "active" : "pending",
    },
    {
      id: "models", num: 4, title: "Models", subtitle: "Baseline evaluation",
      icon: BarChart3, path: "/models",
      status: modelResults ? "completed" : datasetRecommendations ? "active" : "pending",
    },
    {
      id: "explainability", num: 5, title: "Explainability", subtitle: "SHAP analysis",
      icon: FlaskConical, path: "/explainability",
      status: globalExplanations ? "completed" : modelResults ? "active" : "pending",
    },
    {
      id: "reports", num: 6, title: "Reports", subtitle: "Export results",
      icon: FileText, path: "/reports",
      status: globalExplanations ? "completed" : "pending",
    },
  ];

  return (
    <div
      className="px-6 py-5"
      style={{
        background: "#1E1F22",
        border: "1px solid #28292E",
        borderRadius: "12px",
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-6">
        <div
          className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0"
          style={{
            background: "rgba(62,207,113,0.12)",
            border: "1px solid rgba(62,207,113,0.25)",
          }}
        >
          <span
            className="w-2 h-2 rounded-full block"
            style={{ background: "#3ECF71" }}
          />
        </div>
        <div>
          <h2
            className="text-[18px] font-bold leading-none"
            style={{ color: "#E8E9ED" }}
          >
            Analysis Pipeline
          </h2>
          <p
            className="text-[13px] mt-1"
            style={{ color: "#6B6E76" }}
          >
            End-to-end workflow from data ingestion to insights and reports.
          </p>
        </div>
      </div>

      {/* Pipeline row: 6 centered columns */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-y-7 lg:gap-y-0 relative items-start">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const done = step.status === "completed";
          const active = step.status === "active";
          const pending = step.status === "pending";
          const isLast = idx === steps.length - 1;

          /* Circle styles */
          const circleStyle: React.CSSProperties = done
            ? {
                background: "#1A241E",
                border: "2px solid #3ECF71",
                color: "#3ECF71",
              }
            : active
            ? {
                background: "#221E32",
                border: "2px solid #7C5CFC",
                color: "#A78BFA",
              }
            : {
                background: "#25262A",
                border: "2px dashed #3A3B42",
                color: "#6B6E76",
              };

          /* Badge number styles */
          const badgeStyle: React.CSSProperties = done
            ? { background: "#3ECF71", borderColor: "#1E1F22", color: "#141517" }
            : active
            ? { background: "#7C5CFC", borderColor: "#1E1F22", color: "#FFFFFF" }
            : { background: "#25262A", borderColor: "#3A3B42", color: "#6B6E76" };

          /* Connector line styling (left & right half-lines) */
          const prevDone = idx > 0 && steps[idx - 1].status === "completed";
          const prevActive = idx > 0 && steps[idx - 1].status === "active";
          const lineLeftStyle: React.CSSProperties = prevDone && done
            ? { background: "#3ECF71" }
            : prevDone && active
            ? { background: "linear-gradient(to right, #3ECF71, #7C5CFC)" }
            : prevActive
            ? { background: "#7C5CFC" }
            : { background: "#28292E" };

          const nextDone = idx < steps.length - 1 && steps[idx + 1].status === "completed";
          const nextActive = idx < steps.length - 1 && steps[idx + 1].status === "active";
          const lineRightStyle: React.CSSProperties = done && nextDone
            ? { background: "#3ECF71" }
            : done && nextActive
            ? { background: "linear-gradient(to right, #3ECF71, #7C5CFC)" }
            : active
            ? { background: "linear-gradient(to right, #7C5CFC, #28292E)" }
            : { background: "#28292E" };

          return (
            <div
              key={step.id}
              className="flex-1 flex flex-col items-center text-center relative min-w-0 px-2"
            >
              {/* Connector lines behind icons (Desktop only) — meets outer edge of circles */}
              {idx > 0 && (
                <div
                  className="hidden lg:block absolute top-[24px] left-0 right-[calc(50%+24px)] h-[2px] -translate-y-1/2 pointer-events-none z-0"
                  style={lineLeftStyle}
                />
              )}
              {!isLast && (
                <div
                  className="hidden lg:block absolute top-[24px] left-[calc(50%+24px)] right-0 h-[2px] -translate-y-1/2 pointer-events-none z-0"
                  style={lineRightStyle}
                />
              )}

              {/* Step circle button */}
              <button
                onClick={() => !pending && navigate(step.path)}
                disabled={pending}
                className="relative z-10 flex items-center justify-center flex-shrink-0 transition-all duration-200 outline-none"
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "50%",
                  cursor: pending ? "not-allowed" : "pointer",
                  opacity: pending ? 0.6 : 1,
                  ...circleStyle,
                }}
              >
                {/* Step number badge */}
                <div
                  className="absolute -top-1 -right-1 w-[18px] h-[18px] rounded-full flex items-center justify-center text-[10px] font-bold leading-none"
                  style={{
                    border: "2px solid",
                    ...badgeStyle,
                  }}
                >
                  {step.num}
                </div>

                {/* Icon */}
                {done ? (
                  <Check className="w-5 h-5" strokeWidth={2.5} />
                ) : (
                  <Icon className="w-5 h-5" strokeWidth={1.75} />
                )}
              </button>

              {/* Title */}
              <p
                className="text-[15px] font-bold text-center mt-3 leading-tight truncate max-w-full"
                style={{ color: pending ? "#6B6E76" : "#E8E9ED" }}
              >
                {step.title}
              </p>

              {/* Subtitle */}
              <p
                className="text-[13px] text-center mt-1 leading-snug"
                style={{ color: "#71717A" }}
              >
                {step.subtitle}
              </p>

              {/* Status pill */}
              <div className="mt-2.5 flex justify-center">
                {done ? (
                  <span
                    className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-[3px] rounded-full"
                    style={{
                      background: "rgba(62,207,113,0.12)",
                      color: "#3ECF71",
                      border: "1px solid rgba(62,207,113,0.25)",
                    }}
                  >
                    DONE
                  </span>
                ) : active ? (
                  <span
                    className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-[3px] rounded-full"
                    style={{
                      background: "rgba(124,92,252,0.12)",
                      color: "#A78BFA",
                      border: "1px solid rgba(124,92,252,0.25)",
                    }}
                  >
                    ACTIVE
                  </span>
                ) : (
                  <span
                    className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-[3px] rounded-full"
                    style={{
                      color: "#6B6E76",
                      border: "1px solid #323338",
                      background: "#25262A",
                    }}
                  >
                    PENDING
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}