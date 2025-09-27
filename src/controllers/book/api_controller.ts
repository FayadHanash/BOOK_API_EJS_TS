import { Request, Response } from "express";

import { BookCreateDto, IBookDto } from "@/models/book.js";

import { BookService } from "../../services/book_service.js";
import { ValidationError } from "../../validation/validation.js";
import { BaseController } from "../base_controller.js";

export class BookAPIController extends BaseController<BookService> {
  constructor(bookService: BookService) {
    super(bookService);
  }
  async createBook(req: Request, res: Response): Promise<void> {
    try {
      const created = await this.service.createBook(req.body as IBookDto);
      const book = typeof created === "number" ? await this.service.getBookById(created) : created;
      res.status(201).json(this.SuccessResponse(book));
    } catch (error) {
      if (error instanceof ValidationError) {
        res.status(400).json({
          errors: error.errors,
          message: "Validation failed",
          success: false,
        });
        return;
      }
      this.handleError(res, error, "createBookAPI");
    }
  }

  async deleteBook(req: Request, res: Response): Promise<void> {
    try {
      const id = this.parseId(req.params.id ?? "");
      if (id === null) {
        res.status(400).json(this.ErrorResponse("Invalid book ID"));
        return;
      }
      const deleted = await this.service.deleteBook(id);
      if (!deleted) {
        res.status(404).json(this.ErrorResponse("Book not found or delete failed"));
        return;
      }
      res.status(200).json({ message: "Book deleted successfully", success: true });
    } catch (error) {
      this.handleError(res, error, `deleteBookAPI with id ${req.params.id}`);
    }
  }
  async getBook(req: Request, res: Response): Promise<void> {
    try {
      const id = this.parseId(req.params.id ?? "");
      if (id === null) {
        res.status(400).json(this.ErrorResponse("Invalid book ID"));
        return;
      }

      const book = await this.service.getBookById(id);
      if (!book) {
        res.status(404).json(this.ErrorResponse("Book not found"));
        return;
      }

      res.status(200).json(this.SuccessResponse(book));
    } catch (error) {
      this.handleError(res, error, `getBookAPI with id ${req.params.id}`);
    }
  }

  async listBooks(_req: Request, res: Response): Promise<void> {
    try {
      const books = await this.service.getAllBooks();
      res.status(200).json(this.SuccessResponse(books, books.length));
    } catch (error) {
      this.handleError(res, error, "listBooksAPI");
    }
  }

  async updateBook(req: Request, res: Response): Promise<void> {
    try {
      const id = this.parseId(req.params.id ?? "");
      if (id === null) {
        res.status(400).json(this.ErrorResponse("Invalid book ID"));
        return;
      }
      const updated = await this.service.updateBook(id, req.body as Partial<BookCreateDto>);
      if (!updated) {
        res.status(404).json(this.ErrorResponse("Book not found or update failed"));
        return;
      }

      const book = await this.service.getBookById(id);
      res.status(200).json(this.SuccessResponse(book));
    } catch (error) {
      if (error instanceof ValidationError) {
        res.status(400).json({
          errors: error.errors,
          message: "Validation failed",
          success: false,
        });
        return;
      }
      this.handleError(res, error, `updateBookAPI with id ${req.params.id}`);
    }
  }
}
