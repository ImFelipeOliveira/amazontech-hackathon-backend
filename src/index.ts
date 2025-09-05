import { setGlobalOptions } from "firebase-functions";
import * as functions from "firebase-functions";
import express, { Express } from "express";
import cors from "cors";
import authRoutes from "./features/routes/auth.routes";
import { initializeDatabase } from "./shared/config/database";
import { getServiceAccount } from "./shared/config/service-account";
import loteRoutes from "./features/routes/lote.routes";

setGlobalOptions({ maxInstances: 2 });

const serviceAccount = getServiceAccount();
initializeDatabase(serviceAccount);

const app: Express = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: true }));
app.use("/", authRoutes);
app.use("/", loteRoutes);

export const api = functions.https.onRequest(app);
