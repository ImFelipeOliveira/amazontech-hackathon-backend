import { Router, Request, Response } from "express";
import { authenticationMiddleware } from "../../shared/middlewares/authentication.middleware";
import { CreateAgendamentoController } from "../controllers/agendamento/create-agendamento.controller";
import { GetAgendamentosController } from "../controllers/agendamento/get-agendamentos.controller";
import { GetAgendamentoDetailController } from "../controllers/agendamento/get-agendamento-detail.controller";

const scheduledRoutes = Router();

scheduledRoutes.post(
  "/agendamentos",
  authenticationMiddleware,
  async (req: Request, res: Response) => {
    const controller = new CreateAgendamentoController();
    await controller.execute(req, res);
  }
);

scheduledRoutes.get(
  "/agendamentos",
  authenticationMiddleware,
  async (req: Request, res: Response) => {
    const controller = new GetAgendamentosController();
    await controller.execute(req, res);
  }
);

scheduledRoutes.get(
  "/agendamento/:id",
  authenticationMiddleware,
  async (req: Request, res: Response) => {
    const controller = new GetAgendamentoDetailController();
    await controller.execute(req, res);
  }
);

export default scheduledRoutes;


