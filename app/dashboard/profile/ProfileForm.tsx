"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Loader2, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
        <div>
          <Label htmlFor="logoUrl">Logo URL</Label>
          <Input id="logoUrl" value={form.logoUrl} onChange={handleChange("logoUrl")} placeholder="https://res.cloudinary.com/..." />
        </div>
        <div>
          <Label htmlFor="coverImageUrl">Cover image URL</Label>
          <Input id="coverImageUrl" value={form.coverImageUrl} onChange={handleChange("coverImageUrl")} placeholder="https://res.cloudinary.com/..." />
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
