import { cn } from "@/lib/utils";

export function StatusPill({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "green" | "yellow" | "red" | "neutral";
}) {
  const tones = {
    green: "bg-[#dfeee0] text-[#205b35] ring-[#b8d9bb]",
    yellow: "bg-[#fff0c7] text-[#815b10] ring-[#f3db9d]",
    red: "bg-[#fbe2df] text-[#9b2c2c] ring-[#f0c2bc]",
    neutral: "bg-[#e9eeeb] text-[#53615c] ring-[#d4ddd7]",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset",
        tones[tone]
      )}
    >
      {children}
    </span>
  );
}
