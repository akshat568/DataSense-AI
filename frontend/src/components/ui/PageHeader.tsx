interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumb?: string[];
  actions?: React.ReactNode;
}

export function PageHeader({
  title,
  description,
  breadcrumb,
  actions,
}: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#E5E9E2]">
      <div className="flex flex-col gap-1">
        {breadcrumb && breadcrumb.length > 0 && (
          <nav
            className="flex items-center gap-1.5 text-[12px] text-[#78827A] mb-0.5"
            aria-label="Breadcrumb"
          >
            {breadcrumb.map((crumb, i) => (
              <span key={crumb} className="flex items-center gap-1.5">
                {i > 0 && <span className="text-[#C4CCC2]">/</span>}
                <span
                  className={
                    i === breadcrumb.length - 1
                      ? "text-[#26332D] font-semibold"
                      : "text-[#78827A]"
                  }
                >
                  {crumb}
                </span>
              </span>
            ))}
          </nav>
        )}
        <h1 className="text-[24px] sm:text-[28px] font-extrabold text-[#26332D] tracking-tight leading-tight">
          {title}
        </h1>
        {description && (
          <p className="text-[14px] text-[#64736A] mt-0.5 leading-relaxed">
            {description}
          </p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-3 flex-shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
}
