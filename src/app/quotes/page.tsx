"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  CalendarDays,
  Clock3,
  FileText,
  Hotel,
  Plus,
  SearchX,
  Sparkles,
} from "lucide-react";
import { format, parseISO } from "date-fns";

import ProtectedShell from "@/components/b2b/ProtectedShell";
import ZenvanaLoading from "@/components/Zenvanaloading";
import { listB2BQuotes } from "@/lib/b2b-api";
import { cn } from "@/lib/utils";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/Card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type QuoteRow = {
  id: number;
  status: string;
  createdAt: string;
  checkIn: string;
  checkOut: string;
  totalRoomsRequired: number;
  property: { name: string };
};

const STATUS_OPTIONS = [
  { value: "ALL", label: "All statuses" },
  { value: "NEW", label: "New" },
  { value: "UNDER_REVIEW", label: "Under review" },
  { value: "QUOTED", label: "Quoted" },
  { value: "NEGOTIATION", label: "Negotiation" },
  { value: "CONFIRMED", label: "Confirmed" },
  { value: "REJECTED", label: "Rejected" },
  { value: "CANCELLED", label: "Cancelled" },
] as const;

const STATUS_STYLES: Record<string, string> = {
  NEW: "bg-primary/10 text-primary border-primary/15",
  UNDER_REVIEW: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/15",
  QUOTED: "bg-violet-500/10 text-violet-700 dark:text-violet-300 border-violet-500/15",
  NEGOTIATION: "bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/15",
  CONFIRMED: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/15",
  REJECTED: "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/15",
  CANCELLED: "bg-muted text-foreground border-border/60",
};

function formatShortDate(value?: string) {
  if (!value) return "--";
  try {
    return format(parseISO(value), "dd MMM yyyy");
  } catch {
    return value.slice(0, 10);
  }
}

function formatDateTime(value?: string) {
  if (!value) return "--";
  try {
    return format(parseISO(value), "dd MMM yyyy, hh:mm a");
  } catch {
    return value;
  }
}

export default function QuotesPage() {
  const [rows, setRows] = useState<QuoteRow[]>([]);
  const [status, setStatus] = useState("ALL");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        setLoading(true);
        const data = await listB2BQuotes(status === "ALL" ? undefined : status);
        if (!active) return;
        setRows(data);
      } catch {
        if (!active) return;
        setRows([]);
      } finally {
        if (!active) return;
        setLoading(false);
      }
    }

    load();

    return () => {
      active = false;
    };
  }, [status]);

  const filteredLabel = useMemo(
    () => STATUS_OPTIONS.find((item) => item.value === status)?.label || "All statuses",
    [status]
  );

  return (
    <ProtectedShell>
      <div className="mx-auto max-w-6xl space-y-5 sm:space-y-6">
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.26, ease: "easeOut" }}
          className="overflow-hidden rounded-[2rem] border border-border/60 bg-card shadow-sm"
        >
          <div className="p-4 sm:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="min-w-0">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <Badge className="rounded-full border-0 bg-primary/10 px-3 py-1 text-primary">
                    Zenvana B2B
                  </Badge>
                  <Badge variant="outline" className="rounded-full px-3 py-1">
                    Quotes
                  </Badge>
                </div>

                <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                  Quote pipeline
                </h1>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
                  Track incoming requirements, review their current stage, and jump
                  into the next action without digging through dense tables.
                </p>
              </div>

              <Button asChild className="h-12 rounded-2xl px-5 text-sm font-medium shadow-sm">
                <Link href="/quotes/new">
                  <Plus className="mr-2 h-4 w-4" />
                  New requirement
                </Link>
              </Button>
            </div>
          </div>
        </motion.section>

        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.26, delay: 0.04, ease: "easeOut" }}
          className="rounded-[2rem] border border-border/60 bg-card p-4 shadow-sm sm:p-5"
        >
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap">
              <TopStat
                icon={<FileText className="h-4 w-4" />}
                label="Visible quotes"
                value={`${rows.length}`}
              />
              <TopStat
                icon={<Sparkles className="h-4 w-4" />}
                label="Filter"
                value={filteredLabel}
              />
            </div>

            <div className="w-full md:w-[240px]">
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger className="h-12 rounded-2xl">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </motion.section>

        {loading ? (
          <ZenvanaLoading
            variant="section"
            title="Loading quotes"
            description="Preparing your latest requirements and quote stages."
          />
        ) : rows.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-[2rem] border border-dashed border-border/70 bg-card px-5 py-12 text-center shadow-sm sm:px-6 sm:py-16"
          >
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <SearchX className="h-6 w-6" />
            </div>
            <h2 className="mt-4 text-lg font-semibold">No quotes found</h2>
            <p className="mt-2 text-sm leading-6 text-muted-foreground">
              There are no quotes in this view right now. Try another status or create
              a new requirement.
            </p>
            <Button asChild className="mt-5 h-11 rounded-2xl">
              <Link href="/quotes/new">
                <Plus className="mr-2 h-4 w-4" />
                Create requirement
              </Link>
            </Button>
          </motion.div>
        ) : (
          <div className="space-y-3">
            {rows.map((q, index) => (
              <motion.div
                key={q.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.03 }}
              >
                <Link href={`/quotes/${q.id}`} className="block">
                  <Card className="overflow-hidden rounded-[1.7rem] border border-border/60 bg-card shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
                    <CardContent className="p-0">
                      <div className="border-b border-border/60 bg-primary/[0.03] p-4 sm:p-5">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge className="rounded-full border-0 bg-primary/10 text-primary">
                                Quote #{q.id}
                              </Badge>
                              <Badge
                                variant="outline"
                                className={cn(
                                  "rounded-full border text-xs font-medium",
                                  STATUS_STYLES[q.status] || "bg-muted text-foreground border-border/60"
                                )}
                              >
                                {q.status.replaceAll("_", " ")}
                              </Badge>
                            </div>

                            <h2 className="mt-3 text-lg font-semibold tracking-tight sm:text-xl">
                              {q.property?.name || "Property"}
                            </h2>

                            <div className="mt-2 flex items-center gap-2 text-sm text-muted-foreground">
                              <Clock3 className="h-4 w-4" />
                              <span>Created {formatDateTime(q.createdAt)}</span>
                            </div>
                          </div>

                          <div className="hidden sm:flex sm:items-center sm:gap-2 sm:text-sm sm:font-medium sm:text-primary">
                            <span>Open quote</span>
                            <ArrowRight className="h-4 w-4" />
                          </div>
                        </div>
                      </div>

                      <div className="grid gap-3 p-4 sm:grid-cols-3 sm:p-5">
                        <InfoTile
                          icon={<CalendarDays className="h-4 w-4" />}
                          label="Stay dates"
                          value={`${formatShortDate(q.checkIn)} → ${formatShortDate(q.checkOut)}`}
                        />
                        <InfoTile
                          icon={<Hotel className="h-4 w-4" />}
                          label="Rooms required"
                          value={`${q.totalRoomsRequired} room${q.totalRoomsRequired > 1 ? "s" : ""}`}
                        />
                        <InfoTile
                          icon={<Sparkles className="h-4 w-4" />}
                          label="Current stage"
                          value={q.status.replaceAll("_", " ")}
                        />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </ProtectedShell>
  );
}

function TopStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-background px-3 py-2.5">
      <div className="flex items-center gap-2">
        <div className="text-primary">{icon}</div>
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          <p className="truncate text-sm font-medium text-foreground">{value}</p>
        </div>
      </div>
    </div>
  );
}

function InfoTile({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-background p-3.5">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          <p className="mt-1 text-sm font-medium leading-5 text-foreground">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}