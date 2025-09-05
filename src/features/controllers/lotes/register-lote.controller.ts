import { Request, Response } from "express";
import { RegisterLoteUseCase } from "../../usecases/lotes/register-lote.usecase";
import { HttpStatus } from "../../../shared/http/protocols-enums";
import { ValidationError } from "../../../shared/utils/validation.utils";

export class RegisterLoteController {
  private registerLoteUseCase: RegisterLoteUseCase;

  constructor() {
    this.registerLoteUseCase = new RegisterLoteUseCase();
  }

  async execute(req: Request, res: Response): Promise<Response> {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Photo is required" });
      }

      const inputData = {
        user: req.body.user,
        weight: parseFloat(req.body.weight),
        limit_date: req.body.limit_date,
        location: req.body.location,
        photo: req.file.buffer,
      };

      const lote = await this.registerLoteUseCase.execute(inputData);
      return res.status(HttpStatus.CREATED).json(lote);
    } catch (err) {
      const error = err as Error | ValidationError;
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ message: error.message });
    }
  }
}
