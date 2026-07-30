"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { CloudinaryUpload } from "@/components/ui/cloudinary-upload";
import { updateRestaurantProfile } from "@/lib/actions/restaurants";

interface RestaurantData {
  id: string;
  name: string;
  phone?: string | null;
  whatsapp?: string | null;
  email?: string | null;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  openingHours?: unknown;
  logoUrl?: string | null;
  coverImageUrl?: string | null;
  instagramUrl?: string | null;
  facebookUrl?: string | null;
  city?: { name: string } | null;
}

interface Props {
  restaurant: RestaurantData;
}

export function ProfileForm({ restaurant }: Props) {
  const router = useRouter();
  const [saving, setSaving] = React.useState(false);
  const [message, setMessage] = React.useState("");
  const [form, setForm] = React.useState({
    name: restaurant.name,
    phone: restaurant.phone || "",
    whatsapp: restaurant.whatsapp || "",
    email: restaurant.email || "",
    address: restaurant.address || "",
    instagramUrl: restaurant.instagramUrl || "",
    facebookUrl: restaurant.facebookUrl || "",
    logoUrl: restaurant.logoUrl || "",
    coverImageUrl: restaurant.coverImageUrl || "",
  });

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [field]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    try {
      await updateRestaurantProfile({
        name: form.name,
        phone: form.phone || undefined,
        whatsapp: form.whatsapp || undefined,
        email: form.email || undefined,
        address: form.address || undefined,
        instagramUrl: form.instagramUrl || undefined,
        facebookUrl: form.facebookUrl || undefined,
        logoUrl: form.logoUrl || undefined,
        coverImageUrl: form.coverImageUrl || undefined,
      });
      setMessage("Saved");
      router.refresh();
    } catch (err) {
      setMessage(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <Label htmlFor="name">Restaurant name</Label>
          <Input id="name" value={form.name} onChange={handleChange("name")} required />
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" value={form.phone} onChange={handleChange("phone")} placeholder="+250 788 000 000" />
        </div>
        <div>
          <Label htmlFor="whatsapp">WhatsApp</Label>
          <Input id="whatsapp" value={form.whatsapp} onChange={handleChange("whatsapp")} placeholder="+250 788 000 000" />
        </div>
        <div>
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={form.email} onChange={handleChange("email")} />
        </div>
        <div>
          <Label htmlFor="city">City</Label>
          <Input id="city" value={restaurant.city?.name || ""} disabled className="bg-ceramic-deep" />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="address">Address</Label>
          <Textarea id="address" value={form.address} onChange={handleChange("address")} rows={2} />
        </div>
        <div>
          <Label htmlFor="instagram">Instagram URL</Label>
          <Input id="instagram" value={form.instagramUrl} onChange={handleChange("instagramUrl")} placeholder="https://instagram.com/..." />
        </div>
        <div>
          <Label htmlFor="facebook">Facebook URL</Label>
          <Input id="facebook" value={form.facebookUrl} onChange={handleChange("facebookUrl")} placeholder="https://facebook.com/..." />
        </div>
        <div className="sm:col-span-2">
          <Label>Restaurant logo</Label>
          {form.logoUrl ? (
            <div className="flex items-center gap-3 p-3 bg-surface-alt border border-border-subtle rounded-lg">
              <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-800 shrink-0">
                <Image src={form.logoUrl} alt="Logo" fill className="object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs text-gray-400 truncate">{form.logoUrl}</p>
              </div>
              <button
                type="button"
                onClick={() => setForm((prev) => ({ ...prev, logoUrl: "" }))}
                className="text-[10px] text-rose-400 hover:text-rose-300 uppercase tracking-widest font-bold"
              >
                Remove
              </button>
            </div>
          ) : null}
          {!form.logoUrl ? (
            <CloudinaryUpload
              onUploaded={(url) => setForm((prev) => ({ ...prev, logoUrl: url }))}
            />
          ) : null}
        </div>
        <div className="sm:col-span-2">
          <Label>Cover image</Label>
          {form.coverImageUrl ? (
            <div className="relative aspect-[3/1] rounded-lg overflow-hidden bg-surface-alt border border-border-subtle group">
              <Image src={form.coverImageUrl} alt="Cover" fill className="object-cover" />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => setForm((prev) => ({ ...prev, coverImageUrl: "" }))}
                  className="text-xs text-rose-400 hover:text-rose-300 uppercase tracking-widest font-bold bg-black/60 px-3 py-1.5 rounded"
                >
                  Remove
                </button>
              </div>
            </div>
          ) : null}
          {!form.coverImageUrl ? (
            <CloudinaryUpload
              onUploaded={(url) => setForm((prev) => ({ ...prev, coverImageUrl: url }))}
            />
          ) : null}
        </div>
      </div>

      {message && (
        <p className={`text-sm ${message === "Saved" ? "text-herb" : "text-rose"}`}>{message}</p>
      )}

      <Button type="submit" variant="primary" disabled={saving}>
        {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
        Save changes
      </Button>
    </form>
  );
}
