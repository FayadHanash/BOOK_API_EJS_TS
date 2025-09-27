export type FieldError = { field?: string; message: string };

export interface IErrorResponse<T = unknown> {
  count?: number;
  data?: T;
  error?: string;
  errors?: FieldError[];
  message?: string;
  success: boolean;
}

export class ValidationError extends Error {
  constructor(
    public errors: FieldError[],
    message = "Validation failed",
  ) {
    super(message);
    this.name = "ValidationError";
  }
}
