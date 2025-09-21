import { Response } from "express";

import { BookService } from "../services/book_service.js";
import { logger } from "../utils/logger.js";

interface IAPIResponse<T = unknown> {
  count?: number;
  data?: T;
  error?: string;
  errors?: IValidationError[];
  message?: string;
  success: boolean;
}

interface IValidationError {
  field: string;
  message: string;
}

export abstract class BaseController {
  constructor(protected bookService: BookService) {}

  protected ErrorResponse<T = null>(error: string, errors?: IValidationError[]): IAPIResponse<T> {
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

  protected SuccessResponse<T>(data: T, count?: number): IAPIResponse<T> {
    return {
      data,
      success: true,
      ...(count !== undefined && { count }),
    };
  }
}
