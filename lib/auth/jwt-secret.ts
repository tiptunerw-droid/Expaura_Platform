export function getJwtSecret(): Uint8Array {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error(
      "JWT_SECRET is not set. Add it to your .env before starting the server. Never run with a fallback secret."
    );
  }
  return new TextEncoder().encode(secret);
}