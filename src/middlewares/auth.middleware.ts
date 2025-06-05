import type { Request, Response, NextFunction } from "express";
import { verify } from "jsonwebtoken";
import { jwtConfig } from "@/config/jwt";
import { logger } from "@/utils/logger";

interface AuthRequest extends Request {
  user?: { userId: string };
}

export const authMiddleware = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction,
):Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ message: "No autorizado" });
    return ;
  }

  const token = authHeader.split(" ")[1];
  if (!token) {
    res.status(401).json({ message: "Token de autenticación requerido" });
    return ;
  }

  if (!jwtConfig.secret) {
    logger.error("JWT_SECRET no está configurado");
    res.status(500).json({ message: "Error de configuración del servidor" });
    return ;
  }

  try {
    const decoded = verify(token, jwtConfig.secret) as { userId: string };
    req.user = { userId: decoded.userId };
    next();
  } catch (error) {
    logger.error("Error en autenticación:", error);
    res.status(401).json({ message: "Token inválido" });
    return ;
  }
};