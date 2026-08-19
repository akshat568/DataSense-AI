import { Card } from '../../../components/ui/Card';
import { Search } from 'lucide-react';

interface PredictionExplorerProps {
  headData: Record<string, any>[];
  onSelectRow: (index: number) => void;
  selectedRowIndex: number | null;
}

export function PredictionExplorer({ headData, onSelectRow, selectedRowIndex }: PredictionExplorerProps) {
  if (!headData || headData.length === 0) return null;

  const columns = Object.keys(headData[0]).slice(0, 6); // show max 6 columns

  return (
    <Card className="border border-[#E5E7EB] bg-white overflow-hidden shadow-sm">
      <div className="p-4 border-b border-[#E5E7EB] bg-[#F8FAFC] flex justify-between items-center">
        <div>
          <h3 className="text-[14px] font-semibold text-[#111827] flex items-center gap-2">
            <Search className="w-4 h-4 text-[#6B7280]" />
            Prediction Explorer
          </h3>
          <p className="text-[12px] text-[#6B7280] mt-0.5">Select a row from the sample data to generate a local explanation.</p>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left text-[12px]">
          <thead className="bg-white text-[#6B7280] uppercase font-medium border-b border-[#E5E7EB]">
            <tr>
              <th className="px-4 py-2 w-12 text-center">Row</th>
              {columns.map(col => (
                <th key={col} className="px-4 py-2 truncate max-w-[150px]">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E5E7EB]">
            {headData.map((row, idx) => (
              <tr 
                key={idx} 
                onClick={() => onSelectRow(idx)}
                className={`cursor-pointer transition-colors ${selectedRowIndex === idx ? 'bg-[#EFF6FF]' : 'hover:bg-[#F9FAFB]'}`}
              >
                <td className="px-4 py-2 text-center text-[#9CA3AF] font-mono">{idx}</td>
                {columns.map(col => (
                  <td key={col} className="px-4 py-2 text-[#4B5563] truncate max-w-[150px]">
                    {String(row[col])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
