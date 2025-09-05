import { HttpStatus } from "../../../shared/http/protocols-enums";
import { ValidationError } from "../../../shared/utils/validation.utils";
import { GetLotesByProximityUseCase } from "../../usecases/lotes/get-lotes-proximity.usecase";
import { Request, Response } from "express";

export class GetLotesByProximityController {
  private getLotesByProximityUseCase: GetLotesByProximityUseCase;
  constructor() {
    this.getLotesByProximityUseCase = new GetLotesByProximityUseCase();
  }

  async execute(req: Request, res: Response): Promise<any> {
    try {
      const input = this.getParams(req);
      const lotes = await this.getLotesByProximityUseCase.execute(input);
      return res.status(HttpStatus.OK).json(lotes);
    } catch (err) {
      const error = err as ValidationError;
      return res.status(error.statusCode).json({ error: error.message });
    }
  }

  private getParams(req: Request): any {
    return req.query;
  }
}
