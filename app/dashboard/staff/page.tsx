import * as React from "react";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth/session";
import { hasPermission } from "@/lib/auth/permissions";
import { Users } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { EmptyState } from "@/components/ui/empty-state";
import { formatDate } from "@/lib/utils";
import { InviteStaffDialog } from "./InviteStaffDialog";
import { EditStaffDialog } from "./EditStaffDialog";
import { StaffStatusControl } from "./StaffStatusControl";

export const metadata = { title: "Staff" };

export default async function StaffPage() {
  const session = await getSession();
  if (!session?.activeRestaurantId) {
    return <div className="flex flex-col items-center justify-center py-20"><Link href="/login"><Button>Log in</Button></Link></div>;
  }

  const canManageStaff = await hasPermission("MANAGE_STAFF");

  const staff = await prisma.restaurantStaff.findMany({
    where: { restaurantId: session.activeRestaurantId },
    include: {
      user: { select: { id: true, name: true, email: true, lastLogin: true } },
      role: true,
      inviter: { select: { name: true } },
    },
    orderBy: { joinedAt: "desc" },
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-xl text-ink">Staff</h2>
          <p className="text-sm text-ink-muted mt-0.5">{staff.length} member{staff.length !== 1 ? "s" : ""}</p>
        </div>
        {canManageStaff ? <InviteStaffDialog /> : null}
      </div>

      {staff.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead>Last login</TableHead>
              {canManageStaff ? <TableHead className="w-32">Actions</TableHead> : null}
            </TableRow>
          </TableHeader>
          <TableBody>
            {staff.map((s) => (
              <TableRow key={s.id}>
                <TableCell className="font-medium text-text-primary">
                  {s.user.name}
                  {s.userId === session.userId ? <span className="ml-1.5 text-xs text-ink-muted">(you)</span> : null}
                </TableCell>
                <TableCell className="text-sm text-text-primary">{s.user.email}</TableCell>
                <TableCell>
                  <Badge variant="outline" size="sm">{s.role.name}</Badge>
                </TableCell>
                <TableCell>
                  <Badge variant={s.isActive ? "herb" : "default"} size="sm">
                    {s.isActive ? "Active" : "Inactive"}
                  </Badge>
                </TableCell>
                <TableCell className="font-tabular text-xs text-text-primary">{formatDate(s.joinedAt)}</TableCell>
                <TableCell className="font-tabular text-xs text-text-primary">
                  {s.user.lastLogin ? formatDate(s.user.lastLogin) : "Never"}
                </TableCell>
                {canManageStaff ? (
                  <TableCell>
                    {s.userId !== session.userId ? (
                      <div className="flex items-center gap-2">
                        <EditStaffDialog
                          staffId={s.id}
                          name={s.user.name}
                          email={s.user.email}
                          roleId={s.roleId}
                        />
                        <StaffStatusControl
                          staffId={s.id}
                          isActive={s.isActive}
                          memberName={s.user.name}
                        />
                      </div>
                    ) : null}
                  </TableCell>
                ) : null}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <EmptyState
          icon={<Users className="w-full h-full" />}
          variant="neutral"
          title="No staff yet"
          description="Invite your team members to help manage the restaurant."
          action={canManageStaff ? <InviteStaffDialog /> : undefined}
        />
      )}
    </div>
  );
}
