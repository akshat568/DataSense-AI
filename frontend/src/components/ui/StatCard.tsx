import clsx from "clsx";

interface StatCardProps {
  label: string;
  value: string | number;
  sub?: string;
  trend?: string;
  accent?: "purple" | "green" | "amber" | "red" | "gray";
  icon: React.ReactNode;
}

const colors = {
  purple: {
    icon: "bg-[#7C5CFC]/15 text-[#8B7DFF] border border-[#7C5CFC]/20",
    dots: "bg-[#7C5CFC]",
    trend: "bg-[#7C5CFC]/10 text-[#A78BFA]",
  },

  green: {
    icon: "bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/20",
    dots: "bg-[#22C55E]",
    trend: "bg-[#22C55E]/10 text-[#4ADE80]",
  },

  amber: {
    icon: "bg-[#F59E0B]/15 text-[#F59E0B] border border-[#F59E0B]/20",
    dots: "bg-[#F59E0B]",
    trend: "bg-[#F59E0B]/10 text-[#FBBF24]",
  },

  red: {
    icon: "bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/20",
    dots: "bg-[#EF4444]",
    trend: "bg-[#EF4444]/10 text-[#F87171]",
  },

  gray: {
    icon: "bg-[#27272A] text-[#A1A1AA] border border-[#3F3F46]",
    dots: "bg-[#71717A]",
    trend: "bg-[#27272A] text-[#A1A1AA]",
  },
};

export function StatCard({
  label,
  value,
  sub,
  trend,
  accent = "purple",
  icon,
}: StatCardProps) {
  const c = colors[accent];

  return (
    <div className=" group relative overflow-hidden rounded-3xl border border-[#2A2A2F] bg-[#18181B] p-6 transition-all duration-300 hover:-translate-y-1 hover:border-[#4B4B57] hover:shadow-[0_15px_40px_rgba(0,0,0,0.35)]">

      {/* Top Row */}

      <div className="flex items-start justify-between">

        <div
          className={clsx(
            "flex h-12 w-12 items-center justify-center rounded-2xl",
            c.icon
          )}
        >
          {icon}
        </div>

        {/* Decorative dots */}

        <div className="grid grid-cols-3 gap-1 opacity-40">
          {Array.from({ length: 9 }).map((_, i) => (
            <span
              key={i}
              className={clsx("h-1.5 w-1.5 rounded-full", c.dots)}
            />
          ))}
        </div>

      </div>

      {/* Label */}

      <p className="mt-8 text-xs font-semibold uppercase tracking-[0.18em] text-[#71717A]">
        {label}
      </p>

      {/* Value */}

      <h2 className="mt-3 font-mono text-[40px] font-bold leading-none tracking-tight text-white">
        {value}
      </h2>

      {/* Subtitle */}

      {sub && (
        <p className="mt-2 text-sm text-[#A1A1AA]">
          {sub}
        </p>
      )}

      {/* Trend */}

      {trend && (
        <div
          className={clsx(
            "mt-6 inline-flex rounded-full px-3 py-1 text-xs font-semibold",
            c.trend
          )}
        >
          {trend}
        </div>
      )}

    </div>
  );
}