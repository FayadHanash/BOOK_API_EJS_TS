import dotenv from "dotenv";

dotenv.config();

interface IConfig {
  cors: {
    methods: string[];
    origin: string;
  };

  database: {
    fileName: string;
    userFileName: string;
  };
  env: string;
  port: number;

  rateLimit: {
    maxRequests: number;
  };

  session: SessionConfig;
}

export const Config: IConfig = {
  cors: {
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    origin: "*",
  },

  database: {
    fileName: "book.db",
    userFileName: "users.db",
  },

  env: "development",
  port: parseInt("8080", 10),
  rateLimit: {
    maxRequests: parseInt("100", 10),
  },
  session: {
    cookie: {
      //domain: "localhost:8080",
      httpOnly: true,
      maxAge: 24 * 3_600_000,
      path: "/",
      sameSite: "strict",
      secure: false, // false in dev, it must be true
    },
    name: "book_api_eje_ts.sid",
    resave: false,
    saveUninitialized: false,
    secret: "this is secret key",
  },
};

interface SessionConfig {
  cookie: {
    //domain: string;
    httpOnly: boolean;
    maxAge: number;
    path: string;
    sameSite: "lax" | "none" | "strict" | boolean | undefined;
    secure: boolean;
  };
  name: string;
  resave: boolean;
  saveUninitialized: boolean;
  secret: string;
}
