"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import {
  Pencil,
  Plus,
  Trash2,
  Loader2,
  Tag,
  Utensils,
  UtensilsCrossed,
  Clock,
  Receipt,
  Wallet,
  Sparkles,
  Droplets,
  Thermometer,
  Smile,
  Handshake,
  UserX,
  Music,
  Volume2,
  Wifi,
  MessageSquare,
  AlertTriangle,
  Leaf,
  Bug,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createComplaintCategory,
  updateComplaintCategory,
  deleteComplaintCategory,
} from "@/lib/actions/complaints";

export interface CategoryRow {
  id: string;
  name: string;
  icon: string | null;
  complaintCount: number;
}

const CATEGORY_ICONS: { value: string; label: string; icon: LucideIcon }[] = [
  { value: "Utensils", label: "Food", icon: Utensils },
  { value: "UtensilsCrossed", label: "Food quality", icon: UtensilsCrossed },
  { value: "Clock", label: "Wait time", icon: Clock },
  { value: "Receipt", label: "Billing", icon: Receipt },
  { value: "Wallet", label: "Pricing", icon: Wallet },
  { value: "Sparkles", label: "Cleanliness", icon: Sparkles },
  { value: "Droplets", label: "Hygiene", icon: Droplets },
  { value: "Thermometer", label: "Temperature", icon: Thermometer },
  { value: "Smile", label: "Friendliness", icon: Smile },
  { value: "Handshake", label: "Staff behavior", icon: Handshake },
  { value: "UserX", label: "Staff attitude", icon: UserX },
  { value: "Music", label: "Ambience", icon: Music },
  { value: "Volume2", label: "Noise level", icon: Volume2 },
  { value: "Wifi", label: "Connectivity", icon: Wifi },
  { value: "MessageSquare", label: "Communication", icon: MessageSquare },
  { value: "AlertTriangle", label: "General issue", icon: AlertTriangle },
  { value: "Leaf", label: "Freshness", icon: Leaf },
  { value: "Bug", label: "Other", icon: Bug },
];

function CategoryIconDisplay({ value }: { value: string }) {
  const match = CATEGORY_ICONS.find((i) => i.value === value);
  if (!match) {
    return <span className="text-xs">{value}</span>;
  }
  const Icon = match.icon;
  return (
    <span className="inline-flex items-center gap-1.5">
      <Icon className="w-4 h-4" />
      <span className="text-text-secondary text-xs">{match.label}</span>
    </span>
  );
}

export function CategoryManager({ categories }: { categories: CategoryRow[] }) {
  const router = useRouter();
  const [formOpen, setFormOpen] = React.useState(false);
  const [editing, setEditing] = React.useState<CategoryRow | null>(null);
  const [deleting, setDeleting] = React.useState<CategoryRow | null>(null);
  const [name, setName] = React.useState("");
  const [icon, setIcon] = React.useState("");
  const [sending, setSending] = React.useState(false);
  const [error, setError] = React.useState("");

  const openCreate = () => {
    setEditing(null);
    setName("");
    setIcon("");
    setError("");
    setFormOpen(true);
  };

  const openEdit = (category: CategoryRow) => {
    setEditing(category);
    setName(category.name);
    setIcon(category.icon ?? "");
    setError("");
    setFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Category name is required");
      return;
    }
    setSending(true);
    setError("");
    try {
      if (editing) {
        await updateComplaintCategory({
          id: editing.id,
          name: name.trim(),
          icon: icon.trim() || null,
        });
      } else {
        await createComplaintCategory({
          name: name.trim(),
          icon: icon.trim() || null,
        });
      }
      setFormOpen(false);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save category");
    } finally {
      setSending(false);
    }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    setSending(true);
    setError("");
    try {
      await deleteComplaintCategory({ id: deleting.id });
      setDeleting(null);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete category");
    } finally {
      setSending(false);
    }
  };

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold uppercase tracking-tighter text-primary">
          Complaint Categories
        </h2>
        <Button variant="primary" size="sm" onClick={openCreate}>
          <Plus className="w-4 h-4" />
          Add category
        </Button>
      </div>

      <div className="bg-surface-alt border border-border-subtle rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-text-secondary uppercase tracking-widest text-xs border-b border-border-subtle">
                <th className="text-left px-4 py-3 font-medium">Name</th>
                <th className="text-left px-4 py-3 font-medium">Icon</th>
                <th className="text-right px-4 py-3 font-medium">Complaints</th>
                <th className="text-right px-4 py-3 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr
                  key={cat.id}
                  className="border-b border-border-subtle hover:bg-surface/50 transition-colors"
                >
                  <td className="px-4 py-3 text-sm text-primary">
                    <span className="flex items-center gap-2">
                      <Tag className="w-3.5 h-3.5 text-text-secondary" />
                      {cat.name}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-text-secondary">
                    {cat.icon ? <CategoryIconDisplay value={cat.icon} /> : "—"}
                  </td>
                  <td className="px-4 py-3 text-sm text-right text-primary font-tabular">
                    {cat.complaintCount}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openEdit(cat)}
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setDeleting(cat);
                          setError("");
                        }}
                      >
                        <Trash2 className="w-3.5 h-3.5 text-rose" />
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
              {categories.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-4 py-8 text-center text-text-secondary text-sm"
                  >
                    No categories yet. Add one so guests can pick it when
                    reporting an issue.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit category" : "Add a category"}
            </DialogTitle>
            <DialogDescription>
              Categories appear in the guest report form and help managers
              route issues correctly.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="category-name">Name</Label>
              <Input
                id="category-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Food quality"
                required
              />
            </div>
            <div>
              <p className="text-sm font-medium text-text-primary mb-2">Icon</p>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                <button
                  type="button"
                  onClick={() => setIcon("")}
                  title="No icon"
                  className={cn(
                    "flex flex-col items-center justify-center gap-1 rounded border p-2 text-[10px] transition-colors",
                    icon === ""
                      ? "border-purple-500 bg-purple-500/10 text-primary"
                      : "border-border-subtle text-text-secondary hover:border-purple-500/50"
                  )}
                >
                  <span className="w-5 h-5" />
                  None
                </button>
                {CATEGORY_ICONS.map((item) => {
                  const Icon = item.icon;
                  const selected = icon === item.value;
                  return (
                    <button
                      key={item.value}
                      type="button"
                      onClick={() => setIcon(selected ? "" : item.value)}
                      title={item.label}
                      className={cn(
                        "flex flex-col items-center justify-center gap-1 rounded border p-2 text-[10px] transition-colors",
                        selected
                          ? "border-purple-500 bg-purple-500/10 text-primary"
                          : "border-border-subtle text-text-secondary hover:border-purple-500/50"
                      )}
                    >
                      <Icon className="w-5 h-5" />
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </div>
            {error && <p className="text-xs text-rose">{error}</p>}
            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={sending}
            >
              {sending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Tag className="w-4 h-4" />
              )}
              {editing ? "Save changes" : "Add category"}
            </Button>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog
        open={deleting !== null}
        onOpenChange={(open) => {
          if (!open) setDeleting(null);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete category</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete &quot;{deleting?.name}&quot;?
              This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {error && <p className="text-xs text-rose">{error}</p>}
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => setDeleting(null)}
              disabled={sending}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={sending}
            >
              {sending && <Loader2 className="w-4 h-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </section>
  );
}
