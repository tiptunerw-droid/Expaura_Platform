import Link from "next/link";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface UpgradeGateProps {
  feature: string;
  planRequired?: "Standard" | "Premium";
  description?: string;
  className?: string;
}

function UpgradeGate({
  feature,
  planRequired = "Standard",
  description,
  className,
}: UpgradeGateProps) {
  return (
    <div
      className={cn(
        "relative rounded-lg border border-brass/30 bg-brass-soft/40 p-8 text-center",
        className
      )}
    >
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-brass-soft mb-4">
        <Lock className="w-5 h-5 text-brass" />
      </div>
      <h3 className="font-display text-xl text-ink mb-2">{feature}</h3>
      <p className="text-sm text-ink-muted max-w-md mx-auto mb-6">
        {description ||
          `This feature is part of the ${planRequired} plan. Upgrade to unlock it for your restaurant.`}
      </p>
      <Link href="/dashboard/profile#subscription">
        <Button variant="brass">View plans</Button>
      </Link>
    </div>
  );
}

export { UpgradeGate };
