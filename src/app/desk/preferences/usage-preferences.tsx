"use client";

import { useAuth } from "@/providers/auth.provider";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BarChart3 } from "lucide-react";

const Usage = () => {
  const { profile } = useAuth();

  if (!profile) {
    return (
      <div className="w-full h-full flex flex-col">
        <div className="mb-6 flex-shrink-0">
          <div className="flex items-center gap-2 mb-2">
            <div className="h-5 w-5 bg-muted rounded animate-pulse"></div>
            <div className="h-6 w-32 bg-muted rounded animate-pulse"></div>
          </div>
          <div className="h-4 w-80 bg-muted rounded animate-pulse"></div>
        </div>

        <div className="flex-1 space-y-6">
          <div className="h-48 bg-muted rounded-lg animate-pulse"></div>
        </div>
      </div>
    );
  }

  const isPremium = profile.tier === "premium";
  const totalCredits = isPremium ? 0 : 50;
  const remainingCredits = profile.credit_count;
  const usedCredits = totalCredits - remainingCredits;
  const progressPercentage =
    totalCredits > 0 ? (remainingCredits / totalCredits) * 100 : 0;

  if (isPremium) {
    return (
      <div className="w-full h-full flex flex-col">
        <div className="mb-6 flex-shrink-0">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Usage & Credits
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Your premium subscription allows for unlimited usage*
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col">
      <div className="mb-6 flex-shrink-0">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          Usage & Credits
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Track your free tier usage and remaining credits
        </p>
      </div>

      <div className="flex-1 space-y-6">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium">Credit Usage</h3>
            <Badge variant="outline">Free Tier</Badge>
          </div>

          <div className="flex items-center justify-center py-8">
            <div className="relative">
              {/* Radial Progress Bar */}
              <svg className="w-32 h-32 transform -rotate-90">
                {/* Background circle */}
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  className="text-muted"
                />
                {/* Progress circle */}
                <circle
                  cx="64"
                  cy="64"
                  r="56"
                  stroke="currentColor"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={`${2 * Math.PI * 56}`}
                  strokeDashoffset={`${2 * Math.PI * 56 * (1 - progressPercentage / 100)}`}
                  className="text-primary transition-all duration-500 ease-in-out"
                  strokeLinecap="round"
                />
              </svg>

              {/* Center content */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary">
                    {remainingCredits}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    of {totalCredits}
                  </div>
                  <div className="text-xs font-medium text-primary mt-1">
                    credits left
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center">
            <p className="text-sm text-muted-foreground">
              You&apos;ve used {usedCredits} out of {totalCredits} credits
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Upgrade to premium for unlimited usage.
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Usage;
