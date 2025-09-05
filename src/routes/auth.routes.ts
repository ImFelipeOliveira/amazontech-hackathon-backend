import { Router } from "express";
import { validateRequestMiddleware } from "../middlewares/validate-request.middleware";
import { CreateMerchantSchema, CreateProducerSchema } from "../schemas";
import { LoginInputSchema } from "../schemas/login.schema";
import {
  LoginController,
  RegisterMerchantController,
  RegisterProducerController,
} from "../controllers";


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
