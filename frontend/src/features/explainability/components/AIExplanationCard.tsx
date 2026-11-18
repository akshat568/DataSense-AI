import { Card } from '../../../components/ui/Card';
import { Sparkles, ShieldCheck } from 'lucide-react';

interface AIExplanation {
  prediction: string;
  drivers: string;
  confidence: string;
}

interface AIExplanationCardProps {
  explanation: AIExplanation;
}

export function AIExplanationCard({ explanation }: AIExplanationCardProps) {
  return (
    <Card className="p-6 bg-white border border-[#E5E9E2] shadow-xs">
      <div className="flex items-center gap-2 mb-4 pb-3 border-b border-[#E5E9E2]">
        <Sparkles className="w-4 h-4 text-[#26332D]" />
        <h3 className="text-[15px] font-bold text-[#26332D]">AI Prediction Explanation</h3>
      </div>
      
      <div className="space-y-3.5">
        <div>
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#78827A] mb-1">Prediction</h4>
          <p className="text-[13.5px] text-[#26332D] font-semibold leading-relaxed bg-[#F9FAF7] border border-[#EEF2EB] px-3.5 py-2.5 rounded-xl">
            {explanation.prediction}
          </p>
        </div>

        <div>
          <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#78827A] mb-1">Key Drivers</h4>
          <p className="text-[13px] text-[#64736A] leading-relaxed bg-[#F9FAF7] border border-[#EEF2EB] px-3.5 py-2.5 rounded-xl">
            {explanation.drivers}
          </p>
        </div>

        <div>
          <div className="flex items-center gap-1.5 mb-1 text-[#78827A]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#2A7E4F]" />
            <h4 className="text-[11px] font-bold uppercase tracking-wider">Confidence Assessment</h4>
          </div>
          <p className="text-[13px] text-[#2A7E4F] font-medium">
            {explanation.confidence}
          </p>
        </div>
      </div>
    </Card>
  );
}
