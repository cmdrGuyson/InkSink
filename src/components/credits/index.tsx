"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface CreditsIndicatorProps {
  used?: number;
  limit?: number;
  tier?: "free" | "premium";
  className?: string;
}

function clamp01(value: number) {
  if (!Number.isFinite(value)) return 0;
  if (value < 0) return 0;
  if (value > 1) return 1;
  return value;
}

export function CreditsIndicator({
  used = 50,
  limit = 50,
  tier = "free",
  className,
}: CreditsIndicatorProps) {
  const percentUsed = React.useMemo(() => {
    if (!Number.isFinite(limit) || limit <= 0) return 0;
    return clamp01(used / limit);
  }, [used, limit]);

  const percentRemaining = 1 - percentUsed;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div
          className={cn(
            "flex cursor-pointer select-none flex-col items-center self-center gap-1 rounded-lg border border-solid px-2 py-2",
            tier === "premium"
              ? "border-green-500 bg-green-50 dark:bg-green-950/20"
              : "border-border",
            className
          )}
        >
          <span
            className={cn(
              "text-[10px] font-medium uppercase tracking-wide",
              tier === "premium"
                ? "text-green-700 dark:text-green-300 text-center"
                : "text-muted-foreground"
            )}
          >
            {tier === "free" ? "FREE TIER" : "PREMIUM"}
          </span>
          {tier === "free" && (
            <div className="h-1.5 w-24 overflow-hidden rounded-full bg-muted">
              <div
                className="h-full rounded-full bg-primary transition-[width] duration-300"
                style={{ width: `${percentRemaining * 100}%` }}
              />
            </div>
          )}
        </div>
      </TooltipTrigger>
      <TooltipContent>
        <p>
          {tier === "free"
            ? `${limit - used} out of ${limit} credits remaining`
            : "Manage subscription"}
        </p>
      </TooltipContent>
    </Tooltip>
  );
}

export default CreditsIndicator;
