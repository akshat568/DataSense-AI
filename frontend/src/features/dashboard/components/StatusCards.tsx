import {
  Database,
  TrendingUp,
  Lightbulb,
  FileText,
  ArrowRight,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useDataset } from "../../core/context/DatasetContext";

export function StatusCards() {
  const navigate = useNavigate();

  const {
    datasetInfo,
    datasetRecommendations,
    modelResults,
    sessionId,
  } = useDataset();

  const cards = [
    {
      title: "Dataset",
      status: datasetInfo ? "Uploaded" : "Pending",
      description: datasetInfo
        ? datasetInfo.filename
        : "Upload a CSV to begin analysis",
      icon: Database,
      color: "text-[#26332D]",
      bg: "bg-[#F1F5EF] border-[#E5E9E2]",
      path: "/profile",
    },
    {
      title: "Profile",
      status: datasetInfo ? "Ready" : "Waiting",
      description: datasetInfo
        ? "Statistical profiling & health active"
        : "Upload dataset first",
      icon: TrendingUp,
      color: "text-[#2A7E4F]",
      bg: "bg-[#EDF7F1] border-[#BCE2CC]",
      path: "/profile",
    },
    {
      title: "AI Insights",
      status:
        datasetRecommendations?.column_recommendations?.length
          ? "Generated"
          : "Waiting",
      description:
        datasetRecommendations?.column_recommendations?.length
          ? `${datasetRecommendations.column_recommendations.length} recommendations available`
          : "Generate automated recommendations",
      icon: Lightbulb,
      color: "text-[#26332D]",
      bg: "bg-[#F1F6EC] border-[#DCE8DC]",
      path: "/insights",
    },
    {
      title: "Reports",
      status: sessionId && modelResults ? "Ready" : "Waiting",
      description:
        sessionId && modelResults
          ? "Export analytical executive report"
          : "Complete model training first",
      icon: FileText,
      color: "text-[#B45309]",
      bg: "bg-[#FEF8EC] border-[#FDE68A]",
      path: "/reports",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div
          key={card.title}
          onClick={() => navigate(card.path)}
          className="group bg-white border border-[#E5E9E2] rounded-2xl p-5 cursor-pointer transition-all duration-200 hover:border-[#D6DCD3] hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(38,51,45,0.05)] shadow-[0_1px_3px_rgba(38,51,45,0.03)]"
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div
              className={`w-10 h-10 rounded-xl ${card.bg} border flex items-center justify-center flex-shrink-0`}
            >
              <card.icon className={`w-5 h-5 ${card.color}`} />
            </div>

            <span
              className={`text-[10.5px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-md ${
                card.status === "Waiting" || card.status === "Pending"
                  ? "bg-[#FEF8EC] text-[#B45309] border border-[#FDE68A]"
                  : "bg-[#EDF7F1] text-[#166534] border border-[#BCE2CC]"
              }`}
            >
              {card.status}
            </span>
          </div>

          {/* Title */}
          <h3 className="text-[16px] font-bold text-[#26332D]">
            {card.title}
          </h3>

          {/* Description */}
          <p className="mt-1 text-[13px] text-[#64736A] min-h-[38px] leading-relaxed">
            {card.description}
          </p>

          {/* Footer */}
          <div className="mt-4 pt-3 border-t border-[#EEF2EB] flex items-center justify-between">
            <span className="text-[12px] font-semibold text-[#26332D]">
              Explore Module
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-[#26332D] transition-transform duration-200 group-hover:translate-x-1" />
          </div>
        </div>
      ))}
    </div>
  );
}
