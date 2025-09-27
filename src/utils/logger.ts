import winston from "winston";

import { Config } from "../config/config.js";
const { colorize, combine, errors, json, printf, timestamp } = winston.format;

type TransformableInfo = winston.Logform.TransformableInfo;
const consoleFormat = printf((info: TransformableInfo) => {
  const time = (info.timestamp as string) ?? new Date().toISOString();
  const lvl = info.level ?? "info";
  const msg = (info.stack as string) ?? (info.message as string) ?? "";
  return `${time} ${lvl}: ${msg}`;
});

export const logger = winston.createLogger({
  defaultMeta: { service: "BOOK_API_EJS_TS" },
  format: combine(errors({ stack: true }), timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), json()),
  level: process.env.LOG_LEVEL || "info",
  transports: [
    new winston.transports.File({
      filename: "logs/error.log",
      level: "error",
      maxFiles: 5,
      maxsize: 5_242_880,
    }),
    new winston.transports.File({
      filename: "logs/combined.log",
      maxFiles: 5,
      maxsize: 5_242_880,
    }),
  ],
});

if (Config.env === "development") {
  logger.add(
    new winston.transports.Console({
      format: combine(colorize(), timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), consoleFormat),
    }),
  );
}
