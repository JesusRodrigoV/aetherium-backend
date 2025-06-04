import mongoose from "mongoose";
import { logger } from "@/utils/logger";
import { PrismaClient } from "generated/prisma";

export const prisma = new PrismaClient();

export async function connectMongo(): Promise<void> {
  try {
    const mongoUri = process.env.MONGO_URI;
      if (!mongoUri) {
      throw new Error("MONGO_URI no está definido en .env");
    }
    await mongoose.connect(mongoUri, {
      retryWrites: true,
      w: "majority",
    });
    logger.info("Conectado a MongoDB Atlas");
  } catch (error) {
    logger.error("Error al conectar con MongoDB Atlas:", error);
    throw error;
  }
}