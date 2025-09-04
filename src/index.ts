import { setGlobalOptions } from "firebase-functions";
import express, { Express } from "express";
import cors from "cors";

setGlobalOptions({ maxInstances: 2 });

async function main(): Promise<void> {
  const expressApp: Express = express();
  expressApp.use(express.json());
  expressApp.use(express.urlencoded({ extended: true }));
  expressApp.use(cors({ origin: true }));
}

main();
