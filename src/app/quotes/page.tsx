// src/app/quotes/page.tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import ProtectedShell from "@/components/b2b/ProtectedShell";
import { listB2BQuotes } from "@/lib/b2b-api";

type QuoteRow = {
  id: number;
  status: string;
  createdAt: string;
  checkIn: string;
  checkOut: string;
  totalRoomsRequired: number;
  property: { name: string };
};

export default function QuotesPage() {
  const [rows, setRows] = useState<QuoteRow[]>([]);
  const [status, setStatus] = useState("");

  useEffect(() => {
    listB2BQuotes(status || undefined).then(setRows).catch(() => setRows([]));
  }, [status]);

  return (
    <ProtectedShell>
      <div className="rounded-xl border border-border bg-card p-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Quotes</h1>
          <Link className="text-sm text-primary underline" href="/quotes/new">
            New requirement
          </Link>
        </div>
        <div className="mt-3">
          <select className="h-9 rounded-md border border-border bg-background px-3 text-sm" value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">All statuses</option>
            <option value="NEW">NEW</option>
            <option value="UNDER_REVIEW">UNDER_REVIEW</option>
            <option value="QUOTED">QUOTED</option>
            <option value="NEGOTIATION">NEGOTIATION</option>
            <option value="CONFIRMED">CONFIRMED</option>
            <option value="REJECTED">REJECTED</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>
        </div>
        <div className="mt-4 divide-y divide-border">
          {rows.map((q) => (
            <Link key={q.id} href={`/quotes/${q.id}`} className="flex items-center justify-between py-3">
              <div>
                <p className="font-medium">{q.property?.name || "Property"} - #{q.id}</p>
                <p className="text-xs text-muted-foreground">
                  {q.checkIn?.slice(0, 10)} to {q.checkOut?.slice(0, 10)} | {q.totalRoomsRequired} rooms
                </p>
              </div>
              <span className="rounded bg-secondary px-2 py-1 text-xs">{q.status}</span>
            </Link>
          ))}
        </div>
      </div>
    </ProtectedShell>
  );
}
