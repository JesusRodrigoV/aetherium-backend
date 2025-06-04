import { PrismaClient } from "@prisma/client";
import mongoose from "mongoose";
import { logger } from "@/utils/logger";

export const prisma = new PrismaClient();

export async function connectMongo(): Promise<void> {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error("MONGO_URI no está definido en .env");
    }
    await mongoose.connect(mongoUri);
    logger.info("Conectado a MongoDB");
  } catch (error) {
    logger.error("Error al conectar con MongoDB:", error);
    throw error;
  }
}