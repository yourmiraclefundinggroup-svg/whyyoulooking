import { type ComponentType, type ReactNode, type CSSProperties } from "react";

/**
 * ScoreShiftGlassPanel — Glass System v2
 * ─────────────────────────────────────────────────────────────────────────
 * Apple Vision Pro–grade warm frosted glass.
 * Frames content — does NOT tint or overlay inner content.
 *
 * Spec:
 *   background:       rgba(255,253,248,0.52)
 *   backdrop-filter:  blur(36px)
 *   border:           1px solid rgba(255,255,255,0.75)
 *   border-radius:    36px
 *   box-shadow:       0 25px 60px rgba(0,0,0,0.08), 0 10px 20px rgba(0,0,0,0.04)
 *   inner highlights: inset 0 1px 0 rgba(255,255,255,0.85), inset 0 -1px 0 rgba(255,255,255,0.15)
 *   ambient glow:     0 0 70px rgba(99,102,241,0.07)  [around card, never on content]
 */

export const GLASS_V2: CSSProperties = {
  background: "rgba(255,253,248,0.52)",
  backdropFilter: "blur(36px)",
  WebkitBackdropFilter: "blur(36px)",
  border: "1px solid rgba(255,255,255,0.75)",
  borderRadius: "36px",
  boxShadow: [
    "0 25px 60px rgba(0,0,0,0.08)",
    "0 10px 20px rgba(0,0,0,0.04)",
    "inset 0 1px 0 rgba(255,255,255,0.85)",
    "inset 0 -1px 0 rgba(255,255,255,0.15)",
    "0 0 70px rgba(99,102,241,0.07)",
  ].join(", "),
  overflow: "hidden",
  position: "relative",
};

export const TILE_V2: CSSProperties = {
  background: "rgba(255,253,248,0.48)",
  backdropFilter: "blur(28px)",
  WebkitBackdropFilter: "blur(28px)",
  border: "1px solid rgba(255,255,255,0.70)",
  borderRadius: "28px",
  boxShadow: [
    "0 12px 36px rgba(0,0,0,0.06)",
    "0 4px 12px rgba(0,0,0,0.03)",
    "inset 0 1px 0 rgba(255,255,255,0.80)",
    "inset 0 -1px 0 rgba(255,255,255,0.12)",
    "0 0 40px rgba(99,102,241,0.05)",
  ].join(", "),
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
  children,
  style,
  className,
  bodyPadding = "24px",
}: ScoreShiftGlassPanelProps) {
  const hasHeader = !!(title || Icon || action);

  return (
    <div style={{ ...GLASS_V2, ...style }} className={className}>

      {/* Header strip */}
      {hasHeader && (
        <div style={{
          display: "flex", alignItems: "center", gap: "12px",
          padding: "18px 24px 16px",
          borderBottom: "1px solid rgba(255,255,255,0.40)",
          background: "rgba(255,255,255,0.12)",
        }}>
          {Icon && (
            <div style={{
              width: 34, height: 34, borderRadius: "11px", flexShrink: 0,
              background: "rgba(255,255,255,0.60)",
              border: "1px solid rgba(255,255,255,0.80)",
              boxShadow: "inset 0 1px 0 rgba(255,255,255,0.90), 0 2px 8px rgba(0,0,0,0.06)",
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <Icon style={{ width: 16, height: 16, color: "#4338CA" }} />
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
          <div style={{ marginLeft: action ? undefined : "auto", flexShrink: 0 }}>
            {action ?? (
              <span style={{
                fontSize: "10px", fontWeight: 700,
                letterSpacing: "0.12em", textTransform: "uppercase",
                color: "rgba(30,27,24,0.22)",
              }}>
                ScoreShift
              </span>
            )}
          </div>
        </div>
      )}

      {/* Body */}
      <div style={{ padding: bodyPadding }}>
        {children}
      </div>
    </div>
  );
}

/**
 * ScoreShiftGlassTile — compact variant for grid tiles, stat cards, etc.
 */
export function ScoreShiftGlassTile({
  children,
  style,
  className,
}: {
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
}) {
  return (
    <div style={{ ...TILE_V2, ...style }} className={className}>
      {children}
    </div>
  );
}
