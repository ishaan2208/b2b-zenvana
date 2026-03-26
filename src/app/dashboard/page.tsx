"use client";

import Link from "next/link";
import ProtectedShell from "@/components/b2b/ProtectedShell";

export default function DashboardPage() {
  return (
    <ProtectedShell>
      <div className="rounded-xl border border-border bg-card p-4 sm:p-6">
        <h1 className="text-xl font-semibold sm:text-2xl">Partner Dashboard</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          View transparent inventory, compare website vs B2B rates, and send bulk requirements.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <Link className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-4 text-primary-foreground" href="/properties">
            Browse Properties
          </Link>
          <Link className="inline-flex h-11 items-center justify-center rounded-md border border-border px-4" href="/quotes/new">
            Send Bulk Requirement
          </Link>
        </div>
      </div>
    </ProtectedShell>
  );
}
