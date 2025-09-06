import { HttpStatus } from "../../../shared/http/protocols-enums";
import { ValidationError } from "../../../shared/utils/validation.utils";
import { CreateAgendamentoUseCase } from "../../usecases/agendamento/create-agendmento.usecase";
import { Request, Response } from "express";

export class CreateAgendamentoController {
  private useCase: CreateAgendamentoUseCase;
  constructor() {
    this.useCase = new CreateAgendamentoUseCase();
  }

  async execute(req: Request, res: Response) {
    try {
      const input = this.getParams(req);
      const output = await this.useCase.execute(input);
      res.status(HttpStatus.CREATED).json(output);
    } catch (err) {
      const error = err as ValidationError;
      res.status(error.statusCode).json({ error: error.message });
    }
  }

  private getParams(req: Request) {
    return {
      user: (req as any).user,
      lote_id: req.body.lote_id,
      scheduled_date: req.body.scheduled_date,
    };
  }
}
