"use client";

import * as React from "react";
import { Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2, CheckCircle, AlertCircle, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { SiteHeader } from "@/components/site/header";
import { SiteFooter } from "@/components/site/footer";
import { acceptStaffInvite } from "@/lib/actions/staff";

function AcceptInviteForm() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [name, setName] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [sending, setSending] = React.useState(false);
  const [done, setDone] = React.useState(false);
  const [error, setError] = React.useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    setSending(true);
    setError("");
    try {
      await acceptStaffInvite({ token: token || "", name, password });
      setDone(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Acceptance failed");
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
              <p className="text-sm text-ink-soft mb-4">Invalid or missing invitation token.</p>
              <p className="text-xs text-ink-muted">Ask the restaurant owner to resend the invitation.</p>
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
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-brass-soft mb-2 mx-auto">
              <UserPlus className="w-6 h-6 text-brass" />
            </div>
            <CardTitle className="font-display text-2xl">Join your restaurant</CardTitle>
            <CardDescription>
              You&apos;ve been invited to join a restaurant on Expaura
            </CardDescription>
          </CardHeader>
          <CardContent>
            {done ? (
              <div className="text-center py-6">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-herb-soft mb-4">
                  <CheckCircle className="w-7 h-7 text-herb" />
                </div>
                <p className="text-sm text-ink-soft mb-1">Account created successfully!</p>
                <p className="text-xs text-ink-muted mb-4">You can now log in and access the dashboard.</p>
                <Link href="/login">
                  <Button variant="primary" size="sm">Log in</Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Full name</Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Your name"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="password">Password</Label>
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
                {error && <p className="text-xs text-rose">{error}</p>}
                <Button type="submit" variant="primary" className="w-full" disabled={sending}>
                  {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
                  Accept invitation
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

export default function AcceptInvitePage() {
  return (
    <Suspense fallback={
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </main>
    }>
      <AcceptInviteForm />
    </Suspense>
  );
}
