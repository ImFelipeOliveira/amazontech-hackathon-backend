import { HttpStatus } from "../../../shared/http/protocols-enums";
import { ValidationError } from "../../../shared/utils/validation.utils";
import { GetAgendamentosUseCases } from "../../usecases/agendamento/get-agendamentos.usecase";
import { Request, Response } from "express";

export class GetAgendamentosController {
  private useCase: GetAgendamentosUseCases;
  constructor() {
    this.useCase = new GetAgendamentosUseCases();
  }

  async execute(req: Request, res: Response) {
    try {
      const input = this.getParams(req);
      const output = await this.useCase.execute(input);
      res.status(HttpStatus.OK).json(output);
    } catch (err) {
      const error = err as ValidationError;
      res.status(error.statusCode).json({ error: error.message });
    }
  }

  private getParams(req: Request) {
    return {
      status: req.query.status as string || "ativo",
    };
  }
}
