import { useNavigate } from "react-router-dom";
import {
  Database,
  Lightbulb,
  BarChart3,
  FlaskConical,
  FileText,
  ArrowRight,
  Zap,
} from "lucide-react";
import { useDataset } from "../../core/context/DatasetContext";

export function QuickActions() {
  const navigate = useNavigate();
  const {
    datasetInfo,
    datasetProfile,
    datasetRecommendations,
    modelResults,
    globalExplanations,
  } = useDataset();

  const actions = [
    {
      title: "Dataset Profile",
      desc: "Distributions, moments & data quality",
      icon: Database,
      path: "/profile",
      iconBg: "#F1F5EF",
      iconColor: "#26332D",
      status: datasetProfile ? "Ready" : datasetInfo ? "Available" : "Requires Data",
      active: !!datasetInfo,
    },
    {
      title: "AI Insights",
      desc: "Smart preprocessing & task detection",
      icon: Lightbulb,
      path: "/insights",
      iconBg: "#F3FCD7",
      iconColor: "#28440D",
      status: datasetRecommendations ? "Generated" : datasetInfo ? "Available" : "Requires Data",
      active: !!datasetInfo,
    },
    {
      title: "Baseline Models",
      desc: "5-fold CV & algorithm leaderboard",
      icon: BarChart3,
      path: "/models",
      iconBg: "#EDF7F1",
      iconColor: "#166534",
      status: modelResults ? "Trained" : datasetInfo ? "Ready to Run" : "Requires Data",
      active: !!datasetInfo,
    },
    {
      title: "AI Explainability",
      desc: "Global SHAP importance & local waterfalls",
      icon: FlaskConical,
      path: "/explainability",
      iconBg: "#F1F5EF",
      iconColor: "#26332D",
      status: globalExplanations ? "Computed" : modelResults ? "Ready" : "Needs Model",
      active: !!datasetInfo,
    },
    {
      title: "Executive Reports",
      desc: "Presentation export & audit summary",
      icon: FileText,
      path: "/reports",
      iconBg: "#FAFBF9",
      iconColor: "#64736A",
      status: datasetInfo ? "Available" : "Requires Data",
      active: !!datasetInfo,
    },
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-[#26332D]" />
          <h3 className="text-[15px] font-bold text-[#26332D]">
            Intelligence Quick Actions
          </h3>
        </div>
        <span className="text-[12px] text-[#78827A]">
          Direct workflow shortcuts
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {actions.map((act) => {
          const Icon = act.icon;
          return (
            <button
              key={act.title}
              onClick={() => navigate(act.path)}
              className="group text-left p-4 rounded-2xl bg-white border border-[#E5E9E2] shadow-[0_1px_3px_rgba(38,51,45,0.03)] hover:border-[#D6DCD3] hover:shadow-[0_4px_14px_rgba(38,51,45,0.05)] hover:-translate-y-0.5 transition-all duration-200 cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div
                    className="w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 border border-[#E5E9E2]"
                    style={{ background: act.iconBg }}
                  >
                    <Icon className="w-4.5 h-4.5" style={{ color: act.iconColor }} strokeWidth={1.8} />
                  </div>
                  <span className="text-[9.5px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#F7F8F4] text-[#64736A] border border-[#E5E9E2]">
                    {act.status}
                  </span>
                </div>

                <h4 className="text-[13.5px] font-bold text-[#26332D] group-hover:text-[#1A231F] transition-colors leading-tight">
                  {act.title}
                </h4>
                <p className="text-[11.5px] text-[#64736A] mt-1 leading-snug">
                  {act.desc}
                </p>
              </div>

              <div className="flex items-center gap-1 text-[12px] font-semibold text-[#26332D] mt-3.5 pt-2.5 border-t border-[#EEF2EB]">
                <span>Launch phase</span>
                <ArrowRight className="w-3.5 h-3.5 text-[#78827A] group-hover:text-[#26332D] group-hover:translate-x-0.5 transition-all" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
