import { NextFunction, Request, Response } from "express";

import { logger } from "../utils/logger.js";

export interface StatusError extends Error {
  status?: number;
  statusCode?: number;
}

export const errorHandler = (err: StatusError, req: Request, res: Response, _next: NextFunction): void => {
  void _next;
  const statusCode = err.statusCode ?? err.status ?? 500;
  logger.error({
    ip: req.ip,
    message: err.message,
    method: req.method,
    service: "BOOK_API_EJS_TS",
    stack: err.stack,
    statusCode,
    url: req.url,
    userAgent: req.get("User-Agent"),
  });

  const errStr: string = statusCode === 500 && process.env.NODE_ENV === "production" ? "Internal Server Error" : err.message;

  if (req.path.startsWith("/api") || req.accepts(["json", "html"]) === "json") {
    res.status(statusCode).json({
      error: errStr,
      statusCode,
      ...(process.env.NODE_ENV !== "production" ? { stack: err.stack } : {}),
    });
    return;
  }

  res.status(statusCode).render("error", {
    error: errStr,
    statusCode,
    ...(process.env.NODE_ENV !== "production" ? { stack: err.stack } : {}),
  });
};
