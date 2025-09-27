export type BookCreateDto = Omit<IBook, "createdAt" | "id" | "updatedAt">;
export type BookUpdateDto = Partial<BookCreateDto>;

export interface IBook {
  author: string;
  createdAt?: Date | undefined;
  description: string;
  id?: number | undefined;
  isbn: string;
  publicationYear: number;
  title: string;
  updatedAt?: Date | undefined;
  userId?: string | undefined; // user name
}
export interface IBookDto {
  author: string;
  description: string;
  isbn: string;
  publicationYear: number;
  title: string;
  userId?: string | undefined;
}

export class Book implements IBook {
  constructor(
    public title: string,
    public author: string,
    public isbn: string,
    public description: string,
    public publicationYear: number,
    public userId?: string,
    public id?: number,
    public createdAt?: Date,
    public updatedAt?: Date,
  ) {}

  static fromDto(dto: IBookDto): Book {
    return new Book(dto.title, dto.author, dto.isbn, dto.description, dto.publicationYear, dto.userId);
  }
  toDto(): IBookDto {
    return {
      author: this.author,
      description: this.description,
      isbn: this.isbn,
      publicationYear: this.publicationYear,
      title: this.title,
      userId: this.userId,
    };
  }
  update(updateData: BookUpdateDto): void {
    Object.assign(this, updateData);
    this.updatedAt = new Date();
  }
}
