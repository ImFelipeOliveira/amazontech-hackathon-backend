import { env } from "./env";

export function getServiceAccount() {
  const serviceAccountBase64 = env.firebase.serviceAccountBase64;
  let serviceAccount;

  if (serviceAccountBase64) {
    const serviceAccountJson = Buffer.from(serviceAccountBase64, "base64").toString("utf8");
    serviceAccount = JSON.parse(serviceAccountJson);
  }
  return serviceAccount;
}
