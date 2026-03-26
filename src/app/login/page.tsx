"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowRight,
  BedDouble,
  Eye,
  EyeOff,
  Hotel,
  IndianRupee,
  KeyRound,
  LockKeyhole,
  MapPinned,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import type { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/Card";
import { loginSchema } from "@/lib/b2b-schemas";
import { b2bLogin } from "@/lib/b2b-api";
import ZenvanaLoading from "@/components/Zenvanaloading";
import { cn } from "@/lib/utils";

type LoginForm = z.infer<typeof loginSchema>;

const partnerHighlights = [
  {
    icon: Hotel,
    title: "Group stay coordination",
    description: "Handle rooming requirements and partner communication from one calm workspace.",
  },
  {
    icon: IndianRupee,
    title: "Live partner rates",
    description: "Access B2B pricing, compare totals, and move faster on high-intent enquiries.",
  },
  {
    icon: BedDouble,
    title: "Inventory with context",
    description: "See room mix, stay dates, and inventory in a format built for agency speed.",
  },
];

const trustPills = [
  { icon: ShieldCheck, label: "Secure partner access" },
  { icon: Sparkles, label: "Premium hospitality workflow" },
  { icon: Users, label: "Built for travel agents" },
];

export default function LoginPage() {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
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

  const activeMessage = useMemo(
    () =>
      error
        ? error
        : "Use your agency credentials to continue into the Zenvana travel partner workspace.",
    [error]
  );

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    try {
      await b2bLogin(values.code, values.password);
      router.replace("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to sign in");
    }
  });

  return (
    <main className="relative min-h-screen overflow-x-hidden overflow-y-auto bg-[#040816] text-white">
      <AmbientBackground reduceMotion={!!reduceMotion} />

      <div className="relative mx-auto flex min-h-screen max-w-7xl items-center px-4 py-4 sm:px-6 sm:py-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="grid w-full overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.04] shadow-[0_30px_120px_rgba(0,0,0,0.55)] backdrop-blur-xl lg:grid-cols-[1.08fr_0.92fr]"
        >
          <section className="relative order-1 min-h-[320px] overflow-hidden border-b border-white/10 lg:order-none lg:min-h-[760px] lg:border-b-0 lg:border-r">
            <Image
              src="/login page imag.png"
              alt="Zenvana partner hospitality visual"
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 52vw"
            />

            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(4,8,22,0.10)_0%,rgba(4,8,22,0.42)_28%,rgba(4,8,22,0.72)_72%,rgba(4,8,22,0.96)_100%)] lg:bg-[linear-gradient(135deg,rgba(4,8,22,0.08)_0%,rgba(4,8,22,0.42)_40%,rgba(4,8,22,0.82)_78%,rgba(4,8,22,0.96)_100%)]" />

            <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(250,204,21,0.18),transparent_28%),radial-gradient(circle_at_75%_22%,rgba(59,130,246,0.16),transparent_24%),radial-gradient(circle_at_68%_78%,rgba(245,158,11,0.10),transparent_22%)]" />

            <div className="absolute inset-0 hidden lg:block">
              <FloatingCard
                className="left-[8%] top-[9%]"
                delay={0}
                reduceMotion={!!reduceMotion}
                icon={IndianRupee}
                title="Live partner rates"
                value="B2B pricing first"
              />
              <FloatingCard
                className="right-[8%] top-[18%]"
                delay={0.08}
                reduceMotion={!!reduceMotion}
                icon={BedDouble}
                title="Inventory visibility"
                value="Room mix aligned"
              />

            </div>

            <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 lg:p-8">
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.42, delay: 0.08, ease: "easeOut" }}
                className="max-w-xl"
              >
                <div className="mb-3 flex flex-wrap items-center gap-2">
                  <Badge className="rounded-full border border-yellow-400/20 bg-yellow-400/10 px-3 py-1 text-[11px] font-medium uppercase tracking-[0.2em] text-yellow-200">
                    Zenvana Travel Partner
                  </Badge>
                  <Badge
                    variant="outline"
                    className="rounded-full border-white/15 bg-white/8 px-3 py-1 text-[11px] uppercase tracking-[0.18em] text-slate-200"
                  >
                    Flagship B2B access
                  </Badge>
                </div>



                <p className="mt-3 max-w-lg text-sm leading-6 text-slate-300 sm:text-base">
                  Designed for agencies that need speed, pricing clarity, and a calmer
                  way to move from enquiry to confirmed stay.
                </p>

                <div className="mt-5 grid gap-2.5 sm:grid-cols-3">
                  {trustPills.map((pill) => {
                    const Icon = pill.icon;
                    return (
                      <div
                        key={pill.label}
                        className="rounded-2xl border border-white/10 bg-white/[0.07] px-3 py-3 backdrop-blur"
                      >
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4 text-yellow-300" />
                          <span className="text-xs font-medium text-slate-100">
                            {pill.label}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            </div>
          </section>

          <section className="relative flex items-center justify-center p-4 sm:p-6 lg:p-10">
            <div className="w-full max-w-lg">
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.38, delay: 0.06, ease: "easeOut" }}
              >
                <Card className="overflow-hidden rounded-[2rem] border border-white/10 bg-[#071020]/90 shadow-[0_24px_80px_rgba(0,0,0,0.38)]">
                  <div className="border-b border-white/10 bg-white/[0.03] p-4 sm:p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-yellow-400/20 bg-yellow-400/10 text-yellow-300">
                          <KeyRound className="h-5 w-5" />
                        </div>
                        <p className="text-[11px] uppercase tracking-[0.22em] text-slate-400">
                          Partner sign in
                        </p>
                        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-white sm:text-3xl">
                          Welcome back
                        </h1>
                        <p className="mt-2 max-w-sm text-sm leading-6 text-slate-400">
                          Enter your agency code and password to access rates, quote flow,
                          and travel partner tools.
                        </p>
                      </div>

                      <div className="hidden rounded-2xl border border-white/10 bg-white/[0.04] p-2.5 sm:block">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-blue-300">
                          <MapPinned className="h-5 w-5" />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 sm:p-5 lg:p-6">


                    <form onSubmit={onSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-200">
                          Agency code
                        </label>
                        <div className="relative">
                          <Hotel className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                          <Input
                            {...register("code")}
                            placeholder="Enter your partner code"
                            className="h-12 rounded-2xl border-white/10 bg-white/[0.04] pl-11 text-slate-100 placeholder:text-slate-500 focus-visible:ring-2 focus-visible:ring-yellow-400/40"
                          />
                        </div>
                        {errors.code ? (
                          <p className="text-xs text-rose-400">{errors.code.message}</p>
                        ) : null}
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-200">
                          Password
                        </label>
                        <div className="relative">
                          <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
                          <Input
                            {...register("password")}
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            className="h-12 rounded-2xl border-white/10 bg-white/[0.04] pl-11 pr-12 text-slate-100 placeholder:text-slate-500 focus-visible:ring-2 focus-visible:ring-yellow-400/40"
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword((v) => !v)}
                            className="absolute right-3 top-1/2 inline-flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-slate-400 transition hover:bg-white/[0.06] hover:text-slate-200"
                            aria-label={showPassword ? "Hide password" : "Show password"}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                        {errors.password ? (
                          <p className="text-xs text-rose-400">{errors.password.message}</p>
                        ) : null}
                      </div>

                      <AnimatePresence mode="wait">
                        <motion.div
                          key={activeMessage}
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -6 }}
                          transition={{ duration: 0.18 }}
                          className={cn(
                            "rounded-2xl border px-3 py-3 text-sm",
                            error
                              ? "border-rose-500/25 bg-rose-500/10 text-rose-200"
                              : "border-white/10 bg-white/[0.03] text-slate-300"
                          )}
                        >
                          {activeMessage}
                        </motion.div>
                      </AnimatePresence>

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
                    </form>

                    <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-100">
                          One entrance for the whole partner flow
                        </p>
                        <p className="text-xs leading-5 text-slate-400">
                          Rates, requirements, quotes, and confirmations stay connected.
                        </p>
                      </div>
                      <div className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] uppercase tracking-[0.18em] text-slate-300">
                        Secure access
                      </div>
                    </div>
                  </div>
                </Card>
              </motion.div>
            </div>
          </section>
        </motion.div>
      </div>

      {isSubmitting ? (
        <ZenvanaLoading
          variant="overlay"
          title="Signing you in"
          description="Verifying partner credentials and preparing your workspace."
        />
      ) : null}
    </main>
  );
}

