import { Response, Request } from "express";
import { CreateProducer } from "../../../schemas";
import { RegisterProducerUserCase } from "../../../usecases/auth";
import { ValidationError } from "../../../utils/validation.utils";

export class RegisterProducerController {
  private useCase: RegisterProducerUserCase;
  constructor() {
    this.useCase = new RegisterProducerUserCase();
  }

  async execute(req: Request, res: Response): Promise<Response> {
    try {
      const user = req.body as unknown as CreateProducer;
      const result = await this.useCase.execute(user);
      return res.status(201).json(result);
    } catch (error) {
      const err = error as ValidationError;
      return res.status(err.statusCode).json(err.toErrorResponse());
    }
  }
}
