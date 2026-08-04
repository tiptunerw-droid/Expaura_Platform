"use client";

import Link from "next/link";
import { Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface FeatureLockProps {
  title: string;
  description: string;
}

export function FeatureLock({ title, description }: FeatureLockProps) {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-14 h-14 rounded-full bg-brass-soft flex items-center justify-center mb-4">
        <Lock className="w-7 h-7 text-brass" />
      </div>
      <h2 className="font-display text-2xl text-ink mb-2">{title}</h2>
      <p className="text-ink-muted text-sm max-w-md mb-6">{description}</p>
      <Link href="/dashboard/profile#subscription">
        <Button variant="brass">View plans</Button>
      </Link>
    </div>
  );
}
