"use client";

import * as React from "react";
import { Upload, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { getUploadParams } from "@/lib/upload";

interface Props {
  onUploaded: (url: string) => void;
  className?: string;
}

export function CloudinaryUpload({ onUploaded, className }: Props) {
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [status, setStatus] = React.useState<"idle" | "uploading" | "done" | "error">("idle");
  const [error, setError] = React.useState("");

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select an image file");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("Image must be under 10MB");
      return;
    }

    setStatus("uploading");
    setError("");

    try {
      const params = await getUploadParams();

      const formData = new FormData();
      formData.append("file", file);
      formData.append("timestamp", params.timestamp);
      formData.append("api_key", params.apiKey);
      formData.append("signature", params.signature);

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${params.cloudName}/image/upload`,
        { method: "POST", body: formData }
      );

      if (!res.ok) {
        const err = await res.text();
        throw new Error(err);
      }

      const data = await res.json();
      setStatus("done");
      onUploaded(data.secure_url as string);
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Upload failed");
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />

      {status === "idle" && (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full h-32 rounded-lg border-2 border-dashed border-border-subtle flex flex-col items-center justify-center gap-2 text-text-tertiary hover:border-emerald-500 hover:text-emerald-400 transition-colors bg-surface-alt"
        >
          <Upload className="w-6 h-6" />
          <span className="text-sm">Click to upload an image</span>
          <span className="text-[10px]">PNG, JPG, WebP · max 10MB</span>
        </button>
      )}

      {status === "uploading" && (
        <div className="w-full h-32 rounded-lg border-2 border-dashed border-border-subtle flex flex-col items-center justify-center gap-2 bg-surface-alt">
          <Loader2 className="w-6 h-6 animate-spin text-emerald-400" />
          <span className="text-sm text-text-tertiary">Uploading…</span>
        </div>
      )}

      {status === "done" && (
        <div className="w-full h-32 rounded-lg border-2 border-emerald-500/50 flex flex-col items-center justify-center gap-2 bg-emerald-500/5">
          <CheckCircle className="w-6 h-6 text-emerald-400" />
          <span className="text-sm text-emerald-400">Uploaded successfully</span>
        </div>
      )}

      {status === "error" && (
        <div className="w-full h-32 rounded-lg border-2 border-rose-500/50 flex flex-col items-center justify-center gap-2 bg-rose-500/5">
          <AlertCircle className="w-6 h-6 text-rose-400" />
          <span className="text-sm text-rose-400">Upload failed</span>
          {error && <span className="text-[10px] text-rose-400">{error}</span>}
          <button
            type="button"
            onClick={() => { setStatus("idle"); setError(""); }}
            className="text-xs text-text-tertiary underline hover:text-rose-300 mt-1"
          >
            Try again
          </button>
        </div>
      )}
    </div>
  );
}
