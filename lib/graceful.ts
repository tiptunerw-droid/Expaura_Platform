type DbErrorLike = { code?: string; message?: string };

const DB_UNAVAILABLE_PATTERN =
  /ECONNREFUSED|ENOTFOUND|ETIMEDOUT|EPIPE|EAI_AGAIN|P1001|P1002|P1008|P1017|P2024|connection (refused|timed out|reset|terminated|closed|lost)|failed to connect|cannot reach database|database .* (unavailable|does not exist|connection)|too many (clients|connections)|max (pool|clients) reached|timeout expired|getaddrinfo|name or service not known|sorry, too many clients|SASL|SCRAM|password authentication failed|invalid_password|28P01|client password|auth failed/i;

export function isDbUnavailable(err: unknown): boolean {
  const e = (err ?? {}) as DbErrorLike;
  const msg = `${e.code ?? ""} ${e.message ?? ""}`;
  return DB_UNAVAILABLE_PATTERN.test(msg);
}

export async function graceful<T>(
  fn: () => Promise<T>,
): Promise<{ data: T | null; dbError: boolean }> {
  try {
    return { data: await fn(), dbError: false };
  } catch (err) {
    if (isDbUnavailable(err)) {
      console.error("[DB unavailable] serving gracefully:", err);
      return { data: null, dbError: true };
    }
    throw err;
  }
}