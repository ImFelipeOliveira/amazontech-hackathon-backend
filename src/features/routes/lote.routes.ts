import { Request, Response, Router } from "express";
import { authenticationMiddleware } from "../../shared/middlewares/authentication.middleware";
import { handleUploadError, uploadSingle } from "../../shared/middlewares/upload.middleware";
import { validateMultipartMiddleware, loteValidationConfig } from "../../shared/middlewares/validate-multipart.middleware";
import { CreateLoteMultipartSchema } from "../../shared/schemas";
import { RegisterLoteController } from "../controllers/lotes/register-lote.controller";

const loteRoutes = Router();

loteRoutes.post("/lotes/cadastro",
  uploadSingle,
  handleUploadError,
  authenticationMiddleware,
  validateMultipartMiddleware({
    ...loteValidationConfig,
    body: CreateLoteMultipartSchema,
  }),
  async (req: Request, res: Response) => {
    const controller = new RegisterLoteController();
    await controller.execute(req, res);
  }
);

export default loteRoutes;
