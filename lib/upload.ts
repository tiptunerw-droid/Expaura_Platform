"use server";

import { createHash } from "crypto";

const CLOUD_NAME = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME!;
const API_KEY = process.env.CLOUDINARY_API_KEY!;
const API_SECRET = process.env.CLOUDINARY_API_SECRET!;

function signParams(params: Record<string, string>): string {
  const sorted = Object.entries(params)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join("&");
  return createHash("sha1").update(sorted + API_SECRET).digest("hex");
}

export async function getUploadParams() {
  const timestamp = Math.round(Date.now() / 1000).toString();
  const params: Record<string, string> = { timestamp };
  const signature = signParams(params);

  return {
    cloudName: CLOUD_NAME,
    apiKey: API_KEY,
    timestamp,
    signature,
  };
}

export async function uploadImage(base64: string): Promise<string> {
  const timestamp = Math.round(Date.now() / 1000).toString();
  const params: Record<string, string> = { timestamp };
  const signature = signParams(params);

  const formData = new FormData();
  formData.append("file", base64);
  formData.append("timestamp", timestamp);
  formData.append("api_key", API_KEY);
  formData.append("signature", signature);

  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    { method: "POST", body: formData }
  );

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Cloudinary upload failed: ${err}`);
  }

  const data = await res.json();
  return data.secure_url as string;
}
