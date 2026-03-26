"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import {
  addDays,
  differenceInCalendarDays,
  format,
  isBefore,
  parseISO,
  startOfToday,
} from "date-fns";
import type { z } from "zod";
import {
  BedDouble,
  Building2,
  CalendarDays,
  CalendarIcon,
  ChevronDown,
  Hotel,
  IndianRupee,
  Loader2,
  MapPin,
  NotebookPen,
  Plus,
  ShieldCheck,
  Sparkles,
  Trash2,
  Users,
} from "lucide-react";

import ProtectedShell from "@/components/b2b/ProtectedShell";
import ZenvanaLoading from "@/components/Zenvanaloading";
import { createB2BQuote, b2bProperties, type B2BProperty } from "@/lib/b2b-api";
import { createQuoteSchema } from "@/lib/b2b-schemas";
import { cn } from "@/lib/utils";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/Card";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

type FormData = z.infer<typeof createQuoteSchema>;

const PRIORITY_STYLES: Record<"LOW" | "MEDIUM" | "HIGH", string> = {
  LOW: "bg-muted text-foreground",
  MEDIUM: "bg-primary/10 text-primary",
  HIGH: "bg-destructive/10 text-destructive",
};

function safeParseDate(value?: string) {
  if (!value) return undefined;
  try {
    return parseISO(value);
  } catch {
    return undefined;
  }
}

function formatDateLabel(value?: string) {
  const parsed = safeParseDate(value);
  return parsed ? format(parsed, "EEE, dd MMM yyyy") : "";
}

function defaultCheckIn() {
  return format(addDays(new Date(), 1), "yyyy-MM-dd");
}

function defaultCheckOut() {
  return format(addDays(new Date(), 2), "yyyy-MM-dd");
}

