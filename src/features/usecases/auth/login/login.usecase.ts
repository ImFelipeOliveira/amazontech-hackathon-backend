import { HttpStatus } from "../../../../shared/http/protocols-enums";
import { UserRepository } from "../../../../shared/repositories/user.repository";
import { User } from "../../../../shared/schemas";
import { LoginInput } from "../../../../shared/schemas/login.schema";
import { AuthenticationService } from "../../../../shared/services/authentication.service";
import { ValidationError } from "../../../../shared/utils/validation.utils";

export class LoginUseCase {
  private authService: AuthenticationService;
  private userRepository: UserRepository;
  constructor() {
    this.userRepository = new UserRepository();
    this.authService = new AuthenticationService();
  }
  async execute(input: LoginInput): Promise<{ token: string; user: User }> {
    const user = await this.userRepository.findByEmail(input.email);
    if (!user) throw new ValidationError("User not found", HttpStatus.NOT_FOUND);
    const isValidPassword = await this.authService.comparePasswords({
      password: input.password,
      passwordHash: user.password,
    });
    if (!isValidPassword) throw new ValidationError("Invalid password", HttpStatus.UNAUTHORIZED);
    const token = this.authService.sign({
      sub: user.uid,
      role: user.role,
      email: user.email,
      name: user.name,
    });
    return { token: token, user: user };
  }
}
