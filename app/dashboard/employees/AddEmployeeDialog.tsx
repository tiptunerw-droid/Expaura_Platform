"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { UserPlus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { addEmployee } from "@/lib/actions/employees";

export function AddEmployeeDialog() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [name, setName] = React.useState("");
  const [jobTitle, setJobTitle] = React.useState("");
  const [sending, setSending] = React.useState(false);
  const [error, setError] = React.useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Name is required");
      return;
    }
    setSending(true);
    setError("");
    try {
      await addEmployee({
        name: name.trim(),
        jobTitle: jobTitle.trim() || undefined,
      });
      setName("");
      setJobTitle("");
      setOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add");
    } finally {
      setSending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="primary" size="sm">
          <UserPlus className="w-4 h-4" />
          Add employee
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add employee</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="emp-name">Full name</Label>
            <Input id="emp-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Jean Baptiste" required />
          </div>
          <div>
            <Label htmlFor="emp-title">Job title (optional)</Label>
            <Input id="emp-title" value={jobTitle} onChange={(e) => setJobTitle(e.target.value)} placeholder="e.g. Waiter, Chef" />
          </div>
          {error && <p className="text-xs text-rose">{error}</p>}
          <Button type="submit" variant="primary" className="w-full" disabled={sending}>
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserPlus className="w-4 h-4" />}
            Add employee
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
