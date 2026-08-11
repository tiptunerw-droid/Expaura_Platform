"use client";

import * as React from "react";
import { Search } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

interface Employee {
  id: string;
  name: string;
  jobTitle?: string | null;
  isActive: boolean;
  pendingComplaints: number;
  createdAt: Date | string;
}

export function StaffList({ employees }: { employees: Employee[] }) {
  const [query, setQuery] = React.useState("");
  const q = query.trim().toLowerCase();

  const filtered = q
    ? employees.filter(
        (e) =>
          e.name.toLowerCase().includes(q) ||
          (e.jobTitle ?? "").toLowerCase().includes(q)
      )
    : employees;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-display">Staff overview</CardTitle>
          <div className="relative w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-ink-muted pointer-events-none" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search staff…"
              className="pl-8 h-8 text-xs"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {filtered.map((emp) => (
            <div
              key={emp.id}
              className="flex items-center justify-between py-3 px-3 rounded-lg hover:bg-ceramic-deep/50 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-full bg-ceramic-deep flex items-center justify-center shrink-0">
                  <span className="font-display text-sm text-ink-muted">
                    {emp.name.charAt(0)}
                  </span>
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ink truncate">{emp.name}</p>
                  <p className="text-[10px] text-ink-muted">
                    {emp.jobTitle || "Staff"} · joined{" "}
                    {new Date(emp.createdAt).toLocaleDateString("en-RW", {
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className="text-xs text-ink-muted">Complaints</p>
                  <p className={`font-tabular text-sm font-medium ${
                    emp.pendingComplaints === 0 ? "text-herb" : emp.pendingComplaints <= 2 ? "text-brass" : "text-ember"
                  }`}>
                    {emp.pendingComplaints}
                  </p>
                </div>
                <div className="w-1 h-8 bg-line rounded-full" />
                <div className="text-right min-w-[60px]">
                  <p className="text-xs text-ink-muted">Status</p>
                  <Badge
                    variant={emp.isActive ? "herb" : "default"}
                    size="sm"
                  >
                    {emp.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
              </div>
            </div>
          ))}
        </div>
        {filtered.length === 0 && (
          <p className="text-center text-sm text-ink-muted py-6">
            No staff match &ldquo;{query.trim()}&rdquo;
          </p>
        )}
      </CardContent>
    </Card>
  );
}
