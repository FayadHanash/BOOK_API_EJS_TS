import { BookCreateDto, BookUpdateDto } from "../models/book.js";
import { FieldError, ValidationError } from "./validation.js";

export class BookValidator {
  private static readonly currentYear = new Date().getFullYear();

  public static validateAndThrow(book: BookCreateDto | BookUpdateDto, isUpdate: boolean = false): void {
    const errors = this.validateBook(book, isUpdate);
    if (errors.length > 0) {
      throw new ValidationError(errors);
    }
  }

  public static validateBook(book: BookCreateDto | BookUpdateDto, isUpdate: boolean = false): FieldError[] {
    const errors: FieldError[] = [];
    // title
    if (!isUpdate || book.title !== undefined) {
      if (this.isEmpty(book.title)) {
        errors.push({ field: "title", message: "Title is required" });
      } else if (String(book.title).length > 200) {
        errors.push({ field: "title", message: "Title must be less than 200 characters" });
      }
    }
    // author
    if (!isUpdate || book.author !== undefined) {
      if (this.isEmpty(book.author)) {
        errors.push({ field: "author", message: "Author is required" });
      } else if (String(book.author).length > 100) {
        errors.push({ field: "author", message: "Author must be less than 100 characters" });
      }
    }

    // isbn
    if (!isUpdate || book.isbn !== undefined) {
      if (this.isEmpty(book.isbn)) {
        errors.push({ field: "isbn", message: "ISBN is required" });
      } else if (!this.isValidISBN(String(book.isbn))) {
        errors.push({ field: "isbn", message: "ISBN must be 10 or 13 digits" });
      }
    }

    // pub year
    if (!isUpdate || book.publicationYear !== undefined) {
      if (this.isEmpty(book.publicationYear)) {
        errors.push({ field: "publicationYear", message: "publicationYear is required" });
      } else if (!this.isValidPublicationYear(Number(String(book.publicationYear)))) {
        errors.push({ field: "publicationYear", message: `publicationYear must between 1000 and ${this.currentYear}` });
      }
    }

    // des
    if (!isUpdate || book.description !== undefined) {
      const d = book.description;
      if (d !== undefined && d !== null && String(d).length > 1000) {
        errors.push({ field: "description", message: "description must be less than 1000 charcters" });
      }
    }
    return errors;
  }

  private static isEmpty(t: null | number | string | undefined): boolean {
    return t === undefined || t === null || String(t).trim() === "";
  }

  private static isValidISBN(isbn: string): boolean {
    const cleanedISBN = isbn.replace(/[-\s]/g, "");
    return cleanedISBN.length === 10 || cleanedISBN.length === 13;
  }

  private static isValidPublicationYear(year: number): boolean {
    const yearStr = year.toString();
    return yearStr.length === 4 && year >= 1000 && year <= this.currentYear;
  }
}
