import { AgendamentoRepository } from "../../../shared/repositories/agendamento.repository";

export class GetAgendamentoDetailUseCase {
  private repository: AgendamentoRepository;
  constructor() {
    this.repository = new AgendamentoRepository();
  }

  async execute(id: string) {
    return await this.repository.findById(id);
  }
}
