import dotenv from "dotenv";
dotenv.config();
export const env = {
  port: process.env.PORT || 3000,
  jwt: {
    secret: process.env.JWT_SECRET,
  },
  firebase: {
    serviceAccountBase64: process.env.FIREBASE_SERVICE_ACCOUNT_BASE64,
  },
};
