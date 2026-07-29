"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Building2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addBranch } from "@/lib/actions/branches";

export function AddBranchDialog() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [address, setAddress] = React.useState("");
  const [sending, setSending] = React.useState(false);
  const [error, setError] = React.useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Branch name is required");
      return;
    }
    setSending(true);
    setError("");
    try {
      await addBranch({
        name: name.trim(),
        address: address.trim() || undefined,
        cityId: "00000000-0000-0000-0000-000000000000",
      });
      setName("");
      setAddress("");
      setOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add branch");
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="primary" size="sm">
          <Building2 className="w-4 h-4" />
          Add branch
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add a branch</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="branch-name">Branch name</Label>
            <Input id="branch-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Downtown" required />
          </div>
          <div>
            <Label htmlFor="branch-address">Address (optional)</Label>
            <Input id="branch-address" value={address} onChange={(e) => setAddress(e.target.value)} placeholder="Street, building" />
          </div>
          {error && <p className="text-xs text-rose">{error}</p>}
          <Button type="submit" variant="primary" className="w-full" disabled={sending}>
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Building2 className="w-4 h-4" />}
            Add branch
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
