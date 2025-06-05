import { Router, type RequestHandler } from "express";
import { AuthController } from "@/controllers/auth.controller";
import { authMiddleware } from "@/middlewares/auth.middleware";

export const authRouter = Router();

authRouter.post("/register", AuthController.register as RequestHandler);
authRouter.post("/login", AuthController.login as RequestHandler);
authRouter.post("/refresh", AuthController.refresh as RequestHandler);
authRouter.get("/me", authMiddleware, AuthController.getCurrentUser as RequestHandler);