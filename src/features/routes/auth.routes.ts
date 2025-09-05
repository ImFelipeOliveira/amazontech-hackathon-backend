import { Router } from "express";
import { validateRequestMiddleware } from "../../shared/middlewares/validate-request.middleware";
import { CreateMerchantSchema, CreateProducerSchema } from "../../shared/schemas";
import { LoginInputSchema } from "../../shared/schemas/login.schema";
import {
  LoginController,
  RegisterMerchantController,
  RegisterProducerController,
} from "..";


const authRoutes = Router();

authRoutes.post(
  "/auth/merchant/register",
  validateRequestMiddleware({ body: CreateMerchantSchema }),
  async (req, res) => {
    const controller = new RegisterMerchantController();
    await controller.execute(req, res);
  }
);
authRoutes.post(
  "/auth/producer/register",
  validateRequestMiddleware({ body: CreateProducerSchema }),
  async (req, res) => {
    const controller = new RegisterProducerController();
    await controller.execute(req, res);
  }
);
authRoutes.post(
  "/auth/login",
  validateRequestMiddleware({ body: LoginInputSchema }),
  async (req, res) => {
    const controller = new LoginController();
    await controller.execute(req, res);
  }
);

export default authRoutes;
