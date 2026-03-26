"use client";

import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import { useParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowRight,
  BedDouble,
  CalendarDays,
  CheckCircle2,
  Hotel,
  ImageIcon,
  IndianRupee,
  Info,
  Loader2,
  MapPin,
  Percent,
  RefreshCcw,
  Sparkles,
  Users,
} from "lucide-react";
import type { z } from "zod";

import ProtectedShell from "@/components/b2b/ProtectedShell";
import { EmblaImageGallery } from "@/components/EmblaImageGallery";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { b2bRatesInventory, type B2BRatesInventory } from "@/lib/b2b-api";
import { normalizeGalleryImages, pickHeroAndGallery } from "@/lib/media";
import { ratesFilterSchema } from "@/lib/b2b-schemas";
import ZenvanaLoading from "@/components/Zenvanaloading";

type FormData = z.infer<typeof ratesFilterSchema>;

function todayPlus(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

const formatINR = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);

export default function RatesInventoryPage() {
  const { slug } = useParams<{ slug: string }>();
  const [result, setResult] = useState<B2BRatesInventory | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(ratesFilterSchema),
    defaultValues: {
      checkIn: todayPlus(1),
      checkOut: todayPlus(2),
      occupancy: 2,
    },
  });

  const occupancy = watch("occupancy");

  const onSubmit = handleSubmit(async (values) => {
    setHasSearched(true);
    setError(null);

    try {
      const data = await b2bRatesInventory(
        slug,
        values.checkIn,
        values.checkOut,
        values.occupancy
      );
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load data");
    }
  });

  const tableRows = useMemo(() => result?.roomTypes || [], [result]);

  const propertyGallery = useMemo(
    () => (result ? pickHeroAndGallery(result.property.images).gallery : []),
    [result]
  );

  const hasGallery = propertyGallery.length > 0;

  return (
    <ProtectedShell>
      <div className="mx-auto w-full max-w-7xl space-y-5 pb-28 sm:space-y-6 sm:pb-8">
        <motion.section
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
          className="overflow-hidden rounded-3xl border border-border/60 bg-card shadow-sm"
        >
          <div className="relative p-4 sm:p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
              <div className="min-w-0">
                <div className="mb-3 flex items-center gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <Hotel className="h-5 w-5" />
                  </div>
                  <Badge className="rounded-full border-0 bg-primary/10 px-3 py-1 text-primary">
                    Zenvana B2B
                  </Badge>
                </div>

                <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                  Live rates & inventory
                </h1>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
                  Pick dates, check occupancy, and compare website totals with
                  B2B totals in one smooth flow. Images stay central so agents
                  understand the product while pricing stays easy to explain.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                <TopMetaPill
                  icon={<CalendarDays className="h-4 w-4" />}
                  label="Check-in"
                  value={watch("checkIn") || "--"}
                />
                <TopMetaPill
                  icon={<Users className="h-4 w-4" />}
                  label="Occupancy"
                  value={`${occupancy || 2} guest${Number(occupancy || 2) > 1 ? "s" : ""}`}
                />
              </div>
            </div>
          </div>
        </motion.section>

        <motion.form
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, delay: 0.04, ease: "easeOut" }}
          onSubmit={onSubmit}
          className="rounded-3xl border border-border/60 bg-card p-4 shadow-sm sm:p-5"
        >
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-4">
            <FieldShell
              icon={<CalendarDays className="h-4 w-4" />}
              label="Check-in"
              helpText="Arrival date"
            >
              <Input type="date" className="h-12 rounded-2xl" {...register("checkIn")} />
              {errors.checkIn ? (
                <p className="text-xs text-destructive">{errors.checkIn.message}</p>
              ) : null}
            </FieldShell>

            <FieldShell
              icon={<CalendarDays className="h-4 w-4" />}
              label="Check-out"
              helpText="Departure date"
            >
              <Input type="date" className="h-12 rounded-2xl" {...register("checkOut")} />
              {errors.checkOut ? (
                <p className="text-xs text-destructive">{errors.checkOut.message}</p>
              ) : null}
            </FieldShell>

            <FieldShell
              icon={<Users className="h-4 w-4" />}
              label="Occupancy"
              helpText="Per room"
            >
              <Input
                type="number"
                min={1}
                max={8}
                className="h-12 rounded-2xl"
                {...register("occupancy")}
              />
            </FieldShell>

            <div className="flex flex-col justify-end">
              <Button
                className="h-12 w-full rounded-2xl text-sm font-medium shadow-sm"
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Loading live rates
                  </>
                ) : (
                  <>
                    Show live rates
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                )}
              </Button>
            </div>
          </div>

          <div className="mt-4 rounded-2xl border border-border/60 bg-muted/40 p-3.5">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Info className="h-4 w-4" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-foreground">
                  How to read these prices
                </p>
                <p className="text-xs leading-5 text-muted-foreground sm:text-sm">
                  Totals shown below are for the full stay, plan-aware, and easy
                  to compare. B2B totals are shown alongside website totals so an
                  agent can immediately understand the commercial advantage.
                </p>
              </div>
            </div>
          </div>
        </motion.form>

        <AnimatePresence mode="wait">
          {error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              <Alert className="rounded-2xl border-destructive/30 bg-destructive/5 text-destructive">
                <RefreshCcw className="h-4 w-4" />
                <AlertTitle>Unable to load live rates</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            </motion.div>
          ) : null}
        </AnimatePresence>

        {isSubmitting && !result ? (
          <ZenvanaLoading
            variant="section"
            title="Loading live rates"
            description="Preparing inventory, partner pricing, and stay totals."
          />
        ) : null}

        {!result && !isSubmitting && !hasSearched ? <PreSearchState /> : null}

        {result ? (
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className="space-y-5 sm:space-y-6"
          >
            {/* <section className="overflow-hidden rounded-3xl border border-border/60 bg-card shadow-sm">
              <div className="grid grid-cols-1 gap-0 lg:grid-cols-[1.15fr_0.85fr]">
                <div className="p-3 sm:p-4">
                  {hasGallery ? (
                    <EmblaImageGallery
                      images={propertyGallery.map((img, index) => ({
                        url: img.url,
                        alt: `${result.property.publicName} photo ${index + 1}`,
                      }))}
                      aspectClassName="aspect-[16/10]"
                      autoPlay
                      showThumbs
                      priorityFirstImage
                    />
                  ) : (
                    <div className="grid aspect-[16/10] place-items-center rounded-[1.35rem] border border-dashed border-border bg-muted text-center">
                      <div className="space-y-2 px-6">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-background text-muted-foreground">
                          <ImageIcon className="h-5 w-5" />
                        </div>
                        <p className="text-sm font-medium">Property photos are not available yet</p>
                        <p className="text-xs text-muted-foreground">
                          Rates are live, but gallery images have not been added for this property.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col justify-between border-t border-border/60 p-4 sm:p-5 lg:border-l lg:border-t-0">
                  <div>
                    <div className="mb-3 flex items-center gap-2">
                      <Badge className="rounded-full border-0 bg-primary/10 text-primary">
                        Live result
                      </Badge>
                      <Badge variant="outline" className="rounded-full">
                        {tableRows.length} room type{tableRows.length === 1 ? "" : "s"}
                      </Badge>
                    </div>

                    <h2 className="text-2xl font-semibold tracking-tight">
                      {result.property.publicName}
                    </h2>

                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <SummaryPill
                        icon={<CalendarDays className="h-4 w-4" />}
                        label="Stay"
                        value={`${result.checkIn} → ${result.checkOut}`}
                      />
                      <SummaryPill
                        icon={<BedDouble className="h-4 w-4" />}
                        label="Duration"
                        value={`${result.nights} night${result.nights > 1 ? "s" : ""}`}
                      />
                      <SummaryPill
                        icon={<Users className="h-4 w-4" />}
                        label="Occupancy"
                        value={`${occupancy || 2} guest${Number(occupancy || 2) > 1 ? "s" : ""}`}
                      />
                      <SummaryPill
                        icon={<Sparkles className="h-4 w-4" />}
                        label="Pricing"
                        value="Plan-aware B2B"
                      />
                    </div>

                    <div className="mt-4 rounded-2xl border border-border/60 bg-muted/40 p-3.5">
                      <p className="text-sm font-medium">Rate logic shown clearly</p>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground sm:text-sm">
                        Best B2B totals are highlighted first so agents can quote
                        fast. Website totals are shown alongside for transparent
                        comparison.
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                    <Button
                      type="button"
                      className="h-12 flex-1 rounded-2xl"
                      onClick={() => onSubmit()}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Refreshing
                        </>
                      ) : (
                        <>
                          <RefreshCcw className="mr-2 h-4 w-4" />
                          Refresh rates
                        </>
                      )}
                    </Button>

                    <Button asChild variant="outline" className="h-12 rounded-2xl">
                      <Link href="/quotes/new">Send requirement</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </section> */}

            <section className="space-y-3">
              <div className="flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <h3 className="text-lg font-semibold sm:text-xl">Room-wise live comparison</h3>
                  <p className="text-sm text-muted-foreground">
                    Image-led room cards with availability, best totals, and rate-plan breakdown.
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
                {tableRows.map((row, index) => (
                  <RoomRateCard
                    key={row.roomTypeId}
                    row={row}
                    index={index}
                    nights={result.nights}
                  />
                ))}
              </div>
            </section>

            <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-background/92 p-3 backdrop-blur sm:hidden">
              <div className="mx-auto flex max-w-7xl gap-2">
                <Button
                  className="h-12 flex-1 rounded-2xl"
                  type="button"
                  onClick={() => onSubmit()}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Refreshing
                    </>
                  ) : (
                    <>
                      <RefreshCcw className="mr-2 h-4 w-4" />
                      Refresh rates
                    </>
                  )}
                </Button>

                <Button asChild variant="outline" className="h-12 rounded-2xl px-4">
                  <Link href="/quotes/new">Send requirement</Link>
                </Button>
              </div>
            </div>
          </motion.div>
        ) : null}
      </div>
      {isSubmitting && result ? (
        <ZenvanaLoading
          variant="overlay"
          title="Refreshing live rates"
          description="Updating rates, plans, and room availability for your selected dates."
        />
      ) : null}
    </ProtectedShell>
  );
}

