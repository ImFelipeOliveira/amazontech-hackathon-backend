import { setGlobalOptions } from "firebase-functions";
import express, { Express } from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes";
import { env } from "./config/env";
import { initializeDatabase } from "./config/database";
import { getServiceAccount } from "./config/service-account";
import { verifyConnection } from "./utils/verify-database-connection";

setGlobalOptions({ maxInstances: 2 });

async function main(): Promise<void> {
  const serviceAccount = getServiceAccount();
  initializeDatabase(serviceAccount);
  verifyConnection();
  const expressApp: Express = express();
  expressApp.use(express.json());
  expressApp.use(express.urlencoded({ extended: true }));
  expressApp.use(cors({ origin: true }));
  expressApp.use("/api", authRoutes);
  expressApp.listen(env.port, () => {
    console.log(`Server is running on port http://localhost:${env.port}`);
  });
}

main();
