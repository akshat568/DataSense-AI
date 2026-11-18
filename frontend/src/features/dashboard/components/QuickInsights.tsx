import { Card } from '../../../components/ui/Card';
import { Sparkles, TrendingUp, AlertCircle, BarChart3 } from 'lucide-react';

interface QuickInsightsProps {
  data: any | null;
}

export function QuickInsights({ data }: QuickInsightsProps) {
  const isLoaded = !!data;

  const sampleInsights = [
    {
      title: "Strong correlation detected",
      description: "Feature 'Age' and 'Income' show a high positive correlation (0.84). Consider dropping one if using linear models.",
      icon: TrendingUp,
      color: "text-[#26332D]",
      bg: "bg-[#F1F5EF] border-[#E5E9E2]"
    },
    {
      title: "Class Imbalance",
      description: "The target variable shows class distribution variance. We recommend class weight adjustments or resampling.",
      icon: AlertCircle,
      color: "text-[#B45309]",
      bg: "bg-[#FEF8EC] border-[#FDE68A]"
    },
    {
      title: "Data Quality Score",
      description: "Excellent. Over 99% completeness across all dataset features. Median imputation strategy recommended.",
      icon: BarChart3,
      color: "text-[#2A7E4F]",
      bg: "bg-[#EDF7F1] border-[#BCE2CC]"
    }
  ];

  return (
    <div className="space-y-3 pb-8">
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-[#26332D]" />
        <h2 className="text-[15px] font-bold text-[#26332D]">Quick Insights</h2>
      </div>

      {isLoaded ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {sampleInsights.map((insight, i) => (
            <Card key={i} className="p-4.5 border border-[#E5E9E2] bg-white hover:border-[#D6DCD3] transition-colors shadow-xs">
              <div className="flex items-start gap-3">
                <div className={`p-2 rounded-xl border ${insight.bg} flex-shrink-0`}>
                  <insight.icon className={`w-4 h-4 ${insight.color}`} />
                </div>
                <div>
                  <h3 className="text-[13.5px] font-bold text-[#26332D]">{insight.title}</h3>
                  <p className="text-[12.5px] text-[#64736A] mt-1 leading-relaxed">
                    {insight.description}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="w-full p-8 flex flex-col border-dashed border-[#D6DCD3] bg-white">
          <div className="max-w-xl">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-[#78827A]" />
              <p className="text-[14px] font-bold text-[#26332D]">AI Analysis Pending</p>
            </div>
            <p className="text-[13px] text-[#64736A] leading-relaxed mb-4">
              Upload your dataset to automatically generate deep insights. Our engine will scan your features to:
            </p>
            <ul className="space-y-2 text-[13px] text-[#64736A] list-disc list-inside">
              <li>Uncover hidden correlations between features.</li>
              <li>Detect class imbalances and target distributions.</li>
              <li>Assess overall data quality and missing value patterns.</li>
              <li>Provide intelligent preprocessing recommendations.</li>
            </ul>
          </div>
        </Card>
      )}
    </div>
  );
}
