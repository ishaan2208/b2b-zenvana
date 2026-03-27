export type B2BPartnerMe = {
  id: number;
  agencyName: string;
  code: string;
  email?: string | null;
};

const B2B_TOKEN_STORAGE_KEY = "b2b_partner_bearer_token";

export type B2BProperty = {
  id: number;
  slug: string;
  publicName: string;
  city?: string | null;
  state?: string | null;
  heroImageUrl?: string;
  latitude?: number;
  longitude?: number;
  googleMapPlaceUrl?: string;
  images?: Array<{
    url?: string;
    isHero?: boolean;
    classification?: string;
    sortOrder?: number;
    tags?: string[];
  }>;
  roomTypes?: Array<{
    id: number;
    name: string;
    images?: Array<{
      url?: string;
      isHero?: boolean;
      classification?: string;
      sortOrder?: number;
      tags?: string[];
    }>;
  }>;
};

export type B2BRatesInventory = {
  property: {
    id: number;
    slug: string;
    publicName: string;
    images?: Array<{
      url?: string;
      isHero?: boolean;
      classification?: string;
      sortOrder?: number;
      tags?: string[];
    }>;
  };
  checkIn: string;
  checkOut: string;
  nights: number;
  roomTypes: Array<{
    roomTypeId: number;
    roomTypeName: string;
    images?: Array<{
      url?: string;
      isHero?: boolean;
      classification?: string;
      sortOrder?: number;
      tags?: string[];
    }>;
    nights: number;
    availableRooms: number;
    websiteTotalRate: number;
    b2bTotalRate: number;
    discountPercent: number;
    discountAmount: number;
    avgWebsiteRate: number;
    avgB2BRate: number;
    ratePlans?: Array<{
      id: number | string;
      name: string;
      mealPlan?: string;
      occupancy?: number | null;
      coefficient?: number;
      websiteTotalRate: number;
      b2bTotalRate: number;
      discountPercent: number;
      discountAmount: number;
      avgWebsiteRate: number;
      avgB2BRate: number;
    }>;
  }>;
};

export type B2BRateSheet = {
  property: {
    id: number;
    slug: string;
    publicName: string;
  };
  checkIn: string;
  checkOut: string;
  nights: number;
  occupancy: number | null;
  dates: string[];
  rows: Array<{
    roomTypeId: number;
    roomTypeName: string;
    images?: Array<{
      url?: string;
      isHero?: boolean;
      classification?: string;
      sortOrder?: number;
      tags?: string[];
    }>;
    ratePlanId: number | string;
    ratePlanName: string;
    mealPlan: string;
    occupancy: number | null;
    coefficient: number;
    currency: string;
    availableRoomsMin: number;
    inventoryByDate: Record<string, number>;
    ratesByDate: Record<
      string,
      {
        websiteRate: number;
        b2bRate: number;
        discountAmount: number;
      }
    >;
    websiteTotalRate: number;
    b2bTotalRate: number;
    discountPercent: number;
    discountAmount: number;
    avgWebsiteRate: number;
    avgB2BRate: number;
  }>;
  meta?: {
    generatedAt?: string;
    sampleRow?: unknown;
  };
};

function backendBase() {
  const base = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000";
  return base.endsWith("/api/v1") ? base : `${base.replace(/\/$/, "")}/api/v1`;
}

async function parseJson(res: Response) {
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json?.error || json?.message || "Request failed");
  return json?.data;
}

function getStoredBearerToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(B2B_TOKEN_STORAGE_KEY);
}

function setStoredBearerToken(token?: string | null) {
  if (typeof window === "undefined") return;
  if (token) {
    window.localStorage.setItem(B2B_TOKEN_STORAGE_KEY, token);
    return;
  }
  window.localStorage.removeItem(B2B_TOKEN_STORAGE_KEY);
}

function withAuthHeaders(headers?: HeadersInit): Headers {
  const merged = new Headers(headers || {});
  const token = getStoredBearerToken();
  if (token && !merged.has("Authorization")) {
    merged.set("Authorization", `Bearer ${token}`);
  }
  return merged;
}

