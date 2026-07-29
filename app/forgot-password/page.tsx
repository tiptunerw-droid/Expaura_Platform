"use client";

import * as React from "react";
import Link from "next/link";
import { Mail, Loader2, ArrowLeft, CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { forgotPassword } from "@/lib/actions/auth";

export default function ForgotPasswordPage() {
  const [email, setEmail] = React.useState("");
  const [sending, setSending] = React.useState(false);
  const [done, setDone] = React.useState(false);
  const [error, setError] = React.useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError("");
    try {
      await forgotPassword({ email });
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send reset email");
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <SiteHeader />
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="font-display text-2xl">Reset password</CardTitle>
            <CardDescription>
              Enter your email and we&apos;ll send a reset link
            </CardDescription>
          </CardHeader>
          <CardContent>
            {done ? (
              <div className="text-center py-6">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-herb-soft mb-4">
                  <CheckCircle className="w-7 h-7 text-herb" />
                </div>
                <p className="text-sm text-ink-soft mb-4">
                  If an account exists with that email, you&apos;ll receive a reset link shortly.
                </p>
                <Link href="/login">
                  <Button variant="outline" size="sm">Back to login</Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="manager@restaurant.rw"
                    required
                  />
                </div>
                {error && <p className="text-xs text-rose">{error}</p>}
                <Button type="submit" variant="primary" className="w-full" disabled={sending}>
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
                  Send reset link
                </Button>
                <Link
                  href="/login"
                  className="flex items-center justify-center gap-1 text-xs text-ink-muted hover:text-ink mt-2"
                >
                  <ArrowLeft className="w-3 h-3" />
                  Back to login
                </Link>
              </form>
            )}
          </CardContent>
        </Card>
      </main>
      <SiteFooter />
    </>
  );
}
