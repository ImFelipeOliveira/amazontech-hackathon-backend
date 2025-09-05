import { setGlobalOptions } from "firebase-functions";
import * as functions from "firebase-functions";
import express, { Express } from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes";
import { initializeDatabase } from "./config/database";
import { getServiceAccount } from "./config/service-account";

setGlobalOptions({ maxInstances: 2 });

const serviceAccount = getServiceAccount();
initializeDatabase(serviceAccount);

const app: Express = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: true }));
app.use("/api", authRoutes);

export const api = functions.https.onRequest(app);
