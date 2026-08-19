interface PageHeaderProps {
  title: string;
  description?: string;
  breadcrumb?: string[];
  actions?: React.ReactNode;
}

export function PageHeader({ title, description, breadcrumb, actions }: PageHeaderProps) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#2A2A2F]">
      <div className="flex flex-col gap-1">
        {breadcrumb && breadcrumb.length > 0 && (
          <nav className="flex items-center gap-1.5 text-[12px] text-[#71717A] mb-0.5" aria-label="Breadcrumb">
            {breadcrumb.map((crumb, i) => (
              <span key={crumb} className="flex items-center gap-1.5">
                {i > 0 && <span className="text-[#2A2A2F]">/</span>}
                <span className={i === breadcrumb.length - 1 ? 'text-[#FAFAFA] font-medium' : 'text-[#71717A]'}>{crumb}</span>
              </span>
            ))}
          </nav>
        )}
        <h1 className="text-[22px] font-bold text-[#FAFAFA] tracking-tight">{title}</h1>
        {description && (
          <p className="text-[13px] text-[#A1A1AA] mt-0.5 leading-relaxed">{description}</p>
        )}
      </div>
      {actions && (
        <div className="flex items-center gap-2 flex-shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
}