function AmbientBackground({ reduceMotion }: { reduceMotion: boolean }) {
  return (
    <>
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_15%_20%,rgba(250,204,21,0.14),transparent_24%),radial-gradient(circle_at_82%_18%,rgba(59,130,246,0.14),transparent_24%),radial-gradient(circle_at_68%_82%,rgba(245,158,11,0.12),transparent_24%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-[0.08] [background-image:linear-gradient(to_right,white_1px,transparent_1px),linear-gradient(to_bottom,white_1px,transparent_1px)] [background-size:48px_48px]" />

      <motion.div
        className="pointer-events-none absolute -left-24 top-20 h-72 w-72 rounded-full bg-yellow-400/10 blur-3xl"
        animate={
          reduceMotion
            ? {}
            : {
              x: [0, 30, 0],
              y: [0, -18, 0],
              scale: [1, 1.08, 1],
            }
        }
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="pointer-events-none absolute right-[-60px] top-12 h-80 w-80 rounded-full bg-blue-500/10 blur-3xl"
        animate={
          reduceMotion
            ? {}
            : {
              x: [0, -26, 0],
              y: [0, 22, 0],
              scale: [1, 1.06, 1],
            }
        }
        transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="pointer-events-none absolute bottom-[-80px] left-[22%] h-80 w-80 rounded-full bg-amber-300/8 blur-3xl"
        animate={
          reduceMotion
            ? {}
            : {
              x: [0, 18, 0],
              y: [0, -22, 0],
              scale: [1, 1.1, 1],
            }
        }
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
      />

      <Beam
        reduceMotion={reduceMotion}
        className="left-[-12%] top-[17%] rotate-[-12deg]"
        delay={0}
      />
      <Beam
        reduceMotion={reduceMotion}
        className="right-[-18%] top-[40%] rotate-[14deg]"
        delay={0.4}
      />
      <Beam
        reduceMotion={reduceMotion}
        className="left-[-8%] bottom-[18%] rotate-[8deg]"
        delay={0.8}
      />
    </>
  );
}

