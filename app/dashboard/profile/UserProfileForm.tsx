"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, User } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { updateUserProfile } from "@/lib/actions/auth";

interface Props {
  user: { name: string; email: string };
}

export function UserProfileForm({ user }: Props) {
  const router = useRouter();
  const [saving, setSaving] = React.useState(false);
  const [message, setMessage] = React.useState("");
  const [name, setName] = React.useState(user.name);
  const [email, setEmail] = React.useState(user.email);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      await updateUserProfile({ name, email });
      setMessage("Saved");
      router.refresh();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-display text-lg text-ink flex items-center gap-2">
          <User className="w-4 h-4" />
          Your account
        </CardTitle>
        <CardDescription>
          This is the name and email used to sign in to Expaura.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="user-name">Your name</Label>
            <Input id="user-name" value={name} onChange={(e) => setName(e.target.value)} required />
          </div>
          <div>
            <Label htmlFor="user-email">Email</Label>
            <Input id="user-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>
          <div className="sm:col-span-2">
            {message && (
              <p className={`text-sm mb-2 ${message === "Saved" ? "text-herb" : "text-rose"}`}>{message}</p>
            )}
            <Button type="submit" variant="primary" disabled={saving}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Save account
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
