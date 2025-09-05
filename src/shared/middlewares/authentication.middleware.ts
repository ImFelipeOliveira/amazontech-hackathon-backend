import { Request, Response } from "express";
import { AuthenticationService } from "../services/authentication.service";
import { UserRepository } from "../repositories/user.repository";

export function authenticationMiddleware(req: Request, res: Response, next: () => void): Response | void {
  const authService = new AuthenticationService();
  const userRepository = new UserRepository();
  const authHeader = req.headers.token;
  if (!authHeader) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const isValid = authService.verify(String(authHeader));
  if (!isValid) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const decoded = authService.decode(String(authHeader));
  if (!decoded) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const user = userRepository.findById(decoded.sub);
  if (!user) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  req.body.user = user;
  next();
}
