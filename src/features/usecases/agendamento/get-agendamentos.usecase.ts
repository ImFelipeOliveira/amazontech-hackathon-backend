import { AgendamentoRepository } from "../../../shared/repositories/agendamento.repository";

export interface GetAgendamentoInput {
    status: string
}

export class GetAgendamentosUseCases {
  private agendamentoRepository: AgendamentoRepository;
  constructor() {
    this.agendamentoRepository = new AgendamentoRepository();
  }

  async execute(input: GetAgendamentoInput) {
    const output = await this.agendamentoRepository.findByStatus(input.status);
    return output;
  }
}
