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
  const sortedShap = [...shapValues].sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution)).slice(0, 8);
  const maxAbsCont = Math.max(...sortedShap.map(s => Math.abs(s.contribution)), 0.0001);
  
  return (
    <Card className="p-6 border border-[#E5E9E2] shadow-xs bg-white">
      <div className="flex items-center gap-2 mb-5">
        <Network className="w-4 h-4 text-[#26332D]" />
        <h3 className="text-[15px] font-bold text-[#26332D]">Local Prediction Waterfall (SHAP)</h3>
      </div>
      
      <div className="flex justify-between text-[13px] font-medium mb-4 pb-3 border-b border-[#E5E9E2]">
        <div className="flex flex-col">
          <span className="text-[#78827A] uppercase text-[10px] font-bold">Base Value</span>
          <span className="text-[#26332D] text-lg font-mono font-bold">{expectedValue.toFixed(2)}</span>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[#78827A] uppercase text-[10px] font-bold">Final Prediction</span>
          <span className="text-[#26332D] text-lg font-mono font-bold">{prediction.toFixed(2)}</span>
        </div>
      </div>
      
      <div className="flex flex-col gap-3 relative mt-2">
        <div className="absolute left-1/2 top-0 bottom-0 w-px bg-[#D6DCD3] z-0"></div>
        
        {sortedShap.map((item, idx) => {
          const isPos = item.contribution > 0;
          const widthPct = (Math.abs(item.contribution) / maxAbsCont) * 45;
          
          return (
            <div key={idx} className="relative z-10 flex flex-col group">
              <div className="flex justify-between text-[11.5px] mb-1 px-1">
                <span className="font-semibold text-[#26332D] truncate max-w-[160px]">
                  {item.feature} = <span className="font-mono text-[#64736A]">{typeof item.value === 'number' ? item.value.toFixed(2) : String(item.value)}</span>
                </span>
                <span className={`font-mono font-bold ${isPos ? 'text-[#166534]' : 'text-[#B45309]'}`}>
                  {isPos ? '+' : ''}{item.contribution.toFixed(3)}
                </span>
              </div>
              
              <div className="w-full flex h-3.5">
                <div className="w-1/2 flex justify-end">
                  {!isPos && (
                    <div 
                      className="bg-[#D97706] h-full rounded-l-sm transition-all duration-700 ease-out"
                      style={{ width: `${widthPct}%` }}
                    />
                  )}
                </div>
                <div className="w-1/2 flex justify-start">
                  {isPos && (
                    <div 
                      className="bg-[#2A7E4F] h-full rounded-r-sm transition-all duration-700 ease-out"
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
