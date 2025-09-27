import { Config } from "../config/config.js";
import { Book, BookCreateDto, IBook } from "../models/book.js";
import { BaseRepository } from "../repositories/base_repositories.js";
import { logger } from "../utils/logger.js";
export class BookRepository extends BaseRepository<Book, BookCreateDto> {
  constructor() {
    super({
      createCols: ["title", "author", "isbn", "description", "publicationYear", "userId"],
      dbFile: Config.database.fileName,
      initSql: ` CREATE TABLE IF NOT EXISTS books ( 
        id INTEGER PRIMARY KEY AUTOINCREMENT, 
        title TEXT NOT NULL, 
        author TEXT NOT NULL, 
        isbn TEXT NOT NULL UNIQUE, 
        description TEXT, 
        publicationYear INTEGER NOT NULL,
        userId TEXT, 
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP, 
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP)`,
      rowFactory: (row: unknown): Book => {
        const r = row as IBook;
        return new Book(r.title, r.author, r.isbn, r.description, r.publicationYear, r.userId, r.id, r.createdAt, r.updatedAt);
      },
      tableName: "books",
    });
  }

  async findAllBy(str: string): Promise<Book[] | null> {
    const sql = `SELECT * FROM ${this.opts.tableName} WHERE userId=? ORDER BY createdAt DESC`;
    return new Promise((resolve, reject) => {
      this.db.all(sql, [str], (err, rows: unknown[]) => {
        if (err) {
          logger.error(`FindAllBy user: ${str} i table ${this.opts.tableName} error:`, err);
          reject(err);
        } else {
          resolve(rows.map(this.opts.rowFactory));
        }
      });
    });
  }
}
