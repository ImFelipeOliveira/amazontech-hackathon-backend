import { Request, Response, Router } from "express";
import { validateRequestMiddleware } from "../../shared/middlewares/validate-request.middleware";
import { CreateLoteSchema } from "../../shared/schemas";
import { handleUploadError, uploadSingle } from "../../shared/middlewares/upload.middleware";
import { RegisterLoteController } from "../controllers/lotes/register-lote.controller";

const loteRoutes = Router();

loteRoutes.post("/lotes/cadastro",
  uploadSingle,
  handleUploadError,
  validateRequestMiddleware({ body: CreateLoteSchema, isMultipart: true }),
  async (req: Request, res: Response) => {
    const controller = new RegisterLoteController();
    await controller.execute(req, res);
  }
);

export default loteRoutes;
