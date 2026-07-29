"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Send, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { submitComplaint, getComplaintCategories } from "@/lib/actions/complaints";

interface ComplaintFormProps {
  restaurantId: string;
  branchId?: string;
}

export function ComplaintForm({ restaurantId, branchId }: ComplaintFormProps) {
  const router = useRouter();
  const [categories, setCategories] = React.useState<{ id: string; name: string }[]>([]);
  const [categoryId, setCategoryId] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [employeeName, setEmployeeName] = React.useState("");
  const [tableNumber, setTableNumber] = React.useState("");
  const [receiptNumber, setReceiptNumber] = React.useState("");
  const [step, setStep] = React.useState<"form" | "done">("form");
  const [sending, setSending] = React.useState(false);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    getComplaintCategories().then(setCategories).catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryId) {
      setError("Please select a category");
      return;
    }
    if (!description.trim()) {
      setError("Please describe the issue");
      return;
    }
    setSending(true);
    setError("");
    try {
      await submitComplaint({
        restaurantId,
        branchId,
        categoryId,
        description: description.trim(),
        employeeName: employeeName.trim() || undefined,
        tableNumber: tableNumber.trim() || undefined,
        receiptNumber: receiptNumber.trim() || undefined,
      });
      setStep("done");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setSending(false);
    }
  };

  if (step === "done") {
    return (
      <div className="text-center py-8">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-ember-soft mb-4">
          <CheckCircle className="w-7 h-7 text-ember" />
        </div>
        <h3 className="font-display text-xl text-ink mb-1">Complaint sent</h3>
        <p className="text-sm text-ink-muted">
          The restaurant manager has been notified and will follow up.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="category">Category</Label>
        <Select
          id="category"
          value={categoryId}
          onChange={(e) => setCategoryId(e.target.value)}
          required
        >
          <option value="">Select a category…</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </Select>
      </div>

      <div>
        <Label htmlFor="description">What happened?</Label>
        <Textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe the issue — the more detail, the better the response"
          rows={3}
          required
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <Label htmlFor="employeeName">Staff name (optional)</Label>
          <Input
            id="employeeName"
            value={employeeName}
            onChange={(e) => setEmployeeName(e.target.value)}
            placeholder="e.g. Jean"
          />
        </div>
        <div>
          <Label htmlFor="tableNumber">Table (optional)</Label>
          <Input
            id="tableNumber"
            value={tableNumber}
            onChange={(e) => setTableNumber(e.target.value)}
            placeholder="e.g. 12"
          />
        </div>
        <div>
          <Label htmlFor="receiptNumber">Receipt (optional)</Label>
          <Input
            id="receiptNumber"
            value={receiptNumber}
            onChange={(e) => setReceiptNumber(e.target.value)}
            placeholder="e.g. INV-001"
          />
        </div>
      </div>

      {error && <p className="text-xs text-rose">{error}</p>}

      <Button type="submit" variant="destructive" className="w-full" disabled={sending}>
        {sending ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <Send className="w-4 h-4" />
        )}
        Send complaint
      </Button>
    </form>
  );
}
