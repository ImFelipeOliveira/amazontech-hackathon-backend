import { Response, Request } from "express";
import { CreateProducer } from "../../../schemas";
import { RegisterProducerUserCase } from "../../../usecases/auth";

export class RegisterProducerController {
  private useCase: RegisterProducerUserCase;
  constructor() {
    this.useCase = new RegisterProducerUserCase();
  }

  async execute(req: Request, res: Response): Promise<Response> {
    const user = req.body as unknown as CreateProducer;
    const result = await this.useCase.execute(user);
    return res.status(201).json(result);
  }
}
