import { UserRepository } from "../../../repositories/user.repository";
import { CreateMerchant, Merchant } from "../../../schemas";
import { AuthenticationService } from "../../../services/authentication.service";
import { ValidationError } from "../../../utils/validation.utils";

export class RegisterMerchantUserUseCase {
  private repository: UserRepository;
  private authService: AuthenticationService;
  constructor() {
    this.repository = new UserRepository();
    this.authService = new AuthenticationService();
  }

  async execute(input: CreateMerchant): Promise<{ token: string, user: Merchant}> {
    this.validate(input);
    await this.repository.createMerchant(input);
    const user = await this.repository.findByEmail(input.email);
    const authUser = this.authService.sign({
      sub: user!.uid,
      email: user!.email,
      name: user!.name,
      role: "merchant",
    });

    return {
      token: authUser,
      user: user! as Merchant,
    };
  }

  private async validate(input: CreateMerchant) {
    const email = await this.repository.findByEmail(input.email);
    if (email) throw new ValidationError("Email já cadastrado");
    const taxId = await this.repository.findByTaxId(input.tax_id);
    if (taxId) throw new ValidationError("Tax ID já cadastrado");
  }
}
