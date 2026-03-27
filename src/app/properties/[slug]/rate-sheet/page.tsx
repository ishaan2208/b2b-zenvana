"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { addDays, format, isAfter, isBefore, parseISO, startOfToday } from "date-fns";
import type { ColumnDef } from "@tanstack/react-table";
import { flexRender, getCoreRowModel, useReactTable } from "@tanstack/react-table";
import {
  ArrowRight,
  CalendarDays,
  CalendarIcon,
  ChevronDown,
  ImageIcon,
  Loader2,
  RefreshCcw,
  Users,
} from "lucide-react";
import type { z } from "zod";

import ProtectedShell from "@/components/b2b/ProtectedShell";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent } from "@/components/ui/Card";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { b2bRateSheet, type B2BRateSheet } from "@/lib/b2b-api";
import { normalizeGalleryImages } from "@/lib/media";
import { ratesFilterSchema } from "@/lib/b2b-schemas";
import ZenvanaLoading from "@/components/Zenvanaloading";
import { cn } from "@/lib/utils";

type FormData = z.infer<typeof ratesFilterSchema>;

type RateSheetRow = {
  roomTypeId: number;
  roomTypeName: string;
  roomImages: ReturnType<typeof normalizeGalleryImages>;
  ratePlanName: string;
  mealPlan: string;
  occupancy: number | null;
  availableRoomsMin: number;
  avgB2BRate: number;
  b2bTotalRate: number;
  ratesByDate: B2BRateSheet["rows"][number]["ratesByDate"];
};

function todayPlus(days: number) {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function safeParseDate(value?: string) {
  if (!value) return undefined;
  try {
    return parseISO(value);
  } catch {
    return undefined;
  }
}

const formatINR = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);

