import { Response } from "express";

import { logger } from "../utils/logger.js";
import { FieldError, IErrorResponse } from "../validation/validation.js";

export abstract class BaseController<T> {
  constructor(protected service: T) {}

  protected ErrorResponse<T = null>(error: string, errors?: FieldError[]): IErrorResponse<T> {
    return {
      error,
      success: false,
      ...(errors && { errors }),
    };
  }
  protected handleError(res: Response, error: unknown, context: string, statusCode = 500): void {
    const errMsg = error instanceof Error ? error.message : "Unknown error occurred";
    logger.error(`Error in ${context}: `, error);
    const acceptsJson = res.req.headers.accept?.includes("application/json");
    if (acceptsJson) {
      res.status(statusCode).json(this.ErrorResponse(errMsg));
    } else {
      res.status(statusCode).render("error", {
        error: errMsg,
        statusCode,
      });
    }
  }

  protected parseId(id: string): null | number {
    const parsed = parseInt(id, 10);
    return Number.isNaN(parsed) ? null : parsed;
  }

  protected SuccessResponse<T>(data: T, count?: number): IErrorResponse<T> {
    return {
      data,
      success: true,
      ...(count !== undefined && { count }),
    };
  }
}
