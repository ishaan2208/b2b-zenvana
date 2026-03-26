"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Hotel,
  IndianRupee,
  Loader2,
  MessageSquare,
  NotebookPen,
  RefreshCcw,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { differenceInCalendarDays, format, parseISO } from "date-fns";

import ProtectedShell from "@/components/b2b/ProtectedShell";
import ZenvanaLoading from "@/components/Zenvanaloading";
import {
  addB2BQuoteComment,
  getB2BQuote,
  updateB2BQuoteStatus,
} from "@/lib/b2b-api";
import { cn } from "@/lib/utils";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type QuoteDetail = {
  id: number;
  status: string;
  property: { name: string };
  checkIn: string;
  checkOut: string;
  lines: Array<{
    id: number;
    roomTypeName: string;
    roomCount: number;
    occupancy: number;
    targetRate?: number | null;
  }>;
  statusHistory: Array<{
    id: number;
    fromStatus?: string | null;
    toStatus: string;
    changedBy: string;
    createdAt: string;
  }>;
  comments: Array<{
    id: number;
    message: string;
    authorLabel: string;
    createdAt: string;
  }>;
};

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

function formatCurrency(value?: number | null) {
  if (!value) return null;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

export default function QuoteDetailPage() {
  const { id } = useParams<{ id: string }>();

  const [quote, setQuote] = useState<QuoteDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState<string | null>(null);

  const [comment, setComment] = useState("");
  const [note, setNote] = useState("");
  const [status, setStatus] = useState("NEGOTIATION");

  const [commentLoading, setCommentLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setPageError(null);
      const data = await getB2BQuote(id);
      setQuote(data);
    } catch (err) {
      setQuote(null);
      setPageError(err instanceof Error ? err.message : "Failed to load quote");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const totalRooms = useMemo(() => {
    if (!quote) return 0;
    return quote.lines.reduce((sum, line) => sum + line.roomCount, 0);
  }, [quote]);

  const totalGuests = useMemo(() => {
    if (!quote) return 0;
    return quote.lines.reduce((sum, line) => sum + line.roomCount * line.occupancy, 0);
  }, [quote]);

  const nights = useMemo(() => {
    if (!quote) return 0;
    try {
      return Math.max(
        0,
        differenceInCalendarDays(parseISO(quote.checkOut), parseISO(quote.checkIn))
      );
    } catch {
      return 0;
    }
  }, [quote]);

  async function handleComment() {
    if (!comment.trim()) return;

    try {
      setCommentLoading(true);
      await addB2BQuoteComment(id, comment.trim());
      setComment("");
      await load();
    } finally {
      setCommentLoading(false);
    }
  }

  async function handleStatus() {
    try {
      setStatusLoading(true);
      await updateB2BQuoteStatus(id, status, note.trim() || undefined);
      setNote("");
      await load();
    } finally {
      setStatusLoading(false);
    }
  }

  return (
    <ProtectedShell>
      <div className="mx-auto max-w-6xl space-y-5 pb-28 sm:space-y-6 lg:pb-8">
        <div className="flex items-center">
          <Button asChild variant="ghost" className="h-10 rounded-2xl px-3">
            <Link href="/quotes">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to quotes
            </Link>
          </Button>
        </div>

        {loading && !quote ? (
          <ZenvanaLoading
            variant="section"
            title="Loading quote details"
            description="Preparing quote summary, comments, and timeline."
          />
        ) : pageError && !quote ? (
          <Alert className="rounded-[1.5rem] border-destructive/30 bg-destructive/5 text-destructive">
            <RefreshCcw className="h-4 w-4" />
            <AlertTitle>Unable to load quote</AlertTitle>
            <AlertDescription>{pageError}</AlertDescription>
          </Alert>
        ) : quote ? (
          <>
            <motion.section
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.24, ease: "easeOut" }}
              className="overflow-hidden rounded-[2rem] border border-border/60 bg-card shadow-sm"
            >
              <div className="p-4 sm:p-6">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                  <div className="min-w-0">
                    <div className="mb-3 flex flex-wrap items-center gap-2">
                      <Badge className="rounded-full border-0 bg-primary/10 px-3 py-1 text-primary">
                        Quote #{quote.id}
                      </Badge>
                      <Badge
                        variant="outline"
                        className={cn(
                          "rounded-full border text-xs font-medium",
                          STATUS_STYLES[quote.status] || "bg-muted text-foreground border-border/60"
                        )}
                      >
                        {quote.status.replaceAll("_", " ")}
                      </Badge>
                    </div>

                    <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                      {quote.property?.name || "Property"}
                    </h1>

                    <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1.5">
                        <CalendarDays className="h-4 w-4" />
                        <span>
                          {formatShortDate(quote.checkIn)} → {formatShortDate(quote.checkOut)}
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Clock3 className="h-4 w-4" />
                        <span>
                          {nights} night{nights > 1 ? "s" : ""}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                    <TopStat
                      icon={<Hotel className="h-4 w-4" />}
                      label="Rooms"
                      value={`${totalRooms}`}
                    />
                    <TopStat
                      icon={<Users className="h-4 w-4" />}
                      label="Guests"
                      value={`${totalGuests}`}
                    />
                    <TopStat
                      icon={<NotebookPen className="h-4 w-4" />}
                      label="Comments"
                      value={`${quote.comments.length}`}
                    />
                    <TopStat
                      icon={<Sparkles className="h-4 w-4" />}
                      label="Timeline"
                      value={`${quote.statusHistory.length}`}
                    />
                  </div>
                </div>
              </div>
            </motion.section>

            <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
              <div className="space-y-5">
                <motion.section
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.24, delay: 0.03, ease: "easeOut" }}
                >
                  <Card className="rounded-[2rem] border border-border/60 bg-card shadow-sm">
                    <CardContent className="space-y-4 p-4 sm:p-5">
                      <SectionHeader
                        icon={<Hotel className="h-5 w-5" />}
                        title="Requested room lines"
                        description="A clear breakdown of room type, occupancy, and any target pricing."
                      />

                      <div className="space-y-3">
                        {quote.lines.map((line, index) => (
                          <div
                            key={line.id}
                            className="rounded-[1.4rem] border border-border/60 bg-background p-4"
                          >
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                              <div className="min-w-0">
                                <div className="flex flex-wrap items-center gap-2">
                                  <Badge className="rounded-full border-0 bg-primary/10 text-primary">
                                    Line {index + 1}
                                  </Badge>
                                  <p className="text-base font-semibold text-foreground">
                                    {line.roomTypeName}
                                  </p>
                                </div>

                                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3">
                                  <MiniInfo
                                    label="Room count"
                                    value={`${line.roomCount}`}
                                    icon={<Hotel className="h-4 w-4" />}
                                  />
                                  <MiniInfo
                                    label="Occupancy"
                                    value={`${line.occupancy} pax`}
                                    icon={<Users className="h-4 w-4" />}
                                  />
                                  <MiniInfo
                                    label="Target rate"
                                    value={formatCurrency(line.targetRate) || "Not specified"}
                                    icon={<IndianRupee className="h-4 w-4" />}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.section>

                <motion.section
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.24, delay: 0.06, ease: "easeOut" }}
                >
                  <Card className="rounded-[2rem] border border-border/60 bg-card shadow-sm">
                    <CardContent className="space-y-4 p-4 sm:p-5">
                      <SectionHeader
                        icon={<MessageSquare className="h-5 w-5" />}
                        title="Comments"
                        description="Keep the sales conversation moving with contextual notes."
                      />

                      <div className="flex flex-col gap-3 sm:flex-row">
                        <Input
                          className="h-12 rounded-2xl"
                          value={comment}
                          onChange={(e) => setComment(e.target.value)}
                          placeholder="Add a comment"
                        />
                        <Button
                          type="button"
                          onClick={handleComment}
                          disabled={commentLoading || !comment.trim()}
                          className="h-12 rounded-2xl px-5"
                        >
                          {commentLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Adding
                            </>
                          ) : (
                            "Add comment"
                          )}
                        </Button>
                      </div>

                      {quote.comments.length === 0 ? (
                        <div className="rounded-[1.35rem] border border-dashed border-border/70 bg-muted/20 p-4 text-sm text-muted-foreground">
                          No comments yet. Add context for negotiation, changes, or follow-ups.
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {quote.comments.map((c) => (
                            <div
                              key={c.id}
                              className="rounded-[1.35rem] border border-border/60 bg-background p-4"
                            >
                              <p className="text-sm leading-6 text-foreground">{c.message}</p>
                              <p className="mt-2 text-xs text-muted-foreground">
                                {c.authorLabel} • {formatDateTime(c.createdAt)}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.section>

                <motion.section
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.24, delay: 0.09, ease: "easeOut" }}
                >
                  <Card className="rounded-[2rem] border border-border/60 bg-card shadow-sm">
                    <CardContent className="space-y-4 p-4 sm:p-5">
                      <SectionHeader
                        icon={<Clock3 className="h-5 w-5" />}
                        title="Status timeline"
                        description="A clear movement log from initiation to the current stage."
                      />

                      {quote.statusHistory.length === 0 ? (
                        <div className="rounded-[1.35rem] border border-dashed border-border/70 bg-muted/20 p-4 text-sm text-muted-foreground">
                          No status history recorded yet.
                        </div>
                      ) : (
                        <div className="space-y-3">
                          {quote.statusHistory.map((h) => (
                            <div
                              key={h.id}
                              className="rounded-[1.35rem] border border-border/60 bg-background p-4"
                            >
                              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                <div className="flex flex-wrap items-center gap-2 text-sm font-medium text-foreground">
                                  <Badge variant="outline" className="rounded-full">
                                    {h.fromStatus || "INIT"}
                                  </Badge>
                                  <span className="text-muted-foreground">→</span>
                                  <Badge
                                    variant="outline"
                                    className={cn(
                                      "rounded-full border text-xs font-medium",
                                      STATUS_STYLES[h.toStatus] ||
                                      "bg-muted text-foreground border-border/60"
                                    )}
                                  >
                                    {h.toStatus.replaceAll("_", " ")}
                                  </Badge>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                  {formatDateTime(h.createdAt)}
                                </p>
                              </div>

                              <p className="mt-2 text-xs text-muted-foreground">
                                Changed by {h.changedBy}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.section>
              </div>

              <motion.aside
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.24, delay: 0.12, ease: "easeOut" }}
                className="space-y-5 xl:sticky xl:top-24 xl:self-start"
              >
                <Card className="rounded-[2rem] border border-border/60 bg-card shadow-sm">
                  <CardContent className="space-y-4 p-4 sm:p-5">
                    <SectionHeader
                      icon={<ShieldCheck className="h-5 w-5" />}
                      title="Update quote status"
                      description="Push the quote to the next stage with an optional internal note."
                    />

                    <div className="space-y-2">
                      <LabelText>Next status</LabelText>
                      <Select value={status} onValueChange={setStatus}>
                        <SelectTrigger className="h-12 rounded-2xl">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="NEGOTIATION">Negotiation</SelectItem>
                          <SelectItem value="CONFIRMED">Confirmed</SelectItem>
                          <SelectItem value="CANCELLED">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <LabelText>Optional note</LabelText>
                      <Input
                        className="h-12 rounded-2xl"
                        placeholder="Why is the status changing?"
                        value={note}
                        onChange={(e) => setNote(e.target.value)}
                      />
                    </div>

                    <Button
                      type="button"
                      onClick={handleStatus}
                      disabled={statusLoading}
                      className="h-12 w-full rounded-2xl text-sm font-medium"
                    >
                      {statusLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving status
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="mr-2 h-4 w-4" />
                          Save status
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>

                <Card className="rounded-[2rem] border border-border/60 bg-card shadow-sm">
                  <CardContent className="space-y-4 p-4 sm:p-5">
                    <SectionHeader
                      icon={<Sparkles className="h-5 w-5" />}
                      title="Quick summary"
                      description="A compact overview for fast decision-making on mobile."
                    />

                    <div className="grid grid-cols-2 gap-3">
                      <MiniInfo
                        label="Current stage"
                        value={quote.status.replaceAll("_", " ")}
                        icon={<Sparkles className="h-4 w-4" />}
                      />
                      <MiniInfo
                        label="Stay"
                        value={`${nights} night${nights > 1 ? "s" : ""}`}
                        icon={<CalendarDays className="h-4 w-4" />}
                      />
                      <MiniInfo
                        label="Rooms"
                        value={`${totalRooms}`}
                        icon={<Hotel className="h-4 w-4" />}
                      />
                      <MiniInfo
                        label="Guests"
                        value={`${totalGuests}`}
                        icon={<Users className="h-4 w-4" />}
                      />
                    </div>
                  </CardContent>
                </Card>
              </motion.aside>
            </div>

            {(statusLoading || commentLoading) && (
              <ZenvanaLoading
                variant="overlay"
                title={statusLoading ? "Updating quote status" : "Adding comment"}
                description={
                  statusLoading
                    ? "Saving the new stage and refreshing the quote timeline."
                    : "Posting your note and refreshing the conversation."
                }
              />
            )}
          </>
        ) : null}
      </div>
    </ProtectedShell>
  );
}

function SectionHeader({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
        {icon}
      </div>
      <div className="min-w-0">
        <h2 className="text-lg font-semibold tracking-tight sm:text-xl">{title}</h2>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}

function LabelText({ children }: { children: React.ReactNode }) {
  return <label className="text-sm font-medium text-foreground">{children}</label>;
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

function MiniInfo({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-[1.15rem] border border-border/60 bg-background p-3">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
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