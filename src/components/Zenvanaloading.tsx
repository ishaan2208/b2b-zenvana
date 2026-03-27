"use client";

import { Loader2 } from "lucide-react";

import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";

type LoadingVariant = "page" | "section" | "overlay" | "inline";

type ZenvanaLoadingProps = {
    variant?: LoadingVariant;
    title?: string;
    description?: string;
    propertyName?: string;
    locationLabel?: string;
    className?: string;
};

export default function ZenvanaLoading({
    variant = "page",
  title = "Loading",
  description = "Please wait...",
    className,
}: ZenvanaLoadingProps) {
    if (variant === "inline") {
        return (
            <div
                className={cn(
          "inline-flex items-center gap-2 rounded-xl border border-border/60 bg-card px-3 py-2 text-sm",
                    className
                )}
            >
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
        <span className="font-medium">{title}</span>
        </div>
    );
}

  const wrapperClass =
    variant === "overlay"
      ? "fixed inset-0 z-50 flex items-center justify-center bg-background/70 p-4 backdrop-blur-sm"
      : variant === "page"
        ? "flex min-h-[60vh] items-center justify-center p-4"
        : "p-0";

    return (
    <div className={cn(wrapperClass, className)}>
      <Card className="w-full max-w-md rounded-2xl border border-border/60 bg-card p-6 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="mt-0.5 rounded-xl bg-primary/10 p-2 text-primary">
            <Loader2 className="h-5 w-5 animate-spin" />
                            </div>
                            <div>
            <p className="text-base font-semibold">{title}</p>
            <p className="mt-1 text-sm text-muted-foreground">{description}</p>
            </div>
        </div>
      </Card>
        </div>
    );
}
