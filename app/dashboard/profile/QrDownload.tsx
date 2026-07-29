"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Download, Loader2, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateRestaurantQr } from "@/lib/actions/restaurants";

export function QrDownload() {
  const router = useRouter();
  const [generating, setGenerating] = React.useState(false);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await generateRestaurantQr({});
      router.refresh();
    } catch (e) {
      console.error(e);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <Button variant="primary" size="sm" onClick={handleGenerate} disabled={generating}>
      {generating ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <QrCode className="w-4 h-4" />
      )}
      Generate new QR
    </Button>
  );
}
