import { Request, Response, NextFunction } from "express";
import { AuthenticationService } from "../services/authentication.service";
import { UserRepository } from "../repositories/user.repository";
import { HttpStatus } from "../http/protocols-enums";
import { ValidationError } from "../utils/validation.utils";

export async function authenticationMiddleware(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
  try {
    const authService = new AuthenticationService();
    const userRepository = new UserRepository();
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(HttpStatus.UNAUTHORIZED).json({ error: "Unauthorized - token not provided" });
    }

    const token = authHeader.split(" ")[1];

    if (!authService.verify(String(token))) {
      return res.status(HttpStatus.UNAUTHORIZED).json({ error: "Unauthorized - Invalid token" });
    }

    const decoded = authService.decode(String(token));
    if (!decoded || !decoded.sub) {
      return res.status(HttpStatus.UNAUTHORIZED).json({ error: "Unauthorized - Invalid token" });
    }

    const user = await userRepository.findById(decoded.sub);
    if (!user) {
      return res.status(HttpStatus.UNAUTHORIZED).json({ error: "Unauthorized - User not found" });
    }

    (req as any).user = user;
    next();
  } catch (error) {
    const erro = error as Error | ValidationError;
    return res.status(HttpStatus.UNAUTHORIZED).json({ error: "An error occurred during authentication: " + erro.message });
  }
}
