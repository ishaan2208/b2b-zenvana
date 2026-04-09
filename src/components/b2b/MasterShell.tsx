"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut, Shield } from "lucide-react";
import { b2bMasterLogout, b2bMasterSession } from "@/lib/b2b-api";
import { Logo } from "@/components/Logo";

export default function MasterShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function check() {
      try {
        await b2bMasterSession();
        if (!cancelled) setReady(true);
      } catch {
        await new Promise((r) => setTimeout(r, 200));
        try {
          await b2bMasterSession();
          if (!cancelled) setReady(true);
        } catch {
          if (!cancelled) router.replace("/master/login");
        }
      }
    }

    check();
    return () => {
      cancelled = true;
    };
  }, [router]);

  function handleLogout() {
    b2bMasterLogout();
    router.replace("/master/login");
  }

  if (!ready) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background text-foreground">
        <p className="text-sm text-muted-foreground">Checking session…</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <Link href="/master/vendors" className="flex min-w-0 items-center gap-2">
            <Logo className="h-10 w-auto sm:h-11" />
            <div className="min-w-0">
              <p className="truncate text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                B2B admin
              </p>
              <p className="inline-flex items-center gap-1.5 truncate text-sm font-semibold">
                <Shield className="h-4 w-4 shrink-0 text-amber-500" />
                Partner accounts
              </p>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <Link
              href="/login"
              className="hidden text-sm text-muted-foreground hover:text-foreground sm:inline"
            >
              Partner login
            </Link>
            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex h-10 items-center gap-2 rounded-full border border-border px-4 text-sm text-destructive"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>
      </header>
      <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">{children}</div>
    </main>
  );
}
