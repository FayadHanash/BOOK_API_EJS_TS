import { Config } from "../config/config.js";
import { IUser, User, UserCreateDto } from "../models/user.js";
import { logger } from "../utils/logger.js";
import { BaseRepository } from "./base_repositories.js";
export class UserRepository extends BaseRepository<User, UserCreateDto> {
  constructor() {
    super({
      createCols: ["userName", "email", "password", "name"],
      dbFile: Config.database.userFileName,
      initSql: ` CREATE TABLE IF NOT EXISTS users 
              ( id INTEGER PRIMARY KEY AUTOINCREMENT, 
                userName TEXT NOT NULL UNIQUE, 
                email TEXT NOT NULL UNIQUE, 
                password TEXT NOT NULL, 
                name TEXT NOT NULL,
                createdAt DATETIME DEFAULT CURRENT_TIMESTAMP, 
                updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP )`,
      rowFactory: (row: unknown): User => {
        const r = row as IUser;
        return new User(r.name, r.email, r.password, r.userName, r.id, r.createdAt, r.updatedAt);
      },
      tableName: "users",
    });
  }
  async findByEmail(email: string): Promise<null | User> {
    const sql = `SELECT * FROM users WHERE email =?`;
    return new Promise((resolve, reject) => {
      this.db.get(sql, [email], (err, row: unknown) => {
        if (err) {
          logger.error(`Error finding user by email "${email}":`, err);
          reject(err);
        } else {
          resolve(row ? this.opts.rowFactory(row) : null);
        }
      });
    });
  }
  async findByUsername(username: string): Promise<null | User> {
    const sql = `SELECT * FROM users WHERE userName =?`;
    return new Promise((resolve, reject) => {
      this.db.get(sql, [username], (err, row: unknown) => {
        if (err) {
          logger.error(`Error finding user by username "${username}":`, err);
          reject(err);
        } else {
          resolve(row ? this.opts.rowFactory(row) : null);
        }
      });
    });
  }
}
