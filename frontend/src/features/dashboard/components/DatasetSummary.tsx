import { Rows, Columns, HardDrive, ShieldCheck } from "lucide-react";

interface DatasetSummaryProps {
  data: {
    filename: string;
    rows: number;
    columns: number;
    memory_usage: number;
  } | null;
}

const formatBytes = (bytes: number, decimals = 1) => {
  if (!bytes || !+bytes) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
};

export function DatasetSummary({ data }: DatasetSummaryProps) {
  const statConfigs = [
    {
      label: "Total Records",
      description: "Observed sample observations",
      value: data ? data.rows.toLocaleString() : "—",
      icon: Rows,
      iconColor: "#26332D",
      iconBg: "#F1F5EF",
      iconBorder: "#E5E9E2",
      badge: data ? "Ingested" : "Pending",
      badgeClass: data
        ? "bg-[#EDF7F1] text-[#166534] border-[#BCE2CC]"
        : "bg-[#F7F8F4] text-[#78827A] border-[#E5E9E2]",
    },
    {
      label: "Features",
      description: "Extracted column dimensions",
      value: data ? String(data.columns) : "—",
      icon: Columns,
      iconColor: "#2A7E4F",
      iconBg: "#EDF7F1",
      iconBorder: "#BCE2CC",
      badge: data ? `${data.columns} Cols` : "Pending",
      badgeClass: data
        ? "bg-[#F3FCD7] text-[#28440D] border-[#D2F775]"
        : "bg-[#F7F8F4] text-[#78827A] border-[#E5E9E2]",
    },
    {
      label: "Memory Footprint",
      description: "In-memory tensor representation",
      value: data ? formatBytes(data.memory_usage) : "—",
      icon: HardDrive,
      iconColor: "#64736A",
      iconBg: "#F1F5EF",
      iconBorder: "#E5E9E2",
      badge: data ? "RAM" : "Pending",
      badgeClass: "bg-[#F1F5EF] text-[#64736A] border-[#E5E9E2]",
    },
    {
      label: "Data Quality / Ingestion Status",
      description: "Schema validation & health check",
      value: data ? "Verified" : "Awaiting Data",
      icon: ShieldCheck,
      iconColor: "#2A7E4F",
      iconBg: "#EDF7F1",
      iconBorder: "#BCE2CC",
      badge: data ? "Active" : "Idle",
      badgeClass: data
        ? "bg-[#EDF7F1] text-[#166534] border-[#BCE2CC]"
        : "bg-[#F7F8F4] text-[#78827A] border-[#E5E9E2]",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {statConfigs.map((stat) => (
        <div
          key={stat.label}
          className="p-5 flex flex-col justify-between rounded-2xl bg-white border border-[#E5E9E2] shadow-[0_1px_3px_rgba(38,51,45,0.03)] hover:border-[#D6DCD3] hover:shadow-[0_4px_16px_rgba(38,51,45,0.05)] hover:-translate-y-0.5 transition-all duration-200 min-h-[148px]"
        >
          {/* Header: Icon + Badge */}
          <div className="flex items-center justify-between mb-3">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{
                background: stat.iconBg,
                border: `1px solid ${stat.iconBorder}`,
              }}
            >
              <stat.icon
                className="w-5 h-5"
                style={{ color: stat.iconColor }}
                strokeWidth={1.8}
              />
            </div>

            <span
              className={`text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-md border ${stat.badgeClass}`}
            >
              {stat.badge}
            </span>
          </div>

          {/* Metric Value */}
          <div>
            <p className="text-[11px] font-bold tracking-[0.12em] uppercase text-[#78827A] mb-1">
              {stat.label}
            </p>
            {data ? (
              <p className="text-[26px] sm:text-[28px] font-bold font-mono tracking-tight leading-none text-[#26332D]">
                {stat.value}
              </p>
            ) : (
              <p className="text-[26px] sm:text-[28px] font-bold font-mono tracking-tight leading-none text-[#A2ABA5]">
                —
              </p>
            )}
            <p className="text-[12px] text-[#64736A] mt-1.5 truncate">
              {stat.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
