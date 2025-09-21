import sqlite3 from "sqlite3";

import { Config } from "../config/config.js";
import { Book, BookCreateRequest, BookUpdateRequest, IBook } from "../models/book.js";
import { logger } from "../utils/logger.js";

export interface IBookRepository {
  close(): Promise<void>;
  create(book: BookCreateRequest): Promise<number>;
  delete(id: number): Promise<boolean>;
  findAll(): Promise<Book[]>;
  findById(id: number): Promise<Book | null>;
  update(id: number, book: BookUpdateRequest): Promise<boolean>;
}

export class BookRepository implements IBookRepository {
  private db: sqlite3.Database;
  constructor() {
    this.db = new sqlite3.Database(Config.database.fileName);
    this.initDatabase().catch((err) => {
      logger.error("Failed to initialize database:", err);
    });
  }

  async close(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) {
          logger.error("Error closing database:", err);
          reject(err);
        } else {
          logger.info("Database connection closed");
          resolve();
        }
      });
    });
  }

  async create(book: BookCreateRequest): Promise<number> {
    return new Promise((resolve, reject) => {
      this.db.run(
        "INSERT INTO books (title, author, isbn, description, publicationYear) VALUES (?,?,?,?,?)",
        [book.title, book.author, book.isbn, book.description, book.publicationYear],
        function (err) {
          if (err) {
            logger.error("Error creating book:", err);
            reject(err);
          } else {
            resolve(this.lastID);
          }
        },
      );
    });
  }

  async delete(id: number): Promise<boolean> {
    return new Promise((resolve, reject) => {
      this.db.run("DELETE FROM books WHERE id =?", [id], function (err) {
        if (err) {
          logger.error(`Error deleting book with id ${id}:`, err);
          reject(err);
        } else {
          resolve(this.changes > 0);
        }
      });
    });
  }

  async findAll(): Promise<Book[]> {
    return new Promise((resolve, reject) => {
      this.db.all("SELECT * FROM books ORDER BY createdAt DESC", (err, rows) => {
        if (err) {
          logger.error("Error finding all books:", err);
          reject(err);
        } else {
          const books = (rows as IBook[]).map(
            (row) => new Book(row.title, row.author, row.isbn, row.description, row.publicationYear, row.id, row.createdAt, row.updatedAt),
          );
          resolve(books);
        }
      });
    });
  }

  async findById(id: number): Promise<Book | null> {
    return new Promise((resolve, reject) => {
      this.db.get("SELECT * FROM books WHERE id =?", [id], (err, row) => {
        if (err) {
          logger.error(`Error finding book with id ${id}:`, err);
          reject(err);
        } else if (!row) {
          resolve(null);
        } else {
          const bookRow = row as IBook;
          const book = new Book(
            bookRow.title,
            bookRow.author,
            bookRow.isbn,
            bookRow.description,
            bookRow.publicationYear,
            bookRow.id,
            bookRow.createdAt,
            bookRow.updatedAt,
          );
          resolve(book);
        }
      });
    });
  }

  async update(id: number, book: BookUpdateRequest): Promise<boolean> {
    const fields: string[] = [];
    const values: unknown[] = [];
    if (book.title !== undefined) {
      fields.push("title =?");
      values.push(book.title);
    }
    if (book.author !== undefined) {
      fields.push("author =?");
      values.push(book.author);
    }

    if (book.isbn !== undefined) {
      fields.push("isbn =?");
      values.push(book.isbn);
    }
    if (book.description !== undefined) {
      fields.push("description =?");
      values.push(book.description);
    }
    if (book.publicationYear !== undefined) {
      fields.push("publicationYear =?");
      values.push(book.publicationYear);
    }
    if (fields.length === 0) {
      return false;
    }

    fields.push("updatedAt = CURRENT_TIMESTAMP");
    values.push(id);
    const query = `UPDATE books SET ${fields.join(", ")} WHERE id =?`;
    return new Promise((resolve, reject) => {
      this.db.run(query, values, function (err) {
        if (err) {
          logger.error(`Error updating book with id ${id}:`, err);
          reject(err);
        } else {
          resolve(this.changes > 0);
        }
      });
    });
  }

  private async initDatabase(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.run(
        `CREATE TABLE IF NOT EXISTS books ( 
                    id INTEGER PRIMARY KEY AUTOINCREMENT, 
                    title TEXT NOT NULL, 
                    author TEXT NOT NULL, 
                    isbn TEXT NOT NULL UNIQUE, 
                    description TEXT, 
                    publicationYear INTEGER NOT NULL, 
                    createdAt DATETIME DEFAULT CURRENT_TIMESTAMP, 
                    updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP ) `,
        (err) => {
          if (err) {
            reject(err);
          } else {
            logger.info("Database initialized successfully");
            resolve();
          }
        },
      );
    });
  }
}
