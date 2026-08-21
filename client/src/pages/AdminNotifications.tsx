import { useAuth } from "@/_core/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { trpc } from "@/lib/trpc";
import {
  BellRing,
  CheckCircle2,
  Clock3,
  LockKeyhole,
  Send,
  Trash2,
} from "lucide-react";
import { useState } from "react";

type Severity = "info" | "success" | "warning" | "critical";

const severityLabels: Record<Severity, string> = {
  info: "Information",
  success: "Success",
  warning: "Warning",
  critical: "Critical",
};

const severityStyles: Record<Severity, string> = {
  info: "border-[#a9cfe6] bg-[#edf7fc] text-[#245a80]",
  success: "border-[#b9d8bd] bg-[#f2faef] text-[#285a33]",
  warning: "border-[#efd59a] bg-[#fff8e8] text-[#7a5a14]",
  critical: "border-[#e8b7ae] bg-[#fff6f4] text-[#993c30]",
};

function formatDate(value: Date | string | null) {
  if (!value) return "No expiry";
  return new Date(value).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function AdminNotifications() {
  const { user } = useAuth();
  const utils = trpc.useUtils();
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [severity, setSeverity] = useState<Severity>("info");
  const [expiresAt, setExpiresAt] = useState("");
  const notificationsQuery = trpc.customNotifications.listAll.useQuery(
    undefined,
    { enabled: user?.isOwner === true }
  );
  const createNotification = trpc.customNotifications.create.useMutation({
    onSuccess: () => {
      setTitle("");
      setMessage("");
      setSeverity("info");
      setExpiresAt("");
      void utils.customNotifications.listAll.invalidate();
      void utils.customNotifications.listActive.invalidate();
    },
  });
  const deactivateNotification =
    trpc.customNotifications.deactivate.useMutation({
      onSuccess: () => {
        void utils.customNotifications.listAll.invalidate();
        void utils.customNotifications.listActive.invalidate();
      },
    });

  if (user?.isOwner !== true)
    return (
      <section className="mx-auto grid min-h-[60vh] max-w-lg place-items-center text-center">
        <div className="command-surface rounded-[2rem] border border-[#dce3da] bg-white p-8">
          <LockKeyhole className="mx-auto h-10 w-10 text-[#356e45]" />
          <h1 className="mt-5 text-2xl font-bold text-[#173f3a]">
            Owner access required
          </h1>
          <p className="mt-3 text-sm leading-6 text-[#61706b]">
            Custom workspace notices can be published only by the configured
            MetrcMatch owner account.
          </p>
        </div>
      </section>
    );

  const submit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    createNotification.mutate({
      title,
      message,
      severity,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
    });
  };

  const notifications = notificationsQuery.data ?? [];

  return (
    <section className="mx-auto max-w-6xl space-y-6">
      <header className="rounded-[2rem] border border-[#dce3da] bg-white/70 p-6 shadow-[0_16px_38px_rgba(18,53,47,0.05)] sm:p-8">
        <div className="flex items-center gap-2 text-[#356e45]">
          <BellRing className="h-4 w-4" />
          <span className="mono-meta text-[11px] font-bold uppercase tracking-[0.14em]">
            Workspace communications
          </span>
        </div>
        <h1 className="mt-2 text-3xl font-bold tracking-[-0.045em] text-[#173f3a] sm:text-4xl">
          Custom notifications
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#61706b]">
          Publish a concise in-app notice to signed-in workspace users. Notices
          remain visible until a user dismisses them, they expire, or you
          deactivate them.
        </p>
      </header>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <form
          onSubmit={submit}
          className="rounded-[1.75rem] border border-[#dce3da] bg-white p-6 shadow-[0_12px_30px_rgba(18,53,47,0.05)]"
        >
          <div className="flex items-center gap-2">
            <Send className="h-4 w-4 text-[#356e45]" />
            <h2 className="text-lg font-bold text-[#173f3a]">
              Compose a notification
            </h2>
          </div>
          <p className="mt-2 text-sm leading-6 text-[#61706b]">
            Use critical notices only for time-sensitive operational impacts.
          </p>
          <label className="mt-6 block text-sm font-bold text-[#173f3a]">
            Title
            <Input
              value={title}
              onChange={event => setTitle(event.target.value)}
              minLength={3}
              maxLength={140}
              required
              placeholder="e.g., Planned system maintenance"
              className="mt-2"
            />
          </label>
          <label className="mt-5 block text-sm font-bold text-[#173f3a]">
            Message
            <Textarea
              value={message}
              onChange={event => setMessage(event.target.value)}
              minLength={3}
              maxLength={2000}
              required
              rows={5}
              placeholder="Share the timing, expected impact, and any action users should take."
              className="mt-2 resize-y"
            />
          </label>
          <div className="mt-5 grid gap-5 sm:grid-cols-2">
            <label className="block text-sm font-bold text-[#173f3a]">
              Severity
              <select
                value={severity}
                onChange={event => setSeverity(event.target.value as Severity)}
                className="mt-2 h-10 w-full rounded-xl border border-[#c9d5c8] bg-white px-3 text-sm text-[#173f3a] focus:outline-none focus:ring-2 focus:ring-[#5e8b62]"
              >
                {(Object.keys(severityLabels) as Severity[]).map(level => (
                  <option key={level} value={level}>
                    {severityLabels[level]}
                  </option>
                ))}
              </select>
            </label>
            <label className="block text-sm font-bold text-[#173f3a]">
              Optional expiry
              <Input
                type="datetime-local"
                value={expiresAt}
                onChange={event => setExpiresAt(event.target.value)}
                className="mt-2"
              />
            </label>
          </div>
          {createNotification.error && (
            <p role="alert" className="mt-4 text-sm font-medium text-[#a4372c]">
              {createNotification.error.message}
            </p>
          )}
          {createNotification.isSuccess && (
            <p
              role="status"
              className="mt-4 text-sm font-medium text-[#285a33]"
            >
              Notification published to the workspace.
            </p>
          )}
          <Button
            type="submit"
            disabled={createNotification.isPending}
            className="mt-6 w-full bg-[#173f3a] hover:bg-[#0e2f2b]"
          >
            <Send className="mr-2 h-4 w-4" />
            {createNotification.isPending
              ? "Publishing…"
              : "Publish notification"}
          </Button>
        </form>

        <div className="rounded-[1.75rem] border border-[#dce3da] bg-white/80 p-6 shadow-[0_12px_30px_rgba(18,53,47,0.05)]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-[#173f3a]">
                Published notices
              </h2>
              <p className="mt-1 text-sm text-[#61706b]">
                {notifications.length}{" "}
                {notifications.length === 1 ? "notice" : "notices"}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => void notificationsQuery.refetch()}
              disabled={notificationsQuery.isFetching}
              className="border-[#c9d5c8] bg-white text-[#173f3a] hover:bg-[#f3f7f2]"
            >
              Refresh
            </Button>
          </div>

          <div className="mt-5 space-y-3">
            {notificationsQuery.isLoading ? (
              <p className="text-sm text-[#61706b]">Loading notices…</p>
            ) : notificationsQuery.error ? (
              <p role="alert" className="text-sm font-medium text-[#a4372c]">
                {notificationsQuery.error.message}
              </p>
            ) : !notifications.length ? (
              <div className="rounded-2xl border border-dashed border-[#c9d5c8] bg-[#f8fbf7] p-8 text-center">
                <CheckCircle2 className="mx-auto h-9 w-9 text-[#5e8b62]" />
                <p className="mt-3 text-sm font-bold text-[#173f3a]">
                  No notices published
                </p>
                <p className="mt-1 text-sm text-[#61706b]">
                  Your first workspace notification will appear here.
                </p>
              </div>
            ) : (
              notifications.map(notification => {
                const severityStyle = severityStyles[notification.severity];
                return (
                  <article
                    key={notification.id}
                    className="rounded-2xl border border-[#dce3da] bg-white p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge className={severityStyle}>
                            {severityLabels[notification.severity]}
                          </Badge>
                          {!notification.isActive && (
                            <Badge className="border-[#c9d5c8] bg-[#f2f5f1] text-[#61706b]">
                              Inactive
                            </Badge>
                          )}
                        </div>
                        <h3 className="mt-3 text-base font-bold text-[#173f3a]">
                          {notification.title}
                        </h3>
                        <p className="mt-1 whitespace-pre-wrap text-sm leading-6 text-[#52625d]">
                          {notification.message}
                        </p>
                      </div>
                      {notification.isActive && (
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={deactivateNotification.isPending}
                          onClick={() =>
                            deactivateNotification.mutate({
                              id: notification.id,
                            })
                          }
                          className="border-[#e5b4ad] bg-white text-[#94382d] hover:bg-[#fff5f3] hover:text-[#7d2f26]"
                        >
                          <Trash2 className="mr-1.5 h-3.5 w-3.5" />
                          Deactivate
                        </Button>
                      )}
                    </div>
                    <p className="mt-4 flex items-center gap-1.5 text-xs text-[#718178]">
                      <Clock3 className="h-3.5 w-3.5" />
                      Expires: {formatDate(notification.expiresAt)}
                    </p>
                  </article>
                );
              })
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