export default function PropertyRateSheetPage() {
  const { slug } = useParams<{ slug: string }>();
  const [result, setResult] = useState<B2BRateSheet | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [fallbackNote, setFallbackNote] = useState<string | null>(null);
  const [hasSearched, setHasSearched] = useState(false);
  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(ratesFilterSchema),
    defaultValues: {
      checkIn: todayPlus(1),
      checkOut: todayPlus(3),
      occupancy: 2,
    },
  });

  const selectedCheckIn = watch("checkIn");
  const selectedCheckOut = watch("checkOut");

  useEffect(() => {
    const checkInDate = safeParseDate(selectedCheckIn);
    const checkOutDate = safeParseDate(selectedCheckOut);
    if (!checkInDate || !checkOutDate) return;

    if (!isAfter(checkOutDate, checkInDate)) {
      setValue("checkOut", format(addDays(checkInDate, 1), "yyyy-MM-dd"), {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  }, [selectedCheckIn, selectedCheckOut, setValue]);

  const onSubmit = handleSubmit(async (values) => {
    setHasSearched(true);
    setError(null);
    setFallbackNote(null);
    try {
      let data = await b2bRateSheet(slug, values.checkIn, values.checkOut, values.occupancy);

      const shouldFallbackToTwoOcc =
        values.occupancy === 3 &&
        (data.rows.length === 0 || !data.rows.some((row) => row.occupancy === 3));

      if (shouldFallbackToTwoOcc) {
        data = await b2bRateSheet(slug, values.checkIn, values.checkOut, 2);
        setValue("occupancy", 2, { shouldDirty: true, shouldValidate: true });
        setFallbackNote("3 occupancy plans were unavailable, so 2 occupancy plans are shown.");
      }

      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load rate sheet");
      setResult(null);
    }
  });

  const tableData = useMemo<RateSheetRow[]>(
    () =>
      result?.rows.map((row) => ({
        roomTypeId: row.roomTypeId,
        roomTypeName: row.roomTypeName,
        roomImages: normalizeGalleryImages(row.images),
        ratePlanName: row.ratePlanName,
        mealPlan: row.mealPlan,
        occupancy: row.occupancy,
        availableRoomsMin: row.availableRoomsMin,
        avgB2BRate: row.avgB2BRate,
        b2bTotalRate: row.b2bTotalRate,
        ratesByDate: row.ratesByDate,
      })) ?? [],
    [result]
  );

  const columns = useMemo<ColumnDef<RateSheetRow>[]>(() => {
    const baseCols: ColumnDef<RateSheetRow>[] = [
      {
        accessorKey: "roomTypeName",
        header: "Room type",
        cell: ({ row }) => (
          <div className="min-w-44 font-medium">{row.original.roomTypeName}</div>
        ),
      },
      {
        accessorKey: "ratePlanName",
        header: "Rate plan",
        cell: ({ row }) => (
          <div className="min-w-36">
            <p className="font-medium">{row.original.ratePlanName}</p>
            <p className="text-xs text-muted-foreground">{row.original.mealPlan}</p>
          </div>
        ),
      },
      {
        accessorKey: "occupancy",
        header: "Occ",
        cell: ({ row }) => (
          <span className="text-xs text-muted-foreground">
            {row.original.occupancy ? `${row.original.occupancy} pax` : "-"}
          </span>
        ),
      },
      {
        accessorKey: "availableRoomsMin",
        header: "Min inv",
        cell: ({ row }) => <span className="text-xs">{row.original.availableRoomsMin}</span>,
      },
      {
        id: "photos",
        header: "Photos",
        cell: ({ row }) => (
          <RoomPhotosSheetButton
            roomTypeName={row.original.roomTypeName}
            images={row.original.roomImages}
          />
        ),
      },
    ];

    const dateCols =
      result?.dates.map((date) => ({
        id: `d_${date}`,
        header: () => (
          <div className="min-w-24">
            <p className="text-xs font-medium text-foreground">{format(new Date(date), "dd MMM")}</p>
            <p className="text-[11px] text-muted-foreground">{format(new Date(date), "EEE")}</p>
          </div>
        ),
        cell: ({ row }: { row: { original: RateSheetRow } }) => {
          const nightly = row.original.ratesByDate[date]?.b2bRate;
          if (nightly == null) return <span className="text-xs text-muted-foreground">-</span>;
          return <span className="text-xs font-medium">{formatINR(nightly)}</span>;
        },
      })) ?? [];

    return [...baseCols, ...dateCols];
  }, [result]);

  const table = useReactTable({
    data: tableData,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const selectedOcc = watch("occupancy") || 2;
  return (
    <ProtectedShell>
      <div className="mx-auto w-full max-w-[1200px] space-y-5">
        <section className="rounded-3xl border border-border/60 bg-card p-4 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="mb-2 flex items-center gap-2">
                <Badge className="rounded-full border-0 bg-primary/10 text-primary">Rate sheet</Badge>
                {result ? (
                  <Badge variant="outline" className="rounded-full">
                    {result.property.publicName}
                  </Badge>
                ) : null}
              </div>
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                Travel agent rate matrix
              </h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Choose stay dates and occupancy, then compare nightly B2B rates by room type and rate
                plan.
              </p>
            </div>
          </div>
        </section>

        <form
          onSubmit={onSubmit}
          className="grid grid-cols-1 gap-3 rounded-3xl border border-border/60 bg-card p-4 shadow-sm md:grid-cols-4"
        >
          <label className="space-y-1">
            <span className="text-xs font-medium text-muted-foreground">Check-in</span>
            <Controller
              control={control}
              name="checkIn"
              render={({ field }) => (
                <DatePickerField
                  value={field.value}
                  placeholder="Pick check-in date"
                  onSelect={(date) => {
                    field.onChange(date ? format(date, "yyyy-MM-dd") : "");
                  }}
                  disabled={(date) => isBefore(date, startOfToday())}
                />
              )}
            />
            {errors.checkIn ? (
              <span className="text-xs text-destructive">{errors.checkIn.message}</span>
            ) : null}
          </label>
          <label className="space-y-1">
            <span className="text-xs font-medium text-muted-foreground">Check-out</span>
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
                    return !isAfter(date, checkInDate);
                  }}
                />
              )}
            />
            {errors.checkOut ? (
              <span className="text-xs text-destructive">{errors.checkOut.message}</span>
            ) : null}
          </label>
          <label className="space-y-1">
            <span className="text-xs font-medium text-muted-foreground">Occupancy</span>
            <Controller
              control={control}
              name="occupancy"
              render={({ field }) => (
                <Select
                  value={String(field.value ?? 2)}
                  onValueChange={(value) => field.onChange(Number(value))}
                >
                  <SelectTrigger className="h-10 rounded-xl">
                    <SelectValue placeholder="Select occupancy" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 pax</SelectItem>
                    <SelectItem value="2">2 pax</SelectItem>
                    <SelectItem value="3">3 pax</SelectItem>
                  </SelectContent>
                </Select>
              )}
            />
          </label>
          <div className="flex items-end">
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Loading
                </>
              ) : (
                <>
                  Show rate sheet
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </form>

        <Card className="rounded-3xl border border-border/60">
          <CardContent className="space-y-4 p-4 sm:p-5">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap items-center gap-2">
                {[1, 2, 3].map((occ) => (
                  <Button
                    key={occ}
                    type="button"
                    size="sm"
                    variant={selectedOcc === occ ? "default" : "outline"}
                    onClick={async () => {
                      setValue("occupancy", occ);
                      if (hasSearched) {
                        await onSubmit();
                      }
                    }}
                  >
                    <Users className="mr-1 h-3.5 w-3.5" />
                    {occ} pax
                  </Button>
                ))}
              </div>
              <Button type="button" variant="ghost" size="sm" onClick={() => onSubmit()}>
                <RefreshCcw className="mr-2 h-3.5 w-3.5" />
                Refresh
              </Button>
            </div>

            {error ? (
              <Alert className="border-destructive/30 bg-destructive/5 text-destructive">
                <AlertTitle>Unable to load rate sheet</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}
            {fallbackNote ? (
              <Alert className="border-primary/20 bg-primary/5 text-foreground">
                <AlertTitle>Occupancy fallback applied</AlertTitle>
                <AlertDescription>{fallbackNote}</AlertDescription>
              </Alert>
            ) : null}

            {isSubmitting && !result ? (
              <ZenvanaLoading
                variant="section"
                title="Loading rates"
                description="Building your date-wise matrix for the selected occupancy."
              />
            ) : null}

            {!hasSearched && !isSubmitting ? (
              <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-6 text-center">
                <p className="text-sm font-medium">Search to load the matrix</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  The table will show dates as columns and rate plans as rows.
                </p>
              </div>
            ) : null}

            {result && tableData.length > 0 ? (
              <>
                <div className="space-y-3 md:hidden">
                  {tableData.map((row, index) => (
                    <MobileRatePlanCard
                      key={`${row.roomTypeId}-${row.ratePlanName}-${index}`}
                      row={row}
                      dates={result.dates}
                    />
                  ))}
                </div>

                <div className="-mx-4 hidden overflow-x-auto rounded-2xl border border-border/60 sm:mx-0 md:block">
                  <Table className="min-w-[980px]">
                    <TableHeader className="bg-muted/50">
                      {table.getHeaderGroups().map((headerGroup) => (
                        <TableRow key={headerGroup.id}>
                          {headerGroup.headers.map((header) => (
                            <TableHead
                              key={header.id}
                              className={getStickyClass(header.column.getIndex(), true)}
                            >
                              {header.isPlaceholder
                                ? null
                                : flexRender(
                                    header.column.columnDef.header,
                                    header.getContext()
                                  )}
                            </TableHead>
                          ))}
                        </TableRow>
                      ))}
                    </TableHeader>
                    <TableBody>
                      {table.getRowModel().rows.map((row) => (
                        <TableRow key={row.id}>
                          {row.getVisibleCells().map((cell) => (
                            <TableCell
                              key={cell.id}
                              className={getStickyClass(cell.column.getIndex(), false)}
                            >
                              {flexRender(cell.column.columnDef.cell, cell.getContext())}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </ProtectedShell>
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
            "h-10 w-full justify-between rounded-xl px-3 font-normal",
            !parsed && "text-muted-foreground"
          )}
        >
          <span className="flex items-center gap-2 truncate">
            <CalendarIcon className="h-4 w-4 shrink-0" />
            <span className="truncate">{parsed ? format(parsed, "PPP") : placeholder}</span>
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

function RoomPhotosSheetButton({
  roomTypeName,
  images,
}: {
  roomTypeName: string;
  images: ReturnType<typeof normalizeGalleryImages>;
}) {
  const hasImages = images.length > 0;

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-8 rounded-lg"
          disabled={!hasImages}
        >
          <ImageIcon className="mr-1.5 h-3.5 w-3.5" />
          {hasImages ? "View" : "No photos"}
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-2xl">
        <SheetHeader>
          <SheetTitle>{roomTypeName} photos</SheetTitle>
          <SheetDescription>
            {hasImages ? `${images.length} photos available` : "No photos available"}
          </SheetDescription>
        </SheetHeader>
        {hasImages ? (
          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {images.map((img, index) => (
              <div
                key={`${img.url}-${index}`}
                className="relative aspect-[4/3] overflow-hidden rounded-xl border border-border/60 bg-muted"
              >
                <Image
                  src={img.url}
                  alt={`${roomTypeName} photo ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 100vw, 50vw"
                />
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-muted-foreground">No room photos available yet.</p>
        )}
      </SheetContent>
    </Sheet>
  );
}

function MobileRatePlanCard({
  row,
  dates,
}: {
  row: RateSheetRow;
  dates: string[];
}) {
  return (
    <div className="rounded-2xl border border-border/60 bg-background p-3.5">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">{row.roomTypeName}</p>
          <p className="text-xs text-muted-foreground">
            {row.ratePlanName} • {row.mealPlan}
          </p>
        </div>
        <RoomPhotosSheetButton roomTypeName={row.roomTypeName} images={row.roomImages} />
      </div>

      <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted-foreground">
        <span className="rounded-full border border-border/60 px-2 py-0.5">
          {row.occupancy ? `${row.occupancy} pax` : "NA"}
        </span>
        <span className="rounded-full border border-border/60 px-2 py-0.5">
          Min inv {row.availableRoomsMin}
        </span>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2">
        {dates.map((date) => {
          const rate = row.ratesByDate[date]?.b2bRate;
          return (
            <div key={date} className="rounded-xl border border-border/60 bg-muted/20 px-2.5 py-2">
              <p className="text-[11px] text-muted-foreground">{format(parseISO(date), "dd MMM")}</p>
              <p className="text-sm font-semibold">{rate != null ? formatINR(rate) : "-"}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function getStickyClass(index: number, isHeader: boolean) {
  const baseBg = isHeader ? "bg-muted/90" : "bg-background";
  if (index === 0) return `min-w-44 md:sticky md:left-0 md:z-20 ${baseBg}`;
  if (index === 1) return `min-w-36 md:sticky md:left-44 md:z-10 ${baseBg}`;
  return "whitespace-nowrap";
}
