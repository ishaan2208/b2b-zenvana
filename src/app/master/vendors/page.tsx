"use client";

import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Building2, Plus, RefreshCw } from "lucide-react";
import type { z } from "zod";

import MasterShell from "@/components/b2b/MasterShell";
import {
  b2bMasterCreateVendor,
  b2bMasterListPartners,
  type B2BPartnerListItem,
} from "@/lib/b2b-api";
import { createVendorSchema } from "@/lib/b2b-schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

type FormValues = z.infer<typeof createVendorSchema>;

function formatDate(iso: string) {
  try {
    return new Date(iso).toLocaleString(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

export default function MasterVendorsPage() {
  const [partners, setPartners] = useState<B2BPartnerListItem[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [banner, setBanner] = useState<{ type: "ok" | "err"; message: string } | null>(null);

  const load = useCallback(async () => {
    setLoadingList(true);
    try {
      const list = await b2bMasterListPartners();
      setPartners(list);
    } catch (e) {
      setBanner({
        type: "err",
        message: e instanceof Error ? e.message : "Could not load partners",
      });
    } finally {
      setLoadingList(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(createVendorSchema),
    defaultValues: {
      agencyName: "",
      code: "",
      password: "",
      email: "",
      phone: "",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    setBanner(null);
    try {
      const created = await b2bMasterCreateVendor({
        agencyName: values.agencyName.trim(),
        code: values.code.trim(),
        password: values.password,
        email: values.email?.trim() || undefined,
        phone: values.phone?.trim() || undefined,
      });
      setBanner({
        type: "ok",
        message: `Created partner “${created.agencyName}” — agency code: ${created.code}`,
      });
      reset({
        agencyName: "",
        code: "",
        password: "",
        email: "",
        phone: "",
      });
      await load();
    } catch (e) {
      setBanner({
        type: "err",
        message: e instanceof Error ? e.message : "Could not create partner",
      });
    }
  });

  return (
    <MasterShell>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Partner accounts</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Add a new travel partner. They sign in on the partner portal with agency code and
            password.
          </p>
        </div>

        {banner ? (
          <Alert variant={banner.type === "err" ? "destructive" : "default"}>
            <AlertTitle>{banner.type === "ok" ? "Success" : "Error"}</AlertTitle>
            <AlertDescription>{banner.message}</AlertDescription>
          </Alert>
        ) : null}

        <Card className="border-border p-5 sm:p-6">
          <div className="mb-4 flex items-center gap-2">
            <Plus className="h-5 w-5 text-amber-500" />
            <h2 className="text-lg font-semibold">New partner</h2>
          </div>
          <form onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2 sm:col-span-2">
              <label className="text-sm font-medium">Agency name</label>
              <Input {...register("agencyName")} placeholder="e.g. Sunrise Travels" />
              {errors.agencyName ? (
                <p className="text-xs text-destructive">{errors.agencyName.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Agency code</label>
              <Input {...register("code")} placeholder="Unique login code" autoComplete="off" />
              {errors.code ? <p className="text-xs text-destructive">{errors.code.message}</p> : null}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Password</label>
              <Input
                {...register("password")}
                type="password"
                placeholder="Initial password"
                autoComplete="new-password"
              />
              {errors.password ? (
                <p className="text-xs text-destructive">{errors.password.message}</p>
              ) : null}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email (optional)</label>
              <Input {...register("email")} type="email" placeholder="contact@agency.com" />
              {errors.email ? <p className="text-xs text-destructive">{errors.email.message}</p> : null}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Phone (optional)</label>
              <Input {...register("phone")} placeholder="+91-…" />
              {errors.phone ? <p className="text-xs text-destructive">{errors.phone.message}</p> : null}
            </div>
            <div className="flex items-end sm:col-span-2">
              <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
                {isSubmitting ? "Creating…" : "Create partner"}
              </Button>
            </div>
          </form>
        </Card>

        <Card className="border-border p-5 sm:p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Building2 className="h-5 w-5 text-muted-foreground" />
              <h2 className="text-lg font-semibold">All partners</h2>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => load()}
              disabled={loadingList}
              className="gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${loadingList ? "animate-spin" : ""}`} />
              Refresh
            </Button>
          </div>

          <div className="rounded-md border border-border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Agency</TableHead>
                  <TableHead>Code</TableHead>
                  <TableHead className="hidden md:table-cell">Contact</TableHead>
                  <TableHead className="hidden lg:table-cell">Created</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingList && partners.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-muted-foreground">
                      Loading…
                    </TableCell>
                  </TableRow>
                ) : null}
                {!loadingList && partners.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-muted-foreground">
                      No partner accounts yet.
                    </TableCell>
                  </TableRow>
                ) : null}
                {partners.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-medium">{p.agencyName}</TableCell>
                    <TableCell>
                      <code className="rounded bg-muted px-1.5 py-0.5 text-xs">{p.code}</code>
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                      {[p.email, p.phone].filter(Boolean).join(" · ") || "—"}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-muted-foreground text-sm">
                      {formatDate(p.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      {p.active ? (
                        <Badge variant="secondary">Active</Badge>
                      ) : (
                        <Badge variant="outline">Inactive</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </MasterShell>
  );
}
