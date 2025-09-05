import { HttpStatus } from "../../../../shared/http/protocols-enums";
import { UserRepository } from "../../../../shared/repositories/user.repository";
import { CreateMerchant, Merchant } from "../../../../shared/schemas";
import { AuthenticationService } from "../../../../shared/services/authentication.service";
import { ValidationError } from "../../../../shared/utils/validation.utils";

export class RegisterMerchantUserUseCase {
  private repository: UserRepository;
  private authService: AuthenticationService;
  constructor() {
    this.repository = new UserRepository();
    this.authService = new AuthenticationService();
  }

  async execute(input: CreateMerchant): Promise<{ token: string, user: Merchant}> {
    await this.validate(input);
    await this.repository.createMerchant(input);
    const user = await this.repository.findByEmail(input.email);
    if (!user || user.role !== "merchant") {
      throw new Error("Falha ao recuperar usuário recém-criado");
    }
    const authUser = this.authService.sign({
      sub: user.uid,
      email: user.email,
      name: user.name,
      role: "merchant",
    });
    return {
      token: authUser,
      user: user,
    };
  }

  private async validate(input: CreateMerchant) {
    const email = await this.repository.findByEmail(input.email);
    if (email) throw new ValidationError("Email já cadastrado", HttpStatus.BAD_REQUEST);
    const taxId = await this.repository.findByTaxId(input.tax_id);
    if (taxId) throw new ValidationError("Tax ID já cadastrado", HttpStatus.BAD_REQUEST);
  }
}
