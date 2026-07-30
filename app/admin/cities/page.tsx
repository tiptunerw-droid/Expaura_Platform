"use client";

import * as React from "react";
import { getCitiesData } from "@/lib/actions/cities";
import { Loader2 } from "lucide-react";

interface CityRow {
  id: string;
  name: string;
  region: string | null;
  country: string;
  restaurantCount: number;
}

interface CategoryRow {
  id: string;
  name: string;
  icon: string | null;
  complaintCount: number;
}

export default function CitiesPage() {
  const [cities, setCities] = React.useState<CityRow[]>([]);
  const [categories, setCategories] = React.useState<CategoryRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");

  React.useEffect(() => {
    getCitiesData()
      .then((data) => {
        setCities(data.cities);
        setCategories(data.categories);
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <section>
        <h2 className="text-xl font-bold uppercase tracking-tighter text-primary mb-4">Cities</h2>
        <div className="bg-surface-alt border border-border-subtle rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-text-secondary uppercase tracking-widest text-xs border-b border-border-subtle">
                  <th className="text-left px-4 py-3 font-medium">Name</th>
                  <th className="text-left px-4 py-3 font-medium">Region</th>
                  <th className="text-left px-4 py-3 font-medium">Country</th>
                  <th className="text-right px-4 py-3 font-medium">Restaurants</th>
                </tr>
              </thead>
              <tbody>
                {cities.map((city) => (
                  <tr key={city.id} className="border-b border-border-subtle hover:bg-surface/50 transition-colors">
                    <td className="px-4 py-3 text-sm text-primary">{city.name}</td>
                    <td className="px-4 py-3 text-sm text-text-secondary">{city.region || "—"}</td>
                    <td className="px-4 py-3 text-sm text-text-secondary">{city.country}</td>
                    <td className="px-4 py-3 text-sm text-right text-primary font-tabular">{city.restaurantCount}</td>
                  </tr>
                ))}
                {cities.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-text-secondary text-sm">No cities found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section>
        <h2 className="text-xl font-bold uppercase tracking-tighter text-primary mb-4">Complaint Categories</h2>
        <div className="bg-surface-alt border border-border-subtle rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="text-text-secondary uppercase tracking-widest text-xs border-b border-border-subtle">
                  <th className="text-left px-4 py-3 font-medium">Name</th>
                  <th className="text-left px-4 py-3 font-medium">Icon</th>
                  <th className="text-right px-4 py-3 font-medium">Complaints</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((cat) => (
                  <tr key={cat.id} className="border-b border-border-subtle hover:bg-surface/50 transition-colors">
                    <td className="px-4 py-3 text-sm text-primary">{cat.name}</td>
                    <td className="px-4 py-3 text-sm text-text-secondary">{cat.icon || "—"}</td>
                    <td className="px-4 py-3 text-sm text-right text-primary font-tabular">{cat.complaintCount}</td>
                  </tr>
                ))}
                {categories.length === 0 && (
                  <tr>
                    <td colSpan={3} className="px-4 py-8 text-center text-text-secondary text-sm">No categories found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}
