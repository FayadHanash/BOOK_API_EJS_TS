import { Request, Response } from "express";

import { IUserGlobal, UserCreateDto, UserLoginDto } from "../../models/user.js";
import { AccountService } from "../../services/account_service.js";
import { BookService } from "../../services/book_service.js";
import { ValidationError } from "../../validation/validation.js";
import { BaseController } from "../base_controller.js";

export class AccountController extends BaseController<AccountService> {
  private bookService: BookService;
  constructor(accountService: AccountService, bookService: BookService) {
    super(accountService);
    this.bookService = bookService;
  }

  async loginUser(req: Request, res: Response): Promise<void> {
    const credentials = req.body as UserLoginDto;
    try {
      const user = await this.service.login(credentials);
      if (user !== null) {
        req.session.userId = user.userName;
        //req.user.name = user.name;
        //req.user.username = user.userName;
        req.session.save((err) => {
          if (err) {
            req.session.userId = "";
            return res.status(500).render("account/signin", {
              errors: ["Session error occurred"],
              user: credentials,
            });
          }
          res.redirect("/books");
        });
      } else {
        res.status(401).render("account/signin", {
          errors: ["Invalid email or pass"],
          user: credentials,
        });
      }
    } catch (error) {
      if (error instanceof ValidationError) {
        //const errMsg = error.errors.map(x => x.message);
        res.status(400).render("account/signin", { errors: error.errors, user: null });
        return;
      }
      this.handleError(res, error, "loginUser", 500);
    }
  }
  logoutUser(req: Request, res: Response): void {
    //req.user = null;
    req.session.destroy((err) => {
      res.clearCookie("book_api_eje_ts.sid");
      if (err) {
        this.handleError(res, err, "logoutUser", 500);
      } else {
        res.redirect("/signin");
      }
    });
  }
  async registerUser(req: Request, res: Response): Promise<void> {
    const user = req.body as UserCreateDto;
    try {
      const userCr = await this.service.createUser(user);
      if (userCr !== null) {
        req.session.userId = userCr.userName;
        //req.user.name = userCr.name;
        //req.user.username = userCr.userName;
        //res.locals.user = user ?? null;;
        req.session.save((err) => {
          if (err) {
            req.session.userId = "";
            return res.status(500).render("account/signup", {
              errors: ["Session error occurred"],
              user: user,
            });
          }
          res.redirect("/books");
        });
      }
    } catch (error) {
      if (error instanceof ValidationError) {
        //const errMsg = error.errors.map(x => x.message);
        res.status(400).render("account/signup", { errors: error.errors, user: null });
        return;
      }
      this.handleError(res, error, "registerUser", 500);
    }
  }
  async renderIndex(req: Request, res: Response): Promise<void> {
    try {
      let books = null;

      if (req.user) {
        const uName = (req.user as IUserGlobal)?.username ?? "";
        books = await this.bookService.getAllBooksBy(uName);
      }
      res.render("books/index", { books: books, user: req.user as IUserGlobal | null });
    } catch (error) {
      this.handleError(res, error, "rednderIndex", 500);
    }
  }
  renderLoginView(_req: Request, res: Response): void {
    res.render("account/signin", { errors: [], user: null });
  }
  renderRegisterView(_req: Request, res: Response): void {
    res.render("account/signup", { errors: [], user: null });
  }
}
