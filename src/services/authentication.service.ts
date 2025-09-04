import jwt, { SignOptions } from "jsonwebtoken";
import { env } from "../config/env";
import bcrypt from "bcryptjs";


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
  private readonly saltRounds: number = 12;

  sign(user: JwtUserClaims): string {
    return jwt.sign(user, this.secret, this.defaultSignOptions);
  }

  verify<T = JwtUserClaims>(token: string): T {
    return jwt.verify(token, this.secret, { algorithms: ["HS256"] }) as T;
  }

  decode<T = any>(token: string): T | null {
    return jwt.decode(token) as T | null;
  }

  async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(this.saltRounds);
    return await bcrypt.hash(password, salt);
  }

  async comparePasswords(input: { password: string, passwordHash: string }): Promise<boolean> {
    return await bcrypt.compare(input.password, input.passwordHash);
  }
}
