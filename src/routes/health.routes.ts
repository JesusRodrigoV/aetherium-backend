import { Router, type RequestHandler } from "express";
import {HealthController} from "@/controllers/health.controller";

export const healthRouter = Router();

healthRouter.get("/health", HealthController.healthCheck as RequestHandler);