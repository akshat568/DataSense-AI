import clsx from "clsx";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: () => void;
  padding?: "none" | "sm" | "md" | "lg";
  hover?: boolean;
}

export function Card({
  children,
  className,
  onClick,
  padding = "lg",
  hover = false,
}: CardProps) {
  return (
    <div
      onClick={onClick}
      className={clsx(
        "rounded-2xl border border-[#E5E9E2] bg-white transition-all duration-200",
        hover &&
          "hover:border-[#D6DCD3] hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(38,51,45,0.06)] cursor-pointer",
        !hover && "shadow-[0_1px_3px_rgba(38,51,45,0.04)]",
        {
          "p-0": padding === "none",
          "p-4": padding === "sm",
          "p-6": padding === "md",
          "p-7": padding === "lg",
        },
        className
      )}
    >
      {children}
    </div>
  );
}
