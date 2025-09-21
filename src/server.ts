import compression from "compression";
import cors from "cors";
import express, { RequestHandler } from "express";
import { default as Layout } from "express-ejs-layouts";
import rateLimit from "express-rate-limit";
import "express-async-errors";
import helmet from "helmet";
import http from "http";
import { dirname, join } from "path";
import { fileURLToPath } from "url";

import { Config } from "./config/config.js";
import { BookController } from "./controllers/book_controller.js";
import { errorHandler } from "./middlewares/error_handler.js";
import { requestLogger } from "./middlewares/logger_request.js";
import { BookRepository } from "./repositories/book_repository.js";
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

  public async start(port: number = Config.port || 3000): Promise<void> {
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
    this.app.use(cors(Config.cors));
    this.app.set("view engine", "ejs");
    this.app.set("views", join(__dirname, "../views"));
    this.app.use(Layout);
    this.app.use(express.urlencoded({ extended: true, limit: "10mb" }));
    this.app.use(express.json({ limit: "10mb" }));
    this.app.use(express.static(join(__dirname, "../public")));
    this.app.use(requestLogger);
  }

  private setupRoutes(): void {
    const repo = new BookRepository();
    const service = new BookService(repo);
    const bookController = new BookController(service);
    /* const bind = <T extends (...args: any[]) => 
      any>(fn: T, ctx: any) => 
        (fn as any).bind(ctx);*/

    /*const wrap = (handler: (this: unknown, ...args: Parameters<RequestHandler>) => 
      ReturnType<RequestHandler>) : RequestHandler =>
    (req,res,next) => 
    (handler as unknown as RequestHandler).apply(bookController, [req,res,next]);*/
    const wrap =
      (
        handler: (this: unknown, req: express.Request, res: express.Response, next: express.NextFunction) => Promise<unknown> | void,
      ): RequestHandler =>
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

    this.app.get("/", (_req, res) => res.redirect("/books"));
    this.app.get("/books", wrap(bookController.listBooks));
    this.app.get("/books/create", wrap(bookController.renderCreateView));
    this.app.get("/books/edit/:id", wrap(bookController.renderEditView));
    this.app.get("/api/books", wrap(bookController.listBooksAPI));
    this.app.get("/api/books/:id", wrap(bookController.getBookAPI));

    this.app.post("/books", wrap(bookController.createBook));
    this.app.post("/books/update/:id", wrap(bookController.updateBook));
    this.app.post("/books/delete/:id", wrap(bookController.deleteBook));
    this.app.post("/api/books", wrap(bookController.createBookAPI));

    this.app.put("/api/books/:id", wrap(bookController.updateBookAPI));

    this.app.delete("/api/books/:id", wrap(bookController.deleteBookAPI));

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