function RoomRateCard({
  row,
  index,
  nights,
}: {
  row: B2BRatesInventory["roomTypes"][number];
  index: number;
  nights: number;
}) {
  const roomImages = normalizeGalleryImages(row.images);
  const plans = row.ratePlans ?? [];
  const bestPlan =
    plans.length > 0
      ? plans.reduce((min, p) => (p.b2bTotalRate < min.b2bTotalRate ? p : min), plans[0])
      : null;

  const bestWebsiteTotal = bestPlan?.websiteTotalRate ?? row.websiteTotalRate;
  const bestB2BTotal = bestPlan?.b2bTotalRate ?? row.b2bTotalRate;
  const savings = Math.max(0, bestWebsiteTotal - bestB2BTotal);
  const savingsPct =
    bestWebsiteTotal > 0 ? Math.round((savings / bestWebsiteTotal) * 100) : 0;

  return (
    <motion.article
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22, delay: index * 0.04, ease: "easeOut" }}
    >
      <Card className="overflow-hidden rounded-3xl border border-border/60 bg-card shadow-sm transition-shadow hover:shadow-md">
        <CardContent className="p-0">
          <div className="p-3 sm:p-4">
            {roomImages.length > 0 ? (
              <EmblaImageGallery
                images={roomImages.map((img, idx) => ({
                  url: img.url,
                  alt: `${row.roomTypeName} image ${idx + 1}`,
                }))}
                aspectClassName="aspect-[16/10]"
                autoPlay={false}
                showThumbs={roomImages.length > 1}
              />
            ) : (
              <div className="grid aspect-[16/10] place-items-center rounded-[1.25rem] bg-muted text-center">
                <div className="space-y-2 px-5">
                  <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-2xl bg-background text-muted-foreground">
                    <ImageIcon className="h-5 w-5" />
                  </div>
                  <p className="text-sm font-medium">No room photos</p>
                  <p className="text-xs text-muted-foreground">
                    Add photos to make room selection faster and more confident.
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="space-y-4 border-t border-border/60 p-4 sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="text-lg font-semibold tracking-tight">
                    {row.roomTypeName}
                  </h4>
                  <Badge
                    variant={row.availableRooms > 0 ? "secondary" : "outline"}
                    className="rounded-full"
                  >
                    {row.availableRooms} room{row.availableRooms === 1 ? "" : "s"} available
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  Best available total for {nights} night{nights > 1 ? "s" : ""}.
                </p>
              </div>

              {savings > 0 ? (
                <Badge className="rounded-full border-0 bg-primary/10 px-3 py-1.5 text-primary">
                  Save {formatINR(savings)}
                </Badge>
              ) : null}
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              <PriceTile
                icon={<IndianRupee className="h-4 w-4" />}
                label="Website total"
                value={formatINR(bestWebsiteTotal)}
                tone="default"
              />
              <PriceTile
                icon={<Sparkles className="h-4 w-4" />}
                label="Best B2B total"
                value={formatINR(bestB2BTotal)}
                tone="primary"
              />
              <PriceTile
                icon={<Percent className="h-4 w-4" />}
                label="Agent advantage"
                value={savings > 0 ? `${savingsPct}% lower` : "Included"}
                tone="success"
              />
            </div>

            {bestPlan ? (
              <div className="rounded-2xl border border-primary/20 bg-primary/5 p-3.5">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="text-sm font-semibold text-foreground">
                    Best plan right now
                  </p>
                  <Badge className="rounded-full border-0 bg-primary text-primary-foreground">
                    {bestPlan.mealPlan || "EP"}
                  </Badge>
                </div>
                <p className="mt-1 text-sm text-muted-foreground">
                  {bestPlan.name} at {formatINR(bestPlan.b2bTotalRate)} B2B
                </p>
              </div>
            ) : null}

            {plans.length > 0 ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  <p className="text-sm font-medium">Rate plans</p>
                </div>

                <div className="grid grid-cols-1 gap-2">
                  {plans.map((plan) => {
                    const planSavings = Math.max(
                      0,
                      plan.websiteTotalRate - plan.b2bTotalRate
                    );

                    return (
                      <div
                        key={`${row.roomTypeId}-${plan.id}`}
                        className="rounded-2xl border border-border/60 bg-muted/30 p-3"
                      >
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <p className="text-sm font-medium text-foreground">
                                {plan.name}
                              </p>
                              <Badge variant="outline" className="rounded-full">
                                {plan.mealPlan || "EP"}
                              </Badge>
                            </div>
                            <p className="mt-1 text-xs text-muted-foreground">
                              Total for full stay
                            </p>
                          </div>

                          <Badge
                            className="rounded-full border-0 bg-background text-foreground"
                            variant="secondary"
                          >
                            Save {formatINR(planSavings)}
                          </Badge>
                        </div>

                        <div className="mt-3 grid grid-cols-2 gap-2">
                          <MiniMetric label="Website" value={formatINR(plan.websiteTotalRate)} />
                          <MiniMetric label="B2B" value={formatINR(plan.b2bTotalRate)} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-border/60 bg-muted/30 p-3.5">
                <p className="text-sm font-medium">Single price available</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  No separate rate-plan breakdown was returned for this room type.
                </p>
              </div>
            )}

            <div className="flex flex-col gap-2 sm:flex-row">
              <Button asChild className="h-11 flex-1 rounded-2xl">
                <Link href="/quotes/new">Send requirement</Link>
              </Button>
              <Button asChild variant="outline" className="h-11 rounded-2xl">
                <Link href="/properties">Back to properties</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.article>
  );
}

function FieldShell({
  icon,
  label,
  helpText,
  children,
}: {
  icon: ReactNode;
  label: string;
  helpText: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-2 rounded-2xl border border-border/60 bg-background p-3">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          {icon}
        </div>
        <div className="min-w-0">
          <label className="text-sm font-medium text-foreground">{label}</label>
          <p className="text-xs text-muted-foreground">{helpText}</p>
        </div>
      </div>
      <div>{children}</div>
    </div>
  );
}

function TopMetaPill({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-background px-3 py-2">
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

function SummaryPill({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-background p-3">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          <p className="mt-1 text-sm font-medium leading-5 text-foreground">{value}</p>
        </div>
      </div>
    </div>
  );
}

function PriceTile({
  icon,
  label,
  value,
  tone,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  tone: "default" | "primary" | "success";
}) {
  const toneClass =
    tone === "primary"
      ? "border-primary/20 bg-primary/5"
      : tone === "success"
        ? "border-emerald-500/20 bg-emerald-500/5"
        : "border-border/60 bg-background";

  const iconClass =
    tone === "primary"
      ? "bg-primary/10 text-primary"
      : tone === "success"
        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
        : "bg-muted text-foreground";

  return (
    <div className={`rounded-2xl border p-3 ${toneClass}`}>
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${iconClass}`}>
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          <p className="mt-1 text-base font-semibold tracking-tight text-foreground">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

function MiniMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/60 bg-background px-3 py-2.5">
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}

function PreSearchState() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-dashed border-border/70 bg-card px-5 py-10 text-center shadow-sm sm:px-6 sm:py-14"
    >
      <div className="mx-auto max-w-xl">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          <MapPin className="h-6 w-6" />
        </div>
        <h2 className="mt-4 text-xl font-semibold">Ready to compare live room options</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground sm:text-base">
          Choose dates and occupancy above to reveal property imagery, room-wise
          availability, best B2B totals, and plan-level pricing in one clean flow.
        </p>
      </div>
    </motion.section>
  );
}

function InitialLoadingState() {
  return (
    <div className="space-y-5 sm:space-y-6">
      <Card className="overflow-hidden rounded-3xl border border-border/60 bg-card shadow-sm">
        <CardContent className="grid grid-cols-1 gap-0 p-0 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="p-3 sm:p-4">
            <Skeleton className="aspect-[16/10] w-full rounded-[1.35rem]" />
          </div>
          <div className="space-y-4 border-t border-border/60 p-4 sm:p-5 lg:border-l lg:border-t-0">
            <div className="flex gap-2">
              <Skeleton className="h-6 w-24 rounded-full" />
              <Skeleton className="h-6 w-28 rounded-full" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-8 w-56 rounded-xl" />
              <Skeleton className="h-4 w-44 rounded-xl" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Skeleton className="h-20 rounded-2xl" />
              <Skeleton className="h-20 rounded-2xl" />
              <Skeleton className="h-20 rounded-2xl" />
              <Skeleton className="h-20 rounded-2xl" />
            </div>
            <Skeleton className="h-20 rounded-2xl" />
            <div className="flex gap-2">
              <Skeleton className="h-12 flex-1 rounded-2xl" />
              <Skeleton className="h-12 w-40 rounded-2xl" />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card
            key={i}
            className="overflow-hidden rounded-3xl border border-border/60 bg-card shadow-sm"
          >
            <CardContent className="p-0">
              <div className="p-3 sm:p-4">
                <Skeleton className="aspect-[16/10] w-full rounded-[1.25rem]" />
              </div>
              <div className="space-y-4 border-t border-border/60 p-4 sm:p-5">
                <div className="space-y-2">
                  <Skeleton className="h-6 w-40 rounded-xl" />
                  <Skeleton className="h-4 w-28 rounded-xl" />
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  <Skeleton className="h-24 rounded-2xl" />
                  <Skeleton className="h-24 rounded-2xl" />
                  <Skeleton className="h-24 rounded-2xl" />
                </div>
                <Skeleton className="h-20 rounded-2xl" />
                <div className="space-y-2">
                  <Skeleton className="h-24 rounded-2xl" />
                  <Skeleton className="h-24 rounded-2xl" />
                </div>
                <div className="flex gap-2">
                  <Skeleton className="h-11 flex-1 rounded-2xl" />
                  <Skeleton className="h-11 w-32 rounded-2xl" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}