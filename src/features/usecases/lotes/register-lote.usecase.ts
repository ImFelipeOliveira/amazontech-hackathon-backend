import { LoteRepository } from "../../../shared/repositories/lote.repository";
import { UserRepository } from "../../../shared/repositories/user.repository";
import { CreateLote, User } from "../../../shared/schemas";
import { GeminiService } from "../../../shared/services/gemini-service";
import { StorageService } from "../../../shared/services/storage-service";
import { ValidationError } from "../../../shared/utils/validation.utils";

export class RegisterLoteUseCase {
  private loteRepository: LoteRepository;
  private userRepository: UserRepository;
  private geminiService: GeminiService;
  private storageService: StorageService;
  constructor() {
    this.loteRepository = new LoteRepository();
    this.userRepository = new UserRepository();
    this.storageService = new StorageService();
    this.geminiService = new GeminiService();
  }
  async execute(input: CreateLote): Promise<any> {
    await this.validateInput(input);
    await this.validateMerchant(input);
    const descriptionAI = await this.geminiService.generateLoteDescription(input.photo, input.weight);
    const photoUrl = await this.storageService.uploadImage(input.photo);
    const loteId = await this.loteRepository.createLote(input, descriptionAI, photoUrl);
    const lote = await this.loteRepository.findById(loteId);
    return lote;
  }

  private async validateInput(input: CreateLote): Promise<void> {
    if (!input.photo) throw new ValidationError("Photo is required", 400);
    if (!input.weight) throw new ValidationError("Weight is required", 400);
    if (!input.limit_date) throw new ValidationError("Limit date is required", 400);
    if (!input.location) throw new ValidationError("Location is required", 400);
  }

  private async validateMerchant(input: CreateLote & { user: User}): Promise<void> {
    const merchant = await this.userRepository.findById(input.user.uid);
    if (!merchant) throw new ValidationError("Merchant not found", 404);
    if (merchant.role !== "merchant") throw new ValidationError("User is not a merchant", 403);
  }
}
