"use client";

import * as React from "react";
import { getAuditLogs } from "@/lib/actions/audit";
import { Loader2 } from "lucide-react";

type AuditEntry = Awaited<ReturnType<typeof getAuditLogs>>[number];

const actionTypes = Array.from(
  new Set([
    "SUPER_ADMIN_LOGIN",
    "SUPER_ADMIN_BOOTSTRAP_REGISTERED",
    "USER_LOGIN",
    "RESTAURANT_OWNER_REGISTERED",
    "PASSWORD_RESET_COMPLETED",
  ])
);

const entityTypes = Array.from(new Set(["User", "Restaurant", "Subscription", "Complaint", "Review"]));

export default function AuditLogsPage() {
  const [logs, setLogs] = React.useState<AuditEntry[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState("");
  const [actionFilter, setActionFilter] = React.useState("");
  const [entityFilter, setEntityFilter] = React.useState("");

  React.useEffect(() => {
    getAuditLogs()
      .then(setLogs)
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

  const filtered = logs.filter((log) => {
    if (actionFilter && log.action !== actionFilter) return false;
    if (entityFilter && log.entity !== entityFilter) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <select
          value={actionFilter}
          onChange={(e) => setActionFilter(e.target.value)}
          className="bg-surface-alt border border-border-subtle rounded px-3 py-2 text-sm text-primary focus:outline-none focus:border-purple-500"
        >
          <option value="">All Actions</option>
          {actionTypes.map((a) => (
            <option key={a} value={a}>{a}</option>
          ))}
        </select>
        <select
          value={entityFilter}
          onChange={(e) => setEntityFilter(e.target.value)}
          className="bg-surface-alt border border-border-subtle rounded px-3 py-2 text-sm text-primary focus:outline-none focus:border-purple-500"
        >
          <option value="">All Entities</option>
          {entityTypes.map((e) => (
            <option key={e} value={e}>{e}</option>
          ))}
        </select>
      </div>

      <div className="bg-surface-alt border border-border-subtle rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-text-secondary uppercase tracking-widest text-xs border-b border-border-subtle">
                <th className="text-left px-4 py-3 font-medium">Date</th>
                <th className="text-left px-4 py-3 font-medium">User</th>
                <th className="text-left px-4 py-3 font-medium">Action</th>
                <th className="text-left px-4 py-3 font-medium">Entity</th>
                <th className="text-left px-4 py-3 font-medium">Details</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((log) => (
                <tr key={log.id} className="border-b border-border-subtle hover:bg-surface/50 transition-colors">
                  <td className="px-4 py-3 text-sm text-primary whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-sm text-primary">
                    {log.user?.name || log.user?.email || "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-purple-500">
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-primary">{log.entity}</td>
                  <td className="px-4 py-3 text-sm text-text-secondary max-w-xs truncate">
                    {log.restaurant ? `Restaurant: ${log.restaurant.name}` : "—"}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-8 text-center text-text-secondary text-sm">
                    No audit logs found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
