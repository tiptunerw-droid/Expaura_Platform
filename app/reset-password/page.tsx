"use client";

import * as React from "react";
import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Lock, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { resetPassword } from "@/lib/actions/auth";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [sending, setSending] = React.useState(false);
  const [done, setDone] = React.useState(false);
  const [error, setError] = React.useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    setSending(true);
    setError("");
    try {
      await resetPassword({ token: token || "", newPassword: password });
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Reset failed");
    } finally {
      setSending(false);
    }
  };

  if (!token) {
    return (
      <>
        <SiteHeader />
        <main className="flex-1 flex items-center justify-center px-4 py-16">
          <Card className="w-full max-w-md">
            <CardContent className="text-center py-8">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-rose-soft mb-4">
                <AlertCircle className="w-7 h-7 text-rose" />
              </div>
              <p className="text-sm text-ink-soft mb-4">Invalid or missing reset token.</p>
              <Link href="/forgot-password">
                <Button variant="outline" size="sm">Request new link</Button>
              </Link>
            </CardContent>
          </Card>
        </main>
        <SiteFooter />
      </>
    );
  }

  return (
    <>
      <SiteHeader />
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="font-display text-2xl">Set new password</CardTitle>
            <CardDescription>Choose a strong password for your account</CardDescription>
          </CardHeader>
          <CardContent>
            {done ? (
              <div className="text-center py-6">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-herb-soft mb-4">
                  <CheckCircle className="w-7 h-7 text-herb" />
                </div>
                <p className="text-sm text-ink-soft mb-4">Password reset successfully.</p>
                <Link href="/login">
                  <Button variant="primary" size="sm">Log in</Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="password">New password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 8 characters"
                    required
                    minLength={8}
                  />
                </div>
                <div>
                  <Label htmlFor="confirm">Confirm password</Label>
                  <Input
                    id="confirm"
                    type="password"
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder="Repeat password"
                    required
                  />
                </div>
                {error && <p className="text-xs text-rose">{error}</p>}
                <Button type="submit" variant="primary" className="w-full" disabled={sending}>
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Lock className="w-4 h-4" />}
                  Reset password
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </main>
      <SiteFooter />
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </main>
    }>
      <ResetPasswordForm />
    </Suspense>
  );
}
