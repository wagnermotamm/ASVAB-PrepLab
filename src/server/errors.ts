export class AppError extends Error {
  status: number;
  details?: Record<string, unknown>;

  constructor(code: string, status = 400, details?: Record<string, unknown>) {
    super(code);
    this.status = status;
    this.details = details;
  }
}
