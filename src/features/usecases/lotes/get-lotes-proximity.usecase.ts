import { LoteRepository } from "../../../shared/repositories/lote.repository";
import { Lote, LoteFilterByProximity } from "../../../shared/schemas";

export class GetLotesByProximityUseCase {
  private loteRepository: LoteRepository;
  constructor() {
    this.loteRepository = new LoteRepository();
  }

  async execute(input: LoteFilterByProximity): Promise<Lote[]> {
    console.log(input);
    const lotes = await this.loteRepository.findByProximity(
      input.latitude,
      input.longitude,
      input.radiusKm
    );
    return lotes;
  }
}
