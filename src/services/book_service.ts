import { Book, BookUpdateRequest, IBookDto } from "../models/book.js";
import { BookRepository, IBookRepository } from "../repositories/book_repository.js";
import { BookValidator, ValidationError } from "../utils/validation.js";

export interface IBookService {
  createBook(bookData: IBookDto): Promise<number>;
  deleteBook(id: number): Promise<boolean>;
  getAllBooks(): Promise<Book[]>;
  getBookById(id: number): Promise<Book | null>;
  updateBook(id: number, updateData: Partial<IBookDto>): Promise<boolean>;
}

export class BookService implements IBookService {
  constructor(private repository: IBookRepository = new BookRepository()) {}

  async closeConnection(): Promise<void> {
    return this.repository.close();
  }

  async createBook(bookData: IBookDto): Promise<number> {
    const book = Book.fromDto(bookData);
    const isValid = BookValidator.validateBook(book);
    if (isValid.length > 0) {
      throw new ValidationError(isValid);
    }
    return this.repository.create(book);
  }
  async deleteBook(id: number): Promise<boolean> {
    return this.repository.delete(id);
  }
  async getAllBooks(): Promise<Book[]> {
    return this.repository.findAll();
  }
  async getBookById(id: number): Promise<Book | null> {
    return this.repository.findById(id);
  }
  async updateBook(id: number, updateData: BookUpdateRequest): Promise<boolean> {
    const isValid = BookValidator.validateBook(updateData);
    if (isValid.length > 0) {
      throw new ValidationError(isValid);
    }
    return this.repository.update(id, updateData);
  }
}
