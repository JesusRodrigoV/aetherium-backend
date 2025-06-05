import { authSchema, type AuthInput } from "@/models/auth.model";
import { AuthService } from "@/services/auth.service";
import { handleError } from "@/utils/error-handler";
import type { Request, Response } from "express";
import { safeParse } from "valibot";

/**
 * Controlador para manejar la autenticación de usuarios
 * @class AuthController
 */
export class AuthController {
  /**
   * Valida los datos de entrada usando el esquema de autenticación
   * @param body - Datos a validar
   * @returns Datos validados o null si hay error
   */
  private static validateAuth(body: unknown) {
    const result = safeParse(authSchema, body);
    return result.success ? result.output as AuthInput : null;
  }

  /**
   * Registra un nuevo usuario en el sistema
   * @param {Request} req - Objeto de solicitud Express
   * @param {Response} res - Objeto de respuesta Express
   * @returns {Promise<Response>} Respuesta con el usuario creado o error
   */
  static async register(req: Request, res: Response) {
    const validatedData = AuthController.validateAuth(req.body);

    if (!validatedData) {
      res.status(400).json({
        message: "Datos inválidos",
        errors: safeParse(authSchema, req.body).issues,
      });
      return;
    }

    try {
      const user = await AuthService.register(validatedData);
      return res.status(201).json({ user });
    } catch (error) {
      return handleError(error, res);
    }
  }

  /**
   * Autentica un usuario existente
   * @param {Request} req - Objeto de solicitud Express
   * @param {Response} res - Objeto de respuesta Express
   * @returns {Promise<Response>} Respuesta con el usuario y tokens o error
   */
  static async login(req: Request, res: Response) {
    const validatedData = AuthController.validateAuth(req.body);

    if (!validatedData) {
      res.status(400).json({
        message: "Datos inválidos",
        errors: safeParse(authSchema, req.body).issues,
      });
      return;
    }

    try {
      const { user, tokens } = await AuthService.login(validatedData);

      res.cookie("refreshToken", tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
        maxAge: 30 * 24 * 60 * 60 * 1000,
      });

      return res.status(200).json({ user, accessToken: tokens.accessToken });
    } catch (error) {
      return handleError(error, res, 401);
    }
  }

  /**
   * Refresca el token de acceso usando el refresh token
   * @param {Request} req - Objeto de solicitud Express
   * @param {Response} res - Objeto de respuesta Express
   * @returns {Promise<Response>} Nuevo token de acceso o error
   */
  static async refresh(req: Request, res: Response) {
    const refreshToken = req.cookies?.refreshToken;

    if (!refreshToken) {
      res.status(401).json({ message: "Refresh token requerido" });
      return;
    }

    try {
      const { accessToken } = await AuthService.refreshToken(refreshToken);
      res.status(200).json({ accessToken });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error desconocido";
      res.status(401).json({ message });
    }
  }

  /**
   * Obtiene la información del usuario actual
   * @param {Request} req - Objeto de solicitud Express
   * @param {Response} res - Objeto de respuesta Express
   * @returns {Promise<Response>} Información del usuario o error
   */
  static async getCurrentUser(req: Request, res: Response) {
    const userId = (req as any).user?.userId;

    if (!userId) {
      return res.status(401).json({ message: "No autorizado" });
    }

    try {
      const user = await AuthService.getCurrentUser(userId);
      res.status(200).json({ user });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Error desconocido";
      res.status(404).json({ message });
    }
  }
}
