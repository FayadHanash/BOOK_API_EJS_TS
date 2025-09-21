import { Request, Response } from "express";

import { BookService } from "../services/book_service.js";
import { BookAPIController } from "./api_controller.js";
import { BookViewController } from "./view_controller.js";

export class BookController {
  createBook: (req: Request, res: Response) => Promise<void>;
  createBookAPI: (req: Request, res: Response) => Promise<void>;

  deleteBook: (req: Request, res: Response) => Promise<void>;
  deleteBookAPI: (req: Request, res: Response) => Promise<void>;
  getBookAPI: (req: Request, res: Response) => Promise<void>;
  listBooks: (req: Request, res: Response) => Promise<void>;
  listBooksAPI: (req: Request, res: Response) => Promise<void>;

  renderCreateView: (req: Request, res: Response) => void;
  renderEditView: (req: Request, res: Response) => Promise<void>;
  updateBook: (req: Request, res: Response) => Promise<void>;
  updateBookAPI: (req: Request, res: Response) => Promise<void>;
  private apiController: BookAPIController;
  private viewController: BookViewController;

  constructor(bookService: BookService) {
    this.apiController = new BookAPIController(bookService);
    this.viewController = new BookViewController(bookService);

    this.listBooksAPI = this.apiController.listBooks.bind(this.apiController);
    this.getBookAPI = this.apiController.getBook.bind(this.apiController);
    this.createBookAPI = this.apiController.createBook.bind(this.apiController);
    this.updateBookAPI = this.apiController.updateBook.bind(this.apiController);
    this.deleteBookAPI = this.apiController.deleteBook.bind(this.apiController);

    this.listBooks = this.viewController.listBooks.bind(this.viewController);
    this.renderCreateView = this.viewController.renderCreateView.bind(this.viewController);
    this.createBook = this.viewController.createBook.bind(this.viewController);
    this.renderEditView = this.viewController.renderEditView.bind(this.viewController);
    this.updateBook = this.viewController.updateBook.bind(this.viewController);
    this.deleteBook = this.viewController.deleteBook.bind(this.viewController);
  }
}
