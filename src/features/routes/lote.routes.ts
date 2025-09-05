import { Request, Response, Router } from "express";
import { authenticationMiddleware } from "../../shared/middlewares/authentication.middleware";
import { handleUploadError, uploadSingle } from "../../shared/middlewares/upload.middleware";
import { validateMultipartMiddleware, loteValidationConfig } from "../../shared/middlewares/validate-multipart.middleware";
import { CreateLoteMultipartSchema, LoteFilterByProximitySchema } from "../../shared/schemas";
import { RegisterLoteController } from "../controllers/lotes/register-lote.controller";
import { GetLotesByProximityController } from "../controllers/lotes/get-lotes-by-proximity.controller";
import { validateRequestMiddleware } from "../../shared/middlewares/validate-request.middleware";

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

loteRoutes.get(
  "/lotes",
  authenticationMiddleware,
  validateRequestMiddleware({ query: LoteFilterByProximitySchema }),
  async (req: Request, res: Response) => {
    const controller = new GetLotesByProximityController();
    await controller.execute(req, res);
  }
);

export default loteRoutes;
