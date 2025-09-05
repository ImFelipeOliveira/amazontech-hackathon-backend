import { testDatabaseConnection } from "../config/database";

export function verifyConnection() {
  const isConnected = testDatabaseConnection();
  if (!isConnected) {
    console.error("❌ Falha ao conectar com o Firestore.");
    process.exit(1);
  }
  console.log("✅ Conectado ao Firestore com sucesso.");
}
