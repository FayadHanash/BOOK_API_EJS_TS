import "express-session";
declare global {
  namespace Express {
    interface Request {
      user?: IUserGlobal;
    }
  }
}

declare module "express-session" {
  interface SessionData {
    userId: string;
  }
}
