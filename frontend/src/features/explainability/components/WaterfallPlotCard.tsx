import { Card } from '../../../components/ui/Card';
import { Network } from 'lucide-react';

interface ShapValue {
  feature: string;
  value: any;
  contribution: number;
}

interface WaterfallPlotCardProps {
  expectedValue: number;
  prediction: number;
  shapValues: ShapValue[];
}

export function WaterfallPlotCard({ expectedValue, prediction, shapValues }: WaterfallPlotCardProps) {
  // Sort by absolute contribution to show most impactful at the top
  const sortedShap = [...shapValues].sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution)).slice(0, 8);
  
  const maxAbsCont = Math.max(...sortedShap.map(s => Math.abs(s.contribution)));
  
  return (
    <Card className="p-6 border border-[#E5E7EB] shadow-sm bg-white">
      <div className="flex items-center gap-2 mb-6">
        <Network className="w-5 h-5 text-[#8B5CF6]" />
        <h3 className="text-[15px] font-semibold text-[#111827]">Local Prediction Waterfall (SHAP)</h3>
      </div>
      
      <div className="flex justify-between text-[13px] font-medium mb-4 pb-2 border-b border-[#E5E7EB]">
        <div className="flex flex-col">
          <span className="text-[#6B7280] uppercase text-[10px]">Base Value</span>
          <span className="text-[#111827] text-lg font-mono">{expectedValue.toFixed(2)}</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[#6B7280] uppercase text-[10px]">Final Prediction</span>
          <span className="text-[#8B5CF6] text-lg font-mono">{prediction.toFixed(2)}</span>
        </div>
      </div>
      
      <div className="flex flex-col gap-3 relative mt-2">
        {/* Center line for zero contribution */}
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-gray-200 z-0"></div>
        
        {sortedShap.map((item, idx) => {
          const isPos = item.contribution > 0;
          const widthPct = (Math.abs(item.contribution) / maxAbsCont) * 45; // Max width is slightly less than 50%
          
          return (
            <div key={idx} className="relative z-10 flex flex-col group">
              <div className="flex justify-between text-[11px] mb-1 px-1">
                <span className="font-medium text-[#4B5563] truncate max-w-[150px]">
                  {item.feature} = <span className="font-mono text-[#6B7280]">{typeof item.value === 'number' ? item.value.toFixed(2) : String(item.value)}</span>
                </span>
                <span className={`font-mono ${isPos ? 'text-[#EF4444]' : 'text-[#3B82F6]'}`}>
                  {isPos ? '+' : ''}{item.contribution.toFixed(3)}
                </span>
              </div>
              
              <div className="w-full flex h-4">
                <div className="w-1/2 flex justify-end">
                  {!isPos && (
                    <div 
                      className="bg-[#3B82F6] h-full rounded-l-sm transition-all duration-700 ease-out"
                      style={{ width: `${widthPct}%` }}
                    />
                  )}
                </div>
                <div className="w-1/2 flex justify-start">
                  {isPos && (
                    <div 
                      className="bg-[#EF4444] h-full rounded-r-sm transition-all duration-700 ease-out"
                      style={{ width: `${widthPct}%` }}
                    />
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
