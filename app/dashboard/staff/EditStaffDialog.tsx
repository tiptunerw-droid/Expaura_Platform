"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Pencil, Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { updateStaff, listRestaurantRoles } from "@/lib/actions/staff";

interface RoleOption {
  id: string;
  name: string;
  description: string | null;
}

interface Props {
  staffId: string;
  name: string;
  email: string;
  roleId: string;
}

export function EditStaffDialog({ staffId, name, email, roleId }: Props) {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [form, setForm] = React.useState({ name, email, roleId });
  const [roles, setRoles] = React.useState<RoleOption[]>([]);
  const [saving, setSaving] = React.useState(false);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    if (!open) return;
    let cancelled = false;
    listRestaurantRoles()
      .then((loadedRoles) => {
        if (cancelled) return;
        setRoles(loadedRoles);
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
    if (!form.roleId) {
      setError("Please select a role");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await updateStaff({
        staffId,
        name: form.name,
        email: form.email,
        roleId: form.roleId,
      });
      setOpen(false);
      await router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Update failed");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button
        variant="outline"
        size="sm"
        className="h-7 w-7 p-0"
        aria-label={`Edit ${name}`}
        onClick={() => {
          setForm({ name, email, roleId });
          setError("");
          setOpen(true);
        }}
      >
        <Pencil className="w-3.5 h-3.5" />
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit staff member</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="edit-name">Name</Label>
            <Input
              id="edit-name"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>
          <div>
            <Label htmlFor="edit-email">Email</Label>
            <Input
              id="edit-email"
              type="email"
              value={form.email}
              onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
              required
            />
          </div>
          <div>
            <Label htmlFor="edit-role">Role</Label>
            <Select
              id="edit-role"
              value={form.roleId}
              onChange={(e) => setForm((prev) => ({ ...prev, roleId: e.target.value }))}
            >
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
          <Button type="submit" variant="primary" className="w-full" disabled={saving}>
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save changes
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
