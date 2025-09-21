import dotenv from "dotenv";

dotenv.config();

interface IConfig {
  cors: {
    methods: string[];
    origin: string;
  };
  database: {
    fileName: string;
  };
  env: string;

  port: number;

  rateLimit: {
    maxRequests: number;
  };
}

export const Config: IConfig = {
  cors: {
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    origin: process.env.CORS_ORIGIN || "*",
  },
  database: {
    fileName: process.env.DATABASE_FILENAME || "book.db",
  },
  env: process.env.NODE_ENV || "development",
  port: parseInt(process.env.PORT || "8080", 10),
  rateLimit: {
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUEST || "100", 10),
  },
};
