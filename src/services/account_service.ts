import bcrypt from "bcryptjs";

import { IUserDto, User, UserLoginDto, UserUpdateDto } from "../models/user.js";
import { UserRepository } from "../repositories/user_repository.js";
import { UserValidator } from "../validation/user_validation.js";
import { ValidationError } from "../validation/validation.js";

export interface IAccountService {
  createUser(userData: IUserDto): Promise<null | User>;
  deleteUser(id: number): Promise<boolean>;
  getAllUsers(): Promise<User[]>;
  getUserById(id: number): Promise<null | User>;
  login(userData: UserLoginDto): Promise<null | User>;
  updateUser(id: number, updateData: Partial<IUserDto>): Promise<boolean>;
}

export class AccountService implements IAccountService {
  constructor(private repository: UserRepository = new UserRepository()) {}

  async closeConnection(): Promise<void> {
    return this.repository.close();
  }

  async createUser(userData: IUserDto): Promise<null | User> {
    const usr = User.fromDto(userData);
    const isValid = UserValidator.validateUser(usr);
    if (isValid.length > 0) {
      throw new ValidationError(isValid);
      return null;
    }

    const isEmailExist = await this.repository.findByEmail(usr.email);
    if (isEmailExist) {
      throw new ValidationError([{ field: "email", message: "Email already exist" }]);
      return null;
    }
    const hashedUserName = await bcrypt.hash(usr.email, 4);
    usr.userName = hashedUserName.replace(/[^a-zA-Z0-9]/g, "");
    const isUserExist = await this.repository.findByUsername(usr.userName);
    if (isUserExist) {
      throw new ValidationError([{ field: "username", message: "Username already exist" }]);
      return null;
    }

    const hashedPassword = await bcrypt.hash(usr.password, 12);
    usr.password = hashedPassword;

    const ret = await this.repository.create(usr);
    if (ret > 0) {
      return usr;
    } else return null;
  }
  async deleteUser(id: number): Promise<boolean> {
    return this.repository.delete(id);
  }
  async getAllUsers(): Promise<User[]> {
    return this.repository.findAll();
  }
  async getUserById(id: number): Promise<null | User> {
    return this.repository.findById(id);
  }
  async login(userData: UserLoginDto): Promise<null | User> {
    const isValid = UserValidator.validateLogin(userData);
    if (isValid.length > 0) {
      throw new ValidationError(isValid);
    }

    const user = await this.repository.findByEmail(userData.email);
    if (!user) {
      throw new ValidationError([{ field: "email", message: "User not found" }]);
    }

    const isPasswordValid = await bcrypt.compare(userData.password, user.password);
    if (!isPasswordValid) {
      throw new ValidationError([{ field: "password", message: "Invalid email or password" }]);
    }
    return user;
  }

  async updateUser(id: number, updateData: UserUpdateDto): Promise<boolean> {
    // const isValid = BookValidator.validateBook(updateData);
    // if (isValid.length > 0) {
    //   throw new ValidationError(isValid);
    // }
    return this.repository.update(id, updateData);
  }
}
