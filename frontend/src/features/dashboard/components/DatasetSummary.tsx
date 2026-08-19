import { Rows, Columns, HardDrive, AlertTriangle } from "lucide-react";

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

const statConfigs = [
  {
    name: "ROWS",
    description: "Total records",
    icon: Rows,
    iconColor: "#7C5CFC",
    iconBg: "rgba(124,92,252,0.08)",
    iconBorder: "rgba(124,92,252,0.18)",
  },
  {
    name: "COLUMNS",
    description: "Extracted features",
    icon: Columns,
    iconColor: "#3ECF71",
    iconBg: "rgba(62,207,113,0.08)",
    iconBorder: "rgba(62,207,113,0.18)",
  },
  {
    name: "MEMORY USAGE",
    description: "In-memory footprint",
    icon: HardDrive,
    iconColor: "#E5A940",
    iconBg: "rgba(229,169,64,0.08)",
    iconBorder: "rgba(229,169,64,0.18)",
  },
  {
    name: "MISSING VALUES",
    description: "Null entries detected",
    icon: AlertTriangle,
    iconColor: "#E5534B",
    iconBg: "rgba(229,83,75,0.08)",
    iconBorder: "rgba(229,83,75,0.18)",
  },
];

export function DatasetSummary({ data }: DatasetSummaryProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {statConfigs.map((stat, idx) => {
        let value = "—";
        if (data) {
          if (idx === 0) value = data.rows.toLocaleString();
          else if (idx === 1) value = data.columns.toLocaleString();
          else if (idx === 2) value = formatBytes(data.memory_usage);
          else value = "0";
        }

        return (
          <div
            key={stat.name}
            className="px-4 py-3.5 flex flex-col gap-2.5 transition-all duration-200 cursor-default"
            style={{
              background: "#1E1F22",
              border: "1px solid #28292E",
              borderRadius: "12px",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#3A3B42";
              e.currentTarget.style.transform = "translateY(-1px)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#28292E";
              e.currentTarget.style.transform = "translateY(0)";
            }}
          >
            {/* Row 1: icon + label */}
            <div className="flex items-center gap-2.5">
              <div
                className="w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0"
                style={{
                  background: stat.iconBg,
                  border: `1px solid ${stat.iconBorder}`,
                }}
              >
                <stat.icon
                  className="w-[18px] h-[18px]"
                  style={{ color: stat.iconColor }}
                  strokeWidth={1.75}
                />
              </div>
              <span
                className="text-[12px] font-bold tracking-[0.1em] uppercase leading-none"
                style={{ color: "#6B6E76" }}
              >
                {stat.name}
              </span>
            </div>

            {/* Row 2: value + description */}
            <div>
              {data ? (
                <p
                  className="text-[30px] font-bold leading-none tracking-tight"
                  style={{
                    color: "#E8E9ED",
                    fontFamily: "'JetBrains Mono', monospace",
                  }}
                >
                  {value}
                </p>
              ) : (
                <div className="w-20 h-7 rounded-lg skeleton" />
              )}
              <p
                className="text-[13px] mt-2"
                style={{ color: "#6B6E76" }}
              >
                {stat.description}
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
}