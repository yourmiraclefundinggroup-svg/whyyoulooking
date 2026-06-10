import { type ComponentType, type ReactNode, type CSSProperties } from "react";

/**
 * ScoreShiftGlassPanel
 * ─────────────────────────────────────────────────────────────────────────
 * Reusable warm cream frosted-glass container.
 * Frames content — does NOT tint or overlay inner content.
 *
 * Usage:
 *   <ScoreShiftGlassPanel title="Credit Overview" icon={BarChart3}>
 *     <array-credit-overview ... />
 *   </ScoreShiftGlassPanel>
 */

const GLASS: CSSProperties = {
  background: "rgba(255,253,248,0.58)",
  backdropFilter: "blur(30px)",
  WebkitBackdropFilter: "blur(30px)",
  border: "1px solid rgba(255,255,255,0.55)",
  borderRadius: "32px",
  boxShadow: "0 30px 90px rgba(60,40,20,0.10), inset 0 1px 0 rgba(255,255,255,0.75)",
  overflow: "hidden",
  position: "relative",
};

export interface ScoreShiftGlassPanelProps {
  /** Optional header icon (Lucide component) */
  icon?: ComponentType<{ className?: string; style?: CSSProperties }>;
  /** Panel title shown in header bar */
  title?: string;
  /** Muted description line next to title */
  description?: string;
  /** Right-side slot — badges, labels, etc. */
  action?: ReactNode;
  /** Whether to show a very subtle indigo ambient glow (< 8% opacity) */
  glow?: boolean;
  /** Panel body content */
  children: ReactNode;
  /** Extra inline styles on the outer wrapper */
  style?: CSSProperties;
  /** Extra class names on the outer wrapper */
  className?: string;
  /** Padding override for the content area (default 24px) */
  bodyPadding?: string | number;
}

export function ScoreShiftGlassPanel({
  icon: Icon,
  title,
  description,
  action,
  glow = true,
  children,
  style,
  className,
  bodyPadding = "24px",
}: ScoreShiftGlassPanelProps) {
  const hasHeader = !!(title || Icon || action);

  return (
    <div style={{ ...GLASS, ...style }} className={className}>

      {/* Ambient indigo glow — top-left, < 8% */}
      {glow && (
        <div style={{
          position: "absolute", top: -50, left: -50,
          width: 280, height: 280,
          background: "radial-gradient(ellipse, rgba(99,102,241,0.07) 0%, transparent 68%)",
          pointerEvents: "none",
          zIndex: 0,
        }} />
      )}

      {/* Header strip */}
      {hasHeader && (
        <div style={{
          display: "flex", alignItems: "center", gap: "12px",
          padding: "18px 24px 16px",
          borderBottom: "1px solid rgba(30,27,24,0.07)",
          position: "relative", zIndex: 1,
        }}>
          {Icon && (
            <div style={{
              width: 34, height: 34, borderRadius: "11px", flexShrink: 0,
              background: "rgba(99,102,241,0.08)",
              border: "1px solid rgba(99,102,241,0.14)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.60)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Icon style={{ width: 16, height: 16, color: "#6366F1" }} />
            </div>
          )}
          {(title || description) && (
            <div style={{ flex: 1, minWidth: 0 }}>
              {title && (
                <p style={{
                  color: "#1E1B18", fontSize: "14px", fontWeight: 600,
                  letterSpacing: "-0.2px", lineHeight: 1.2,
                }}>
                  {title}
                </p>
              )}
              {description && (
                <p style={{
                  color: "#8C7B6E", fontSize: "12px", marginTop: "2px",
                }}>
                  {description}
                </p>
              )}
            </div>
          )}
          {action && (
            <div style={{ marginLeft: "auto", flexShrink: 0 }}>
              {action}
            </div>
          )}
          {!action && (
            <span style={{
              marginLeft: "auto",
              fontSize: "10px", fontWeight: 700,
              letterSpacing: "0.12em", textTransform: "uppercase",
              color: "rgba(30,27,24,0.18)",
            }}>
              ScoreShift
            </span>
          )}
        </div>
      )}

      {/* Body */}
      <div style={{ padding: bodyPadding, position: "relative", zIndex: 1 }}>
        {children}
      </div>
    </div>
  );
}

/**
 * ScoreShiftGlassTile — borderless, frameless version for grid tiles
 * Use for preview/locked feature cards, stat tiles, etc.
 */
export function ScoreShiftGlassTile({
  children,
  style,
  className,
  glow = false,
}: {
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
  glow?: boolean;
}) {
  return (
    <div style={{
      background: "rgba(255,253,248,0.52)",
      backdropFilter: "blur(22px)",
      WebkitBackdropFilter: "blur(22px)",
      border: "1px solid rgba(255,255,255,0.50)",
      borderRadius: "24px",
      boxShadow: "0 8px 36px rgba(60,40,20,0.08), inset 0 1px 0 rgba(255,255,255,0.65)",
      position: "relative",
      overflow: "hidden",
      ...style,
    }} className={className}>
      {glow && (
        <div style={{
          position: "absolute", top: -30, left: -30,
          width: 160, height: 160,
          background: "radial-gradient(ellipse, rgba(99,102,241,0.06) 0%, transparent 68%)",
          pointerEvents: "none",
        }} />
      )}
      <div style={{ position: "relative", zIndex: 1 }}>{children}</div>
    </div>
  );
}
