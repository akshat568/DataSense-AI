import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[48vh] gap-4 text-center px-4">
      <div className="w-12 h-12 rounded-2xl bg-[#18181B] border border-[#2A2A2F] flex items-center justify-center">
        <Icon className="w-6 h-6 text-[#71717A]" strokeWidth={1.75} />
      </div>
      <div>
        <h3 className="text-[15px] font-semibold text-[#FAFAFA]">{title}</h3>
        <p className="text-[13px] text-[#A1A1AA] mt-1 max-w-sm leading-relaxed">{description}</p>
      </div>
      {action && (
        <button className="btn btn-secondary mt-1" onClick={action.onClick}>
          {action.label}
        </button>
      )}
    </div>
  );
}
