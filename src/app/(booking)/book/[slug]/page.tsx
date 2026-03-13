import type { ReactNode } from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import {
  ArrowLeft,
  BadgeCheck,
  BedDouble,
  CalendarDays,
  Camera,
  MapPin,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'

import { getPublicPropertyBySlug } from '@/lib/api'
import { Container } from '@/components/Container'
import { EmblaImageGallery } from '@/components/EmblaImageGallery'
import { pickHeroAndGallery } from '@/lib/media'
import { BookSearchForm } from './BookSearchForm'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

type Props = { params: Promise<{ slug: string }> }

export default async function BookPropertyPage({ params }: Props) {
  const { slug } = await params
  const property = await getPublicPropertyBySlug(slug)
  if (!property) notFound()

  const { heroUrl, gallery } = pickHeroAndGallery(property.images)
  const imageUrls = Array.from(
    new Set([heroUrl, ...gallery.map((image) => image.url)].filter(Boolean) as string[])
  )

  const bookingGallery = imageUrls.slice(0, 8).map((url, index) => ({
    url,
    alt: `${property.publicName} photo ${index + 1}`,
  }))

  const location = [property.city, property.state].filter(Boolean).join(', ')
  const roomCount = property.roomTypes?.length ?? 0

  return (
    <main className="relative min-h-screen overflow-x-clip bg-background text-foreground">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(120,119,198,0.10),transparent_30%),radial-gradient(circle_at_80%_10%,rgba(56,189,248,0.08),transparent_24%),radial-gradient(circle_at_bottom_right,rgba(168,85,247,0.08),transparent_28%)]" />

      <Container className="relative py-4 sm:py-6 lg:py-10">
        <Link
          href={`/hotels/${slug}`}
          className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/70 px-4 py-2 text-sm font-medium text-foreground/80 backdrop-blur-xl transition hover:text-foreground dark:bg-background/40"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to property
        </Link>

        <PropertyBookingHeader
          propertyName={property.publicName}
          description={property.descriptionShort}
          location={location}
          heroUrl={heroUrl}
          imageCount={bookingGallery.length}
          roomCount={roomCount}
        />

        <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.05fr)_420px] xl:items-start xl:gap-8">
          <aside className="order-1 xl:sticky xl:top-8">
            <BookSearchForm
              slug={slug}
              propertyName={property.publicName}
              location={location}
            />
          </aside>

          <div className="order-2 space-y-6">
            <section className="overflow-hidden rounded-[2rem] border border-border/60 bg-background/55 shadow-[0_24px_70px_rgba(8,17,31,0.08)] backdrop-blur-2xl dark:bg-background/30">
              <div className="p-4 sm:p-5 lg:p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="max-w-2xl">
                    <Badge className="rounded-full border border-border/70 bg-background/70 px-3 py-1 text-[10px] uppercase tracking-[0.26em] text-muted-foreground shadow-none dark:bg-background/40">
                      <Camera className="mr-1.5 h-3.5 w-3.5" />
                      Property gallery
                    </Badge>

                    <h2 className="mt-4 font-serif text-2xl leading-tight tracking-[-0.04em] text-foreground sm:text-3xl">
                      Review the stay before you choose your dates.
                    </h2>

                    <p className="mt-3 max-w-xl text-sm leading-7 text-muted-foreground sm:text-base">
                      The booking flow stays simple, but the imagery still does the trust-building.
                      Browse the property, then lock in your dates and occupancy in one clean step.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {location ? (
                      <GlassPill icon={<MapPin className="h-3.5 w-3.5" />} text={location} />
                    ) : null}
                    <GlassPill
                      icon={<ShieldCheck className="h-3.5 w-3.5" />}
                      text="Direct booking benefits"
                    />
                    <GlassPill
                      icon={<BadgeCheck className="h-3.5 w-3.5" />}
                      text={`${bookingGallery.length} photos`}
                    />
                  </div>
                </div>

                <div className="mt-5">
                  {bookingGallery.length > 0 ? (
                    <EmblaImageGallery
                      images={bookingGallery}
                      aspectClassName="aspect-[16/11] sm:aspect-[16/9]"
                      priorityFirstImage
                      showThumbs
                    />
                  ) : (
                    <div className="relative overflow-hidden rounded-[1.6rem] border border-border/60 bg-[linear-gradient(135deg,#0b1422_0%,#10233b_52%,#173e2d_100%)]">
                      <div className="aspect-[16/11] sm:aspect-[16/9]" />
                    </div>
                  )}
                </div>

                <Separator className="my-5 bg-border/60" />


              </div>
            </section>


          </div>
        </div>
      </Container>
    </main>
  )
}

function PropertyBookingHeader({
  propertyName,
  description,
  location,
  heroUrl,
  imageCount,
  roomCount,
}: {
  propertyName: string
  description?: string | null
  location?: string
  heroUrl?: string
  imageCount: number
  roomCount: number
}) {
  return (
    <section className="mt-4 overflow-hidden rounded-[2rem] border border-border/60 bg-background/55 shadow-[0_24px_70px_rgba(8,17,31,0.08)] backdrop-blur-2xl dark:bg-background/30">
      <div className="grid gap-0 lg:grid-cols-[minmax(0,1.08fr)_360px]">
        <div className="p-5 sm:p-6 lg:p-7">


          <h1 className="mt-4 font-serif text-[clamp(2rem,5vw,3.5rem)] leading-[0.96] tracking-[-0.05em] text-foreground">
            Choose your dates at {propertyName}
          </h1>




        </div>

        <div className="relative min-h-[220px] border-t border-border/60 lg:min-h-full lg:border-l lg:border-t-0">
          {heroUrl ? (
            <Image
              src={heroUrl}
              alt={propertyName}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 360px"
              priority
            />
          ) : (
            <div className="absolute inset-0 bg-[linear-gradient(135deg,#08111f_0%,#0d2037_52%,#143626_100%)]" />
          )}

          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(6,12,22,0.10)_0%,rgba(6,12,22,0.52)_100%)]" />
          <div className="absolute bottom-4 left-4 right-4 rounded-[1.4rem] border border-white/12 bg-black/25 p-4 text-white backdrop-blur-xl">
            <div className="text-[10px] uppercase tracking-[0.24em] text-white/70">
              Steps to book
            </div>
            <p className="mt-2 text-sm leading-6 text-white/85">
              Pick your dates now. Available rooms and plans come next.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

function MiniFeature({
  icon,
  title,
  text,
}: {
  icon: ReactNode
  title: string
  text: string
}) {
  return (
    <div className="rounded-[1.45rem] border border-border/60 bg-background/72 p-4 shadow-[0_12px_32px_rgba(8,17,31,0.04)] backdrop-blur-xl dark:bg-background/35">
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-border/60 bg-background/80 text-foreground dark:bg-background/45">
          {icon}
        </div>
        <div>
          <h3 className="text-sm font-medium tracking-tight text-foreground">{title}</h3>
          <p className="mt-1.5 text-sm leading-6 text-muted-foreground">{text}</p>
        </div>
      </div>
    </div>
  )
}

function GlassPill({
  icon,
  text,
}: {
  icon: ReactNode
  text: string
}) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/65 px-3 py-1.5 text-xs text-muted-foreground backdrop-blur-xl dark:bg-background/35">
      {icon}
      {text}
    </span>
  )
}
