import { Request, Response } from "express";
import { LoginUseCase } from "../../usecases/auth";

export class LoginController {
  private useCase: LoginUseCase;
  constructor() {
    this.useCase = new LoginUseCase();
  }

  async execute(req: Request, res: Response): Promise<Response> {
    const { email, password } = req.body;
    const result = await this.useCase.execute({ email, password });
    return res.status(200).json(result);
  }
}
