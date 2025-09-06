import { HttpStatus } from "../../../shared/http/protocols-enums";
import { ValidationError } from "../../../shared/utils/validation.utils";
import { GetAgendamentoDetailUseCase } from "../../usecases/agendamento/get-agendamento-detail.usecase";
import { Request, Response } from "express";

export class GetAgendamentoDetailController {
  private usecase: GetAgendamentoDetailUseCase;
  constructor() {
    this.usecase = new GetAgendamentoDetailUseCase();
  }

  async execute(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const output = await this.usecase.execute(id);
      res.status(HttpStatus.OK).json(output);
    } catch (err) {
      const error = err as ValidationError;
      res.status(error.statusCode).json({ error: error.message });
    }
  }
}
