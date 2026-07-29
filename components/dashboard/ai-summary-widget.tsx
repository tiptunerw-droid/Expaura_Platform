import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface AiSummaryWidgetProps {
  summary: string;
  highlights: string[];
  painPoints: string[];
  className?: string;
}

function AiSummaryWidget({
  summary,
  highlights,
  painPoints,
  className,
}: AiSummaryWidgetProps) {
  return (
    <div className={cn("dark-section rounded-lg", className)}>
      <div className="p-5 space-y-4">
        <div className="flex items-center gap-2">
          <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#fafaf8]/10">
            <Sparkles className="w-4 h-4 text-brass" />
          </div>
          <div>
            <h3 className="font-display text-base text-[#fafaf8]">AI Review Summary</h3>
            <p className="text-xs text-[#9e9e9e]">Last 30 days</p>
          </div>
        </div>

        <p className="text-sm text-[#c9c5ba] leading-relaxed">{summary}</p>

        {highlights.length > 0 && (
          <div>
            <p className="text-[11px] uppercase tracking-wide text-[#9e9e9e] font-medium mb-2">
              Highlights
            </p>
            <div className="flex flex-wrap gap-1.5">
              {highlights.map((h) => (
                <span
                  key={h}
                  className="inline-flex items-center h-6 px-2.5 rounded-full text-xs font-medium bg-[#fafaf8]/10 text-[#c9c5ba]"
                >
                  {h}
                </span>
              ))}
            </div>
          </div>
        )}

        {painPoints.length > 0 && (
          <div>
            <p className="text-[11px] uppercase tracking-wide text-[#9e9e9e] font-medium mb-2">
              Watch areas
            </p>
            <div className="flex flex-wrap gap-1.5">
              {painPoints.map((p) => (
                <span
                  key={p}
                  className="inline-flex items-center h-6 px-2.5 rounded-full text-xs font-medium bg-brass-soft/20 text-brass-soft"
                >
                  {p}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export { AiSummaryWidget };
