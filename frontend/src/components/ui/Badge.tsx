export type BadgeSeverity =
  | 'critical'
  | 'high'
  | 'medium'
  | 'low'
  | 'info'
  | 'success'
  | 'accent'
  | 'warning'
  | 'danger';

interface BadgeProps {
  severity: BadgeSeverity;
  children: React.ReactNode;
  className?: string;
}

export function Badge({ severity, children, className = '' }: BadgeProps) {
  const normSeverity =
    severity === 'warning' ? 'medium' : severity === 'danger' ? 'high' : severity;
  return (
    <span className={`badge badge-${normSeverity} ${className}`}>
      {children}
    </span>
  );
}
