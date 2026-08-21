import { useAuth } from "@/_core/hooks/useAuth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { trpc } from "@/lib/trpc";
import {
  CheckCircle2,
  Eraser,
  FlaskConical,
  Inbox,
  LockKeyhole,
  RefreshCw,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type RequestStatus = "new" | "in_review" | "closed";
type StatusFilter = "all" | RequestStatus;

const statusLabels: Record<RequestStatus, string> = {
  new: "New",
  in_review: "In review",
  closed: "Closed",
};

const statusClass: Record<RequestStatus, string> = {
  new: "border-[#d6a84d]/30 bg-[#fff6dc] text-[#7a5a14]",
  in_review: "border-[#6c99ba]/30 bg-[#eaf4fb] text-[#245a80]",
  closed: "border-[#71a57b]/30 bg-[#e9f5ea] text-[#356e45]",
};

function formatDate(value: Date | string) {
  return new Date(value).toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default function AdminContactRequests() {
  const { user } = useAuth();
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [resetConfirmation, setResetConfirmation] = useState("");
  const [resetResult, setResetResult] = useState<number | null>(null);
  const utils = trpc.useUtils();
  const requestsQuery = trpc.contactRequests.list.useQuery(
    filter === "all" ? undefined : { status: filter },
    { enabled: user?.isOwner === true }
  );
  const updateStatus = trpc.contactRequests.updateStatus.useMutation({
    onSuccess: () => void utils.contactRequests.list.invalidate(),
  });
  const updateDemoFlag = trpc.contactRequests.updateDemoFlag.useMutation({
    onSuccess: () => void utils.contactRequests.list.invalidate(),
  });
  const resetDemoData = trpc.contactRequests.resetDemoData.useMutation({
    onSuccess: result => {
      setResetResult(result.cleared);
      setResetConfirmation("");
      void utils.contactRequests.list.invalidate();
    },
  });
  const requests = requestsQuery.data ?? [];

  useEffect(() => {
    if (!requests.length) {
      setSelectedId(null);
      return;
    }
    if (!requests.some(request => request.id === selectedId))
      setSelectedId(requests[0].id);
  }, [requests, selectedId]);

  const selected = useMemo(
    () => requests.find(request => request.id === selectedId) ?? null,
    [requests, selectedId]
  );

  if (user?.isOwner !== true)
    return (
      <section className="mx-auto grid min-h-[60vh] max-w-lg place-items-center text-center">
        <div className="command-surface rounded-[2rem] border border-[#dce3da] bg-white p-8">
          <LockKeyhole className="mx-auto h-10 w-10 text-[#356e45]" />
          <h1 className="mt-5 text-2xl font-bold text-[#173f3a]">
            Owner access required
          </h1>
          <p className="mt-3 text-sm leading-6 text-[#61706b]">
            Contact requests contain personal information and are available only
            to the MetrcMatch owner account.
          </p>
        </div>
      </section>
    );

  return (
    <section className="mx-auto max-w-7xl space-y-6">
      <header className="flex flex-col gap-4 rounded-[2rem] border border-[#dce3da] bg-white/70 p-6 shadow-[0_16px_38px_rgba(18,53,47,0.05)] sm:flex-row sm:items-end sm:justify-between sm:p-8">
        <div>
          <div className="flex items-center gap-2 text-[#356e45]">
            <Inbox className="h-4 w-4" />
            <span className="mono-meta text-[11px] font-bold uppercase tracking-[0.14em]">
              Owner inbox
            </span>
          </div>
          <h1 className="mt-2 text-3xl font-bold tracking-[-0.045em] text-[#173f3a] sm:text-4xl">
            Contact requests
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[#61706b]">
            Review privacy requests and general inquiries. Submitted messages
            are restricted to this administrator view.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="outline"
                className="border-[#e5b4ad] bg-white text-[#94382d] hover:bg-[#fff5f3] hover:text-[#7d2f26]"
              >
                <Eraser className="mr-2 h-4 w-4" />
                Reset Demo Data
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Reset marked demo requests?</AlertDialogTitle>
                <AlertDialogDescription>
                  This permanently deletes only requests explicitly marked as
                  demo data. Real privacy requests and general inquiries are not
                  affected.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <label className="space-y-2 text-sm font-semibold text-[#173f3a]">
                Type <span className="mono-meta text-xs">RESET DEMO DATA</span>{" "}
                to confirm
                <Input
                  value={resetConfirmation}
                  onChange={event => setResetConfirmation(event.target.value)}
                  placeholder="RESET DEMO DATA"
                  className="mt-2"
                />
              </label>
              {resetDemoData.error && (
                <p role="alert" className="text-sm font-medium text-[#a4372c]">
                  {resetDemoData.error.message}
                </p>
              )}
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  disabled={
                    resetConfirmation !== "RESET DEMO DATA" ||
                    resetDemoData.isPending
                  }
                  onClick={event => {
                    event.preventDefault();
                    resetDemoData.mutate({ confirmation: "RESET DEMO DATA" });
                  }}
                  className="bg-[#a4372c] hover:bg-[#852b22]"
                >
                  {resetDemoData.isPending
                    ? "Resetting…"
                    : "Delete marked demo data"}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <Button
            variant="outline"
            onClick={() => void requestsQuery.refetch()}
            disabled={requestsQuery.isFetching}
            className="border-[#c9d5c8] bg-white text-[#173f3a] hover:bg-[#f3f7f2]"
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${requestsQuery.isFetching ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>
        </div>
      </header>

      {resetResult !== null && (
        <div
          role="status"
          className="rounded-2xl border border-[#b9d8bd] bg-[#f2faef] px-4 py-3 text-sm text-[#285a33]"
        >
          Reset complete. {resetResult} marked demo{" "}
          {resetResult === 1 ? "request was" : "requests were"} removed. Real
          submissions were retained.
        </div>
      )}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div
          className="flex flex-wrap gap-2"
          aria-label="Filter contact requests"
        >
          {(["all", "new", "in_review", "closed"] as StatusFilter[]).map(
            status => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`rounded-xl px-3 py-2 text-xs font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5e8b62] ${
                  filter === status
                    ? "bg-[#173f3a] text-white"
                    : "border border-[#c9d5c8] bg-white text-[#52625d] hover:bg-[#f3f7f2]"
                }`}
              >
                {status === "all" ? "All requests" : statusLabels[status]}
              </button>
            )
          )}
        </div>
        <p className="text-xs text-[#718178]">
          {requests.length} {requests.length === 1 ? "request" : "requests"}
        </p>
      </div>

      {requestsQuery.isLoading ? (
        <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <Skeleton className="h-96 rounded-[1.75rem]" />
          <Skeleton className="h-96 rounded-[1.75rem]" />
        </div>
      ) : requestsQuery.error ? (
        <div className="rounded-2xl border border-[#e8b7ae] bg-[#fff6f4] p-5 text-sm text-[#993c30]">
          {requestsQuery.error.message}
        </div>
      ) : !requests.length ? (
        <div className="rounded-[2rem] border border-dashed border-[#c9d5c8] bg-white/60 p-12 text-center">
          <CheckCircle2 className="mx-auto h-10 w-10 text-[#5e8b62]" />
          <h2 className="mt-4 text-lg font-bold text-[#173f3a]">
            No matching requests
          </h2>
          <p className="mt-2 text-sm text-[#61706b]">
            New privacy requests and general inquiries will appear here.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="overflow-hidden rounded-[1.75rem] border border-[#dce3da] bg-white/80 shadow-[0_12px_30px_rgba(18,53,47,0.04)]">
            {requests.map(request => (
              <button
                key={request.id}
                onClick={() => setSelectedId(request.id)}
                className={`w-full border-b border-[#edf1ec] p-4 text-left transition-colors last:border-b-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#5e8b62] ${
                  selectedId === request.id
                    ? "bg-[#edf5eb]"
                    : "hover:bg-[#f8fbf7]"
                }`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-[#173f3a]">
                      {request.subject || "Privacy request"}
                    </p>
                    <p className="mt-1 truncate text-xs text-[#61706b]">
                      {request.email}
                    </p>
                  </div>
                  <Badge className={statusClass[request.status]}>
                    {statusLabels[request.status]}
                  </Badge>
                </div>
                <div className="mt-3 flex items-center justify-between gap-3 text-[11px] text-[#7d8a84]">
                  <span className="capitalize">{request.requestType}</span>
                  <span className="flex items-center gap-2">
                    {request.isDemo && (
                      <FlaskConical
                        className="h-3.5 w-3.5 text-[#9b6a16]"
                        aria-label="Demo data"
                      />
                    )}
                    {formatDate(request.createdAt)}
                  </span>
                </div>
              </button>
            ))}
          </div>

          {selected && (
            <article className="rounded-[1.75rem] border border-[#dce3da] bg-white p-6 shadow-[0_12px_30px_rgba(18,53,47,0.05)] sm:p-7">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="mono-meta text-[11px] font-bold uppercase tracking-[0.14em] text-[#5e8b62]">
                    {selected.requestType} request · #{selected.id}
                  </p>
                  <h2 className="mt-2 text-2xl font-bold tracking-[-0.035em] text-[#173f3a]">
                    {selected.subject || "Privacy request"}
                  </h2>
                </div>
                <Badge className={statusClass[selected.status]}>
                  {statusLabels[selected.status]}
                </Badge>
              </div>
              <dl className="mt-7 grid gap-4 border-y border-[#edf1ec] py-5 text-sm sm:grid-cols-2">
                <div>
                  <dt className="text-xs font-bold uppercase tracking-[0.1em] text-[#7d8a84]">
                    From
                  </dt>
                  <dd className="mt-1 font-medium text-[#173f3a]">
                    {selected.name || "No name provided"}
                  </dd>
                  <a
                    className="text-[#356e45] underline underline-offset-2"
                    href={`mailto:${selected.email}`}
                  >
                    {selected.email}
                  </a>
                </div>
                <div>
                  <dt className="text-xs font-bold uppercase tracking-[0.1em] text-[#7d8a84]">
                    Received
                  </dt>
                  <dd className="mt-1 font-medium text-[#173f3a]">
                    {formatDate(selected.createdAt)}
                  </dd>
                </div>
              </dl>
              <div className="mt-6">
                <p className="text-xs font-bold uppercase tracking-[0.1em] text-[#7d8a84]">
                  Message
                </p>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-[#41574b]">
                  {selected.message}
                </p>
              </div>
              <div className="mt-7 flex flex-wrap items-center gap-3 border-t border-[#edf1ec] pt-5">
                <label
                  htmlFor="contact-status"
                  className="text-sm font-bold text-[#173f3a]"
                >
                  Status
                </label>
                <select
                  id="contact-status"
                  value={selected.status}
                  disabled={updateStatus.isPending}
                  onChange={event =>
                    updateStatus.mutate({
                      id: selected.id,
                      status: event.target.value as RequestStatus,
                    })
                  }
                  className="h-10 rounded-xl border border-[#c9d5c8] bg-white px-3 text-sm text-[#173f3a] focus:outline-none focus:ring-2 focus:ring-[#5e8b62]"
                >
                  {(Object.keys(statusLabels) as RequestStatus[]).map(
                    status => (
                      <option key={status} value={status}>
                        {statusLabels[status]}
                      </option>
                    )
                  )}
                </select>
                {updateStatus.isSuccess && (
                  <span
                    role="status"
                    className="text-xs font-semibold text-[#356e45]"
                  >
                    Status saved
                  </span>
                )}
                {updateStatus.error && (
                  <span
                    role="alert"
                    className="text-xs font-semibold text-[#a4372c]"
                  >
                    {updateStatus.error.message}
                  </span>
                )}
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-3 rounded-xl bg-[#f8faf7] p-3 text-sm">
                <FlaskConical className="h-4 w-4 text-[#9b6a16]" />
                <p className="flex-1 text-[#61706b]">
                  {selected.isDemo
                    ? "This request is designated as demo data and will be removed by Reset Demo Data."
                    : "Real request protected. Mark it as demo data only if it is safe to delete during a reset."}
                </p>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={updateDemoFlag.isPending}
                  onClick={() =>
                    updateDemoFlag.mutate({
                      id: selected.id,
                      isDemo: !selected.isDemo,
                    })
                  }
                  className={
                    selected.isDemo
                      ? "border-[#d6a84d] text-[#805d16]"
                      : "border-[#c9d5c8]"
                  }
                >
                  {selected.isDemo ? "Remove demo mark" : "Mark as demo data"}
                </Button>
              </div>
            </article>
          )}
        </div>
      )}
    </section>
  );
}
