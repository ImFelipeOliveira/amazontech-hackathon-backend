import { setGlobalOptions } from "firebase-functions";
import express, { Express } from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes";
import { env } from "./config/env";

setGlobalOptions({ maxInstances: 2 });

async function main(): Promise<void> {
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
