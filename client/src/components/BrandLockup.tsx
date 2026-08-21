import { cn } from "@/lib/utils";

export const METRCMATCH_BRAND_MARK_URL =
  "/manus-storage/metrcmatch-app-icon_b5732b20.png";

export const METRCMATCH_RECONCILIATION_HERO_URL =
  "/manus-storage/metrcmatch-reconciliation-hero_ff9d09a4.png";

export const METRCMATCH_AUDIT_READY_ICON_URL =
  "/manus-storage/metrcmatch-audit-ready-icon_4b216ab5.png";

export function BrandMark({ className }: { className?: string }) {
  return (
    <img
      src={METRCMATCH_BRAND_MARK_URL}
      alt=""
      aria-hidden="true"
      className={cn("object-contain", className)}
    />
  );
}

export function BrandLockup({
  className,
  showDescriptor = true,
}: {
  className?: string;
  showDescriptor?: boolean;
}) {
  return (
    <span className={cn("flex items-center gap-3", className)}>
      <span className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-2xl bg-[#173f3a] p-1 shadow-[0_8px_20px_rgba(23,63,58,0.18)]">
        <BrandMark className="h-full w-full" />
      </span>
      <span className="min-w-0">
        <span className="brand-wordmark block text-base text-[#173f3a]">
          MetrcMatch
        </span>
        {showDescriptor && (
          <span className="brand-descriptor block text-[#829188]">
            Oregon operations
          </span>
        )}
      </span>
    </span>
  );
}