export default function NewQuotePage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [properties, setProperties] = useState<B2BProperty[]>([]);
  const [propertiesLoading, setPropertiesLoading] = useState(true);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(createQuoteSchema),
    defaultValues: {
      checkIn: defaultCheckIn(),
      checkOut: defaultCheckOut(),
      totalRoomsRequired: 1,
      totalGuests: 2,
      priority: "MEDIUM",
      lines: [{ roomTypeName: "Deluxe", occupancy: 2, roomCount: 1 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: "lines",
  });

  const selectedPropertyId = watch("propertyId");
  const selectedPriority = watch("priority");
  const selectedCheckIn = watch("checkIn");
  const selectedCheckOut = watch("checkOut");
  const totalRoomsRequired = watch("totalRoomsRequired");
  const totalGuests = watch("totalGuests");
  const lines = watch("lines");

  useEffect(() => {
    let active = true;

    async function loadProperties() {
      try {
        setPropertiesLoading(true);
        const rows = await b2bProperties();
        if (!active) return;
        setProperties(rows);
      } catch {
        if (!active) return;
        setProperties([]);
      } finally {
        if (!active) return;
        setPropertiesLoading(false);
      }
    }

    loadProperties();

    return () => {
      active = false;
    };
  }, []);

  const selectedProperty = useMemo(
    () => properties.find((p) => p.id === selectedPropertyId),
    [properties, selectedPropertyId]
  );

  const nights = useMemo(() => {
    const start = safeParseDate(selectedCheckIn);
    const end = safeParseDate(selectedCheckOut);
    if (!start || !end) return 0;
    return Math.max(0, differenceInCalendarDays(end, start));
  }, [selectedCheckIn, selectedCheckOut]);

  const lineCount = fields.length;

  const summedLineRooms = useMemo(() => {
    return (lines || []).reduce((sum, line) => {
      const count = Number(line?.roomCount || 0);
      return sum + (Number.isFinite(count) ? count : 0);
    }, 0);
  }, [lines]);

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    try {
      await createB2BQuote(values);
      router.push("/quotes");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create quote");
    }
  });

  return (
    <ProtectedShell>
      <div className="mx-auto max-w-7xl space-y-5 pb-28 sm:space-y-6 lg:pb-10">
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.28, ease: "easeOut" }}
          className="overflow-hidden rounded-[2rem] border border-border/60 bg-card shadow-sm"
        >
          <div className="relative p-4 sm:p-6">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div className="min-w-0">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <Badge className="rounded-full border-0 bg-primary/10 px-3 py-1 text-primary">
                    Zenvana B2B
                  </Badge>
                  <Badge variant="outline" className="rounded-full px-3 py-1">
                    Bulk Requirement
                  </Badge>
                </div>

                <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                  Create a rooming request
                </h1>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground sm:text-base">
                  Submit a polished bulk requirement with stay dates, room mix,
                  guest count, and target pricing so your team can move from
                  requirement to quote smoothly.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
                <TopPill
                  icon={<BedDouble className="h-4 w-4" />}
                  label="Room lines"
                  value={`${lineCount}`}
                />
                <TopPill
                  icon={<Hotel className="h-4 w-4" />}
                  label="Rooms"
                  value={`${totalRoomsRequired || 0}`}
                />
                <TopPill
                  icon={<Users className="h-4 w-4" />}
                  label="Guests"
                  value={`${totalGuests || 0}`}
                />
                <TopPill
                  icon={<CalendarDays className="h-4 w-4" />}
                  label="Stay"
                  value={nights > 0 ? `${nights} night${nights > 1 ? "s" : ""}` : "--"}
                />
              </div>
            </div>
          </div>
        </motion.section>

        <form onSubmit={onSubmit} className="grid gap-5 xl:grid-cols-[1.08fr_0.92fr]">
          <div className="space-y-5">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, delay: 0.03, ease: "easeOut" }}
            >
              <Card className="rounded-[2rem] border border-border/60 bg-card shadow-sm">
                <CardContent className="space-y-5 p-4 sm:p-5">
                  <SectionHeader
                    icon={<Building2 className="h-5 w-5" />}
                    title="Stay basics"
                    description="Select property, stay dates, priority, and headline guest requirements."
                  />

                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <LabelText>Property</LabelText>
                      <Controller
                        control={control}
                        name="propertyId"
                        render={({ field }) => (
                          <Select
                            value={field.value != null ? String(field.value) : ""}
                            onValueChange={(value) => field.onChange(Number(value))}
                          >
                            <SelectTrigger className="h-12 rounded-2xl">
                              <SelectValue
                                placeholder={
                                  propertiesLoading ? "Loading properties..." : "Select property"
                                }
                              />
                            </SelectTrigger>
                            <SelectContent>
                              {properties.map((p) => (
                                <SelectItem key={p.id} value={String(p.id)}>
                                  {p.publicName}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {errors.propertyId ? (
                        <p className="text-xs text-destructive">{errors.propertyId.message}</p>
                      ) : null}
                    </div>

                    <div className="space-y-2">
                      <LabelText>Priority</LabelText>
                      <Controller
                        control={control}
                        name="priority"
                        render={({ field }) => (
                          <Select value={field.value} onValueChange={field.onChange}>
                            <SelectTrigger className="h-12 rounded-2xl">
                              <SelectValue placeholder="Select priority" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="LOW">Low priority</SelectItem>
                              <SelectItem value="MEDIUM">Medium priority</SelectItem>
                              <SelectItem value="HIGH">High priority</SelectItem>
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>

                    <div className="space-y-2">
                      <LabelText>Check-in</LabelText>
                      <Controller
                        control={control}
                        name="checkIn"
                        render={({ field }) => (
                          <DatePickerField
                            value={field.value}
                            placeholder="Pick check-in date"
                            onSelect={(date) => {
                              if (!date) {
                                field.onChange("");
                                return;
                              }

                              const formatted = format(date, "yyyy-MM-dd");
                              field.onChange(formatted);

                              const currentCheckOut = safeParseDate(selectedCheckOut);
                              if (currentCheckOut && isBefore(currentCheckOut, date)) {
                                setValue("checkOut", "");
                              }
                            }}
                            disabled={(date) => isBefore(date, startOfToday())}
                          />
                        )}
                      />
                      {errors.checkIn ? (
                        <p className="text-xs text-destructive">{errors.checkIn.message}</p>
                      ) : null}
                    </div>

                    <div className="space-y-2">
                      <LabelText>Check-out</LabelText>
                      <Controller
                        control={control}
                        name="checkOut"
                        render={({ field }) => (
                          <DatePickerField
                            value={field.value}
                            placeholder="Pick check-out date"
                            onSelect={(date) => {
                              field.onChange(date ? format(date, "yyyy-MM-dd") : "");
                            }}
                            disabled={(date) => {
                              const checkInDate = safeParseDate(selectedCheckIn);
                              if (!checkInDate) return isBefore(date, startOfToday());
                              return isBefore(date, checkInDate);
                            }}
                          />
                        )}
                      />
                      {errors.checkOut ? (
                        <p className="text-xs text-destructive">{errors.checkOut.message}</p>
                      ) : null}
                    </div>

                    <div className="space-y-2">
                      <LabelText>Total rooms required</LabelText>
                      <Input
                        type="number"
                        min={1}
                        className="h-12 rounded-2xl"
                        {...register("totalRoomsRequired", { valueAsNumber: true })}
                      />
                    </div>

                    <div className="space-y-2">
                      <LabelText>Total guests</LabelText>
                      <Input
                        type="number"
                        min={1}
                        className="h-12 rounded-2xl"
                        {...register("totalGuests", { valueAsNumber: true })}
                      />
                    </div>
                  </div>

                  {selectedProperty ? (
                    <motion.div
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.22 }}
                      className="overflow-hidden rounded-[1.4rem] border border-border/60 bg-muted/30"
                    >
                      <div className="flex flex-col sm:flex-row">
                        <div className="relative h-40 w-full overflow-hidden bg-muted sm:h-auto sm:w-52">
                          {selectedProperty.heroImageUrl ? (
                            <Image
                              src={selectedProperty.heroImageUrl}
                              alt={selectedProperty.publicName}
                              fill
                              className="object-cover"
                              sizes="(max-width: 640px) 100vw, 208px"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                              <Hotel className="h-6 w-6" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 space-y-3 p-4">
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge className="rounded-full border-0 bg-primary/10 text-primary">
                              Selected property
                            </Badge>
                            <Badge
                              className={cn(
                                "rounded-full border-0",
                                PRIORITY_STYLES[(selectedPriority || "MEDIUM") as "LOW" | "MEDIUM" | "HIGH"]
                              )}
                            >
                              {(selectedPriority || "MEDIUM").toLowerCase()} priority
                            </Badge>
                          </div>

                          <div>
                            <p className="text-lg font-semibold tracking-tight">
                              {selectedProperty.publicName}
                            </p>
                            <div className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                              <MapPin className="h-4 w-4" />
                              <span>
                                {[selectedProperty.city, selectedProperty.state]
                                  .filter(Boolean)
                                  .join(", ") || "Location not added"}
                              </span>
                            </div>
                          </div>

                          <p className="text-sm leading-6 text-muted-foreground">
                            This request will be attached to the selected property so
                            the sales or reservations team can act with proper context.
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  ) : null}
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, delay: 0.06, ease: "easeOut" }}
            >
              <Card className="rounded-[2rem] border border-border/60 bg-card shadow-sm">
                <CardContent className="space-y-4 p-4 sm:p-5">
                  <SectionHeader
                    icon={<NotebookPen className="h-5 w-5" />}
                    title="Requirement notes"
                    description="Add context that helps the hotel respond faster and more accurately."
                  />

                  <div className="space-y-2">
                    <LabelText>Special notes</LabelText>
                    <Textarea
                      className="min-h-32 rounded-[1.35rem] resize-none"
                      placeholder="Example: 12 deluxe rooms + 4 premium rooms, early check-in preferred, airport transfers may be needed, meal plan preference, target budget..."
                      {...register("requirementText")}
                    />
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.28, delay: 0.09, ease: "easeOut" }}
            >
              <Card className="rounded-[2rem] border border-border/60 bg-card shadow-sm">
                <CardContent className="space-y-4 p-4 sm:p-5">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
                    <SectionHeader
                      icon={<BedDouble className="h-5 w-5" />}
                      title="Room lines"
                      description="Break the request into room types, occupancy, count, and optional target rate."
                    />

                    <Button
                      type="button"
                      variant="outline"
                      className="h-11 rounded-2xl"
                      onClick={() =>
                        append({
                          roomTypeName: "",
                          occupancy: 2,
                          roomCount: 1,
                        })
                      }
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add room line
                    </Button>
                  </div>

                  <div className="rounded-[1.35rem] border border-border/60 bg-muted/25 p-3.5">
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                      <MiniStat
                        label="Lines"
                        value={`${lineCount}`}
                        icon={<Sparkles className="h-4 w-4" />}
                      />
                      <MiniStat
                        label="Line rooms"
                        value={`${summedLineRooms}`}
                        icon={<Hotel className="h-4 w-4" />}
                      />
                      <MiniStat
                        label="Total rooms"
                        value={`${totalRoomsRequired || 0}`}
                        icon={<BedDouble className="h-4 w-4" />}
                      />
                      <MiniStat
                        label="Guests"
                        value={`${totalGuests || 0}`}
                        icon={<Users className="h-4 w-4" />}
                      />
                    </div>
                  </div>

                  <div className="space-y-3">
                    <AnimatePresence initial={false}>
                      {fields.map((field, index) => {
                        const line = lines?.[index];
                        const lineRooms = Number(line?.roomCount || 0);
                        const lineOcc = Number(line?.occupancy || 0);
                        const lineTarget = Number(line?.targetRate || 0);

                        return (
                          <motion.div
                            key={field.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden rounded-[1.5rem] border border-border/60 bg-background"
                          >
                            <div className="flex flex-col gap-3 border-b border-border/60 bg-muted/25 p-3.5 sm:flex-row sm:items-center sm:justify-between">
                              <div className="flex flex-wrap items-center gap-2">
                                <Badge className="rounded-full border-0 bg-primary/10 text-primary">
                                  Line {index + 1}
                                </Badge>
                                <p className="text-sm font-medium text-foreground">
                                  {line?.roomTypeName?.trim()
                                    ? line.roomTypeName
                                    : "Room type not named yet"}
                                </p>
                              </div>

                              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <span>{lineRooms || 0} room(s)</span>
                                <span>•</span>
                                <span>{lineOcc || 0} pax</span>
                                {lineTarget > 0 ? (
                                  <>
                                    <span>•</span>
                                    <span>₹{lineTarget}</span>
                                  </>
                                ) : null}
                              </div>
                            </div>

                            <div className="grid gap-3 p-3.5 md:grid-cols-2 xl:grid-cols-5">
                              <div className="space-y-2 xl:col-span-2">
                                <LabelText>Room type</LabelText>
                                <Input
                                  className="h-11 rounded-2xl"
                                  placeholder="Deluxe / Premium / Family Suite"
                                  {...register(`lines.${index}.roomTypeName`)}
                                />
                              </div>

                              <div className="space-y-2">
                                <LabelText>Occupancy</LabelText>
                                <Input
                                  type="number"
                                  min={1}
                                  className="h-11 rounded-2xl"
                                  placeholder="2"
                                  {...register(`lines.${index}.occupancy`, {
                                    valueAsNumber: true,
                                  })}
                                />
                              </div>

                              <div className="space-y-2">
                                <LabelText>Room count</LabelText>
                                <Input
                                  type="number"
                                  min={1}
                                  className="h-11 rounded-2xl"
                                  placeholder="1"
                                  {...register(`lines.${index}.roomCount`, {
                                    valueAsNumber: true,
                                  })}
                                />
                              </div>

                              <div className="space-y-2">
                                <LabelText>Target rate</LabelText>
                                <div className="relative">
                                  <IndianRupee className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                                  <Input
                                    type="number"
                                    min={0}
                                    className="h-11 rounded-2xl pl-9"
                                    placeholder="Optional"
                                    {...register(`lines.${index}.targetRate`, {
                                      valueAsNumber: true,
                                    })}
                                  />
                                </div>
                              </div>
                            </div>

                            <div className="border-t border-border/60 bg-background/80 p-3.5">
                              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                <p className="text-xs leading-5 text-muted-foreground">
                                  Use separate lines when you want different room
                                  types, occupancy patterns, or budget targets.
                                </p>

                                <Button
                                  type="button"
                                  variant="ghost"
                                  className="h-10 justify-start rounded-2xl text-destructive hover:bg-destructive/10 hover:text-destructive sm:justify-center"
                                  onClick={() => remove(index)}
                                  disabled={fields.length === 1}
                                >
                                  <Trash2 className="mr-2 h-4 w-4" />
                                  Remove line
                                </Button>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>

                  {errors.lines ? (
                    <Alert className="rounded-[1.3rem] border-destructive/30 bg-destructive/5 text-destructive">
                      <AlertTitle>Room lines need attention</AlertTitle>
                      <AlertDescription>
                        At least one valid room line is required before submission.
                      </AlertDescription>
                    </Alert>
                  ) : null}
                </CardContent>
              </Card>
            </motion.div>

            {error ? (
              <Alert className="rounded-[1.3rem] border-destructive/30 bg-destructive/5 text-destructive">
                <AlertTitle>Unable to create quote</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}
          </div>

          <motion.aside
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, delay: 0.12, ease: "easeOut" }}
            className="space-y-5 xl:sticky xl:top-24 xl:self-start"
          >
            <Card className="overflow-hidden rounded-[2rem] border border-border/60 bg-card shadow-sm">
              <CardContent className="p-0">
                <div className="border-b border-border/60 bg-primary/[0.04] p-4 sm:p-5">
                  <div className="mb-3 flex items-center gap-2">
                    <Badge className="rounded-full border-0 bg-primary/10 text-primary">
                      Submission summary
                    </Badge>
                    <Badge
                      className={cn(
                        "rounded-full border-0",
                        PRIORITY_STYLES[(selectedPriority || "MEDIUM") as "LOW" | "MEDIUM" | "HIGH"]
                      )}
                    >
                      {(selectedPriority || "MEDIUM").toLowerCase()}
                    </Badge>
                  </div>

                  <h2 className="text-xl font-semibold tracking-tight">
                    Review before sending
                  </h2>
                  <p className="mt-1 text-sm leading-6 text-muted-foreground">
                    A clean requirement summary for your team and the hotel to work from.
                  </p>
                </div>

                <div className="space-y-4 p-4 sm:p-5">
                  {selectedProperty ? (
                    <div className="overflow-hidden rounded-[1.3rem] border border-border/60 bg-muted/20">
                      <div className="relative h-40 w-full bg-muted">
                        {selectedProperty.heroImageUrl ? (
                          <Image
                            src={selectedProperty.heroImageUrl}
                            alt={selectedProperty.publicName}
                            fill
                            className="object-cover"
                            sizes="(max-width: 1280px) 100vw, 420px"
                          />
                        ) : (
                          <div className="flex h-full items-center justify-center text-muted-foreground">
                            <Hotel className="h-6 w-6" />
                          </div>
                        )}
                      </div>
                      <div className="space-y-1 p-3.5">
                        <p className="font-semibold">{selectedProperty.publicName}</p>
                        <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>
                            {[selectedProperty.city, selectedProperty.state]
                              .filter(Boolean)
                              .join(", ") || "Location not added"}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-[1.3rem] border border-dashed border-border/70 bg-muted/20 p-4 text-center">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-background text-primary">
                        <Hotel className="h-5 w-5" />
                      </div>
                      <p className="mt-3 text-sm font-medium">No property selected yet</p>
                      <p className="mt-1 text-xs leading-5 text-muted-foreground">
                        Choose a property to anchor this requirement in the correct hotel context.
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-3">
                    <SummaryTile
                      icon={<CalendarDays className="h-4 w-4" />}
                      label="Check-in"
                      value={selectedCheckIn ? formatDateLabel(selectedCheckIn) : "--"}
                    />
                    <SummaryTile
                      icon={<CalendarDays className="h-4 w-4" />}
                      label="Check-out"
                      value={selectedCheckOut ? formatDateLabel(selectedCheckOut) : "--"}
                    />
                    <SummaryTile
                      icon={<Hotel className="h-4 w-4" />}
                      label="Total rooms"
                      value={`${totalRoomsRequired || 0}`}
                    />
                    <SummaryTile
                      icon={<Users className="h-4 w-4" />}
                      label="Total guests"
                      value={`${totalGuests || 0}`}
                    />
                    <SummaryTile
                      icon={<BedDouble className="h-4 w-4" />}
                      label="Room lines"
                      value={`${lineCount}`}
                    />
                    <SummaryTile
                      icon={<Sparkles className="h-4 w-4" />}
                      label="Stay length"
                      value={nights > 0 ? `${nights} night${nights > 1 ? "s" : ""}` : "--"}
                    />
                  </div>

                  <div className="rounded-[1.3rem] border border-border/60 bg-muted/25 p-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                        <ShieldCheck className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold">What happens next</p>
                        <p className="mt-1 text-xs leading-5 text-muted-foreground sm:text-sm">
                          Once submitted, the requirement can be tracked through
                          your quote workflow and converted into an actionable hotel response.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="hidden xl:block">
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="h-12 w-full rounded-2xl text-sm font-medium shadow-sm"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Submitting requirement
                        </>
                      ) : (
                        "Submit requirement"
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {propertiesLoading ? (
              <ZenvanaLoading
                variant="section"
                title="Loading properties"
                description="Preparing hotel options for your request flow."
              />
            ) : null}
          </motion.aside>

          <div className="fixed inset-x-0 bottom-0 z-40 border-t border-border/70 bg-background/92 p-3 backdrop-blur xl:hidden">
            <div className="mx-auto flex max-w-7xl items-center gap-3">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {selectedProperty?.publicName || "Bulk requirement"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {lineCount} line{lineCount > 1 ? "s" : ""} • {totalRoomsRequired || 0} room
                  {Number(totalRoomsRequired || 0) > 1 ? "s" : ""}
                </p>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="h-12 rounded-2xl px-5 text-sm font-medium"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Submitting
                  </>
                ) : (
                  "Submit requirement"
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>

      {isSubmitting ? (
        <ZenvanaLoading
          variant="overlay"
          title="Submitting quote request"
          description="Packaging room details, guest count, dates, and notes for the next step."
        />
      ) : null}
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
  return (
    <label className="text-sm font-medium text-foreground">
      {children}
    </label>
  );
}

function TopPill({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-background/80 px-3 py-2.5">
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

function SummaryTile({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
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

function MiniStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-background p-3">
      <div className="flex items-start gap-2.5">
        <div className="mt-0.5 text-primary">{icon}</div>
        <div>
          <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          <p className="mt-1 text-sm font-semibold">{value}</p>
        </div>
      </div>
    </div>
  );
}

function DatePickerField({
  value,
  placeholder,
  onSelect,
  disabled,
}: {
  value?: string;
  placeholder: string;
  onSelect: (date?: Date) => void;
  disabled?: (date: Date) => boolean;
}) {
  const parsed = safeParseDate(value);

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className={cn(
            "h-12 w-full justify-between rounded-2xl px-3 font-normal",
            !parsed && "text-muted-foreground"
          )}
        >
          <span className="flex items-center gap-2 truncate">
            <CalendarIcon className="h-4 w-4 shrink-0" />
            <span className="truncate">
              {parsed ? format(parsed, "PPP") : placeholder}
            </span>
          </span>
          <ChevronDown className="h-4 w-4 shrink-0 opacity-60" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        className="w-auto rounded-[1.25rem] border border-border/60 p-0"
      >
        <Calendar
          mode="single"
          selected={parsed}
          onSelect={onSelect}
          disabled={disabled}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}