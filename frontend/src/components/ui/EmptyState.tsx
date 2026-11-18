import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[46vh] gap-4 text-center px-4 py-12 rounded-2xl border border-dashed border-[#D6DCD3] bg-white">
      <div className="w-14 h-14 rounded-2xl bg-[#F1F5EF] border border-[#E5E9E2] flex items-center justify-center shadow-sm">
        <Icon className="w-7 h-7 text-[#26332D]" strokeWidth={1.75} />
      </div>
      <div className="max-w-md">
        <h3 className="text-[17px] font-bold text-[#26332D] tracking-tight">{title}</h3>
        <p className="text-[14px] text-[#64736A] mt-1.5 leading-relaxed">{description}</p>
      </div>
      {action && (
        <button className="btn btn-primary mt-2" onClick={action.onClick}>
          {action.label}
        </button>
      )}
    </div>
  );
}
