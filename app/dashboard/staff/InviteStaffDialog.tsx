"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { UserPlus, Loader2, Mail, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { inviteStaff, listRestaurantRoles } from "@/lib/actions/staff";

interface RoleOption {
  id: string;
  name: string;
  description: string | null;
}

export function InviteStaffDialog() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [roles, setRoles] = React.useState<RoleOption[]>([]);
  const [role, setRole] = React.useState("");
  const [sending, setSending] = React.useState(false);
  const [error, setError] = React.useState("");
  const [done, setDone] = React.useState(false);

  React.useEffect(() => {
    if (!open) return;
    let cancelled = false;
    listRestaurantRoles()
      .then((loadedRoles) => {
        if (cancelled) return;
        setRoles(loadedRoles);
        setRole((current) => {
          if (current && loadedRoles.some((r) => r.id === current)) return current;
          const manager = loadedRoles.find((r) => r.name === "Manager");
          return manager ? manager.id : (loadedRoles[0]?.id ?? "");
        });
      })
      .catch(() => {
        if (!cancelled) setError("Failed to load roles. Try again.");
      });
    return () => {
      cancelled = true;
    };
  }, [open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!role) {
      setError("Please select a role");
      return;
    }
    setSending(true);
    setError("");
    try {
      await inviteStaff({ email, roleId: role });
      setDone(true);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Invite failed");
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) { setDone(false); setEmail(""); } }}>
      <Button variant="primary" size="sm" onClick={() => setOpen(true)}>
        <UserPlus className="w-4 h-4" />
        Invite staff
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite a team member</DialogTitle>
        </DialogHeader>
        {done ? (
          <div className="text-center py-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-herb-soft mb-3">
              <Mail className="w-6 h-6 text-herb" />
            </div>
            <p className="text-sm text-ink-soft mb-1">Invitation sent to {email}</p>
            <p className="text-xs text-ink-muted">They&apos;ll receive an email to set up their account.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="invite-email">Email address</Label>
              <Input
                id="invite-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="colleague@restaurant.rw"
                required
              />
            </div>
            <div>
              <Label htmlFor="invite-role">Role</Label>
              <Select id="invite-role" value={role} onChange={(e) => setRole(e.target.value)}>
                {roles.length === 0 ? (
                  <option value="">No roles available</option>
                ) : (
                  roles.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.name}
                      {r.description ? ` — ${r.description}` : ""}
                    </option>
                  ))
                )}
              </Select>
            </div>
            {error && <p className="text-xs text-rose">{error}</p>}
            <Button type="submit" variant="primary" className="w-full" disabled={sending}>
              {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              Send invitation
            </Button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