export async function b2bLogin(code: string, password: string) {
  const res = await fetch(`${backendBase()}/b2b/auth/login`, {
    method: "POST",
    headers: withAuthHeaders({ "Content-Type": "application/json" }),
    credentials: "include",
    body: JSON.stringify({ code, password }),
  });
  const data = await parseJson(res);
  setStoredBearerToken(data?.token);
  return data;
}

export async function b2bLogout() {
  try {
    const res = await fetch(`${backendBase()}/b2b/auth/logout`, {
      method: "POST",
      credentials: "include",
      headers: withAuthHeaders(),
    });
    return await parseJson(res);
  } finally {
    setStoredBearerToken(null);
  }
}

export async function b2bMe(): Promise<B2BPartnerMe> {
  const res = await fetch(`${backendBase()}/b2b/auth/me`, {
    credentials: "include",
    cache: "no-store",
    headers: withAuthHeaders(),
  });
  return parseJson(res);
}

export async function b2bProperties(): Promise<B2BProperty[]> {
  const res = await fetch(`${backendBase()}/b2b/properties`, {
    credentials: "include",
    headers: withAuthHeaders(),
  });
  return parseJson(res);
}

export async function b2bRatesInventory(
  slug: string,
  checkIn: string,
  checkOut: string,
  occupancy?: number
): Promise<B2BRatesInventory> {
  const params = new URLSearchParams({ checkIn, checkOut });
  if (occupancy) params.set("occupancy", String(occupancy));
  const res = await fetch(
    `${backendBase()}/b2b/properties/${encodeURIComponent(slug)}/rates-inventory?${params.toString()}`,
    { credentials: "include", headers: withAuthHeaders() }
  );
  return parseJson(res);
}

export async function b2bRateSheet(
  slug: string,
  checkIn: string,
  checkOut: string,
  occupancy?: number
): Promise<B2BRateSheet> {
  const params = new URLSearchParams({ checkIn, checkOut });
  if (occupancy) params.set("occupancy", String(occupancy));
  const res = await fetch(
    `${backendBase()}/b2b/properties/${encodeURIComponent(slug)}/rate-sheet?${params.toString()}`,
    { credentials: "include", headers: withAuthHeaders() }
  );
  return parseJson(res);
}

export async function createB2BQuote(payload: unknown) {
  const res = await fetch(`${backendBase()}/b2b/quotes`, {
    method: "POST",
    headers: withAuthHeaders({ "Content-Type": "application/json" }),
    credentials: "include",
    body: JSON.stringify(payload),
  });
  return parseJson(res);
}

export async function listB2BQuotes(status?: string) {
  const params = new URLSearchParams();
  if (status) params.set("status", status);
  const query = params.toString() ? `?${params.toString()}` : "";
  const res = await fetch(`${backendBase()}/b2b/quotes${query}`, {
    credentials: "include",
    headers: withAuthHeaders(),
  });
  return parseJson(res);
}

export async function getB2BQuote(id: string) {
  const res = await fetch(`${backendBase()}/b2b/quotes/${id}`, {
    credentials: "include",
    headers: withAuthHeaders(),
  });
  return parseJson(res);
}

export async function addB2BQuoteComment(id: string, message: string) {
  const res = await fetch(`${backendBase()}/b2b/quotes/${id}/comments`, {
    method: "POST",
    headers: withAuthHeaders({ "Content-Type": "application/json" }),
    credentials: "include",
    body: JSON.stringify({ message }),
  });
  return parseJson(res);
}

export async function updateB2BQuoteStatus(id: string, status: string, note?: string) {
  const res = await fetch(`${backendBase()}/b2b/quotes/${id}/status`, {
    method: "PATCH",
    headers: withAuthHeaders({ "Content-Type": "application/json" }),
    credentials: "include",
    body: JSON.stringify({ status, note }),
  });
  return parseJson(res);
}
