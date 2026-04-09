"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Eye, EyeOff, LockKeyhole, Shield, User } from "lucide-react";
import type { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/Card";
import { masterLoginSchema } from "@/lib/b2b-schemas";
import { b2bMasterLogin } from "@/lib/b2b-api";
import ZenvanaLoading from "@/components/Zenvanaloading";
import { cn } from "@/lib/utils";

type FormValues = z.infer<typeof masterLoginSchema>;

export default function MasterLoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(masterLoginSchema),
    defaultValues: { username: "", password: "" },
  });

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    try {
      await b2bMasterLogin(values.username, values.password);
      router.replace("/master/vendors");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in");
    }
  });

  return (
    <main className="relative min-h-screen overflow-x-hidden overflow-y-auto bg-[#040816] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(250,204,21,0.08),transparent_28%),radial-gradient(circle_at_80%_0%,rgba(59,130,246,0.08),transparent_28%)]" />

      <div className="relative mx-auto flex min-h-screen max-w-lg items-center px-4 py-10 sm:px-6">
        <div className="w-full">
          <Card className="rounded-[1.8rem] border border-white/10 bg-[#071020]/90 p-6 shadow-[0_16px_64px_rgba(0,0,0,0.35)] sm:p-8">
            <div className="mb-6 flex items-start gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-amber-500/15 text-amber-400">
                <Shield className="h-6 w-6" />
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Internal</p>
                <h1 className="mt-1 text-2xl font-semibold text-white">Master admin</h1>
                <p className="mt-2 text-sm text-slate-400">
                  Create B2B partner accounts. Requires backend{" "}
                  <code className="rounded bg-white/10 px-1.5 py-0.5 text-xs text-slate-200">
                    B2B_MASTER_USERNAME
                  </code>{" "}
                  /{" "}
                  <code className="rounded bg-white/10 px-1.5 py-0.5 text-xs text-slate-200">
                    B2B_MASTER_PASSWORD
                  </code>
                  .
                </p>
              </div>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-200">Username</label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <Input
                    {...register("username")}
                    autoComplete="username"
                    className="h-12 rounded-2xl border-white/10 bg-white/[0.04] pl-11 text-slate-100 placeholder:text-slate-500 focus-visible:ring-2 focus-visible:ring-amber-400/40"
                    placeholder="Master username"
                  />
                </div>
                {errors.username ? (
                  <p className="text-xs text-rose-400">{errors.username.message}</p>
                ) : null}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-200">Password</label>
                <div className="relative">
                  <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                  <Input
                    {...register("password")}
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    className="h-12 rounded-2xl border-white/10 bg-white/[0.04] pl-11 pr-12 text-slate-100 placeholder:text-slate-500 focus-visible:ring-2 focus-visible:ring-amber-400/40"
                    placeholder="Master password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-3 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white/[0.06] hover:text-slate-200"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {errors.password ? (
                  <p className="text-xs text-rose-400">{errors.password.message}</p>
                ) : null}
              </div>

              {error ? (
                <div
                  className={cn(
                    "rounded-2xl border px-3 py-3 text-sm",
                    "border-rose-500/30 bg-rose-500/10 text-rose-200"
                  )}
                >
                  {error}
                </div>
              ) : null}

              <Button
                type="submit"
                disabled={isSubmitting}
                className="group h-12 w-full rounded-2xl bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 font-semibold text-slate-950 transition duration-200 hover:brightness-110"
              >
                {isSubmitting ? (
                  "Signing in"
                ) : (
                  <>
                    Continue
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                  </>
                )}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500">
              <Link href="/login" className="text-slate-300 underline-offset-4 hover:underline">
                Partner sign in
              </Link>
            </p>
          </Card>
        </div>
      </div>

      {isSubmitting ? (
        <ZenvanaLoading
          variant="overlay"
          title="Signing in"
          description="Verifying master credentials."
        />
      ) : null}
    </main>
  );
}
