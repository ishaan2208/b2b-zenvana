"use client";

import { Mail, Phone } from "lucide-react";

import ProtectedShell from "@/components/b2b/ProtectedShell";
import { Card, CardContent } from "@/components/ui/Card";

export default function ContactUsPage() {
  return (
    <ProtectedShell>
      <div className="mx-auto w-full max-w-3xl">
        <Card className="rounded-3xl border border-border/60 bg-card shadow-sm">
          <CardContent className="space-y-5 p-5 sm:p-6">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Contact Us</h1>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-background p-4">
                <Phone className="h-5 w-5 text-primary" />
                <a href="tel:9084702208" className="text-sm font-medium sm:text-base">
                  9084702208
                </a>
              </div>

              <div className="flex items-center gap-3 rounded-2xl border border-border/60 bg-background p-4">
                <Mail className="h-5 w-5 text-primary" />
                <a
                  href="mailto:admin@zenvanahotels.com"
                  className="text-sm font-medium sm:text-base"
                >
                  admin@zenvanahotels.com
                </a>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </ProtectedShell>
  );
}
