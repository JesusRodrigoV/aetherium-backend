import express from "express";
import dotenv from "dotenv";
import { connectMongo } from "@/config/database";
import { logger } from "@/utils/logger";
import * as routes from "@/routes";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use("/aetherium", routes.healthRouter);

connectMongo()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Servidor escuchando en el puerto ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Error al conectar con MongoDB:", error);
    process.exit(1);
  });

export default app;