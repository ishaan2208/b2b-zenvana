export type GalleryImage = {
  url: string
  isHero: boolean
  sortOrder: number
  classification?: string
  tags?: string[]
}

function resolveImageUrl(url: string | undefined): string | undefined {
  if (!url) return undefined
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  const base = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000'
  const origin = base.replace(/\/api\/v1.*$/, '').replace(/\/$/, '')
  return `${origin}${url.startsWith('/') ? '' : '/'}${url}`
}

export function normalizeGalleryImages(images: unknown): GalleryImage[] {
  if (!Array.isArray(images)) return []
  return images
    .map((raw, index) => {
      if (!raw || typeof raw !== 'object') return null
      const item = raw as Record<string, unknown>
      const url = resolveImageUrl(typeof item.url === 'string' ? item.url : undefined)
      if (!url) return null
      return {
        url,
        isHero: item.isHero === true,
        sortOrder:
          typeof item.sortOrder === 'number'
            ? item.sortOrder
            : Number.isFinite(Number(item.sortOrder))
              ? Number(item.sortOrder)
              : index,
        classification:
          typeof item.classification === 'string' ? item.classification : undefined,
        tags: Array.isArray(item.tags)
          ? item.tags.filter((t): t is string => typeof t === 'string')
          : undefined,
      } satisfies GalleryImage
    })
    .filter((item): item is GalleryImage => Boolean(item))
    .sort((a, b) => a.sortOrder - b.sortOrder)
}

export function pickHeroAndGallery(images: unknown): {
  heroUrl?: string
  gallery: GalleryImage[]
} {
  const normalized = normalizeGalleryImages(images)
  if (normalized.length === 0) return { heroUrl: undefined, gallery: [] }
  const hero =
    normalized.find((img) => img.isHero || img.classification === 'hero') ?? normalized[0]
  return {
    heroUrl: hero?.url,
    gallery: normalized,
  }
}
