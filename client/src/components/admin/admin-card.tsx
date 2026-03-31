import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface AdminCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  padding?: "sm" | "md" | "lg" | "none";
}

export function AdminCard({ children, className, hover = true, padding = "md" }: AdminCardProps) {
  const paddingClasses = {
    none: "",
    sm: "p-4",
    md: "p-5",
    lg: "p-6",
  };

  return (
    <motion.div
      whileHover={hover ? { y: -2, boxShadow: "0 8px 30px rgba(0,0,0,0.3)" } : undefined}
      transition={{ duration: 0.2 }}
      className={cn(
        "rounded-xl border border-[hsl(var(--admin-border))] bg-[hsl(var(--admin-card))]/80 backdrop-blur-sm",
        "transition-colors duration-200",
        hover && "hover:border-[hsl(var(--admin-border-accent))]",
        paddingClasses[padding],
        className
      )}
    >
      {children}
    </motion.div>
  );
}

interface AdminCardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

export function AdminCardHeader({ children, className }: AdminCardHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between mb-4", className)}>
      {children}
    </div>
  );
}

interface AdminCardTitleProps {
  children: React.ReactNode;
  icon?: React.ReactNode;
  className?: string;
}

export function AdminCardTitle({ children, icon, className }: AdminCardTitleProps) {
  return (
    <h3 className={cn("flex items-center gap-2 text-lg font-semibold text-white", className)}>
      {icon && <span className="text-[hsl(var(--admin-accent))]">{icon}</span>}
      {children}
    </h3>
  );
}

interface AdminCardContentProps {
  children: React.ReactNode;
  className?: string;
}

export function AdminCardContent({ children, className }: AdminCardContentProps) {
  return <div className={cn("", className)}>{children}</div>;
}

interface AdminStatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: { value: number; positive: boolean };
  color?: "orange" | "blue" | "green" | "red" | "purple";
}

export function AdminStatCard({ label, value, icon, trend, color = "orange" }: AdminStatCardProps) {
  const colorClasses = {
    orange: "from-[hsl(var(--admin-accent))] to-[hsl(var(--admin-accent-deep))]",
    blue: "from-blue-500 to-blue-600",
    green: "from-emerald-500 to-emerald-600",
    red: "from-red-500 to-red-600",
    purple: "from-purple-500 to-purple-600",
  };

  const textColorClasses = {
    orange: "text-[hsl(var(--admin-accent))]",
    blue: "text-blue-400",
    green: "text-emerald-400",
    red: "text-red-400",
    purple: "text-purple-400",
  };

  return (
    <AdminCard className="relative overflow-hidden">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-[hsl(var(--admin-text-muted))] mb-1">{label}</p>
          <p className={cn("text-3xl font-bold", textColorClasses[color])}>{value}</p>
          {trend && (
            <div className={cn(
              "flex items-center gap-1 mt-2 text-xs font-medium",
              trend.positive ? "text-emerald-400" : "text-red-400"
            )}>
              <span>{trend.positive ? "↑" : "↓"} {Math.abs(trend.value)}%</span>
              <span className="text-[hsl(var(--admin-text-subtle))]">vs last month</span>
            </div>
          )}
        </div>
        <div className={cn(
          "w-12 h-12 rounded-xl bg-gradient-to-br flex items-center justify-center shadow-lg",
          colorClasses[color]
        )}>
          <span className="text-white">{icon}</span>
        </div>
      </div>
      <div className={cn(
        "absolute -right-4 -bottom-4 w-24 h-24 rounded-full opacity-10 blur-2xl",
        `bg-gradient-to-br ${colorClasses[color]}`
      )} />
    </AdminCard>
  );
}

interface AdminTableProps {
  children: React.ReactNode;
  className?: string;
}

export function AdminTable({ children, className }: AdminTableProps) {
  return (
    <div className={cn("overflow-x-auto", className)}>
      <table className="w-full">
        {children}
      </table>
    </div>
  );
}

export function AdminTableHeader({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <thead className={cn("border-b border-[hsl(var(--admin-border))]", className)}>
      {children}
    </thead>
  );
}

export function AdminTableRow({ children, className, onClick }: { children: React.ReactNode; className?: string; onClick?: () => void }) {
  return (
    <tr 
      className={cn(
        "border-b border-[hsl(var(--admin-border))] last:border-0 transition-colors",
        onClick && "cursor-pointer hover:bg-[hsl(var(--admin-card-hover))]",
        className
      )}
      onClick={onClick}
    >
      {children}
    </tr>
  );
}

export function AdminTableHead({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <th className={cn(
      "px-4 py-3 text-left text-xs font-medium text-[hsl(var(--admin-text-muted))] uppercase tracking-wider",
      className
    )}>
      {children}
    </th>
  );
}

export function AdminTableCell({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <td className={cn("px-4 py-4 text-sm text-[hsl(var(--admin-text))]", className)}>
      {children}
    </td>
  );
}

interface AdminBadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "danger" | "info" | "muted";
  className?: string;
}

export function AdminBadge({ children, variant = "default", className }: AdminBadgeProps) {
  const variantClasses = {
    default: "bg-[hsl(var(--admin-accent))]/20 text-[hsl(var(--admin-accent))] border-[hsl(var(--admin-accent))]/30",
    success: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    warning: "bg-amber-500/20 text-amber-400 border-amber-500/30",
    danger: "bg-red-500/20 text-red-400 border-red-500/30",
    info: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    muted: "bg-[hsl(var(--admin-card))] text-[hsl(var(--admin-text-muted))] border-[hsl(var(--admin-border))]",
  };

  return (
    <span className={cn(
      "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
      variantClasses[variant],
      className
    )}>
      {children}
    </span>
  );
}

interface AdminEmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}

export function AdminEmptyState({ icon, title, description, action }: AdminEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-16 h-16 rounded-2xl bg-[hsl(var(--admin-card))] border border-[hsl(var(--admin-border))] flex items-center justify-center mb-4 text-[hsl(var(--admin-text-muted))]">
        {icon}
      </div>
      <h3 className="text-lg font-medium text-white mb-2">{title}</h3>
      <p className="text-sm text-[hsl(var(--admin-text-muted))] max-w-sm mb-4">{description}</p>
      {action}
    </div>
  );
}
