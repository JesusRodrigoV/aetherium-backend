import { prisma } from "@/config/database";
import { logger } from "@/utils/logger";
import type { Request, Response } from "express";
import mongoose from "mongoose";

export class HealthController {
  static async healthCheck(req: Request, res: Response) {
    try {
      await prisma.$queryRaw`SELECT 1`;
      const postgresStatus = "OK";

      const mongoStatus = mongoose.connection.readyState === 1 ? "OK" : "ERROR";

      res.status(200).json({
        status: "OK",
        postgres: postgresStatus,
        mongo: mongoStatus,
      });
    } catch (error) {
      logger.error("Error en health check:", error);
      res
        .status(500)
        .json({ status: "ERROR", message: "Error en el servidor" });
    }
  }
}
