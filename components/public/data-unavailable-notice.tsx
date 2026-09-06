import { WifiOff } from "lucide-react";

interface DataUnavailableNoticeProps {
  label?: string;
}

export function DataUnavailableNotice({ label }: DataUnavailableNoticeProps) {
  return (
    <div className="flex items-start gap-3 border border-dashed border-border-subtle bg-surface-alt/50 rounded-lg px-4 py-3">
      <WifiOff className="w-4 h-4 text-text-tertiary shrink-0 mt-0.5" />
      <p className="text-xs font-bold uppercase tracking-widest text-text-tertiary leading-relaxed">
        {label ? (
          <>We&apos;re unable to load {label} right now.</>
        ) : (
          <>We&apos;re unable to load live data right now.</>
        )}{" "}
        Check back in a moment.
      </p>
    </div>
  );
}