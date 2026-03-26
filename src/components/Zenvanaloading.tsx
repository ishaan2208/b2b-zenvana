"use client";

import * as React from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
    BedDouble,
    CalendarDays,
    CheckCircle2,
    Hotel,
    IndianRupee,
    MapPin,
    Percent,
    ShieldCheck,
    Sparkles,
    Users,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
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

type StepItem = {
    title: string;
    description: string;
    icon: React.ElementType;
};

const STEPS: StepItem[] = [
    {
        title: "Checking live inventory",
        description: "Matching available rooms with your stay dates.",
        icon: BedDouble,
    },
    {
        title: "Preparing partner rates",
        description: "Finding the cleanest B2B pricing options.",
        icon: Percent,
    },
    {
        title: "Calculating stay totals",
        description: "Arranging room-wise totals for faster quoting.",
        icon: IndianRupee,
    },
    {
        title: "Finalizing booking readiness",
        description: "Preparing the next action for your team.",
        icon: ShieldCheck,
    },
];

const DESKTOP_STRIPS = [
    { label: "Live rates", icon: IndianRupee },
    { label: "Inventory", icon: BedDouble },
    { label: "Stay dates", icon: CalendarDays },
    { label: "Guests", icon: Users },
];

export default function ZenvanaLoading({
    variant = "page",
    title = "Preparing your travel options",
    description = "Zenvana is arranging availability, partner pricing, and stay details in one smooth flow.",
    propertyName = "Zenvana partner stay",
    locationLabel = "Premium hospitality network",
    className,
}: ZenvanaLoadingProps) {
    const reduceMotion = useReducedMotion();
    const [activeStep, setActiveStep] = React.useState(0);

    React.useEffect(() => {
        if (variant === "inline") return;

        const id = window.setInterval(() => {
            setActiveStep((prev) => (prev + 1) % STEPS.length);
        }, 1800);

        return () => window.clearInterval(id);
    }, [variant]);

    if (variant === "inline") {
        return (
            <div
                className={cn(
                    "flex items-center gap-3 rounded-2xl border border-border/60 bg-card/90 px-3 py-2.5 backdrop-blur",
                    className
                )}
            >
                <BrandMark reduceMotion={!!reduceMotion} compact />
                <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{title}</p>
                    <div className="mt-1 h-1.5 w-28 overflow-hidden rounded-full bg-muted">
                        <motion.div
                            className="h-full w-14 rounded-full bg-primary"
                            animate={reduceMotion ? { x: 0 } : { x: [-20, 58, -20] }}
                            transition={{
                                duration: 1.7,
                                repeat: Infinity,
                                ease: "easeInOut",
                            }}
                        />
                    </div>
                </div>
            </div>
        );
    }

    const isOverlay = variant === "overlay";

    return (
        <div
            className={cn(
                isOverlay
                    ? "fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-md"
                    : variant === "page"
                        ? "flex min-h-[70vh] items-center justify-center p-4 sm:p-6"
                        : "p-0",
                className
            )}
        >
            <motion.div
                initial={{ opacity: 0, y: 10, scale: 0.99 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.26, ease: "easeOut" }}
                className={cn("w-full", variant === "section" ? "max-w-none" : "max-w-5xl")}
            >
                <Card className="relative overflow-hidden rounded-[2rem] border border-border/60 bg-card/95 shadow-[0_20px_60px_-24px_rgba(0,0,0,0.28)] backdrop-blur">
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(124,58,237,0.10),transparent_26%),radial-gradient(circle_at_bottom_left,rgba(124,58,237,0.06),transparent_22%)]" />
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

                    <div className="relative block lg:hidden">
                        <MobileLoadingView
                            reduceMotion={!!reduceMotion}
                            activeStep={activeStep}
                            title={title}
                            description={description}
                            propertyName={propertyName}
                            locationLabel={locationLabel}
                        />
                    </div>

                    <div className="relative hidden lg:grid lg:grid-cols-[1.02fr_0.98fr] lg:gap-8 lg:p-7">
                        <DesktopLoadingView
                            reduceMotion={!!reduceMotion}
                            activeStep={activeStep}
                            title={title}
                            description={description}
                            propertyName={propertyName}
                            locationLabel={locationLabel}
                        />
                    </div>
                </Card>
            </motion.div>
        </div>
    );
}