function Beam({
  className,
  delay,
  reduceMotion,
}: {
  className?: string;
  delay?: number;
  reduceMotion: boolean;
}) {
  return (
    <motion.div
      className={cn(
        "pointer-events-none absolute h-px w-[42rem] bg-gradient-to-r from-transparent via-yellow-300/70 to-blue-400/0 blur-[0.3px]",
        className
      )}
      animate={
        reduceMotion
          ? {}
          : {
            x: [0, 70, 0],
            opacity: [0.25, 0.85, 0.25],
            scaleX: [0.94, 1.08, 0.94],
          }
      }
      transition={{
        duration: 9,
        repeat: Infinity,
        ease: "easeInOut",
        delay,
      }}
    />
  );
}

function FloatingCard({
  className,
  delay,
  reduceMotion,
  icon: Icon,
  title,
  value,
}: {
  className?: string;
  delay?: number;
  reduceMotion: boolean;
  icon: React.ElementType;
  title: string;
  value: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{
        opacity: 1,
        y: reduceMotion ? 0 : [0, -8, 0],
      }}
      transition={{
        opacity: { duration: 0.35, delay },
        y: {
          duration: 4.8,
          repeat: Infinity,
          ease: "easeInOut",
          delay,
        },
      }}
      className={cn(
        "absolute w-[220px] rounded-[1.35rem] border border-white/10 bg-white/[0.08] p-3.5 shadow-[0_18px_50px_rgba(0,0,0,0.24)] backdrop-blur-xl",
        className
      )}
    >
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-yellow-300">
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <p className="text-xs uppercase tracking-[0.18em] text-slate-300">{title}</p>
          <p className="mt-1 text-sm font-medium text-white">{value}</p>
        </div>
      </div>
    </motion.div>
  );
}