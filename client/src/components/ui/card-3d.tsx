import { cn } from "@/lib/utils";
import { ReactNode } from "react";

interface Card3DProps {
  children: ReactNode;
  className?: string;
  goldBorder?: boolean;
  onClick?: () => void;
}

export function Card3D({ children, className, goldBorder, onClick }: Card3DProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "card-3d card-3d-gold",
        goldBorder && "border-amber-500/30",
        onClick && "cursor-pointer",
        className
      )}
    >
      {children}
    </div>
  );
}
