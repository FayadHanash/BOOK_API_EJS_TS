export type BookCreateRequest = Omit<IBook, "createdAt" | "id" | "updatedAt">;

export type BookUpdateRequest = Partial<BookCreateRequest>;

export interface IBook {
  author: string;
  createdAt?: Date | undefined;
  description: string;
  id?: number | undefined;
  isbn: string;
  publicationYear: number;
  title: string;
  updatedAt?: Date | undefined;
}
export interface IBookDto {
  author: string;
  description: string;
  isbn: string;
  publicationYear: number;
  title: string;
}

export class Book implements IBook {
  constructor(
    public title: string,
    public author: string,
    public isbn: string,
    public description: string,
    public publicationYear: number,
    public id?: number,
    public createdAt?: Date,
    public updatedAt?: Date,
  ) {}

  static fromDto(dto: IBookDto): Book {
    return new Book(dto.title, dto.author, dto.isbn, dto.description, dto.publicationYear);
  }
  toDto(): IBookDto {
    return {
      author: this.author,
      description: this.description,
      isbn: this.isbn,
      publicationYear: this.publicationYear,
      title: this.title,
    };
  }
  update(updateData: BookUpdateRequest): void {
    Object.assign(this, updateData);
    this.updatedAt = new Date();
  }
}
