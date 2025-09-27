import { Request, Response } from "express";

import { IUserGlobal } from "@/models/user.js";

import { BookCreateDto, IBookDto } from "../../models/book.js";
import { BookService } from "../../services/book_service.js";
import { ValidationError } from "../../validation/validation.js";
import { BaseController } from "../base_controller.js";

export class BookViewController extends BaseController<BookService> {
  constructor(bookService: BookService) {
    super(bookService);
  }

  async createBook(req: Request, res: Response): Promise<void> {
    try {
      const ibook = req.body as IBookDto;
      ibook.userId = (req.user as IUserGlobal)?.username;
      await this.service.createBook(ibook);
      res.redirect("/books");
    } catch (error) {
      if (error instanceof ValidationError) {
        res.status(400).render("books/create", {
          book: req.body as IBookDto,
          errors: error.errors,
        });
        return;
      }
      res.render("books/create", {
        book: req.body as IBookDto,
        errors: [
          {
            error: error,
            field: "general",
            message: "Failed to create book",
          },
        ],
      });
    }
  }

  async deleteBook(req: Request, res: Response): Promise<void> {
    try {
      const id = this.parseId(req.params.id ?? "");
      if (id === null) {
        this.handleError(res, new Error("Invalid book ID"), "deleteBook", 400);
        return;
      }
      const deleted = await this.service.deleteBook(id);
      if (!deleted) {
        this.handleError(res, new Error("Book not found"), "deleteBook", 404);
        return;
      }

      res.redirect("/books");
    } catch (error) {
      this.handleError(res, error, `deleteBook with id ${req.params.id}`);
    }
  }

  async listBooks(req: Request, res: Response): Promise<void> {
    try {
      //const books = await this.bookService.getAllBooks();
      const books = await this.service.getAllBooksBy((req.user as IUserGlobal)?.username);
      res.render("books/", { books });
    } catch (error) {
      this.handleError(res, error, "listBooks");
    }
  }

  renderCreateView(_req: Request, res: Response): void {
    res.render("books/create", { book: null, errors: [] });
  }

  async renderEditView(req: Request, res: Response): Promise<void> {
    try {
      const id = this.parseId(req.params.id ?? "");
      if (!id) {
        this.handleError(res, new Error("Invalid book ID"), "renderEditView", 400);
        return;
      }
      const book = await this.service.getBookById(id);
      if (!book) {
        this.handleError(res, new Error("Book not found"), "renderEditView", 404);
        return;
      }

      res.render("books/edit", { book, errors: [] });
    } catch (error) {
      this.handleError(res, error, `renderEditView for book with id ${req.params.id}`);
    }
  }

  async updateBook(req: Request, res: Response): Promise<void> {
    const id = this.parseId(req.params.id ?? "");
    try {
      if (id === null) {
        this.handleError(res, new Error("Invalid book ID"), "updateBook", 400);
        return;
      }
      const updated = await this.service.updateBook(id, req.body as Partial<BookCreateDto>);
      if (!updated) {
        this.handleError(res, new Error("Book not found"), "updateBook", 404);
        return;
      }

      res.redirect("/books");
    } catch (error) {
      if (error instanceof ValidationError) {
        res.status(400).render(`books/edit`, {
          book: { id, ...(req.body as Partial<BookCreateDto>) },
          errors: error.errors,
        });
        return;
      }
      this.handleError(res, error, `updateBook with id ${req.params.id}`);
    }
  }
}
