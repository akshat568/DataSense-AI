import { Card } from '../../../components/ui/Card';
import { BarChart3 } from 'lucide-react';

interface FeatureImportance {
  feature: string;
  importance: number;
}

interface FeatureImportanceCardProps {
  data: FeatureImportance[];
}

export function FeatureImportanceCard({ data }: FeatureImportanceCardProps) {
  if (!data || data.length === 0) return null;

  const displayData = data.slice(0, 10);
  const maxImportance = Math.max(...displayData.map(d => d.importance), 0.0001);

  return (
    <Card className="p-6 border border-[#E5E9E2] shadow-xs bg-white">
      <div className="flex items-center gap-2 mb-5">
        <BarChart3 className="w-4 h-4 text-[#26332D]" />
        <h3 className="text-[15px] font-bold text-[#26332D]">Global Feature Importance (SHAP)</h3>
      </div>
      
      <div className="flex flex-col gap-3">
        {displayData.map((item, idx) => {
          const widthPct = (item.importance / maxImportance) * 100;
          return (
            <div key={idx} className="flex flex-col gap-1">
              <div className="flex justify-between text-[12.5px]">
                <span className="font-semibold text-[#26332D] truncate max-w-[200px]" title={item.feature}>
                  {item.feature}
                </span>
                <span className="text-[#64736A] font-mono font-semibold">{item.importance.toFixed(4)}</span>
              </div>
              <div className="w-full bg-[#EEF2EB] rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-[#26332D] h-full rounded-full transition-all duration-700 ease-out" 
                  style={{ width: `${widthPct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
      {data.length > 10 && (
        <p className="text-center text-[11.5px] text-[#78827A] mt-3 font-medium">Showing top 10 features</p>
      )}
    </Card>
  );
}
