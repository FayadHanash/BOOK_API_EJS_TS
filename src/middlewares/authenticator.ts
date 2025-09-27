import { NextFunction, Request, Response } from "express";

import { IUserGlobal } from "../models/user.js";
import { UserRepository } from "../repositories/user_repository.js";
import { logger } from "../utils/logger.js";

export const authenticateUser = (repo: UserRepository) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (req.session && typeof req.session.userId === "string") {
        const user = await repo.findByUsername(req.session.userId);
        if (user) {
          res.locals.user = (req.user as IUserGlobal) ?? null;
        } else {
          if (req.session.destroy) {
            req.session.destroy(() => {
              logger.info(`cleared invalid session:`, req.session);
            });
          }
        }
      }
    } catch (err) {
      logger.error(`Error fetching user`, err);
    }
    next();
  };
};

export const isAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (!req.session?.userId) {
    return res.redirect("/signin");
  }
  next();
};

export const redirectAuthenticated = (req: Request, res: Response, next: NextFunction) => {
  if (req.session && req.session.userId && req.user) {
    return res.redirect("/books");
  }
  next();
};
