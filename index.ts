import express from "express";
import dotenv from "dotenv";
import { connectMongo } from "@/config/database";
import { logger } from "@/utils/logger";
import healthRoutes from "@/routes/health.routes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use("/aetherium", healthRoutes);

connectMongo()
  .then(() => {
    app.listen(PORT, () => {
      logger.info(`Servidor corriendo en http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    logger.error("Error al conectar con MongoDB:", error);
    process.exit(1);
  });

export default app;