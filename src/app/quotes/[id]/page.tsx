// src/app/quotes/[id]/page.tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import ProtectedShell from "@/components/b2b/ProtectedShell";
import { addB2BQuoteComment, getB2BQuote, updateB2BQuoteStatus } from "@/lib/b2b-api";

type QuoteDetail = {
  id: number;
  status: string;
  property: { name: string };
  checkIn: string;
  checkOut: string;
  lines: Array<{ id: number; roomTypeName: string; roomCount: number; occupancy: number; targetRate?: number | null }>;
  statusHistory: Array<{ id: number; fromStatus?: string | null; toStatus: string; changedBy: string; createdAt: string }>;
  comments: Array<{ id: number; message: string; authorLabel: string; createdAt: string }>;
};

export default function QuoteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [quote, setQuote] = useState<QuoteDetail | null>(null);
  const [comment, setComment] = useState("");
  const [note, setNote] = useState("");
  const [status, setStatus] = useState("NEGOTIATION");

  const load = useCallback(async () => {
    const data = await getB2BQuote(id);
    setQuote(data);
  }, [id]);

  useEffect(() => {
    load().catch(() => setQuote(null));
  }, [load]);

  async function handleComment() {
    if (!comment.trim()) return;
    await addB2BQuoteComment(id, comment);
    setComment("");
    await load();
  }

  async function handleStatus() {
    await updateB2BQuoteStatus(id, status, note || undefined);
    setNote("");
    await load();
  }

  return (
    <ProtectedShell>
      {!quote ? (
        <div className="rounded-xl border border-border bg-card p-6">Loading quote...</div>
      ) : (
        <div className="space-y-4">
          <div className="rounded-xl border border-border bg-card p-6">
            <h1 className="text-2xl font-semibold">
              Quote #{quote.id} - {quote.property?.name}
            </h1>
            <p className="text-sm text-muted-foreground">
              {quote.checkIn.slice(0, 10)} to {quote.checkOut.slice(0, 10)}
            </p>
            <p className="mt-2 text-sm">Current status: <span className="font-semibold">{quote.status}</span></p>
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold">Requested lines</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {quote.lines.map((line) => (
                <li key={line.id}>
                  {line.roomTypeName} x{line.roomCount} (occ {line.occupancy}){line.targetRate ? `, target INR ${line.targetRate}` : ""}
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold">Update status</h2>
            <div className="mt-3 flex flex-wrap gap-2">
              <select className="h-10 rounded-md border border-border bg-background px-3" value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="NEGOTIATION">NEGOTIATION</option>
                <option value="CONFIRMED">CONFIRMED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
              <input className="h-10 min-w-72 rounded-md border border-border bg-background px-3 text-sm" placeholder="Optional note" value={note} onChange={(e) => setNote(e.target.value)} />
              <button className="rounded-md bg-primary px-4 text-primary-foreground" type="button" onClick={handleStatus}>
                Save
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold">Comments</h2>
            <div className="mt-3 flex gap-2">
              <input className="h-10 w-full rounded-md border border-border bg-background px-3 text-sm" value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Add comment" />
              <button className="rounded-md border border-border px-4" type="button" onClick={handleComment}>
                Add
              </button>
            </div>
            <ul className="mt-4 space-y-3 text-sm">
              {quote.comments.map((c) => (
                <li key={c.id}>
                  <p>{c.message}</p>
                  <p className="text-xs text-muted-foreground">
                    {c.authorLabel} - {new Date(c.createdAt).toLocaleString()}
                  </p>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-border bg-card p-6">
            <h2 className="text-lg font-semibold">Status timeline</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {quote.statusHistory.map((h) => (
                <li key={h.id}>
                  {h.fromStatus || "INIT"} -&gt; {h.toStatus} ({h.changedBy})
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </ProtectedShell>
  );
}
