import jwt, { SignOptions } from "jsonwebtoken";
import { env } from "../config/env";


type JwtUserClaims = {
  sub: string; // uid
  role: "merchant" | "producer";
  email: string;
  name: string;
};

export class AuthenticationService {
  private readonly secret: string = env.jwt.secret!;
  private readonly defaultSignOptions: SignOptions = {
    algorithm: "HS256",
    expiresIn: "30d",
  };

  sign(user: JwtUserClaims): string {
    return jwt.sign(user, this.secret, this.defaultSignOptions);
  }

  verify<T = JwtUserClaims>(token: string): T {
    return jwt.verify(token, this.secret, { algorithms: ["HS256"] }) as T;
  }

  decode<T = any>(token: string): T | null {
    return jwt.decode(token) as T | null;
  }
}
