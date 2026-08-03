"use client";

import * as React from "react";
import { Bell, MessageSquare, AlertCircle, CheckCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { getNotifications, getUnreadCount, markAsRead, markAllAsRead } from "@/lib/actions/notifications";
import type { NotificationType } from "@/generated/prisma/client";

type Notification = {
  id: string;
  type: NotificationType;
  title: string;
  message: string | null;
  link: string | null;
  isRead: boolean;
  createdAt: Date;
  restaurantName?: string | null;
};

const iconMap: Record<NotificationType, typeof MessageSquare> = {
  NEW_REVIEW: MessageSquare,
  NEW_COMPLAINT: AlertCircle,
  COMPLAINT_RESOLVED: CheckCircle,
};

const colorMap: Record<NotificationType, string> = {
  NEW_REVIEW: "text-emerald-500",
  NEW_COMPLAINT: "text-red-500",
  COMPLAINT_RESOLVED: "text-blue-500",
};

export function NotificationDropdown() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [notifications, setNotifications] = React.useState<Notification[]>([]);
  const [unread, setUnread] = React.useState(0);

  React.useEffect(() => {
    getUnreadCount().then(setUnread);
  }, []);

  const toggle = React.useCallback(async () => {
    if (!open) {
      const [items, count] = await Promise.all([
        getNotifications(8),
        getUnreadCount(),
      ]);
      setNotifications(
        items.map((n) => ({
          id: n.id,
          type: n.type,
          title: n.title,
          message: n.message,
          link: n.link,
          isRead: n.isRead,
          createdAt: n.createdAt,
          restaurantName: n.restaurant?.name ?? null,
        })),
      );
      setUnread(count);
    }
    setOpen((v) => !v);
  }, [open]);

  const handleClick = React.useCallback(
    async (n: Notification) => {
      if (!n.isRead) {
        await markAsRead(n.id);
        setUnread((v) => Math.max(0, v - 1));
        setNotifications((prev) =>
          prev.map((x) => (x.id === n.id ? { ...x, isRead: true } : x)),
        );
      }
      if (n.link) {
        router.push(n.link);
        setOpen(false);
      }
    },
    [router],
  );

  const handleMarkAll = React.useCallback(async () => {
    await markAllAsRead();
    setUnread(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  }, []);

  return (
    <div className="relative">
      <button
        className="relative p-2 text-gray-500 hover:text-text-primary transition-colors"
        onClick={toggle}
        aria-label={`Notifications (${unread} unread)`}
      >
        <Bell className="w-5 h-5" />
        {unread > 0 && (
          <span className="absolute top-1 right-1 flex items-center justify-center min-w-[16px] h-4 px-1 text-[9px] font-black bg-emerald-500 text-[#ffffff] rounded-full">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 w-80 bg-surface border border-border-subtle z-40 shadow-xl">
            <div className="flex items-center justify-between px-4 py-3 border-b border-border-subtle">
              <span className="text-[10px] font-black uppercase tracking-widest text-text-primary">
                Notifications
              </span>
              {unread > 0 && (
                <button
                  onClick={handleMarkAll}
                  className="text-[9px] font-bold uppercase tracking-widest text-emerald-500 hover:text-emerald-400 transition-colors"
                >
                  Mark all read
                </button>
              )}
            </div>

            <div className="max-h-80 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="px-4 py-8 text-center">
                  <Bell className="w-6 h-6 text-text-tertiary mx-auto mb-2" />
                  <p className="text-[10px] font-bold uppercase tracking-widest text-text-tertiary">
                    All clear
                  </p>
                </div>
              ) : (
                notifications.map((n) => {
                  const Icon = iconMap[n.type];
                  const color = colorMap[n.type];
                  return (
                    <button
                      key={n.id}
                      onClick={() => handleClick(n)}
                      className={`w-full text-left px-4 py-3 flex items-start gap-3 transition-colors hover:bg-surface-alt ${
                        !n.isRead ? "bg-surface-alt/50" : ""
                      }`}
                    >
                      <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${color}`} />
                      <div className="min-w-0 flex-1">
                        <p className={`text-xs font-bold truncate ${
                          n.isRead ? "text-text-secondary" : "text-text-primary"
                        }`}>
                          {n.title}
                        </p>
                        {n.message && (
                          <p className="text-[10px] text-text-tertiary mt-0.5 line-clamp-2">
                            {n.message}
                          </p>
                        )}
                        {n.restaurantName && (
                          <p className="text-[9px] font-bold uppercase tracking-widest text-emerald-500 mt-0.5">
                            {n.restaurantName}
                          </p>
                        )}
                        <p className="text-[9px] text-text-tertiary mt-1 font-bold uppercase tracking-widest">
                          {timeAgo(n.createdAt)}
                        </p>
                      </div>
                      {!n.isRead && (
                        <span className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                      )}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
