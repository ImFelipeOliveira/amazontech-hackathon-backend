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
      const location = typeof req.body.location === "string" ?
        JSON.parse(req.body.location) :
        req.body.location;

      const weight = parseFloat(req.body.weight);

      const inputData = {
        user: (req as any).user,
        weight: weight,
        limit_date: req.body.limit_date,
        location: location,
        photo: req.file!.buffer,
      };

      const lote = await this.registerLoteUseCase.execute(inputData);
      return res.status(HttpStatus.CREATED).json(lote);
    } catch (err) {
      const error = err as Error | ValidationError;
      const statusCode = error instanceof ValidationError ? error.statusCode : HttpStatus.INTERNAL_SERVER_ERROR;
      return res.status(statusCode).json({ message: error.message });
    }
  }
}
