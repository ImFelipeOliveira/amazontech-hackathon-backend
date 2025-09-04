import { UserRepository } from "../../../repositories/user.repository";
import { CreateProducer, Producer } from "../../../schemas";
import { AuthenticationService } from "../../../services/authentication.service";
import { ValidationError } from "../../../utils/validation.utils";

export class RegisterProducerUserCase {
  private repository: UserRepository;
  private authService: AuthenticationService;

  constructor() {
    this.repository = new UserRepository();
    this.authService = new AuthenticationService();
  }

  async execute(input: CreateProducer): Promise<{ token: string, user: Producer }> {
    this.validate(input);
    await this.repository.createProducer(input);
    const user = await this.repository.findByEmail(input.email);
    const authUser = this.authService.sign({
      sub: user!.uid,
      email: user!.email,
      name: user!.name,
      role: "producer",
    });

    return {
      token: authUser,
      user: user! as Producer,
    };
  }

  private async validate(input: CreateProducer) {
    const email = await this.repository.findByEmail(input.email);
    if (email) throw new ValidationError("Email já cadastrado");
  }
}
