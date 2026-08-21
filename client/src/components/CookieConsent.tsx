import { Cookie, X } from "lucide-react";
import { useState } from "react";
import { Link } from "wouter";

const CONSENT_KEY = "metrcmatch-cookie-consent-v1";

function savedConsent() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(CONSENT_KEY);
}

export default function CookieConsent() {
  const [choice, setChoice] = useState(savedConsent);

  const saveChoice = (value: "accepted" | "essential") => {
    window.localStorage.setItem(CONSENT_KEY, value);
    setChoice(value);
  };

  if (choice) return null;

  return (
    <aside
      aria-label="Cookie preferences"
      className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-2xl rounded-2xl border border-[#b9d5bc] bg-white/95 p-4 shadow-[0_22px_70px_rgba(23,63,58,0.2)] backdrop-blur sm:inset-x-6 sm:p-5"
    >
      <div className="flex gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#e6f2e4] text-[#356e45]">
          <Cookie className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-[#173f3a]">Cookie preferences</p>
          <p className="mt-1 text-xs leading-5 text-[#61766a]">
            MetrcMatch uses essential cookies for secure sessions and reliable
            operation. We do not enable optional analytics or advertising
            cookies unless this notice and our practices are updated. Review our{" "}
            <Link
              href="/privacy"
              className="font-semibold text-[#356e45] underline underline-offset-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5e8b62]"
            >
              Privacy Policy
            </Link>
            .
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              onClick={() => saveChoice("essential")}
              className="rounded-xl border border-[#b7cab8] bg-white px-3 py-2 text-xs font-bold text-[#173f3a] transition-colors hover:bg-[#f1f6ef] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5e8b62]"
            >
              Essential only
            </button>
            <button
              onClick={() => saveChoice("accepted")}
              className="rounded-xl bg-[#173f3a] px-3 py-2 text-xs font-bold text-white transition-colors hover:bg-[#0e2f2b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5e8b62]"
            >
              Accept
            </button>
          </div>
        </div>
        <button
          type="button"
          aria-label="Close cookie preferences"
          onClick={() => saveChoice("essential")}
          className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-[#61766a] hover:bg-[#edf4eb] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5e8b62]"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </aside>
  );
}
