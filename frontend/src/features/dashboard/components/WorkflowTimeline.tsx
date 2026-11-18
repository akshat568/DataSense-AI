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

type StepStatus = "completed" | "active" | "pending" | "failed";

export function WorkflowTimeline({
  datasetInfo,
  datasetProfile,
  datasetRecommendations,
  modelResults,
  globalExplanations,
}: WorkflowTimelineProps) {
  const navigate = useNavigate();

  const steps: {
    id: string;
    num: number;
    title: string;
    subtitle: string;
    icon: any;
    path: string;
    status: StepStatus;
  }[] = [
    {
      id: "upload",
      num: 1,
      title: "Upload",
      subtitle: "Dataset ingestion",
      icon: Upload,
      path: "/",
      status: datasetInfo ? "completed" : "active",
    },
    {
      id: "eda",
      num: 2,
      title: "Profiling",
      subtitle: "EDA & health audit",
      icon: Database,
      path: "/profile",
      status: datasetProfile ? "completed" : datasetInfo ? "active" : "pending",
    },
    {
      id: "ai",
      num: 3,
      title: "AI Insights",
      subtitle: "Recommendations",
      icon: Lightbulb,
      path: "/insights",
      status: datasetRecommendations ? "completed" : datasetProfile ? "active" : "pending",
    },
    {
      id: "models",
      num: 4,
      title: "Baseline Modeling",
      subtitle: "5-fold CV evaluation",
      icon: BarChart3,
      path: "/models",
      status: modelResults ? "completed" : datasetRecommendations ? "active" : "pending",
    },
    {
      id: "explainability",
      num: 5,
      title: "Explainability",
      subtitle: "SHAP drivers & local",
      icon: FlaskConical,
      path: "/explainability",
      status: globalExplanations ? "completed" : modelResults ? "active" : "pending",
    },
    {
      id: "reports",
      num: 6,
      title: "Reports",
      subtitle: "Executive analytics",
      icon: FileText,
      path: "/reports",
      status: globalExplanations ? "completed" : "pending",
    },
  ];

  return (
    <div className="p-6 rounded-2xl bg-white border border-[#E5E9E2] shadow-[0_1px_3px_rgba(38,51,45,0.03)]">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-6 h-6 rounded-lg flex items-center justify-center bg-[#EDF7F1] border border-[#BCE2CC] text-[#2A7E4F] flex-shrink-0">
          <span className="w-2 h-2 rounded-full bg-[#2A7E4F]" />
        </div>
        <div>
          <h2 className="text-[17px] font-bold text-[#26332D] leading-none">
            Analysis Workflow Pipeline
          </h2>
          <p className="text-[13px] text-[#64736A] mt-1">
            End-to-end dataset understanding, machine learning evaluation, and explainability.
          </p>
        </div>
      </div>

      {/* Steps Pipeline Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-y-6 lg:gap-y-0 relative items-start">
        {steps.map((step, idx) => {
          const Icon = step.icon;
          const done = step.status === "completed";
          const active = step.status === "active";
          const pending = step.status === "pending";
          const isLast = idx === steps.length - 1;

          /* Connector lines styling */
          const prevDone = idx > 0 && steps[idx - 1].status === "completed";
          const prevActive = idx > 0 && steps[idx - 1].status === "active";
          const lineLeftBg = prevDone && done
            ? "#26332D"
            : prevDone && active
            ? "linear-gradient(to right, #26332D, #B8F34A)"
            : prevActive
            ? "#B8F34A"
            : "#E5E9E2";

          const nextDone = idx < steps.length - 1 && steps[idx + 1].status === "completed";
          const lineRightBg = done && nextDone
            ? "#26332D"
            : done && active
            ? "linear-gradient(to right, #26332D, #B8F34A)"
            : active
            ? "linear-gradient(to right, #B8F34A, #E5E9E2)"
            : "#E5E9E2";

          return (
            <div
              key={step.id}
              className="flex-1 flex flex-col items-center text-center relative min-w-0 px-2"
            >
              {/* Connector lines behind icons (Desktop only) */}
              {idx > 0 && (
                <div
                  className="hidden lg:block absolute top-[24px] left-0 right-[calc(50%+24px)] h-[2px] -translate-y-1/2 pointer-events-none z-0"
                  style={{ background: lineLeftBg }}
                />
              )}
              {!isLast && (
                <div
                  className="hidden lg:block absolute top-[24px] left-[calc(50%+24px)] right-0 h-[2px] -translate-y-1/2 pointer-events-none z-0"
                  style={{ background: lineRightBg }}
                />
              )}

              {/* Step circle */}
              <button
                onClick={() => !pending && navigate(step.path)}
                disabled={pending}
                className={`relative z-10 flex items-center justify-center flex-shrink-0 transition-all duration-200 outline-none rounded-full w-12 h-12 shadow-xs ${
                  done
                    ? "bg-[#26332D] text-white hover:bg-[#34433C] cursor-pointer"
                    : active
                    ? "bg-[#F3FCD7] border-2 border-[#26332D] text-[#26332D] cursor-pointer hover:shadow-md"
                    : "bg-[#F1F5EF] border border-[#DCE8DC] text-[#78827A] cursor-not-allowed opacity-75"
                }`}
              >
                {/* Step number badge */}
                <span
                  className={`absolute -top-1 -right-1 w-4.5 h-4.5 rounded-full flex items-center justify-center text-[10px] font-bold border-2 ${
                    done
                      ? "bg-[#B8F34A] text-[#26332D] border-white"
                      : active
                      ? "bg-[#26332D] text-white border-white"
                      : "bg-[#E5E9E2] text-[#78827A] border-white"
                  }`}
                >
                  {step.num}
                </span>

                {/* Icon */}
                {done ? (
                  <Check className="w-5 h-5 text-[#B8F34A]" strokeWidth={2.5} />
                ) : (
                  <Icon className="w-5 h-5" strokeWidth={1.8} />
                )}
              </button>

              {/* Title & subtitle */}
              <p
                className={`text-[14px] font-bold text-center mt-3 leading-tight truncate max-w-full ${
                  pending ? "text-[#78827A]" : "text-[#26332D]"
                }`}
              >
                {step.title}
              </p>
              <p className="text-[12px] text-[#64736A] mt-0.5 leading-snug">
                {step.subtitle}
              </p>

              {/* Status Badge */}
              <div className="mt-2 flex justify-center">
                {step.status === "completed" ? (
                  <span className="text-[9.5px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#EDF7F1] text-[#166534] border border-[#BCE2CC]">
                    COMPLETED
                  </span>
                ) : step.status === "active" ? (
                  <span className="text-[9.5px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#F3FCD7] text-[#28440D] border border-[#D2F775]">
                    ACTIVE
                  </span>
                ) : step.status === "failed" ? (
                  <span className="text-[9.5px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]">
                    FAILED
                  </span>
                ) : (
                  <span className="text-[9.5px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#F1F5EF] text-[#78827A] border border-[#E5E9E2]">
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
