import { CreateMerchant, Merchant } from "../../../../shared/schemas";
import { RegisterMerchantUserUseCase } from "../../../usecases/auth";
import { Request, Response } from "express";
import { ValidationError } from "../../../../shared/utils/validation.utils";


export class RegisterMerchantController {
  private useCase: RegisterMerchantUserUseCase;
  constructor() {
    this.useCase = new RegisterMerchantUserUseCase();
  }

  async execute(req: Request, res: Response): Promise<Response<Merchant>> {
    try {
      const user = req.body as unknown as CreateMerchant;
      const result = await this.useCase.execute(user);
      return res.status(201).json(result);
    } catch (error) {
      const err = error as ValidationError;
      return res.status(err.statusCode).json(err.toErrorResponse());
    }
  }
}
