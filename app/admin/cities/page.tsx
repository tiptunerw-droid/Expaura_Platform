import * as React from "react";
import { getCitiesData } from "@/lib/actions/cities";
import { CategoryManager } from "./CategoryManager";

export const dynamic = "force-dynamic";
export const metadata = { title: "Cities & Categories" };

export default async function CitiesPage() {
  let data;
  try {
    data = await getCitiesData();
  } catch {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-red-500">Unauthorized. Admin access required.</p>
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
                {data.cities.map((city) => (
                  <tr key={city.id} className="border-b border-border-subtle hover:bg-surface/50 transition-colors">
                    <td className="px-4 py-3 text-sm text-primary">{city.name}</td>
                    <td className="px-4 py-3 text-sm text-text-secondary">{city.region || "—"}</td>
                    <td className="px-4 py-3 text-sm text-text-secondary">{city.country}</td>
                    <td className="px-4 py-3 text-sm text-right text-primary font-tabular">{city.restaurantCount}</td>
                  </tr>
                ))}
                {data.cities.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-text-secondary text-sm">No cities found.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <CategoryManager categories={data.categories} />
    </div>
  );
}
