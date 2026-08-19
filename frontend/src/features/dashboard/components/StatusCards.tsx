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
      status: datasetInfo ? "Uploaded" : "Not Uploaded",
      description: datasetInfo
        ? datasetInfo.filename
        : "Upload a CSV to begin",
      icon: Database,
      color: "text-[#6488C8]",
      bg: "bg-[rgba(100,136,200,0.12)]",
      path: "/profile",
    },
    {
      title: "Profile",
      status: datasetInfo ? "Ready" : "Waiting",
      description: datasetInfo
        ? "Dataset profiling available"
        : "Upload dataset first",
      icon: TrendingUp,
      color: "text-[#5A9D7C]",
      bg: "bg-[rgba(90,157,124,0.12)]",
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
          ? `${datasetRecommendations.column_recommendations.length} recommendations`
          : "Generate recommendations",
      icon: Lightbulb,
      color: "text-[#7C6CB8]",
      bg: "bg-[rgba(124,108,184,0.12)]",
      path: "/insights",
    },
    {
      title: "Reports",
      status: sessionId && modelResults ? "Ready" : "Waiting",
      description:
        sessionId && modelResults
          ? "Export analytical report"
          : "Train models first",
      icon: FileText,
      color: "text-[#B58A45]",
      bg: "bg-[rgba(181,138,69,0.12)]",
      path: "/reports",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
      {cards.map((card) => (
        <div
          key={card.title}
          onClick={() => navigate(card.path)}
          className="group bg-[#1B2433] border border-[#2E3A4E] rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:border-[#6488C8] hover:-translate-y-1 hover:shadow-xl hover:shadow-black/20"
        >
          {/* Header */}
          <div className="flex items-start justify-between mb-6">

            <div
              className={`w-12 h-12 rounded-xl ${card.bg} flex items-center justify-center`}
            >
              <card.icon className={`w-6 h-6 ${card.color}`} />
            </div>

            <span
              className={`text-[11px] font-semibold px-3 py-1 rounded-full ${
                card.status === "Waiting" || card.status === "Not Uploaded"
                  ? "bg-yellow-500/15 text-yellow-400"
                  : "bg-green-500/15 text-green-400"
              }`}
            >
              {card.status}
            </span>

          </div>

          {/* Title */}
          <h3 className="text-lg font-bold text-white">
            {card.title}
          </h3>

          {/* Description */}
          <p className="mt-2 text-sm text-[#94A3B8] min-h-[42px]">
            {card.description}
          </p>

          {/* Footer */}
          <div className="mt-6 pt-4 border-t border-[#2E3A4E] flex items-center justify-between">

            <span className="text-xs font-medium text-[#6488C8]">
              View Details
            </span>

            <ArrowRight className="w-4 h-4 text-[#6488C8] transition-transform duration-300 group-hover:translate-x-1" />

          </div>

        </div>
      ))}
    </div>
  );
}