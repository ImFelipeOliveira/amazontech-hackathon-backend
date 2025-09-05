import { CreateMerchant, Merchant } from "../../../schemas";
import { RegisterMerchantUserUseCase } from "../../../usecases/auth";
import { Request, Response } from "express";


export class RegisterMerchantController {
  private useCase: RegisterMerchantUserUseCase;
  constructor() {
    this.useCase = new RegisterMerchantUserUseCase();
  }

  async execute(req: Request, res: Response): Promise<Response<Merchant>> {
    const user = req.body as unknown as CreateMerchant;
    const result = await this.useCase.execute(user);
    return res.status(201).json(result);
  }
}
