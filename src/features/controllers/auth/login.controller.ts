import { Request, Response } from "express";
import { LoginUseCase } from "../../usecases/auth";
import { ValidationError } from "../../../shared/utils/validation.utils";

export class LoginController {
  private useCase: LoginUseCase;
  constructor() {
    this.useCase = new LoginUseCase();
  }

  async execute(req: Request, res: Response): Promise<Response> {
    try {
      const { email, password } = req.body;
      const result = await this.useCase.execute({ email, password });
      return res.status(200).json(result);
    } catch (err) {
      const error = err as ValidationError;
      return res.status(error.statusCode).json(error.toErrorResponse());
    }
  }
}
