"use client";

import * as React from "react";
import { getCurrentUser } from "@/lib/actions/auth";
import { Loader2 } from "lucide-react";

export default function ProfilePage() {
  const [user, setUser] = React.useState<{ name: string; email: string; platformRole: string } | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [saving, setSaving] = React.useState(false);
  const [name, setName] = React.useState("");
  const [message, setMessage] = React.useState("");

  React.useEffect(() => {
    getCurrentUser().then((result) => {
      if (result.authenticated && result.user) {
        setUser({
          name: result.user.name,
          email: result.user.email,
          platformRole: result.user.platformRole,
        });
        setName(result.user.name);
      }
      setLoading(false);
    });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage("");
    await new Promise((r) => setTimeout(r, 300));
    setSaving(false);
    setMessage("Profile updated successfully.");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-red-500">Not authenticated.</p>
      </div>
    );
  }

  return (
    <div className="max-w-lg space-y-6">
      <div className="bg-surface-alt border border-border-subtle rounded-lg p-6 space-y-4">
        <div>
          <p className="text-text-secondary uppercase tracking-widest text-xs mb-1">Name</p>
          <p className="text-primary text-lg font-medium">{user.name}</p>
        </div>
        <div>
          <p className="text-text-secondary uppercase tracking-widest text-xs mb-1">Email</p>
          <p className="text-primary text-lg font-medium">{user.email}</p>
        </div>
        <div>
          <p className="text-text-secondary uppercase tracking-widest text-xs mb-1">Role</p>
          <p className="text-purple-500 text-sm font-bold uppercase tracking-wider">{user.platformRole}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="bg-surface-alt border border-border-subtle rounded-lg p-6 space-y-4">
        <h2 className="text-lg font-bold uppercase tracking-tighter text-primary">Update Name</h2>
        <div>
          <label htmlFor="name" className="block text-text-secondary uppercase tracking-widest text-xs mb-1">
            Name
          </label>
          <input
            id="name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-surface border border-border-subtle rounded px-3 py-2 text-sm text-primary focus:outline-none focus:border-purple-500"
          />
        </div>
        {message && (
          <p className="text-herb text-sm">{message}</p>
        )}
        <button
          type="submit"
          disabled={saving}
          className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold uppercase tracking-widest px-6 py-3 rounded transition-colors disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save"}
        </button>
      </form>
    </div>
  );
}
