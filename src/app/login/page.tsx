"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { loginSchema } from "@/lib/b2b-schemas";
import { b2bLogin } from "@/lib/b2b-api";
import ZenvanaLoading from "@/components/Zenvanaloading";
import type { z } from "zod";

type LoginForm = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({ resolver: zodResolver(loginSchema) });

  const onSubmit = handleSubmit(async (values) => {
    setError(null);
    try {
      await b2bLogin(values.code, values.password);
      router.replace("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed");
    }
  });

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <form onSubmit={onSubmit} className="w-full max-w-md space-y-4 rounded-xl border border-border bg-card p-6">
        <h1 className="text-2xl font-semibold">B2B Partner Login</h1>
        <p className="text-sm text-muted-foreground">Use your shared agency credentials.</p>
        <div className="space-y-1">
          <label className="text-sm">Agency Code</label>
          <Input {...register("code")} placeholder="demo-agency" />
          {errors.code && <p className="text-xs text-destructive">{errors.code.message}</p>}
        </div>
        <div className="space-y-1">
          <label className="text-sm">Password</label>
          <Input {...register("password")} type="password" />
          {errors.password && <p className="text-xs text-destructive">{errors.password.message}</p>}
        </div>
        {error && <p className="text-sm text-destructive">{error}</p>}
        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting ? "Signing in..." : "Sign In"}
        </Button>
      </form>
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
