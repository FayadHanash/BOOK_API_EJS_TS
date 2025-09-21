import { beforeEach } from "node:test";
import { describe, expect, it } from "vitest";

import { BookRepository } from "../repositories/book_repository.js";
import { BookService } from "../services/book_service.js";
import { createMockBook, createTestRepo, createTestService } from "../utils/test_conf.js";

describe("", () => {
  let service: BookService;
  let repo: BookRepository;
  beforeEach(() => {
    repo = createTestRepo();
    service = createTestService(repo);
  });

  describe("createBook", () => {
    it("create a book", async () => {
      const temp = createMockBook(1);
      //const b = new Book("t","f","isb",'des',2025,2,new Date(),new Date());
      const res = await service.createBook(temp);
      expect(res).toBe(1);
    });
  });
});