function MobileLoadingView({
    reduceMotion,
    activeStep,
    title,
    description,
    propertyName,
    locationLabel,
}: {
    reduceMotion: boolean;
    activeStep: number;
    title: string;
    description: string;
    propertyName: string;
    locationLabel: string;
}) {
    const ActiveIcon = STEPS[activeStep].icon;

    return (
        <div className="p-4">
            <div className="rounded-[1.7rem] border border-border/60 bg-background/80 p-4 backdrop-blur sm:p-5">
                <div className="flex items-center justify-between gap-3">
                    <Badge className="rounded-full border-0 bg-primary/10 px-3 py-1 text-primary">
                        Zenvana B2B
                    </Badge>
                    <div className="rounded-full border border-border/60 bg-background/90 px-3 py-1 text-[11px] font-medium text-muted-foreground">
                        Loading
                    </div>
                </div>

                <div className="mt-5 flex items-start gap-3">
                    <BrandMark reduceMotion={reduceMotion} />
                    <div className="min-w-0">
                        <h2 className="text-xl font-semibold tracking-tight text-foreground">
                            {title}
                        </h2>
                        <p className="mt-1 text-sm leading-6 text-muted-foreground">
                            {description}
                        </p>
                    </div>
                </div>

                <div className="mt-4 grid grid-cols-1 gap-2">
                    <CompactMeta icon={Hotel} label="Property" value={propertyName} />
                    <CompactMeta icon={MapPin} label="Network" value={locationLabel} />
                </div>

                <div className="mt-4 rounded-[1.4rem] border border-primary/15 bg-primary/[0.045] p-3.5">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={activeStep}
                            initial={{ opacity: 0, y: 6 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -6 }}
                            transition={{ duration: 0.2, ease: "easeOut" }}
                            className="flex items-start gap-3"
                        >
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                                <ActiveIcon className="h-5 w-5" />
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-semibold text-foreground">
                                    {STEPS[activeStep].title}
                                </p>
                                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                                    {STEPS[activeStep].description}
                                </p>
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    <div className="mt-3 flex items-center gap-2">
                        {STEPS.map((step, index) => (
                            <motion.div
                                key={step.title}
                                className={cn(
                                    "h-2 rounded-full",
                                    index === activeStep ? "w-7 bg-primary" : "w-2 bg-primary/25"
                                )}
                                animate={reduceMotion ? {} : { scale: index === activeStep ? 1 : 0.98 }}
                                transition={{ duration: 0.18 }}
                            />
                        ))}
                    </div>

                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-muted">
                        <motion.div
                            className="h-full w-20 rounded-full bg-gradient-to-r from-primary/70 via-primary to-primary/70"
                            animate={reduceMotion ? { x: 0 } : { x: ["-15%", "220%"] }}
                            transition={{
                                duration: 1.9,
                                repeat: Infinity,
                                ease: "easeInOut",
                            }}
                        />
                    </div>
                </div>

                <div className="mt-4 flex items-center gap-2 rounded-[1.2rem] border border-border/60 bg-muted/30 px-3 py-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="h-4 w-4" />
                    </div>
                    <p className="text-sm text-foreground">
                        Your next step will appear automatically.
                    </p>
                </div>
            </div>
        </div>
    );
}

