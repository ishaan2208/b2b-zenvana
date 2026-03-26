"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Building2, FileText, PlusCircle, LogOut, Menu, X } from "lucide-react";
import { b2bLogout, b2bMe, type B2BPartnerMe } from "@/lib/b2b-api";
import { Logo } from "@/components/Logo";
import ZenvanaLoading from "@/components/Zenvanaloading";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/properties", label: "Properties", icon: Building2 },
  { href: "/quotes", label: "Quotes", icon: FileText },
  { href: "/quotes/new", label: "New Quote", icon: PlusCircle },
];

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") return pathname === "/dashboard";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export default function ProtectedShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [partner, setPartner] = useState<B2BPartnerMe | null>(null);
  const [loading, setLoading] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    b2bMe()
      .then((me) => {
        if (!cancelled) setPartner(me);
      })
      .catch(() => {
        if (!cancelled) router.replace("/login");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [router]);

  async function handleLogout() {
    await b2bLogout().catch(() => undefined);
    router.replace("/login");
  }

  if (loading) {
    return (
      <main className="min-h-screen bg-background p-4">
        <ZenvanaLoading
          variant="page"
          title="Loading B2B workspace"
          description="Preparing partner profile, navigation, and workspace context."
        />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/dashboard" className="flex min-w-0 items-center gap-2">
            <Logo className="h-11 w-auto sm:h-12" />
            <div className="min-w-0">
              <p className="truncate text-[11px] uppercase tracking-[0.2em] text-muted-foreground">
                B2B Portal
              </p>
              <p className="truncate text-sm font-semibold">{partner?.agencyName}</p>
            </div>
          </Link>

          <nav className="hidden lg:flex">
            <div className="flex items-center gap-1 rounded-full border border-border/60 bg-card/70 p-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(pathname, item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`inline-flex items-center gap-2 rounded-full px-3.5 py-2.5 text-sm transition ${
                      active
                        ? "bg-background font-semibold text-foreground"
                        : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </Link>
                );
              })}
            </div>
          </nav>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleLogout}
              className="hidden h-10 items-center gap-2 rounded-full border border-border px-4 text-sm text-destructive lg:inline-flex"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border lg:hidden"
              onClick={() => setMobileOpen((prev) => !prev)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          </div>
        </div>
      </header>

      {mobileOpen && (
        <div className="border-b border-border bg-card px-4 py-3 lg:hidden">
          <nav className="grid gap-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(pathname, item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm ${
                    active ? "bg-secondary font-semibold" : ""
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              );
            })}
            <button
              className="mt-1 inline-flex items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-destructive"
              onClick={handleLogout}
              type="button"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </nav>
        </div>
      )}

      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 lg:py-6">
        <section className="min-w-0">{children}</section>
      </div>
    </main>
  );
}
