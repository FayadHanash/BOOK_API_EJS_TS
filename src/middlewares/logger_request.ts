import { NextFunction, Request, Response } from "express";

import { logger } from "../utils/logger.js";

export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();
  res.on("finish", () => {
    const duration = Date.now() - start;
    const { ip, method, originalUrl } = req;
    const { statusCode } = res;
    const userAgent = req.get("User-Agent") || "";
    logger.http({
      duration: `${duration}ms`,
      ip,
      method,
      statusCode,
      url: originalUrl,
      userAgent,
    });
  });
  next();
};