function DesktopLoadingView({
    reduceMotion,
    activeStep,
    title,
    description,
    propertyName,
    locationLabel,
}: {
    reduceMotion: boolean;
    activeStep: number;
    title: string;
    description: string;
    propertyName: string;
    locationLabel: string;
}) {
    return (
        <>
            <div className="flex min-w-0 flex-col justify-between">
                <div>
                    <div className="mb-4 flex flex-wrap items-center gap-2">
                        <Badge className="rounded-full border-0 bg-primary/10 px-3 py-1 text-primary">
                            Zenvana B2B
                        </Badge>
                        <Badge
                            variant="outline"
                            className="rounded-full border-border/70 bg-background/80 px-3 py-1"
                        >
                            Hospitality in motion
                        </Badge>
                    </div>

                    <div className="flex items-start gap-4">
                        <BrandMark reduceMotion={reduceMotion} />
                        <div className="min-w-0">
                            <h2 className="text-3xl font-semibold tracking-tight text-foreground">
                                {title}
                            </h2>
                            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                                {description}
                            </p>
                        </div>
                    </div>

                    <div className="mt-5 grid grid-cols-2 gap-3">
                        <DesktopMeta icon={Hotel} label="Property context" value={propertyName} />
                        <DesktopMeta icon={MapPin} label="Network" value={locationLabel} />
                    </div>

                    <div className="mt-5 rounded-[1.45rem] border border-border/60 bg-background/75 p-4">
                        <div className="mb-3 flex items-center gap-2">
                            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-primary/10 text-primary">
                                <Sparkles className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-foreground">
                                    Concierge progress
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Focused feedback without noisy loading patterns.
                                </p>
                            </div>
                        </div>

                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeStep}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -8 }}
                                transition={{ duration: 0.22, ease: "easeOut" }}
                                className="rounded-2xl border border-primary/15 bg-primary/5 p-3.5"
                            >
                                <div className="flex items-start gap-3">
                                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary text-primary-foreground">
                                        {React.createElement(STEPS[activeStep].icon, {
                                            className: "h-5 w-5",
                                        })}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-foreground">
                                            {STEPS[activeStep].title}
                                        </p>
                                        <p className="mt-1 text-sm leading-6 text-muted-foreground">
                                            {STEPS[activeStep].description}
                                        </p>
                                    </div>
                                </div>
                            </motion.div>
                        </AnimatePresence>

                        <div className="mt-3 flex items-center gap-2">
                            {STEPS.map((step, index) => (
                                <motion.div
                                    key={step.title}
                                    className={cn(
                                        "h-2 rounded-full",
                                        index === activeStep ? "w-8 bg-primary" : "w-2 bg-primary/25"
                                    )}
                                    animate={reduceMotion ? {} : { scale: index === activeStep ? 1 : 0.98 }}
                                    transition={{ duration: 0.2 }}
                                />
                            ))}
                        </div>

                        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-muted">
                            <motion.div
                                className="h-full w-24 rounded-full bg-gradient-to-r from-primary/70 via-primary to-primary/70"
                                animate={reduceMotion ? { x: 0 } : { x: ["-18%", "300%"] }}
                                transition={{
                                    duration: 2.1,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                }}
                            />
                        </div>
                    </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                    {DESKTOP_STRIPS.map((item, index) => {
                        const Icon = item.icon;
                        return (
                            <motion.div
                                key={item.label}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{
                                    duration: 0.22,
                                    delay: 0.04 * index,
                                    ease: "easeOut",
                                }}
                                className="rounded-full border border-border/60 bg-background/85 px-3 py-2"
                            >
                                <div className="flex items-center gap-2">
                                    <Icon className="h-4 w-4 text-primary" />
                                    <span className="text-xs font-medium text-foreground">
                                        {item.label}
                                    </span>
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>

            <DesktopStage reduceMotion={reduceMotion} />
        </>
    );
}

function BrandMark({
    reduceMotion,
    compact = false,
}: {
    reduceMotion: boolean;
    compact?: boolean;
}) {
    return (
        <div
            className={cn(
                "relative shrink-0",
                compact ? "h-9 w-9" : "h-12 w-12 sm:h-14 sm:w-14"
            )}
        >
            <motion.div
                className="absolute inset-0 rounded-[1.2rem] bg-primary/10"
                animate={
                    reduceMotion
                        ? {}
                        : {
                            scale: [1, 1.06, 1],
                            opacity: [0.55, 0.9, 0.55],
                        }
                }
                transition={{
                    duration: 1.9,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            />
            <div className="absolute inset-[10%] flex items-center justify-center rounded-[1.1rem] border border-primary/20 bg-background/95 text-primary shadow-sm">
                <Hotel className={cn(compact ? "h-4 w-4" : "h-6 w-6")} />
            </div>
        </div>
    );
}

function CompactMeta({
    icon: Icon,
    label,
    value,
}: {
    icon: React.ElementType;
    label: string;
    value: string;
}) {
    return (
        <div className="rounded-2xl border border-border/60 bg-background/70 px-3 py-3">
            <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                        {label}
                    </p>
                    <p className="mt-1 truncate text-sm font-medium text-foreground">
                        {value}
                    </p>
                </div>
            </div>
        </div>
    );
}

function DesktopMeta({
    icon: Icon,
    label,
    value,
}: {
    icon: React.ElementType;
    label: string;
    value: string;
}) {
    return (
        <div className="rounded-2xl border border-border/60 bg-background/75 p-3">
            <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                        {label}
                    </p>
                    <p className="mt-1 truncate text-sm font-medium text-foreground">
                        {value}
                    </p>
                </div>
            </div>
        </div>
    );
}

function DesktopStage({ reduceMotion }: { reduceMotion: boolean }) {
    return (
        <div className="relative min-h-[380px] overflow-hidden rounded-[1.7rem] border border-border/60 bg-gradient-to-br from-background via-background to-primary/[0.04] p-4">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(124,58,237,0.10),transparent_22%),radial-gradient(circle_at_bottom_right,rgba(124,58,237,0.08),transparent_26%)]" />

            <motion.div
                className="absolute left-5 right-12 top-5 rounded-[1.45rem] border border-border/60 bg-card/95 p-4 shadow-sm"
                animate={
                    reduceMotion
                        ? {}
                        : {
                            y: [0, -4, 0],
                            rotate: [0, -0.35, 0],
                        }
                }
                transition={{
                    duration: 3.2,
                    repeat: Infinity,
                    ease: "easeInOut",
                }}
            >
                <div className="rounded-[1.2rem] border border-primary/10 bg-primary/[0.045] p-4">
                    <div className="mb-3 flex items-center justify-between gap-3">
                        <div>
                            <p className="text-sm font-semibold text-foreground">
                                Curated stay preview
                            </p>
                            <p className="text-xs text-muted-foreground">
                                Hospitality-first loading experience
                            </p>
                        </div>
                        <Badge className="rounded-full border-0 bg-background/90 text-foreground">
                            Live
                        </Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-2.5">
                        <VisualStat icon={CalendarDays} label="Stay dates" value="Selected" />
                        <VisualStat icon={Users} label="Guests" value="Ready" />
                        <VisualStat icon={BedDouble} label="Rooms" value="Matching" />
                        <VisualStat icon={IndianRupee} label="Totals" value="Preparing" />
                    </div>
                </div>
            </motion.div>

            <motion.div
                className="absolute bottom-24 left-6 right-16 rounded-[1.35rem] border border-border/60 bg-card/92 p-3.5 shadow-sm"
                animate={
                    reduceMotion
                        ? {}
                        : {
                            y: [0, 5, 0],
                            rotate: [0, 0.35, 0],
                        }
                }
                transition={{
                    duration: 3.4,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.2,
                }}
            >
                <div className="flex items-center gap-3 rounded-[1rem] bg-background/75 p-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <Percent className="h-5 w-5" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-foreground">
                            Partner rate comparison
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Website and B2B pricing are being aligned.
                        </p>
                    </div>
                </div>
            </motion.div>

            <motion.div
                className="absolute bottom-5 right-5 w-[62%] rounded-[1.2rem] border border-border/60 bg-card/90 p-3 shadow-sm"
                animate={reduceMotion ? {} : { y: [0, -4, 0] }}
                transition={{
                    duration: 2.9,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.35,
                }}
            >
                <div className="flex items-center gap-3 rounded-[1rem] border border-primary/10 bg-primary/[0.04] p-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        <CheckCircle2 className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-semibold text-foreground">
                            Seamless next step coming up
                        </p>
                        <p className="text-xs text-muted-foreground">
                            Results will appear as soon as they are ready.
                        </p>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

function VisualStat({
    icon: Icon,
    label,
    value,
}: {
    icon: React.ElementType;
    label: string;
    value: string;
}) {
    return (
        <div className="rounded-2xl border border-border/60 bg-background/85 p-3">
            <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                    <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
                        {label}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
                </div>
            </div>
        </div>
    );
}