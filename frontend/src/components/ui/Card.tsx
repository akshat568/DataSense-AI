import clsx from "clsx";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;

  padding?: "none" | "sm" | "md" | "lg";
  hover?: boolean;
  glass?: boolean;
}

export function Card({
  children,
  className,
  onClick,
  padding = "lg",
  hover = true,
  glass = false,
}: CardProps) {
  return (
    <div
      onClick={onClick}
      className={clsx(
        "rounded-3xl border transition-all duration-300",

        glass
          ? "bg-[#17171C]/90 backdrop-blur-xl border-[#2B2B31]"
          : "bg-[#18181B] border-[#2A2A2F]",

        hover &&
          "hover:border-[#3B3B46] hover:-translate-y-[2px] hover:shadow-[0_10px_30px_rgba(0,0,0,0.35)]",

        {
          "p-0": padding === "none",
          "p-4": padding === "sm",
          "p-6": padding === "md",
          "p-8": padding === "lg",
        },

        className
      )}
    >
      {children}
    </div>
  );
}