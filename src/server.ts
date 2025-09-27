import compression from "compression";
import cookieParser from "cookie-parser";
import cors from "cors";
import express, { NextFunction, Request, RequestHandler, Response } from "express";
import { default as Layout } from "express-ejs-layouts";
import "express-async-errors";
import rateLimit from "express-rate-limit";
import session from "express-session";
import helmet from "helmet";
import http from "http";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

import { Config } from "./config/config.js";
import { AccountController } from "./controllers/account/account_controller.js";
import { BookController } from "./controllers/book/book_controller.js";
import { authenticateUser, isAuthenticated, redirectAuthenticated } from "./middlewares/authenticator.js";
import { errorHandler } from "./middlewares/error_handler.js";
import { requestLogger } from "./middlewares/logger_request.js";
import { IUserGlobal } from "./models/user.js";
import { BookRepository } from "./repositories/book_repository.js";
import { UserRepository } from "./repositories/user_repository.js";
import { AccountService } from "./services/account_service.js";
import { BookService } from "./services/book_service.js";
import { logger } from "./utils/logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export class Application {
  private static instance: Application;
  private app: express.Application;
  private server?: http.Server;

  private constructor() {
    this.app = express();
    this.setupMiddleware();
    this.setupRoutes();
    this.setupErrorHandling();
  }

  public static getInstance(): Application {
    if (!Application.instance) {
      Application.instance = new Application();
    }
    return Application.instance;
  }

  public getApp(): express.Application {
    return this.app;
  }

  public async start(port: number = Config.port ?? 8080): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.server = this.app.listen(port, () => {
          logger.info(`Server running on http://localhost:${port} in ${Config.env} mode`);
          resolve();
        });
      } catch (err) {
        reject(err instanceof Error ? err : new Error(String(err)));
      }
    });
  }
  public async stop(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.server) return resolve();
      this.server.close((err?: Error) => {
        if (err) {
          logger.error("Error shutting down server:", err);
          return reject(err);
        }
        logger.info("Server stopped successfully");
        resolve();
      });
    });
  }

  private setupErrorHandling(): void {
    this.app.use(errorHandler);
  }

  private setupMiddleware(): void {
    this.app.use(
      helmet({
        contentSecurityPolicy: {
          directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
          },
        },
      }),
    );
    const limiter = rateLimit({
      legacyHeaders: false,
      max: Config.rateLimit?.maxRequests ?? 100,
      message: "Too many requests from this IP, please try again later.",
      standardHeaders: true,
      windowMs: 15 * 60000,
    });

    this.app.use(limiter);
    this.app.use(compression());
    this.app.use(
      cors({
        methods: Config.cors.methods,
        origin: Config.cors.origin,
      }),
    );
    this.app.use(express.json({ limit: "10mb" }));
    this.app.use(express.urlencoded({ extended: true, limit: "10mb" }));
    this.app.set("views", join(__dirname, "../views"));
    this.app.set("view engine", "ejs");

    this.app.use(Layout);

    this.app.use(express.static(join(__dirname, "../public")));
    this.app.use(cookieParser());
    this.app.use(
      session({
        cookie: {
          //domain: Config.session.cookie.domain,
          httpOnly: Config.session.cookie.httpOnly,
          maxAge: Config.session.cookie.maxAge,
          path: Config.session.cookie.path,
          sameSite: Config.session.cookie.sameSite,
          secure: Config.session.cookie.secure,
        },
        resave: Config.session.resave,
        saveUninitialized: Config.session.saveUninitialized,
        secret: Config.session.secret,
      }),
    );
    this.app.use((req: Request, _res: Response, next: NextFunction) => {
      if (req.session.userId) {
        req.user = { username: req.session.userId };
      }
      next();
    });

    this.app.use(requestLogger);
  }

  private setupRoutes(): void {
    const repo = new BookRepository();
    const service = new BookService(repo);

    const userRepo = new UserRepository();
    const accService = new AccountService(userRepo);
    const accController = new AccountController(accService, service);
    const bookController = new BookController(service);

    const wrap =
      (handler: (this: unknown, req: Request, res: Response, next: NextFunction) => Promise<unknown> | void): RequestHandler =>
      (req, res, next) => {
        void handler.call(bookController, req, res, next);
      };

    this.app.get("/health", (_req, res) => {
      res.status(200).json({
        status: "OK",
        timestamp: new Date().toISOString(),
        uptimeSeconds: Math.round(process.uptime()),
      });
    });
    this.app.get("/signup", redirectAuthenticated, (req, res) => accController.renderRegisterView(req, res));
    this.app.get("/signin", redirectAuthenticated, (req, res) => accController.renderLoginView(req, res));
    this.app.post("/signup", redirectAuthenticated, (req, res) => accController.registerUser(req, res));
    this.app.post("/signin", redirectAuthenticated, (req, res) => accController.loginUser(req, res));
    this.app.post("/signout", (req, res) => accController.logoutUser(req, res));

    this.app.use(authenticateUser(userRepo));
    this.app.use((req, res, next) => {
      res.locals.user = (req.user as IUserGlobal) ?? null;
      next();
    });

    //this.app.get("/", (_req, res) => res.redirect("/books"));
    this.app.get("/", (req, res) => accController.renderIndex(req, res));
    this.app.get("/books", isAuthenticated, wrap(bookController.listBooks));
    this.app.get("/books/create", isAuthenticated, wrap(bookController.renderCreateView));
    this.app.get("/books/edit/:id", isAuthenticated, wrap(bookController.renderEditView));
    //this.app.get("/api/books", isAuthenticated, wrap(bookController.listBooksAPI));
    //this.app.get("/api/books/:id", isAuthenticated, wrap(bookController.getBookAPI));

    this.app.post("/books", isAuthenticated, wrap(bookController.createBook));
    this.app.post("/books/update/:id", isAuthenticated, wrap(bookController.updateBook));
    this.app.post("/books/delete/:id", isAuthenticated, wrap(bookController.deleteBook));
    //this.app.post("/api/books", isAuthenticated, wrap(bookController.createBookAPI));

    //this.app.put("/api/books/:id", isAuthenticated, wrap(bookController.updateBookAPI));
    //this.app.delete("/api/books/:id", isAuthenticated, wrap(bookController.deleteBookAPI));

    /*this.app.get("/debug/ss", (req, res) => {
      res.json({
        co: req.cookies,
        sId: req.sessionID,
        ss: req.session,
        user: req.user,
      });
    });*/

    this.app.use("*", (req, res) => {
      if (req.path.startsWith("/api") || req.accepts(["json", "html"]) === "json") {
        return res.status(404).json({ error: "Not found", statusCode: 404 });
      }
      return res.status(404).render("error", { error: "Page not found", statusCode: 404 });
    });
  }
}

export const App = Application.getInstance();
export default Application;
