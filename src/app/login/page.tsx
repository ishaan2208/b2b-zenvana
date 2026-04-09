"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Eye, EyeOff, Hotel, LockKeyhole } from "lucide-react";
import type { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/Card";
import { loginSchema } from "@/lib/b2b-schemas";
import { b2bLogin } from "@/lib/b2b-api";
import ZenvanaLoading from "@/components/Zenvanaloading";
import { TextGenerateEffect } from "@/components/text-generate-effect";
import { cn } from "@/lib/utils";

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      code: "",
      password: "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    try {
      await b2bLogin(values.code, values.password);
      router.replace("/properties");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in");
    }
  });

  return (
    <main className="relative min-h-screen overflow-x-hidden overflow-y-auto bg-[#040816] text-white">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(250,204,21,0.10),transparent_24%),radial-gradient(circle_at_80%_0%,rgba(59,130,246,0.10),transparent_24%)]" />

      <div className="relative mx-auto flex min-h-screen max-w-7xl items-start px-4 py-3 sm:px-6 sm:py-4 lg:items-center lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="grid w-full overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] shadow-[0_24px_100px_rgba(0,0,0,0.45)] backdrop-blur-xl lg:grid-cols-[1.06fr_0.94fr]"
        >
          <section className="relative min-h-[220px] overflow-hidden border-b border-white/10 sm:min-h-[300px] lg:min-h-[760px] lg:border-b-0 lg:border-r">
            <Image
              src="/login page imag.png"
              alt="Zenvana partner hospitality visual"
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 52vw"
            />
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,8,22,0.12)_0%,rgba(4,8,22,0.70)_76%,rgba(4,8,22,0.92)_100%)] lg:bg-[linear-gradient(135deg,rgba(4,8,22,0.05)_0%,rgba(4,8,22,0.52)_48%,rgba(4,8,22,0.90)_100%)]" />

            <div className="absolute inset-x-0 bottom-0 p-4 sm:p-6 lg:p-8">
              <TextGenerateEffect
                words="Zenvana hotel travel partner portal"
                className="max-w-lg"
              />

            </div>
          </section>

          <section className="flex items-center justify-center p-3 sm:p-6 lg:p-10">
            <div className="w-full max-w-md">
              <Card className="rounded-[1.8rem] border border-white/10 bg-[#071020]/90 p-4 shadow-[0_16px_64px_rgba(0,0,0,0.35)] sm:p-6">
                <div className="mb-4 sm:mb-5">
                  <p className="text-[11px] uppercase tracking-[0.2em] text-slate-400">Partner sign in</p>
                  <h1 className="mt-1 text-2xl font-semibold text-white sm:text-3xl">Welcome back</h1>
                  <p className="mt-2 text-sm text-slate-400">
                    Enter your credentials to continue.
                  </p>
                </div>

                <form onSubmit={onSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-200">Agency code</label>
                    <div className="relative">
                      <Hotel className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                      <Input
                        {...register("code")}
                        placeholder="Enter partner code"
                        className="h-12 rounded-2xl border-white/10 bg-white/[0.04] pl-11 text-slate-100 placeholder:text-slate-500 focus-visible:ring-2 focus-visible:ring-yellow-400/40"
                      />
                    </div>
                    {errors.code ? <p className="text-xs text-rose-400">{errors.code.message}</p> : null}
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-200">Password</label>
                    <div className="relative">
                      <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                      <Input
                        {...register("password")}
                        type={showPassword ? "text" : "password"}
                        placeholder="Enter password"
                        className="h-12 rounded-2xl border-white/10 bg-white/[0.04] pl-11 pr-12 text-slate-100 placeholder:text-slate-500 focus-visible:ring-2 focus-visible:ring-yellow-400/40"
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

                  {
                    error && (<div
                      className={cn(
                        "rounded-2xl border px-3 py-3 text-sm",
                        error
                          ? "border-rose-500/30 bg-rose-500/10 text-rose-200"
                          : "border-white/10 bg-white/[0.03] text-slate-300"
                      )}
                    >
                      {error || ""}
                    </div>
                    )}

                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="group h-12 w-full rounded-2xl bg-gradient-to-r from-yellow-400 via-amber-300 to-yellow-400 font-semibold text-slate-950 transition duration-200 hover:brightness-110"
                  >
                    {isSubmitting ? (
                      "Signing you in"
                    ) : (
                      <>
                        Enter partner workspace
                        <ArrowRight className="ml-2 h-4 w-4 transition-transform duration-200 group-hover:translate-x-0.5" />
                      </>
                    )}
                  </Button>
                  <p className="pt-2 text-center text-xs text-slate-500">
                    <Link
                      href="/master/login"
                      className="text-slate-400 underline-offset-4 hover:text-slate-200 hover:underline"
                    >
                      Master admin — create partner accounts
                    </Link>
                  </p>
                </form>
              </Card>
            </div>
          </section>
        </motion.div>
      </div>

      {isSubmitting ? (
        <ZenvanaLoading
          variant="overlay"
          title="Signing you in"
          description="Verifying credentials and preparing your workspace."
        />
      ) : null}
    </main>
  );
}
