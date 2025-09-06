import { HttpStatus } from "../../../shared/http/protocols-enums";
import { AgendamentoRepository } from "../../../shared/repositories/agendamento.repository";
import { UserRepository } from "../../../shared/repositories/user.repository";
import { User } from "../../../shared/schemas";
import { ValidationError } from "../../../shared/utils/validation.utils";

export interface CreateAgendamentoInput {
    user: User;
    lote_id: string;
    scheduled_date: string;
}
export class CreateAgendamentoUseCase {
  private agendamentoRepository: AgendamentoRepository;
  private userRepository: UserRepository;
  constructor() {
    this.agendamentoRepository = new AgendamentoRepository();
    this.userRepository = new UserRepository();
  }
  async execute(input: CreateAgendamentoInput): Promise<any> {
    const merchant = await this.userRepository.findMerchantByLoteId(input.lote_id);
    if (!merchant) throw new ValidationError("Merchant not found for the given lote_id", HttpStatus.NOT_FOUND);
    const data = {
      loteId: input.lote_id,
      producerId: input.user.uid,
      merchantId: merchant.uid,
      scheduled_date: new Date(input.scheduled_date).toISOString(),
    };
    const agendamentoId = await this.agendamentoRepository.createAgendamento(data);
    const agendamento = await this.agendamentoRepository.findById(agendamentoId);
    return agendamento;
  }
}
