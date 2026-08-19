import { Card } from '../../../components/ui/Card';
import { Sparkles, TrendingUp, AlertCircle, BarChart3 } from 'lucide-react';

interface QuickInsightsProps {
  data: any | null;
}

export function QuickInsights({ data }: QuickInsightsProps) {
  const isLoaded = !!data;

  const mockInsights = [
    {
      title: "Strong correlation detected",
      description: "Feature 'Age' and 'Income' show a high positive correlation (0.84). Consider dropping one if using linear models.",
      icon: TrendingUp,
      color: "text-[#2563EB]",
      bg: "bg-[#2563EB]/10 border-[#2563EB]/20"
    },
    {
      title: "Class Imbalance",
      description: "The target variable is highly imbalanced (8:1 ratio). We recommend applying SMOTE or adjusting class weights.",
      icon: AlertCircle,
      color: "text-[#F59E0B]",
      bg: "bg-[#F59E0B]/10 border-[#F59E0B]/20"
    },
    {
      title: "Data Quality Score",
      description: "Excellent. Only 0.2% of the total dataset contains missing values. Imputation strategy 'median' is suggested.",
      icon: BarChart3,
      color: "text-[#16A34A]",
      bg: "bg-[#16A34A]/10 border-[#16A34A]/20"
    }
  ];

  return (
    <div className="space-y-3 pb-8">
      <div className="flex items-center gap-2">
        <Sparkles className="w-4 h-4 text-[#2563EB]" />
        <h2 className="text-[14px] font-semibold text-[#111827]">Quick Insights</h2>
      </div>

      {isLoaded ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {mockInsights.map((insight, i) => (
            <Card key={i} className="p-4 border border-[#E5E7EB] hover:border-[#2563EB]/30 transition-colors shadow-sm">
              <div className="flex items-start gap-3">
                <div className={`p-1.5 rounded-md border ${insight.bg}`}>
                  <insight.icon className={`w-4 h-4 ${insight.color}`} />
                </div>
                <div>
                  <h3 className="text-[13px] font-semibold text-[#111827]">{insight.title}</h3>
                  <p className="text-[12px] text-[#6B7280] mt-1 leading-relaxed">
                    {insight.description}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="w-full p-8 flex flex-col border-dashed bg-gray-50/50">
          <div className="max-w-xl">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-4 h-4 text-gray-400" />
              <p className="text-[13px] font-medium text-[#111827]">AI Analysis Pending</p>
            </div>
            <p className="text-[13px] text-[#6B7280] leading-relaxed mb-4">
              Upload your dataset to automatically generate deep insights. Our engine will scan your features to:
            </p>
            <ul className="space-y-2 text-[13px] text-[#6B7280] list-disc list-inside">
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
