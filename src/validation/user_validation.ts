import { UserCreateDto, UserLoginDto, UserUpdateDto } from "../models/user.js";
import { FieldError, ValidationError } from "./validation.js";
export class UserValidator {
  private static readonly emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  //private static readonly passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;
  public static validateAndThrow(user: UserCreateDto | UserUpdateDto): void {
    const errors = this.validateUser(user);
    if (errors.length > 0) {
      throw new ValidationError(errors);
    }
  }

  public static validateLogin(user: UserLoginDto): FieldError[] {
    const errors: FieldError[] = [];

    if (!user.email || !this.emailRegex.test(user.email.trim())) {
      errors.push({ field: "email", message: "Valid email is required" });
    }

    if (!user.password) {
      errors.push({ field: "password", message: "Password is required" });
    }

    return errors;
  }

  public static validateUser(user: UserCreateDto | UserUpdateDto): FieldError[] {
    const errors: FieldError[] = [];

    if (!user.name || user.name.trim().length < 3) {
      errors.push({ field: "name", message: "Name must be at least 3 characters long" });
    }
    if (!user.email || !this.emailRegex.test(user.email.trim())) {
      errors.push({ field: "email", message: "Valid email is required" });
    }

    if (!user.password) {
      errors.push({
        field: "password",
        message: "password is required",
        //message: "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character",
      });
    }

    return errors;
  }
}
