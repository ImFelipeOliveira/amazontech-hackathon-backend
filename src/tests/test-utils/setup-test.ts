import { initializeDatabase } from "../../config/database";
import express from "express";
import authRoutes from "../../routes/auth.routes";
import { env } from "../../config/env";

export function setupTest() {
  const serviceAccountBase64 = env.firebase.serviceAccountBase64;
  let serviceAccount;

  if (serviceAccountBase64) {
    const serviceAccountJson = Buffer.from(serviceAccountBase64, "base64").toString("utf8");
    serviceAccount = JSON.parse(serviceAccountJson);
  }
  initializeDatabase(serviceAccount);

  const app = express();
  app.use(express.json());
  app.use("/api", authRoutes);
  return app;
}
