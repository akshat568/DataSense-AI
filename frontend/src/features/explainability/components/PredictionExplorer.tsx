import { Card } from '../../../components/ui/Card';
import { Search } from 'lucide-react';

interface PredictionExplorerProps {
  headData: Record<string, any>[];
  onSelectRow: (index: number) => void;
  selectedRowIndex: number | null;
}

export function PredictionExplorer({ headData, onSelectRow, selectedRowIndex }: PredictionExplorerProps) {
  if (!headData || headData.length === 0) return null;

  const columns = Object.keys(headData[0]).slice(0, 6);

  return (
    <Card className="border border-[#E5E9E2] bg-white overflow-hidden shadow-xs">
      <div className="p-4 border-b border-[#E5E9E2] bg-[#FAFBF9] flex justify-between items-center">
        <div>
          <h3 className="text-[14px] font-bold text-[#26332D] flex items-center gap-2">
            <Search className="w-4 h-4 text-[#78827A]" />
            Prediction Explorer
          </h3>
          <p className="text-[12px] text-[#64736A] mt-0.5">Select a row from sample records to compute its local explanation.</p>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left text-[12.5px]">
          <thead className="bg-[#F9FAF7] text-[#78827A] uppercase text-[10.5px] font-bold border-b border-[#E5E9E2]">
            <tr>
              <th className="px-4 py-2.5 w-12 text-center">Row</th>
              {columns.map(col => (
                <th key={col} className="px-4 py-2.5 truncate max-w-[150px]">{col}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#EEF2EB]">
            {headData.map((row, idx) => (
              <tr 
                key={idx} 
                onClick={() => onSelectRow(idx)}
                className={`cursor-pointer transition-colors ${selectedRowIndex === idx ? 'bg-[#F1F6EC] font-semibold text-[#26332D]' : 'hover:bg-[#F6F8F4] text-[#64736A]'}`}
              >
                <td className="px-4 py-2.5 text-center text-[#78827A] font-mono">{idx}</td>
                {columns.map(col => (
                  <td key={col} className="px-4 py-2.5 truncate max-w-[150px]">
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
