export type AppErrorCode =
  | "RATE_LIMITED"
  | "VALIDATION"
  | "NOT_FOUND"
  | "UNAUTHORIZED"
  | "CONFLICT"
  | "INTERNAL";

export class AppError extends Error {
  readonly code: AppErrorCode;
  readonly status: number;

  constructor(code: AppErrorCode, message: string, status?: number) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.status = status ?? defaultStatus(code);
  }
}

function defaultStatus(code: AppErrorCode): number {
  switch (code) {
    case "RATE_LIMITED":
      return 429;
    case "VALIDATION":
      return 400;
    case "UNAUTHORIZED":
      return 401;
    case "NOT_FOUND":
      return 404;
    case "CONFLICT":
      return 409;
    default:
      return 500;
  }
}

export const errors = {
  validation: (message: string) =>
    new AppError("VALIDATION", message),
  notFound: (message: string) =>
    new AppError("NOT_FOUND", message),
  unauthorized: (message = "You don't have permission to do that") =>
    new AppError("UNAUTHORIZED", message),
  conflict: (message: string) =>
    new AppError("CONFLICT", message),
  rateLimited: (message = "You're moving too fast. Please wait a moment and try again.") =>
    new AppError("RATE_LIMITED", message, 429),
  internal: (message = "Something went wrong. Please try again.") =>
    new AppError("INTERNAL", message, 500),
};
