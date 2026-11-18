import { Card } from '../../../components/ui/Card';

export function CoverSection({ data }: { data: any }) {
  if (!data) return null;
  return (
    <Card className="p-10 mb-8 border border-[#E5E9E2] bg-white text-center flex flex-col justify-center min-h-[480px]">
      <h1 className="text-3xl font-extrabold text-[#26332D] mb-2 tracking-tight">{data.title}</h1>
      <p className="text-lg text-[#64736A] mb-6">{data.subtitle}</p>
      
      <div className="flex justify-center mb-8">
        <span className="px-4 py-1.5 bg-[#F1F6EC] text-[#26332D] border border-[#DCE8DC] rounded-full text-[13px] font-bold">
          Readiness: {data.dataset_readiness}
        </span>
      </div>

      <div className="mt-auto border-t border-[#E5E9E2] pt-6 text-left max-w-lg mx-auto w-full">
        <h3 className="text-[15px] font-bold text-[#26332D] mb-3">Workflow Timeline</h3>
        <div className="space-y-2.5">
          {data.workflow_timeline?.map((step: string, idx: number) => (
            <div key={idx} className="flex items-center gap-2.5">
              <div className="w-2 h-2 rounded-full bg-[#2A7E4F]"></div>
              <span className="text-[13px] text-[#64736A]">{step}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

export function ExecutiveSummarySection({ text }: { text: string }) {
  return (
    <Card className="p-6 mb-6 border-l-4 border-l-[#26332D] border-y border-r border-[#E5E9E2] bg-white">
      <h2 className="text-xl font-bold text-[#26332D] mb-3">1. Executive Summary</h2>
      <p className="text-[14px] text-[#26332D] leading-relaxed font-medium">{text}</p>
    </Card>
  );
}

export function ProfilingSection({ data }: { data: any }) {
  return (
    <Card className="p-6 mb-6 border border-[#E5E9E2] bg-white">
      <h2 className="text-xl font-bold text-[#26332D] mb-5">2. Dataset Profiling Summary</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-[#FAFBF9] rounded-xl border border-[#E5E9E2]">
          <div className="text-[11px] font-bold text-[#78827A] uppercase tracking-wider mb-1">Total Rows</div>
          <div className="text-2xl font-bold text-[#26332D] font-mono">{data.rows}</div>
        </div>
        <div className="p-4 bg-[#FAFBF9] rounded-xl border border-[#E5E9E2]">
          <div className="text-[11px] font-bold text-[#78827A] uppercase tracking-wider mb-1">Total Columns</div>
          <div className="text-2xl font-bold text-[#26332D] font-mono">{data.columns}</div>
        </div>
        <div className="p-4 bg-[#FAFBF9] rounded-xl border border-[#E5E9E2]">
          <div className="text-[11px] font-bold text-[#78827A] uppercase tracking-wider mb-1">Missing Cells</div>
          <div className="text-2xl font-bold text-[#B45309] font-mono">{data.missing_cells}</div>
        </div>
        <div className="p-4 bg-[#FAFBF9] rounded-xl border border-[#E5E9E2]">
          <div className="text-[11px] font-bold text-[#78827A] uppercase tracking-wider mb-1">Memory Usage</div>
          <div className="text-2xl font-bold text-[#26332D] font-mono">{data.memory_usage}</div>
        </div>
      </div>
    </Card>
  );
}

export function RecommendationsSection({ data }: { data: any }) {
  const getRiskColor = (risk: string) => {
    if (risk.includes('High')) return 'bg-[#FEF2F2] text-[#991B1B] border-[#FECACA]';
    if (risk.includes('Moderate')) return 'bg-[#FEFCE8] text-[#854D0E] border-[#FEF08A]';
    return 'bg-[#EDF7F1] text-[#166534] border-[#BCE2CC]';
  };

  return (
    <div className="mb-6">
      <Card className="p-6 mb-4 border border-[#E5E9E2] bg-white">
        <h2 className="text-xl font-bold text-[#26332D] mb-3">3. Risk Assessment</h2>
        <div className="flex items-center gap-3 mb-3">
          <span className="text-[14px] text-[#64736A]">Overall Dataset Risk:</span>
          <span className={`px-3 py-1 rounded-full text-[12px] font-bold uppercase border ${getRiskColor(data.risk_assessment.overall_risk)}`}>
            {data.risk_assessment.overall_risk}
          </span>
        </div>
        <p className="text-[13px] text-[#64736A]">
          Issues Detected: <strong className="text-[#26332D]">{data.risk_assessment.critical_issues}</strong> Critical, <strong className="text-[#26332D]">{data.risk_assessment.high_issues}</strong> High, <strong className="text-[#26332D]">{data.risk_assessment.medium_issues}</strong> Medium.
        </p>
      </Card>

      <Card className="p-6 border border-[#E5E9E2] bg-white">
        <h2 className="text-xl font-bold text-[#26332D] mb-4">4. AI Recommendations</h2>
        
        <h3 className="text-[14px] font-bold text-[#26332D] mb-3">Immediate Actions (Critical &amp; High)</h3>
        {data.immediate_actions?.length > 0 ? (
          <div className="overflow-x-auto mb-6 border border-[#E5E9E2] rounded-xl">
            <table className="w-full text-left text-[13px]">
              <thead className="bg-[#FAFBF9] text-[#78827A] uppercase text-[11px] font-bold">
                <tr>
                  <th className="px-4 py-2.5 border-b border-[#E5E9E2]">Feature</th>
                  <th className="px-4 py-2.5 border-b border-[#E5E9E2]">Issue</th>
                  <th className="px-4 py-2.5 border-b border-[#E5E9E2]">Recommended Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EEF2EB]">
                {data.immediate_actions.map((r: any, i: number) => (
                  <tr key={i} className="bg-white">
                    <td className="px-4 py-2.5 font-semibold text-[#26332D]">{r.column}</td>
                    <td className="px-4 py-2.5 text-[#DC2626] font-medium">{r.issue}</td>
                    <td className="px-4 py-2.5 text-[#64736A]">{r.action}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-[13px] text-[#64736A] mb-6 italic">No immediate critical actions required.</p>
        )}

        <h3 className="text-[14px] font-bold text-[#26332D] mb-3">Future Improvements (Medium &amp; Low)</h3>
        {data.future_improvements?.length > 0 ? (
          <div className="overflow-x-auto border border-[#E5E9E2] rounded-xl">
            <table className="w-full text-left text-[13px]">
              <thead className="bg-[#FAFBF9] text-[#78827A] uppercase text-[11px] font-bold">
                <tr>
                  <th className="px-4 py-2.5 border-b border-[#E5E9E2]">Feature</th>
                  <th className="px-4 py-2.5 border-b border-[#E5E9E2]">Issue</th>
                  <th className="px-4 py-2.5 border-b border-[#E5E9E2]">Recommended Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EEF2EB]">
                {data.future_improvements.map((r: any, i: number) => (
                  <tr key={i} className="bg-white">
                    <td className="px-4 py-2.5 font-semibold text-[#26332D]">{r.column}</td>
                    <td className="px-4 py-2.5 text-[#B45309] font-medium">{r.issue}</td>
                    <td className="px-4 py-2.5 text-[#64736A]">{r.action}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-[13px] text-[#64736A] italic">No secondary optimizations recommended.</p>
        )}
      </Card>
    </div>
  );
}

export function ModelSection({ data }: { data: any }) {
  return (
    <Card className="p-6 mb-6 border border-[#E5E9E2] bg-white">
      <h2 className="text-xl font-bold text-[#26332D] mb-5">5. Model Comparison</h2>
      
      <div className="border border-[#E5E9E2] rounded-xl p-5 bg-[#FAFBF9] mb-6">
        <p className="text-[10.5px] font-bold text-[#B45309] uppercase tracking-wider mb-1">🏆 Selected Baseline Model</p>
        <h3 className="text-xl font-bold text-[#26332D] mb-1.5">{data.best_model.name}</h3>
        <p className="text-[13px] text-[#64736A] mb-4">{data.best_model.description}</p>
        
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-[10.5px] font-bold text-[#78827A] uppercase tracking-wider mb-0.5">{data.best_model.primary_metric}</p>
            <p className="text-2xl font-bold text-[#166534] font-mono">{data.best_model.primary_metric_value.toFixed(4)}</p>
          </div>
          <div>
            <p className="text-[10.5px] font-bold text-[#78827A] uppercase tracking-wider mb-0.5">Training Time</p>
            <p className="text-2xl font-bold text-[#26332D] font-mono">{data.best_model.training_time.toFixed(2)}s</p>
          </div>
        </div>
      </div>
      
      {data.runner_up && (
        <>
          <h3 className="text-[14px] font-bold text-[#26332D] mb-3">Runner Up Model</h3>
          <div className="overflow-x-auto border border-[#E5E9E2] rounded-xl">
            <table className="w-full text-left text-[13px]">
              <thead className="bg-[#FAFBF9] text-[#78827A] uppercase text-[11px] font-bold">
                <tr>
                  <th className="px-4 py-2.5 border-b border-[#E5E9E2]">Model Name</th>
                  <th className="px-4 py-2.5 border-b border-[#E5E9E2]">{data.runner_up.primary_metric}</th>
                  <th className="px-4 py-2.5 border-b border-[#E5E9E2]">Training Time</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                <tr>
                  <td className="px-4 py-2.5 font-semibold text-[#26332D]">{data.runner_up.name}</td>
                  <td className="px-4 py-2.5 text-[#26332D] font-mono">{data.runner_up.primary_metric_value.toFixed(4)}</td>
                  <td className="px-4 py-2.5 text-[#64736A] font-mono">{data.runner_up.training_time.toFixed(2)}s</td>
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
    <Card className="p-6 mb-6 border border-[#E5E9E2] bg-white">
      <h2 className="text-xl font-bold text-[#26332D] mb-3">6. Key Business Drivers</h2>
      <p className="text-[13px] text-[#64736A] mb-5">Features with the highest global influence on model predictions, ranked by absolute mean SHAP value.</p>
      
      <div className="overflow-x-auto border border-[#E5E9E2] rounded-xl">
        <table className="w-full text-left text-[13px]">
          <thead className="bg-[#FAFBF9] text-[#78827A] uppercase text-[11px] font-bold">
            <tr>
              <th className="px-4 py-2.5 border-b border-[#E5E9E2]">Feature</th>
              <th className="px-4 py-2.5 border-b border-[#E5E9E2]">Global Importance</th>
              <th className="px-4 py-2.5 border-b border-[#E5E9E2]">Contribution Type</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EEF2EB]">
            {data.map((d: any, i: number) => (
              <tr key={i} className="bg-white">
                <td className="px-4 py-2.5 font-semibold text-[#26332D]">{d.feature}</td>
                <td className="px-4 py-2.5 font-mono font-bold text-[#26332D]">{d.importance.toFixed(4)}</td>
                <td className="px-4 py-2.5 text-[#64736A]">{d.direction}</td>
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
    <Card className="p-6 mb-6 border-l-4 border-l-[#2A7E4F] border-y border-r border-[#E5E9E2] bg-[#F1F6EC]">
      <h2 className="text-xl font-bold text-[#26332D] mb-3">7. AI Conclusion</h2>
      <p className="text-[14px] text-[#26332D] leading-relaxed font-medium">{text}</p>
    </Card>
  );
}

export function AppendixSection({ session_id, date, data }: { session_id: string, date: string, data: any }) {
  return (
    <Card className="p-6 mb-8 border border-[#E5E9E2] bg-white">
      <h2 className="text-xl font-bold text-[#26332D] mb-4">8. Appendix</h2>
      <h3 className="text-[14px] font-bold text-[#26332D] mb-2">Job Metadata</h3>
      <ul className="space-y-1.5 text-[13px] text-[#64736A]">
        <li><strong>Session ID:</strong> <span className="font-mono text-[#26332D]">{session_id}</span></li>
        <li><strong>Report Generated:</strong> {date}</li>
        <li><strong>Target Variable:</strong> {data?.target_column}</li>
        <li><strong>Machine Learning Task:</strong> {data?.ml_task}</li>
      </ul>
    </Card>
  );
}
