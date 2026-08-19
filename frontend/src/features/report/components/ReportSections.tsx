import { Card } from '../../../components/ui/Card';

export function CoverSection({ data }: { data: any }) {
  if (!data) return null;
  return (
    <Card className="p-10 mb-8 border border-[#E5E7EB] bg-white text-center flex flex-col justify-center min-h-[500px]">
      <h1 className="text-4xl font-extrabold text-[#111827] mb-3 tracking-tight">{data.title}</h1>
      <p className="text-xl text-[#4B5563] mb-8">{data.subtitle}</p>
      
      <div className="flex justify-center mb-12">
        <span className="px-5 py-2 bg-[#EEF2FF] text-[#4338CA] border border-[#C7D2FE] rounded-full font-bold">
          Readiness: {data.dataset_readiness}
        </span>
      </div>

      <div className="mt-auto border-t border-[#E5E7EB] pt-8 text-left max-w-lg mx-auto w-full">
        <h3 className="text-[16px] font-bold text-[#111827] mb-4">Workflow Timeline</h3>
        <div className="space-y-3">
          {data.workflow_timeline.map((step: string, idx: number) => (
            <div key={idx} className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-[#2563EB]"></div>
              <span className="text-[14px] text-[#4B5563]">{step}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

export function ExecutiveSummarySection({ text }: { text: string }) {
  return (
    <Card className="p-8 mb-8 border-l-4 border-l-[#2563EB] border-y border-r border-[#E5E7EB] bg-[#F8FAFC]">
      <h2 className="text-2xl font-bold text-[#111827] mb-4">1. Executive Summary</h2>
      <p className="text-[15px] text-[#1E40AF] leading-relaxed font-medium">{text}</p>
    </Card>
  );
}

export function ProfilingSection({ data }: { data: any }) {
  return (
    <Card className="p-8 mb-8 border border-[#E5E7EB] bg-white">
      <h2 className="text-2xl font-bold text-[#111827] mb-6">2. Dataset Profiling Summary</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB]">
          <div className="text-[12px] font-bold text-[#6B7280] uppercase tracking-wider mb-1">Total Rows</div>
          <div className="text-2xl font-bold text-[#111827]">{data.rows}</div>
        </div>
        <div className="p-4 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB]">
          <div className="text-[12px] font-bold text-[#6B7280] uppercase tracking-wider mb-1">Total Columns</div>
          <div className="text-2xl font-bold text-[#111827]">{data.columns}</div>
        </div>
        <div className="p-4 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB]">
          <div className="text-[12px] font-bold text-[#6B7280] uppercase tracking-wider mb-1">Missing Cells</div>
          <div className="text-2xl font-bold text-[#EF4444]">{data.missing_cells}</div>
        </div>
        <div className="p-4 bg-[#F9FAFB] rounded-lg border border-[#E5E7EB]">
          <div className="text-[12px] font-bold text-[#6B7280] uppercase tracking-wider mb-1">Memory Usage</div>
          <div className="text-2xl font-bold text-[#111827]">{data.memory_usage}</div>
        </div>
      </div>
    </Card>
  );
}

export function RecommendationsSection({ data }: { data: any }) {
  const getRiskColor = (risk: string) => {
    if (risk.includes('High')) return 'bg-[#FEF2F2] text-[#991B1B] border-[#FECACA]';
    if (risk.includes('Moderate')) return 'bg-[#FEFCE8] text-[#854D0E] border-[#FEF08A]';
    return 'bg-[#F0FDF4] text-[#166534] border-[#BBF7D0]';
  };

  return (
    <div className="mb-8">
      <Card className="p-8 mb-6 border border-[#E5E7EB] bg-white">
        <h2 className="text-2xl font-bold text-[#111827] mb-4">3. Risk Assessment</h2>
        <div className="flex items-center gap-4 mb-4">
          <span className="text-[15px] text-[#4B5563]">Overall Dataset Risk:</span>
          <span className={`px-4 py-1.5 rounded-full text-[13px] font-bold uppercase border ${getRiskColor(data.risk_assessment.overall_risk)}`}>
            {data.risk_assessment.overall_risk}
          </span>
        </div>
        <p className="text-[14px] text-[#6B7280]">
          Issues Detected: <strong className="text-[#111827]">{data.risk_assessment.critical_issues}</strong> Critical, <strong className="text-[#111827]">{data.risk_assessment.high_issues}</strong> High, <strong className="text-[#111827]">{data.risk_assessment.medium_issues}</strong> Medium.
        </p>
      </Card>

      <Card className="p-8 border border-[#E5E7EB] bg-white">
        <h2 className="text-2xl font-bold text-[#111827] mb-6">4. AI Recommendations</h2>
        
        <h3 className="text-[16px] font-bold text-[#1F2937] mb-4">Immediate Actions (Critical & High)</h3>
        {data.immediate_actions.length > 0 ? (
          <div className="overflow-x-auto mb-8 border border-[#E5E7EB] rounded-lg">
            <table className="w-full text-left text-[14px]">
              <thead className="bg-[#F9FAFB] text-[#4B5563] uppercase text-[11px] font-bold">
                <tr>
                  <th className="px-4 py-3 border-b">Feature</th>
                  <th className="px-4 py-3 border-b">Issue</th>
                  <th className="px-4 py-3 border-b">Recommended Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {data.immediate_actions.map((r: any, i: number) => (
                  <tr key={i} className="bg-white">
                    <td className="px-4 py-3 font-medium text-[#111827]">{r.column}</td>
                    <td className="px-4 py-3 text-[#EF4444]">{r.issue}</td>
                    <td className="px-4 py-3 text-[#4B5563]">{r.action}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-[14px] text-[#6B7280] mb-8 italic">No immediate critical actions required. The dataset is in excellent health.</p>
        )}

        <h3 className="text-[16px] font-bold text-[#1F2937] mb-4">Future Improvements (Medium & Low)</h3>
        {data.future_improvements.length > 0 ? (
          <div className="overflow-x-auto border border-[#E5E7EB] rounded-lg">
            <table className="w-full text-left text-[14px]">
              <thead className="bg-[#F9FAFB] text-[#4B5563] uppercase text-[11px] font-bold">
                <tr>
                  <th className="px-4 py-3 border-b">Feature</th>
                  <th className="px-4 py-3 border-b">Issue</th>
                  <th className="px-4 py-3 border-b">Recommended Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E5E7EB]">
                {data.future_improvements.map((r: any, i: number) => (
                  <tr key={i} className="bg-white">
                    <td className="px-4 py-3 font-medium text-[#111827]">{r.column}</td>
                    <td className="px-4 py-3 text-[#D97706]">{r.issue}</td>
                    <td className="px-4 py-3 text-[#4B5563]">{r.action}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-[14px] text-[#6B7280] italic">No secondary optimizations recommended.</p>
        )}
      </Card>
    </div>
  );
}

export function ModelSection({ data }: { data: any }) {
  return (
    <Card className="p-8 mb-8 border border-[#E5E7EB] bg-white">
      <h2 className="text-2xl font-bold text-[#111827] mb-6">5. Model Comparison</h2>
      
      <div className="border border-[#E5E7EB] rounded-xl p-6 bg-white shadow-sm mb-6">
        <p className="text-[11px] font-bold text-[#D97706] uppercase tracking-wider mb-1">🏆 Selected Baseline Model</p>
        <h3 className="text-2xl font-bold text-[#111827] mb-2">{data.best_model.name}</h3>
        <p className="text-[14px] text-[#4B5563] mb-6">{data.best_model.description}</p>
        
        <div className="grid grid-cols-2 gap-6">
          <div>
            <p className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider mb-1">{data.best_model.primary_metric}</p>
            <p className="text-3xl font-bold text-[#16A34A]">{data.best_model.primary_metric_value.toFixed(4)}</p>
          </div>
          <div>
            <p className="text-[11px] font-bold text-[#6B7280] uppercase tracking-wider mb-1">Training Time</p>
            <p className="text-3xl font-bold text-[#4B5563]">{data.best_model.training_time.toFixed(2)}s</p>
          </div>
        </div>
      </div>
      
      {data.runner_up && (
        <>
          <h3 className="text-[16px] font-bold text-[#1F2937] mb-4">Runner Up Model</h3>
          <div className="overflow-x-auto border border-[#E5E7EB] rounded-lg">
            <table className="w-full text-left text-[14px]">
              <thead className="bg-[#F9FAFB] text-[#4B5563] uppercase text-[11px] font-bold">
                <tr>
                  <th className="px-4 py-3 border-b">Model Name</th>
                  <th className="px-4 py-3 border-b">{data.runner_up.primary_metric}</th>
                  <th className="px-4 py-3 border-b">Training Time</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                <tr>
                  <td className="px-4 py-3 font-medium text-[#111827]">{data.runner_up.name}</td>
                  <td className="px-4 py-3 text-[#4B5563]">{data.runner_up.primary_metric_value.toFixed(4)}</td>
                  <td className="px-4 py-3 text-[#4B5563]">{data.runner_up.training_time.toFixed(2)}s</td>
                </tr>
              </tbody>
            </table>
          </div>
        </>
      )}
    </Card>
  );
}

export function DriversSection({ data }: { data: any }) {
  return (
    <Card className="p-8 mb-8 border border-[#E5E7EB] bg-white">
      <h2 className="text-2xl font-bold text-[#111827] mb-4">6. Key Business Drivers</h2>
      <p className="text-[14px] text-[#4B5563] mb-6">The following features have the highest global influence on the model's predictions, ranked by absolute mean SHAP value.</p>
      
      <div className="overflow-x-auto border border-[#E5E7EB] rounded-lg">
        <table className="w-full text-left text-[14px]">
          <thead className="bg-[#F9FAFB] text-[#4B5563] uppercase text-[11px] font-bold">
            <tr>
              <th className="px-4 py-3 border-b">Feature</th>
              <th className="px-4 py-3 border-b">Global Importance Impact</th>
              <th className="px-4 py-3 border-b">Correlation Type</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E7EB]">
            {data.map((d: any, i: number) => (
              <tr key={i} className="bg-white">
                <td className="px-4 py-3 font-medium text-[#111827]">{d.feature}</td>
                <td className="px-4 py-3 font-mono text-[#3B82F6]">{d.importance.toFixed(4)}</td>
                <td className="px-4 py-3 text-[#4B5563]">{d.direction}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

export function ConclusionSection({ text }: { text: string }) {
  return (
    <Card className="p-8 mb-8 border-l-4 border-l-[#16A34A] border-y border-r border-[#E5E7EB] bg-[#F0FDF4]">
      <h2 className="text-2xl font-bold text-[#111827] mb-4">7. AI Conclusion</h2>
      <p className="text-[15px] text-[#166534] leading-relaxed font-medium">{text}</p>
    </Card>
  );
}

export function AppendixSection({ session_id, date, data }: { session_id: string, date: string, data: any }) {
  return (
    <Card className="p-8 mb-12 border border-[#E5E7EB] bg-white">
      <h2 className="text-2xl font-bold text-[#111827] mb-6">8. Appendix</h2>
      <h3 className="text-[16px] font-bold text-[#1F2937] mb-3">Job Metadata</h3>
      <ul className="space-y-2 text-[14px] text-[#4B5563]">
        <li><strong>Session ID:</strong> <span className="font-mono">{session_id}</span></li>
        <li><strong>Report Generated:</strong> {date}</li>
        <li><strong>Target Variable:</strong> {data.target_column}</li>
        <li><strong>Machine Learning Task:</strong> {data.ml_task}</li>
      </ul>
    </Card>
  );
}
