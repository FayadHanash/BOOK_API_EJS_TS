import sqlite3 from "sqlite3";

import { logger } from "../utils/logger.js";
export interface BaseRepoOptions<T, C extends Record<string, unknown>> {
  createCols: Array<keyof C>;
  dbFile: string;
  initSql?: string;
  rowFactory: (row: unknown) => T;
  tableName: string;
}
interface RunResult {
  changes: number;
  lastID: number;
}
export abstract class BaseRepository<T, C extends Record<string, unknown>> {
  protected readonly db: sqlite3.Database;
  protected readonly opts: BaseRepoOptions<T, C>;
  constructor(opts: BaseRepoOptions<T, C>) {
    this.opts = opts;
    this.db = new sqlite3.Database(opts.dbFile);
    if (opts.initSql) {
      this.db.run(opts.initSql, (err) => {
        if (err) {
          logger.error(`Init ${opts.tableName} table failed:`, err);
        } else {
          logger.info(`Table "${opts.tableName}" is ready`);
        }
      });
    }
  }
  async close(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.close((err) => {
        if (err) {
          logger.error("Error closing DB:", err);
          reject(err);
        } else {
          logger.info("DB connection closed");
          resolve();
        }
      });
    });
  }
  async create(entity: C): Promise<number> {
    return this.runInTransaction(async () => {
      const cols = this.opts.createCols.join(", ");
      const placeholders = this.opts.createCols.map(() => "?").join(", ");
      const values = this.opts.createCols.map((col) => entity[col]);
      const sql = `INSERT INTO ${this.opts.tableName} (${cols}) VALUES (${placeholders})`;
      const { lastID } = await this.runSql(sql, values);
      return lastID;
    });
  }
  async delete(id: number): Promise<boolean> {
    return this.runInTransaction(async () => {
      const sql = `DELETE FROM ${this.opts.tableName} WHERE id =?`;
      const { changes } = await this.runSql(sql, [id]);
      return changes > 0;
    });
  }
  async findAll(): Promise<T[]> {
    const sql = `SELECT * FROM ${this.opts.tableName} ORDER BY createdAt DESC`;
    return new Promise((resolve, reject) => {
      this.db.all(sql, (err, rows: unknown[]) => {
        if (err) {
          logger.error(`FindAll ${this.opts.tableName} error:`, err);
          reject(err);
        } else {
          resolve(rows.map(this.opts.rowFactory));
        }
      });
    });
  }

  async findById(id: number): Promise<null | T> {
    const sql = `SELECT * FROM ${this.opts.tableName} WHERE id =?`;
    return new Promise((resolve, reject) => {
      this.db.get(sql, [id], (err, row: unknown) => {
        if (err) {
          logger.error(`Find ${this.opts.tableName} #${id} error:`, err);
          reject(err);
        } else {
          resolve(row ? this.opts.rowFactory(row) : null);
        }
      });
    });
  }
  async update(id: number, updates: Partial<C>): Promise<boolean> {
    return this.runInTransaction(async () => {
      const setClauses: string[] = [];
      const values: unknown[] = [];
      for (const col of this.opts.createCols) {
        const value = updates[col];
        if (value !== undefined) {
          setClauses.push(`${String(col)} =?`);
          values.push(value);
        }
      }
      if (setClauses.length === 0) {
        return false;
      }
      setClauses.push("updatedAt = CURRENT_TIMESTAMP");
      const sql = `UPDATE ${this.opts.tableName} SET ${setClauses.join(", ")} WHERE id =?`;
      values.push(id);
      const { changes } = await this.runSql(sql, values);
      return changes > 0;
    });
  }
  protected async runInTransaction<R>(action: () => Promise<R>): Promise<R> {
    await this.beginTransaction();
    try {
      const result = await action();
      await this.commitTransaction();
      return result;
    } catch (error) {
      await this.rollbackTransaction();
      throw error;
    }
  }
  private beginTransaction(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.exec("BEGIN TRANSACTION", (err) => (err ? reject(err) : resolve()));
    });
  }
  private commitTransaction(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.exec("COMMIT", (err) => (err ? reject(err) : resolve()));
    });
  }
  private rollbackTransaction(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.db.exec("ROLLBACK", (err) => (err ? reject(err) : resolve()));
    });
  }
  private runSql(sql: string, params: unknown[] = []): Promise<RunResult> {
    return new Promise((resolve, reject) => {
      const stmt = this.db.prepare(sql);
      stmt.run(params, function (this: RunResult, err: Error | null) {
        if (err) {
          reject(err);
        } else {
          resolve({ changes: this.changes, lastID: this.lastID });
        }
        stmt.finalize();
      });
    });
  }
}
