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

  // Take top 10 for display
  const displayData = data.slice(0, 10);
  const maxImportance = Math.max(...displayData.map(d => d.importance));

  return (
    <Card className="p-6 border border-[#E5E7EB] shadow-sm bg-white">
      <div className="flex items-center gap-2 mb-6">
        <BarChart3 className="w-5 h-5 text-[#2563EB]" />
        <h3 className="text-[15px] font-semibold text-[#111827]">Global Feature Importance</h3>
      </div>
      
      <div className="flex flex-col gap-3">
        {displayData.map((item, idx) => {
          const widthPct = (item.importance / maxImportance) * 100;
          return (
            <div key={idx} className="flex flex-col gap-1">
              <div className="flex justify-between text-[12px]">
                <span className="font-medium text-[#4B5563] truncate max-w-[200px]" title={item.feature}>
                  {item.feature}
                </span>
                <span className="text-[#6B7280] font-mono">{item.importance.toFixed(4)}</span>
              </div>
              <div className="w-full bg-[#F3F4F6] rounded-full h-2 overflow-hidden">
                <div 
                  className="bg-[#3B82F6] h-full rounded-full transition-all duration-1000 ease-out" 
                  style={{ width: `${widthPct}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
      {data.length > 10 && (
        <p className="text-center text-[12px] text-[#9CA3AF] mt-4">Showing top 10 features</p>
      )}
    </Card>
  );
}
