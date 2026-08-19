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
    <Card className="p-6 bg-gradient-to-br from-[#F5F3FF] to-[#EDE9FE] border border-[#DDD6FE] shadow-sm">
      <div className="flex items-center gap-2 mb-5 pb-3 border-b border-[#DDD6FE]">
        <Sparkles className="w-5 h-5 text-[#8B5CF6]" />
        <h3 className="text-[15px] font-semibold text-[#5B21B6]">AI Prediction Summary</h3>
      </div>
      
      <div className="space-y-4">
        <div>
          <div className="flex items-center gap-1.5 mb-1 text-[#6D28D9]">
            <TargetIcon />
            <h4 className="text-[12px] font-semibold uppercase tracking-wider">Prediction</h4>
          </div>
          <p className="text-[14px] text-[#4C1D95] font-medium leading-relaxed bg-white/40 px-3 py-2 rounded-md">
            {explanation.prediction}
          </p>
        </div>

        <div>
          <div className="flex items-center gap-1.5 mb-1 text-[#6D28D9]">
            <DriversIcon />
            <h4 className="text-[12px] font-semibold uppercase tracking-wider">Key Drivers</h4>
          </div>
          <p className="text-[14px] text-[#4C1D95] leading-relaxed bg-white/40 px-3 py-2 rounded-md">
            {explanation.drivers}
          </p>
        </div>

        <div>
          <div className="flex items-center gap-1.5 mb-1 text-[#6D28D9]">
            <ShieldCheck className="w-3.5 h-3.5" />
            <h4 className="text-[12px] font-semibold uppercase tracking-wider">Confidence</h4>
          </div>
          <p className="text-[13px] text-[#5B21B6]/80 italic">
            {explanation.confidence}
          </p>
        </div>
      </div>
    </Card>
  );
}

function TargetIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <circle cx="12" cy="12" r="6"/>
      <circle cx="12" cy="12" r="2"/>
    </svg>
  );
}

function DriversIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
    </svg>
  );
}
