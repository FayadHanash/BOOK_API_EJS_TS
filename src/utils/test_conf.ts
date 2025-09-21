import { afterEach, beforeEach } from "vitest";

import { BookRepository } from "../repositories/book_repository.js";
import { BookService } from "../services/book_service.js";

beforeEach(() => {});
afterEach(() => {});

export const BookMock = {
  author: "auth",
  description: "des",
  isbn: "isbn",
  publicationYear: 2025,
  title: "Test b",
};
export const createMockBook = (id: number) => ({
  id,
  ...BookMock,
  createdAt: new Date(),
  updatedAt: new Date(),
});
export const createTestRepo = () => {
  return new BookRepository();
};

export const createTestService = (mockRepo?: BookRepository) => {
  const repository = mockRepo || createTestRepo();
  return new BookService(repository);
};
