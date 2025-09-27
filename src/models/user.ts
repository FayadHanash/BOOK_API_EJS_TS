export interface IUser {
  createdAt?: Date | undefined;
  email: string;
  id?: number | undefined;
  name: string;
  password: string;
  updatedAt?: Date | undefined;
  userName: string;
}

export interface IUserDto {
  email: string;
  name: string;
  password: string;
  userName: string;
}
export interface IUserGlobal {
  name?: string;
  username: string;
}
export type UserCreateDto = Omit<IUser, "createAt" | "id" | "updatedAt">;
export type UserLoginDto = Pick<IUser, "email" | "password">;

export type UserUpdateDto = Partial<UserCreateDto>;

export class User implements IUser {
  constructor(
    public name: string,
    public email: string,
    public password: string,
    public userName: string,
    public id?: number,
    public createdAt?: Date,
    public updatedAt?: Date,
  ) {}

  static fromDto(dto: IUserDto): User {
    return new User(dto.name, dto.email, dto.password, dto.userName);
  }

  toDto(): IUserDto {
    return {
      email: this.email,
      name: this.name,
      password: this.password,
      userName: this.userName,
    };
  }

  update(data: UserUpdateDto): void {
    Object.assign(this, data);
    this.updatedAt = new Date();
  }
}
