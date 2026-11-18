import clsx from "clsx";

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  trend?: string;
  accent?: "mint" | "forest" | "amber" | "green" | "red" | "gray" | "purple";
  icon: React.ReactNode;
}

const colors = {
  mint: {
    icon: "bg-[#F3FCD7] text-[#26332D] border border-[#D2F775]",
    trend: "bg-[#F3FCD7] text-[#2A4D10]",
  },
  forest: {
    icon: "bg-[#F1F5EF] text-[#26332D] border border-[#E5E9E2]",
    trend: "bg-[#F1F5EF] text-[#26332D]",
  },
  green: {
    icon: "bg-[#EDF7F1] text-[#166534] border border-[#BCE2CC]",
    trend: "bg-[#EDF7F1] text-[#15803D]",
  },
  amber: {
    icon: "bg-[#FEF8EC] text-[#B45309] border border-[#FDE68A]",
    trend: "bg-[#FEF8EC] text-[#B45309]",
  },
  red: {
    icon: "bg-[#FEF2F2] text-[#DC2626] border border-[#FECACA]",
    trend: "bg-[#FEF2F2] text-[#DC2626]",
  },
  gray: {
    icon: "bg-[#F1F5EF] text-[#64736A] border border-[#E5E9E2]",
    trend: "bg-[#F1F5EF] text-[#64736A]",
  },
  purple: {
    icon: "bg-[#F3FCD7] text-[#26332D] border border-[#D2F775]",
    trend: "bg-[#F3FCD7] text-[#2A4D10]",
  },
};

export function StatCard({
  label,
  value,
  sub,
  trend,
  accent = "mint",
  icon,
}: StatCardProps) {
  const c = colors[accent] || colors.mint;

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-[#E5E9E2] bg-white p-6 transition-all duration-200 hover:-translate-y-0.5 hover:border-[#D6DCD3] hover:shadow-[0_4px_16px_rgba(38,51,45,0.05)] shadow-[0_1px_3px_rgba(38,51,45,0.03)]">
      {/* Top Row: Icon + Label */}
      <div className="flex items-center justify-between">
        <div
          className={clsx(
            "flex h-11 w-11 items-center justify-center rounded-xl",
            c.icon
          )}
        >
          {icon}
        </div>
        {trend && (
          <div
            className={clsx(
              "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold",
              c.trend
            )}
          >
            {trend}
          </div>
        )}
      </div>

      {/* Label */}
      <p className="mt-5 text-[11px] font-bold uppercase tracking-[0.14em] text-[#78827A]">
        {label}
      </p>

      {/* Value */}
      <h2 className="mt-2 font-mono text-[32px] font-bold leading-none tracking-tight text-[#26332D]">
        {value}
      </h2>

      {/* Subtitle */}
      {sub && (
        <p className="mt-2 text-[13px] text-[#64736A]">
          {sub}
        </p>
      )}
    </div>
  );
}
