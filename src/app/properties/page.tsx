"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowRight,
  Building2,
  Camera,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  ImageIcon,
  MapPin,
  RefreshCcw,
  Search,
} from "lucide-react";

import ProtectedShell from "@/components/b2b/ProtectedShell";
import { b2bProperties, type B2BProperty } from "@/lib/b2b-api";
import ZenvanaLoading from "@/components/Zenvanaloading";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/Card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { normalizeGalleryImages } from "@/lib/media";

const heroSlideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 70 : -70,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -70 : 70,
    opacity: 0,
  }),
};

export default function PropertiesPage() {
  const [rows, setRows] = useState<B2BProperty[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        setLoading(true);
        setError(null);
        const data = await b2bProperties();
        if (!active) return;
        setRows(data);
      } catch (e: any) {
        if (!active) return;
        setError(e?.message || "Failed to load properties.");
      } finally {
        if (!active) return;
        setLoading(false);
      }
    }

    load();

    return () => {
      active = false;
    };
  }, []);

  return (
    <ProtectedShell>
      <div className="mx-auto w-full max-w-6xl">
        <div className="space-y-5 sm:space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.28, ease: "easeOut" }}
            className="overflow-hidden rounded-3xl border border-border/60 bg-card/80 shadow-sm backdrop-blur"
          >
            <div className="relative p-4 sm:p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div className="min-w-0">
                  <div className="mb-3 flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <Building2 className="h-5 w-5" />
                    </div>
                    <Badge
                      variant="secondary"
                      className="rounded-full px-3 py-1 text-[11px] font-medium"
                    >
                      B2B Travel Desk
                    </Badge>
                  </div>

                  <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                    Choose a property
                  </h1>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">
                    Start with the hotel your client wants. Open rates and inventory
                    to check availability and compare options.
                  </p>
                </div>

                {/* {!loading && !error && rows.length > 0 ? (
                  <div className="shrink-0">
                    <Badge
                      variant="outline"
                      className="rounded-full px-3 py-2 text-xs font-medium"
                    >
                      {rows.length} {rows.length === 1 ? "property" : "properties"}
                    </Badge>
                  </div>
                ) : null} */}
              </div>
            </div>
          </motion.div>

          {loading ? (
            <ZenvanaLoading
              variant="section"
              title="Loading partner properties"
              description="Fetching property cards, images, and location data for your agency."
            />
          ) : error ? (
            <ErrorState message={error} />
          ) : rows.length === 0 ? (
            <EmptyState />
          ) : (
            <motion.div
              initial="hidden"
              animate="show"
              variants={{
                hidden: {},
                show: {
                  transition: {
                    staggerChildren: 0.06,
                  },
                },
              }}
              className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-2"
            >
              {rows.map((p) => (
                <motion.div
                  key={p.id}
                  variants={{
                    hidden: { opacity: 0, y: 14 },
                    show: { opacity: 1, y: 0 },
                  }}
                  transition={{ duration: 0.24, ease: "easeOut" }}
                >
                  <PropertyCard property={p} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </div>
      </div>
    </ProtectedShell>
  );
}

function PropertyCard({ property }: { property: B2BProperty }) {
  const location = [property.city, property.state].filter(Boolean).join(", ");
  const parsedCoordsFromMapUrl = useMemo(
    () => parseCoordsFromGoogleMapUrl(property.googleMapPlaceUrl),
    [property.googleMapPlaceUrl]
  );
  const mapLatitude = property.latitude ?? parsedCoordsFromMapUrl?.lat;
  const mapLongitude = property.longitude ?? parsedCoordsFromMapUrl?.lng;
  const hasCoordinates = Number.isFinite(mapLatitude) && Number.isFinite(mapLongitude);
  const mapsUrl = property.googleMapPlaceUrl
    ? property.googleMapPlaceUrl
    : hasCoordinates
      ? `https://www.google.com/maps?q=${mapLatitude},${mapLongitude}`
      : null;
  const mapEmbedUrl = hasCoordinates
    ? `https://www.google.com/maps?q=${mapLatitude},${mapLongitude}&z=14&output=embed`
    : null;
  const propertyImages = useMemo(
    () => normalizeGalleryImages(property.images ?? []),
    [property.images]
  );
  const roomTypePhotos = useMemo(
    () =>
      (property.roomTypes ?? []).map((room) => ({
        id: room.id,
        name: room.name,
        images: normalizeGalleryImages(room.images ?? []),
      })),
    [property.roomTypes]
  );
  const heroFrames = useMemo(() => {
    const roomImages = roomTypePhotos.flatMap((room) => room.images);
    const merged = [...propertyImages, ...roomImages];
    const withHeroFirst = property.heroImageUrl
      ? [{ url: property.heroImageUrl }, ...merged]
      : merged;
    const uniqueByUrl = withHeroFirst.filter(
      (img, index, arr) => arr.findIndex((candidate) => candidate.url === img.url) === index
    );
    if (uniqueByUrl.length === 0) {
      return [];
    }
    return uniqueByUrl.slice(0, 12);
  }, [property.heroImageUrl, propertyImages, roomTypePhotos]);
  const [heroIndex, setHeroIndex] = useState(0);
  const [heroDirection, setHeroDirection] = useState(1);

  useEffect(() => {
    if (heroIndex >= heroFrames.length) setHeroIndex(0);
  }, [heroFrames.length, heroIndex]);
  return (
    <Card className="group overflow-hidden rounded-3xl border border-border/60 bg-card shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md">
      <CardContent className="p-0">
        <div className="flex h-full flex-col">
          <div className="relative aspect-[16/10] w-full overflow-hidden bg-muted">
            {heroFrames.length > 0 ? (
              <AnimatePresence mode="wait">
                <motion.div
                  key={heroFrames[heroIndex]?.url || property.publicName}
                  custom={heroDirection}
                  variants={heroSlideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.38, ease: "easeOut" }}
                  className="absolute inset-0"
                >
                  <Image
                    src={heroFrames[heroIndex].url}
                    alt={property.publicName}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    priority={false}
                  />
                </motion.div>
              </AnimatePresence>
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-muted">
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-background/70">
                    <ImageIcon className="h-5 w-5" />
                  </div>
                  <p className="text-xs font-medium">Image unavailable</p>
                </div>
              </div>
            )}

            {heroFrames.length > 1 ? (
              <>
                <button
                  type="button"
                  aria-label="Previous image"
                  onClick={() => {
                    setHeroDirection(-1);
                    setHeroIndex((prev) => (prev - 1 + heroFrames.length) % heroFrames.length);
                  }}
                  className="absolute left-3 top-1/2 z-10 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-white/15 text-white backdrop-blur-md transition hover:bg-white/25"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  aria-label="Next image"
                  onClick={() => {
                    setHeroDirection(1);
                    setHeroIndex((prev) => (prev + 1) % heroFrames.length);
                  }}
                  className="absolute right-3 top-1/2 z-10 inline-flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-white/30 bg-white/15 text-white backdrop-blur-md transition hover:bg-white/25"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </>
            ) : null}

            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent p-4">
              <div className="flex items-end justify-between gap-3">
                <div className="min-w-0">
                  <p className="line-clamp-2 text-base font-semibold text-white sm:text-lg">
                    {property.publicName}
                  </p>
                  {location ? (
                    <div className="mt-1 flex items-center gap-1.5 text-xs text-white/85 sm:text-sm">
                      <MapPin className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{location}</span>
                    </div>
                  ) : null}
                </div>

                <Badge className="shrink-0 rounded-full border-0 light:bg-white/90 dark:bg-black/90 px-3 py-1.5 text-[11px] font-medium text-foreground shadow-sm backdrop-blur">
                  Explore
                </Badge>
              </div>
            </div>

          </div>

          <div className="space-y-4 p-4 sm:p-5">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <InfoPill
                icon={<Building2 className="h-4 w-4" />}
                label="Property"
                value={property.publicName}
              />
              <InfoPill
                icon={<MapPin className="h-4 w-4" />}
                label="Location"
                value={location || "Location not added"}
              />
            </div>
            <div className="rounded-2xl border border-border/60 bg-muted/20 p-2.5">
              <div className="relative h-24 w-full overflow-hidden rounded-xl border border-border/60 bg-muted">
                {mapEmbedUrl ? (
                  <iframe
                    title={`${property.publicName} map preview`}
                    src={mapEmbedUrl}
                    className="h-full w-full"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                    Map preview unavailable (coordinates missing)
                  </div>
                )}
              </div>
              <div className="mt-2 flex justify-end">
                {mapsUrl ? (
                  <Button asChild size="sm" variant="secondary" className="h-8 rounded-lg px-3 text-xs">
                    <a href={mapsUrl} target="_blank" rel="noreferrer">
                      <MapPin className="mr-1.5 h-3.5 w-3.5" />
                      Open in Google Maps
                      <ExternalLink className="ml-1.5 h-3.5 w-3.5" />
                    </a>
                  </Button>
                ) : (
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    className="h-8 rounded-lg px-3 text-xs"
                    disabled
                  >
                    <MapPin className="mr-1.5 h-3.5 w-3.5" />
                    Map unavailable
                  </Button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <Button
                asChild
                size="lg"
                className="h-12 w-full rounded-2xl text-sm font-medium shadow-sm"
              >
                <Link href={`/properties/${property.slug}/rate-sheet`}>
                  Open rate sheet
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Sheet>
                <SheetTrigger asChild>
                  <Button
                    type="button"
                    size="lg"
                    variant="outline"
                    className="h-12 w-full rounded-2xl text-sm font-medium"
                  >
                    <Camera className="mr-2 h-4 w-4" />
                    View full gallery
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-full overflow-y-auto sm:max-w-3xl">
                  <SheetHeader>
                    <SheetTitle>{property.publicName}</SheetTitle>
                    <SheetDescription>
                      Property photos first, then room-type galleries.
                    </SheetDescription>
                  </SheetHeader>

                  <div className="mt-5 space-y-5">
                    <div>
                      <p className="mb-2 text-sm font-semibold">Property photos</p>
                      {propertyImages.length > 0 ? (
                        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                          {propertyImages.map((img, index) => (
                            <div
                              key={`${img.url}-${index}`}
                              className="relative aspect-[4/3] overflow-hidden rounded-xl border border-border/60 bg-muted"
                            >
                              <Image
                                src={img.url}
                                alt={`${property.publicName} property photo ${index + 1}`}
                                fill
                                className="object-cover"
                                sizes="(max-width: 640px) 100vw, 50vw"
                              />
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground">No property photos available.</p>
                      )}
                    </div>

                    <div className="space-y-4">
                      <p className="text-sm font-semibold">Room-type photos</p>
                      {roomTypePhotos.some((room) => room.images.length > 0) ? (
                        roomTypePhotos.map((room) => (
                          <div key={room.id}>
                            <p className="mb-2 text-sm font-medium">{room.name}</p>
                            {room.images.length > 0 ? (
                              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                                {room.images.map((img, index) => (
                                  <div
                                    key={`${room.id}-${img.url}-${index}`}
                                    className="relative aspect-square overflow-hidden rounded-lg border border-border/60 bg-muted"
                                  >
                                    <Image
                                      src={img.url}
                                      alt={`${room.name} photo ${index + 1}`}
                                      fill
                                      className="object-cover"
                                      sizes="(max-width: 640px) 50vw, 25vw"
                                    />
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-xs text-muted-foreground">No photos for this room type.</p>
                            )}
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-muted-foreground">
                          Room-type photos are not available yet.
                        </p>
                      )}
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function parseCoordsFromGoogleMapUrl(url?: string): { lat: number; lng: number } | null {
  if (!url) return null;
  const decoded = decodeURIComponent(url);
  const patterns = [
    /@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/,
    /[?&](?:q|query)=(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/,
    /!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/,
  ];

  for (const pattern of patterns) {
    const match = decoded.match(pattern);
    if (!match) continue;
    const lat = Number(match[1]);
    const lng = Number(match[2]);
    if (Number.isFinite(lat) && Number.isFinite(lng)) return { lat, lng };
  }

  return null;
}

function InfoPill({
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
      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          <p className="mt-1 line-clamp-2 text-sm font-medium leading-5 text-foreground">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

function PropertiesLoading() {
  return (
    <div className="grid grid-cols-1 gap-4 sm:gap-5 lg:grid-cols-2">
      {Array.from({ length: 4 }).map((_, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22, delay: i * 0.05 }}
        >
          <Card className="overflow-hidden rounded-3xl border border-border/60 bg-card shadow-sm">
            <CardContent className="p-0">
              <Skeleton className="aspect-[16/10] w-full" />
              <div className="space-y-4 p-4 sm:p-5">
                <div className="space-y-2">
                  <Skeleton className="h-6 w-40 rounded-xl" />
                  <Skeleton className="h-4 w-56 rounded-xl" />
                </div>

                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  <div className="rounded-2xl border border-border/60 p-3">
                    <div className="flex items-start gap-3">
                      <Skeleton className="h-9 w-9 rounded-xl" />
                      <div className="w-full space-y-2">
                        <Skeleton className="h-3 w-20 rounded-xl" />
                        <Skeleton className="h-4 w-32 rounded-xl" />
                      </div>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-border/60 p-3">
                    <div className="flex items-start gap-3">
                      <Skeleton className="h-9 w-9 rounded-xl" />
                      <div className="w-full space-y-2">
                        <Skeleton className="h-3 w-20 rounded-xl" />
                        <Skeleton className="h-4 w-36 rounded-xl" />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-border/60 p-3.5">
                  <Skeleton className="h-4 w-36 rounded-xl" />
                  <Skeleton className="mt-2 h-3 w-full rounded-xl" />
                  <Skeleton className="mt-2 h-3 w-4/5 rounded-xl" />
                </div>

                <Skeleton className="h-12 w-full rounded-2xl" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

function ErrorState({ message }: { message: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
    >
      <Card className="rounded-3xl border-destructive/30 bg-destructive/5 shadow-sm">
        <CardContent className="flex flex-col items-start gap-4 p-5 sm:p-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-destructive/10 text-destructive">
            <RefreshCcw className="h-5 w-5" />
          </div>

          <div>
            <h2 className="text-base font-semibold sm:text-lg">
              Unable to load properties
            </h2>
            <p className="mt-1 text-sm leading-6 text-muted-foreground">
              {message}
            </p>
          </div>

          <Button onClick={() => window.location.reload()} size="lg" className="rounded-2xl">
            Try again
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  );
}

function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
    >
      <Card className="rounded-3xl border border-dashed border-border/70 bg-card shadow-sm">
        <CardContent className="flex flex-col items-center justify-center px-5 py-12 text-center sm:px-6 sm:py-16">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <Search className="h-6 w-6" />
          </div>

          <h2 className="mt-4 text-lg font-semibold">No properties found</h2>
          <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
            We couldn’t find any properties for this account right now. Please try
            again later or contact support if this keeps happening.
          </p>
        </CardContent>
      </Card>
    </motion.div>
  );
}