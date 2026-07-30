"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Download, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { generateRestaurantQr } from "@/lib/actions/restaurants";
import QRCode from "qrcode";

interface QrCodeData {
  id: string;
  code: string;
  branchId?: string | null;
}

interface Props {
  qrCodes: QrCodeData[];
  slug: string;
}

export function QrDisplay({ qrCodes, slug }: Props) {
  const router = useRouter();
  const [generating, setGenerating] = React.useState(false);
  const [qrDataUrl, setQrDataUrl] = React.useState<string | null>(null);

  const latest = qrCodes[0];
  const [baseUrl] = React.useState(() =>
    typeof window !== "undefined" ? window.location.origin : ""
  );

  React.useEffect(() => {
    if (!latest || !baseUrl) return;
    const url = `${baseUrl}/q/${latest.code}`;
    QRCode.toDataURL(url, { width: 400, margin: 2, color: { dark: "#1a1a1a", light: "#ffffff" } })
      .then(setQrDataUrl)
      .catch(console.error);
  }, [latest, baseUrl]);

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

  const handleDownload = () => {
    if (!qrDataUrl) return;
    const a = document.createElement("a");
    a.href = qrDataUrl;
    a.download = `expaura-qr-${slug}.png`;
    a.click();
  };

  return (
    <div className="space-y-4">
      {qrDataUrl ? (
        <div className="w-48 h-48 mx-auto bg-white rounded-xl border-2 border-line overflow-hidden">
          <Image src={qrDataUrl} alt="QR code" fill className="object-contain" />
        </div>
      ) : (
        <div className="w-48 h-48 mx-auto bg-white rounded-xl border-2 border-line flex items-center justify-center">
          {latest ? (
            <Loader2 className="w-8 h-8 animate-spin text-ink-muted" />
          ) : (
            <p className="text-xs text-ink-muted">No QR yet</p>
          )}
        </div>
      )}
      <div className="flex justify-center gap-3">
        {qrDataUrl && (
          <Button variant="primary" size="sm" onClick={handleDownload}>
            <Download className="w-4 h-4" />
            Download PNG
          </Button>
        )}
        <Button variant="outline" size="sm" onClick={handleGenerate} disabled={generating}>
          {generating ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <RefreshCw className="w-4 h-4" />
          )}
          {qrCodes.length ? "Regenerate" : "Generate QR"}
        </Button>
      </div>
    </div>
  );
}
